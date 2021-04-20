/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import { None, Option, Some, U64, U256 } from './prelude.js';
import { base58ToHex, bytesToHex, intToHex } from './utils.js';

import NEAR from 'near-api-js';
import { parse } from '@ethersproject/transactions';

export class TransactionID {
  protected constructor(public readonly id: string) {}

  static zero(): TransactionID {
    return new TransactionID(`0x${'00'.repeat(32)}`);
  }

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
    public readonly gasLimit: U256,
    public readonly to: Option<Address>,
    public readonly value: U256,
    public readonly data: Uint8Array,
    public readonly v?: U64,
    public readonly r?: U256,
    public readonly s?: U256,
    public readonly from?: Address,
    public readonly hash?: string) {}

  static fromOutcome(outcome: NEAR.providers.FinalExecutionOutcome, contractID?: AccountID): Option<Transaction> {
    const contractID_ = contractID || AccountID.aurora();
    if (outcome.transaction.receiver_id != contractID_.id) return None;
    const actions = outcome.transaction.actions as any[];
    const action = actions.find(a => a.FunctionCall && a.FunctionCall.method_name === 'raw_call');
    const transaction = parse(Buffer.from(action.FunctionCall.args, 'base64'));
    return Some(new Transaction(
      transaction.nonce,
      BigInt(transaction.gasPrice.toString()),
      BigInt(transaction.gasLimit.toString()),
      Address.parse(transaction.to).ok(),
      BigInt(transaction.value.toString()),
      Buffer.from(transaction.data, 'hex'),
      BigInt(transaction.v),
      BigInt(transaction.r),
      BigInt(transaction.s),
      transaction.from ? Address.parse(transaction.from).unwrap() : undefined,
      transaction.hash,
    ));
  }

  isSigned(): boolean {
    return this.v !== undefined && this.r !== undefined && this.s !== undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return {
      nonce: intToHex(this.nonce),
      gasPrice: intToHex(this.gasPrice),
      gas: intToHex(this.gasLimit),
      to: this.to.isSome() ? this.to.unwrap().toString() : null,
      value: intToHex(this.value),
      input: bytesToHex(this.data),
      v: (this.v !== undefined) ? intToHex(this.v) : undefined,
      r: (this.r !== undefined) ? intToHex(this.r) : undefined,
      s: (this.s !== undefined) ? intToHex(this.s) : undefined,
      from: this.from ? this.from.toString() : undefined,
      hash: this.hash,
    };
  }
}
