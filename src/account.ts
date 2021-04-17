/* This is free and unencumbered software released into the public domain. */

import { keccak256 } from '@ethersproject/keccak256';

export type AccountID = string;
export type Address = string;

export class Account {
  constructor(public readonly id: string) {} // TODO: validate ID

  toString(): string {
    return this.id;
  }

  toAddress(): Address {
    return `0x${keccak256(this.id).slice(26, 66)}`;
  }
}
