/* This is free and unencumbered software released into the public domain. */

export interface NetworkConfig {
  id: string;
  label: string;
  chainID: number;
  contractID: string;
  firstBlock: number;
  nearEndpoint: string;
  web3Endpoint?: string;
  walletLink: string;
  explorerLink: string;
  archiveURL?: string;
  genesisDate?: string;
}

export enum NetworkID {
  Local = 'local',
  Betanet = 'betanet',
  Testnet = 'testnet',
  Mainnet = 'mainnet',
}

export const NETWORKS: Map<string, NetworkConfig> = new Map(
  Object.entries({
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
      genesisDate: undefined,
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
      genesisDate: undefined,
    },
    betanet: {
      id: 'betanet',
      label: 'Betanet',
      chainID: 1313161556,
      contractID: 'aurora',
      firstBlock: 22997030,
      nearEndpoint: 'https://rpc.betanet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.betanet.near.org',
      explorerLink: 'https://explorer.betanet.near.org',
      archiveURL: undefined,
      genesisDate: undefined,
    },
    testnet: {
      id: 'default', // N.B.
      label: 'Testnet',
      chainID: 1313161555,
      contractID: 'aurora',
      firstBlock: 47354108,
      nearEndpoint: 'https://rpc.testnet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.testnet.near.org',
      explorerLink: 'https://explorer.testnet.near.org',
      archiveURL:
        'postgres://public_readonly:nearprotocol@35.184.214.98/testnet_explorer',
      genesisDate: '2020-07-31T03:39:42.911378Z',
    },
    mainnet: {
      id: 'mainnet',
      label: 'Mainnet',
      chainID: 1313161554,
      contractID: 'aurora',
      firstBlock: 37157758,
      nearEndpoint: 'https://rpc.mainnet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.near.org',
      explorerLink: 'https://explorer.near.org',
      archiveURL:
        'postgres://public_readonly:nearprotocol@104.199.89.51/mainnet_explorer',
      genesisDate: '2020-07-21T16:55:51.591948Z',
    },
  })
);
