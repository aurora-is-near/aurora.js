/// <reference types="node" />
import { AccountID, Address } from './account.js';
import { KeyStore } from './key_store.js';
import { Result } from '@hqoss/monads';
import NEAR from 'near-api-js';
export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';
export declare type Amount = bigint | number;
export declare type BlockHash = string;
export declare type BlockHeight = number;
export declare type Bytecode = Uint8Array;
export declare type Bytecodeish = Bytecode | string;
export declare type ChainID = bigint;
export declare type Error = string;
export declare type Quantity = bigint;
export declare type TransactionID = string;
export declare type U256 = bigint;
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
    gasLimit: Amount;
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
    balance: Amount;
    code?: Uint8Array | undefined;
    storage: AddressStorage;
    constructor(address: Address, nonce?: U256, balance?: Amount, code?: Uint8Array | undefined, storage?: AddressStorage);
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
    getAccount(): Promise<Result<NEAR.Account, Error>>;
    getBlockHash(): Promise<Result<BlockHash, Error>>;
    getBlockHeight(): Promise<Result<BlockHeight, Error>>;
    getBlockInfo(): Promise<Result<BlockInfo, Error>>;
    getCoinbase(): Promise<Result<Address, Error>>;
    getVersion(): Promise<Result<string, Error>>;
    getOwner(): Promise<Result<AccountID, Error>>;
    getBridgeProvider(): Promise<Result<AccountID, Error>>;
    getChainID(): Promise<Result<ChainID, Error>>;
    deployCode(bytecode: Bytecodeish): Promise<Result<Address, Error>>;
    call(contract: Address, input: Uint8Array | string): Promise<Result<Uint8Array, Error>>;
    view(sender: Address, address: Address, amount: Amount, input: Uint8Array | string): Promise<Result<Uint8Array, Error>>;
    getCode(address: Address): Promise<Result<Bytecode, Error>>;
    getBalance(address: Address): Promise<Result<U256, Error>>;
    getNonce(address: Address): Promise<Result<U256, Error>>;
    getStorageAt(address: Address, key: U256 | number | string): Promise<Result<U256, Error>>;
    getStorage(): Promise<Result<EngineStorage, Error>>;
    protected callFunction(methodName: string, args?: Uint8Array): Promise<Result<Buffer, Error>>;
    protected callMutativeFunction(methodName: string, args?: Uint8Array): Promise<Result<TransactionOutcome, Error>>;
    private prepareInput;
}
export declare function formatU256(value: U256): string;
