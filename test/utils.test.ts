/* This is free and unencumbered software released into the public domain. */

import * as utils from '../lib/utils.js';

test('hexToInt()', () => {
  expect(utils.hexToInt('0xff')).toBe(0xff);
});

test('intToHex()', () => {
  expect(utils.intToHex(0xff)).toBe('0xff');
});
