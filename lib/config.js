/* This is free and unencumbered software released into the public domain. */
export var NetworkID;
(function (NetworkID) {
    NetworkID["Local"] = "local";
    NetworkID["Betanet"] = "betanet";
    NetworkID["Testnet"] = "testnet";
    NetworkID["Mainnet"] = "mainnet";
})(NetworkID || (NetworkID = {}));
export const NETWORKS = new Map(Object.entries({
    // deprecated in favor of 'localnet'
    local: {
        id: 'local',
        label: 'Localnet',
        chainID: 1313161556,
        contractID: 'aurora.test.near',
        firstBlock: 0,
        nearEndpoint: 'http://127.0.0.1:3030',
        web3Endpoint: 'http://127.0.0.1:8545',
        walletLink: 'http://127.0.0.1:4000',
        explorerLink: 'http://127.0.0.1:3019',
        archiveURL: undefined,
    },
    localnet: {
        id: 'local',
        label: 'Localnet',
        chainID: 1313161556,
        contractID: 'aurora.test.near',
        firstBlock: 0,
        nearEndpoint: 'http://127.0.0.1:3030',
        web3Endpoint: 'http://127.0.0.1:8545',
        walletLink: 'http://127.0.0.1:4000',
        explorerLink: 'http://127.0.0.1:3019',
        archiveURL: undefined,
    },
    betanet: {
        id: 'betanet',
        label: 'Betanet',
        chainID: 1313161556,
        contractID: 'aurora',
        firstBlock: 22997030,
        nearEndpoint: 'https://rpc.betanet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.betanet.near.org',
        explorerLink: 'https://explorer.betanet.near.org',
        archiveURL: undefined,
    },
    testnet: {
        id: 'default',
        label: 'Testnet',
        chainID: 1313161555,
        contractID: 'aurora',
        firstBlock: 47354108,
        nearEndpoint: 'https://rpc.testnet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.testnet.near.org',
        explorerLink: 'https://explorer.testnet.near.org',
        archiveURL: 'postgres://public_readonly:nearprotocol@35.184.214.98/testnet_explorer',
    },
    mainnet: {
        id: 'mainnet',
        label: 'Mainnet',
        chainID: 1313161554,
        contractID: 'aurora',
        firstBlock: 37157758,
        nearEndpoint: 'https://rpc.mainnet.near.org',
        web3Endpoint: undefined,
        walletLink: 'https://wallet.near.org',
        explorerLink: 'https://explorer.near.org',
        archiveURL: 'postgres://public_readonly:nearprotocol@104.199.89.51/mainnet_explorer',
    },
}));
