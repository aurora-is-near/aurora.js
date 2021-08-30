"use strict";
/* This is free and unencumbered software released into the public domain. */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.ViewCallArgs = exports.RawU256 = exports.InitCallArgs = exports.NewCallArgs = exports.MetaCallArgs = exports.LogEvent = exports.GetStorageAtArgs = exports.GetChainID = exports.FunctionCallArgs = exports.LegacyExecutionResult = exports.SubmitResultV1 = exports.TransactionStatus = exports.CallTooDeep = exports.OutOfOffset = exports.OutOfFund = exports.OutOfGas = exports.RevertStatus = exports.SuccessStatus = exports.SubmitResult = exports.BeginChainArgs = exports.BeginBlockArgs = void 0;
var monads_1 = require("@hqoss/monads");
var near_api_js_1 = require("near-api-js");
var utils_js_1 = require("./utils.js");
var Assignable = /** @class */ (function () {
    function Assignable() {
    }
    Assignable.prototype.encode = function () {
        return near_api_js_1.utils.serialize.serialize(SCHEMA, this);
    };
    return Assignable;
}());
// Borsh-encoded parameters for the `begin_block` method.
var BeginBlockArgs = /** @class */ (function (_super) {
    __extends(BeginBlockArgs, _super);
    function BeginBlockArgs(hash, coinbase, timestamp, number, difficulty, gaslimit) {
        var _this = _super.call(this) || this;
        _this.hash = hash;
        _this.coinbase = coinbase;
        _this.timestamp = timestamp;
        _this.number = number;
        _this.difficulty = difficulty;
        _this.gaslimit = gaslimit;
        return _this;
    }
    return BeginBlockArgs;
}(Assignable));
exports.BeginBlockArgs = BeginBlockArgs;
// Borsh-encoded parameters for the `begin_chain` method.
var BeginChainArgs = /** @class */ (function (_super) {
    __extends(BeginChainArgs, _super);
    function BeginChainArgs(chainID) {
        var _this = _super.call(this) || this;
        _this.chainID = chainID;
        return _this;
    }
    return BeginChainArgs;
}(Assignable));
exports.BeginChainArgs = BeginChainArgs;
var SubmitResult = /** @class */ (function () {
    function SubmitResult(result) {
        this.result = result;
    }
    SubmitResult.prototype.output = function () {
        switch (this.result.kind) {
            case 'SubmitResultV1':
                if (this.result.status.success) {
                    return monads_1.Ok(Buffer.from(this.result.status.success.output));
                }
                else if (this.result.status.revert) {
                    return monads_1.Err(this.result.status.revert);
                }
                else if (this.result.status.outOfFund) {
                    return monads_1.Err(this.result.status.outOfFund);
                }
                else if (this.result.status.outOfGas) {
                    return monads_1.Err(this.result.status.outOfGas);
                }
                else if (this.result.status.outOfOffset) {
                    return monads_1.Err(this.result.status.outOfOffset);
                }
                else if (this.result.status.callTooDeep) {
                    return monads_1.Err(this.result.status.callTooDeep);
                }
                else {
                    // Should be unreachable since one enum variant should be assigned
                    return monads_1.Err('LegacyStatusFalse');
                }
            case 'LegacyExecutionResult':
                if (this.result.status) {
                    return monads_1.Ok(this.result.output);
                }
                else {
                    return monads_1.Err('LegacyStatusFalse');
                }
        }
    };
    SubmitResult.decode = function (input) {
        try {
            var v1 = SubmitResultV1.decode(input);
            return new SubmitResult(v1);
        }
        catch (error) {
            var legacy = LegacyExecutionResult.decode(input);
            return new SubmitResult(legacy);
        }
    };
    return SubmitResult;
}());
exports.SubmitResult = SubmitResult;
var SuccessStatus = /** @class */ (function (_super) {
    __extends(SuccessStatus, _super);
    function SuccessStatus(args) {
        var _this = _super.call(this, args) || this;
        _this.output = Buffer.from(args.output);
        return _this;
    }
    return SuccessStatus;
}(near_api_js_1.utils.enums.Assignable));
exports.SuccessStatus = SuccessStatus;
var RevertStatus = /** @class */ (function (_super) {
    __extends(RevertStatus, _super);
    function RevertStatus(args) {
        var _this = _super.call(this, args) || this;
        _this.output = Buffer.from(args.output);
        return _this;
    }
    return RevertStatus;
}(near_api_js_1.utils.enums.Assignable));
exports.RevertStatus = RevertStatus;
var OutOfGas = /** @class */ (function (_super) {
    __extends(OutOfGas, _super);
    function OutOfGas() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutOfGas;
}(near_api_js_1.utils.enums.Assignable));
exports.OutOfGas = OutOfGas;
var OutOfFund = /** @class */ (function (_super) {
    __extends(OutOfFund, _super);
    function OutOfFund() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutOfFund;
}(near_api_js_1.utils.enums.Assignable));
exports.OutOfFund = OutOfFund;
var OutOfOffset = /** @class */ (function (_super) {
    __extends(OutOfOffset, _super);
    function OutOfOffset() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return OutOfOffset;
}(near_api_js_1.utils.enums.Assignable));
exports.OutOfOffset = OutOfOffset;
var CallTooDeep = /** @class */ (function (_super) {
    __extends(CallTooDeep, _super);
    function CallTooDeep() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return CallTooDeep;
}(near_api_js_1.utils.enums.Assignable));
exports.CallTooDeep = CallTooDeep;
var TransactionStatus = /** @class */ (function (_super) {
    __extends(TransactionStatus, _super);
    function TransactionStatus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TransactionStatus.decode = function (input) {
        return near_api_js_1.utils.serialize.deserialize(SCHEMA, TransactionStatus, input);
    };
    return TransactionStatus;
}(near_api_js_1.utils.enums.Enum));
exports.TransactionStatus = TransactionStatus;
// New Borsh-encoded result from the `submit` method.
var SubmitResultV1 = /** @class */ (function (_super) {
    __extends(SubmitResultV1, _super);
    function SubmitResultV1(args) {
        var _this = _super.call(this) || this;
        // discriminator to match on type in `SubmitResult`
        _this.kind = 'SubmitResultV1';
        _this.status = args.status;
        _this.gasUsed = BigInt(args.gasUsed.toString());
        _this.logs = args.logs;
        return _this;
    }
    SubmitResultV1.decode = function (input) {
        return near_api_js_1.utils.serialize.deserialize(SCHEMA, SubmitResultV1, input);
    };
    return SubmitResultV1;
}(Assignable));
exports.SubmitResultV1 = SubmitResultV1;
// Old Borsh-encoded result from the `submit` method.
var LegacyExecutionResult = /** @class */ (function (_super) {
    __extends(LegacyExecutionResult, _super);
    function LegacyExecutionResult(args) {
        var _this = _super.call(this) || this;
        // discriminator to match on type in `SubmitResult`
        _this.kind = 'LegacyExecutionResult';
        _this.status = Boolean(args.status);
        _this.gasUsed = BigInt(args.gasUsed.toString());
        _this.output = Buffer.from(args.output);
        _this.logs = args.logs;
        return _this;
    }
    LegacyExecutionResult.decode = function (input) {
        return near_api_js_1.utils.serialize.deserialize(SCHEMA, LegacyExecutionResult, input);
    };
    return LegacyExecutionResult;
}(Assignable));
exports.LegacyExecutionResult = LegacyExecutionResult;
// Borsh-encoded parameters for the `call` method.
var FunctionCallArgs = /** @class */ (function (_super) {
    __extends(FunctionCallArgs, _super);
    function FunctionCallArgs(contract, input) {
        var _this = _super.call(this) || this;
        _this.contract = contract;
        _this.input = input;
        return _this;
    }
    return FunctionCallArgs;
}(Assignable));
exports.FunctionCallArgs = FunctionCallArgs;
// Borsh-encoded parameters for the `get_chain_id` method.
var GetChainID = /** @class */ (function (_super) {
    __extends(GetChainID, _super);
    function GetChainID() {
        return _super.call(this) || this;
    }
    return GetChainID;
}(Assignable));
exports.GetChainID = GetChainID;
// Borsh-encoded parameters for the `get_storage_at` method.
var GetStorageAtArgs = /** @class */ (function (_super) {
    __extends(GetStorageAtArgs, _super);
    function GetStorageAtArgs(address, key) {
        var _this = _super.call(this) || this;
        _this.address = address;
        _this.key = key;
        return _this;
    }
    return GetStorageAtArgs;
}(Assignable));
exports.GetStorageAtArgs = GetStorageAtArgs;
// Borsh-encoded log for use in a `ExecutionResult`.
var LogEvent = /** @class */ (function (_super) {
    __extends(LogEvent, _super);
    function LogEvent(args) {
        var _this = _super.call(this) || this;
        _this.topics = args.topics;
        _this.data = Buffer.from(args.data);
        return _this;
    }
    return LogEvent;
}(Assignable));
exports.LogEvent = LogEvent;
// Borsh-encoded parameters for the `meta_call` method.
var MetaCallArgs = /** @class */ (function (_super) {
    __extends(MetaCallArgs, _super);
    function MetaCallArgs(signature, v, nonce, feeAmount, feeAddress, contractAddress, value, methodDef, args) {
        var _this = _super.call(this) || this;
        _this.signature = signature;
        _this.v = v;
        _this.nonce = nonce;
        _this.feeAmount = feeAmount;
        _this.feeAddress = feeAddress;
        _this.contractAddress = contractAddress;
        _this.value = value;
        _this.methodDef = methodDef;
        _this.args = args;
        return _this;
    }
    return MetaCallArgs;
}(Assignable));
exports.MetaCallArgs = MetaCallArgs;
// Borsh-encoded parameters for the `new` method.
var NewCallArgs = /** @class */ (function (_super) {
    __extends(NewCallArgs, _super);
    function NewCallArgs(chainID, ownerID, bridgeProverID, upgradeDelayBlocks) {
        var _this = _super.call(this) || this;
        _this.chainID = chainID;
        _this.ownerID = ownerID;
        _this.bridgeProverID = bridgeProverID;
        _this.upgradeDelayBlocks = upgradeDelayBlocks;
        return _this;
    }
    return NewCallArgs;
}(Assignable));
exports.NewCallArgs = NewCallArgs;
// Borsh-encoded parameters for the `new_eth_connector` method.
var InitCallArgs = /** @class */ (function (_super) {
    __extends(InitCallArgs, _super);
    function InitCallArgs(prover_account, eth_custodian_address) {
        var _this = _super.call(this) || this;
        _this.prover_account = prover_account;
        _this.eth_custodian_address = eth_custodian_address;
        return _this;
    }
    return InitCallArgs;
}(Assignable));
exports.InitCallArgs = InitCallArgs;
// Borsh-encoded U256 integer.
var RawU256 = /** @class */ (function (_super) {
    __extends(RawU256, _super);
    function RawU256(args) {
        var _this = _super.call(this) || this;
        if (!args) {
            _this.value = Buffer.alloc(32);
        }
        else {
            var bytes = Buffer.from(args instanceof Uint8Array ? args : args.value);
            //assert(bytes.length == 32); // TODO
            _this.value = bytes;
        }
        return _this;
    }
    RawU256.prototype.toBytes = function () {
        return this.value;
    };
    RawU256.prototype.toString = function () {
        return utils_js_1.bytesToHex(this.value);
    };
    return RawU256;
}(Assignable));
exports.RawU256 = RawU256;
// Borsh-encoded parameters for the `view` method.
var ViewCallArgs = /** @class */ (function (_super) {
    __extends(ViewCallArgs, _super);
    function ViewCallArgs(sender, address, amount, input) {
        var _this = _super.call(this) || this;
        _this.sender = sender;
        _this.address = address;
        _this.amount = amount;
        _this.input = input;
        return _this;
    }
    return ViewCallArgs;
}(Assignable));
exports.ViewCallArgs = ViewCallArgs;
// eslint-disable-next-line @typescript-eslint/ban-types
var SCHEMA = new Map([
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
            ]
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
            ]
        },
    ],
    [
        SuccessStatus,
        {
            kind: 'struct',
            fields: [['output', ['u8']]]
        },
    ],
    [
        RevertStatus,
        {
            kind: 'struct',
            fields: [['output', ['u8']]]
        },
    ],
    [
        OutOfGas,
        {
            kind: 'struct',
            fields: []
        },
    ],
    [
        OutOfFund,
        {
            kind: 'struct',
            fields: []
        },
    ],
    [
        OutOfOffset,
        {
            kind: 'struct',
            fields: []
        },
    ],
    [
        CallTooDeep,
        {
            kind: 'struct',
            fields: []
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
            ]
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
            ]
        },
    ],
    [
        FunctionCallArgs,
        {
            kind: 'struct',
            fields: [
                ['contract', [20]],
                ['input', ['u8']],
            ]
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
            ]
        },
    ],
    [
        LogEvent,
        {
            kind: 'struct',
            fields: [
                ['topics', [RawU256]],
                ['data', ['u8']],
            ]
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
            ]
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
            ]
        },
    ],
    [
        InitCallArgs,
        {
            kind: 'struct',
            fields: [
                ['prover_account', 'string'],
                ['eth_custodian_address', 'string'],
            ]
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
            ]
        },
    ],
    [RawU256, { kind: 'struct', fields: [['value', [32]]] }],
]);
