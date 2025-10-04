'use client'

import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { TrendingUp, DollarSign, Activity, Clock, AlertTriangle, BarChart3 } from 'lucide-react'
import JitoTipTracker, { JitoTipData, JitoNetworkStats } from '@/lib/solana/jito/tip-tracker'

export default function JitoTipsPage() {
  const { connection } = useConnection()
  const [tipAmount, setTipAmount] = useState('0.01')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [liveData, setLiveData] = useState<JitoTipData[]>([])
  const [networkStats, setNetworkStats] = useState<JitoNetworkStats | null>(null)
  const [tipTracker] = useState(() => new JitoTipTracker(connection))
  const [isTracking, setIsTracking] = useState(false)

  // Initialize tip tracking
  useEffect(() => {
    if (!isTracking) {
      setIsTracking(true)
      tipTracker.startTracking((newTip) => {
        setLiveData(prev => [newTip, ...prev.slice(0, 19)])
        setNetworkStats(tipTracker.getNetworkStats())
      })

      // Load initial data
      const initialData = tipTracker.getTipHistory()
      setLiveData(initialData)
      setNetworkStats(tipTracker.getNetworkStats())
    }

    return () => {
      tipTracker.stopTracking()
      setIsTracking(false)
    }
  }, [tipTracker, isTracking])

  const avgTip = networkStats?.avgTip || 0.01
  const successRate = networkStats?.successRate || 75
  const recommendedTip = networkStats?.recommendedTip || 0.02

  // Analyze current tip
  const tipAnalysis = tipTracker.analyzeTipEfficiency(parseFloat(tipAmount))

  // Get tip recommendation
  const recommendation = tipTracker.getTipRecommendation(0.85)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          JITO TIP TRACKER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Monitor and optimize your Jito bundle tips for maximum success rate
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Stats */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📊 CURRENT NETWORK STATS
                </h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-green-400">{avgTip.toFixed(4)}</div>
                  <div className="font-mono text-xs text-gray-400">Avg Tip (SOL)</div>
                </div>
                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-blue-400">{successRate.toFixed(1)}%</div>
                  <div className="font-mono text-xs text-gray-400">Success Rate</div>
                </div>
                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-purple-400">{recommendedTip.toFixed(4)}</div>
                  <div className="font-mono text-xs text-gray-400">Recommended</div>
                </div>
                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-yellow-400">~{networkStats?.blockTime || 400}ms</div>
                  <div className="font-mono text-xs text-gray-400">Avg Block Time</div>
                </div>
              </div>

              <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="font-pixel text-xs text-blue-400">LIVE TIP ANALYSIS:</span>
                </div>
                <div className="font-mono text-xs text-blue-300">
                  Based on {liveData.length} recent bundles, recommended tip is {recommendation.tip.toFixed(4)} SOL 
                  for {(recommendation.confidence * 100).toFixed(0)}% confidence. {recommendation.reasoning}
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Live Tips Feed */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                <h3 className="font-pixel text-sm text-green-400">
                  📡 LIVE TIPS FEED
                </h3>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-pixel text-xs text-white"
                >
                  <option value="5m">Last 5 minutes</option>
                  <option value="1h">Last 1 hour</option>
                  <option value="24h">Last 24 hours</option>
                </select>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {liveData.map((tip, index) => (
                  <div
                    key={index}
                    className={`p-3 border-4 ${tip.bundleSuccess ? 'border-green-600/30 bg-green-600/5' : 'border-red-600/30 bg-red-600/5'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${tip.bundleSuccess ? 'bg-green-400' : 'bg-red-400'}`}></div>
                        <span className="font-mono text-xs text-gray-400">{tip.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`font-mono text-sm ${tip.bundleSuccess ? 'text-green-400' : 'text-red-400'}`}>
                          {tip.tip.toFixed(4)} SOL
                        </span>
                        <span className="font-mono text-xs text-gray-500">
                          #{tip.blockPosition}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Tools */}
        <div className="space-y-6">
          {/* Tip Calculator */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🧮 TIP CALCULATOR
                </h3>
              </div>

              <div className="space-y-3">
                <PixelInput
                  label="TIP AMOUNT (SOL)"
                  type="number"
                  value={tipAmount}
                  onChange={(e) => setTipAmount(e.target.value)}
                  placeholder="0.01"
                  min="0"
                  step="0.001"
                />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Success Probability:</span>
                    <span className={`font-mono text-xs ${
                      tipAnalysis.expectedSuccessRate >= 0.8 ? 'text-green-400' :
                      tipAnalysis.expectedSuccessRate >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {(tipAnalysis.expectedSuccessRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Efficiency:</span>
                    <span className={`font-mono text-xs ${
                      tipAnalysis.efficiency >= 0.8 ? 'text-green-400' :
                      tipAnalysis.efficiency >= 0.6 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {(tipAnalysis.efficiency * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Suggestion:</span>
                    <span className="font-mono text-xs text-white text-right">
                      {tipAnalysis.suggestion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Cost (USD):</span>
                    <span className="font-mono text-xs text-white">
                      ~${(parseFloat(tipAmount) * 150).toFixed(2)}
                    </span>
                  </div>
                </div>

                <PixelButton
                  variant="primary"
                  disabled
                  className="w-full"
                >
                  [SUBMIT WITH TIP]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Tip Strategies */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🎯 TIP STRATEGIES
                </h3>
              </div>

              <div className="space-y-3">
                <button className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Activity className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">CONSERVATIVE</div>
                      <div className="font-mono text-xs text-gray-400">
                        0.005-0.01 SOL • ~60% success
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-4 w-4 text-yellow-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">BALANCED</div>
                      <div className="font-mono text-xs text-gray-400">
                        0.02-0.05 SOL • ~80% success
                      </div>
                    </div>
                  </div>
                </button>

                <button className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">AGGRESSIVE</div>
                      <div className="font-mono text-xs text-gray-400">
                        0.1+ SOL • ~95% success
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>

          {/* Market Conditions */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🌡️ MARKET CONDITIONS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      networkStats?.competition === 'LOW' ? 'bg-green-400' :
                      networkStats?.competition === 'MEDIUM' ? 'bg-yellow-400' : 'bg-red-400'
                    }`}></div>
                    <span className="font-mono text-xs text-gray-400">Network Load</span>
                  </div>
                  <span className={`font-mono text-xs ${
                    networkStats?.competition === 'LOW' ? 'text-green-400' :
                    networkStats?.competition === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{networkStats?.competition || 'MEDIUM'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-xs text-gray-400">Competition</span>
                  </div>
                  <span className={`font-mono text-xs ${
                    networkStats?.competition === 'LOW' ? 'text-green-400' :
                    networkStats?.competition === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{networkStats?.competition || 'MEDIUM'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    <span className="font-mono text-xs text-gray-400">Volatility</span>
                  </div>
                  <span className={`font-mono text-xs ${
                    networkStats?.volatility === 'LOW' ? 'text-green-400' :
                    networkStats?.volatility === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'
                  }`}>{networkStats?.volatility || 'LOW'}</span>
                </div>
              </div>

              <div className="pt-3 border-t-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 text-center">
                  Last updated: {new Date().toLocaleTimeString()} (Live data)
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}