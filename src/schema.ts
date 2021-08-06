/* This is free and unencumbered software released into the public domain. */

import { Err, Ok, Result } from '@hqoss/monads';
import BN from 'bn.js';
import NEAR from 'near-api-js';
import { utils } from 'near-api-js';
import { bytesToHex } from './utils.js';

abstract class Assignable {
  encode(): Uint8Array {
    return NEAR.utils.serialize.serialize(SCHEMA, this);
  }
}

// Borsh-encoded parameters for the `begin_block` method.
export class BeginBlockArgs extends Assignable {
  constructor(
    public readonly hash: Uint8Array,
    public readonly coinbase: Uint8Array,
    public readonly timestamp: Uint8Array,
    public readonly number: Uint8Array,
    public readonly difficulty: Uint8Array,
    public readonly gaslimit: Uint8Array
  ) {
    super();
  }
}

// Borsh-encoded parameters for the `begin_chain` method.
export class BeginChainArgs extends Assignable {
  constructor(public chainID: Uint8Array) {
    super();
  }
}

export class SubmitResult {
  public readonly result: SubmitResultV1 | LegacyExecutionResult;

  constructor(result: SubmitResultV1 | LegacyExecutionResult) {
    this.result = result;
  }

  output(): Result<Uint8Array, ExecutionError> {
    switch (this.result.kind) {
      case 'SubmitResultV1':
        if (this.result.status.success) {
          return Ok(this.result.status.success.output);
        } else if (this.result.status.revert) {
          return Err(this.result.status.revert);
        } else if (this.result.status.outOfFund) {
          return Err(this.result.status.outOfFund);
        } else if (this.result.status.outOfGas) {
          return Err(this.result.status.outOfGas);
        } else if (this.result.status.outOfOffset) {
          return Err(this.result.status.outOfOffset);
        } else if (this.result.status.callTooDeep) {
          return Err(this.result.status.callTooDeep);
        } else {
          // Should be unreachable since one enum variant should be assigned
          return Err('LegacyStatusFalse');
        }
      case 'LegacyExecutionResult':
        if (this.result.status) {
          return Ok(this.result.output);
        } else {
          return Err('LegacyStatusFalse');
        }
    }
  }

  static decode(input: Buffer): SubmitResult {
    try {
      const v1 = SubmitResultV1.decode(input);
      return new SubmitResult(v1);
    } catch (error) {
      const legacy = LegacyExecutionResult.decode(input);
      return new SubmitResult(legacy);
    }
  }
}

export type LegacyStatusFalse = 'LegacyStatusFalse';
export type ExecutionError =
  | RevertStatus
  | OutOfGas
  | OutOfFund
  | OutOfOffset
  | CallTooDeep
  | LegacyStatusFalse;

export class SuccessStatus extends utils.enums.Assignable {
  public readonly output: Uint8Array;

  constructor(args: { output: Uint8Array }) {
    super(args);
    this.output = args.output;
  }
}

export class RevertStatus extends utils.enums.Assignable {
  public readonly output: Uint8Array;

  constructor(args: { output: Uint8Array }) {
    super(args);
    this.output = args.output;
  }
}

export class OutOfGas extends utils.enums.Assignable {}
export class OutOfFund extends utils.enums.Assignable {}
export class OutOfOffset extends utils.enums.Assignable {}
export class CallTooDeep extends utils.enums.Assignable {}

export class TransactionStatus extends utils.enums.Enum {
  public readonly success?: SuccessStatus;
  public readonly revert?: RevertStatus;
  public readonly outOfGas?: OutOfGas;
  public readonly outOfFund?: OutOfFund;
  public readonly outOfOffset?: OutOfOffset;
  public readonly callTooDeep?: CallTooDeep;
}

// New Borsh-encoded result from the `submit` method.
export class SubmitResultV1 extends Assignable {
  // discriminator to match on type in `SubmitResult`
  kind: 'SubmitResultV1' = 'SubmitResultV1';
  public readonly status: TransactionStatus;
  public readonly gasUsed: number | bigint;
  public readonly logs: LogEvent[];

