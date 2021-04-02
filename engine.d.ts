/// <reference types="node" />
import { KeyStore } from './key_store.js';
import { Result } from '@hqoss/monads';
import NEAR from 'near-api-js';
export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';
export declare type AccountID = string;
export declare type Address = string;
export declare type Amount = bigint | number;
export declare type BlockHash = string;
export declare type BlockHeight = number;
export declare type Bytecode = Uint8Array;
export declare type Bytecodeish = Bytecode | string;
export declare type ChainID = bigint;
export declare type Error = string;
export declare type TransactionID = string;
export declare type U256 = bigint;
export interface TransactionOutcome {
    id: TransactionID;
    output: Uint8Array;
}
export interface ConnectEnv {
    NEAR_ENV?: string;
    NEAR_URL?: string;
}
export declare class Engine {
    near: NEAR.Near;
    keyStore: KeyStore;
    signer: NEAR.Account;
    contractID: AccountID;
    constructor(near: NEAR.Near, keyStore: KeyStore, signer: NEAR.Account, contractID: AccountID);
    static connect(options: any, env: ConnectEnv): Promise<Engine>;
    install(contractCode: Bytecode): Promise<Result<TransactionID, Error>>;
    upgrade(contractCode: Bytecode): Promise<Result<TransactionID, Error>>;
    initialize(options: any): Promise<Result<TransactionID, Error>>;
    getAccount(): Promise<Result<NEAR.Account, Error>>;
    getBlockHash(): Promise<Result<BlockHash, Error>>;
    getBlockHeight(): Promise<Result<BlockHeight, Error>>;
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
    protected callFunction(methodName: string, args?: Uint8Array): Promise<Result<Buffer, Error>>;
    protected callMutativeFunction(methodName: string, args?: Uint8Array): Promise<Result<TransactionOutcome, Error>>;
    private prepareInput;
}
