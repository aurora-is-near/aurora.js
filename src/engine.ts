/* This is free and unencumbered software released into the public domain. */

import { AccountID, Address } from './account.js';
import { NETWORKS } from './config.js';
import { FunctionCallArgs, GetStorageAtArgs, NewCallArgs, ViewCallArgs } from './schema.js';
import { KeyStore } from './key_store.js';

import { defaultAbiCoder } from '@ethersproject/abi';
import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { Result, Ok, Err } from '@hqoss/monads';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import NEAR from 'near-api-js';

export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';

export type Amount = bigint | number;
export type BlockHash = string;
export type BlockHeight = number;
export type BlockID = BlockHeight | BlockHash;
export type Bytecode = Uint8Array;
export type Bytecodeish = Bytecode | string;
export type ChainID = bigint;
export type Error = string;
export type Quantity = bigint;
export type TransactionID = string;
export type U256 = bigint;

export interface TransactionOutcome {
  id: TransactionID;
  output: Uint8Array;
}

export interface BlockInfo {
  hash: BlockHash;
  coinbase: Address;
  timestamp: number;
  number: BlockHeight;
  difficulty: number;
  gasLimit: Amount;
}

export interface ConnectOptions {
  network?: string;              // network ID
  endpoint?: string;             // endpoint URL
  contract?: string;             // engine ID
  signer?: string;               // signer ID
}

export interface ConnectEnv {
  AURORA_ENGINE?: string;        // engine ID
  HOME?: string;                 // home directory
  NEAR_ENV?: string;             // network ID
  NEAR_MASTER_ACCOUNT?: string;  // signer ID
  NEAR_URL?: string;             // endpoint URL
}

export type AddressStorage = Map<U256, U256>;

export class AddressState {
  constructor(
    public address: Address,
    public nonce: U256 = BigInt(0),
    public balance: Amount = BigInt(0),
    public code?: Bytecode,
    public storage: AddressStorage = new Map()) {}
}

export const enum EngineStorageKeyPrefix {
  Config = 0x0,
  Nonce = 0x1,
  Balance = 0x2,
  Code = 0x3,
  Storage = 0x4,
}

export type EngineStorage = Map<Address, AddressState>;

export class EngineState {
  constructor(
    public storage: EngineStorage = new Map()) {}
}

const DEFAULT_NETWORK_ID = 'local';

export class Engine {

  protected constructor(
    public readonly near: NEAR.Near,
    public readonly keyStore: KeyStore,
    public readonly signer: NEAR.Account,
    public readonly networkID: string,
    public readonly contractID: AccountID) {}

  static async connect(options: ConnectOptions, env?: ConnectEnv): Promise<Engine> {
    const networkID = options.network || env && env.NEAR_ENV || DEFAULT_NETWORK_ID;
    const network = NETWORKS.get(networkID)!; // TODO: error handling
    const contractID = options.contract || env && env.AURORA_ENGINE || network.contractID;
    const signerID = options.signer || env && env.NEAR_MASTER_ACCOUNT; // TODO: error handling

    const keyStore = KeyStore.load(networkID, env);
    const near = new NEAR.Near({
      deps: { keyStore },
      networkId: networkID,
      nodeUrl: options.endpoint || env && env.NEAR_URL || network.nearEndpoint,
    });
    const signer = await near.account(signerID!);
    return new Engine(near, keyStore, signer, networkID, contractID);
  }

  async install(contractCode: Bytecode): Promise<Result<TransactionID, Error>> {
    const contractAccount = (await this.getAccount()).unwrap();
    const result = await contractAccount.deployContract(contractCode);
    return Ok(result.transaction.hash);
  }

  async upgrade(contractCode: Bytecode): Promise<Result<TransactionID, Error>> {
    return await this.install(contractCode);
  }

  async initialize(options: any): Promise<Result<TransactionID, Error>> {
    const args = new NewCallArgs(
      parseHexString(defaultAbiCoder.encode(['uint256'], [options.chain || 0])),
      options.owner || '',
      options.bridgeProver || '',
      new BN(options.upgradeDelay || 0)
    );
    return (await this.callMutativeFunction('new', args.encode())).map(({ id }) => id);
  }

  async getAccount(): Promise<Result<NEAR.Account, Error>> {
    return Ok(await this.near.account(this.contractID));
  }

  async getBlockHash(): Promise<Result<BlockHash, Error>> {
    const contractAccount = (await this.getAccount()).unwrap();
    const state = await contractAccount.state() as any;
    return Ok(state.block_hash);
  }

  async getBlockHeight(): Promise<Result<BlockHeight, Error>> {
    const contractAccount = (await this.getAccount()).unwrap();
    const state = await contractAccount.state() as any;
    return Ok(state.block_height);
  }

  async getBlockInfo(): Promise<Result<BlockInfo, Error>> {
    return Ok({
      hash: '', // TODO
      coinbase: '0x0000000000000000000000000000000000000000', // TODO
      timestamp: 0,
      number: 0,
      difficulty: 0,
      gasLimit: 0,
    });
  }

  async getBlockTransactionCount(blockID: BlockID): Promise<Result<number, Error>> {
    try {
      const provider = this.near.connection.provider;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const block = (await provider.block({blockId: blockID})) as any;
      const requests = block.chunks.map(async (chunkHeader: any) => {
        if (chunkHeader.tx_root == '11111111111111111111111111111111') {
          return 0; // no transactions in this chunk
        }
        else {
          const chunk = await provider.chunk(chunkHeader.chunk_hash);
          return chunk.transactions.length;
        }
      });
      const counts = (await Promise.all(requests)) as number[];
      return Ok(counts.reduce((a, b) => a + b, 0));
    } catch (error) {
      //console.error('getBlockTransactionCount', error);
      return Err(error.message);
    }
  }

