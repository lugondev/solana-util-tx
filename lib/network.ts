import { clusterApiUrl, Connection } from '@solana/web3.js';

export type Network = 'devnet' | 'testnet' | 'mainnet-beta' | 'custom';

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
  'testnet': {
    name: 'testnet',
    label: 'TESTNET',
    endpoint: clusterApiUrl('testnet'),
    explorerUrl: 'https://explorer.solana.com',
  },
  'mainnet-beta': {
    name: 'mainnet-beta',
    label: 'MAINNET',
    endpoint: clusterApiUrl('mainnet-beta'),
    explorerUrl: 'https://explorer.solana.com',
  },
  'custom': {
    name: 'custom',
    label: 'CUSTOM RPC',
    endpoint: '', // Will be set dynamically
    explorerUrl: 'https://explorer.solana.com',
  },
};

export const DEFAULT_NETWORK: Network = 'devnet';

export function createConnection(network: Network, customEndpoint?: string): Connection {
  const config = NETWORKS[network];
  const endpoint = network === 'custom' && customEndpoint ? customEndpoint : config.endpoint;
  return new Connection(endpoint, 'confirmed');
}

export function getExplorerUrl(signature: string, network: Network): string {
  const config = NETWORKS[network];
  return `${config.explorerUrl}/tx/${signature}?cluster=${network}`;
}