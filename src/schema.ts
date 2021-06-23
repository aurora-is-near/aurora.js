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

// Borsh-encoded result from the `submit` method.
export class ExecutionResult extends Assignable {
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
