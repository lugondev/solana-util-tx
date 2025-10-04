'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { getTokenInfo, TokenInfo } from '@/lib/solana/tokens/token-info'

interface TokenCache {
  [mintAddress: string]: TokenInfo
}

interface TokenContextValue {
  tokenCache: TokenCache
  getTokenInfoCached: (mintAddress: string) => Promise<TokenInfo | null>
  clearCache: () => void
  isLoading: (mintAddress: string) => boolean
}

const TokenContext = createContext<TokenContextValue | undefined>(undefined)

interface TokenProviderProps {
  children: ReactNode
}

export function TokenProvider({ children }: TokenProviderProps) {
  const [tokenCache, setTokenCache] = useState<TokenCache>({})
  const [loadingTokens, setLoadingTokens] = useState<Set<string>>(new Set())

  const getTokenInfoCached = useCallback(async (mintAddress: string): Promise<TokenInfo | null> => {
    if (!mintAddress.trim()) return null

    // Return cached if available
    if (tokenCache[mintAddress]) {
      return tokenCache[mintAddress]
    }

    // Return null if already loading to prevent duplicate requests
    if (loadingTokens.has(mintAddress)) {
      return null
    }

    try {
      // Mark as loading
      setLoadingTokens(prev => new Set(prev).add(mintAddress))

      // Fetch token info
      const tokenInfo = await getTokenInfo(mintAddress)
      
      if (tokenInfo) {
        // Cache the result
        setTokenCache(prev => ({
          ...prev,
          [mintAddress]: tokenInfo
        }))
        
        return tokenInfo
      }

      return null
    } catch (error) {
      console.error(`Failed to fetch token info for ${mintAddress}:`, error)
      return null
    } finally {
      // Remove from loading set
      setLoadingTokens(prev => {
        const newSet = new Set(prev)
        newSet.delete(mintAddress)
        return newSet
      })
    }
  }, [tokenCache, loadingTokens])

  const clearCache = useCallback(() => {
    setTokenCache({})
    setLoadingTokens(new Set())
  }, [])

  const isLoading = useCallback((mintAddress: string) => {
    return loadingTokens.has(mintAddress)
  }, [loadingTokens])

  const value: TokenContextValue = {
    tokenCache,
    getTokenInfoCached,
    clearCache,
    isLoading
  }

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  )
}

export function useTokens() {
  const context = useContext(TokenContext)
  if (context === undefined) {
    throw new Error('useTokens must be used within a TokenProvider')
  }
  return context
}

// Hook for managing token info state in components
export function useTokenInfo(mintAddress: string) {
  const { tokenCache, getTokenInfoCached, isLoading } = useTokens()
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)

  React.useEffect(() => {
    if (!mintAddress.trim()) {
      setTokenInfo(null)
      return
    }

    // Check cache first
    if (tokenCache[mintAddress]) {
      setTokenInfo(tokenCache[mintAddress])
      return
    }

    // Fetch if not in cache
    getTokenInfoCached(mintAddress).then(info => {
      if (info) {
        setTokenInfo(info)
      }
    })
  }, [mintAddress, tokenCache, getTokenInfoCached])

  return {
    tokenInfo,
    isLoading: isLoading(mintAddress),
    decimals: tokenInfo?.decimals || 6,
    symbol: tokenInfo?.symbol || 'Unknown',
    name: tokenInfo?.name || 'Unknown Token'
  }
}