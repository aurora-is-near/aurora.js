/* This is free and unencumbered software released into the public domain. */

import { toBufferBE } from 'bigint-buffer';
import bs58 from 'bs58';

export function formatU256(value: bigint): string {
  return `0x${toBufferBE(value, 32).toString('hex')}`;
}

export function hexToBase58(input: string): string {
  return bs58.encode(Buffer.from(input.substring(2), 'hex'));
}

export function base58ToHex(input: string): string {
  return `0x${Buffer.from(bs58.decode(input)).toString('hex')}`;
}
