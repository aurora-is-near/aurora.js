/// <reference types="node" />
import BN from 'bn.js';
declare abstract class Assignable {
    encode(): Uint8Array;
}
export declare class BeginBlockArgs extends Assignable {
    hash: Uint8Array;
    coinbase: Uint8Array;
    timestamp: Uint8Array;
    number: Uint8Array;
    difficulty: Uint8Array;
    gaslimit: Uint8Array;
    constructor(hash: Uint8Array, coinbase: Uint8Array, timestamp: Uint8Array, number: Uint8Array, difficulty: Uint8Array, gaslimit: Uint8Array);
}
export declare class BeginChainArgs extends Assignable {
    chainID: Uint8Array;
    constructor(chainID: Uint8Array);
}
export declare class ExecutionResult extends Assignable {
    status: boolean;
    gasUsed: number | bigint;
    output: Uint8Array;
    logs: LogEvent[];
    constructor(args: {
        status: boolean | number;
        gasUsed: number | bigint | BN;
        output: Uint8Array;
        logs: LogEvent[];
    });
    static decode(input: Buffer): ExecutionResult;
}
export declare class FunctionCallArgs extends Assignable {
    contract: Uint8Array;
    input: Uint8Array;
    constructor(contract: Uint8Array, input: Uint8Array);
}
export declare class GetChainID extends Assignable {
    constructor();
}
export declare class GetStorageAtArgs extends Assignable {
    address: Uint8Array;
    key: Uint8Array;
    constructor(address: Uint8Array, key: Uint8Array);
}
export declare class LogEvent extends Assignable {
    topics: RawU256[];
    data: Uint8Array;
    constructor(args: {
        topics: RawU256[];
        data: Uint8Array;
    });
}
export declare class MetaCallArgs extends Assignable {
    signature: Uint8Array;
    v: number;
    nonce: Uint8Array;
    feeAmount: Uint8Array;
    feeAddress: Uint8Array;
    contractAddress: Uint8Array;
    value: Uint8Array;
    methodDef: string;
    args: Uint8Array;
    constructor(signature: Uint8Array, v: number, nonce: Uint8Array, feeAmount: Uint8Array, feeAddress: Uint8Array, contractAddress: Uint8Array, value: Uint8Array, methodDef: string, args: Uint8Array);
}
export declare class NewCallArgs extends Assignable {
    chainID: Uint8Array;
    ownerID: string;
    bridgeProverID: string;
    upgradeDelayBlocks: number | BN;
    constructor(chainID: Uint8Array, ownerID: string, bridgeProverID: string, upgradeDelayBlocks: number | BN);
}
export declare class RawU256 extends Assignable {
    value: Uint8Array;
    constructor(args: {
        value: Uint8Array;
    });
    toString(): string;
}
export declare class ViewCallArgs extends Assignable {
    sender: Uint8Array;
    address: Uint8Array;
    amount: Uint8Array;
    input: Uint8Array;
    constructor(sender: Uint8Array, address: Uint8Array, amount: Uint8Array, input: Uint8Array);
}
export {};
