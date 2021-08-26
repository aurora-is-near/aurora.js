/* This is free and unencumbered software released into the public domain. */
import { Err, Ok } from '@hqoss/monads';
import { utils } from 'near-api-js';
import { bytesToHex } from './utils.js';
class Assignable {
    encode() {
        return utils.serialize.serialize(SCHEMA, this);
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
                    return Ok(Buffer.from(this.result.status.success.output));
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
        this.output = Buffer.from(args.output);
    }
}
export class RevertStatus extends utils.enums.Assignable {
    constructor(args) {
        super(args);
        this.output = Buffer.from(args.output);
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
        return utils.serialize.deserialize(SCHEMA, SubmitResultV1, input);
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
        return utils.serialize.deserialize(SCHEMA, LegacyExecutionResult, input);
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
// Metadata for NEP-141 Fungible tokens (ETH on NEAR is implemented as NEP-141)
export class FungibleTokenMetadata extends Assignable {
    constructor(spec, name, symbol, icon, reference, reference_hash, decimals) {
        super();
        this.spec = spec;
        this.name = name;
        this.symbol = symbol;
        this.icon = icon;
        this.reference = reference;
        this.reference_hash = reference_hash;
        this.decimals = decimals;
    }
    static default() {
        return new FungibleTokenMetadata('ft-1.0.0', 'Ether', 'ETH', 'data:image/png;base64,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', null, null, 18);
    }
}
// Borsh-encoded parameters for the `new_eth_connector` method.
export class InitCallArgs extends Assignable {
    constructor(prover_account, eth_custodian_address, metadata) {
        super();
        this.prover_account = prover_account;
        this.eth_custodian_address = eth_custodian_address;
        this.metadata = metadata;
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
                ['status', TransactionStatus],
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
        FungibleTokenMetadata,
        {
            kind: 'struct',
            fields: [
                ['spec', 'string'],
                ['name', 'string'],
                ['symbol', 'string'],
                ['icon', { kind: 'option', type: 'string' }],
                ['reference', { kind: 'option', type: 'string' }],
                ['reference_hash', { kind: 'option', type: [32] }],
                ['decimals', 'u8'],
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
                ['metadata', FungibleTokenMetadata],
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
