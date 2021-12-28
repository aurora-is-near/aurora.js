/// <reference types="node" />
import { AccountID, Address } from './account.js';
import { BlockHash, BlockHeight, BlockID, BlockOptions, BlockProxy } from './block.js';
import { KeyStore } from './key_store.js';
import { Quantity, Result, U256 } from './prelude.js';
import { SubmitResult, OutOfGas } from './schema.js';
import { TransactionID } from './transaction.js';
import * as NEAR from 'near-api-js';
import { ResErr } from '@hqoss/monads/dist/lib/result/result';
export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';
export declare type Bytecode = Uint8Array;
export declare type Bytecodeish = Bytecode | string;
export declare type ChainID = bigint;
export declare type Error = string;
export interface TransactionOutcome {
    id: TransactionID;
    output: Uint8Array;
}
export interface BlockInfo {
    hash: BlockHash;
    coinbase: Address;
    timestamp: number;
    number: BlockHeight;
    difficulty: number;
    gasLimit: Quantity;
}
export interface ViewOptions {
    block?: BlockID;
}
export interface ConnectOptions {
    network?: string;
    endpoint?: string;
    contract?: string;
    signer?: string;
}
export interface ConnectEnv {
    AURORA_ENGINE?: string;
    HOME?: string;
    NEAR_ENV?: string;
    NEAR_MASTER_ACCOUNT?: string;
    NEAR_URL?: string;
}
export declare type AddressStorage = Map<U256, U256>;
export declare class AddressState {
    address: Address;
    nonce: U256;
    balance: Quantity;
    code?: Uint8Array | undefined;
    storage: AddressStorage;
    constructor(address: Address, nonce?: U256, balance?: Quantity, code?: Uint8Array | undefined, storage?: AddressStorage);
}
export declare const enum EngineStorageKeyPrefix {
    Config = 0,
    Nonce = 1,
    Balance = 2,
    Code = 3,
    Storage = 4
}
export declare type EngineStorage = Map<Address, AddressState>;
export declare class EngineState {
    storage: EngineStorage;
    constructor(storage?: EngineStorage);
}
export declare class Engine {
    readonly near: NEAR.Near;
    readonly keyStore: KeyStore;
    readonly signer: NEAR.Account;
    readonly networkID: string;
    readonly contractID: AccountID;
    protected constructor(near: NEAR.Near, keyStore: KeyStore, signer: NEAR.Account, networkID: string, contractID: AccountID);
    static connect(options: ConnectOptions, env?: ConnectEnv): Promise<Engine>;
    install(contractCode: Bytecode): Promise<Result<TransactionID, Error>>;
    upgrade(contractCode: Bytecode): Promise<Result<TransactionID, Error>>;
    initialize(options: any): Promise<Result<TransactionID, Error>>;
    private promiseAndThen;
    getAccount(): Promise<Result<NEAR.Account, Error>>;
    getBlockHash(): Promise<Result<BlockHash, Error>>;
    getBlockHeight(): Promise<Result<BlockHeight, Error>>;
    getBlockInfo(): Promise<Result<BlockInfo, Error>>;
    getBlockTransactionCount(blockID: BlockID): Promise<Result<number, Error>>;
    getBlock(blockID: BlockID, options?: BlockOptions): Promise<Result<BlockProxy, Error>>;
    hasBlock(blockID: BlockID): Promise<Result<boolean, Error>>;
    getCoinbase(): Promise<Result<Address, Error>>;
    getVersion(options?: ViewOptions): Promise<Result<string, Error>>;
    getOwner(options?: ViewOptions): Promise<Result<AccountID, Error>>;
    getBridgeProvider(options?: ViewOptions): Promise<Result<AccountID, Error>>;
    getChainID(options?: ViewOptions): Promise<Result<ChainID, Error>>;
    deployCode(bytecode: Bytecodeish): Promise<Result<Address, Error>>;
    call(contract: Address, input: Uint8Array | string): Promise<Result<Uint8Array, Error>>;
    submit(input: Uint8Array | string): Promise<Result<SubmitResult, Error>>;
    view(sender: Address, address: Address, amount: Quantity, input: Uint8Array | string, options?: ViewOptions): Promise<Result<Uint8Array | ResErr<unknown, OutOfGas>, Error>>;
    getCode(address: Address, options?: ViewOptions): Promise<Result<Bytecode, Error>>;
    getBalance(address: Address, options?: ViewOptions): Promise<Result<U256, Error>>;
    getNonce(address: Address, options?: ViewOptions): Promise<Result<U256, Error>>;
    getStorageAt(address: Address, key: U256 | number | string, options?: ViewOptions): Promise<Result<U256, Error>>;
    getAuroraErc20Address(nep141: AccountID, options?: ViewOptions): Promise<Result<Address, Error>>;
    getNEP141Account(erc20: Address, options?: ViewOptions): Promise<Result<AccountID, Error>>;
    getStorage(): Promise<Result<EngineStorage, Error>>;
    protected callFunction(methodName: string, args?: Uint8Array, options?: ViewOptions): Promise<Result<Buffer, Error>>;
    protected callMutativeFunction(methodName: string, args?: Uint8Array): Promise<Result<TransactionOutcome, Error>>;
    private prepareInput;
}
