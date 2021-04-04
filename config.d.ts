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
export declare enum NetworkID {
    Local = "local",
    BetaNet = "betanet",
    TestNet = "testnet",
    MainNet = "mainnet"
}
export declare const NETWORKS: Map<string, NetworkConfig>;
