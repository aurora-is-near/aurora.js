"use strict";
/* This is free and unencumbered software released into the public domain. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBlockID = exports.BlockProxy = void 0;
const account_js_1 = require("./account.js");
const prelude_js_1 = require("./prelude.js");
const transaction_js_1 = require("./transaction.js");
const utils_js_1 = require("./utils.js");
class BlockProxy {
    constructor(provider, header, options, chunks, transactions, outcomes, near) {
        this.provider = provider;
        this.header = header;
        this.options = options;
        this.chunks = chunks;
        this.transactions = transactions;
        this.outcomes = outcomes;
        this.near = near;
        this.number = header.height;
        this.hash = (0, utils_js_1.base58ToHex)(header.hash);
        this.parentHash = (0, utils_js_1.base58ToHex)(header.prev_hash);
    }
    static async lookup(provider, id) {
        try {
            await provider.block(parseBlockID(id));
            return (0, prelude_js_1.Ok)(true);
        }
        catch (error) {
            return (0, prelude_js_1.Err)(error.message);
        }
    }
    static async fetch(provider, id, options) {
        try {
            const block = (await provider.block(parseBlockID(id)));
            let chunks = [];
            let transactions = [];
            let outcomes = [];
            if (options) {
                if (options.chunks || options.transactions) {
                    const chunk_mask = block.header.chunk_mask;
                    const requests = block.chunks
                        .filter((_, index) => chunk_mask[index])
                        .map((chunkHeader) => provider.chunk(chunkHeader.chunk_hash));
                    chunks = await Promise.all(requests);
                }
                if (options.transactions === 'id') {
                    const requests = chunks.flatMap((chunk) => {
                        return chunk.transactions.map(async (txHeader) => {
                            return transaction_js_1.TransactionID.fromBase58(txHeader.hash);
                        });
                    });
                    transactions = await Promise.all(requests);
                }
                else if (options.transactions === 'full') {
                    const requests = chunks.flatMap((chunk) => {
                        return chunk.transactions.map(async (txHeader) => {
                            return await provider.txStatus((0, utils_js_1.base58ToBytes)(txHeader.hash), txHeader.signer_id);
                        });
                    });
                    outcomes = await Promise.all(requests);
                }
            }
            return (0, prelude_js_1.Ok)(new BlockProxy(provider, block.header, options || {}, chunks, transactions, outcomes, { hash: (0, utils_js_1.base58ToBytes)(block.header.hash) }));
        }
        catch (error) {
            return (0, prelude_js_1.Err)(error.message);
        }
    }
    getMetadata() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const header = this.header;
        const contractID = this.options.contractID;
        const transactions = ((opt) => {
            switch (opt) {
                case 'id':
                    return this.transactions;
                case 'full':
                    return this.outcomes.flatMap((outcome) => {
                        return transaction_js_1.Transaction.fromOutcome(outcome, contractID).match({
                            some: (tx) => [tx],
                            none: [],
                        });
                    });
                default:
                    return [];
            }
        })(this.options.transactions);
        return {
            number: this.number,
            hash: this.hash,
            parentHash: this.parentHash,
            nonce: Buffer.alloc(8),
            sha3Uncles: Buffer.alloc(32),
            logsBloom: Buffer.alloc(256),
            transactionsRoot: (0, utils_js_1.base58ToBytes)(header.chunk_tx_root),
            stateRoot: (0, utils_js_1.base58ToBytes)(header.prev_state_root),
            receiptsRoot: (0, utils_js_1.base58ToBytes)(header.chunk_receipts_root),
            miner: account_js_1.Address.zero(),
            difficulty: 0,
            totalDifficulty: 0,
            extraData: Buffer.alloc(0),
            size: this.chunks
                .map((chunk) => chunk.header.encoded_length)
                .reduce((a, b) => a + b, 0),
            gasLimit: this.chunks.map((chunk) => chunk.header.gas_limit).sort()[0] || 0,
            gasUsed: this.chunks
                .map((chunk) => chunk.header.gas_used)
                .reduce((a, b) => a + b, 0),
            timestamp: new Date(this.header.timestamp / 1000000000).getTime(),
            transactions: transactions,
            uncles: [],
        };
    }
    toString() {
        return this.hash;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
        return (0, utils_js_1.exportJSON)(this.getMetadata());
    }
}
exports.BlockProxy = BlockProxy;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBlockID(blockID) {
    switch (blockID) {
        case 'earliest':
            return { sync_checkpoint: 'genesis' };
        case 'latest':
            return { finality: 'final' };
        case 'pending':
            return { finality: 'optimistic' };
        default:
            return { blockId: blockID };
    }
}
exports.parseBlockID = parseBlockID;
