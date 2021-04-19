/* This is free and unencumbered software released into the public domain. */

import { Address } from './account.js';
import { Transaction, TransactionID } from './transaction.js';
import { Err, Ok, Quantity, Result } from './prelude.js';
import { base58ToBytes, base58ToHex, exportJSON } from './utils.js';

import NEAR from 'near-api-js';
import { BlockHeader, ChunkResult } from 'near-api-js/lib/providers/provider';

export type BlockHash = string;
export type BlockHeight = Quantity;
export type BlockID = BlockTag | BlockHeight | BlockHash;
export type BlockTag = 'earliest' | 'latest' | 'pending'

export interface BlockMetadata {
  number: BlockHeight | null;
  hash: BlockHash | null;
  parentHash: BlockHash;
  nonce: Uint8Array | null;
  sha3Uncles: Uint8Array;
  logsBloom: Uint8Array | null;
  transactionsRoot: Uint8Array;
  stateRoot: Uint8Array;
  receiptsRoot: Uint8Array;
  miner: Address;
  difficulty: Quantity;
  totalDifficulty: Quantity;
  extraData: Uint8Array;
  size: Quantity;
  gasLimit: Quantity;
  gasUsed: Quantity;
  timestamp: Quantity;
  transactions: TransactionID[] | Transaction[];
  uncles: BlockHash[];
}

export class Block {
  public readonly number: BlockHeight;
  public readonly hash: BlockHash;
  public readonly parentHash: BlockHash;

  protected constructor(
      protected readonly provider: NEAR.providers.Provider,
      protected readonly header: BlockHeader,
      protected readonly chunks: ChunkResult[]) {
    this.number = header.height;
    this.hash = base58ToHex(header.hash);
    this.parentHash = base58ToHex(header.prev_hash);
  }

  static async fetch(provider: NEAR.providers.Provider, id: BlockID): Promise<Result<Block, string>> {
    try {
      const block = (await provider.block(parseBlockID(id))) as any;
      const chunkRequests = block.chunks.map(async (chunkHeader: any) => {
        return await provider.chunk(chunkHeader.chunk_hash);
      });
      const chunks = (await Promise.all(chunkRequests)) as ChunkResult[];
      return Ok(new Block(provider, block.header, chunks));
    } catch (error) {
      return Err(error.message);
    }
  }

  getMetadata(): BlockMetadata {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const header = this.header as any;
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
      miner: Address.zero(), // TODO: relayer address
      difficulty: 0,
      totalDifficulty: 0,
      extraData: Buffer.alloc(0),
      size: this.chunks.map((chunk) => chunk.header.encoded_length).reduce((a, b) => a + b, 0),
      gasLimit: this.chunks.map((chunk) => chunk.header.gas_limit).sort()[0] || 0,
      gasUsed: this.chunks.map((chunk) => chunk.header.gas_used).reduce((a, b) => a + b, 0),
      timestamp: new Date(this.header.timestamp / 1_000_000_000).getTime(),
      transactions: [], // TODO
      uncles: [],
    };
  }

  toString(): string {
    return this.hash;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return exportJSON(this.getMetadata());
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBlockID(blockID: BlockID): any {
  switch (blockID) {
    case 'earliest': return { sync_checkpoint: 'genesis' }
    case 'latest': return { finality: 'final' }
    case 'pending': return { finality: 'optimistic' }
    default: return { blockId: blockID }
  }
}
