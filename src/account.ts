/* This is free and unencumbered software released into the public domain. */

import { Ok, Result } from './prelude.js';

import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';

export class Address {
  protected constructor(public readonly id: string) {}

  static zero(): Address {
    return new Address('0x0000000000000000000000000000000000000000');
  }

  static parse(id?: string): Result<Address, string> {
    return Ok(new Address(parseAddress(id!)));
  }

  toString(): string {
    return this.id;
  }

  toBytes(): Uint8Array {
    return parseHexString(this.id);
  }
}

export class AccountID {
  constructor(public readonly id: string) {} // TODO: validate the ID

  static parse(id?: string): Result<AccountID, string> {
    return Ok(new AccountID(id!));
  }

  toString(): string {
    return this.id;
  }

  toAddress(): Address {
    return Address.parse(keccak256(Buffer.from(this.id)).slice(26, 66)).unwrap();
  }
}
