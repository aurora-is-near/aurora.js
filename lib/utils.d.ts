export declare function formatU256(value: number | bigint): string;
export declare function base58ToHex(input: string): string;
export declare function base58ToBytes(input: string): Uint8Array;
export declare function bytesToHex(input: Uint8Array | null | undefined): string;
export declare function hexToBase58(input: string): string;
export declare function hexToBytes(input: string): Uint8Array;
export declare function hexToInt(input: string): number;
export declare function intToHex(input: number | bigint): string;
export declare function exportJSON(object: Record<string, unknown>): any;
