import { Result } from '@hqoss/monads';
export declare type AccountID = string;
export declare type Address = string;
export declare class Account {
    readonly id: string;
    constructor(id: string);
    static parse(id: string): Result<Account, string>;
    toString(): string;
    toAddress(): Address;
}
