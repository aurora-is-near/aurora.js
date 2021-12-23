/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import NEAR, { NEARBlock } from './near.js';
import { Err, Ok, Quantity, Result } from './prelude.js';
import { Transaction, TransactionID } from './transaction.js';
import { base58ToBytes, base58ToHex, exportJSON } from './utils.js';

import { BlockHeader, ChunkResult } from 'near-api-js/lib/providers/provider';

export type BlockHash = string;
export type BlockHeight = Quantity;
export type BlockID = BlockTag | BlockHeight | BlockHash;
export type BlockTag = 'earliest' | 'latest' | 'pending';

export interface BlockOptions {
  chunks?: boolean;
  transactions?: 'id' | 'full';
  contractID?: AccountID;
}

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

export class BlockProxy {
  public readonly number: BlockHeight;
  public readonly hash: BlockHash;
  public readonly parentHash: BlockHash;

  protected constructor(
    protected readonly provider: NEAR.providers.Provider,
    protected readonly header: BlockHeader,
    protected readonly options: BlockOptions,
    protected readonly chunks: ChunkResult[],
    protected readonly transactions: TransactionID[],
    protected readonly outcomes: NEAR.providers.FinalExecutionOutcome[],
    public readonly near?: NEARBlock
  ) {
    this.number = header.height;
    this.hash = base58ToHex(header.hash);
    this.parentHash = base58ToHex(header.prev_hash);
  }

  static async lookup(
    provider: NEAR.providers.Provider,
    id: BlockID
  ): Promise<Result<boolean, string>> {
    try {
      await provider.block(parseBlockID(id));
      return Ok(true);
    } catch (error) {
      return Err(error.message);
    }
  }

  static async fetch(
    provider: NEAR.providers.Provider,
    id: BlockID,
    options?: BlockOptions
  ): Promise<Result<BlockProxy, string>> {
    try {
      const block = (await provider.block(parseBlockID(id))) as any;

      let chunks: ChunkResult[] = [];
      let transactions: TransactionID[] = [];
      let outcomes: NEAR.providers.FinalExecutionOutcome[] = [];
      if (options) {
        if (options.chunks || options.transactions) {
          const requests = block.chunks.map(async (chunkHeader: any) => {
            return await provider.chunk(chunkHeader.chunk_hash);
          });
          chunks = await Promise.all(requests);
        }
        if (options.transactions === 'id') {
          const requests = chunks.flatMap((chunk: any) => {
            return chunk.transactions.map(async (txHeader: any) => {
              return TransactionID.fromBase58(txHeader.hash);
            });
          });
          transactions = await Promise.all(requests);
        } else if (options.transactions === 'full') {
          const requests = chunks.flatMap((chunk: any) => {
            return chunk.transactions.map(async (txHeader: any) => {
              return await provider.txStatus(
                base58ToBytes(txHeader.hash),
                txHeader.signer_id
              );
            });
          });
          outcomes = await Promise.all(requests);
        }
      }

      return Ok(
        new BlockProxy(
          provider,
          block.header,
          options || {},
          chunks,
          transactions,
          outcomes,
          { hash: base58ToBytes(block.header.hash) }
        )
      );
    } catch (error) {
      return Err(error.message);
    }
  }

  getMetadata(): BlockMetadata {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const header = this.header as any;
    const contractID = this.options.contractID;
    const transactions = ((opt?: string) => {
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
      miner: Address.zero(), // TODO: relayer address
      difficulty: 0,
      totalDifficulty: 0,
      extraData: Buffer.alloc(0),
      size: this.chunks
        .map((chunk) => chunk.header.encoded_length)
        .reduce((a, b) => a + b, 0),
      gasLimit:
        this.chunks.map((chunk) => chunk.header.gas_limit).sort()[0] || 0,
      gasUsed: this.chunks
        .map((chunk) => chunk.header.gas_used)
        .reduce((a, b) => a + b, 0),
      timestamp: new Date(this.header.timestamp / 1_000_000_000).getTime(),
      transactions: transactions,
      uncles: [],
    };
  }

  toString(): string {
    return this.hash;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return exportJSON(
      (this.getMetadata() as unknown) as Record<string, unknown>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseBlockID(blockID: BlockID): any {
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
