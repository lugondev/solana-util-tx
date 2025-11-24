'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useNetwork } from '@/contexts/NetworkContext'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button'
import { JitoRegionSelector } from '@/components/jito/jito-region-selector'
import { BundleTransactionBuilder } from '@/components/jito/bundle-transaction-builder'
import { useJitoBundle } from '@/hooks/useJitoBundle'
import { BundleTransaction } from '@/lib/solana/jito/bundle-service'
import { JITO_TIP_PRESETS, JitoTipPreset } from '@/lib/solana/jito/config'
import { 
  Layers, 
  Zap, 
  TrendingUp, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  ExternalLink,
  Loader2,
  DollarSign
} from 'lucide-react'

export default function JitoBundlePage() {
  const { connected, publicKey } = useWallet()
  const { network } = useNetwork()
  const [transactions, setTransactions] = useState<BundleTransaction[]>([])
  const [selectedTipPreset, setSelectedTipPreset] = useState<JitoTipPreset>('standard')
  const [customTip, setCustomTip] = useState('')
  const [useCustomTip, setUseCustomTip] = useState(false)
  const [customEndpoint, setCustomEndpoint] = useState('')
  
  const {
    isSimulating,
    isSubmitting,
    error,
    lastResult,
    config,
    updateConfig,
    simulateBundle,
    submitBundle,
    estimateCost,
    reset
  } = useJitoBundle()

  // Check if Jito is supported on current network
  const isJitoSupported = network === 'mainnet-beta' || network === 'testnet'

  const currentTip = useCustomTip 
    ? parseFloat(customTip) || 0
    : JITO_TIP_PRESETS[selectedTipPreset].amount

  const handleTipPresetChange = (preset: JitoTipPreset) => {
    setSelectedTipPreset(preset)
    setUseCustomTip(false)
    updateConfig({ tip: JITO_TIP_PRESETS[preset].amount })
  }

  const handleCustomTipChange = (value: string) => {
    setCustomTip(value)
    const tipAmount = parseFloat(value) || 0
    updateConfig({ tip: tipAmount })
  }

  const handleRegionChange = (region: string) => {
    updateConfig({ region })
  }

  const handleSimulate = async () => {
    if (transactions.length === 0) return
    
    try {
      const result = await simulateBundle(transactions)
      console.log('Simulation result:', result)
    } catch (error) {
      console.error('Simulation failed:', error)
    }
  }

  const handleSubmit = async () => {
    if (transactions.length === 0) return
    
    try {
      const result = await submitBundle(transactions)
      console.log('Bundle result:', result)
    } catch (error) {
      console.error('Bundle submission failed:', error)
    }
  }

  const getTotalCost = () => {
    return estimateCost(transactions)
  }

  const getPriorityLevel = (tip: number) => {
    if (tip >= 0.1) return { level: 'CRITICAL', color: 'text-red-400' }
    if (tip >= 0.01) return { level: 'HIGH', color: 'text-yellow-400' } 
    if (tip >= 0.005) return { level: 'NORMAL', color: 'text-green-400' }
    return { level: 'LOW', color: 'text-gray-400' }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          JITO BUNDLE BUILDER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Build and submit transaction bundles for priority execution via Jito MEV protection
        </p>
      </div>

      {!connected && (
        <div className="mb-8">
          <PixelCard>
            <div className="text-center py-8">
              <h3 className="font-pixel text-lg text-yellow-400 mb-4">
                🔗 WALLET CONNECTION REQUIRED
              </h3>
              <p className="font-mono text-sm text-gray-400 mb-6">
                Connect your wallet to start building and submitting Jito bundles
              </p>
              <PixelWalletButton variant="success" />
            </div>
          </PixelCard>
        </div>
      )}

      {!isJitoSupported && (
        <div className="mb-8">
          <PixelCard>
            <div className="p-4 bg-yellow-600/10 border-4 border-yellow-600/30">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-pixel text-sm text-yellow-400 mb-2">
                    ⚠️ JITO NOT AVAILABLE ON {network.toUpperCase()}
                  </h3>
                  <p className="font-mono text-xs text-yellow-300 mb-3">
                    Jito MEV bundles are only supported on Mainnet Beta and Testnet networks.
                  </p>
                  <p className="font-mono text-xs text-gray-400">
                    Please switch to Mainnet Beta or Testnet to use Jito bundle features.
                  </p>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Configuration */}
        <div className="xl:col-span-1 space-y-6">
          {/* Region Selection */}
          <JitoRegionSelector
            selectedRegion={config.region}
            onRegionChange={handleRegionChange}
            customEndpoint={customEndpoint}
            onCustomEndpointChange={setCustomEndpoint}
          />

          {/* Tip Configuration */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  TIP CONFIGURATION
                </h3>
              </div>

              {!isJitoSupported && (
                <div className="p-3 bg-red-600/10 border-4 border-red-600/20">
                  <div className="font-mono text-xs text-red-400 text-center">
                    ⚠️ Feature disabled on {network}
                  </div>
                </div>
              )}

              <div className={`space-y-2 ${!isJitoSupported ? 'opacity-50 pointer-events-none' : ''}`}>
                {/* Tip Presets */}
                {Object.entries(JITO_TIP_PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => handleTipPresetChange(key as JitoTipPreset)}
                    className={`w-full p-3 border-4 transition-colors ${
                      !useCustomTip && selectedTipPreset === key
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-gray-700 hover:border-green-400/50'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className={`font-pixel text-xs ${preset.color}`}>
                          {preset.name}
                        </div>
                        <div className="font-mono text-xs text-white">
                          {preset.amount} SOL
                        </div>
                      </div>
                      <div className="font-mono text-xs text-gray-400 text-left">
                        {preset.description}
                      </div>
                    </div>
                  </button>
                ))}

                {/* Custom Tip */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 font-pixel text-xs text-gray-400">
                    <input
                      type="checkbox"
                      checked={useCustomTip}
                      onChange={(e) => {
                        setUseCustomTip(e.target.checked)
                        if (e.target.checked) {
                          updateConfig({ tip: parseFloat(customTip) || 0 })
                        } else {
                          updateConfig({ tip: JITO_TIP_PRESETS[selectedTipPreset].amount })
                        }
                      }}
                      className="w-4 h-4"
                    />
                    CUSTOM TIP
                  </label>
                  
                  {useCustomTip && (
                    <input
                      type="number"
                      value={customTip}
                      onChange={(e) => handleCustomTipChange(e.target.value)}
                      placeholder="0.001"
                      step="0.001"
                      min="0"
                      className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white"
                    />
                  )}
                </div>

                {/* Current Tip Display */}
                <div className="p-3 bg-gray-800 border-4 border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-xs text-gray-400">Current Tip:</span>
                    <span className="font-mono text-sm text-green-400">{currentTip.toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-mono text-xs text-gray-400">Priority Level:</span>
                    <span className={`font-pixel text-xs ${getPriorityLevel(currentTip).color}`}>
                      {getPriorityLevel(currentTip).level}
                    </span>
                  </div>
                </div>

                {/* Tip Guidelines */}
                <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                  <div className="font-mono text-xs text-blue-400 mb-2">
                    💡 <strong>Tip Guidelines:</strong>
                  </div>
                  <div className="space-y-1 font-mono text-xs text-blue-300">
                    <div>• Higher tips = better landing probability</div>
                    <div>• 0.001-0.005 SOL for normal traffic</div>
                    <div>• 0.01+ SOL for high congestion periods</div>
                    <div>• 0.1+ SOL for critical timing needs</div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Bundle Summary */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📊 BUNDLE SUMMARY
                </h3>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className={`text-center p-3 border-2 ${
                    transactions.length >= 5
                      ? 'bg-yellow-600/10 border-yellow-600/30'
                      : 'bg-gray-800 border-gray-700'
                  }`}>
                    <div className={`font-mono text-lg ${
                      transactions.length >= 5 ? 'text-yellow-400' : 'text-white'
                    }`}>
                      {transactions.length}/5
                    </div>
                    <div className="font-mono text-xs text-gray-400">Transactions</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-lg text-blue-400">
                      ~{getTotalCost().toFixed(6)} SOL
                    </div>
                    <div className="font-mono text-xs text-gray-400">Total Cost</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="font-mono text-xs text-gray-400">Bundle Tip:</span>
                    <span className="font-mono text-xs text-green-400">{currentTip.toFixed(6)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-700">
                    <span className="font-mono text-xs text-gray-400">Est. Transaction Fees:</span>
                    <span className="font-mono text-xs text-white">
                      ~{(getTotalCost() - currentTip).toFixed(6)} SOL
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 font-semibold">
                    <span className="font-mono text-xs text-gray-300">Total Cost:</span>
                    <span className="font-mono text-sm text-green-400">
                      ~{getTotalCost().toFixed(6)} SOL
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <PixelButton
                    onClick={handleSimulate}
                    disabled={!connected || !isJitoSupported || transactions.length === 0 || transactions.length > 5 || isSimulating}
                    className="w-full text-xs"
                    variant="secondary"
                  >
                    {isSimulating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        [SIMULATING...]
                      </>
                    ) : (
                      <>
                        <Layers className="h-4 w-4" />
                        [SIMULATE BUNDLE]
                      </>
                    )}
                  </PixelButton>

                  <PixelButton
                    onClick={handleSubmit}
                    disabled={!connected || !isJitoSupported || transactions.length === 0 || transactions.length > 5 || isSubmitting}
                    className="w-full text-xs"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        [SUBMITTING...]
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        [SUBMIT BUNDLE]
                      </>
                    )}
                  </PixelButton>

                  {transactions.length > 5 && (
                    <div className="p-2 bg-red-600/10 border-2 border-red-600/30">
                      <div className="font-mono text-xs text-red-400 text-center">
                        ⚠️ Maximum 5 transactions per bundle
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Transaction Builder */}
        <div className="xl:col-span-2 space-y-6">
          <BundleTransactionBuilder
            transactions={transactions}
            onTransactionsChange={setTransactions}
          />

          {/* Results */}
          {error && (
            <PixelCard>
              <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-pixel text-sm text-red-400 mb-2">
                      ❌ BUNDLE ERROR
                    </div>
                    <div className="font-mono text-xs text-red-400">
                      {error}
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {lastResult && lastResult.landed && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    ✅ BUNDLE SUBMITTED SUCCESSFULLY
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">BUNDLE ID:</div>
                    <div className="font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-2 border-gray-700">
                      {lastResult.bundleId}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">
                      TRANSACTIONS ({lastResult.signatures.length}):
                    </div>
                    <div className="space-y-2">
                      {lastResult.signatures.map((signature, index) => (
                        <div key={signature} className="flex items-center gap-2">
                          <span className="font-mono text-xs text-gray-400">#{index + 1}:</span>
                          <span className="font-mono text-xs text-green-400 break-all flex-1">
                            {signature.slice(0, 16)}...{signature.slice(-16)}
                          </span>
                          <button
                            onClick={() => window.open(`https://explorer.solana.com/tx/${signature}`, '_blank')}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">TOTAL COST:</div>
                    <div className="font-mono text-sm text-green-400">
                      {lastResult.cost.toFixed(6)} SOL
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {/* Jito Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ ABOUT JITO BUNDLES
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>Bundle Size:</strong> Maximum 5 transactions per bundle (Jito network limit)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>MEV Protection:</strong> Bundle transactions for atomic execution without front-running</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>Skip Mempool:</strong> Direct submission to Jito validators bypasses public mempool</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>All or Nothing:</strong> Either all transactions land or none do - no partial execution</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>Priority Tips:</strong> Higher tips increase bundle landing probability</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span><strong>No Failed Fees:</strong> Failed bundles don't charge transaction fees</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-600/10 border-4 border-yellow-600/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div className="font-mono text-xs text-yellow-400">
                    <strong>Note:</strong> This is the production-ready Jito bundle interface. 
                    All bundles are submitted to real Jito block engines for execution.
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