/* This is free and unencumbered software released into the public domain. */
import { Address } from './account.js';
import { Err, Ok } from './prelude.js';
import { base58ToBytes, base58ToHex, exportJSON } from './utils.js';
export class BlockProxy {
    constructor(provider, header, chunks, outcomes) {
        this.provider = provider;
        this.header = header;
        this.chunks = chunks;
        this.outcomes = outcomes;
        this.number = header.height;
        this.hash = base58ToHex(header.hash);
        this.parentHash = base58ToHex(header.prev_hash);
    }
    static async fetch(provider, id, options) {
        try {
            const block = (await provider.block(parseBlockID(id)));
            let chunks = [];
            let outcomes = [];
            if (options) {
                if (options.chunks || options.transactions) {
                    const requests = block.chunks.map(async (chunkHeader) => {
                        return await provider.chunk(chunkHeader.chunk_hash);
                    });
                    chunks = await Promise.all(requests);
                }
                if (options.transactions) {
                    const requests = chunks.flatMap((chunk) => {
                        return chunk.transactions.map(async (txHeader) => {
                            switch (options.transactions) {
                                case 'id': return base58ToHex(txHeader.hash);
                                default: return await provider.txStatus(base58ToBytes(txHeader.hash), txHeader.signer_id);
                            }
                        });
                    });
                    outcomes = await Promise.all(requests);
                }
            }
            return Ok(new BlockProxy(provider, block.header, chunks, outcomes));
        }
        catch (error) {
            return Err(error.message);
        }
    }
    getMetadata() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const header = this.header;
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
            size: this.chunks.map((chunk) => chunk.header.encoded_length).reduce((a, b) => a + b, 0),
            gasLimit: this.chunks.map((chunk) => chunk.header.gas_limit).sort()[0] || 0,
            gasUsed: this.chunks.map((chunk) => chunk.header.gas_used).reduce((a, b) => a + b, 0),
            timestamp: new Date(this.header.timestamp / 1000000000).getTime(),
            transactions: [],
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
        case 'earliest': return { sync_checkpoint: 'genesis' };
        case 'latest': return { finality: 'final' };
        case 'pending': return { finality: 'optimistic' };
        default: return { blockId: blockID };
    }
}
