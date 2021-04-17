/* This is free and unencumbered software released into the public domain. */

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
  constructor(env?: KeyStoreEnv) {
    const memKeyStore = new InMemoryKeyStore();
    if (env && env.HOME) {
      const devKeyStore = new InMemoryKeyStore();
      loadLocalKeys(devKeyStore, env);
      const cliKeyStore = new UnencryptedFileSystemKeyStore(`${env.HOME}/.near-credentials`);
      super([memKeyStore, devKeyStore, cliKeyStore]);
    }
    else {
      super([memKeyStore]);
    }
  }
}

function loadLocalKeys(keyStore: NEAR.keyStores.KeyStore, env?: KeyStoreEnv) {
  if (env && env.HOME) {
    const localValidatorKeyPath = `${env.HOME}/.near/validator_key.json`;
    if (existsSync(localValidatorKeyPath)) {
      const [accountID, keyPair] = loadKeyFile(localValidatorKeyPath);
      keyStore.setKey('local', accountID, keyPair);
    }
  }
}

function loadKeyFile(keyFilePath: string) {
  const keyJSON = JSON.parse(readFileSync(keyFilePath, 'utf8'));
  const keyPair = KeyPair.fromString(keyJSON.private_key || keyJSON.secret_key);
  return [keyJSON.account_id, keyPair];
}
