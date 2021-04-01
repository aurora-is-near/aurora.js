/* This is free and unencumbered software released into the public domain. */
import { FunctionCallArgs, GetStorageAtArgs, NewCallArgs, ViewCallArgs } from './schema.js';
import { KeyStore } from './key_store.js';
import { defaultAbiCoder } from '@ethersproject/abi';
import { getAddress as parseAddress } from '@ethersproject/address';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { Ok, Err } from '@hqoss/monads';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import BN from 'bn.js';
import NEAR from 'near-api-js';
export { getAddress as parseAddress } from '@ethersproject/address';
export { arrayify as parseHexString } from '@ethersproject/bytes';
export class Engine {
    constructor(near, keyStore, signer, contractID) {
        this.near = near;
        this.keyStore = keyStore;
        this.signer = signer;
        this.contractID = contractID;
    }
    static async connect(options, env) {
        const networkID = env && env.NEAR_ENV || 'local';
        const keyStore = new KeyStore(env);
        const near = new NEAR.Near({
            deps: { keyStore },
            networkId: networkID,
            nodeUrl: env && env.NEAR_URL || 'http://localhost:3030',
        });
        const signer = await near.account(options.signer);
        return new Engine(near, keyStore, signer, options.evm);
    }
    async install(contractCode) {
        const contractAccount = await this.near.account(this.contractID);
        const result = await contractAccount.deployContract(contractCode);
        return Ok(result.transaction.hash);
    }
    async upgrade(contractCode) {
        return await this.install(contractCode);
    }
    async initialize(options) {
        const args = new NewCallArgs(parseHexString(defaultAbiCoder.encode(['uint256'], [options.chain || 0])), options.owner || '', options.bridgeProver || '', new BN(options.upgradeDelay || 0));
        return (await this.callMutativeFunction('new', args.encode())).map(({ id }) => id);
    }
    async getVersion() {
        return (await this.callFunction('get_version')).map(output => output.toString());
    }
    async getOwner() {
        return (await this.callFunction('get_owner')).map(output => output.toString());
    }
    async getBridgeProvider() {
        return (await this.callFunction('get_bridge_provider')).map(output => output.toString());
    }
    async getChainID() {
        const result = await this.callFunction('get_chain_id');
        return result.map(toBigIntBE);
    }
    // TODO: getUpgradeIndex()
    // TODO: stageUpgrade()
    // TODO: deployUpgrade()
    async deployCode(bytecode) {
        const args = parseHexString(bytecode);
        const result = await this.callMutativeFunction('deploy_code', args);
        return result.map(({ output }) => parseAddress(Buffer.from(output).toString('hex')));
    }
    async call(contract, input) {
        const args = new FunctionCallArgs(parseHexString(parseAddress(contract)), this.prepareInput(input));
        return (await this.callMutativeFunction('call', args.encode())).map(({ output }) => output);
    }
    // TODO: rawCall()
    // TODO: metaCall()
    async view(sender, address, amount, input) {
        const args = new ViewCallArgs(parseHexString(parseAddress(sender)), parseHexString(parseAddress(address)), toBufferBE(BigInt(amount), 32), this.prepareInput(input));
        return await this.callFunction('view', args.encode());
    }
    async getCode(address) {
        const args = parseHexString(parseAddress(address));
        return await this.callFunction('get_code', args);
    }
    async getBalance(address) {
        const args = parseHexString(parseAddress(address));
        const result = await this.callFunction('get_balance', args);
        return result.map(toBigIntBE);
    }
    async getNonce(address) {
        const args = parseHexString(parseAddress(address));
        const result = await this.callFunction('get_nonce', args);
        return result.map(toBigIntBE);
    }
    async getStorageAt(address, key) {
        const args = new GetStorageAtArgs(parseHexString(parseAddress(address)), parseHexString(defaultAbiCoder.encode(['uint256'], [key])));
        const result = await this.callFunction('get_storage_at', args.encode());
        return result.map(toBigIntBE);
    }
    // TODO: beginChain()
    // TODO: beginBlock()
    async callFunction(methodName, args) {
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
    async callMutativeFunction(methodName, args) {
        const result = await this.signer.functionCall(this.contractID, methodName, this.prepareInput(args));
        if (typeof result.status === 'object' && typeof result.status.SuccessValue === 'string') {
            return Ok({ id: result.transaction.hash, output: Buffer.from(result.status.SuccessValue, 'base64') });
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
