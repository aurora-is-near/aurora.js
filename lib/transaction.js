/* This is free and unencumbered software released into the public domain. */
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
}
