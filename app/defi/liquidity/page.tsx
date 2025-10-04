'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Plus, ExternalLink, AlertTriangle, Search, Loader2, Info } from 'lucide-react'

export default function LiquidityPage() {
  const [tokenAAddress, setTokenAAddress] = useState('')
  const [tokenBAddress, setTokenBAddress] = useState('')
  const [searchingPools, setSearchingPools] = useState(false)
  const [showPoolCreator, setShowPoolCreator] = useState(false)

  const searchForPools = async () => {
    if (!tokenAAddress.trim() || !tokenBAddress.trim()) {
      alert('Please enter both token addresses')
      return
    }

    setSearchingPools(true)
    
    try {
      // Import and use Raydium service
      const { default: RaydiumService } = await import('@/lib/solana/defi/raydium-service')
      const { getConnection } = await import('@/lib/solana/connection')
      
      const connection = getConnection()
      const raydiumService = new RaydiumService(connection)
      
      const pools = await raydiumService.searchPools(tokenAAddress.trim(), tokenBAddress.trim())
      
      if (pools.length > 0) {
        console.log('Found pools:', pools)
        alert(`Found ${pools.length} Raydium pool(s) for this token pair!`)
      } else {
        alert('No pools found for this token pair on Raydium')
      }
    } catch (error) {
      console.error('Error searching pools:', error)
      alert('Error searching for pools. Please check the token addresses.')
    } finally {
      setSearchingPools(false)
    }
  }

  const calculateImpermanentLoss = (change: number) => {
    // Simplified impermanent loss calculation
    const ratio = (1 + change / 100)
    const il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1
    return (il * 100).toFixed(2)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          LIQUIDITY POOLS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Find and manage liquidity across Solana DEXs
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Pool Search */}
        <div className="xl:col-span-2 space-y-6">
          {/* Pool Search */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔍 FIND LIQUIDITY POOLS
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <PixelInput
                  label="TOKEN A ADDRESS"
                  value={tokenAAddress}
                  onChange={(e) => setTokenAAddress(e.target.value)}
                  placeholder="Enter token mint address"
                />
                <PixelInput
                  label="TOKEN B ADDRESS"
                  value={tokenBAddress}
                  onChange={(e) => setTokenBAddress(e.target.value)}
                  placeholder="Enter token mint address"
                />
              </div>

              <div className="flex gap-3">
                <PixelButton
                  onClick={searchForPools}
                  disabled={searchingPools || !tokenAAddress.trim() || !tokenBAddress.trim()}
                  className="flex-1"
                >
                  {searchingPools ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      [SEARCHING...]
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      [SEARCH POOLS]
                    </>
                  )}
                </PixelButton>
                <PixelButton
                  onClick={() => setShowPoolCreator(!showPoolCreator)}
                  variant="secondary"
                >
                  <Plus className="h-4 w-4" />
                  [CREATE]
                </PixelButton>
              </div>

              {/* Quick Search Suggestions */}
              <div className="p-4 bg-gray-800 border-2 border-gray-700">
                <div className="font-pixel text-xs text-gray-400 mb-2">Popular pairs:</div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'SOL/USDC',
                    'RAY/SOL', 
                    'USDC/USDT',
                    'SOL/BONK'
                  ].map((pair) => (
                    <button
                      key={pair}
                      className="px-2 py-1 font-mono text-xs border border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400 transition-colors"
                      onClick={() => alert(`Search for ${pair} pools`)}
                    >
                      {pair}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Pool Creator */}
          {showPoolCreator && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ➕ CREATE NEW POOL
                  </h3>
                </div>

                <div className="p-4 bg-yellow-900/20 border-2 border-yellow-600/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div className="font-mono text-xs text-yellow-400">
                      Pool creation requires integration with specific DEX protocols (Raydium, Orca, etc.)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PixelInput
                    label="TOKEN A ADDRESS"
                    placeholder="Enter token mint address"
                    disabled
                  />
                  <PixelInput
                    label="TOKEN B ADDRESS"
                    placeholder="Enter token mint address"
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <PixelInput
                    label="INITIAL AMOUNT A"
                    type="number"
                    placeholder="0.0"
                    disabled
                  />
                  <PixelInput
                    label="INITIAL AMOUNT B"
                    type="number"
                    placeholder="0.0"
                    disabled
                  />
                </div>

                <div className="flex gap-3">
                  <PixelButton className="flex-1" disabled>
                    <Plus className="h-4 w-4" />
                    [CREATE POOL] - Requires DEX Integration
                  </PixelButton>
                  <PixelButton
                    onClick={() => setShowPoolCreator(false)}
                    variant="secondary"
                  >
                    [CANCEL]
                  </PixelButton>
                </div>
              </div>
            </PixelCard>
          )}

          {/* No Pools Found */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🏊 POOL RESULTS
                </h3>
              </div>

              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  NO POOLS LOADED
                </h3>
                <p className="font-mono text-sm text-gray-500 mb-4">
                  Enter token addresses above to search for liquidity pools
                </p>
                <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30 max-w-md mx-auto">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="font-mono text-xs text-blue-400">
                      Real implementation requires integration with:<br/>
                      • Raydium SDK for Raydium pools<br/>
                      • Orca SDK for Orca pools<br/>
                      • Jupiter API for aggregated data
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Tools & Info */}
        <div className="space-y-6">
          {/* Impermanent Loss Calculator */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ⚠️ IL CALCULATOR
                </h3>
              </div>

              <div className="space-y-3">
                <p className="font-mono text-xs text-gray-400">
                  Impermanent Loss for price changes:
                </p>
                
                <div className="space-y-2">
                  {[25, 50, 100, 200, 500].map((change) => (
                    <div key={change} className="flex justify-between">
                      <span className="font-mono text-xs text-gray-400">
                        +{change}% price change:
                      </span>
                      <span className="font-mono text-xs text-red-400">
                        -{calculateImpermanentLoss(change)}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t-2 border-gray-700">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <p className="font-mono text-xs text-gray-400">
                      Impermanent loss occurs when token prices diverge from initial ratio
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* DEX Protocols */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🏦 DEX PROTOCOLS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-white">🌟 Raydium</span>
                    <span className="font-mono text-xs text-green-400">AMM + CLMM</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Automated Market Maker with concentrated liquidity
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-white">🐋 Orca</span>
                    <span className="font-mono text-xs text-blue-400">Whirlpools</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Concentrated liquidity market maker
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-white">♾️ Lifinity</span>
                    <span className="font-mono text-xs text-purple-400">Proactive MM</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Proactive market maker with delta-neutral strategy
                  </p>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* External Links */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔗 EXTERNAL DEXS
                </h3>
              </div>

              <div className="space-y-2">
                <PixelButton
                  onClick={() => window.open('https://raydium.io/liquidity-pools/', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [RAYDIUM POOLS]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://www.orca.so/pools', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [ORCA WHIRLPOOLS]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://lifinity.io', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [LIFINITY]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://jup.ag/liquidity-pools', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [JUPITER POOLS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Implementation Status */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  � IMPLEMENTATION STATUS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                  <div className="font-pixel text-xs text-green-400 mb-1">IMPLEMENTED:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Raydium SDK integration</li>
                    <li>• Pool search functionality</li>
                    <li>• Real-time pool data fetching</li>
                    <li>• UI/UX framework</li>
                    <li>• External DEX links</li>
                    <li>• IL calculator</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-yellow-400 mb-1">IN PROGRESS:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Add/remove liquidity transactions</li>
                    <li>• Price oracle integration</li>
                    <li>• Advanced metrics calculation</li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
                  <div className="font-pixel text-xs text-blue-400 mb-1">PLANNED:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Orca SDK integration</li>
                    <li>• Yield farming features</li>
                    <li>• LP position management</li>
                  </ul>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}