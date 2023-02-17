"use strict";
/* This is free and unencumbered software released into the public domain. */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportJSON = exports.ethErc20ToNep141 = exports.intToHex = exports.hexToInt = exports.hexToBytes = exports.hexToBase58 = exports.bytesToHex = exports.base58ToBytes = exports.base58ToHex = exports.formatU256 = void 0;
const account_js_1 = require("./account.js");
const config_js_1 = require("./config.js");
const transaction_js_1 = require("./transaction.js");
const bigint_buffer_1 = require("bigint-buffer");
const bs58_1 = __importDefault(require("bs58"));
function formatU256(value) {
    return `0x${(0, bigint_buffer_1.toBufferBE)(BigInt(value), 32).toString('hex')}`;
}
exports.formatU256 = formatU256;
function base58ToHex(input) {
    return `0x${Buffer.from(bs58_1.default.decode(input)).toString('hex')}`;
}
exports.base58ToHex = base58ToHex;
function base58ToBytes(input) {
    return Buffer.from(bs58_1.default.decode(input));
}
exports.base58ToBytes = base58ToBytes;
function bytesToHex(input) {
    return `0x${input ? Buffer.from(input).toString('hex') : ''}`;
}
exports.bytesToHex = bytesToHex;
function hexToBase58(input) {
    return bs58_1.default.encode(hexToBytes(input));
}
exports.hexToBase58 = hexToBase58;
function hexToBytes(input) {
    return Buffer.from(input.substring(2), 'hex');
}
exports.hexToBytes = hexToBytes;
function hexToInt(input) {
    return parseInt(input, 16); // TODO: handle bignums
}
exports.hexToInt = hexToInt;
function intToHex(input) {
    return `0x${input.toString(16)}`;
}
exports.intToHex = intToHex;
function ethErc20ToNep141(tokenAddress, networkId) {
    const prefix = tokenAddress.toString().substring(2).toLowerCase();
    let suffix;
    switch (networkId) {
        case config_js_1.NetworkID.Mainnet:
            suffix = 'factory.bridge.near';
            break;
        case config_js_1.NetworkID.Testnet:
            suffix = 'f.ropsten.testnet';
            break;
        default:
            throw new Error(`Network ${networkId} not supported.`);
    }
    return account_js_1.AccountID.parse(prefix + '.' + suffix).unwrap();
}
exports.ethErc20ToNep141 = ethErc20ToNep141;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function exportJSON(input) {
    if (input === undefined)
        return input;
    if (Array.isArray(input)) {
        return input.map(exportJSON);
    }
    for (const [k, v] of Object.entries(input)) {
        //console.log(k, v, typeof v);
        switch (typeof v) {
            case 'number':
            case 'bigint':
                input[k] = intToHex(v);
                break;
            case 'object':
                input[k] =
                    v === null
                        ? null
                        : Array.isArray(v)
                            ? v.map(exportJSON)
                            : v instanceof account_js_1.AccountID
                                ? v.toString()
                                : v instanceof account_js_1.Address
                                    ? v.toString()
                                    : v instanceof transaction_js_1.Transaction
                                        ? v.toJSON()
                                        : v instanceof transaction_js_1.TransactionID
                                            ? v.toString()
                                            : v instanceof Uint8Array
                                                ? bytesToHex(v)
                                                : exportJSON(v);
                break;
            default:
                break;
        }
    }
    return input;
}
exports.exportJSON = exportJSON;
