/* This is free and unencumbered software released into the public domain. */
import { Err, Ok } from '@hqoss/monads';
import NEAR from 'near-api-js';
import { utils } from 'near-api-js';
import { bytesToHex } from './utils.js';
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
export class SubmitResult {
    constructor(result) {
        this.result = result;
    }
    output() {
        switch (this.result.kind) {
            case 'SubmitResultV1':
                if (this.result.status.success) {
                    return Ok(this.result.status.success.output);
                }
                else if (this.result.status.revert) {
                    return Err(this.result.status.revert);
                }
                else if (this.result.status.outOfFund) {
                    return Err(this.result.status.outOfFund);
                }
                else if (this.result.status.outOfGas) {
                    return Err(this.result.status.outOfGas);
                }
                else if (this.result.status.outOfOffset) {
                    return Err(this.result.status.outOfOffset);
                }
                else if (this.result.status.callTooDeep) {
                    return Err(this.result.status.callTooDeep);
                }
                else {
                    // Should be unreachable since one enum variant should be assigned
                    return Err('LegacyStatusFalse');
                }
            case 'LegacyExecutionResult':
                if (this.result.status) {
                    return Ok(this.result.output);
                }
                else {
                    return Err('LegacyStatusFalse');
                }
        }
    }
    static decode(input) {
        try {
            const v1 = SubmitResultV1.decode(input);
            return new SubmitResult(v1);
        }
        catch (error) {
            const legacy = LegacyExecutionResult.decode(input);
            return new SubmitResult(legacy);
        }
    }
}
export class SuccessStatus extends utils.enums.Assignable {
    constructor(args) {
        super(args);
        this.output = args.output;
    }
}
export class RevertStatus extends utils.enums.Assignable {
    constructor(args) {
        super(args);
        this.output = args.output;
    }
}
export class OutOfGas extends utils.enums.Assignable {
}
export class OutOfFund extends utils.enums.Assignable {
}
export class OutOfOffset extends utils.enums.Assignable {
}
export class CallTooDeep extends utils.enums.Assignable {
}
export class TransactionStatus extends utils.enums.Enum {
}
// New Borsh-encoded result from the `submit` method.
export class SubmitResultV1 extends Assignable {
    constructor(args) {
        super();
        // discriminator to match on type in `SubmitResult`
        this.kind = 'SubmitResultV1';
        this.status = args.status;
        this.gasUsed = BigInt(args.gasUsed.toString());
        this.logs = args.logs;
    }
    static decode(input) {
        return NEAR.utils.serialize.deserialize(SCHEMA, SubmitResultV1, input);
    }
}
// Old Borsh-encoded result from the `submit` method.
export class LegacyExecutionResult extends Assignable {
    constructor(args) {
        super();
        // discriminator to match on type in `SubmitResult`
        this.kind = 'LegacyExecutionResult';
        this.status = Boolean(args.status);
        this.gasUsed = BigInt(args.gasUsed.toString());
        this.output = Buffer.from(args.output);
        this.logs = args.logs;
    }
    static decode(input) {
        return NEAR.utils.serialize.deserialize(SCHEMA, LegacyExecutionResult, input);
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
// Borsh-encoded log for use in a `ExecutionResult`.
export class LogEvent extends Assignable {
    constructor(args) {
        super();
        this.topics = args.topics;
        this.data = Buffer.from(args.data);
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
// Borsh-encoded parameters for the `new_eth_connector` method.
export class InitCallArgs extends Assignable {
    constructor(prover_account, eth_custodian_address) {
        super();
        this.prover_account = prover_account;
        this.eth_custodian_address = eth_custodian_address;
    }
}
// Borsh-encoded U256 integer.
export class RawU256 extends Assignable {
    constructor(args) {
        super();
        if (!args) {
            this.value = Buffer.alloc(32);
        }
        else {
            const bytes = Buffer.from(args instanceof Uint8Array ? args : args.value);
            //assert(bytes.length == 32); // TODO
            this.value = bytes;
        }
    }
    toBytes() {
        return this.value;
    }
    toString() {
        return bytesToHex(this.value);
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
        TransactionStatus,
        {
            kind: 'enum',
            field: 'enum',
            values: [
                ['success', SuccessStatus],
                ['revert', RevertStatus],
                ['revert', RevertStatus],
                ['outOfGas', OutOfGas],
                ['outOfFund', OutOfFund],
                ['outOfOffset', OutOfOffset],
                ['callTooDeep', CallTooDeep],
            ],
        },
    ],
    [
        SuccessStatus,
        {
            kind: 'struct',
            fields: [['output', ['u8']]],
        },
    ],
    [
        RevertStatus,
        {
            kind: 'struct',
            fields: [['output', ['u8']]],
        },
    ],
    [
        OutOfGas,
        {
            kind: 'struct',
            fields: [],
        },
    ],
    [
        OutOfFund,
        {
            kind: 'struct',
            fields: [],
        },
    ],
    [
        OutOfOffset,
        {
            kind: 'struct',
            fields: [],
        },
    ],
    [
        CallTooDeep,
        {
            kind: 'struct',
            fields: [],
        },
    ],
    [
        SubmitResultV1,
        {
            kind: 'struct',
            fields: [
                ['status', [TransactionStatus]],
                ['gasUsed', 'u64'],
                ['logs', [LogEvent]],
            ],
        },
    ],
    [
        LegacyExecutionResult,
        {
            kind: 'struct',
            fields: [
                ['status', 'u8'],
                ['gasUsed', 'u64'],
                ['output', ['u8']],
                ['logs', [LogEvent]],
            ],
        },
    ],
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
        LogEvent,
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
        InitCallArgs,
        {
            kind: 'struct',
            fields: [
                ['prover_account', 'string'],
                ['eth_custodian_address', 'string'],
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
