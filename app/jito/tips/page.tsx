'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { TrendingUp, DollarSign, Activity, Clock, AlertTriangle, BarChart3 } from 'lucide-react'

interface TipData {
  timestamp: string
  tip: number
  bundleSuccess: boolean
  blockPosition: number
  validator: string
}

const mockTipData: TipData[] = [
  {
    timestamp: '2024-10-04 14:30:25',
    tip: 0.05,
    bundleSuccess: true,
    blockPosition: 1,
    validator: 'Jito (Mainnet)'
  },
  {
    timestamp: '2024-10-04 14:29:12',
    tip: 0.01,
    bundleSuccess: false,
    blockPosition: 0,
    validator: 'Jito (Mainnet)'
  },
  {
    timestamp: '2024-10-04 14:28:45',
    tip: 0.02,
    bundleSuccess: true,
    blockPosition: 3,
    validator: 'Jito (Mainnet)'
  }
]

export default function JitoTipsPage() {
  const [tipAmount, setTipAmount] = useState('0.01')
  const [selectedTimeframe, setSelectedTimeframe] = useState('1h')
  const [liveData, setLiveData] = useState(mockTipData)

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const newTip: TipData = {
        timestamp: new Date().toLocaleString(),
        tip: Math.random() * 0.1,
        bundleSuccess: Math.random() > 0.3,
        blockPosition: Math.floor(Math.random() * 5) + 1,
        validator: 'Jito (Mainnet)'
      }
      setLiveData(prev => [newTip, ...prev.slice(0, 19)])
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const avgTip = liveData.reduce((sum, data) => sum + data.tip, 0) / liveData.length
  const successRate = (liveData.filter(data => data.bundleSuccess).length / liveData.length) * 100
  const recommendedTip = avgTip * 1.2

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
                  <div className="font-mono text-lg text-yellow-400">~400ms</div>
                  <div className="font-mono text-xs text-gray-400">Avg Block Time</div>
                </div>
              </div>

              <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-blue-400" />
                  <span className="font-pixel text-xs text-blue-400">TIP RECOMMENDATION:</span>
                </div>
                <div className="font-mono text-sm text-blue-300">
                  Based on current network activity, use {recommendedTip.toFixed(4)} SOL for optimal landing probability
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
                      parseFloat(tipAmount) >= recommendedTip ? 'text-green-400' :
                      parseFloat(tipAmount) >= avgTip ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {parseFloat(tipAmount) >= recommendedTip ? 'HIGH (85-95%)' :
                       parseFloat(tipAmount) >= avgTip ? 'MEDIUM (60-80%)' : 'LOW (20-50%)'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Expected Position:</span>
                    <span className="font-mono text-xs text-white">
                      #{parseFloat(tipAmount) >= recommendedTip ? '1-2' :
                        parseFloat(tipAmount) >= avgTip ? '2-4' : '4-8'}
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
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span className="font-mono text-xs text-gray-400">Network Load</span>
                  </div>
                  <span className="font-mono text-xs text-green-400">NORMAL</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-xs text-gray-400">Competition</span>
                  </div>
                  <span className="font-mono text-xs text-yellow-400">MEDIUM</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                    <span className="font-mono text-xs text-gray-400">Volatility</span>
                  </div>
                  <span className="font-mono text-xs text-green-400">LOW</span>
                </div>
              </div>

              <div className="pt-3 border-t-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 text-center">
                  Last updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}