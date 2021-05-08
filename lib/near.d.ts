import NEAR from 'near-api-js';
export default NEAR;
export interface NEARBlock {
    hash: Uint8Array;
}
export interface NEARTransaction {
    hash: Uint8Array;
    receiptHash?: Uint8Array;
}
