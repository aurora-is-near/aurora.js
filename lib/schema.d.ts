/// <reference types="node" />
import { Result } from '@hqoss/monads';
import BN from 'bn.js';
import { utils } from 'near-api-js';
export declare type GasBurned = number | bigint | undefined;
declare abstract class Assignable {
    encode(): Uint8Array;
}
export declare class BeginBlockArgs extends Assignable {
    readonly hash: Uint8Array;
    readonly coinbase: Uint8Array;
    readonly timestamp: Uint8Array;
    readonly number: Uint8Array;
    readonly difficulty: Uint8Array;
    readonly gaslimit: Uint8Array;
    constructor(hash: Uint8Array, coinbase: Uint8Array, timestamp: Uint8Array, number: Uint8Array, difficulty: Uint8Array, gaslimit: Uint8Array);
}
export declare class BeginChainArgs extends Assignable {
    chainID: Uint8Array;
    constructor(chainID: Uint8Array);
}
export declare class WrappedSubmitResult extends Assignable {
    submitResult: SubmitResult;
    gasBurned: GasBurned;
    tx: string | undefined;
    constructor(submitResult: SubmitResult, gasBurned: GasBurned, tx: string | undefined);
}
export declare class SubmitResult {
    readonly result: SubmitResultV2 | SubmitResultV1 | LegacyExecutionResult;
    constructor(result: SubmitResultV2 | SubmitResultV1 | LegacyExecutionResult);
    output(): Result<Uint8Array, ExecutionError>;
    static decode(input: Buffer): SubmitResult;
}
export declare type LegacyStatusFalse = 'LegacyStatusFalse';
export declare type ExecutionError = RevertStatus | OutOfGas | OutOfFund | OutOfOffset | CallTooDeep | LegacyStatusFalse;
export declare class SuccessStatus extends utils.enums.Assignable {
    readonly output: Uint8Array | number[];
    constructor(args: {
        output: Uint8Array | number[];
    });
}
export declare class RevertStatus extends utils.enums.Assignable {
    readonly output: Uint8Array | number[];
    constructor(args: {
        output: Uint8Array | number[];
    });
}
export declare class OutOfGas extends utils.enums.Assignable {
}
export declare class OutOfFund extends utils.enums.Assignable {
}
export declare class OutOfOffset extends utils.enums.Assignable {
}
export declare class CallTooDeep extends utils.enums.Assignable {
}
export declare class TransactionStatus extends utils.enums.Enum {
    readonly success?: SuccessStatus;
    readonly revert?: RevertStatus;
    readonly outOfGas?: OutOfGas;
    readonly outOfFund?: OutOfFund;
    readonly outOfOffset?: OutOfOffset;
    readonly callTooDeep?: CallTooDeep;
    static decode(input: Buffer): TransactionStatus;
}
export declare class SubmitResultV2 extends Assignable {
    kind: 'SubmitResultV2';
    static VERSION: 7;
    readonly version: 7;
    readonly status: TransactionStatus;
    readonly gasUsed: number | bigint;
    readonly logs: LogEventWithAddress[];
    constructor(args: {
        status: TransactionStatus;
        gasUsed: number | bigint | BN;
        logs: LogEventWithAddress[];
    });
    static decode(input: Buffer): SubmitResultV2;
}
export declare class SubmitResultV1 extends Assignable {
    kind: 'SubmitResultV1';
    readonly status: TransactionStatus;
    readonly gasUsed: number | bigint;
    readonly logs: LogEvent[];
    constructor(args: {
        status: TransactionStatus;
        gasUsed: number | bigint | BN;
        logs: LogEvent[];
    });
    static decode(input: Buffer): SubmitResultV1;
}
export declare class LegacyExecutionResult extends Assignable {
    kind: 'LegacyExecutionResult';
    readonly status: boolean;
    readonly gasUsed: number | bigint;
    readonly output: Uint8Array;
    readonly logs: LogEvent[];
    constructor(args: {
        status: boolean | number;
        gasUsed: number | bigint | BN;
        output: Uint8Array | number[];
        logs: LogEvent[];
    });
    static decode(input: Buffer): LegacyExecutionResult;
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
export declare class LogEventWithAddress extends Assignable {
    readonly address: Uint8Array;
    readonly topics: RawU256[];
    readonly data: Uint8Array;
    constructor(args: {
        address: Uint8Array | number[];
        topics: RawU256[];
        data: Uint8Array | number[];
    });
}
export declare class LogEvent extends Assignable {
    readonly topics: RawU256[];
    readonly data: Uint8Array;
    constructor(args: {
        topics: RawU256[];
        data: Uint8Array | number[];
    });
}
export declare class MetaCallArgs extends Assignable {
    readonly signature: Uint8Array;
    readonly v: number;
    readonly nonce: Uint8Array;
    readonly feeAmount: Uint8Array;
    readonly feeAddress: Uint8Array;
    readonly contractAddress: Uint8Array;
    readonly value: Uint8Array;
    readonly methodDef: string;
    readonly args: Uint8Array;
    constructor(signature: Uint8Array, v: number, nonce: Uint8Array, feeAmount: Uint8Array, feeAddress: Uint8Array, contractAddress: Uint8Array, value: Uint8Array, methodDef: string, args: Uint8Array);
}
export declare class NewCallArgs extends Assignable {
    readonly chainID: Uint8Array;
    readonly ownerID: string;
    readonly bridgeProverID: string;
    readonly upgradeDelayBlocks: number | BN;
    constructor(chainID: Uint8Array, ownerID: string, bridgeProverID: string, upgradeDelayBlocks: number | BN);
}
export declare class FungibleTokenMetadata extends Assignable {
    readonly spec: string;
    readonly name: string;
    readonly symbol: string;
    readonly icon: string | null;
    readonly reference: string | null;
    readonly reference_hash: Uint8Array | null;
    readonly decimals: number;
    constructor(spec: string, name: string, symbol: string, icon: string | null, reference: string | null, reference_hash: Uint8Array | null, decimals: number);
    static default(): FungibleTokenMetadata;
}
export declare class InitCallArgs extends Assignable {
    readonly prover_account: string;
    readonly eth_custodian_address: string;
    readonly metadata: FungibleTokenMetadata;
    constructor(prover_account: string, eth_custodian_address: string, metadata: FungibleTokenMetadata);
}
export declare class RawU256 extends Assignable {
    readonly value: Uint8Array;
    constructor(args?: Uint8Array | {
        value: Uint8Array | number[];
    });
    toBytes(): Uint8Array;
    toString(): string;
}
export declare class ViewCallArgs extends Assignable {
    readonly sender: Uint8Array;
    readonly address: Uint8Array;
    readonly amount: Uint8Array;
    readonly input: Uint8Array;
    constructor(sender: Uint8Array, address: Uint8Array, amount: Uint8Array, input: Uint8Array);
}
export {};
