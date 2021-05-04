/* This is free and unencumbered software released into the public domain. */

import BN from 'bn.js';
import NEAR from 'near-api-js';
import { bytesToHex } from './utils.js';

abstract class Assignable {
  encode(): Uint8Array {
    return NEAR.utils.serialize.serialize(SCHEMA, this);
  }
}

// Borsh-encoded parameters for the `begin_block` method.
export class BeginBlockArgs extends Assignable {
  constructor(
    public hash: Uint8Array,
    public coinbase: Uint8Array,
    public timestamp: Uint8Array,
    public number: Uint8Array,
    public difficulty: Uint8Array,
    public gaslimit: Uint8Array
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

// Borsh-encoded result from the `submit` method.
export class ExecutionResult extends Assignable {
  public status: boolean;
  public gasUsed: number | bigint;
  public output: Uint8Array;
  public logs: LogEvent[];

  constructor(args: {
    status: boolean | number;
    gasUsed: number | bigint | BN;
    output: Uint8Array;
    logs: LogEvent[];
  }) {
    super();
    this.status = !!args.status;
    this.gasUsed = BigInt(args.gasUsed.toString());
    this.output = args.output;
    this.logs = args.logs;
  }

  static decode(input: Buffer): ExecutionResult {
    return NEAR.utils.serialize.deserialize(SCHEMA, ExecutionResult, input);
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
  topics: RawU256[];
  data: Uint8Array;

  constructor(args: { topics: RawU256[]; data: Uint8Array }) {
    super();
    this.topics = args.topics;
    this.data = args.data;
  }
}

// Borsh-encoded parameters for the `meta_call` method.
export class MetaCallArgs extends Assignable {
  constructor(
    public signature: Uint8Array,
    public v: number,
    public nonce: Uint8Array,
    public feeAmount: Uint8Array,
    public feeAddress: Uint8Array,
    public contractAddress: Uint8Array,
    public value: Uint8Array,
    public methodDef: string,
    public args: Uint8Array
  ) {
    super();
  }
}

// Borsh-encoded parameters for the `new` method.
export class NewCallArgs extends Assignable {
  constructor(
    public chainID: Uint8Array,
    public ownerID: string,
    public bridgeProverID: string,
    public upgradeDelayBlocks: number | BN
  ) {
    super();
  }
}

// Borsh-encoded U256 integer.
export class RawU256 extends Assignable {
  public value: Uint8Array;

  constructor(args: { value: Uint8Array }) {
    super();
    this.value = args.value;
  }

  toString(): string {
    return `RawU256(${bytesToHex(this.value)})`;
  }
}

// Borsh-encoded parameters for the `view` method.
export class ViewCallArgs extends Assignable {
  constructor(
    public sender: Uint8Array,
    public address: Uint8Array,
    public amount: Uint8Array,
    public input: Uint8Array
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
    ExecutionResult,
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
