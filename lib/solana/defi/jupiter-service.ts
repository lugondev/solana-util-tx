import { Connection, PublicKey } from '@solana/web3.js'

export interface JupiterQuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: RouteStep[]
  contextSlot: number
  timeTaken: number
}

export interface RouteStep {
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
}

export interface JupiterTokenInfo {
  address: string
  chainId: number
  decimals: number
  name: string
  symbol: string
  logoURI?: string
  tags?: string[]
  verified?: boolean
  holders?: number
}

export interface JupiterPriceData {
  id: string
  mintSymbol: string
  vsToken: string
  vsTokenSymbol: string
  price: number
}

export interface LimitOrderData {
  publicKey: string
  account: {
    maker: string
    inputMint: string
    outputMint: string
    waiting: string
    oriInAmount: string
    oriOutAmount: string
    inAmount: string
    outAmount: string
    expiredAt?: string
    base: string
  }
}

export class JupiterService {
  private connection: Connection
  private baseUrl: string = 'https://quote-api.jup.ag/v6'
  private priceApiUrl: string = 'https://price.jup.ag/v4'

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Get swap quote from Jupiter
   */
  async getQuote(
    inputMint: string,
    outputMint: string,
    amount: string,
    slippageBps: number = 50
  ): Promise<JupiterQuoteResponse | null> {
    try {
      const params = new URLSearchParams({
        inputMint,
        outputMint,
        amount,
        slippageBps: slippageBps.toString(),
      })

      const response = await fetch(`${this.baseUrl}/quote?${params}`)
      
      if (!response.ok) {
        throw new Error(`Jupiter quote failed: ${response.statusText}`)
      }

      const quoteData = await response.json()
      return quoteData as JupiterQuoteResponse
    } catch (error) {
      console.error('Error getting Jupiter quote:', error)
      return null
    }
  }

