import { AccountID, Address } from './account.js';
import { Quantity, Result } from './prelude.js';
import { Transaction, TransactionID } from './transaction.js';
import NEAR from 'near-api-js';
import { BlockHeader, ChunkResult } from 'near-api-js/lib/providers/provider';
export declare type BlockHash = string;
export declare type BlockHeight = Quantity;
export declare type BlockID = BlockTag | BlockHeight | BlockHash;
export declare type BlockTag = 'earliest' | 'latest' | 'pending';
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
export declare class BlockProxy {
    protected readonly provider: NEAR.providers.Provider;
    protected readonly header: BlockHeader;
    protected readonly options: BlockOptions;
    protected readonly chunks: ChunkResult[];
    protected readonly transactions: TransactionID[];
    protected readonly outcomes: NEAR.providers.FinalExecutionOutcome[];
    readonly number: BlockHeight;
    readonly hash: BlockHash;
    readonly parentHash: BlockHash;
    protected constructor(provider: NEAR.providers.Provider, header: BlockHeader, options: BlockOptions, chunks: ChunkResult[], transactions: TransactionID[], outcomes: NEAR.providers.FinalExecutionOutcome[]);
    static lookup(provider: NEAR.providers.Provider, id: BlockID): Promise<Result<boolean, string>>;
    static fetch(provider: NEAR.providers.Provider, id: BlockID, options?: BlockOptions): Promise<Result<BlockProxy, string>>;
    getMetadata(): BlockMetadata;
    toString(): string;
    toJSON(): any;
}
export declare function parseBlockID(blockID: BlockID): any;
