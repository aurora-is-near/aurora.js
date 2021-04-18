/* This is free and unencumbered software released into the public domain. */

export type BlockTag = 'earliest' | 'latest' | 'pending'
export type BlockHeight = number;
export type BlockHash = string;
export type BlockID = BlockTag | BlockHeight | BlockHash;
