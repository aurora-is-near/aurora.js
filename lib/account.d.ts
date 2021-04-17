export declare type AccountID = string;
export declare type Address = string;
export declare class Account {
    readonly id: string;
    constructor(id: string);
    toString(): string;
    toAddress(): Address;
}
