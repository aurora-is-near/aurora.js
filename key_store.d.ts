import NEAR from 'near-api-js';
export declare const KeyPair: typeof NEAR.utils.key_pair.KeyPair;
declare const MergeKeyStore: typeof NEAR.keyStores.MergeKeyStore;
export declare class KeyStore extends MergeKeyStore {
    constructor(env?: any);
}
export {};
