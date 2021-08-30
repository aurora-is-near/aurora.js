"use strict";
/* This is free and unencumbered software released into the public domain. */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Engine = exports.EngineState = exports.AddressState = void 0;
var account_js_1 = require("./account.js");
var block_js_1 = require("./block.js");
var config_js_1 = require("./config.js");
var key_store_js_1 = require("./key_store.js");
var prelude_js_1 = require("./prelude.js");
var schema_js_1 = require("./schema.js");
var transaction_js_1 = require("./transaction.js");
var abi_1 = require("@ethersproject/abi");
var bytes_1 = require("@ethersproject/bytes");
var transactions_1 = require("@ethersproject/transactions");
var bigint_buffer_1 = require("bigint-buffer");
var buffer_1 = require("buffer");
var bn_js_1 = require("bn.js");
var near_api_js_1 = require("near-api-js");
var address_1 = require("@ethersproject/address");
__createBinding(exports, address_1, "getAddress", "parseAddress");
var bytes_2 = require("@ethersproject/bytes");
__createBinding(exports, bytes_2, "arrayify", "parseHexString");
var AddressState = /** @class */ (function () {
    function AddressState(address, nonce, balance, code, storage) {
        if (nonce === void 0) { nonce = BigInt(0); }
        if (balance === void 0) { balance = BigInt(0); }
        if (storage === void 0) { storage = new Map(); }
        this.address = address;
        this.nonce = nonce;
        this.balance = balance;
        this.code = code;
        this.storage = storage;
    }
    return AddressState;
}());
exports.AddressState = AddressState;
var EngineState = /** @class */ (function () {
    function EngineState(storage) {
        if (storage === void 0) { storage = new Map(); }
        this.storage = storage;
    }
    return EngineState;
}());
exports.EngineState = EngineState;
var DEFAULT_NETWORK_ID = 'local';
var Engine = /** @class */ (function () {
    function Engine(near, keyStore, signer, networkID, contractID) {
        this.near = near;
        this.keyStore = keyStore;
        this.signer = signer;
        this.networkID = networkID;
        this.contractID = contractID;
    }
    Engine.connect = function (options, env) {
        return __awaiter(this, void 0, Promise, function () {
            var networkID, network, contractID, signerID, keyStore, near, signer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        networkID = options.network || (env && env.NEAR_ENV) || DEFAULT_NETWORK_ID;
                        network = config_js_1.NETWORKS.get(networkID);
                        contractID = account_js_1.AccountID.parse(options.contract || (env && env.AURORA_ENGINE) || network.contractID).unwrap();
                        signerID = account_js_1.AccountID.parse(options.signer || (env && env.NEAR_MASTER_ACCOUNT)).unwrap();
                        keyStore = key_store_js_1.KeyStore.load(networkID, env);
                        near = new near_api_js_1["default"].Near({
                            deps: { keyStore: keyStore },
                            networkId: networkID,
                            nodeUrl: options.endpoint || (env && env.NEAR_URL) || network.nearEndpoint
                        });
                        return [4 /*yield*/, near.account(signerID.toString())];
                    case 1:
                        signer = _a.sent();
                        return [2 /*return*/, new Engine(near, keyStore, signer, networkID, contractID)];
                }
            });
        });
    };
    Engine.prototype.install = function (contractCode) {
        return __awaiter(this, void 0, Promise, function () {
            var contractAccount, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount()];
                    case 1:
                        contractAccount = (_a.sent()).unwrap();
                        return [4 /*yield*/, contractAccount.deployContract(contractCode)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, prelude_js_1.Ok(transaction_js_1.TransactionID.fromHex(result.transaction.hash))];
                }
            });
        });
    };
    Engine.prototype.upgrade = function (contractCode) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.install(contractCode)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Engine.prototype.initialize = function (options) {
        return __awaiter(this, void 0, Promise, function () {
            var newArgs, default_ft_metadata, given_ft_metadata, ft_metadata, connectorArgs, tx;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        newArgs = new schema_js_1.NewCallArgs(bytes_1.arrayify(abi_1.defaultAbiCoder.encode(['uint256'], [options.chain || 0])), options.owner || '', options.bridgeProver || '', new bn_js_1["default"](options.upgradeDelay || 0));
                        default_ft_metadata = schema_js_1.FungibleTokenMetadata["default"]();
                        given_ft_metadata = options.metadata || default_ft_metadata;
                        ft_metadata = new schema_js_1.FungibleTokenMetadata(given_ft_metadata.spec || default_ft_metadata.spec, given_ft_metadata.name || default_ft_metadata.name, given_ft_metadata.symbol || default_ft_metadata.symbol, given_ft_metadata.icon || default_ft_metadata.icon, given_ft_metadata.reference || default_ft_metadata.reference, given_ft_metadata.reference_hash || default_ft_metadata.reference_hash, given_ft_metadata.decimals || default_ft_metadata.decimals);
                        connectorArgs = new schema_js_1.InitCallArgs(options.prover || 'prover.ropsten.testnet', options.ethCustodian || '9006a6D7d08A388Eeea0112cc1b6b6B15a4289AF', ft_metadata);
                        return [4 /*yield*/, this.promiseAndThen(this.callMutativeFunction('new', newArgs.encode()), function (_) {
                                return _this.callMutativeFunction('new_eth_connector', connectorArgs.encode());
                            })];
                    case 1:
                        tx = _a.sent();
                        return [2 /*return*/, tx.map(function (_a) {
                                var id = _a.id;
                                return id;
                            })];
                }
            });
        });
    };
    // Like Result.andThen, but wrapped up in Promises
    Engine.prototype.promiseAndThen = function (p, f) {
        return __awaiter(this, void 0, Promise, function () {
            var r, t;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, p];
                    case 1:
                        r = _a.sent();
                        if (!r.isOk()) return [3 /*break*/, 3];
                        t = r.unwrap();
                        return [4 /*yield*/, f(t)];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3: return [2 /*return*/, prelude_js_1.Err(r.unwrapErr())];
                }
            });
        });
    };
    Engine.prototype.getAccount = function () {
        return __awaiter(this, void 0, Promise, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = prelude_js_1.Ok;
                        return [4 /*yield*/, this.near.account(this.contractID.toString())];
                    case 1: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                }
            });
        });
    };
    Engine.prototype.getBlockHash = function () {
        return __awaiter(this, void 0, Promise, function () {
            var contractAccount, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount()];
                    case 1:
                        contractAccount = (_a.sent()).unwrap();
                        return [4 /*yield*/, contractAccount.state()];
                    case 2:
                        state = (_a.sent());
                        return [2 /*return*/, prelude_js_1.Ok(state.block_hash)];
                }
            });
        });
    };
    Engine.prototype.getBlockHeight = function () {
        return __awaiter(this, void 0, Promise, function () {
            var contractAccount, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAccount()];
                    case 1:
                        contractAccount = (_a.sent()).unwrap();
                        return [4 /*yield*/, contractAccount.state()];
                    case 2:
                        state = (_a.sent());
                        return [2 /*return*/, prelude_js_1.Ok(state.block_height)];
                }
            });
        });
    };
    Engine.prototype.getBlockInfo = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prelude_js_1.Ok({
                        hash: '',
                        coinbase: account_js_1.Address.zero(),
                        timestamp: 0,
                        number: 0,
                        difficulty: 0,
                        gasLimit: 0
                    })];
            });
        });
    };
    Engine.prototype.getBlockTransactionCount = function (blockID) {
        return __awaiter(this, void 0, Promise, function () {
            var provider_1, block, requests, counts, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        provider_1 = this.near.connection.provider;
                        return [4 /*yield*/, provider_1.block(block_js_1.parseBlockID(blockID))];
                    case 1:
                        block = (_a.sent());
                        requests = block.chunks.map(function (chunkHeader) { return __awaiter(_this, void 0, void 0, function () {
                            var chunk;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (!(chunkHeader.tx_root == '11111111111111111111111111111111')) return [3 /*break*/, 1];
                                        return [2 /*return*/, 0]; // no transactions in this chunk
                                    case 1: return [4 /*yield*/, provider_1.chunk(chunkHeader.chunk_hash)];
                                    case 2:
                                        chunk = _a.sent();
                                        return [2 /*return*/, chunk.transactions.length];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(requests)];
                    case 2:
                        counts = (_a.sent());
                        return [2 /*return*/, prelude_js_1.Ok(counts.reduce(function (a, b) { return a + b; }, 0))];
                    case 3:
                        error_1 = _a.sent();
                        //console.error('Engine#getBlockTransactionCount', error);
                        return [2 /*return*/, prelude_js_1.Err(error_1.message)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Engine.prototype.getBlock = function (blockID, options) {
        return __awaiter(this, void 0, Promise, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.near.connection.provider;
                        return [4 /*yield*/, block_js_1.BlockProxy.fetch(provider, blockID, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Engine.prototype.hasBlock = function (blockID) {
        return __awaiter(this, void 0, Promise, function () {
            var provider;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        provider = this.near.connection.provider;
                        return [4 /*yield*/, block_js_1.BlockProxy.lookup(provider, blockID)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Engine.prototype.getCoinbase = function () {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prelude_js_1.Ok(account_js_1.Address.zero())]; // TODO
            });
        });
    };
    Engine.prototype.getVersion = function (options) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callFunction('get_version', undefined, options)];
                    case 1: return [2 /*return*/, (_a.sent()).map(function (output) { return output.toString(); })];
                }
            });
        });
    };
    Engine.prototype.getOwner = function (options) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callFunction('get_owner', undefined, options)];
                    case 1: return [2 /*return*/, (_a.sent()).andThen(function (output) { return account_js_1.AccountID.parse(output.toString()); })];
                }
            });
        });
    };
    Engine.prototype.getBridgeProvider = function (options) {
        return __awaiter(this, void 0, Promise, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callFunction('get_bridge_provider', undefined, options)];
                    case 1: return [2 /*return*/, (_a.sent()).andThen(function (output) { return account_js_1.AccountID.parse(output.toString()); })];
                }
            });
        });
    };
    Engine.prototype.getChainID = function (options) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.callFunction('get_chain_id', undefined, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(bigint_buffer_1.toBigIntBE)];
                }
            });
        });
    };
    // TODO: getUpgradeIndex()
    // TODO: stageUpgrade()
    // TODO: deployUpgrade()
    Engine.prototype.deployCode = function (bytecode) {
        return __awaiter(this, void 0, Promise, function () {
            var args, outcome;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = bytes_1.arrayify(bytecode);
                        return [4 /*yield*/, this.callMutativeFunction('deploy_code', args)];
                    case 1:
                        outcome = _a.sent();
                        return [2 /*return*/, outcome.map(function (_a) {
                                var output = _a.output;
                                var result = schema_js_1.SubmitResult.decode(buffer_1.Buffer.from(output));
                                return account_js_1.Address.parse(buffer_1.Buffer.from(result.output().unwrap()).toString('hex')).unwrap();
                            })];
                }
            });
        });
    };
    Engine.prototype.call = function (contract, input) {
        return __awaiter(this, void 0, Promise, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = new schema_js_1.FunctionCallArgs(contract.toBytes(), this.prepareInput(input));
                        return [4 /*yield*/, this.callMutativeFunction('call', args.encode())];
                    case 1: return [2 /*return*/, (_a.sent()).map(function (_a) {
                            var output = _a.output;
                            return output;
                        })];
                }
            });
        });
    };
    Engine.prototype.submit = function (input) {
        return __awaiter(this, void 0, Promise, function () {
            var inputBytes, rawTransaction, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        inputBytes = this.prepareInput(input);
                        try {
                            rawTransaction = transactions_1.parse(inputBytes);
                            if (rawTransaction.gasLimit.toBigInt() < 21000n) {
                                // See: https://github.com/aurora-is-near/aurora-relayer/issues/17
                                return [2 /*return*/, prelude_js_1.Err('ERR_INTRINSIC_GAS')];
                            }
                        }
                        catch (error) {
                            //console.error(error); // DEBUG
                            return [2 /*return*/, prelude_js_1.Err('ERR_INVALID_TX')];
                        }
                        return [4 /*yield*/, this.callMutativeFunction('submit', inputBytes)];
                    case 1: return [2 /*return*/, (_a.sent()).map(function (_a) {
                            var output = _a.output;
                            return schema_js_1.SubmitResult.decode(buffer_1.Buffer.from(output));
                        })];
                    case 2:
                        error_2 = _a.sent();
                        //console.error(error); // DEBUG
                        return [2 /*return*/, prelude_js_1.Err(error_2.message)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // TODO: metaCall()
    Engine.prototype.view = function (sender, address, amount, input, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = new schema_js_1.ViewCallArgs(sender.toBytes(), address.toBytes(), bigint_buffer_1.toBufferBE(BigInt(amount), 32), this.prepareInput(input));
                        return [4 /*yield*/, this.callFunction('view', args.encode(), options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (output) {
                                var status = schema_js_1.TransactionStatus.decode(output);
                                if (status.success !== undefined)
                                    return status.success.output;
                                else if (status.revert !== undefined)
                                    return status.revert.output;
                                else if (status.outOfGas !== undefined)
                                    return prelude_js_1.Err(status.outOfGas);
                                else if (status.outOfFund !== undefined)
                                    return prelude_js_1.Err(status.outOfFund);
                                else if (status.outOfOffset !== undefined)
                                    return prelude_js_1.Err(status.outOfOffset);
                                else if (status.callTooDeep !== undefined)
                                    return prelude_js_1.Err(status.callTooDeep);
                                else
                                    return prelude_js_1.Err('Failed to retrieve data from the contract');
                            })];
                }
            });
        });
    };
    Engine.prototype.getCode = function (address, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = address.toBytes();
                        return [4 /*yield*/, this.callFunction('get_code', args, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Engine.prototype.getBalance = function (address, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = address.toBytes();
                        return [4 /*yield*/, this.callFunction('get_balance', args, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(bigint_buffer_1.toBigIntBE)];
                }
            });
        });
    };
    Engine.prototype.getNonce = function (address, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = address.toBytes();
                        return [4 /*yield*/, this.callFunction('get_nonce', args, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(bigint_buffer_1.toBigIntBE)];
                }
            });
        });
    };
    Engine.prototype.getStorageAt = function (address, key, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = new schema_js_1.GetStorageAtArgs(address.toBytes(), bytes_1.arrayify(abi_1.defaultAbiCoder.encode(['uint256'], [key])));
                        return [4 /*yield*/, this.callFunction('get_storage_at', args.encode(), options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(bigint_buffer_1.toBigIntBE)];
                }
            });
        });
    };
    Engine.prototype.getAuroraErc20Address = function (nep141, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = buffer_1.Buffer.from(nep141.id, 'utf-8');
                        return [4 /*yield*/, this.callFunction('get_erc20_from_nep141', args, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (output) {
                                return account_js_1.Address.parse(output.toString('hex')).unwrap();
                            })];
                }
            });
        });
    };
    Engine.prototype.getNEP141Account = function (erc20, options) {
        return __awaiter(this, void 0, Promise, function () {
            var args, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        args = erc20.toBytes();
                        return [4 /*yield*/, this.callFunction('get_nep141_from_erc20', args, options)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.map(function (output) {
                                return account_js_1.AccountID.parse(output.toString('utf-8')).unwrap();
                            })];
                }
            });
        });
    };
    // TODO: beginChain()
    // TODO: beginBlock()
    Engine.prototype.getStorage = function () {
        return __awaiter(this, void 0, Promise, function () {
            var result, contractAccount, records, _i, records_1, record, record_type, key, address, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = new Map();
                        return [4 /*yield*/, this.getAccount()];
                    case 1:
                        contractAccount = (_a.sent()).unwrap();
                        return [4 /*yield*/, contractAccount.viewState('', { finality: 'final' })];
                    case 2:
                        records = _a.sent();
                        for (_i = 0, records_1 = records; _i < records_1.length; _i++) {
                            record = records_1[_i];
                            record_type = record.key[0];
                            if (record_type == 0 /* Config */)
                                continue; // skip EVM metadata
                            key = record_type == 4 /* Storage */
                                ? record.key.subarray(1, 21)
                                : record.key.subarray(1);
                            address = buffer_1.Buffer.from(key).toString('hex');
                            if (!result.has(address)) {
                                result.set(address, new AddressState(account_js_1.Address.parse(address).unwrap()));
                            }
                            state = result.get(address);
                            switch (record_type) {
                                case 0 /* Config */:
                                    break; // unreachable
                                case 1 /* Nonce */:
                                    state.nonce = bigint_buffer_1.toBigIntBE(record.value);
                                    break;
                                case 2 /* Balance */:
                                    state.balance = bigint_buffer_1.toBigIntBE(record.value);
                                    break;
                                case 3 /* Code */:
                                    state.code = record.value;
                                    break;
                                case 4 /* Storage */: {
                                    state.storage.set(bigint_buffer_1.toBigIntBE(record.key.subarray(21)), bigint_buffer_1.toBigIntBE(record.value));
                                    break;
                                }
                            }
                        }
                        return [2 /*return*/, prelude_js_1.Ok(result)];
                }
            });
        });
    };
    Engine.prototype.callFunction = function (methodName, args, options) {
        return __awaiter(this, void 0, Promise, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.signer.connection.provider.query({
                            request_type: 'call_function',
                            account_id: this.contractID.toString(),
                            method_name: methodName,
                            args_base64: this.prepareInput(args).toString('base64'),
                            finality: (options === null || options === void 0 ? void 0 : options.block) === undefined || (options === null || options === void 0 ? void 0 : options.block) === null
                                ? 'final'
                                : undefined,
                            block_id: (options === null || options === void 0 ? void 0 : options.block) !== undefined && (options === null || options === void 0 ? void 0 : options.block) !== null
                                ? options.block
                                : undefined
                        })];
                    case 1:
                        result = _a.sent();
                        if (result.logs && result.logs.length > 0)
                            console.debug(result.logs); // TODO
                        return [2 /*return*/, prelude_js_1.Ok(buffer_1.Buffer.from(result.result))];
                }
            });
        });
    };
    Engine.prototype.callMutativeFunction = function (methodName, args) {
        var _a;
        return __awaiter(this, void 0, Promise, function () {
            var gas, result, error_3, errorKind, errorCode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        gas = new bn_js_1["default"]('300000000000000');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.signer.functionCall(this.contractID.toString(), methodName, this.prepareInput(args), gas)];
                    case 2:
                        result = _b.sent();
                        if (typeof result.status === 'object' &&
                            typeof result.status.SuccessValue === 'string') {
                            return [2 /*return*/, prelude_js_1.Ok({
                                    id: transaction_js_1.TransactionID.fromHex(result.transaction.hash),
                                    output: buffer_1.Buffer.from(result.status.SuccessValue, 'base64')
                                })];
                        }
                        return [2 /*return*/, prelude_js_1.Err(result.toString())]; // FIXME: unreachable?
                    case 3:
                        error_3 = _b.sent();
                        //assert(error instanceof ServerTransactionError);
                        switch (error_3 === null || error_3 === void 0 ? void 0 : error_3.type) {
                            case 'FunctionCallError': {
                                errorKind = (_a = error_3 === null || error_3 === void 0 ? void 0 : error_3.kind) === null || _a === void 0 ? void 0 : _a.ExecutionError;
                                if (errorKind) {
                                    errorCode = errorKind.replace('Smart contract panicked: ', '');
                                    return [2 /*return*/, prelude_js_1.Err(errorCode)];
                                }
                                return [2 /*return*/, prelude_js_1.Err(error_3.message)];
                            }
                            case 'MethodNotFound':
                                return [2 /*return*/, prelude_js_1.Err(error_3.message)];
                            default:
                                console.debug(error_3);
                                return [2 /*return*/, prelude_js_1.Err(error_3.toString())];
                        }
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Engine.prototype.prepareInput = function (args) {
        if (typeof args === 'undefined')
            return buffer_1.Buffer.alloc(0);
        if (typeof args === 'string')
            return buffer_1.Buffer.from(bytes_1.arrayify(args));
        return buffer_1.Buffer.from(args);
    };
    return Engine;
}());
exports.Engine = Engine;
