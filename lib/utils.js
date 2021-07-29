/* This is free and unencumbered software released into the public domain. */
import { AccountID, Address } from './account.js';
import { NetworkID } from './config.js';
import { Transaction, TransactionID } from './transaction.js';
import { toBufferBE } from 'bigint-buffer';
import bs58 from 'bs58';
export function formatU256(value) {
    return `0x${toBufferBE(BigInt(value), 32).toString('hex')}`;
}
export function base58ToHex(input) {
    return `0x${Buffer.from(bs58.decode(input)).toString('hex')}`;
}
export function base58ToBytes(input) {
    return Buffer.from(bs58.decode(input));
}
export function bytesToHex(input) {
    return `0x${input ? Buffer.from(input).toString('hex') : ''}`;
}
export function hexToBase58(input) {
    return bs58.encode(hexToBytes(input));
}
export function hexToBytes(input) {
    return Buffer.from(input.substring(2), 'hex');
}
export function hexToInt(input) {
    return parseInt(input, 16); // TODO: handle bignums
}
export function intToHex(input) {
    return `0x${input.toString(16)}`;
}
export function ethErc20ToNep141(tokenAddress, networkId) {
    const prefix = tokenAddress.toString().substring(2).toLowerCase();
    let suffix;
    switch (networkId) {
        case NetworkID.Mainnet:
            suffix = 'factory.bridge.near';
            break;
        case NetworkID.Testnet:
            suffix = 'f.ropsten.testnet';
            break;
        default:
            throw new Error(`Network ${networkId} not supported.`);
    }
    return AccountID.parse(prefix + '.' + suffix).unwrap();
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function exportJSON(input) {
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
                            : v instanceof AccountID
                                ? v.toString()
                                : v instanceof Address
                                    ? v.toString()
                                    : v instanceof Transaction
                                        ? v.toJSON()
                                        : v instanceof TransactionID
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
