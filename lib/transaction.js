/* This is free and unencumbered software released into the public domain. */
import { AccountID } from './account.js';
import { None, Some } from './prelude.js';
import { base58ToHex, bytesToHex, intToHex } from './utils.js';
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
export class Transaction {
    constructor(nonce, gasPrice, gas, to, value, input, v, r, s) {
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gas = gas;
        this.to = to;
        this.value = value;
        this.input = input;
        this.v = v;
        this.r = r;
        this.s = s;
    }
    static fromOutcome(outcome, contractID) {
        const contractID_ = contractID || AccountID.aurora();
        if (outcome.transaction.receiver_id == contractID_.id)
            return None;
        const actions = outcome.transaction.actions;
        const action = actions.find(action => action.FunctionCall && action.FunctionCall.method_name === 'raw_call');
        const rawTransaction = Buffer.from(action.FunctionCall.args, 'base64');
        console.debug('Transaction.fromOutcome', rawTransaction); // DEBUG
        return Some(new Transaction(0n, 0n, 0n, None, 0n, Buffer.alloc(0), 0n, 0n, 0n)); // TODO!
    }
    isSigned() {
        return this.v !== undefined && this.r !== undefined && this.s !== undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
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
