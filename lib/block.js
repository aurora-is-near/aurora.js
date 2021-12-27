/* This is free and unencumbered software released into the public domain. */
import { Address } from './account.js';
import { Err, Ok } from './prelude.js';
import { Transaction, TransactionID } from './transaction.js';
import { base58ToBytes, base58ToHex, exportJSON } from './utils.js';
export class BlockProxy {
    constructor(provider, header, options, chunks, transactions, outcomes, near) {
        this.provider = provider;
        this.header = header;
        this.options = options;
        this.chunks = chunks;
        this.transactions = transactions;
        this.outcomes = outcomes;
        this.near = near;
        this.number = header.height;
        this.hash = base58ToHex(header.hash);
        this.parentHash = base58ToHex(header.prev_hash);
    }
    static async lookup(provider, id) {
        try {
            await provider.block(parseBlockID(id));
            return Ok(true);
        }
        catch (error) {
            return Err(error.message);
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
                            return TransactionID.fromBase58(txHeader.hash);
                        });
                    });
                    transactions = await Promise.all(requests);
                }
                else if (options.transactions === 'full') {
                    const requests = chunks.flatMap((chunk) => {
                        return chunk.transactions.map(async (txHeader) => {
                            return await provider.txStatus(base58ToBytes(txHeader.hash), txHeader.signer_id);
                        });
                    });
                    outcomes = await Promise.all(requests);
                }
            }
            return Ok(new BlockProxy(provider, block.header, options || {}, chunks, transactions, outcomes, { hash: base58ToBytes(block.header.hash) }));
        }
        catch (error) {
            return Err(error.message);
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
                        return Transaction.fromOutcome(outcome, contractID).match({
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
            transactionsRoot: base58ToBytes(header.chunk_tx_root),
            stateRoot: base58ToBytes(header.prev_state_root),
            receiptsRoot: base58ToBytes(header.chunk_receipts_root),
            miner: Address.zero(),
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
        return exportJSON(this.getMetadata());
    }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBlockID(blockID) {
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
