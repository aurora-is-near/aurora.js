/* This is free and unencumbered software released into the public domain. */

import { InMemoryMultiKeyStore, KeyStore } from '../lib/key_store.js';
import * as NEAR from 'near-api-js';

const keyPair1 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
const keyPair2 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
let memKeyStore = new InMemoryMultiKeyStore('mainnet');
let keyStore = new KeyStore('mainnet', [memKeyStore]);

beforeEach(() => {
  memKeyStore = new InMemoryMultiKeyStore('mainnet');
  keyStore = new KeyStore('mainnet', [memKeyStore]);
});

test('KeyStore#getAccounts()', async () => {
  memKeyStore.setKey('mainnet', 'b', keyPair2);
  memKeyStore.setKey('mainnet', 'a', keyPair1);
  expect(await keyStore.getAccounts()).toStrictEqual(['a', 'b']);
});

test('InMemoryMultiKeyStore#getNetworks()', async () => {
  memKeyStore.setKey('mainnet', 'a', keyPair2);
  memKeyStore.setKey('mainnet', 'a', keyPair1);
  expect(await keyStore.getNetworks()).toStrictEqual(['mainnet']);
});

test('InMemoryMultiKeyStore#getAccounts()', async () => {
  memKeyStore.setKey('mainnet', 'a', keyPair2);
  memKeyStore.setKey('mainnet', 'a', keyPair1);
  expect(await keyStore.getAccounts()).toStrictEqual(['a']);
});
