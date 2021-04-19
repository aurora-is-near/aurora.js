/* This is free and unencumbered software released into the public domain. */

import { Address } from './account.js';
import { U64, U256 } from './prelude.js';

export type TransactionID = string;

export class Transaction {
    constructor(
        public readonly nonce: U256,
        public readonly gasPrice: U256,
        public readonly gas: U256,
        public readonly to: Address,
        public readonly value: U256,
        public readonly input: Uint8Array,
        public readonly v: U64,
        public readonly r: U256,
        public readonly s: U256) {}
}
