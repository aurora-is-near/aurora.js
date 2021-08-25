/* This is free and unencumbered software released into the public domain. */
import { AccountID, Address } from './account.js';
import { BlockProxy, parseBlockID, } from './block.js';
import { NETWORKS } from './config.js';
import { KeyStore } from './key_store.js';
import { Err, Ok } from './prelude.js';
import { SubmitResult, FunctionCallArgs, GetStorageAtArgs, InitCallArgs, NewCallArgs, ViewCallArgs, } from './schema.js';
import { TransactionID } from './transaction.js';
import { defaultAbiCoder } from '@ethersproject/abi';
import { arrayify as parseHexString } from '@ethersproject/bytes';
import { parse as parseRawTransaction } from '@ethersproject/transactions';
import { toBigIntBE, toBufferBE } from 'bigint-buffer';
import { Buffer } from 'buffer';
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
        const newArgs = new NewCallArgs(parseHexString(defaultAbiCoder.encode(['uint256'], [options.chain || 0])), options.owner || '', options.bridgeProver || '', new BN(options.upgradeDelay || 0));
        // default values are the testnet values
        const connectorArgs = new InitCallArgs(options.prover || 'prover.ropsten.testnet', options.ethCustodian || '9006a6D7d08A388Eeea0112cc1b6b6B15a4289AF', options.metadata || {
            spec: "ft-1.0.0",
            name: "Ether",
            symbol: "ETH",
            icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAs3SURBVHhe7Z1XqBQ9FMdFsYu999577wUfbCiiPoggFkQsCKJP9t57V7AgimLBjg8qKmLBXrD33hVUEAQ1H7+QXMb9Zndnd+/MJJf7h8Pu3c3Mzua3yTk5SeZmEZkySplADFMmEMOUCcQwZQggHz58EHfu3FF/2a0MAWTjxo2iWbNm6i+7ZT2QW7duiUWLFolixYqJQ4cOqVftlfVAZs6cKdauXSuqV68uKlWqpF61V1YDoUXMmTNHrFu3TtSoUUNCmTBhgnrXTlkL5Nu3b2Ly5MmyuwJIzZo1RaNGjUTx4sXFu3fvVCn7ZC2QVatWiQULFvwPSL169USnTp1UKftkJZCbN2+KGTNmSBiLFy/+BwhWoUIFsX//flXaLlkJZPr06WkwIoE0btxYNGzYUFSsWFGVtkvWATlw4IB05BqGGxAMBz9u3Dh1lD2yCsjXr1/THHk8IDwvVaqUeP36tTraDlkFZOXKldKRO2HEAoKD79ixozraDlkD5Pr16/848nhANBQc/N69e9VZzJc1QCIduRcgGA4eKLbICiD79u37nyN3WiwgvMZ7Y8eOVWczW8YDwZFPmTIlauvA4gHhsUSJEuLFixfqrObKeCArVqxwdeROiwUE43UcfNu2bdVZzZXRQK5duyYduRsEp8UDog1fsnPnTnV2M2U0kFiO3GlegeDgy5cvr85upowFQqg6d+5cVwCR5hUI71NuzJgx6lPMk5FAPn365Doij2ZegWCUIUX/9OlT9WlmyUggy5Yti+vInZYIEAwH37JlS/VpZsk4IJcvX5bTsl5bB5YoEMqRDd62bZv6VHNkHJBp06YlBANLFAiGgy9btqz6VHNkFJBdu3Z5duROSwYIxjEjRoxQn26GjAHy8ePHuCPyaJYsEMozgn/48KG6ivBlDJAlS5Yk5MidlgqQ+vXri+bNm6urCF9GALl48aJ05G6V7cWSBYJxDOu5Nm/erK4mXBkBJBlH7rRUgGAmOfjQgZBbSsaROy1VIBjHDxs2TF1VeAoVyPv37+WI3K2SE7H0AMKxJUuWFHfv3lVXF45CBZKKI3daegDBcPBNmzZVVxeOQgNy/vz5hEfkbsbxAGFtb6pAOL5y5cpye0NYCg1Iqo5c29KlS2WEVKdOHdGkSZOUoeDgS5cura4yeIUCZMeOHWLevHkpASEBScvAB/Xs2VMUKVJE1K1bV44pUgHDcbVq1RJDhgxRVxusAgfy5s0bMXXq1IRgOMsuX75c7gcZP368aN++vez3W7VqJfLnzy8KFCggU+tUKNncZMFwDA6eNcRBK3AgCxculOas8HiG82duffXq1WLkyJGiRYsWokGDBrI1UPHMlQOjaNGisqUUKlRIPrKclLKA0RUdWfnRDNCUD1qBAjl79qyYNWuWa6VHGq0CEGw7oHsaNGiQrCBMg9DmBKJNgylYsKAciQOFfYhUtlcwHEe3GKQCA/Lnzx/PyUMc9Zo1a+SAsV+/fvLXSgXxa3eCiAXECaZw4cISDPPpGijniweG93HwXHtQCgwIk0E4cjcAGhItAf8AuG7dukknzbgAENFgYLGAaNNgKMcibGYNdXdGxUeDgz8aOHCg+hb+KxAgr169kpUcCUKb01GzOJrKonuJB0KbFyBOAw4thgCgdu3aaWAA4AYGB8/a4iAUCBBG405Hrv2Dm6MGhFulx7JEgWjTYHisVq2a/GxapBMGgLguLAj5DuTMmTP/OHLtqPETdAW6u4h01IlYskC06e6MIICROlA0GH19vM51+y1fgfz+/TvNkWtHjR/p27ev7JboJrx2S7EsVSAYUDCgcC4CAEbtXJsGg4PnO/kpX4Fs3bpVwiB0BEz37t09O+pELD2AOE23GM5ZpkwZGeVxraRnBgwYoL6dP/INCCNyfAeOukOHDmmZVLcKTdXSG4jTNBidAaDlXLlyRX3L9JdvQPr06SObvHbU6dUa3MxPINp0d5Y3b16RJ08e9S3TX74Befz4sejcubOoWrWqdNi2AgEEj8DIkiWLdO4PHjxQ3zL95asPQQcPHpSTR/gOv6D4BUQ7+uzZs4usWbOK7du3q2/ln3wHosU+j3LlysmIxa1SUzG/gOTLl0+2ilGjRqlv4b8CA4K+fPkievXqJZt9MgPAaJbeQHT3hA9kJX6QChSI1smTJ+U4RKct3Co5EUsvIHRP2bJlEzlz5hRHjhxRVxusfANy4cIF9Sy6GLnrAZhbRXu1VIEAguiJVuHlfltbtmxRz9JfvgHhxpQMBt++fatecdfPnz/lYIvtAcmOU1IBQi4LEG3atJHXEkssEWK0fvv2bfVK+svXLosJKW4AQ3QSb07h6tWr0uEz+Eq0G0sGCAM+IieOI98WS3///hVDhw4VOXLkkAlRP+W7D9mwYYNMLtJa4n1xRBqe3bIMKL2CSQQI3VPu3Lllq+C64olsNPMnBCJdunRRr/qnQJw6IS/pdypg/vz5cff38YscPny49C9eujGvQCgDiB49eqhPii4WgJPuAQQ+Lqi1v4EAefToUVrWFzCsyWIx2q9fv1QJd92/f1+0bt1aLlaINdqPB4TuCRD80rmtbCzhR8hG66SizvKeOHFClfBXgQBBe/bskfcr0dO1pOFZU3Xs2DFVIrqY/q1SpUpa1tUrELqnXLlySRhe5jKYw2d2kHBcz4OwIjLIXVaBAUF0V5Ezh7Nnz5Z27949VSq6CBDoOphHiQYECDyyTgsQ/fv3V0dH1/Hjx2V6h7wbEAguMH4ABBlBKlAgbneE090Yd21Yv369+P79uyrtrpcvX/6TtIwEorsnlvA8efJEHeUuRuFdu3aVKR2CCCcMnpNyf/78uSodjAIFgk6fPh11txQtCGBebhlO0pLuhKSlBkISEBhMjMXTxIkTZYVzvBOEhgFQriloBQ4EEUrGWhKEryEyu3HjhjoiuggWqDxAeOnrufcW5QkUIkFoGEBiUi0MhQKEeel4q995DyjcZ/Hz58/qSHfRrcTbSUuZdu3ayTEOYawbDIz3iLDiRYB+KRQgiP/3waJrNxjagMI0MK2AKC1ZjR49Wm5/JqEZDQTGe8A4fPiwOjJ4hQYEsS3By/5CwFCOVsWAzatIAhKVed3MQznWEIepUIEg/IUzFI5lgCEgYG1XrKQlyT9CY3wFXZBb5UcaURZ+JWyFDoSs8KRJk2L6E6dRDoB0YyQtneukSGAOHjxYDu70KNut8iONckRcJvzbpNCBIAZmXrcpYBoekRpgyBQzhiE1wkDOKwiMsuSr6BJNkBFAENEU45DIyo9nwGGxNs44ERAY5QlxmQsxRcYAIcxMdKubtmS3RVOe7u3Hjx/qKsKXMUAQA0EiKbdKj2XJAiEC2717t/p0M2QUEETaw0so7LREgVCO8l4Sj0HLOCAIB+81FMYSAUIZQmGSkybKSCAs1I7MCseyRIEwaveSJwtDRgJBR48e9RwKewXC+0x0AdtUGQsEMSL3cnMaL0B4j1wWc/Qmy2ggzG/ruXg3ENq8AmHgyCSZyTIaCLp06VLce8DHA8LrrGDxMnEVtowHgjZt2hR1QguLB4R0Su/evdXZzJYVQJBe25UoELK4Nv1PQ2uAPHv2LKo/iQaEv0mNeFn4bYqsAYL4p5IsGfIChOfMb7Dp1CZZBQTRQiJDYTcgerrWNlkHhHVbkV1XJBAemXDirqe2yTog6Ny5c9LJayhOIBgrS1h1b6OsBIKocB0KO4FwtwVu7WSrrAWC9NouDYQsLstCbZbVQNjmwCwjQFjCwzTuqVOn1Lt2ymogiBk/PafOfbdsl/VAEEBs+gfEsZQhgDChxVKgjKAMASQjKROIYcoEYpgygRglIf4D6lp/+XognSwAAAAASUVORK5CYII=",
            reference: "",
            reference_hash: [],
            decimals: 18
        });
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
            return Err(r.unwrapErr());
        }
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
        const outcome = await this.callMutativeFunction('deploy_code', args);
        return outcome.map(({ output }) => {
            const result = SubmitResult.decode(Buffer.from(output));
            return Address.parse(Buffer.from(result.output().unwrap()).toString('hex')).unwrap();
        });
    }
    async call(contract, input) {
        const args = new FunctionCallArgs(contract.toBytes(), this.prepareInput(input));
        return (await this.callMutativeFunction('call', args.encode())).map(({ output }) => output);
    }
    async submit(input) {
        try {
            const inputBytes = this.prepareInput(input);
            try {
                const rawTransaction = parseRawTransaction(inputBytes); // throws Error
                if (rawTransaction.gasLimit.toBigInt() < 21000n) {
                    // See: https://github.com/aurora-is-near/aurora-relayer/issues/17
                    return Err('ERR_INTRINSIC_GAS');
                }
            }
            catch (error) {
                //console.error(error); // DEBUG
                return Err('ERR_INVALID_TX');
            }
            return (await this.callMutativeFunction('submit', inputBytes)).map(({ output }) => SubmitResult.decode(Buffer.from(output)));
        }
        catch (error) {
            //console.error(error); // DEBUG
            return Err(error.message);
        }
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
    async getAuroraErc20Address(nep141, options) {
        const args = Buffer.from(nep141.id, 'utf-8');
        const result = await this.callFunction('get_erc20_from_nep141', args, options);
        return result.map((output) => {
            return Address.parse(output.toString('hex')).unwrap();
        });
    }
    async getNEP141Account(erc20, options) {
        const args = erc20.toBytes();
        const result = await this.callFunction('get_nep141_from_erc20', args, options);
        return result.map((output) => {
            return AccountID.parse(output.toString('utf-8')).unwrap();
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
        const gas = new BN('300000000000000'); // TODO?
        try {
            const result = await this.signer.functionCall(this.contractID.toString(), methodName, this.prepareInput(args), gas);
            if (typeof result.status === 'object' &&
                typeof result.status.SuccessValue === 'string') {
                return Ok({
                    id: TransactionID.fromHex(result.transaction.hash),
                    output: Buffer.from(result.status.SuccessValue, 'base64'),
                });
            }
            return Err(result.toString()); // FIXME: unreachable?
        }
        catch (error) {
            //assert(error instanceof ServerTransactionError);
            switch (error?.type) {
                case 'FunctionCallError': {
                    const errorKind = error?.kind?.ExecutionError;
                    if (errorKind) {
                        const errorCode = errorKind.replace('Smart contract panicked: ', '');
                        return Err(errorCode);
                    }
                    return Err(error.message);
                }
                case 'MethodNotFound':
                    return Err(error.message);
                default:
                    console.debug(error);
                    return Err(error.toString());
            }
        }
    }
    prepareInput(args) {
        if (typeof args === 'undefined')
            return Buffer.alloc(0);
        if (typeof args === 'string')
            return Buffer.from(parseHexString(args));
        return Buffer.from(args);
    }
}
