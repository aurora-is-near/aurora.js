import { Result } from '@hqoss/monads';
export declare type AccountID = string;
export declare class Address {
    readonly id: string;
    protected constructor(id: string);
    static parse(id: string): Address;
    toString(): string;
    toBytes(): Uint8Array;
}
export declare class Account {
    readonly id: string;
    constructor(id: string);
    static parse(id: string): Result<Account, string>;
    toString(): string;
    toAddress(): Address;
}
