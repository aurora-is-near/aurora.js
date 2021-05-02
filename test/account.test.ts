/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from '../lib/account.js';

test('AccountID.aurora().toAddress()', () => {
  expect(AccountID.aurora().toAddress().toString()).toBe(
    '0x4444588443C3a91288c5002483449Aba1054192b'
  );
});

test('Address.zero()', () => {
  expect(Address.zero().toString()).toBe(
    '0x0000000000000000000000000000000000000000'
  );
});
