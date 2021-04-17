/* This is free and unencumbered software released into the public domain. */

import { Account } from './account.js';

import { existsSync, readFileSync } from 'fs';
import NEAR from 'near-api-js';

export const KeyPair = NEAR.KeyPair;

const InMemoryKeyStore = NEAR.keyStores.InMemoryKeyStore;
const MergeKeyStore = NEAR.keyStores.MergeKeyStore;
const UnencryptedFileSystemKeyStore = NEAR.keyStores.UnencryptedFileSystemKeyStore;

export interface KeyStoreEnv {
  HOME?: string;
}

export class KeyStore extends MergeKeyStore {
  protected constructor(public readonly networkID: string, keyStores: NEAR.keyStores.KeyStore[]) {
    super(keyStores);
  }

  static load(networkID: string, env?: KeyStoreEnv): KeyStore {
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

  static loadLocalKeys(env?: KeyStoreEnv): NEAR.keyStores.KeyStore {
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

  async getAccounts(): Promise<string[]> {
    return super.getAccounts(this.networkID); // TODO: fix sorting
  }

  async getSigningAccounts(): Promise<Account[]> {
    return (await this.getAccounts()).map(id => new Account(id));
  }
}

function loadKeyFile(keyFilePath: string) {
  const keyJSON = JSON.parse(readFileSync(keyFilePath, 'utf8'));
  const keyPair = KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
  return [keyJSON.account_id, keyPair];
}
