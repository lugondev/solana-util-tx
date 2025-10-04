import { clusterApiUrl, Connection } from '@solana/web3.js';

export type Network = 'devnet' | 'mainnet-beta';

export interface NetworkConfig {
  name: string;
  label: string;
  endpoint: string;
  explorerUrl: string;
}

export const NETWORKS: Record<Network, NetworkConfig> = {
  'devnet': {
    name: 'devnet',
    label: 'DEVNET',
    endpoint: clusterApiUrl('devnet'),
    explorerUrl: 'https://explorer.solana.com',
  },
  'mainnet-beta': {
    name: 'mainnet-beta',
    label: 'MAINNET',
    endpoint: clusterApiUrl('mainnet-beta'),
    explorerUrl: 'https://explorer.solana.com',
  },
};

export const DEFAULT_NETWORK: Network = 'devnet';

export function createConnection(network: Network): Connection {
  const config = NETWORKS[network];
  return new Connection(config.endpoint, 'confirmed');
}

export function getExplorerUrl(signature: string, network: Network): string {
  const config = NETWORKS[network];
  return `${config.explorerUrl}/tx/${signature}?cluster=${network}`;
}