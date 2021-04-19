/* This is free and unencumbered software released into the public domain. */

import { Address } from './account.js';
import { Transaction, TransactionID } from './transaction.js';

export type BlockTag = 'earliest' | 'latest' | 'pending'
export type BlockHeight = number;
export type BlockHash = string;
export type BlockID = BlockTag | BlockHeight | BlockHash;

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
