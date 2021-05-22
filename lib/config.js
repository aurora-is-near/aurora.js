/* This is free and unencumbered software released into the public domain. */
export var NetworkID;
(function (NetworkID) {
    NetworkID["Local"] = "local";
    NetworkID["BetaNet"] = "betanet";
    NetworkID["TestNet"] = "testnet";
    NetworkID["MainNet"] = "mainnet";
})(NetworkID || (NetworkID = {}));
export const NETWORKS = new Map(Object.entries({
    // deprecated in favor of 'localnet'
    local: {
        id: 'local',
        label: 'LocalNet',
        chainID: 1313161556,
        contractID: 'aurora.test.near',
        nearEndpoint: 'http://127.0.0.1:3030',
        web3Endpoint: 'http://127.0.0.1:8545',
        walletLink: 'http://127.0.0.1:4000',
        explorerLink: 'http://127.0.0.1:3019',
    },
    localnet: {
        id: 'local',
        label: 'LocalNet',
        chainID: 1313161556,
        contractID: 'aurora.test.near',
        nearEndpoint: 'http://127.0.0.1:3030',
        web3Endpoint: 'http://127.0.0.1:8545',
        walletLink: 'http://127.0.0.1:4000',
        explorerLink: 'http://127.0.0.1:3019',
    },
    betanet: {
        id: 'betanet',
        label: 'BetaNet',
        chainID: 1313161556,
        contractID: 'aurora',
        nearEndpoint: 'https://rpc.betanet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.betanet.near.org',
        explorerLink: 'https://explorer.betanet.near.org',
    },
    testnet: {
        id: 'default',
        label: 'TestNet',
        chainID: 1313161555,
        contractID: 'aurora',
        nearEndpoint: 'https://rpc.testnet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.testnet.near.org',
        explorerLink: 'https://explorer.testnet.near.org',
    },
    mainnet: {
        id: 'mainnet',
        label: 'MainNet',
        chainID: 1313161554,
        contractID: 'aurora',
        nearEndpoint: 'https://rpc.mainnet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.near.org',
        explorerLink: 'https://explorer.near.org',
    },
}));
