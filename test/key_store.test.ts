/* This is free and unencumbered software released into the public domain. */

import { KeyStore } from '../lib/key_store.js';
import * as NEAR from 'near-api-js';

const InMemoryKeyStore = NEAR.keyStores.InMemoryKeyStore;

const keyPair1 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
const keyPair2 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
let memKeyStore = new InMemoryKeyStore();
let keyStore = new KeyStore('mainnet', [memKeyStore]);

beforeEach(() => {
  memKeyStore = new InMemoryKeyStore();
  keyStore = new KeyStore('mainnet', [memKeyStore]);
});

test('KeyStore#getAccounts()', async () => {
  memKeyStore.setKey('mainnet', 'b', keyPair2);
  memKeyStore.setKey('mainnet', 'a', keyPair1);
  expect(await keyStore.getAccounts()).toStrictEqual(['a', 'b']);
});
