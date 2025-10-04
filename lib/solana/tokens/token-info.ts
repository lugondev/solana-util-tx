'use client'

import { Connection } from '@solana/web3.js'

export interface TokenInfo {
  symbol: string
  name: string
  decimals: number
  logoURI?: string
}

interface JupiterTokenList {
  [mint: string]: TokenInfo
}

// Common token decimals mapping
const COMMON_TOKEN_DECIMALS: { [key: string]: number } = {
  'So11111111111111111111111111111111111111112': 9, // SOL (Wrapped SOL)
  'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 6, // USDC
  'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': 6, // USDT
  '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': 6, // RAY
  'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': 9,  // mSOL
  'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 5, // BONK
}

// Cache for token info
let tokenListCache: JupiterTokenList | null = null

/**
 * Fetch token list from Jupiter API
 */
export async function getJupiterTokenList(): Promise<JupiterTokenList> {
  if (tokenListCache) {
    return tokenListCache
  }

  try {
    const response = await fetch('https://lite-api.jup.ag/tokens/v2/')
    if (!response.ok) {
      throw new Error('Failed to fetch token list')
    }
    
    tokenListCache = await response.json()
    return tokenListCache!
  } catch (error) {
    console.warn('Failed to fetch Jupiter token list:', error)
    return {}
  }
}

/**
 * Get token decimals from multiple sources
 */
export async function getTokenDecimals(mintAddress: string): Promise<number> {
  // Check common tokens first
  if (COMMON_TOKEN_DECIMALS[mintAddress]) {
    return COMMON_TOKEN_DECIMALS[mintAddress]
  }

  try {
    // Try Jupiter token list
    const tokenList = await getJupiterTokenList()
    if (tokenList[mintAddress]) {
      return tokenList[mintAddress].decimals
    }

    // Default fallback
    return 6
  } catch (error) {
    console.warn(`Failed to get decimals for token ${mintAddress}:`, error)
    return 6 // Default to 6 decimals
  }
}

/**
 * Get token info including symbol and decimals
 */
export async function getTokenInfo(mintAddress: string): Promise<TokenInfo | null> {
  // Check if it's a known token
  if (COMMON_TOKEN_DECIMALS[mintAddress]) {
    const commonTokens: { [key: string]: Omit<TokenInfo, 'decimals'> } = {
      'So11111111111111111111111111111111111111112': { symbol: 'SOL', name: 'Solana' },
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': { symbol: 'USDC', name: 'USD Coin' },
      'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB': { symbol: 'USDT', name: 'Tether USD' },
      '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R': { symbol: 'RAY', name: 'Raydium' },
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So': { symbol: 'mSOL', name: 'Marinade SOL' },
      'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': { symbol: 'BONK', name: 'Bonk' },
    }

    const tokenData = commonTokens[mintAddress]
    if (tokenData) {
      return {
        ...tokenData,
        decimals: COMMON_TOKEN_DECIMALS[mintAddress]
      }
    }
  }

  try {
    // Try Jupiter token list
    const tokenList = await getJupiterTokenList()
    if (tokenList[mintAddress]) {
      return tokenList[mintAddress]
    }

    return null
  } catch (error) {
    console.warn(`Failed to get token info for ${mintAddress}:`, error)
    return null
  }
}

/**
 * Format token amount with proper decimals
 */
export function formatTokenAmount(
  amount: string | number, 
  decimals: number = 6, 
  displayDecimals: number = 6
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  const formatted = num / Math.pow(10, decimals)
  return formatted.toFixed(displayDecimals)
}

/**
 * Parse human-readable amount to smallest unit
 */
export function parseTokenAmount(amount: string | number, decimals: number = 6): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0'
  
  return Math.floor(num * Math.pow(10, decimals)).toString()
}