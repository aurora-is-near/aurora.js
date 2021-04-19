/* This is free and unencumbered software released into the public domain. */
import { Address } from './account.js';
import { Err, Ok } from './prelude.js';
import { base58ToBytes, base58ToHex, exportJSON } from './utils.js';
export class Block {
    constructor(provider, header, chunks) {
        this.provider = provider;
        this.header = header;
        this.chunks = chunks;
        this.number = header.height;
        this.hash = base58ToHex(header.hash);
        this.parentHash = base58ToHex(header.prev_hash);
    }
    static async fetch(provider, id) {
        try {
            const block = (await provider.block(parseBlockID(id)));
            const chunkRequests = block.chunks.map(async (chunkHeader) => {
                return await provider.chunk(chunkHeader.chunk_hash);
            });
            const chunks = (await Promise.all(chunkRequests));
            return Ok(new Block(provider, block.header, chunks));
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
