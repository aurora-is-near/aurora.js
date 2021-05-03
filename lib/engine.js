/* This is free and unencumbered software released into the public domain. */
import { AccountID, Address } from './account.js';
import { BlockProxy, parseBlockID, } from './block.js';
import { NETWORKS } from './config.js';
import { KeyStore } from './key_store.js';
import { Err, Ok } from './prelude.js';
import { FunctionCallArgs, GetStorageAtArgs, NewCallArgs, ViewCallArgs, } from './schema.js';
import { TransactionID } from './transaction.js';
import { defaultAbiCoder } from '@ethersproject/abi';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import NEAR from 'near-api-js';
export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';
export class AddressState {
    constructor(address, nonce = BigInt(0), balance = BigInt(0), code, storage = new Map()) {
        this.address = address;
        this.nonce = nonce;
        this.balance = balance;
        this.code = code;
        this.storage = storage;
    }
}
export var EngineStorageKeyPrefix;
(function (EngineStorageKeyPrefix) {
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Config"] = 0] = "Config";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Nonce"] = 1] = "Nonce";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Balance"] = 2] = "Balance";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Code"] = 3] = "Code";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Storage"] = 4] = "Storage";
})(EngineStorageKeyPrefix || (EngineStorageKeyPrefix = {}));
export class EngineState {
    constructor(storage = new Map()) {
        this.storage = storage;
    }
}
const DEFAULT_NETWORK_ID = 'local';
export class Engine {
    constructor(near, keyStore, signer, networkID, contractID) {
        this.near = near;
        this.keyStore = keyStore;
        this.signer = signer;
        this.networkID = networkID;
        this.contractID = contractID;
    }
    static async connect(options, env) {
        const networkID = options.network || (env && env.NEAR_ENV) || DEFAULT_NETWORK_ID;
        const network = NETWORKS.get(networkID); // TODO: error handling
        const contractID = AccountID.parse(options.contract || (env && env.AURORA_ENGINE) || network.contractID).unwrap();
        const signerID = AccountID.parse(options.signer || (env && env.NEAR_MASTER_ACCOUNT)).unwrap(); // TODO: error handling
        const keyStore = KeyStore.load(networkID, env);
        const near = new NEAR.Near({
            deps: { keyStore },
            networkId: networkID,
            nodeUrl: options.endpoint || (env && env.NEAR_URL) || network.nearEndpoint,
        });
        const signer = await near.account(signerID.toString());
        return new Engine(near, keyStore, signer, networkID, contractID);
    }
    async install(contractCode) {
        const contractAccount = (await this.getAccount()).unwrap();
        const result = await contractAccount.deployContract(contractCode);
        return Ok(TransactionID.fromHex(result.transaction.hash));
    }
    async upgrade(contractCode) {
        return await this.install(contractCode);
    }
    async initialize(options) {
        const args = new NewCallArgs(parseHexString(defaultAbiCoder.encode(['uint256'], [options.chain || 0])), options.owner || '', options.bridgeProver || '', new BN(options.upgradeDelay || 0));
        return (await this.callMutativeFunction('new', args.encode())).map(({ id }) => id);
    }
    async getAccount() {
        return Ok(await this.near.account(this.contractID.toString()));
    }
    async getBlockHash() {
        const contractAccount = (await this.getAccount()).unwrap();
        const state = (await contractAccount.state());
        return Ok(state.block_hash);
    }
    async getBlockHeight() {
        const contractAccount = (await this.getAccount()).unwrap();
        const state = (await contractAccount.state());
        return Ok(state.block_height);
    }
    async getBlockInfo() {
        return Ok({
            hash: '',
            coinbase: Address.zero(),
            timestamp: 0,
            number: 0,
            difficulty: 0,
            gasLimit: 0,
        });
    }
    async getBlockTransactionCount(blockID) {
        try {
            const provider = this.near.connection.provider;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const block = (await provider.block(parseBlockID(blockID)));
            const requests = block.chunks.map(async (chunkHeader) => {
                if (chunkHeader.tx_root == '11111111111111111111111111111111') {
                    return 0; // no transactions in this chunk
                }
                else {
                    const chunk = await provider.chunk(chunkHeader.chunk_hash);
                    return chunk.transactions.length;
                }
            });
            const counts = (await Promise.all(requests));
            return Ok(counts.reduce((a, b) => a + b, 0));
        }
        catch (error) {
            //console.error('Engine#getBlockTransactionCount', error);
            return Err(error.message);
        }
    }
    async getBlock(blockID, options) {
        const provider = this.near.connection.provider;
        return await BlockProxy.fetch(provider, blockID, options);
    }
    async hasBlock(blockID) {
        const provider = this.near.connection.provider;
        return await BlockProxy.lookup(provider, blockID);
    }
    async getCoinbase() {
        return Ok(Address.zero()); // TODO
    }
    async getVersion(options) {
        return (await this.callFunction('get_version', undefined, options)).map((output) => output.toString());
    }
    async getOwner(options) {
        return (await this.callFunction('get_owner', undefined, options)).andThen((output) => AccountID.parse(output.toString()));
    }
    async getBridgeProvider(options) {
        return (await this.callFunction('get_bridge_provider', undefined, options)).andThen((output) => AccountID.parse(output.toString()));
    }
    async getChainID(options) {
        const result = await this.callFunction('get_chain_id', undefined, options);
        return result.map(toBigIntBE);
    }
    // TODO: getUpgradeIndex()
    // TODO: stageUpgrade()
    // TODO: deployUpgrade()
    async deployCode(bytecode) {
        const args = parseHexString(bytecode);
        const result = await this.callMutativeFunction('deploy_code', args);
        return result.map(({ output }) => Address.parse(Buffer.from(output).toString('hex')).unwrap());
    }
    async call(contract, input) {
        const args = new FunctionCallArgs(contract.toBytes(), this.prepareInput(input));
        return (await this.callMutativeFunction('call', args.encode())).map(({ output }) => output);
    }
    async rawCall(input) {
        const args = this.prepareInput(input);
        return (await this.callMutativeFunction('raw_call', args)).map(({ output }) => output);
    }
    // TODO: metaCall()
    async view(sender, address, amount, input, options) {
        const args = new ViewCallArgs(sender.toBytes(), address.toBytes(), toBufferBE(BigInt(amount), 32), this.prepareInput(input));
        return await this.callFunction('view', args.encode(), options);
    }
    async getCode(address, options) {
        const args = address.toBytes();
        return await this.callFunction('get_code', args, options);
    }
    async getBalance(address, options) {
        const args = address.toBytes();
        const result = await this.callFunction('get_balance', args, options);
        return result.map(toBigIntBE);
    }
    async getNonce(address, options) {
        const args = address.toBytes();
        const result = await this.callFunction('get_nonce', args, options);
        return result.map(toBigIntBE);
    }
    async getStorageAt(address, key, options) {
        const args = new GetStorageAtArgs(address.toBytes(), parseHexString(defaultAbiCoder.encode(['uint256'], [key])));
        const result = await this.callFunction('get_storage_at', args.encode(), options);
        return result.map(toBigIntBE);
    }
    // TODO: beginChain()
    // TODO: beginBlock()
    async getStorage() {
        const result = new Map();
        const contractAccount = (await this.getAccount()).unwrap();
        const records = await contractAccount.viewState('', { finality: 'final' });
        for (const record of records) {
            const record_type = record.key[0];
            if (record_type == EngineStorageKeyPrefix.Config)
                continue; // skip EVM metadata
            const key = record_type == EngineStorageKeyPrefix.Storage
                ? record.key.subarray(1, 21)
                : record.key.subarray(1);
            const address = Buffer.from(key).toString('hex');
            if (!result.has(address)) {
                result.set(address, new AddressState(Address.parse(address).unwrap()));
            }
            const state = result.get(address);
            switch (record_type) {
                case EngineStorageKeyPrefix.Config:
                    break; // unreachable
                case EngineStorageKeyPrefix.Nonce:
                    state.nonce = toBigIntBE(record.value);
                    break;
                case EngineStorageKeyPrefix.Balance:
                    state.balance = toBigIntBE(record.value);
                    break;
                case EngineStorageKeyPrefix.Code:
                    state.code = record.value;
                    break;
                case EngineStorageKeyPrefix.Storage: {
                    state.storage.set(toBigIntBE(record.key.subarray(21)), toBigIntBE(record.value));
                    break;
                }
            }
        }
        return Ok(result);
    }
    async callFunction(methodName, args, options) {
        const result = await this.signer.connection.provider.query({
            request_type: 'call_function',
            account_id: this.contractID.toString(),
            method_name: methodName,
            args_base64: this.prepareInput(args).toString('base64'),
            finality: options?.block === undefined || options?.block === null
                ? 'final'
                : undefined,
            block_id: options?.block !== undefined && options?.block !== null
                ? options.block
                : undefined,
        });
        if (result.logs && result.logs.length > 0)
            console.debug(result.logs); // TODO
        return Ok(Buffer.from(result.result));
    }
    async callMutativeFunction(methodName, args) {
        const gas = new BN('300000000000000');
        const result = await this.signer.functionCall(this.contractID.toString(), methodName, this.prepareInput(args), gas);
        if (typeof result.status === 'object' &&
            typeof result.status.SuccessValue === 'string') {
            return Ok({
                id: TransactionID.fromHex(result.transaction.hash),
                output: Buffer.from(result.status.SuccessValue, 'base64'),
            });
        }
        return Err(result.toString()); // TODO
    }
    prepareInput(args) {
        if (typeof args === 'undefined')
            return Buffer.alloc(0);
        if (typeof args === 'string')
            return Buffer.from(parseHexString(args));
        return Buffer.from(args);
    }
}
