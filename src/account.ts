/* This is free and unencumbered software released into the public domain. */

import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { Result, Ok } from '@hqoss/monads';

export type AccountID = string;

export class Address {
  protected constructor(public readonly id: string) {}

  static parse(id: string): Address {
    return new Address(parseAddress(id));
  }

  toString(): string {
    return `0x${this.id}`;
  }

  toBytes(): Uint8Array {
    return parseHexString(this.id);
  }
}

export class Account {
  constructor(public readonly id: string) {} // TODO: validate the ID

  static parse(id: string): Result<Account, string> {
    return Ok(new Account(id));
  }

  toString(): string {
    return this.id;
  }

  toAddress(): Address {
    return Address.parse(keccak256(Buffer.from(this.id)).slice(26, 66));
  }
}
