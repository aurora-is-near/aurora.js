/* This is free and unencumbered software released into the public domain. */
import { existsSync, readFileSync } from 'fs';
import NEAR from 'near-api-js';
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
        const memKeyStore = new InMemoryKeyStore();
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
                const [accountID, keyPair] = loadKeyFile(localValidatorKeyPath);
                keyStore.setKey('local', accountID, keyPair);
            }
        }
        return keyStore;
    }
    async getAccounts() {
        return super.getAccounts(this.networkID);
    }
}
function loadKeyFile(keyFilePath) {
    const keyJSON = JSON.parse(readFileSync(keyFilePath, 'utf8'));
    const keyPair = KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
    return [keyJSON.account_id, keyPair];
}
