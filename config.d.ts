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
export declare const NETWORKS: Map<string, NetworkConfig>;
