/* This is free and unencumbered software released into the public domain. */

import { Address } from './account.js';
import { U64, U256 } from './prelude.js';
import { base58ToHex, bytesToHex, intToHex } from './utils.js';

import { Option } from '@hqoss/monads';

export class TransactionID {
  protected constructor(public readonly id: string) {}

  static fromHex(id: string): TransactionID {
    return new TransactionID(id);
  }

  static fromBase58(id: string): TransactionID {
    return new TransactionID(base58ToHex(id));
  }

  toString(): string {
    return this.id;
  }
}

export class Transaction {
  constructor(
    public readonly nonce: U256,
    public readonly gasPrice: U256,
    public readonly gas: U256,
    public readonly to: Option<Address>,
    public readonly value: U256,
    public readonly input: Uint8Array,
    public readonly v: U64,
    public readonly r: U256,
    public readonly s: U256) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return {
      nonce: intToHex(this.nonce),
      gasPrice: intToHex(this.gasPrice),
      gas: intToHex(this.gas),
      to: this.to.isSome() ? this.to.unwrap() : null,
      value: intToHex(this.value),
      input: bytesToHex(this.input),
      v: this.v && intToHex(this.v),
      r: this.r && intToHex(this.r),
      s: this.s && intToHex(this.s),
    };
  }
}
