import { useState, useCallback } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { VersionedTransaction } from '@solana/web3.js'
import { useTokens } from '@/contexts/TokenContext'
import { parseTokenAmount } from '@/lib/solana/tokens/token-info'
import JupiterService from '@/lib/solana/defi/jupiter-service'

export interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: any
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
    bps: number
  }>
  contextSlot: number
  timeTaken: number
  swapUsdValue: string
}

export interface SwapTransaction {
  swapTransaction: string
}

export interface UseJupiterSwapReturn {
  quote: JupiterQuote | null
  loadingQuote: boolean
  loadingSwap: boolean
  error: string
  getQuote: (inputMint: string, outputMint: string, amount: string, slippageBps: number, inputDecimals?: number) => Promise<void>
  executeSwap: (quote: JupiterQuote) => Promise<string | null>
  reset: () => void
}

/**
 * Hook for Jupiter swap integration with wallet connection
 */
export function useJupiterSwap(): UseJupiterSwapReturn {
  const { publicKey, sendTransaction, connected } = useWallet()
  const { connection } = useConnection()
  const { getTokenInfoCached } = useTokens()
  const [quote, setQuote] = useState<JupiterQuote | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [loadingSwap, setLoadingSwap] = useState(false)
  const [error, setError] = useState('')

  // Initialize Jupiter service
  const jupiterService = new JupiterService(connection)

  // Get quote from Jupiter API using service
  const getQuote = useCallback(async (
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number,
    inputDecimals?: number
  ) => {
    if (!inputMint.trim() || !outputMint.trim() || !amount || parseFloat(amount) <= 0) {
      setError('Please enter valid token addresses and amount')
      return
    }

    setLoadingQuote(true)
    setError('')
    setQuote(null)
    
    try {
      // Get input token decimals if not provided
      let decimals = inputDecimals
      if (!decimals) {
        const tokenInfo = await getTokenInfoCached(inputMint)
        decimals = tokenInfo?.decimals || 6
      }

      // Convert amount to smallest unit using correct decimals
      const amountInSmallestUnit = parseTokenAmount(amount, decimals)
      
      console.log('🔄 Getting quote with Jupiter service:', {
        inputMint,
        outputMint,
        amount,
        decimals,
        amountInSmallestUnit
      })
      
      // Use Jupiter service instead of direct API call
      const quoteResponse = await jupiterService.getQuote(
        inputMint,
        outputMint,
        amountInSmallestUnit,
        slippageBps
      )
      
      if (!quoteResponse) {
        throw new Error('Failed to get quote from Jupiter')
      }
      
      console.log('✅ Got quote via Jupiter service:', quoteResponse)
      setQuote(quoteResponse as any) // Type compatibility
    } catch (err: any) {
      console.error('❌ Quote error:', err)
      setError(err.message || 'Failed to get quote')
    } finally {
      setLoadingQuote(false)
    }
  }, [getTokenInfoCached, connection])

  // Execute swap transaction
  const executeSwap = useCallback(async (quote: JupiterQuote): Promise<string | null> => {
    if (!connected || !publicKey) {
      setError('Please connect your wallet first')
      return null
    }

    if (!sendTransaction) {
      setError('Wallet does not support sending transactions')
      return null
    }

    // Block MetaMask explicitly - it's too unreliable
    const walletName = (window as any)?.solana?.isMetaMask ? 'MetaMask' : ''
    if (walletName === 'MetaMask' || sendTransaction.toString().includes('metamask')) {
      setError('🚫 MetaMask Solana Snap is currently not supported due to stability issues. Please use Phantom, Solflare, or another wallet for swaps.')
      return null
    }

    setLoadingSwap(true)
    setError('')

    try {
      console.log('🔄 Starting swap execution with Jupiter service...')
      console.log('Quote:', quote)
      console.log('User PublicKey:', publicKey.toString())

      // Use Jupiter service to build swap transaction
      const swapData = await jupiterService.buildSwapTransaction(
        quote as any, // Type compatibility
        publicKey.toString(),
        true // wrapAndUnwrapSol
      )

      if (!swapData?.swapTransaction) {
        throw new Error('No swap transaction returned from Jupiter service')
      }

      console.log('✅ Got swap transaction from Jupiter service')

      // Deserialize the transaction
      const swapTransactionBuf = Buffer.from(swapData.swapTransaction, 'base64')
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

      console.log('📝 Transaction prepared, sending to wallet...')

      // Use standard transaction options (no fallback needed for non-MetaMask wallets)
      const signature = await sendTransaction(transaction, connection, {
        skipPreflight: false,
        preflightCommitment: 'processed',
        maxRetries: 3,
      })

      console.log('✅ Swap executed successfully:', signature)
      setQuote(null) // Clear quote after successful swap
      return signature

    } catch (err: any) {
      console.error('❌ Swap execution error:', err)
      
      // Simplified error handling for supported wallets
      if (err.message?.includes('User rejected') || err.message?.includes('rejected') || err.code === 4001) {
        setError('❌ Transaction was rejected by user')
      } else if (err.message?.includes('timeout')) {
        setError('⏰ Wallet confirmation timeout - please try again')
      } else if (err.message?.includes('Insufficient funds')) {
        setError('💰 Insufficient funds for this transaction')
      } else if (err.message?.includes('Network Error')) {
        setError('🌐 Network error - please check connection and try again')
      } else if (err.message?.includes('Transaction simulation failed')) {
        setError('🔍 Transaction simulation failed - check token balances and try again')
      } else {
        setError(`❌ ${err.message || 'Failed to execute swap'}`)
      }
      return null
    } finally {
      setLoadingSwap(false)
    }
  }, [connected, publicKey, sendTransaction, connection])

  // Reset all state
  const reset = useCallback(() => {
    setQuote(null)
    setError('')
    setLoadingQuote(false)
    setLoadingSwap(false)
  }, [])

  return {
    quote,
    loadingQuote,
    loadingSwap,
    error,
    getQuote,
    executeSwap,
    reset,
  }
}