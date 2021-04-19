/* This is free and unencumbered software released into the public domain. */
import { toBufferBE } from 'bigint-buffer';
import bs58 from 'bs58';
export function formatU256(value) {
    return `0x${toBufferBE(value, 32).toString('hex')}`;
}
export function base58ToHex(input) {
    return `0x${Buffer.from(bs58.decode(input)).toString('hex')}`;
}
export function base58ToBytes(input) {
    return new Uint8Array(bs58.decode(input));
}
export function bytesToHex(input) {
    return `0x${Buffer.from(input).toString('hex')}`;
}
export function hexToBase58(input) {
    return bs58.encode(Buffer.from(input.substring(2), 'hex'));
}
export function intToHex(input) {
    return `0x${input.toString(16)}`;
}
