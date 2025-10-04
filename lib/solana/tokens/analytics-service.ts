import { Connection, PublicKey } from '@solana/web3.js'
import { getMint, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token'

export interface TokenAnalytics {
  // Basic token info
  tokenAddress: string
  name: string
  symbol: string
  decimals: number
  totalSupply: number
  
  // On-chain data
  holdersCount: number
  largestHolders: Array<{
    address: string
    balance: number
    percentage: number
    isContract?: boolean
  }>
  
  // Distribution analysis
  distribution: {
    top10Percentage: number
    top100Percentage: number
    giniCoefficient: number // Wealth inequality measure (0 = perfect equality, 1 = maximum inequality)
    concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  }
  
  // Liquidity metrics
  liquidity: {
    dexLiquidity: number
    marketCap: number
    liquidityScore: number // 0-100
    slippageEstimate: {
      buy100: number // % slippage for $100 buy
      buy1000: number // % slippage for $1000 buy
      sell100: number
      sell1000: number
    }
  }
  
  // Activity metrics
  activity: {
    transactions24h: number
    uniqueTraders24h: number
    volume24h: number
    volatility24h: number
    transferCount24h: number
    avgTransactionSize: number
  }
  
  // Risk assessment
  risk: {
    overallScore: number // 0-10 (10 = highest risk)
    factors: Array<{
      name: string
      score: number
      description: string
    }>
    flags: string[]
  }
  
  // Price info (if available)
  price?: {
    current: number
    change24h: number
    change7d?: number
    high24h?: number
    low24h?: number
  }
}

export interface TokenHolder {
  address: string
  balance: number
  percentage: number
  isContract: boolean
  lastActivity?: Date
}

export class TokenAnalyticsService {
  private connection: Connection
  private cache: Map<string, { data: TokenAnalytics; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  // Known program addresses to identify contract holders
  private readonly KNOWN_PROGRAMS = new Set([
    'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', // Token Program
    'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', // Associated Token Program
    '11111111111111111111111111111112', // System Program
    '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', // Raydium
    'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', // Orca
    'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', // Jupiter
  ])

  constructor(connection: Connection) {
    this.connection = connection
  }

  async getTokenAnalytics(tokenMint: string): Promise<TokenAnalytics> {
    // Check cache first
    const cached = this.cache.get(tokenMint)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const mintPubkey = new PublicKey(tokenMint)
      
      // Get basic mint info
      const mintInfo = await getMint(this.connection, mintPubkey)
      
      // Get all token accounts for this mint
      const tokenAccounts = await this.connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
        filters: [
          { dataSize: 165 }, // Token account size
          { memcmp: { offset: 0, bytes: mintPubkey.toBase58() } }, // Filter by mint
        ],
      })

      // Parse holders data
      const holders = await this.parseTokenHolders([...tokenAccounts], mintInfo.decimals)
      
      // Calculate distribution metrics
      const distribution = this.calculateDistribution(holders)
      
      // Calculate activity metrics (simulated for now)
      const activity = this.calculateActivityMetrics(holders, mintInfo)
      
      // Calculate liquidity metrics (simulated)
      const liquidity = await this.calculateLiquidityMetrics(tokenMint, holders, mintInfo)
      
      // Calculate risk assessment
      const risk = this.calculateRiskAssessment(holders, distribution, activity)

      const analytics: TokenAnalytics = {
        tokenAddress: tokenMint,
        name: 'Unknown Token', // Would need token metadata
        symbol: 'UNKNOWN',
        decimals: mintInfo.decimals,
        totalSupply: Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals),
        
        holdersCount: holders.length,
        largestHolders: holders.slice(0, 10),
        
        distribution,
        liquidity,
        activity,
        risk,
      }

      // Cache the result
      this.cache.set(tokenMint, { data: analytics, timestamp: Date.now() })
      
      return analytics
    } catch (error) {
      console.error('Error getting token analytics:', error)
      throw new Error(`Failed to analyze token: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private async parseTokenHolders(tokenAccounts: any[], decimals: number): Promise<TokenHolder[]> {
    const holders: TokenHolder[] = []
    
    for (const account of tokenAccounts) {
      try {
        const accountData = await getAccount(this.connection, account.pubkey)
        
        if (accountData.amount > 0) {
          const balance = Number(accountData.amount) / Math.pow(10, decimals)
          
          holders.push({
            address: accountData.owner.toBase58(),
            balance,
            percentage: 0, // Will be calculated later
            isContract: this.KNOWN_PROGRAMS.has(accountData.owner.toBase58()),
          })
        }
      } catch (error) {
        // Skip invalid accounts
        continue
      }
    }

    // Sort by balance and calculate percentages
    holders.sort((a, b) => b.balance - a.balance)
    const totalSupply = holders.reduce((sum, holder) => sum + holder.balance, 0)
    
    holders.forEach(holder => {
      holder.percentage = (holder.balance / totalSupply) * 100
    })

    return holders
  }

  private calculateDistribution(holders: TokenHolder[]) {
    const totalBalance = holders.reduce((sum, holder) => sum + holder.balance, 0)
    
    // Calculate top 10 and top 100 percentages
    const top10Balance = holders.slice(0, 10).reduce((sum, holder) => sum + holder.balance, 0)
    const top100Balance = holders.slice(0, 100).reduce((sum, holder) => sum + holder.balance, 0)
    
    const top10Percentage = (top10Balance / totalBalance) * 100
    const top100Percentage = (top100Balance / totalBalance) * 100
    
    // Calculate Gini coefficient (simplified)
    const giniCoefficient = this.calculateGiniCoefficient(holders)
    
    // Determine concentration risk
    let concentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
    if (top10Percentage > 70) concentrationRisk = 'HIGH'
    else if (top10Percentage > 50) concentrationRisk = 'MEDIUM'

    return {
      top10Percentage,
      top100Percentage,
      giniCoefficient,
      concentrationRisk
    }
  }

  private calculateGiniCoefficient(holders: TokenHolder[]): number {
    if (holders.length === 0) return 0
    
    // Sort holders by balance
    const sortedHolders = [...holders].sort((a, b) => a.balance - b.balance)
    const n = sortedHolders.length
    const totalWealth = sortedHolders.reduce((sum, holder) => sum + holder.balance, 0)
    
    let gini = 0
    for (let i = 0; i < n; i++) {
      gini += (2 * (i + 1) - n - 1) * sortedHolders[i].balance
    }
    
    return gini / (n * totalWealth)
  }

  private calculateActivityMetrics(holders: TokenHolder[], mintInfo: any) {
    // This would normally require historical transaction data
    // For now, we'll use statistical models based on holder count
    
    const holderCount = holders.length
    const topHolderBalance = holders[0]?.balance || 0
    
    // Estimate daily activity based on holder distribution
    const estimatedTransactions24h = Math.floor(holderCount * 0.15) // 15% daily activity rate
    const estimatedUniqueTraders = Math.floor(holderCount * 0.08) // 8% daily trader rate
    const avgTransactionSize = topHolderBalance * 0.001 // Estimate based on top holder
    
    return {
      transactions24h: estimatedTransactions24h,
      uniqueTraders24h: estimatedUniqueTraders,
      volume24h: estimatedTransactions24h * avgTransactionSize,
      volatility24h: this.calculateVolatilityEstimate(holders),
      transferCount24h: estimatedTransactions24h,
      avgTransactionSize
    }
  }

  private calculateVolatilityEstimate(holders: TokenHolder[]): number {
    // Estimate volatility based on holder concentration
    const top10Concentration = holders.slice(0, 10).reduce((sum, h) => sum + h.percentage, 0)
    
    // Higher concentration typically means higher volatility
    if (top10Concentration > 80) return 0.35 // 35% daily volatility
    if (top10Concentration > 60) return 0.25 // 25% daily volatility
    if (top10Concentration > 40) return 0.15 // 15% daily volatility
    return 0.08 // 8% daily volatility
  }

  private async calculateLiquidityMetrics(tokenMint: string, holders: TokenHolder[], mintInfo: any) {
    // This would normally integrate with DEX APIs
    // For now, we'll estimate based on holder distribution
    
    const totalSupply = Number(mintInfo.supply) / Math.pow(10, mintInfo.decimals)
    const circulatingSupply = totalSupply * 0.85 // Assume 15% locked/burned
    
    // Estimate liquidity based on holder count and distribution
    const liquidityEstimate = circulatingSupply * 0.1 // 10% of circulating supply in liquidity
    const marketCap = circulatingSupply * 1.0 // Assume $1 price for calculation
    
    // Calculate liquidity score (0-100)
    const liquidityRatio = liquidityEstimate / circulatingSupply
    const liquidityScore = Math.min(liquidityRatio * 1000, 100) // Scale to 0-100
    
    return {
      dexLiquidity: liquidityEstimate,
      marketCap,
      liquidityScore,
      slippageEstimate: {
        buy100: this.estimateSlippage(100, liquidityEstimate),
        buy1000: this.estimateSlippage(1000, liquidityEstimate),
        sell100: this.estimateSlippage(100, liquidityEstimate) * 1.2, // Slightly higher for sells
        sell1000: this.estimateSlippage(1000, liquidityEstimate) * 1.2,
      }
    }
  }

  private estimateSlippage(tradeSize: number, liquidity: number): number {
    // Simple slippage model: slippage increases with trade size vs liquidity
    const impact = tradeSize / liquidity
    return Math.min(impact * 100, 50) // Cap at 50% slippage
  }

  private calculateRiskAssessment(
    holders: TokenHolder[], 
    distribution: any, 
    activity: any
  ) {
    const riskFactors = []
    let totalRisk = 0

    // Concentration risk
    const concentrationRisk = distribution.top10Percentage > 70 ? 8 : 
                             distribution.top10Percentage > 50 ? 5 : 2
    riskFactors.push({
      name: 'Holder Concentration',
      score: concentrationRisk,
      description: `Top 10 holders control ${distribution.top10Percentage.toFixed(1)}% of supply`
    })
    totalRisk += concentrationRisk

    // Liquidity risk
    const liquidityRisk = activity.volume24h < 1000 ? 6 : 
                         activity.volume24h < 10000 ? 3 : 1
    riskFactors.push({
      name: 'Liquidity Risk',
      score: liquidityRisk,
      description: `24h volume: $${activity.volume24h.toFixed(0)}`
    })
    totalRisk += liquidityRisk

    // Activity risk
    const activityRisk = activity.transactions24h < 100 ? 5 : 
                        activity.transactions24h < 1000 ? 2 : 0
    riskFactors.push({
      name: 'Activity Level',
      score: activityRisk,
      description: `${activity.transactions24h} transactions in 24h`
    })
    totalRisk += activityRisk

    // Holder count risk
    const holderRisk = holders.length < 100 ? 7 : 
                      holders.length < 1000 ? 3 : 1
    riskFactors.push({
      name: 'Holder Diversity',
      score: holderRisk,
      description: `${holders.length} total holders`
    })
    totalRisk += holderRisk

    const averageRisk = totalRisk / riskFactors.length
    
    // Generate risk flags
    const flags = []
    if (distribution.concentrationRisk === 'HIGH') {
      flags.push('High holder concentration')
    }
    if (activity.volume24h < 1000) {
      flags.push('Low trading volume')
    }
    if (holders.length < 100) {
      flags.push('Small holder base')
    }

    return {
      overallScore: Math.round(averageRisk * 10) / 10,
      factors: riskFactors,
      flags
    }
  }

  // Utility method to get basic token info from Jupiter
  async getTokenMetadata(tokenMint: string): Promise<{name: string, symbol: string, verified: boolean}> {
    try {
      // This would integrate with Jupiter token list API
      // For now return default values
      return {
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        verified: false
      }
    } catch (error) {
      return {
        name: 'Unknown Token',
        symbol: 'UNKNOWN',
        verified: false
      }
    }
  }

  // Clear cache when needed
  clearCache() {
    this.cache.clear()
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys())
    }
  }
}