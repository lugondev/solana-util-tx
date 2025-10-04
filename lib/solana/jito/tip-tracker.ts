import { Connection } from '@solana/web3.js'

export interface JitoTipData {
  timestamp: string
  tip: number
  bundleSuccess: boolean
  blockPosition: number
  validator: string
  slot: number
  blockTime: number
}

export interface JitoNetworkStats {
  avgTip: number
  successRate: number
  recommendedTip: number
  blockTime: number
  competition: 'LOW' | 'MEDIUM' | 'HIGH'
  volatility: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface JitoValidatorInfo {
  identity: string
  name: string
  commission: number
  totalStake: number
  tipReceived24h: number
}

export class JitoTipTracker {
  private connection: Connection
  private tipHistory: JitoTipData[] = []
  private updateInterval: NodeJS.Timeout | null = null

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Start tracking tips (simulated for now)
   */
  startTracking(callback?: (data: JitoTipData) => void): void {
    if (this.updateInterval) {
      this.stopTracking()
    }

    this.updateInterval = setInterval(async () => {
      try {
        const tipData = await this.fetchLatestTipData()
        this.tipHistory.unshift(tipData)
        
        // Keep only last 100 entries
        if (this.tipHistory.length > 100) {
          this.tipHistory = this.tipHistory.slice(0, 100)
        }

        if (callback) {
          callback(tipData)
        }
      } catch (error) {
        console.error('Error fetching tip data:', error)
      }
    }, 10000) // Update every 10 seconds
  }

  /**
   * Stop tracking tips
   */
  stopTracking(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }

  /**
   * Get tip history
   */
  getTipHistory(): JitoTipData[] {
    return [...this.tipHistory]
  }

  /**
   * Get network statistics
   */
  getNetworkStats(): JitoNetworkStats {
    if (this.tipHistory.length === 0) {
      return {
        avgTip: 0.01,
        successRate: 75,
        recommendedTip: 0.02,
        blockTime: 400,
        competition: 'MEDIUM',
        volatility: 'LOW'
      }
    }

    const successful = this.tipHistory.filter(tip => tip.bundleSuccess)
    const avgTip = this.tipHistory.reduce((sum, tip) => sum + tip.tip, 0) / this.tipHistory.length
    const successRate = (successful.length / this.tipHistory.length) * 100

    // Calculate recommended tip (75th percentile of successful tips)
    const successfulTips = successful.map(tip => tip.tip).sort((a, b) => a - b)
    const p75Index = Math.floor(successfulTips.length * 0.75)
    const recommendedTip = successfulTips[p75Index] || avgTip * 1.5

    // Calculate competition level based on tip variance
    const tipVariance = this.calculateVariance(this.tipHistory.map(t => t.tip))
    const competition = tipVariance > 0.01 ? 'HIGH' : tipVariance > 0.005 ? 'MEDIUM' : 'LOW'

    // Calculate volatility based on recent tip changes
    const recentTips = this.tipHistory.slice(0, 10)
    const volatility = this.calculateVolatility(recentTips.map(t => t.tip))

    return {
      avgTip,
      successRate,
      recommendedTip,
      blockTime: 400, // Approximate Solana block time
      competition,
      volatility
    }
  }

  /**
   * Fetch latest tip data (simulated with realistic patterns)
   */
  private async fetchLatestTipData(): Promise<JitoTipData> {
    try {
      // In a real implementation, this would fetch from Jito's API
      // For now, we simulate realistic tip data based on network conditions
      
      const currentSlot = await this.connection.getSlot()
      const blockTime = Date.now()
      
      // Simulate tip patterns - higher tips during peak hours
      const hour = new Date().getHours()
      const isPeakHour = hour >= 14 && hour <= 22 // UTC peak hours
      
      let baseTip = isPeakHour ? 0.015 : 0.008
      
      // Add some randomness with realistic distribution
      const randomFactor = this.generateRealisticTip()
      const tip = baseTip * randomFactor
      
      // Success rate depends on tip amount relative to current average
      const currentStats = this.getNetworkStats()
      const successProbability = Math.min(0.95, Math.max(0.2, tip / (currentStats.avgTip || 0.01)))
      const bundleSuccess = Math.random() < successProbability
      
      // Block position correlates with tip amount
      const blockPosition = bundleSuccess ? 
        Math.floor(Math.random() * 3) + 1 : // Successful tips get better positions
        Math.floor(Math.random() * 5) + 1   // Failed tips are more random
      
      return {
        timestamp: new Date().toISOString(),
        tip,
        bundleSuccess,
        blockPosition,
        validator: 'Jito (Mainnet)',
        slot: currentSlot,
        blockTime
      }
    } catch (error) {
      console.error('Error fetching tip data:', error)
      
      // Fallback data
      return {
        timestamp: new Date().toISOString(),
        tip: 0.01,
        bundleSuccess: Math.random() > 0.3,
        blockPosition: Math.floor(Math.random() * 5) + 1,
        validator: 'Jito (Mainnet)',
        slot: 0,
        blockTime: Date.now()
      }
    }
  }

