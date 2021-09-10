/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import NEAR, { NEARTransaction } from './near.js';
import { None, Option, Some, U64, U256 } from './prelude.js';
import { SubmitResult } from './schema.js';
import { base58ToBytes, base58ToHex, bytesToHex, hexToBytes, intToHex } from './utils.js';

import { parse as parseRawTransaction } from '@ethersproject/transactions';

interface NEARFunctionCall {
  method_name: string;
  args: string;
  gas: number | string;
  deposit: number | string;
}

interface NEARAction {
  FunctionCall?: NEARFunctionCall;
}

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

const evmMethods = ['raw_call', 'submit']; // TODO: support all EVM methods

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
    public readonly hash?: string,
    public readonly result?: SubmitResult,
    public readonly near?: NEARTransaction
  ) {}

  static fromOutcome(
    outcome: NEAR.providers.FinalExecutionOutcome,
    contractID?: AccountID
  ): Option<Transaction> {
    const contractID_ = contractID || AccountID.aurora();
    if (outcome.transaction.receiver_id != contractID_.id) {
      return None; // not an EVM transaction
    }

    const actions = outcome.transaction.actions as NEARAction[];
    const action = actions.find(
      (action) =>
        action.FunctionCall &&
        evmMethods.includes(action.FunctionCall.method_name)
    );
    if (!action) {
      return None; // not an EVM transaction
    }

    switch (action.FunctionCall?.method_name) {
      case 'raw_call':
      case 'submit':
        return this.fromSubmitCall(outcome, action.FunctionCall);
      default:
        return None; // unreachable
    }
  }

  static fromSubmitCall(
    outcome: NEAR.providers.FinalExecutionOutcome,
    functionCall: NEARFunctionCall
  ): Option<Transaction> {
    try {
      const transaction = parseRawTransaction(
        Buffer.from(functionCall.args, 'base64')
      ); // throws Error
      const outcomeBuffer = Buffer.from(
        (outcome.status as any).SuccessValue,
        'base64'
      );
      const receiptIDs = outcome.transaction_outcome?.outcome?.receipt_ids;
      const executionResult = SubmitResult.decode(outcomeBuffer); // throws BorshError
      return Some(
        new Transaction(
          transaction.nonce,
          BigInt(transaction.gasPrice.toString()),
          BigInt(transaction.gasLimit.toString()), // FIXME: #16, #17
          Address.parse(transaction.to).ok(),
          BigInt(transaction.value.toString()),
          hexToBytes(transaction.data),
          BigInt(transaction.v),
          BigInt(transaction.r),
          BigInt(transaction.s),
          transaction.from
            ? Address.parse(transaction.from).unwrap()
            : undefined,
          transaction.hash,
          executionResult,
          {
            hash: base58ToBytes(outcome.transaction_outcome.id),
            receiptHash:
              Array.isArray(receiptIDs) && receiptIDs?.length
                ? base58ToBytes(receiptIDs[0]!)
                : undefined,
          }
        )
      );
    } catch (error) {
      console.error(error);
      return None;
    }
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
      v: this.v !== undefined ? intToHex(this.v) : undefined,
      r: this.r !== undefined ? intToHex(this.r) : undefined,
      s: this.s !== undefined ? intToHex(this.s) : undefined,
      from: this.from ? this.from.toString() : undefined,
      hash: this.hash,
    };
  }
}
