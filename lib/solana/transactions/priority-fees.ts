import { Connection, PublicKey } from '@solana/web3.js'
import {
  PriorityFeeEstimate,
  FeeSpeed,
  FeeRecommendation,
  FEE_PRESETS,
  DEFAULT_PRIORITY_FEE,
} from './types'

/**
 * Priority Fee Calculator
 * Calculates optimal priority fees based on recent network data
 */
export class PriorityFeeCalculator {
  private connection: Connection
  private cache: Map<string, { estimate: PriorityFeeEstimate; timestamp: number }>
  private readonly CACHE_TTL = 30_000 // 30 seconds

  constructor(connection: Connection) {
    this.connection = connection
    this.cache = new Map()
  }

  /**
   * Estimate priority fee for given accounts
   */
  public async estimateFee(
    accounts?: PublicKey[],
    percentile: number = 0.5
  ): Promise<PriorityFeeEstimate> {
    const cacheKey = accounts ? accounts.map(a => a.toBase58()).join(',') : 'default'
    
    // Check cache
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.estimate
    }

    try {
      // Get recent priority fees
      const recentFees = await this.getRecentFees(150) // Last 150 slots

      if (recentFees.length === 0) {
        return this.getDefaultEstimate()
      }

      // Calculate percentiles
      const sorted = recentFees.sort((a, b) => a - b)
      const estimate: PriorityFeeEstimate = {
        min: sorted[0] || DEFAULT_PRIORITY_FEE,
        low: this.calculatePercentile(sorted, 0.25),
        medium: this.calculatePercentile(sorted, 0.5),
        high: this.calculatePercentile(sorted, 0.75),
        veryHigh: this.calculatePercentile(sorted, 0.95),
        unsafeMax: sorted[sorted.length - 1] || DEFAULT_PRIORITY_FEE * 10,
      }

      // Cache result
      this.cache.set(cacheKey, { estimate, timestamp: Date.now() })

      return estimate
    } catch (error) {
      console.error('[PriorityFeeCalculator] Error estimating fee:', error)
      return this.getDefaultEstimate()
    }
  }

  /**
   * Get recent priority fees from network
   */
  public async getRecentFees(limit: number = 150): Promise<number[]> {
    try {
      // Get recent prioritization fees
      const fees = await this.connection.getRecentPrioritizationFees({
        lockedWritableAccounts: [],
      })

      return fees
        .slice(0, limit)
        .map(fee => fee.prioritizationFee)
        .filter(fee => fee > 0)
    } catch (error) {
      console.error('[PriorityFeeCalculator] Error fetching recent fees:', error)
      return []
    }
  }

  /**
   * Calculate optimal fee for given speed
   */
  public calculateOptimalFee(
    estimate: PriorityFeeEstimate,
    speed: FeeSpeed
  ): number {
    const preset = FEE_PRESETS[speed]
    const baseFee = estimate.medium
    
    return Math.round(baseFee * preset.multiplier)
  }

  /**
   * Get fee recommendations for all speed options
   */
  public async getFeeRecommendations(
    accounts?: PublicKey[]
  ): Promise<FeeRecommendation[]> {
    const estimate = await this.estimateFee(accounts)

    return [
      {
        speed: 'slow',
        microLamports: this.calculateOptimalFee(estimate, 'slow'),
        estimatedTime: '30-60s',
        description: FEE_PRESETS.slow.description,
      },
      {
        speed: 'normal',
        microLamports: this.calculateOptimalFee(estimate, 'normal'),
        estimatedTime: '15-30s',
        description: FEE_PRESETS.normal.description,
      },
      {
        speed: 'fast',
        microLamports: this.calculateOptimalFee(estimate, 'fast'),
        estimatedTime: '5-15s',
        description: FEE_PRESETS.fast.description,
      },
      {
        speed: 'turbo',
        microLamports: this.calculateOptimalFee(estimate, 'turbo'),
        estimatedTime: '<5s',
        description: FEE_PRESETS.turbo.description,
      },
    ]
  }

  /**
   * Clear cache
   */
  public clearCache(): void {
    this.cache.clear()
  }

  /**
   * Calculate percentile from sorted array
   */
  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil(sorted.length * percentile) - 1
    return sorted[Math.max(0, index)] || DEFAULT_PRIORITY_FEE
  }

  /**
   * Get default estimate when data unavailable
   */
  private getDefaultEstimate(): PriorityFeeEstimate {
    return {
      min: DEFAULT_PRIORITY_FEE,
      low: DEFAULT_PRIORITY_FEE,
      medium: DEFAULT_PRIORITY_FEE * 2,
      high: DEFAULT_PRIORITY_FEE * 5,
      veryHigh: DEFAULT_PRIORITY_FEE * 10,
      unsafeMax: DEFAULT_PRIORITY_FEE * 20,
    }
  }
}

/**
 * Format priority fee for display
 */
export function formatPriorityFee(microLamports: number): string {
  if (microLamports < 1_000) {
    return `${microLamports} μ◎`
  }
  
  const lamports = microLamports / 1_000_000
  return `${lamports.toFixed(6)} ◎`
}

/**
 * Calculate total fee cost
 */
export function calculateFeeCost(
  microLamports: number,
  computeUnits: number
): number {
  return Math.ceil((microLamports * computeUnits) / 1_000_000)
}

/**
 * Validate priority fee value
 */
export function validatePriorityFee(microLamports: number): {
  valid: boolean
  error?: string
} {
  if (microLamports < 0) {
    return { valid: false, error: 'Priority fee cannot be negative' }
  }

  if (microLamports > 10_000_000) {
    return { valid: false, error: 'Priority fee too high (max 10 SOL)' }
  }

  return { valid: true }
}