  constructor(args: {
    status: TransactionStatus;
    gasUsed: number | bigint | BN;
    logs: LogEvent[];
  }) {
    super();
    this.status = args.status;
    this.gasUsed = BigInt(args.gasUsed.toString());
    this.logs = args.logs;
  }

  static decode(input: Buffer): SubmitResultV1 {
    return NEAR.utils.serialize.deserialize(SCHEMA, SubmitResultV1, input);
  }
}

// Old Borsh-encoded result from the `submit` method.
export class LegacyExecutionResult extends Assignable {
  // discriminator to match on type in `SubmitResult`
  kind: 'LegacyExecutionResult' = 'LegacyExecutionResult';
  public readonly status: boolean;
  public readonly gasUsed: number | bigint;
  public readonly output: Uint8Array;
  public readonly logs: LogEvent[];

  constructor(args: {
    status: boolean | number;
    gasUsed: number | bigint | BN;
    output: Uint8Array | number[];
    logs: LogEvent[];
  }) {
    super();
    this.status = Boolean(args.status);
    this.gasUsed = BigInt(args.gasUsed.toString());
    this.output = Buffer.from(args.output);
    this.logs = args.logs;
  }

  static decode(input: Buffer): LegacyExecutionResult {
    return NEAR.utils.serialize.deserialize(
      SCHEMA,
      LegacyExecutionResult,
      input
    );
  }
}

// Borsh-encoded parameters for the `call` method.
export class FunctionCallArgs extends Assignable {
  constructor(public contract: Uint8Array, public input: Uint8Array) {
    super();
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
  constructor(public address: Uint8Array, public key: Uint8Array) {
    super();
  }
}

// Borsh-encoded log for use in a `ExecutionResult`.
export class LogEvent extends Assignable {
  public readonly topics: RawU256[];
  public readonly data: Uint8Array;

  constructor(args: { topics: RawU256[]; data: Uint8Array | number[] }) {
    super();
    this.topics = args.topics;
    this.data = Buffer.from(args.data);
  }
}

// Borsh-encoded parameters for the `meta_call` method.
export class MetaCallArgs extends Assignable {
  constructor(
    public readonly signature: Uint8Array,
    public readonly v: number,
    public readonly nonce: Uint8Array,
    public readonly feeAmount: Uint8Array,
    public readonly feeAddress: Uint8Array,
    public readonly contractAddress: Uint8Array,
    public readonly value: Uint8Array,
    public readonly methodDef: string,
    public readonly args: Uint8Array
  ) {
    super();
  }
}

// Borsh-encoded parameters for the `new` method.
export class NewCallArgs extends Assignable {
  constructor(
    public readonly chainID: Uint8Array,
    public readonly ownerID: string,
    public readonly bridgeProverID: string,
    public readonly upgradeDelayBlocks: number | BN
  ) {
    super();
  }
}

// Borsh-encoded parameters for the `new_eth_connector` method.
export class InitCallArgs extends Assignable {
  constructor(
    public readonly prover_account: string,
    public readonly eth_custodian_address: string
  ) {
    super();
  }
}

// Borsh-encoded U256 integer.
export class RawU256 extends Assignable {
  public readonly value: Uint8Array;

  constructor(args?: Uint8Array | { value: Uint8Array | number[] }) {
    super();
    if (!args) {
      this.value = Buffer.alloc(32);
    } else {
      const bytes = Buffer.from(args instanceof Uint8Array ? args : args.value);
      //assert(bytes.length == 32); // TODO
      this.value = bytes;
    }
  }

  toBytes(): Uint8Array {
    return this.value;
  }

  toString(): string {
    return bytesToHex(this.value);
  }
}

// Borsh-encoded parameters for the `view` method.
export class ViewCallArgs extends Assignable {
  constructor(
    public readonly sender: Uint8Array,
    public readonly address: Uint8Array,
    public readonly amount: Uint8Array,
    public readonly input: Uint8Array
  ) {
    super();
  }
}

// eslint-disable-next-line @typescript-eslint/ban-types
const SCHEMA = new Map<Function, any>([
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
