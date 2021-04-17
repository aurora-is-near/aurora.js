/* This is free and unencumbered software released into the public domain. */
import { keccak256 } from '@ethersproject/keccak256';
export class Account {
    constructor(id) {
        this.id = id;
    } // TODO: validate ID
    toString() {
        return this.id;
    }
    toAddress() {
        return `0x${keccak256(this.id).slice(26, 66)}`;
    }
}
