/* This is free and unencumbered software released into the public domain. */
import NEAR from 'near-api-js';
class Assignable {
    encode() {
        return NEAR.utils.serialize.serialize(SCHEMA, this);
    }
}
// Borsh-encoded parameters for the `begin_block` method.
export class BeginBlockArgs extends Assignable {
    constructor(hash, coinbase, timestamp, number, difficulty, gaslimit) {
        super();
        this.hash = hash;
        this.coinbase = coinbase;
        this.timestamp = timestamp;
        this.number = number;
        this.difficulty = difficulty;
        this.gaslimit = gaslimit;
    }
}
// Borsh-encoded parameters for the `begin_chain` method.
export class BeginChainArgs extends Assignable {
    constructor(chainID) {
        super();
        this.chainID = chainID;
    }
}
// Borsh-encoded parameters for the `call` method.
export class FunctionCallArgs extends Assignable {
    constructor(contract, input) {
        super();
        this.contract = contract;
        this.input = input;
    }
}
// Borsh-encoded parameters for the `get_chain_id` method.
export class GetChainID extends Assignable {
    constructor() {
        super();
    }
}
// Borsh-encoded parameters for the `get_storage_at` method.
export class GetStorageAtArgs extends Assignable {
    constructor(address, key) {
        super();
        this.address = address;
        this.key = key;
    }
}
// Borsh-encoded log for use in a `SubmitResult`.
export class LogResult extends Assignable {
    constructor(topics, data) {
        super();
        this.topics = topics;
        this.data = data;
    }
}
// Borsh-encoded parameters for the `meta_call` method.
export class MetaCallArgs extends Assignable {
    constructor(signature, v, nonce, feeAmount, feeAddress, contractAddress, value, methodDef, args) {
        super();
        this.signature = signature;
        this.v = v;
        this.nonce = nonce;
        this.feeAmount = feeAmount;
        this.feeAddress = feeAddress;
        this.contractAddress = contractAddress;
        this.value = value;
        this.methodDef = methodDef;
        this.args = args;
    }
}
// Borsh-encoded parameters for the `new` method.
export class NewCallArgs extends Assignable {
    constructor(chainID, ownerID, bridgeProverID, upgradeDelayBlocks) {
        super();
        this.chainID = chainID;
        this.ownerID = ownerID;
        this.bridgeProverID = bridgeProverID;
        this.upgradeDelayBlocks = upgradeDelayBlocks;
    }
}
// Borsh-encoded U256 integer.
export class RawU256 extends Assignable {
    constructor(value) {
        super();
        this.value = value;
    }
}
// Borsh-encoded result from the `submit` method.
export class SubmitResult extends Assignable {
    constructor(status, gasUsed, result, logs) {
        super();
        this.status = status;
        this.gasUsed = gasUsed;
        this.result = result;
        this.logs = logs;
    }
    static decode(input) {
        return NEAR.utils.serialize.deserialize(SCHEMA, SubmitResult, input);
    }
}
// Borsh-encoded parameters for the `view` method.
export class ViewCallArgs extends Assignable {
    constructor(sender, address, amount, input) {
        super();
        this.sender = sender;
        this.address = address;
        this.amount = amount;
        this.input = input;
    }
}
// eslint-disable-next-line @typescript-eslint/ban-types
const SCHEMA = new Map([
    [
        BeginBlockArgs,
        {
            kind: 'struct',
            fields: [
                ['hash', [32]],
                ['coinbase', [32]],
                ['timestamp', [32]],
                ['number', [32]],
                ['difficulty', [32]],
                ['gaslimit', [32]],
            ],
        },
    ],
    [BeginChainArgs, { kind: 'struct', fields: [['chainID', [32]]] }],
    [
        FunctionCallArgs,
        {
            kind: 'struct',
            fields: [
                ['contract', [20]],
                ['input', ['u8']],
            ],
        },
    ],
    [GetChainID, { kind: 'struct', fields: [] }],
    [
        GetStorageAtArgs,
        {
            kind: 'struct',
            fields: [
                ['address', [20]],
                ['key', [32]],
            ],
        },
    ],
    [
        LogResult,
        {
            kind: 'struct',
            fields: [
                ['topics', [RawU256]],
                ['data', ['u8']],
            ],
        },
    ],
    [
        MetaCallArgs,
        {
            kind: 'struct',
            fields: [
                ['signature', [64]],
                ['v', 'u8'],
                ['nonce', [32]],
                ['feeAmount', [32]],
                ['feeAddress', [20]],
                ['contractAddress', [20]],
                ['value', [32]],
                ['methodDef', 'string'],
                ['args', ['u8']],
            ],
        },
    ],
    [
        NewCallArgs,
        {
            kind: 'struct',
            fields: [
                ['chainID', [32]],
                ['ownerID', 'string'],
                ['bridgeProverID', 'string'],
                ['upgradeDelayBlocks', 'u64'],
            ],
        },
    ],
    [
        SubmitResult,
        {
            kind: 'struct',
            fields: [
                ['status', 'u8'],
                ['gasUsed', 'u64'],
                ['result', ['u8']],
                ['logs', [LogResult]],
            ],
        },
    ],
    [
        ViewCallArgs,
        {
            kind: 'struct',
            fields: [
                ['sender', [20]],
                ['address', [20]],
                ['amount', [32]],
                ['input', ['u8']],
            ],
        },
    ],
    [RawU256, { kind: 'struct', fields: [['value', [32]]] }],
]);
