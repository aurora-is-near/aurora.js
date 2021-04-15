import NEAR from 'near-api-js';
export declare const KeyPair: typeof NEAR.utils.key_pair.KeyPair;
declare const MergeKeyStore: typeof NEAR.keyStores.MergeKeyStore;
export interface KeyStoreEnv {
    HOME?: string;
}
export declare class KeyStore extends MergeKeyStore {
    constructor(env?: KeyStoreEnv);
}
export {};
