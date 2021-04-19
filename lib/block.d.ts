import { Address } from './account.js';
import { Transaction, TransactionID } from './transaction.js';
import { Quantity } from './prelude.js';
export declare type BlockHash = string;
export declare type BlockHeight = Quantity;
export declare type BlockID = BlockTag | BlockHeight | BlockHash;
export declare type BlockTag = 'earliest' | 'latest' | 'pending';
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
