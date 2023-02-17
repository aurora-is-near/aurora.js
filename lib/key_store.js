"use strict";
/* This is free and unencumbered software released into the public domain. */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryMultiKeyStore = exports.KeyStore = exports.KeyPair = void 0;
const account_js_1 = require("./account.js");
const fs_1 = require("fs");
const NEAR = __importStar(require("near-api-js"));
exports.KeyPair = NEAR.KeyPair;
const InMemoryKeyStore = NEAR.keyStores.InMemoryKeyStore;
const MergeKeyStore = NEAR.keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore = NEAR.keyStores.UnencryptedFileSystemKeyStore;
class KeyStore extends MergeKeyStore {
    constructor(networkID, keyStore, keyStores) {
        super([keyStore, ...keyStores]);
        this.networkID = networkID;
        this.keyStore = keyStore;
    }
    static load(networkID, env) {
        const memKeyStore = new InMemoryMultiKeyStore(networkID);
        if (env && env.HOME) {
            const devKeyStore = KeyStore.loadLocalKeys(env);
            const cliKeyStore = new UnencryptedFileSystemKeyStore(`${env.HOME}/.near-credentials`);
            return new KeyStore(networkID, memKeyStore, [devKeyStore, cliKeyStore]);
        }
        else {
            return new KeyStore(networkID, memKeyStore, []);
        }
    }
    static loadLocalKeys(env) {
        const keyStore = new InMemoryKeyStore();
        if (env && env.HOME) {
            const localValidatorKeyPath = `${env.HOME}/.near/validator_key.json`;
            if ((0, fs_1.existsSync)(localValidatorKeyPath)) {
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
        return (await this.getAccounts()).map((id) => account_js_1.AccountID.parse(id).unwrap());
    }
    async getSigningAddresses() {
        return (await this.getAccounts()).map((id) => account_js_1.AccountID.parse(id).unwrap().toAddress());
    }
    async reKey() {
        this.keyStore.reKey();
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
exports.KeyStore = KeyStore;
function _loadKeyFile(keyFilePath) {
    const keyJSON = JSON.parse((0, fs_1.readFileSync)(keyFilePath, 'utf8'));
    const keyPair = exports.KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
    return [keyJSON.account_id, keyPair];
}
class InMemoryMultiKeyStore extends NEAR.keyStores.KeyStore {
    constructor(networkID) {
        super();
        this.networkID = networkID;
        this.reKeyCounter = 0;
        this.store = new Map();
    }
    async reKey() {
        this.reKeyCounter += 1;
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
        if (keyPairs.size == 0)
            return undefined;
        const keyIndex = this.reKeyCounter % keyPairs.size;
        return [...keyPairs][keyIndex];
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
exports.InMemoryMultiKeyStore = InMemoryMultiKeyStore;