  async getCoinbase(): Promise<Result<Address, Error>> {
    return Ok('0x0000000000000000000000000000000000000000'); // TODO
  }

  async getVersion(): Promise<Result<string, Error>> {
    return (await this.callFunction('get_version')).map(output => output.toString());
  }

  async getOwner(): Promise<Result<AccountID, Error>> {
    return (await this.callFunction('get_owner')).map(output => output.toString());
  }

  async getBridgeProvider(): Promise<Result<AccountID, Error>> {
    return (await this.callFunction('get_bridge_provider')).map(output => output.toString());
  }

  async getChainID(): Promise<Result<ChainID, Error>> {
    const result = await this.callFunction('get_chain_id');
    return result.map(toBigIntBE);
  }

  // TODO: getUpgradeIndex()
  // TODO: stageUpgrade()
  // TODO: deployUpgrade()

  async deployCode(bytecode: Bytecodeish): Promise<Result<Address, Error>> {
    const args = parseHexString(bytecode);
    const result = await this.callMutativeFunction('deploy_code', args);
    return result.map(({ output }) => parseAddress(Buffer.from(output).toString('hex')));
  }

  async call(contract: Address, input: Uint8Array | string): Promise<Result<Uint8Array, Error>> {
    const args = new FunctionCallArgs(
      parseHexString(parseAddress(contract)),
      this.prepareInput(input),
    );
    return (await this.callMutativeFunction('call', args.encode())).map(({ output }) => output);
  }

  // TODO: rawCall()
  // TODO: metaCall()

  async view(sender: Address, address: Address, amount: Amount, input: Uint8Array | string): Promise<Result<Uint8Array, Error>> {
    const args = new ViewCallArgs(
      parseHexString(parseAddress(sender)),
      parseHexString(parseAddress(address)),
      toBufferBE(BigInt(amount), 32),
      this.prepareInput(input),
    );
    return await this.callFunction('view', args.encode());
  }

  async getCode(address: Address): Promise<Result<Bytecode, Error>> {
    const args = parseHexString(parseAddress(address));
    return await this.callFunction('get_code', args);
  }

  async getBalance(address: Address): Promise<Result<U256, Error>> {
    const args = parseHexString(parseAddress(address));
    const result = await this.callFunction('get_balance', args);
    return result.map(toBigIntBE);
  }

  async getNonce(address: Address): Promise<Result<U256, Error>> {
    const args = parseHexString(parseAddress(address));
    const result = await this.callFunction('get_nonce', args);
    return result.map(toBigIntBE);
  }

  async getStorageAt(address: Address, key: U256 | number | string): Promise<Result<U256, Error>> {
    const args = new GetStorageAtArgs(
      parseHexString(parseAddress(address)),
      parseHexString(defaultAbiCoder.encode(['uint256'], [key])),
    );
    const result = await this.callFunction('get_storage_at', args.encode());
    return result.map(toBigIntBE);
  }

  // TODO: beginChain()
  // TODO: beginBlock()

  async getStorage(): Promise<Result<EngineStorage, Error>> {
    const result = new Map();
    const contractAccount = (await this.getAccount()).unwrap();
    const records = await contractAccount.viewState('', { finality: 'final' });
    for (const record of records) {
      const record_type = record.key[0];
      if (record_type == EngineStorageKeyPrefix.Config) continue; // skip EVM metadata

      const key = (record_type == EngineStorageKeyPrefix.Storage) ?
        record.key.subarray(1, 21) : record.key.subarray(1);
      const address = Buffer.from(key).toString('hex');

      if (!result.has(address))  {
        result.set(address, new AddressState(parseAddress(address)));
      }

      const state = result.get(address)!;
      switch (record_type) {
        case EngineStorageKeyPrefix.Config: break; // unreachable
        case EngineStorageKeyPrefix.Nonce: state.nonce = toBigIntBE(record.value); break;
        case EngineStorageKeyPrefix.Balance: state.balance = toBigIntBE(record.value); break;
        case EngineStorageKeyPrefix.Code: state.code = record.value; break;
        case EngineStorageKeyPrefix.Storage: {
          state.storage.set(toBigIntBE(record.key.subarray(21)), toBigIntBE(record.value));
          break;
        }
      }
    }
    return Ok(result);
  }

  protected async callFunction(methodName: string, args?: Uint8Array): Promise<Result<Buffer, Error>> {
    const result = await this.signer.connection.provider.query({
      request_type: 'call_function',
      account_id: this.contractID,
      method_name: methodName,
      args_base64: this.prepareInput(args).toString('base64'),
      finality: 'optimistic',
    });
    if (result.logs && result.logs.length > 0)
      console.debug(result.logs); // TODO
    return Ok(Buffer.from(result.result));
  }

  protected async callMutativeFunction(methodName: string, args?: Uint8Array): Promise<Result<TransactionOutcome, Error>> {
    const result = await this.signer.functionCall(this.contractID, methodName, this.prepareInput(args));
    if (typeof result.status === 'object' && typeof result.status.SuccessValue === 'string') {
      return Ok({ id: result.transaction.hash, output: Buffer.from(result.status.SuccessValue, 'base64') });
    }
    return Err(result.toString()); // TODO
  }

  private prepareInput(args?: Uint8Array | string): Buffer {
    if (typeof args === 'undefined')
      return Buffer.alloc(0);
    if (typeof args === 'string')
      return Buffer.from(parseHexString(args as string));
    return Buffer.from(args);
  }
}

export function formatU256(value: U256): string {
  return `0x${toBufferBE(value, 32).toString('hex')}`;
}
