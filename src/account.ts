/* This is free and unencumbered software released into the public domain. */

import { Ok, Result } from './prelude.js';

import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';

export class AccountID {
  constructor(public readonly id: string) {} // TODO: validate the ID

  static aurora(): AccountID {
    return new AccountID('aurora');
  }

  static parse(id?: string): Result<AccountID, string> {
    return Ok(new AccountID(id!));
  }

  toString(): string {
    return this.id;
  }

  toAddress(): Address {
    return Address.parse(
      keccak256(Buffer.from(this.id)).slice(26, 66)
    ).unwrap();
  }
}

export class Address {
  static ZERO = `0x${'00'.repeat(20)}`;

  protected constructor(public readonly id: string) {}

  static zero(): Address {
    return new Address(Address.ZERO);
  }

  static parse(id?: string): Result<Address, string> {
    return Ok(new Address(parseAddress(id!)));
  }

  isZero(): boolean {
    return this.id === Address.ZERO;
  }

  toString(): string {
    return this.id;
  }

  toBytes(): Uint8Array {
    return parseHexString(this.id);
  }
}
