/* This is free and unencumbered software released into the public domain. */

export interface NetworkConfig {
  id: string;
  label: string;
  chainID: number;
  contractID: string;
  nearEndpoint: string;
  web3Endpoint?: string;
  walletLink: string;
  explorerLink: string;
}

export enum NetworkID {
  Local = 'local',
  BetaNet = 'betanet',
  TestNet = 'testnet',
  MainNet = 'mainnet',
}

export const NETWORKS: Map<string, NetworkConfig> = new Map(
  Object.entries({
    local: {
      id: 'local',
      label: 'LocalNet',
      chainID: 1313161556,
      contractID: 'aurora.test.near',
      nearEndpoint: 'http://127.0.0.1:3030',
      web3Endpoint: undefined, // TODO
      walletLink: 'http://127.0.0.1:4000',
      explorerLink: 'http://127.0.0.1:3019',
    },
    betanet: {
      id: 'betanet',
      label: 'BetaNet',
      chainID: 1313161556,
      contractID: 'aurora',
      nearEndpoint: 'https://rpc.betanet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.betanet.near.org',
      explorerLink: 'https://explorer.betanet.near.org',
    },
    testnet: {
      id: 'default', // N.B.
      label: 'TestNet',
      chainID: 1313161555,
      contractID: 'aurora',
      nearEndpoint: 'https://rpc.testnet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.testnet.near.org',
      explorerLink: 'https://explorer.testnet.near.org',
    },
    mainnet: {
      id: 'mainnet',
      label: 'MainNet',
      chainID: 1313161554,
      contractID: 'aurora',
      nearEndpoint: 'https://rpc.mainnet.near.org',
      web3Endpoint: undefined, // TODO
      walletLink: 'https://wallet.near.org',
      explorerLink: 'https://explorer.near.org',
    },
  })
);
