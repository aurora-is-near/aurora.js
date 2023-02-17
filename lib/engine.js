"use strict";
/* This is free and unencumbered software released into the public domain. */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Engine = exports.EngineState = exports.EngineStorageKeyPrefix = exports.AddressState = exports.parseHexString = exports.parseAddress = void 0;
const account_js_1 = require("./account.js");
const block_js_1 = require("./block.js");
const config_js_1 = require("./config.js");
const key_store_js_1 = require("./key_store.js");
const prelude_js_1 = require("./prelude.js");
const schema_js_1 = require("./schema.js");
const transaction_js_1 = require("./transaction.js");
const utils_js_1 = require("./utils.js");
const abi_1 = require("@ethersproject/abi");
const bytes_1 = require("@ethersproject/bytes");
const transactions_1 = require("@ethersproject/transactions");
const bigint_buffer_1 = require("bigint-buffer");
const buffer_1 = require("buffer");
const bn_js_1 = __importDefault(require("bn.js"));
const NEAR = __importStar(require("near-api-js"));
var address_1 = require("@ethersproject/address");
Object.defineProperty(exports, "parseAddress", { enumerable: true, get: function () { return address_1.getAddress; } });
var bytes_2 = require("@ethersproject/bytes");
Object.defineProperty(exports, "parseHexString", { enumerable: true, get: function () { return bytes_2.arrayify; } });
class AddressState {
    constructor(address, nonce = BigInt(0), balance = BigInt(0), code, storage = new Map()) {
        this.address = address;
        this.nonce = nonce;
        this.balance = balance;
        this.code = code;
        this.storage = storage;
    }
}
exports.AddressState = AddressState;
var EngineStorageKeyPrefix;
(function (EngineStorageKeyPrefix) {
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Config"] = 0] = "Config";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Nonce"] = 1] = "Nonce";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Balance"] = 2] = "Balance";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Code"] = 3] = "Code";
    EngineStorageKeyPrefix[EngineStorageKeyPrefix["Storage"] = 4] = "Storage";
})(EngineStorageKeyPrefix = exports.EngineStorageKeyPrefix || (exports.EngineStorageKeyPrefix = {}));
class EngineState {
    constructor(storage = new Map()) {
        this.storage = storage;
    }
}
exports.EngineState = EngineState;
const DEFAULT_NETWORK_ID = 'local';
class Engine {
    constructor(near, keyStore, signer, networkID, contractID) {
        this.near = near;
        this.keyStore = keyStore;
        this.signer = signer;
        this.networkID = networkID;
        this.contractID = contractID;
    }
    static async connect(options, env) {
        const networkID = options.network || (env && env.NEAR_ENV) || DEFAULT_NETWORK_ID;
        const network = config_js_1.NETWORKS.get(networkID); // TODO: error handling
        const contractID = account_js_1.AccountID.parse(options.contract || (env && env.AURORA_ENGINE) || network.contractID).unwrap();
        const signerID = account_js_1.AccountID.parse(options.signer || (env && env.NEAR_MASTER_ACCOUNT)).unwrap(); // TODO: error handling
        const keyStore = key_store_js_1.KeyStore.load(networkID, env);
        const near = new NEAR.Near({
            headers: {},
            keyStore,
            networkId: networkID,
            nodeUrl: options.endpoint || (env && env.NEAR_URL) || network.nearEndpoint,
        });
        const signer = await near.account(signerID.toString());
        return new Engine(near, keyStore, signer, networkID, contractID);
    }
    async install(contractCode) {
        const contractAccount = (await this.getAccount()).unwrap();
        const result = await contractAccount.deployContract(contractCode);
        return (0, prelude_js_1.Ok)(transaction_js_1.TransactionID.fromHex(result.transaction.hash));
    }
    async upgrade(contractCode) {
        return await this.install(contractCode);
    }
    async initialize(options) {
        const newArgs = new schema_js_1.NewCallArgs((0, bytes_1.arrayify)(abi_1.defaultAbiCoder.encode(['uint256'], [options.chain || 0])), options.owner || '', options.bridgeProver || '', new bn_js_1.default(options.upgradeDelay || 0));
        const default_ft_metadata = schema_js_1.FungibleTokenMetadata.default();
        const given_ft_metadata = options.metadata || default_ft_metadata;
        const ft_metadata = new schema_js_1.FungibleTokenMetadata(given_ft_metadata.spec || default_ft_metadata.spec, given_ft_metadata.name || default_ft_metadata.name, given_ft_metadata.symbol || default_ft_metadata.symbol, given_ft_metadata.icon || default_ft_metadata.icon, given_ft_metadata.reference || default_ft_metadata.reference, given_ft_metadata.reference_hash || default_ft_metadata.reference_hash, given_ft_metadata.decimals || default_ft_metadata.decimals);
        // default values are the testnet values
        const connectorArgs = new schema_js_1.InitCallArgs(options.prover || 'prover.ropsten.testnet', options.ethCustodian || '9006a6D7d08A388Eeea0112cc1b6b6B15a4289AF', ft_metadata);
        // TODO: this should be able to be a single transaction with multiple actions,
        // but there doesn't seem to be a good way to do that in `near-api-js` presently.
        const tx = await this.promiseAndThen(this.callMutativeFunction('new', newArgs.encode()), (_) => this.callMutativeFunction('new_eth_connector', connectorArgs.encode()));
        return tx.map(({ id }) => id);
    }
    // Like Result.andThen, but wrapped up in Promises
    async promiseAndThen(p, f) {
        const r = await p;
        if (r.isOk()) {
            const t = r.unwrap();
            return await f(t);
        }
        else {
            return (0, prelude_js_1.Err)(r.unwrapErr());
        }
    }
    async getAccount() {
        return (0, prelude_js_1.Ok)(await this.near.account(this.contractID.toString()));
    }
    async getBlockHash() {
        const contractAccount = (await this.getAccount()).unwrap();
        const state = (await contractAccount.state());
        return (0, prelude_js_1.Ok)(state.block_hash);
    }
    async getBlockHeight() {
        const contractAccount = (await this.getAccount()).unwrap();
        const state = (await contractAccount.state());
        return (0, prelude_js_1.Ok)(state.block_height);
    }
    async getBlockInfo() {
        return (0, prelude_js_1.Ok)({
            hash: '',
            coinbase: account_js_1.Address.zero(),
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
            const block = (await provider.block((0, block_js_1.parseBlockID)(blockID)));
            const chunk_mask = block.header.chunk_mask;
            const requests = block.chunks
                .filter((_, index) => chunk_mask[index])
                .map(async (chunkHeader) => {
                if (chunkHeader.tx_root == '11111111111111111111111111111111') {
                    return 0; // no transactions in this chunk
                }
                else {
                    const chunk = await provider.chunk(chunkHeader.chunk_hash);
                    return chunk.transactions.length;
                }
            });
            const counts = (await Promise.all(requests));
            return (0, prelude_js_1.Ok)(counts.reduce((a, b) => a + b, 0));
        }
        catch (error) {
            //console.error('Engine#getBlockTransactionCount', error);
            return (0, prelude_js_1.Err)(error.message);
        }
    }
    async getBlock(blockID, options) {
        const provider = this.near.connection.provider;
        return await block_js_1.BlockProxy.fetch(provider, blockID, options);
    }
    async hasBlock(blockID) {
        const provider = this.near.connection.provider;
        return await block_js_1.BlockProxy.lookup(provider, blockID);
    }
    async getCoinbase() {
        return (0, prelude_js_1.Ok)(account_js_1.Address.zero()); // TODO
    }
    async getVersion(options) {
        return (await this.callFunction('get_version', undefined, options)).map((output) => output.toString());
    }
    async getOwner(options) {
        return (await this.callFunction('get_owner', undefined, options)).andThen((output) => account_js_1.AccountID.parse(output.toString()));
    }
    async getBridgeProver(options) {
        return (await this.callFunction('get_bridge_prover', undefined, options)).andThen((output) => account_js_1.AccountID.parse(output.toString()));
    }
    async getChainID(options) {
        const result = await this.callFunction('get_chain_id', undefined, options);
        return result.map(bigint_buffer_1.toBigIntBE);
    }
    // TODO: getUpgradeIndex()
    // TODO: stageUpgrade()
    // TODO: deployUpgrade()
    async deployCode(bytecode) {
        const args = (0, bytes_1.arrayify)(bytecode);
        const outcome = await this.callMutativeFunction('deploy_code', args);
        return outcome.map(({ output }) => {
            const result = schema_js_1.SubmitResult.decode(buffer_1.Buffer.from(output));
            return account_js_1.Address.parse(buffer_1.Buffer.from(result.output().unwrap()).toString('hex')).unwrap();
        });
    }
    async call(contract, input, value) {
        const inner_args = new schema_js_1.FunctionCallArgsV2({
            contract: contract.toBytes(),
            value: this.prepareAmount(value),
            input: this.prepareInput(input),
        });
        const args = new schema_js_1.CallArgs({ functionCallArgsV2: inner_args });
        return (await this.callMutativeFunction('call', args.encode())).map(({ output }) => output);
    }
    async submit(input) {
        try {
            const inputBytes = this.prepareInput(input);
            try {
                const rawTransaction = (0, transactions_1.parse)(inputBytes); // throws Error
                if (rawTransaction.gasLimit.toBigInt() < 21000n) {
                    // See: https://github.com/aurora-is-near/aurora-relayer/issues/17
                    return (0, prelude_js_1.Err)('ERR_INTRINSIC_GAS');
                }
            }
            catch (error) {
                //console.error(error); // DEBUG
                return (0, prelude_js_1.Err)('ERR_INVALID_TX');
            }
            return (await this.callMutativeFunction('submit', inputBytes)).map(({ output, gasBurned, tx }) => {
                return new schema_js_1.WrappedSubmitResult(schema_js_1.SubmitResult.decode(buffer_1.Buffer.from(output)), gasBurned, tx);
            });
        }
        catch (error) {
            //console.error(error); // DEBUG
            return (0, prelude_js_1.Err)(error.message);
        }
    }
    // TODO: metaCall()
    async view(sender, address, amount, input, options) {
        const args = new schema_js_1.ViewCallArgs(sender.toBytes(), address.toBytes(), (0, bigint_buffer_1.toBufferBE)(BigInt(amount), 32), this.prepareInput(input));
        const result = await this.callFunction('view', args.encode(), options);
        return result.map((output) => {
            const status = schema_js_1.TransactionStatus.decode(output);
            if (status.success !== undefined)
                return status.success.output;
            else if (status.revert !== undefined)
                return status.revert.output;
            else if (status.outOfGas !== undefined)
                return (0, prelude_js_1.Err)(status.outOfGas);
            else if (status.outOfFund !== undefined)
                return (0, prelude_js_1.Err)(status.outOfFund);
            else if (status.outOfOffset !== undefined)
                return (0, prelude_js_1.Err)(status.outOfOffset);
            else if (status.callTooDeep !== undefined)
                return (0, prelude_js_1.Err)(status.callTooDeep);
            else
                return (0, prelude_js_1.Err)('Failed to retrieve data from the contract');
        });
    }
    async getCode(address, options) {
        const args = address.toBytes();
        if (typeof options === 'object' && options.block) {
            options.block = (options.block + 1);
        }
        return await this.callFunction('get_code', args, options);
    }
    async getBalance(address, options) {
        const args = address.toBytes();
        const result = await this.callFunction('get_balance', args, options);
        return result.map(bigint_buffer_1.toBigIntBE);
    }
    async getNonce(address, options) {
        const args = address.toBytes();
        const result = await this.callFunction('get_nonce', args, options);
        return result.map(bigint_buffer_1.toBigIntBE);
    }
    async getStorageAt(address, key, options) {
        const args = new schema_js_1.GetStorageAtArgs(address.toBytes(), (0, bytes_1.arrayify)(abi_1.defaultAbiCoder.encode(['uint256'], [key])));
        const result = await this.callFunction('get_storage_at', args.encode(), options);
        return result.map(bigint_buffer_1.toBigIntBE);
    }
    async getAuroraErc20Address(nep141, options) {
        const args = new schema_js_1.GetErc20FromNep141CallArgs(buffer_1.Buffer.from(nep141.id, 'utf-8'));
        const result = await this.callFunction('get_erc20_from_nep141', args.encode(), options);
        return result.map((output) => {
            return account_js_1.Address.parse(output.toString('hex')).unwrap();
        });
    }
    async getNEP141Account(erc20, options) {
        const args = erc20.toBytes();
        const result = await this.callFunction('get_nep141_from_erc20', args, options);
        return result.map((output) => {
            return account_js_1.AccountID.parse(output.toString('utf-8')).unwrap();
        });
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
            const address = buffer_1.Buffer.from(key).toString('hex');
            if (!result.has(address)) {
                result.set(address, new AddressState(account_js_1.Address.parse(address).unwrap()));
            }
            const state = result.get(address);
            switch (record_type) {
                case EngineStorageKeyPrefix.Config:
                    break; // unreachable
                case EngineStorageKeyPrefix.Nonce:
                    state.nonce = (0, bigint_buffer_1.toBigIntBE)(record.value);
                    break;
                case EngineStorageKeyPrefix.Balance:
                    state.balance = (0, bigint_buffer_1.toBigIntBE)(record.value);
                    break;
                case EngineStorageKeyPrefix.Code:
                    state.code = record.value;
                    break;
                case EngineStorageKeyPrefix.Storage: {
                    state.storage.set((0, bigint_buffer_1.toBigIntBE)(record.key.subarray(21)), (0, bigint_buffer_1.toBigIntBE)(record.value));
                    break;
                }
            }
        }
        return (0, prelude_js_1.Ok)(result);
    }
    async callFunction(methodName, args, options) {
        let err;
        for (let i = 0, retries = 3; i < retries; i++) {
            try {
                const result = await this.signer.connection.provider.query({
                    request_type: 'call_function',
                    account_id: this.contractID.toString(),
                    method_name: methodName,
                    args_base64: this.prepareInput(args).toString('base64'),
                    finality: 'final',
                    blockId: options?.block !== undefined && options?.block !== null
                        ? options.block
                        : undefined,
                });
                if (result.logs && result.logs.length > 0)
                    console.debug(result.logs); // TODO
                return (0, prelude_js_1.Ok)(buffer_1.Buffer.from(result.result));
            }
            catch (error) {
                if (typeof options === 'object' &&
                    options.block &&
                    error.message.startsWith('[-32000] Server error: DB Not Found Error: BLOCK HEIGHT')) {
                    options.block = (options.block + 1);
                    err = error.message;
                }
                else {
                    throw error;
                }
            }
        }
        throw err;
    }
    async callMutativeFunction(methodName, args) {
        this.keyStore.reKey();
        const gas = new bn_js_1.default('300000000000000'); // TODO?
        try {
            const result = await this.signer.functionCall({
                contractId: this.contractID.toString(),
                methodName,
                args: this.prepareInput(args),
                gas,
            });
            if (typeof result.status === 'object' &&
                typeof result.status.SuccessValue === 'string') {
                const transactionId = result?.transaction_outcome?.id;
                return (0, prelude_js_1.Ok)({
                    id: transaction_js_1.TransactionID.fromHex(result.transaction.hash),
                    output: buffer_1.Buffer.from(result.status.SuccessValue, 'base64'),
                    tx: transactionId,
                    gasBurned: await this.transactionGasBurned(transactionId),
                });
            }
            return (0, prelude_js_1.Err)(result.toString()); // FIXME: unreachable?
        }
        catch (error) {
            //assert(error instanceof ServerTransactionError);
            switch (error?.type) {
                case 'FunctionCallError': {
                    const transactionId = error?.transaction_outcome?.id;
                    const details = {
                        tx: transactionId,
                        gasBurned: await this.transactionGasBurned(transactionId),
                    };
                    const errorKind = error?.kind?.ExecutionError;
                    if (errorKind) {
                        const errorCode = errorKind.replace('Smart contract panicked: ', '');
                        return (0, prelude_js_1.Err)(this.errorWithDetails(errorCode, details));
                    }
                    return (0, prelude_js_1.Err)(this.errorWithDetails(error.message, details));
                }
                case 'MethodNotFound':
                    return (0, prelude_js_1.Err)(error.message);
                default:
                    console.debug(error);
                    return (0, prelude_js_1.Err)(error.toString());
            }
        }
    }
    prepareAmount(value) {
        if (typeof value === 'undefined')
            return (0, bigint_buffer_1.toBufferBE)(BigInt(0), 32);
        const number = BigInt(value);
        return (0, bigint_buffer_1.toBufferBE)(number, 32);
    }
    prepareInput(args) {
        if (typeof args === 'undefined')
            return buffer_1.Buffer.alloc(0);
        if (typeof args === 'string')
            return buffer_1.Buffer.from((0, bytes_1.arrayify)(args));
        return buffer_1.Buffer.from(args);
    }
    errorWithDetails(message, details) {
        return `${message}|${JSON.stringify(details)}`;
    }
    async transactionGasBurned(id) {
        try {
            const transactionStatus = await this.near.connection.provider.txStatus((0, utils_js_1.base58ToBytes)(id), this.contractID.toString());
            const receiptsGasBurned = transactionStatus.receipts_outcome.reduce((sum, value) => sum + value.outcome.gas_burnt, 0);
            const transactionGasBurned = transactionStatus.transaction_outcome.outcome.gas_burnt || 0;
            return receiptsGasBurned + transactionGasBurned;
        }
        catch (error) {
            return 0;
        }
    }
}
exports.Engine = Engine;
