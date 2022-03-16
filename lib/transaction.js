/* This is free and unencumbered software released into the public domain. */
import { AccountID, Address } from './account.js';
import { None, Some } from './prelude.js';
import { SubmitResult } from './schema.js';
import { base58ToBytes, base58ToHex, bytesToHex, hexToBytes, intToHex, } from './utils.js';
import { parse as parseRawTransaction } from '@ethersproject/transactions';
export class TransactionID {
    constructor(id) {
        this.id = id;
    }
    static zero() {
        return new TransactionID(`0x${'00'.repeat(32)}`);
    }
    static fromHex(id) {
        return new TransactionID(id);
    }
    static fromBase58(id) {
        return new TransactionID(base58ToHex(id));
    }
    toString() {
        return this.id;
    }
}
const evmMethods = ['raw_call', 'submit']; // TODO: support all EVM methods
export class Transaction {
    constructor(nonce, gasPrice, gasLimit, to, value, data, v, r, s, from, hash, result, near) {
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gasLimit = gasLimit;
        this.to = to;
        this.value = value;
        this.data = data;
        this.v = v;
        this.r = r;
        this.s = s;
        this.from = from;
        this.hash = hash;
        this.result = result;
        this.near = near;
    }
    static fromOutcome(outcome, contractID) {
        const contractID_ = contractID || AccountID.aurora();
        if (outcome.transaction.receiver_id != contractID_.id) {
            return None; // not an EVM transaction
        }
        const actions = outcome.transaction.actions;
        const action = actions.find((action) => action.FunctionCall &&
            evmMethods.includes(action.FunctionCall.method_name));
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
    static fromSubmitCall(outcome, functionCall) {
        try {
            const outcomeStatus = outcome.status;
            if (outcomeStatus.Failure) {
                console.error('Failure outcome:', outcomeStatus.Failure);
                return None;
            }
            const outcomeBuffer = Buffer.from(outcomeStatus.SuccessValue, 'base64');
            const transaction = parseRawTransaction(Buffer.from(functionCall.args, 'base64')); // throws Error
            const receiptIDs = outcome.transaction_outcome?.outcome?.receipt_ids;
            const executionResult = SubmitResult.decode(outcomeBuffer); // throws BorshError
            return Some(new Transaction(transaction.nonce, BigInt(transaction.gasPrice?.toString() || 0), BigInt(transaction.gasLimit.toString()), // FIXME: #16, #17
            Address.parse(transaction.to).ok(), BigInt(transaction.value.toString()), hexToBytes(transaction.data), BigInt(transaction.v), BigInt(transaction.r), BigInt(transaction.s), transaction.from
                ? Address.parse(transaction.from).unwrap()
                : undefined, transaction.hash, executionResult, {
                hash: base58ToBytes(outcome.transaction_outcome.id),
                receiptHash: Array.isArray(receiptIDs) && receiptIDs?.length
                    ? base58ToBytes(receiptIDs[0])
                    : undefined,
            }));
        }
        catch (error) {
            console.error(error);
            return None;
        }
    }
    isSigned() {
        return this.v !== undefined && this.r !== undefined && this.s !== undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
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
