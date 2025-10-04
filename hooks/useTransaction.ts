'use client'

import { useState, useCallback, useRef } from 'react'
import { Connection, Transaction, VersionedTransaction, SendOptions } from '@solana/web3.js'
import {
  TransactionStatus,
  TransactionUpdate,
  RetryConfig,
  SendTransactionResult,
} from '@/lib/solana/transactions/types'
import { RetryManager } from '@/lib/solana/transactions/retry-logic'

export interface UseTransactionOptions {
  connection: Connection
  retryConfig?: Partial<RetryConfig>
  onUpdate?: (update: TransactionUpdate) => void
}

export interface UseTransactionReturn {
  sendTransaction: (
    transaction: Transaction | VersionedTransaction,
    options?: SendOptions
  ) => Promise<SendTransactionResult>
  status: TransactionStatus | null
  signature: string | null
  update: TransactionUpdate | null
  isSending: boolean
  reset: () => void
}

/**
 * Hook for sending transactions with retry logic
 */
export function useTransaction({
  connection,
  retryConfig,
  onUpdate,
}: UseTransactionOptions): UseTransactionReturn {
  const [status, setStatus] = useState<TransactionStatus | null>(null)
  const [signature, setSignature] = useState<string | null>(null)
  const [update, setUpdate] = useState<TransactionUpdate | null>(null)
  const [isSending, setIsSending] = useState(false)

  const retryManagerRef = useRef<RetryManager | null>(null)

  // Get or create retry manager
  const getRetryManager = useCallback(() => {
    if (!retryManagerRef.current) {
      retryManagerRef.current = new RetryManager(connection, retryConfig)
    }
    return retryManagerRef.current
  }, [connection, retryConfig])

  // Send transaction
  const sendTransaction = useCallback(
    async (
      transaction: Transaction | VersionedTransaction,
      options?: SendOptions
    ): Promise<SendTransactionResult> => {
      setIsSending(true)
      setStatus(TransactionStatus.SENDING)
      setSignature(null)

      try {
        const manager = getRetryManager()

        const result = await manager.sendTransaction(
          transaction,
          options,
          (txUpdate) => {
            setUpdate(txUpdate)
            setStatus(txUpdate.status)
            if (txUpdate.signature) {
              setSignature(txUpdate.signature)
            }
            onUpdate?.(txUpdate)
          }
        )

        return result
      } finally {
        setIsSending(false)
      }
    },
    [connection, getRetryManager, onUpdate]
  )

  // Reset state
  const reset = useCallback(() => {
    setStatus(null)
    setSignature(null)
    setUpdate(null)
    setIsSending(false)
  }, [])

  return {
    sendTransaction,
    status,
    signature,
    update,
    isSending,
    reset,
  }
}
