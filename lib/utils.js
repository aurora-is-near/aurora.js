/* This is free and unencumbered software released into the public domain. */
import bs58 from 'bs58';
export function hexToBase58(input) {
    return bs58.encode(Buffer.from(input.substring(2), 'hex'));
}
export function base58ToHex(input) {
    return `0x${Buffer.from(bs58.decode(input)).toString('hex')}`;
}
