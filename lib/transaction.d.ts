import { AccountID, Address } from './account.js';
import { Option, U256 } from './prelude.js';
import NEAR from 'near-api-js';
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
    readonly v?: bigint | undefined;
    readonly r?: bigint | undefined;
    readonly s?: bigint | undefined;
    constructor(nonce: U256, gasPrice: U256, gas: U256, to: Option<Address>, value: U256, input: Uint8Array, v?: bigint | undefined, r?: bigint | undefined, s?: bigint | undefined);
    static fromOutcome(outcome: NEAR.providers.FinalExecutionOutcome, contractID?: AccountID): Option<Transaction>;
    isSigned(): boolean;
    toJSON(): any;
}
