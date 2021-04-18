/* This is free and unencumbered software released into the public domain. */

import { getAddress as parseAddress } from '@ethersproject/address';
import { keccak256 } from '@ethersproject/keccak256';
import { Result, Ok } from '@hqoss/monads';

export type AccountID = string;
export type Address = string;

export class Account {
  constructor(public readonly id: string) {} // TODO: validate the ID

  static parse(id: string): Result<Account, string> {
    return Ok(new Account(id));
  }

  toString(): string {
    return this.id;
  }

  toAddress(): Address {
    const address = keccak256(Buffer.from(this.id)).slice(26, 66);
    return `0x${parseAddress(address)}`;
  }
}
