/* This is free and unencumbered software released into the public domain. */

import { InMemoryMultiKeyStore, KeyStore } from '../lib/key_store.js';
import * as NEAR from 'near-api-js';

const NETWORK_ID = 'mainnet';
const keyPair1 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
const keyPair2 = NEAR.utils.key_pair.KeyPairEd25519.fromRandom();
let memKeyStore = new InMemoryMultiKeyStore(NETWORK_ID);
let keyStore = new KeyStore(NETWORK_ID, memKeyStore, []);

beforeEach(() => {
  memKeyStore = new InMemoryMultiKeyStore(NETWORK_ID);
  keyStore = new KeyStore(NETWORK_ID, memKeyStore, []);
});

test('KeyStore#getAccounts()', async () => {
  memKeyStore.setKey(NETWORK_ID, 'b', keyPair2);
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair1);
  expect(await keyStore.getAccounts()).toStrictEqual(['a', 'b']);
});

test('InMemoryMultiKeyStore#getNetworks()', async () => {
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair1);
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair2);
  expect(await keyStore.getNetworks()).toStrictEqual([NETWORK_ID]);
});

test('InMemoryMultiKeyStore#getAccounts()', async () => {
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair1);
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair2);
  expect(await keyStore.getAccounts()).toStrictEqual(['a']);
});

test('InMemoryMultiKeyStore#getKey() x2', async () => {
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair1);
  memKeyStore.setKey(NETWORK_ID, 'a', keyPair2);
  const results = new Map<string, number>();
  for (let i = 0; i < 100; i++) {
    const key = (await keyStore.getKey(NETWORK_ID, 'a')).toString();
    results.set(key, (results.get(key) || 0) + 1);
    keyStore.reKey();
  }
  expect(results.get(keyPair1.toString())).toBeGreaterThan(30);
  expect(results.get(keyPair2.toString())).toBeGreaterThan(30);
});
