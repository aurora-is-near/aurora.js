/* This is free and unencumbered software released into the public domain. */
import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { keccak256 } from '@ethersproject/keccak256';
import { Ok } from '@hqoss/monads';
export class Address {
    constructor(id) {
        this.id = id;
    }
    static zero() {
        return new Address('0x0000000000000000000000000000000000000000');
    }
    static parse(id) {
        return Ok(new Address(parseAddress(id)));
    }
    toString() {
        return this.id;
    }
    toBytes() {
        return parseHexString(this.id);
    }
}
export class AccountID {
    constructor(id) {
        this.id = id;
    } // TODO: validate the ID
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
