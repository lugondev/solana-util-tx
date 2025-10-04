'use client'

import { useState, useCallback } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Transaction } from '@solana/web3.js'
import { 
  JitoBundleService, 
  BundleTransaction, 
  JitoBundleConfig,
  JitoBundleResult 
} from '@/lib/solana/jito/bundle-service'
import { JitoRegion, DEFAULT_JITO_CONFIG } from '@/lib/solana/jito/config'
import { useTransactionHistory } from '@/lib/transaction-history'

export interface UseJitoBundleResult {
  // State
  isSimulating: boolean
  isSubmitting: boolean
  error: string | null
  lastResult: JitoBundleResult | null
  
  // Configuration
  config: JitoBundleConfig
  updateConfig: (newConfig: Partial<JitoBundleConfig>) => void
  
  // Actions
  simulateBundle: (transactions: BundleTransaction[]) => Promise<{
    success: boolean
    errors: string[]
    estimatedCost: number
  }>
  submitBundle: (transactions: BundleTransaction[]) => Promise<JitoBundleResult>
  estimateCost: (transactions: BundleTransaction[]) => number
  reset: () => void
}

export function useJitoBundle(initialConfig?: Partial<JitoBundleConfig>): UseJitoBundleResult {
  const { connection } = useConnection()
  const { publicKey, signAllTransactions } = useWallet()
  const { addTransaction, updateTransaction } = useTransactionHistory()

  const [isSimulating, setIsSimulating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastResult, setLastResult] = useState<JitoBundleResult | null>(null)
  
  const [config, setConfig] = useState<JitoBundleConfig>({
    region: initialConfig?.region || DEFAULT_JITO_CONFIG.defaultRegion,
    tip: initialConfig?.tip || DEFAULT_JITO_CONFIG.bundleTip,
    maxRetries: initialConfig?.maxRetries || DEFAULT_JITO_CONFIG.maxRetries,
    timeout: initialConfig?.timeout || DEFAULT_JITO_CONFIG.timeout
  })

  const [bundleService] = useState(() => new JitoBundleService(connection, config))

  const updateConfig = useCallback((newConfig: Partial<JitoBundleConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig }
      bundleService.updateConfig(updated)
      return updated
    })
  }, [bundleService])

  const simulateBundle = useCallback(async (transactions: BundleTransaction[]) => {
    if (!publicKey) {
      throw new Error('Wallet not connected')
    }

    if (transactions.length === 0) {
      throw new Error('No transactions to simulate')
    }

    setIsSimulating(true)
    setError(null)

    try {
      const result = await bundleService.simulateBundle(transactions, publicKey)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Simulation failed'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSimulating(false)
    }
  }, [publicKey, bundleService])

  const submitBundle = useCallback(async (transactions: BundleTransaction[]): Promise<JitoBundleResult> => {
    if (!publicKey || !signAllTransactions) {
      throw new Error('Wallet not connected or does not support signing multiple transactions')
    }

    if (transactions.length === 0) {
      throw new Error('No transactions to submit')
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await bundleService.submitBundle(
        transactions,
        publicKey,
        signAllTransactions
      )

      setLastResult(result)

      // Add to transaction history
      if (result.signatures.length > 0) {
        result.signatures.forEach((signature, index) => {
          const isLastTx = index === result.signatures.length - 1
          const description = isLastTx 
            ? `Jito Bundle Tip (${config.tip} SOL)` 
            : transactions[index]?.description || `Bundle Transaction ${index + 1}`

          addTransaction({
            signature,
            type: 'jito-bundle',
            status: result.landed ? 'confirmed' : 'failed',
            description,
            ...(result.error && { error: result.error })
          })
        })
      }

      if (!result.landed && result.error) {
        setError(result.error)
      }

      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bundle submission failed'
      setError(errorMessage)
      
      const failedResult: JitoBundleResult = {
        bundleId: '',
        landed: false,
        signatures: [],
        error: errorMessage,
        cost: 0
      }
      
      setLastResult(failedResult)
      return failedResult
    } finally {
      setIsSubmitting(false)
    }
  }, [publicKey, signAllTransactions, bundleService, config.tip, addTransaction])

  const estimateCost = useCallback((transactions: BundleTransaction[]): number => {
    return bundleService.estimateBundleCost(transactions)
  }, [bundleService])

  const reset = useCallback(() => {
    setError(null)
    setLastResult(null)
    setIsSimulating(false)
    setIsSubmitting(false)
  }, [])

  return {
    // State
    isSimulating,
    isSubmitting,
    error,
    lastResult,
    
    // Configuration
    config,
    updateConfig,
    
    // Actions
    simulateBundle,
    submitBundle,
    estimateCost,
    reset
  }
}