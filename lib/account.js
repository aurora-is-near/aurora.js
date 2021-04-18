/* This is free and unencumbered software released into the public domain. */
import { getAddress as parseAddress } from '@ethersproject/address';
import { keccak256 } from '@ethersproject/keccak256';
import { Ok } from '@hqoss/monads';
export class Account {
    constructor(id) {
        this.id = id;
    } // TODO: validate the ID
    static parse(id) {
        return Ok(new Account(id));
    }
    toString() {
        return this.id;
    }
    toAddress() {
        const address = keccak256(Buffer.from(this.id)).slice(26, 66);
        return `0x${parseAddress(address)}`;
    }
}
