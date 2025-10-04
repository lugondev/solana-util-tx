'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Connection } from '@solana/web3.js'
import {
  FeeSpeed,
  FeeRecommendation,
  PriorityFeeEstimate,
  FEE_PRESETS,
} from '@/lib/solana/transactions/types'
import { PriorityFeeCalculator } from '@/lib/solana/transactions/priority-fees'

export interface UsePriorityFeesOptions {
  connection: Connection
  autoRefresh?: boolean
  refreshInterval?: number // milliseconds
}

export interface UsePriorityFeesReturn {
  recommendations: FeeRecommendation[]
  estimate: PriorityFeeEstimate | null
  selectedSpeed: FeeSpeed
  setSelectedSpeed: (speed: FeeSpeed) => void
  currentFee: number
  refresh: () => Promise<void>
  isLoading: boolean
  error: string | null
}

/**
 * Hook for managing priority fees
 */
export function usePriorityFees({
  connection,
  autoRefresh = true,
  refreshInterval = 30000, // 30 seconds
}: UsePriorityFeesOptions): UsePriorityFeesReturn {
  const [recommendations, setRecommendations] = useState<FeeRecommendation[]>([])
  const [estimate, setEstimate] = useState<PriorityFeeEstimate | null>(null)
  const [selectedSpeed, setSelectedSpeed] = useState<FeeSpeed>('normal')
  const [currentFee, setCurrentFee] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculatorRef = useRef<PriorityFeeCalculator | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Get or create calculator
  const getCalculator = useCallback(() => {
    if (!calculatorRef.current) {
      calculatorRef.current = new PriorityFeeCalculator(connection)
    }
    return calculatorRef.current
  }, [connection])

  // Fetch priority fees
  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const calculator = getCalculator()

      // Get fee estimate
      const feeEstimate = await calculator.estimateFee()
      setEstimate(feeEstimate)

      // Get recommendations for all speeds
      const recs = await calculator.getFeeRecommendations()
      setRecommendations(recs)

      // Update current fee based on selected speed
      const currentRec = recs.find((r) => r.speed === selectedSpeed)
      if (currentRec) {
        setCurrentFee(currentRec.microLamports)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch priority fees'
      setError(errorMessage)
      console.error('[usePriorityFees] Error:', err)

      // Set default values on error
      setRecommendations(getDefaultRecommendations())
      setCurrentFee(1000) // Default 1000 microLamports
    } finally {
      setIsLoading(false)
    }
  }, [connection, getCalculator, selectedSpeed])

  // Update current fee when selected speed changes
  useEffect(() => {
    const rec = recommendations.find((r) => r.speed === selectedSpeed)
    if (rec) {
      setCurrentFee(rec.microLamports)
    }
  }, [selectedSpeed, recommendations])

  // Initial fetch
  useEffect(() => {
    refresh()
  }, [refresh])

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        refresh()
      }, refreshInterval)

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [autoRefresh, refreshInterval, refresh])

  return {
    recommendations,
    estimate,
    selectedSpeed,
    setSelectedSpeed,
    currentFee,
    refresh,
    isLoading,
    error,
  }
}

/**
 * Get default recommendations (fallback)
 */
function getDefaultRecommendations(): FeeRecommendation[] {
  const baseFee = 1000 // 1000 microLamports

  return Object.entries(FEE_PRESETS).map(([speed, preset]) => ({
    speed: speed as FeeSpeed,
    microLamports: Math.round(baseFee * preset.multiplier),
    estimatedTime: getEstimatedTime(speed as FeeSpeed),
    description: preset.description,
  }))
}

/**
 * Get estimated confirmation time
 */
function getEstimatedTime(speed: FeeSpeed): string {
  switch (speed) {
    case 'slow':
      return '~1-2 min'
    case 'normal':
      return '~30-60s'
    case 'fast':
      return '~15-30s'
    case 'turbo':
      return '~5-15s'
    default:
      return '~30-60s'
  }
}
