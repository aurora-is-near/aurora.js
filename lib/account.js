/* This is free and unencumbered software released into the public domain. */
import { Ok } from './prelude.js';
import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
export class AccountID {
    constructor(id) {
        this.id = id;
    } // TODO: validate the ID
    static aurora() {
        return new AccountID("aurora");
    }
    static parse(id) {
        return Ok(new AccountID(id));
    }
    toString() {
        return this.id;
    }
    toAddress() {
        return Address.parse(keccak256(Buffer.from(this.id)).slice(26, 66)).unwrap();
    }
}
export class Address {
    constructor(id) {
        this.id = id;
    }
    static zero() {
        return new Address(Address.ZERO);
    }
    static parse(id) {
        return Ok(new Address(parseAddress(id)));
    }
    isZero() {
        return this.id === Address.ZERO;
    }
    toString() {
        return this.id;
    }
    toBytes() {
        return parseHexString(this.id);
    }
}
Address.ZERO = `0x${'00'.repeat(20)}`;
