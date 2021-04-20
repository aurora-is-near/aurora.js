/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import { None, Option, Some, U64, U256 } from './prelude.js';
import { base58ToHex, bytesToHex, intToHex } from './utils.js';

import NEAR from 'near-api-js';

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
    public readonly gas: U256,
    public readonly to: Option<Address>,
    public readonly value: U256,
    public readonly input: Uint8Array,
    public readonly v?: U64,
    public readonly r?: U256,
    public readonly s?: U256) {}

  static fromOutcome(outcome: NEAR.providers.FinalExecutionOutcome, contractID?: AccountID): Option<Transaction> {
    const contractID_ = contractID || AccountID.aurora();
    if (outcome.transaction.receiver_id == contractID_.id) return None;
    const actions = outcome.transaction.actions as any[];
    const action = actions.find(action => action.FunctionCall && action.FunctionCall.method_name === 'raw_call');
    const rawTransaction = Buffer.from(action.FunctionCall.args, 'base64');
    console.debug('Transaction.fromOutcome', rawTransaction); // DEBUG
    return Some(new Transaction(0n, 0n, 0n, None, 0n, Buffer.alloc(0), 0n, 0n, 0n)); // TODO!
  }

  isSigned(): boolean {
    return this.v !== undefined && this.r !== undefined && this.s !== undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  toJSON(): any {
    return {
      nonce: intToHex(this.nonce),
      gasPrice: intToHex(this.gasPrice),
      gas: intToHex(this.gas),
      to: this.to.isSome() ? this.to.unwrap() : null,
      value: intToHex(this.value),
      input: bytesToHex(this.input),
      v: (this.v !== undefined) ? intToHex(this.v) : undefined,
      r: (this.r !== undefined) ? intToHex(this.r) : undefined,
      s: (this.s !== undefined) ? intToHex(this.s) : undefined,
    };
  }
}
