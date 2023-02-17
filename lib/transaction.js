"use strict";
/* This is free and unencumbered software released into the public domain. */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = exports.TransactionID = void 0;
const account_js_1 = require("./account.js");
const prelude_js_1 = require("./prelude.js");
const schema_js_1 = require("./schema.js");
const utils_js_1 = require("./utils.js");
const transactions_1 = require("@ethersproject/transactions");
class TransactionID {
    constructor(id) {
        this.id = id;
    }
    static zero() {
        return new TransactionID(`0x${'00'.repeat(32)}`);
    }
    static fromHex(id) {
        return new TransactionID(id);
    }
    static fromBase58(id) {
        return new TransactionID((0, utils_js_1.base58ToHex)(id));
    }
    toString() {
        return this.id;
    }
}
exports.TransactionID = TransactionID;
const evmMethods = ['submit']; // TODO: support all EVM methods
class Transaction {
    constructor(nonce, gasPrice, gasLimit, to, value, data, v, r, s, from, hash, result, near) {
        this.nonce = nonce;
        this.gasPrice = gasPrice;
        this.gasLimit = gasLimit;
        this.to = to;
        this.value = value;
        this.data = data;
        this.v = v;
        this.r = r;
        this.s = s;
        this.from = from;
        this.hash = hash;
        this.result = result;
        this.near = near;
    }
    static fromOutcome(outcome, contractID) {
        const contractID_ = contractID || account_js_1.AccountID.aurora();
        if (outcome.transaction.receiver_id != contractID_.id) {
            return prelude_js_1.None; // not an EVM transaction
        }
        const actions = outcome.transaction.actions;
        // Ignore transactions with batched actions.
        if (actions.length !== 1) {
            return prelude_js_1.None;
        }
        const action = actions.find((action) => action.FunctionCall &&
            evmMethods.includes(action.FunctionCall.method_name));
        if (!action) {
            return prelude_js_1.None; // not an EVM transaction
        }
        switch (action.FunctionCall?.method_name) {
            case 'raw_call':
            case 'submit':
                return this.fromSubmitCall(outcome, action.FunctionCall);
            default:
                return prelude_js_1.None; // unreachable
        }
    }
    static fromSubmitCall(outcome, functionCall) {
        try {
            const outcomeStatus = outcome.status;
            if (outcomeStatus.Failure) {
                console.error('Failure outcome:', outcomeStatus.Failure);
                return prelude_js_1.None;
            }
            const outcomeBuffer = Buffer.from(outcomeStatus.SuccessValue, 'base64');
            const transaction = (0, transactions_1.parse)(Buffer.from(functionCall.args, 'base64')); // throws Error
            const receiptIDs = outcome.transaction_outcome?.outcome?.receipt_ids;
            const executionResult = schema_js_1.SubmitResult.decode(outcomeBuffer); // throws BorshError
            return (0, prelude_js_1.Some)(new Transaction(transaction.nonce, BigInt(transaction.gasPrice?.toString() || 0), BigInt(transaction.gasLimit.toString()), // FIXME: #16, #17
            account_js_1.Address.parse(transaction.to).ok(), BigInt(transaction.value.toString()), (0, utils_js_1.hexToBytes)(transaction.data), BigInt(transaction.v), BigInt(transaction.r), BigInt(transaction.s), transaction.from
                ? account_js_1.Address.parse(transaction.from).unwrap()
                : undefined, transaction.hash, executionResult, {
                hash: (0, utils_js_1.base58ToBytes)(outcome.transaction_outcome.id),
                receiptHash: Array.isArray(receiptIDs) && receiptIDs?.length
                    ? (0, utils_js_1.base58ToBytes)(receiptIDs[0])
                    : undefined,
            }));
        }
        catch (error) {
            console.error(error);
            return prelude_js_1.None;
        }
    }
    isSigned() {
        return this.v !== undefined && this.r !== undefined && this.s !== undefined;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    toJSON() {
        return {
            nonce: (0, utils_js_1.intToHex)(this.nonce),
            gasPrice: (0, utils_js_1.intToHex)(this.gasPrice),
            gas: (0, utils_js_1.intToHex)(this.gasLimit),
            to: this.to.isSome() ? this.to.unwrap().toString() : null,
            value: (0, utils_js_1.intToHex)(this.value),
            input: (0, utils_js_1.bytesToHex)(this.data),
            v: this.v !== undefined ? (0, utils_js_1.intToHex)(this.v) : undefined,
            r: this.r !== undefined ? (0, utils_js_1.intToHex)(this.r) : undefined,
            s: this.s !== undefined ? (0, utils_js_1.intToHex)(this.s) : undefined,
            from: this.from ? this.from.toString() : undefined,
            hash: this.hash,
        };
    }
}
exports.Transaction = Transaction;
