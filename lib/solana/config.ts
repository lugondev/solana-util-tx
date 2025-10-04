import { Commitment } from '@solana/web3.js'

/**
 * Solana RPC endpoint configurations
 */
export const RPC_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  'https://rpc.ankr.com/solana',
]

export const DEVNET_ENDPOINTS = [
  'https://api.devnet.solana.com',
]

export const TESTNET_ENDPOINTS = [
  'https://api.testnet.solana.com',
]

/**
 * Default connection configuration
 */
export const DEFAULT_CONFIG = {
  commitment: 'confirmed' as Commitment,
  confirmTransactionInitialTimeout: 60000,
  maxRetries: 3,
  retryDelay: 1000,
}

/**
 * Network selection based on environment
 */
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'mainnet-beta'

/**
 * Get endpoints for current network
 */
export const getEndpoints = (): string[] => {
  switch (NETWORK) {
    case 'devnet':
      return DEVNET_ENDPOINTS
    case 'testnet':
      return TESTNET_ENDPOINTS
    case 'mainnet-beta':
    default:
      return RPC_ENDPOINTS
  }
}

/**
 * Jito Block Engine endpoints
 */
export const JITO_BLOCK_ENGINES = [
  'https://mainnet.block-engine.jito.wtf',
  'https://amsterdam.mainnet.block-engine.jito.wtf',
  'https://frankfurt.mainnet.block-engine.jito.wtf',
  'https://ny.mainnet.block-engine.jito.wtf',
  'https://tokyo.mainnet.block-engine.jito.wtf',
]

/**
 * Jupiter API configuration
 */
export const JUPITER_API_URL = 'https://quote-api.jup.ag/v6'
