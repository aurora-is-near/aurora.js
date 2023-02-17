"use strict";
/* This is free and unencumbered software released into the public domain. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Address = exports.AccountID = void 0;
const prelude_js_1 = require("./prelude.js");
const address_1 = require("@ethersproject/address");
const bytes_1 = require("@ethersproject/bytes");
const keccak256_1 = require("@ethersproject/keccak256");
class AccountID {
    constructor(id) {
        this.id = id;
    } // TODO: validate the ID
    static aurora() {
        return new AccountID('aurora');
    }
    static parse(id) {
        return (0, prelude_js_1.Ok)(new AccountID(id));
    }
    toString() {
        return this.id;
    }
    toAddress() {
        return Address.parse((0, keccak256_1.keccak256)(Buffer.from(this.id)).slice(26, 66)).unwrap();
    }
}
exports.AccountID = AccountID;
class Address {
    constructor(id) {
        this.id = id;
    }
    static zero() {
        return new Address(Address.ZERO);
    }
    static parse(id) {
        try {
            return (0, prelude_js_1.Ok)(new Address((0, address_1.getAddress)(id)));
        }
        catch (error) {
            return (0, prelude_js_1.Err)(error.message);
        }
    }
    isZero() {
        return this.id === Address.ZERO;
    }
    toString() {
        return this.id;
    }
    toBytes() {
        return (0, bytes_1.arrayify)(this.id);
    }
}
exports.Address = Address;
Address.ZERO = `0x${'00'.repeat(20)}`;