  /**
   * Generate realistic tip amounts using log-normal distribution
   */
  private generateRealisticTip(): number {
    // Most tips are small, few are large (log-normal distribution)
    const normal = this.boxMullerTransform()
    return Math.max(0.1, Math.exp(normal * 0.5 + 0.2))
  }

  /**
   * Box-Muller transformation for normal distribution
   */
  private boxMullerTransform(): number {
    let u = 0, v = 0
    while(u === 0) u = Math.random() // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }

  /**
   * Calculate variance
   */
  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length
  }

  /**
   * Calculate volatility level
   */
  private calculateVolatility(values: number[]): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (values.length < 2) return 'LOW'
    
    const changes = []
    for (let i = 1; i < values.length; i++) {
      if (values[i-1] !== 0) {
        changes.push(Math.abs((values[i] - values[i-1]) / values[i-1]))
      }
    }
    
    if (changes.length === 0) return 'LOW'
    
    const avgChange = changes.reduce((sum, change) => sum + change, 0) / changes.length
    
    if (avgChange > 0.3) return 'HIGH'
    if (avgChange > 0.15) return 'MEDIUM'
    return 'LOW'
  }

  /**
   * Get tip recommendation based on success target
   */
  getTipRecommendation(targetSuccessRate: number = 0.8): {
    tip: number
    confidence: number
    reasoning: string
  } {
    const stats = this.getNetworkStats()
    
    if (this.tipHistory.length < 10) {
      return {
        tip: 0.01,
        confidence: 0.5,
        reasoning: 'Insufficient data for accurate recommendation'
      }
    }

    // Find tips that achieve target success rate
    const successfulTips = this.tipHistory
      .filter(tip => tip.bundleSuccess)
      .map(tip => tip.tip)
      .sort((a, b) => a - b)

    const targetIndex = Math.floor(successfulTips.length * (1 - targetSuccessRate))
    const recommendedTip = successfulTips[targetIndex] || stats.recommendedTip

    const confidence = Math.min(0.95, this.tipHistory.length / 50)

    return {
      tip: recommendedTip,
      confidence,
      reasoning: `Based on ${this.tipHistory.length} recent bundles, ${targetSuccessRate * 100}% success rate`
    }
  }

  /**
   * Get Jito validator information
   */
  async getValidatorInfo(): Promise<JitoValidatorInfo[]> {
    // In real implementation, this would fetch from Solana RPC and Jito APIs
    // For now, return mock data with realistic values
    return [
      {
        identity: 'JitoValidator1',
        name: 'Jito Foundation',
        commission: 5,
        totalStake: 2500000,
        tipReceived24h: 12.5
      },
      {
        identity: 'JitoValidator2', 
        name: 'Jito Labs',
        commission: 7,
        totalStake: 1800000,
        tipReceived24h: 8.3
      }
    ]
  }

  /**
   * Analyze tip efficiency 
   */
  analyzeTipEfficiency(userTip: number): {
    efficiency: number
    suggestion: string
    expectedSuccessRate: number
  } {
    const stats = this.getNetworkStats()
    
    let efficiency = 1.0
    let suggestion = 'Optimal tip amount'
    let expectedSuccessRate = 0.5
    
    if (userTip < stats.avgTip * 0.5) {
      efficiency = 0.3
      suggestion = 'Tip too low - likely to fail'
      expectedSuccessRate = 0.2
    } else if (userTip < stats.avgTip) {
      efficiency = 0.6
      suggestion = 'Below average - moderate success chance'
      expectedSuccessRate = 0.5
    } else if (userTip <= stats.recommendedTip) {
      efficiency = 0.9
      suggestion = 'Good tip amount - high success chance'
      expectedSuccessRate = 0.8
    } else if (userTip <= stats.recommendedTip * 2) {
      efficiency = 0.85
      suggestion = 'High tip - very likely to succeed'
      expectedSuccessRate = 0.9
    } else {
      efficiency = 0.7
      suggestion = 'Overpaying - consider reducing tip'
      expectedSuccessRate = 0.95
    }
    
    return { efficiency, suggestion, expectedSuccessRate }
  }
}

export default JitoTipTracker