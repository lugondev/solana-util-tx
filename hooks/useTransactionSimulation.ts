'use client'

import { useState, useCallback, useEffect } from 'react'
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js'
import { SimulationResult } from '@/lib/solana/transactions/types'
import { TransactionSimulator } from '@/lib/solana/transactions/simulation'

export interface UseTransactionSimulationOptions {
  connection: Connection
  autoSimulate?: boolean
}

export interface UseTransactionSimulationReturn {
  simulate: (transaction: Transaction | VersionedTransaction) => Promise<SimulationResult>
  result: SimulationResult | null
  isSimulating: boolean
  error: string | null
  reset: () => void
}

/**
 * Hook for simulating transactions
 */
export function useTransactionSimulation({
  connection,
  autoSimulate = false,
}: UseTransactionSimulationOptions): UseTransactionSimulationReturn {
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [simulator] = useState(() => new TransactionSimulator(connection))

  // Simulate transaction
  const simulate = useCallback(
    async (transaction: Transaction | VersionedTransaction): Promise<SimulationResult> => {
      setIsSimulating(true)
      setError(null)

      try {
        let simulationResult: SimulationResult

        if (transaction instanceof Transaction) {
          simulationResult = await simulator.simulateTransaction(transaction)
        } else {
          simulationResult = await simulator.simulateVersionedTransaction(transaction)
        }

        setResult(simulationResult)

        if (!simulationResult.success) {
          setError(simulationResult.error || 'Simulation failed')
        }

        return simulationResult
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Simulation error'
        setError(errorMessage)
        
        const failedResult: SimulationResult = {
          success: false,
          error: errorMessage,
        }
        
        setResult(failedResult)
        return failedResult
      } finally {
        setIsSimulating(false)
      }
    },
    [simulator]
  )

  // Reset state
  const reset = useCallback(() => {
    setResult(null)
    setError(null)
    setIsSimulating(false)
  }, [])

  return {
    simulate,
    result,
    isSimulating,
    error,
    reset,
  }
}
