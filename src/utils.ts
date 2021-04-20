/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import { Transaction, TransactionID } from './transaction.js';

import { toBufferBE } from 'bigint-buffer';
import bs58 from 'bs58';

export function formatU256(value: bigint): string {
  return `0x${toBufferBE(value, 32).toString('hex')}`;
}

export function base58ToHex(input: string): string {
  return `0x${Buffer.from(bs58.decode(input)).toString('hex')}`;
}

export function base58ToBytes(input: string): Uint8Array {
  return Buffer.from(bs58.decode(input));
}

export function bytesToHex(input: Uint8Array): string {
  return `0x${Buffer.from(input).toString('hex')}`;
}

export function hexToBase58(input: string): string {
  return bs58.encode(Buffer.from(input.substring(2), 'hex'));
}

export function intToHex(input: number | bigint): string {
  return `0x${input.toString(16)}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportJSON(object: any): any {
  for (const [k, v] of Object.entries(object)) {
    //console.log(k, v, typeof v);
    switch (typeof v) {
      case 'number':
      case 'bigint':
        object[k] = intToHex(v);
        break;
      case 'object':
        object[k] =
          (v instanceof AccountID) ? v.toString() :
          (v instanceof Address) ? v.toString() :
          (v instanceof Transaction) ? v.toJSON() :
          (v instanceof TransactionID) ? v.toString() :
          (v instanceof Uint8Array) ? bytesToHex(v) :
          (v !== null ? exportJSON(v) : null);
        break;
      default: break;
    }
  }
  return object;
}
