import { Address } from './account.js';
import { Transaction, TransactionID } from './transaction.js';
export declare type BlockTag = 'earliest' | 'latest' | 'pending';
export declare type BlockHeight = number;
export declare type BlockHash = string;
export declare type BlockID = BlockTag | BlockHeight | BlockHash;
export interface BlockMetadata {
    number: BlockHeight | null;
    hash: BlockHash | null;
    parentHash: BlockHash;
    nonce: string | null;
    sha3Uncles: string;
    logsBloom: string | null;
    transactionsRoot: string;
    stateRoot: string;
    receiptsRoot: string;
    miner: Address;
    difficulty: number;
    totalDifficulty: number;
    extraData: Uint8Array;
    size: number;
    gasLimit: number;
    gasUsed: number;
    timestamp: number;
    transactions: TransactionID[] | Transaction[];
    uncles: string[];
}
