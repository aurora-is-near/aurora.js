/* This is free and unencumbered software released into the public domain. */

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
    const devKeyStore = new InMemoryKeyStore();
    if (env && env.HOME) {
      const cliKeyStore = new UnencryptedFileSystemKeyStore(`${env.HOME}/.near-credentials`);
      super([devKeyStore, cliKeyStore]);
    }
    else {
      super([devKeyStore]);
    }
  }
}
