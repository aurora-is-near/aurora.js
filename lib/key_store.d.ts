import NEAR from 'near-api-js';
export declare const KeyPair: typeof NEAR.utils.key_pair.KeyPair;
declare const MergeKeyStore: typeof NEAR.keyStores.MergeKeyStore;
export interface KeyStoreEnv {
    HOME?: string;
}
export declare class KeyStore extends MergeKeyStore {
    readonly networkID: string;
    protected constructor(networkID: string, keyStores: NEAR.keyStores.KeyStore[]);
    static load(networkID: string, env?: KeyStoreEnv): KeyStore;
    static loadLocalKeys(env?: KeyStoreEnv): NEAR.keyStores.KeyStore;
    getAccounts(): Promise<string[]>;
}
export {};