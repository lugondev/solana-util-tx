import { Cluster } from '@solana/web3.js'

// Jito Block Engine endpoints cho từng region
export const JITO_BLOCK_ENGINES = {
  'mainnet-beta': {
    'ny': {
      name: 'New York',
      endpoint: 'https://ny.mainnet.block-engine.jito.wtf',
      region: 'US East',
      flag: '🇺🇸'
    },
    'amsterdam': {
      name: 'Amsterdam',
      endpoint: 'https://amsterdam.mainnet.block-engine.jito.wtf',
      region: 'EU West',
      flag: '🇳🇱'
    },
    'frankfurt': {
      name: 'Frankfurt',
      endpoint: 'https://frankfurt.mainnet.block-engine.jito.wtf', 
      region: 'EU Central',
      flag: '🇩🇪'
    },
    'tokyo': {
      name: 'Tokyo',
      endpoint: 'https://tokyo.mainnet.block-engine.jito.wtf',
      region: 'Asia Pacific',
      flag: '🇯🇵'
    }
  },
  'devnet': {
    'ny': {
      name: 'New York (Devnet)',
      endpoint: 'https://ny.devnet.block-engine.jito.wtf',
      region: 'US East',
      flag: '🇺🇸'
    }
  }
} as const

export type JitoRegion = keyof typeof JITO_BLOCK_ENGINES['mainnet-beta']
export type JitoBlockEngine = typeof JITO_BLOCK_ENGINES['mainnet-beta'][JitoRegion]

export const getAvailableRegions = (cluster: Cluster = 'mainnet-beta') => {
  return JITO_BLOCK_ENGINES[cluster as keyof typeof JITO_BLOCK_ENGINES] || JITO_BLOCK_ENGINES['mainnet-beta']
}

export const getBlockEngineEndpoint = (
  region: JitoRegion | string, 
  cluster: Cluster = 'mainnet-beta'
): string => {
  const engines = getAvailableRegions(cluster)
  
  // Check if it's a predefined region
  if (region in engines) {
    return (engines as any)[region].endpoint
  }
  
  // If it's a custom endpoint, validate and return
  if (region.startsWith('http://') || region.startsWith('https://')) {
    return region
  }
  
  // Default to NY if invalid
  return engines.ny.endpoint
}

// Default configurations
export const DEFAULT_JITO_CONFIG = {
  maxRetries: 3,
  bundleTip: 0.001, // SOL
  defaultRegion: 'ny' as JitoRegion,
  timeout: 30000, // 30 seconds
  skipPreflight: true
}

// Jito tip amounts (in SOL) và priority levels
export const JITO_TIP_PRESETS = {
  economy: {
    amount: 0.001,
    name: 'Economy',
    description: 'Low priority, may take longer',
    color: 'text-green-400'
  },
  standard: {
    amount: 0.005,
    name: 'Standard', 
    description: 'Normal priority for most use cases',
    color: 'text-blue-400'
  },
  fast: {
    amount: 0.01,
    name: 'Fast',
    description: 'High priority for urgent transactions',
    color: 'text-yellow-400'
  },
  turbo: {
    amount: 0.05,
    name: 'Turbo',
    description: 'Maximum priority for critical timing',
    color: 'text-red-400'
  }
} as const

export type JitoTipPreset = keyof typeof JITO_TIP_PRESETS