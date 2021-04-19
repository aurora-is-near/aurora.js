import { Address } from './account.js';
import { Option, U64, U256 } from './prelude.js';
export declare class TransactionID {
    readonly id: string;
    protected constructor(id: string);
    static zero(): TransactionID;
    static fromHex(id: string): TransactionID;
    static fromBase58(id: string): TransactionID;
    toString(): string;
}
export declare class Transaction {
    readonly nonce: U256;
    readonly gasPrice: U256;
    readonly gas: U256;
    readonly to: Option<Address>;
    readonly value: U256;
    readonly input: Uint8Array;
    readonly v: U64;
    readonly r: U256;
    readonly s: U256;
    constructor(nonce: U256, gasPrice: U256, gas: U256, to: Option<Address>, value: U256, input: Uint8Array, v: U64, r: U256, s: U256);
    toJSON(): any;
}
