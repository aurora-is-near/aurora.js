import { AccountID, Address } from './account.js';
import * as NEAR from 'near-api-js';
export declare const KeyPair: typeof NEAR.utils.key_pair.KeyPair;
declare const MergeKeyStore: typeof NEAR.keyStores.MergeKeyStore;
export interface KeyStoreEnv {
    HOME?: string;
}
export declare class KeyStore extends MergeKeyStore {
    readonly networkID: string;
    constructor(networkID: string, keyStores: NEAR.keyStores.KeyStore[]);
    static load(networkID: string, env?: KeyStoreEnv): KeyStore;
    static loadLocalKeys(env?: KeyStoreEnv): NEAR.keyStores.KeyStore;
    getAccounts(): Promise<string[]>;
    getSigningAccounts(): Promise<AccountID[]>;
    getSigningAddresses(): Promise<Address[]>;
    getKey(networkID: string, accountID: string): Promise<NEAR.KeyPair>;
    loadKeyFiles(keyFilePaths: string[]): void;
    loadKeyFile(keyFilePath: string): void;
}
export declare class InMemoryMultiKeyStore extends NEAR.keyStores.KeyStore {
    readonly networkID: string;
    private store;
    constructor(networkID: string);
    setKey(networkID: string, accountID: string, keyPair: NEAR.KeyPair): Promise<void>;
    getKey(networkID: string, accountID: string): Promise<NEAR.KeyPair>;
    removeKey(networkID: string, accountID: string): Promise<void>;
    clear(): Promise<void>;
    getNetworks(): Promise<string[]>;
    getAccounts(networkID: string): Promise<string[]>;
    toString(): string;
}
export {};
