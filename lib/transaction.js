/* This is free and unencumbered software released into the public domain. */
import { bytesToHex, intToHex } from './utils.js';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
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
