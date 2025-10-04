'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Search, ExternalLink, TrendingUp, Activity, AlertCircle, BarChart3, RefreshCw } from 'lucide-react'

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
  const [tokenAddress, setTokenAddress] = useState('')
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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
      setError('Please enter a token address')
      return
    }

    setLoading(true)
    setError('')

    // Simulate API call
    setTimeout(() => {
      setTokenInfo(mockTokenData)
      setLoading(false)
    }, 2000)
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
                      👥 HOLDER STATS
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

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Top 10 Hold:</span>
                        <span className="font-mono text-xs text-white">67.8%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Top 100 Hold:</span>
                        <span className="font-mono text-xs text-white">89.2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-mono text-xs text-gray-400">Distribution:</span>
                        <span className="font-mono text-xs text-yellow-400">CONCENTRATED</span>
                      </div>
                    </div>
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
                  <h4 className="font-pixel text-sm text-white mb-3">CURRENT FEATURES:</h4>
                  <div className="space-y-2 font-mono text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-green-400 mt-0.5">✓</span>
                      <span>Token metadata analysis</span>
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
                  <h4 className="font-pixel text-sm text-white mb-3">COMING SOON:</h4>
                  <div className="space-y-2 font-mono text-xs text-gray-400">
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Real-time price data integration</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-yellow-400 mt-0.5">⏳</span>
                      <span>Interactive price charts</span>
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