  /**
   * Get all tokens supported by Jupiter
   */
  async getTokens(): Promise<JupiterTokenInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tokens`)
      
      if (!response.ok) {
        throw new Error(`Jupiter tokens request failed: ${response.statusText}`)
      }

      const tokens = await response.json()
      return tokens as JupiterTokenInfo[]
    } catch (error) {
      console.error('Error getting Jupiter tokens:', error)
      return []
    }
  }

  /**
   * Get token price data
   */
  async getPrice(ids: string[]): Promise<{ [key: string]: JupiterPriceData }> {
    try {
      const params = new URLSearchParams({
        ids: ids.join(','),
      })

      const response = await fetch(`${this.priceApiUrl}/price?${params}`)
      
      if (!response.ok) {
        throw new Error(`Jupiter price request failed: ${response.statusText}`)
      }

      const priceData = await response.json()
      return priceData.data || {}
    } catch (error) {
      console.error('Error getting Jupiter prices:', error)
      return {}
    }
  }

  /**
   * Get historical price data
   */
  async getHistoricalPrice(
    id: string,
    timeframe: '1H' | '4H' | '1D' | '1W' | '1M' = '1D'
  ): Promise<Array<{ unixTime: number; price: number }>> {
    try {
      const response = await fetch(
        `${this.priceApiUrl}/candles?id=${id}&timeframe=${timeframe}`
      )
      
      if (!response.ok) {
        throw new Error(`Jupiter historical price request failed: ${response.statusText}`)
      }

      const candleData = await response.json()
      return candleData.data || []
    } catch (error) {
      console.error('Error getting Jupiter historical prices:', error)
      return []
    }
  }

  /**
   * Search tokens by query
   */
  async searchTokens(query: string): Promise<JupiterTokenInfo[]> {
    try {
      const allTokens = await this.getTokens()
      
      const filteredTokens = allTokens.filter(token => 
        token.name.toLowerCase().includes(query.toLowerCase()) ||
        token.symbol.toLowerCase().includes(query.toLowerCase()) ||
        token.address.toLowerCase().includes(query.toLowerCase())
      )

      return filteredTokens.slice(0, 20) // Limit results
    } catch (error) {
      console.error('Error searching Jupiter tokens:', error)
      return []
    }
  }

  /**
   * Get popular tokens
   */
  async getPopularTokens(): Promise<JupiterTokenInfo[]> {
    try {
      const allTokens = await this.getTokens()
      
      // Filter for verified and popular tokens
      const popularTokens = allTokens.filter(token => 
        token.verified && 
        (token.holders || 0) > 1000
      )

      return popularTokens
        .sort((a, b) => (b.holders || 0) - (a.holders || 0))
        .slice(0, 50)
    } catch (error) {
      console.error('Error getting popular Jupiter tokens:', error)
      return []
    }
  }

  /**
   * Build swap transaction
   */
  async buildSwapTransaction(
    quoteResponse: JupiterQuoteResponse,
    userPublicKey: string,
    wrapAndUnwrapSol: boolean = true
  ): Promise<{ swapTransaction: string } | null> {
    try {
      const response = await fetch(`${this.baseUrl}/swap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey,
          wrapAndUnwrapSol,
        }),
      })

      if (!response.ok) {
        throw new Error(`Jupiter swap transaction failed: ${response.statusText}`)
      }

      const swapData = await response.json()
      return swapData
    } catch (error) {
      console.error('Error building Jupiter swap transaction:', error)
      return null
    }
  }

  /**
   * Get limit orders (simplified implementation)
   */
  async getLimitOrders(
    walletAddress?: string,
    inputMint?: string,
    outputMint?: string
  ): Promise<LimitOrderData[]> {
    try {
      // Note: Jupiter Limit Orders API might have different endpoints
      // This is a placeholder implementation
      console.log('Getting limit orders - feature requires Jupiter Limit Orders integration')
      
      // Mock response for now
      return []
    } catch (error) {
      console.error('Error getting Jupiter limit orders:', error)
      return []
    }
  }

  /**
   * Create limit order (simplified implementation)
   */
  async createLimitOrder(
    inputMint: string,
    outputMint: string,
    inAmount: string,
    outAmount: string,
    expiredAt?: number
  ): Promise<{ signature?: string; error?: string }> {
    try {
      // Note: Jupiter Limit Orders require specific implementation
      // This is a placeholder for the actual API integration
      console.log('Creating limit order - feature requires Jupiter Limit Orders integration')
      
      return {
        error: 'Limit orders feature requires integration with Jupiter Limit Orders API'
      }
    } catch (error) {
      console.error('Error creating Jupiter limit order:', error)
      return {
        error: 'Failed to create limit order'
      }
    }
  }

  /**
   * Cancel limit order (simplified implementation)
   */
  async cancelLimitOrder(orderPublicKey: string): Promise<{ signature?: string; error?: string }> {
    try {
      console.log('Canceling limit order - feature requires Jupiter Limit Orders integration')
      
      return {
        error: 'Limit orders feature requires integration with Jupiter Limit Orders API'
      }
    } catch (error) {
      console.error('Error canceling Jupiter limit order:', error)
      return {
        error: 'Failed to cancel limit order'
      }
    }
  }

  /**
   * Get swap history for a wallet
   */
  async getSwapHistory(walletAddress: string, limit: number = 20): Promise<any[]> {
    try {
      // Note: This would require Jupiter's transaction history API
      console.log('Getting swap history - feature requires additional API integration')
      
      return []
    } catch (error) {
      console.error('Error getting Jupiter swap history:', error)
      return []
    }
  }

  /**
   * Get token stats
   */
  async getTokenStats(mintAddress: string): Promise<{
    volume24h?: number
    holders?: number
    marketCap?: number
    price?: number
    priceChange24h?: number
  } | null> {
    try {
      // Get price data
      const priceData = await this.getPrice([mintAddress])
      const tokenPrice = priceData[mintAddress]

      if (!tokenPrice) {
        return null
      }

      // Note: Additional stats would require other APIs or data sources
      return {
        price: tokenPrice.price,
        // volume24h, holders, marketCap would need additional API calls
      }
    } catch (error) {
      console.error('Error getting Jupiter token stats:', error)
      return null
    }
  }
}

export default JupiterService