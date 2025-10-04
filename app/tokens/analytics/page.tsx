'use client'

import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Search, ExternalLink, TrendingUp, Activity, AlertCircle, BarChart3, RefreshCw, Shield, Zap } from 'lucide-react'
import { TokenAnalyticsService, TokenAnalytics } from '@/lib/solana/tokens/analytics-service'

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  supply: string
  verified: boolean
  price?: number
  change24h?: number
  volume24h?: number
  holders?: number
}

export default function TokenAnalysisPage() {
  const { connection } = useConnection()
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [analyticsData, setAnalyticsData] = useState<TokenAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analyticsService, setAnalyticsService] = useState<TokenAnalyticsService | null>(null)

  useEffect(() => {
    if (connection) {
      setAnalyticsService(new TokenAnalyticsService(connection))
    }
  }, [connection])

  const mockTokenData: TokenInfo = {
    address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    name: 'USD Coin',
    symbol: 'USDC',
    decimals: 6,
    supply: '32,456,789,123.45',
    verified: true,
    price: 1.00,
    change24h: 0.02,
    volume24h: 2456789123,
    holders: 1234567
  }

  const handleAnalyze = async () => {
    if (!tokenAddress.trim()) {
      setError('Vui lòng nhập địa chỉ token')
      return
    }

    if (!analyticsService) {
      setError('Chưa kết nối đến Solana network')
      return
    }

    setLoading(true)
    setError('')
    setTokenInfo(null)
    setAnalyticsData(null)

    try {
      // Get comprehensive analytics from our service
      const analytics = await analyticsService.getTokenAnalytics(tokenAddress.trim())
      setAnalyticsData(analytics)

      // Try to get additional price data from Jupiter
      try {
        const { default: JupiterService } = await import('@/lib/solana/defi/jupiter-service')
        const jupiterService = new JupiterService(connection)
        const tokenStats = await jupiterService.getTokenStats(tokenAddress.trim())
        const tokens = await jupiterService.getTokens()
        const tokenMeta = tokens.find(token => token.address === tokenAddress.trim())
        
        // Combine analytics with market data
        const combinedInfo: TokenInfo = {
          address: tokenAddress.trim(),
          name: tokenMeta?.name || analytics.name,
          symbol: tokenMeta?.symbol || analytics.symbol,
          decimals: analytics.decimals,
          supply: analytics.totalSupply.toLocaleString(),
          verified: tokenMeta?.verified || false,
          price: tokenStats?.price || 0,
          change24h: tokenStats?.priceChange24h || 0,
          volume24h: analytics.activity.volume24h,
          holders: analytics.holdersCount
        }
        
        setTokenInfo(combinedInfo)
      } catch (jupiterError) {
        // If Jupiter fails, use analytics data only
        console.warn('Jupiter API unavailable, using analytics data only:', jupiterError)
        const basicInfo: TokenInfo = {
          address: tokenAddress.trim(),
          name: analytics.name,
          symbol: analytics.symbol,
          decimals: analytics.decimals,
          supply: analytics.totalSupply.toLocaleString(),
          verified: false,
          volume24h: analytics.activity.volume24h,
          holders: analytics.holdersCount
        }
        setTokenInfo(basicInfo)
      }
    } catch (error) {
      console.error('Error analyzing token:', error)
      setError(error instanceof Error ? error.message : 'Lỗi khi phân tích token')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number): string => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B'
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K'
    return num.toFixed(2)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          TOKEN ANALYSIS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Analyze SPL token metrics, holder distribution, and market data
        </p>
      </div>

      <div className="space-y-6">
        {/* Search */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                🔍 TOKEN SEARCH
              </h3>
            </div>

            <div className="flex gap-3">
              <div className="flex-1">
                <PixelInput
                  label="TOKEN MINT ADDRESS"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="Enter SPL token mint address"
                />
              </div>
              <div className="flex items-end">
                <PixelButton
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="h-12"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      [ANALYZING...]
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      [ANALYZE]
                    </>
                  )}
                </PixelButton>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-600/10 border-4 border-red-600/20">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="font-mono text-xs text-red-400">{error}</span>
                </div>
              </div>
            )}
          </div>
        </PixelCard>

        {/* Token Info */}
        {tokenInfo && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Basic Info */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📊 BASIC INFO
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 border-2 border-blue-400 flex items-center justify-center">
                        <span className="font-pixel text-xs text-white">
                          {tokenInfo.symbol.slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <div className="font-pixel text-sm text-white">
                          {tokenInfo.name}
                        </div>
                        <div className="font-mono text-xs text-gray-400">
                          ${tokenInfo.symbol}
                        </div>
                      </div>
                      {tokenInfo.verified && (
                        <div className="ml-auto w-2 h-2 bg-green-400 rounded-full"></div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Address:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white">
                            {`${tokenInfo.address.slice(0, 6)}...${tokenInfo.address.slice(-4)}`}
                          </span>
                          <ExternalLink className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400" />
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Decimals:</span>
                        <span className="font-mono text-xs text-white">{tokenInfo.decimals}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Total Supply:</span>
                        <span className="font-mono text-xs text-white">{tokenInfo.supply}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </PixelCard>

              {/* Price Data */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      💰 PRICE DATA
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="font-pixel text-2xl text-white">
                        ${tokenInfo.price?.toFixed(4)}
                      </div>
                      <div className={`font-mono text-sm flex items-center justify-center gap-1 ${
                        (tokenInfo.change24h || 0) >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className="h-4 w-4" />
                        {(tokenInfo.change24h || 0) >= 0 ? '+' : ''}{tokenInfo.change24h?.toFixed(2)}%
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">24h Volume:</span>
                        <span className="font-mono text-xs text-white">
                          ${formatNumber(tokenInfo.volume24h || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Market Cap:</span>
                        <span className="font-mono text-xs text-white">
                          ${formatNumber((tokenInfo.price || 0) * parseFloat(tokenInfo.supply.replace(/,/g, '')))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </PixelCard>

              {/* Holder Stats */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      👥 HOLDER ANALYTICS
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div className="text-center">
                      <div className="font-pixel text-2xl text-white">
                        {formatNumber(tokenInfo.holders || 0)}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        Total Holders
                      </div>
                    </div>

                    {analyticsData && (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Top 10 Hold:</span>
                          <span className="font-mono text-xs text-white">
                            {analyticsData.distribution.top10Percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Top 100 Hold:</span>
                          <span className="font-mono text-xs text-white">
                            {analyticsData.distribution.top100Percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Distribution:</span>
                          <span className={`font-mono text-xs ${
                            analyticsData.distribution.concentrationRisk === 'HIGH' ? 'text-red-400' :
                            analyticsData.distribution.concentrationRisk === 'MEDIUM' ? 'text-yellow-400' : 'text-green-400'
                          }`}>
                            {analyticsData.distribution.concentrationRisk}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Gini Coefficient:</span>
                          <span className="font-mono text-xs text-white">
                            {analyticsData.distribution.giniCoefficient.toFixed(3)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </PixelCard>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Price Chart */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📈 PRICE CHART (24H)
                    </h3>
                  </div>

                  <div className="h-48 flex items-center justify-center border-4 border-gray-700">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <div className="font-pixel text-sm text-gray-500">
                        CHART COMING SOON
                      </div>
                      <div className="font-mono text-xs text-gray-600">
                        Integration with TradingView
                      </div>
                    </div>
                  </div>
                </div>
              </PixelCard>

              {/* Holder Distribution */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📊 HOLDER DISTRIBUTION
                    </h3>
                  </div>

                  {analyticsData ? (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Top 1-10:</span>
                          <span className="font-mono text-xs text-white">
                            {analyticsData.distribution.top10Percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div 
                            className="bg-red-500 h-full" 
                            style={{ width: `${analyticsData.distribution.top10Percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Top 11-100:</span>
                          <span className="font-mono text-xs text-white">
                            {(analyticsData.distribution.top100Percentage - analyticsData.distribution.top10Percentage).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div 
                            className="bg-yellow-500 h-full" 
                            style={{ width: `${analyticsData.distribution.top100Percentage - analyticsData.distribution.top10Percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Others:</span>
                          <span className="font-mono text-xs text-white">
                            {(100 - analyticsData.distribution.top100Percentage).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div 
                            className="bg-green-500 h-full" 
                            style={{ width: `${100 - analyticsData.distribution.top100Percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="pt-3 border-t-4 border-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-yellow-400" />
                          <span className="font-mono text-xs text-yellow-400">
                            Concentration Risk: {analyticsData.distribution.concentrationRisk}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Top 1-10:</span>
                          <span className="font-mono text-xs text-white">45.2%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div className="bg-red-500 h-full" style={{ width: '45.2%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Top 11-100:</span>
                          <span className="font-mono text-xs text-white">32.6%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div className="bg-yellow-500 h-full" style={{ width: '32.6%' }}></div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-400">Others:</span>
                          <span className="font-mono text-xs text-white">22.2%</span>
                        </div>
                        <div className="w-full bg-gray-700 h-2 border-2 border-gray-600">
                          <div className="bg-green-500 h-full" style={{ width: '22.2%' }}></div>
                        </div>
                      </div>

                      <div className="pt-3 border-t-4 border-gray-700">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-yellow-400" />
                          <span className="font-mono text-xs text-yellow-400">
                            Concentration Risk: MEDIUM
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PixelCard>
            </div>

            {/* Advanced Analytics */}
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    🔬 ADVANCED ANALYTICS
                  </h3>
                </div>

                {analyticsData ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-green-400">
                          {analyticsData.liquidity.liquidityScore.toFixed(1)}%
                        </div>
                        <div className="font-mono text-xs text-gray-400">Liquidity Score</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-blue-400">
                          {analyticsData.risk.overallScore.toFixed(1)}
                        </div>
                        <div className="font-mono text-xs text-gray-400">Risk Rating</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-purple-400">
                          {formatNumber(analyticsData.activity.transactions24h)}
                        </div>
                        <div className="font-mono text-xs text-gray-400">24h Transactions</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-yellow-400">
                          {(analyticsData.activity.volatility24h * 100).toFixed(1)}%
                        </div>
                        <div className="font-mono text-xs text-gray-400">24h Volatility</div>
                      </div>
                    </div>

                    {/* Liquidity Analysis */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-pixel text-xs text-green-400 mb-2">LIQUIDITY METRICS:</div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-mono text-xs text-gray-400">DEX Liquidity:</span>
                            <span className="font-mono text-xs text-white">
                              {formatNumber(analyticsData.liquidity.dexLiquidity)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-mono text-xs text-gray-400">Market Cap:</span>
                            <span className="font-mono text-xs text-white">
                              ${formatNumber(analyticsData.liquidity.marketCap)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-mono text-xs text-gray-400">Slippage (1K):</span>
                            <span className="font-mono text-xs text-white">
                              {analyticsData.liquidity.slippageEstimate.buy1000.toFixed(2)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-pixel text-xs text-red-400 mb-2">RISK FACTORS:</div>
                        <div className="space-y-1">
                          {analyticsData.risk.factors.slice(0, 3).map((factor, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="font-mono text-xs text-gray-400">{factor.name}:</span>
                              <span className={`font-mono text-xs ${
                                factor.score > 7 ? 'text-red-400' :
                                factor.score > 4 ? 'text-yellow-400' : 'text-green-400'
                              }`}>
                                {factor.score.toFixed(1)}/10
                              </span>
                            </div>
                          ))}
                        </div>
                        {analyticsData.risk.flags.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-600">
                            <div className="font-pixel text-xs text-red-400 mb-1">WARNINGS:</div>
                            {analyticsData.risk.flags.slice(0, 2).map((flag, idx) => (
                              <div key={idx} className="font-mono text-xs text-red-300">• {flag}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top Holders */}
                    {analyticsData.largestHolders.length > 0 && (
                      <div className="p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-pixel text-xs text-purple-400 mb-3">TOP HOLDERS:</div>
                        <div className="space-y-2">
                          {analyticsData.largestHolders.slice(0, 5).map((holder, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-gray-400">#{idx + 1}</span>
                                <span className="font-mono text-xs text-white">
                                  {holder.address.slice(0, 6)}...{holder.address.slice(-4)}
                                </span>
                                {holder.isContract && (
                                  <span className="font-pixel text-xs text-blue-400">[CONTRACT]</span>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-mono text-xs text-white">
                                  {formatNumber(holder.balance)}
                                </div>
                                <div className="font-mono text-xs text-gray-400">
                                  {holder.percentage.toFixed(2)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t-4 border-gray-700">
                      <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                        <div className="flex items-start gap-2">
                          <Shield className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <div className="font-mono text-xs text-green-400">
                            <strong>Real Analytics:</strong> Dữ liệu phân tích thực tế từ on-chain data. 
                            Bao gồm distribution analysis, risk assessment, và liquidity metrics 
                            được tính toán từ token accounts và holder patterns.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-green-400">92.4%</div>
                        <div className="font-mono text-xs text-gray-400">Liquidity Score</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-blue-400">8.7</div>
                        <div className="font-mono text-xs text-gray-400">Risk Rating</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-purple-400">24.3K</div>
                        <div className="font-mono text-xs text-gray-400">24h Transactions</div>
                      </div>
                      <div className="text-center p-4 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-lg text-yellow-400">99.2%</div>
                        <div className="font-mono text-xs text-gray-400">Uptime</div>
                      </div>
                    </div>

                    <div className="pt-4 border-t-4 border-gray-700">
                      <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <div className="font-mono text-xs text-blue-400">
                            <strong>Note:</strong> Advanced analytics data is currently simulated. 
                            Real-time data integration with Jupiter, Birdeye, and other price APIs 
                            will be available in future versions.
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </PixelCard>
          </>
        )}

        {/* Features Coming Soon */}
        {!tokenInfo && (
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚀 FEATURES PREVIEW
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-pixel text-sm text-white mb-3">IMPLEMENTED:</h4>
                  <div className="space-y-2 font-mono text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Jupiter price API integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Token metadata analysis</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Real-time price data</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Token search functionality</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Basic holder statistics</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Supply and distribution info</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-pixel text-sm text-white mb-3">IN PROGRESS:</h4>
                  <div className="space-y-2 font-mono text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Interactive price charts (TradingView)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Historical price data integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Volume and market cap calculations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Whale movement tracking</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Risk assessment algorithms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        )}
      </div>
    </div>
  )
}