/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';

import { existsSync, readFileSync } from 'fs';
import * as NEAR from 'near-api-js';

export const KeyPair = NEAR.KeyPair;

const InMemoryKeyStore = NEAR.keyStores.InMemoryKeyStore;
const MergeKeyStore = NEAR.keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore =
  NEAR.keyStores.UnencryptedFileSystemKeyStore;

export interface KeyStoreEnv {
  HOME?: string;
}

export class KeyStore extends MergeKeyStore {
  public constructor(
    public readonly networkID: string,
    keyStores: NEAR.keyStores.KeyStore[]
  ) {
    super(keyStores);
  }

  static load(networkID: string, env?: KeyStoreEnv): KeyStore {
    const memKeyStore = new InMemoryMultiKeyStore(networkID);
    if (env && env.HOME) {
      const devKeyStore = KeyStore.loadLocalKeys(env);
      const cliKeyStore = new UnencryptedFileSystemKeyStore(
        `${env.HOME}/.near-credentials`
      );
      return new KeyStore(networkID, [memKeyStore, devKeyStore, cliKeyStore]);
    } else {
      return new KeyStore(networkID, [memKeyStore]);
    }
  }

  static loadLocalKeys(env?: KeyStoreEnv): NEAR.keyStores.KeyStore {
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

  async getAccounts(): Promise<string[]> {
    const accounts = await super.getAccounts(this.networkID);
    return [...new Set(accounts)].sort();
  }

  async getSigningAccounts(): Promise<AccountID[]> {
    return (await this.getAccounts()).map((id) => AccountID.parse(id).unwrap());
  }

  async getSigningAddresses(): Promise<Address[]> {
    return (await this.getAccounts()).map((id) =>
      AccountID.parse(id).unwrap().toAddress()
    );
  }

  async getKey(networkID: string, accountID: string): Promise<NEAR.KeyPair> {
    return super.getKey(networkID, accountID);
  }

  loadKeyFiles(keyFilePaths: string[]) {
    for (const keyFilePath of keyFilePaths) {
      const [accountID, keyPair] = _loadKeyFile(keyFilePath);
      this.keyStores[0]!.setKey(this.networkID, accountID, keyPair); // FIXME
    }
  }

  loadKeyFile(keyFilePath: string) {
    const [accountID, keyPair] = _loadKeyFile(keyFilePath);
    this.keyStores[0]!.setKey(this.networkID, accountID, keyPair);
  }
}

function _loadKeyFile(keyFilePath: string) {
  const keyJSON = JSON.parse(readFileSync(keyFilePath, 'utf8'));
  const keyPair = KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
  return [keyJSON.account_id, keyPair];
}

export class InMemoryMultiKeyStore extends NEAR.keyStores.KeyStore {
  private store: Map<string, Set<NEAR.KeyPair>>;

  public constructor(public readonly networkID: string) {
    super();
    this.store = new Map();
  }

  async setKey(
    networkID: string,
    accountID: string,
    keyPair: NEAR.KeyPair
  ): Promise<void> {
    if (networkID != this.networkID) return;
    const keyPairs = this.store.get(accountID) || new Set();
    keyPairs.add(keyPair);
    this.store.set(accountID, keyPairs);
  }

  async getKey(networkID: string, accountID: string): Promise<NEAR.KeyPair> {
    if (networkID != this.networkID) return undefined!;
    const keyPairs = this.store.get(accountID) || new Set();
    if (keyPairs.size == 0) return undefined!;
    const keyIndex = Math.floor(Math.random() * keyPairs.size);
    return [...keyPairs][keyIndex]!;
  }

  async removeKey(networkID: string, accountID: string): Promise<void> {
    if (networkID != this.networkID) return;
    this.store.delete(accountID);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getNetworks(): Promise<string[]> {
    return [this.networkID];
  }

  async getAccounts(networkID: string): Promise<string[]> {
    if (networkID != this.networkID) return [];
    return [...this.store.keys()];
  }

  toString(): string {
    return 'InMemoryMultiKeyStore';
  }
}
