'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Package, Layers, TrendingUp, Clock, AlertCircle, Zap } from 'lucide-react'

interface BundleTransaction {
  id: string
  signature: string
  type: 'swap' | 'transfer' | 'mint' | 'burn'
  estimatedCU: number
  priority: 'high' | 'medium' | 'low'
}

export default function JitoBundlePage() {
  const [transactions, setTransactions] = useState<BundleTransaction[]>([])
  const [bundleTip, setBundleTip] = useState('0.001')
  const [maxRetries, setMaxRetries] = useState('3')
  const [isBuilding, setIsBuilding] = useState(false)

  const addTransaction = () => {
    const newTx: BundleTransaction = {
      id: `tx_${Date.now()}`,
      signature: '',
      type: 'swap',
      estimatedCU: 200000,
      priority: 'medium'
    }
    setTransactions([...transactions, newTx])
  }

  const removeTransaction = (id: string) => {
    setTransactions(transactions.filter(tx => tx.id !== id))
  }

  const updateTransaction = (id: string, updates: Partial<BundleTransaction>) => {
    setTransactions(transactions.map(tx => 
      tx.id === id ? { ...tx, ...updates } : tx
    ))
  }

  const totalCU = transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
  const estimatedCost = parseFloat(bundleTip) + (totalCU * 0.000001)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          JITO BUNDLE BUILDER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Build and submit transaction bundles for priority execution via Jito
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Bundle Configuration */}
        <div className="space-y-6">
          {/* Bundle Settings */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ⚙️ BUNDLE SETTINGS
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PixelInput
                  label="BUNDLE TIP (SOL)"
                  type="number"
                  value={bundleTip}
                  onChange={(e) => setBundleTip(e.target.value)}
                  placeholder="0.001"
                  min="0"
                  step="0.001"
                />
                <PixelInput
                  label="MAX RETRIES"
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(e.target.value)}
                  placeholder="3"
                  min="1"
                  max="10"
                />
              </div>

              <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                <div className="font-mono text-xs text-blue-400 mb-1">
                  💡 TIP GUIDELINES:
                </div>
                <div className="font-mono text-xs text-blue-300 space-y-1">
                  <div>• Normal traffic: 0.001-0.005 SOL</div>
                  <div>• High traffic: 0.01-0.1 SOL</div>
                  <div>• Critical timing: 0.1+ SOL</div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Transaction List */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                <h3 className="font-pixel text-sm text-green-400">
                  📦 TRANSACTIONS ({transactions.length})
                </h3>
                <PixelButton
                  onClick={addTransaction}
                  variant="secondary"
                  className="text-xs"
                >
                  [ADD TX]
                </PixelButton>
              </div>

              <div className="space-y-3">
                {transactions.map((tx, index) => (
                  <div key={tx.id} className="p-3 border-4 border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-pixel text-xs text-white">
                        TRANSACTION #{index + 1}
                      </span>
                      <button
                        onClick={() => removeTransaction(tx.id)}
                        className="text-red-400 hover:text-red-300 font-pixel text-xs"
                      >
                        [REMOVE]
                      </button>
                    </div>

                    <div className="space-y-2">
                      <select
                        value={tx.type}
                        onChange={(e) => updateTransaction(tx.id, { type: e.target.value as any })}
                        className="w-full px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                      >
                        <option value="swap">Token Swap</option>
                        <option value="transfer">Transfer</option>
                        <option value="mint">Mint Token</option>
                        <option value="burn">Burn Token</option>
                      </select>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="number"
                          value={tx.estimatedCU}
                          onChange={(e) => updateTransaction(tx.id, { estimatedCU: parseInt(e.target.value) || 0 })}
                          placeholder="Compute Units"
                          className="px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                        />
                        <select
                          value={tx.priority}
                          onChange={(e) => updateTransaction(tx.id, { priority: e.target.value as any })}
                          className="px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                        >
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium Priority</option>
                          <option value="high">High Priority</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {transactions.length === 0 && (
                  <div className="text-center py-8 border-4 border-dashed border-gray-700">
                    <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <div className="font-mono text-sm text-gray-500">
                      No transactions in bundle
                    </div>
                    <div className="font-mono text-xs text-gray-600 mt-1">
                      Add transactions to start building your bundle
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Bundle Summary & Actions */}
        <div className="space-y-6">
          {/* Bundle Summary */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📊 BUNDLE SUMMARY
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-lg text-white">{transactions.length}</div>
                    <div className="font-mono text-xs text-gray-400">Transactions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-lg text-green-400">{totalCU.toLocaleString()}</div>
                    <div className="font-mono text-xs text-gray-400">Total CU</div>
                  </div>
                </div>

                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-blue-400">~{estimatedCost.toFixed(6)} SOL</div>
                  <div className="font-mono text-xs text-gray-400">Estimated Cost</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Bundle Tip:</span>
                    <span className="font-mono text-xs text-white">{bundleTip} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Compute Cost:</span>
                    <span className="font-mono text-xs text-white">~{(totalCU * 0.000001).toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Priority Level:</span>
                    <span className={`font-mono text-xs ${
                      parseFloat(bundleTip) >= 0.1 ? 'text-red-400' : 
                      parseFloat(bundleTip) >= 0.01 ? 'text-yellow-400' : 'text-green-400'
                    }`}>
                      {parseFloat(bundleTip) >= 0.1 ? 'CRITICAL' : 
                       parseFloat(bundleTip) >= 0.01 ? 'HIGH' : 'NORMAL'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Bundle Actions */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚀 BUNDLE ACTIONS
                </h3>
              </div>

              <div className="space-y-3">
                <PixelButton
                  disabled={transactions.length === 0}
                  className="w-full"
                >
                  <Layers className="h-4 w-4" />
                  [SIMULATE BUNDLE]
                </PixelButton>

                <PixelButton
                  disabled={transactions.length === 0 || isBuilding}
                  className="w-full"
                >
                  {isBuilding ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      [BUILDING...]
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4" />
                      [BUILD & SUBMIT]
                    </>
                  )}
                </PixelButton>

                <div className="text-center">
                  <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 font-pixel text-xs">
                    COMING SOON
                  </span>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Jito Status */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📡 JITO STATUS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="font-mono text-xs text-gray-400">Network Status</span>
                  </div>
                  <span className="font-mono text-xs text-green-400">OPERATIONAL</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span className="font-mono text-xs text-gray-400">Block Time</span>
                  </div>
                  <span className="font-mono text-xs text-white">~400ms</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-purple-400" />
                    <span className="font-mono text-xs text-gray-400">Bundle Success Rate</span>
                  </div>
                  <span className="font-mono text-xs text-white">94.2%</span>
                </div>

                <div className="pt-3 border-t-4 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 text-center">
                    Real-time data from Jito validators
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ JITO BUNDLES
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Bundle transactions for atomic execution</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Skip mempool with direct validator submission</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Higher tips = better landing probability</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Failed bundles don't charge fees</span>
                </div>
              </div>

              <div className="pt-3 border-t-4 border-gray-700">
                <div className="p-3 bg-yellow-600/10 border-4 border-yellow-600/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="font-mono text-xs text-yellow-400">
                      <strong>Beta Feature:</strong> Jito bundle integration is currently 
                      in development. This interface shows the planned functionality.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}