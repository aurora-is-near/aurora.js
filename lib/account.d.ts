import { Result } from './prelude.js';
export declare class Address {
    readonly id: string;
    protected constructor(id: string);
    static zero(): Address;
    static parse(id?: string): Result<Address, string>;
    toString(): string;
    toBytes(): Uint8Array;
}
export declare class AccountID {
    readonly id: string;
    constructor(id: string);
    static parse(id?: string): Result<AccountID, string>;
    toString(): string;
    toAddress(): Address;
}
