import { Result } from './prelude.js';
export declare class AccountID {
    readonly id: string;
    constructor(id: string);
    static aurora(): AccountID;
    static parse(id?: string): Result<AccountID, string>;
    toString(): string;
    toAddress(): Address;
}
export declare class Address {
    readonly id: string;
    static ZERO: string;
    protected constructor(id: string);
    static zero(): Address;
    static parse(id?: string): Result<Address, string>;
    isZero(): boolean;
    toString(): string;
    toBytes(): Uint8Array;
}
