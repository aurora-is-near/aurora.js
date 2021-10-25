/* This is free and unencumbered software released into the public domain. */
import { AccountID } from './account.js';
import { existsSync, readFileSync } from 'fs';
import * as NEAR from 'near-api-js';
export const KeyPair = NEAR.KeyPair;
const InMemoryKeyStore = NEAR.keyStores.InMemoryKeyStore;
const MergeKeyStore = NEAR.keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore = NEAR.keyStores.UnencryptedFileSystemKeyStore;
export class KeyStore extends MergeKeyStore {
    constructor(networkID, keyStores) {
        super(keyStores);
        this.networkID = networkID;
    }
    static load(networkID, env) {
        const memKeyStore = new InMemoryMultiKeyStore(networkID);
        if (env && env.HOME) {
            const devKeyStore = KeyStore.loadLocalKeys(env);
            const cliKeyStore = new UnencryptedFileSystemKeyStore(`${env.HOME}/.near-credentials`);
            return new KeyStore(networkID, [memKeyStore, devKeyStore, cliKeyStore]);
        }
        else {
            return new KeyStore(networkID, [memKeyStore]);
        }
    }
    static loadLocalKeys(env) {
        const keyStore = new InMemoryKeyStore();
        if (env && env.HOME) {
            const localValidatorKeyPath = `${env.HOME}/.near/validator_key.json`;
            if (existsSync(localValidatorKeyPath)) {
                const [accountID, keyPair] = _loadKeyFile(localValidatorKeyPath);
                keyStore.setKey('local', accountID, keyPair);
            }
        }
        return keyStore;
    }
    async getAccounts() {
        const accounts = await super.getAccounts(this.networkID);
        return [...new Set(accounts)].sort();
    }
    async getSigningAccounts() {
        return (await this.getAccounts()).map((id) => AccountID.parse(id).unwrap());
    }
    async getSigningAddresses() {
        return (await this.getAccounts()).map((id) => AccountID.parse(id).unwrap().toAddress());
    }
    async getKey(networkID, accountID) {
        return super.getKey(networkID, accountID);
    }
    loadKeyFiles(keyFilePaths) {
        for (const keyFilePath of keyFilePaths) {
            const [accountID, keyPair] = _loadKeyFile(keyFilePath);
            this.keyStores[0].setKey(this.networkID, accountID, keyPair); // FIXME
        }
    }
    loadKeyFile(keyFilePath) {
        const [accountID, keyPair] = _loadKeyFile(keyFilePath);
        this.keyStores[0].setKey(this.networkID, accountID, keyPair);
    }
}
function _loadKeyFile(keyFilePath) {
    const keyJSON = JSON.parse(readFileSync(keyFilePath, 'utf8'));
    const keyPair = KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
    return [keyJSON.account_id, keyPair];
}
export class InMemoryMultiKeyStore extends NEAR.keyStores.KeyStore {
    constructor(networkID) {
        super();
        this.networkID = networkID;
        this.store = new Map();
    }
    async setKey(networkID, accountID, keyPair) {
        if (networkID != this.networkID)
            return;
        const keyPairs = this.store.get(accountID) || new Set();
        keyPairs.add(keyPair);
        this.store.set(accountID, keyPairs);
    }
    async getKey(networkID, accountID) {
        if (networkID != this.networkID)
            return undefined;
        const keyPairs = this.store.get(accountID) || new Set();
        for (const [keyPair, _] of keyPairs.entries()) {
            return keyPair;
        }
        return undefined;
    }
    async removeKey(networkID, accountID) {
        if (networkID != this.networkID)
            return;
        this.store.delete(accountID);
    }
    async clear() {
        this.store.clear();
    }
    async getNetworks() {
        return [this.networkID];
    }
    async getAccounts(networkID) {
        if (networkID != this.networkID)
            return [];
        return [...this.store.keys()];
    }
    toString() {
        return 'InMemoryMultiKeyStore';
    }
}
