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
export declare enum NetworkID {
    Local = "local",
    Betanet = "betanet",
    Testnet = "testnet",
    Mainnet = "mainnet"
}
export declare const NETWORKS: Map<string, NetworkConfig>;
