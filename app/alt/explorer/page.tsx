'use client'

import { useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { getALTInfo, type ALTInfo } from '@/lib/solana/alt/manage-alt'
import { analyzeALTBenefit } from '@/lib/solana/alt/resolver'
import { Copy, ExternalLink, Search } from 'lucide-react'

export default function ALTExplorerPage() {
  const { connection } = useConnection()
  
  const [altAddress, setAltAddress] = useState('')
  const [altInfo, setAltInfo] = useState<ALTInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Analysis state
  const [analysisAddresses, setAnalysisAddresses] = useState('')
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleSearch = async () => {
    if (!altAddress.trim()) return

    setIsLoading(true)
    setError('')
    setAltInfo(null)

    try {
      const pubkey = new PublicKey(altAddress)
      const info = await getALTInfo(connection, pubkey)
      
      if (!info) {
        setError('ALT not found or invalid address')
      } else {
        setAltInfo(info)
      }
    } catch (err) {
      setError('Invalid address format')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnalyze = async () => {
    if (!analysisAddresses.trim() || !altInfo) return

    setIsAnalyzing(true)

    try {
      const addresses = analysisAddresses
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr)
        .map(addr => new PublicKey(addr))

      const result = await analyzeALTBenefit(
        connection,
        addresses,
        [altInfo.address]
      )

      setAnalysisResult(result)
    } catch (err) {
      alert('Error analyzing addresses: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const openInExplorer = (address: string) => {
    window.open(`https://explorer.solana.com/address/${address}`, '_blank')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          ALT EXPLORER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Explore and analyze Address Lookup Tables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Search & ALT Info */}
        <div className="space-y-6">
          {/* Search */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  SEARCH ALT
                </h3>
              </div>

              <div className="flex gap-3">
                <PixelInput
                  value={altAddress}
                  onChange={(e) => setAltAddress(e.target.value)}
                  placeholder="Enter ALT address"
                  disabled={isLoading}
                  className="flex-1"
                />
                <PixelButton
                  variant="primary"
                  onClick={handleSearch}
                  disabled={!altAddress.trim() || isLoading}
                  isLoading={isLoading}
                  className="!px-4"
                >
                  <Search className="h-4 w-4" />
                </PixelButton>
              </div>

              {error && (
                <div className="p-3 bg-red-600/20 border-4 border-red-600/30 text-red-400 font-mono text-xs">
                  {error}
                </div>
              )}
            </div>
          </PixelCard>

          {/* ALT Info */}
          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                  <h3 className="font-pixel text-sm text-green-400">
                    ALT INFORMATION
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(altInfo.address.toBase58())}
                      className="text-gray-400 hover:text-green-400 p-1"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openInExplorer(altInfo.address.toBase58())}
                      className="text-gray-400 hover:text-green-400 p-1"
                      title="View in explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Status badges */}
                  <div className="flex gap-2 flex-wrap">
                    {altInfo.isDeactivated ? (
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 border border-red-600/30 font-pixel text-xs">
                        DEACTIVATED
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 border border-green-600/30 font-pixel text-xs">
                        ACTIVE
                      </span>
                    )}
                    
                    {altInfo.isFrozen && (
                      <span className="px-2 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 font-pixel text-xs">
                        FROZEN
                      </span>
                    )}
                    
                    {altInfo.canBeClosed && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 font-pixel text-xs">
                        CLOSABLE
                      </span>
                    )}
                  </div>

                  {/* Basic info */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-1">AUTHORITY:</div>
                      <div className="font-mono text-xs text-white break-all p-2 bg-gray-800 border-2 border-gray-700">
                        {altInfo.authority?.toBase58() || 'None (Frozen)'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">ADDRESSES:</div>
                        <div className="font-mono text-xs text-white p-2 bg-gray-800 border-2 border-gray-700">
                          {altInfo.addresses.length} / 256
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">LAST EXTENDED:</div>
                        <div className="font-mono text-xs text-white p-2 bg-gray-800 border-2 border-gray-700">
                          #{altInfo.lastExtendedSlot}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Addresses list */}
                  {altInfo.addresses.length > 0 && (
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-2">
                        ADDRESSES ({altInfo.addresses.length}):
                      </div>
                      <div className="max-h-64 overflow-y-auto border-2 border-gray-700 bg-gray-800">
                        {altInfo.addresses.map((address, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-3 py-2 border-b border-gray-700 last:border-b-0"
                          >
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs text-gray-500 w-10">
                                [{index}]
                              </span>
                              <span className="font-mono text-xs text-white break-all">
                                {address.toBase58()}
                              </span>
                            </div>
                            <button
                              onClick={() => copyToClipboard(address.toBase58())}
                              className="text-gray-400 hover:text-green-400 p-1"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Analysis */}
        <div className="space-y-6">
          {/* Address Analysis */}
          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ANALYZE ADDRESSES
                  </h3>
                </div>

                <div>
                  <label className="block font-mono text-xs text-gray-400 mb-2">
                    ADDRESSES TO ANALYZE (ONE PER LINE):
                  </label>
                  <textarea
                    value={analysisAddresses}
                    onChange={(e) => setAnalysisAddresses(e.target.value)}
                    placeholder="Enter addresses to check ALT benefit..."
                    rows={8}
                    disabled={isAnalyzing}
                    className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
                  />
                </div>

                <PixelButton
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={!analysisAddresses.trim() || isAnalyzing}
                  isLoading={isAnalyzing}
                  className="w-full"
                >
                  [ANALYZE BENEFIT]
                </PixelButton>
              </div>
            </PixelCard>
          )}

          {/* Analysis Results */}
          {analysisResult && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ANALYSIS RESULTS
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-xs text-gray-400 mb-1">TOTAL ADDRESSES:</div>
                      <div className="font-mono text-lg text-white">{analysisResult.totalAddresses}</div>
                    </div>
                    <div className="p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-xs text-gray-400 mb-1">IN ALT:</div>
                      <div className="font-mono text-lg text-green-400">{analysisResult.addressesInALT}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-xs text-gray-400 mb-1">ALT BENEFIT:</div>
                    <div className="font-mono text-xl text-green-400">
                      {analysisResult.benefitPercentage.toFixed(1)}% coverage
                    </div>
                  </div>

                  {analysisResult.recommendations.length > 0 && (
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-2">RECOMMENDATIONS:</div>
                      <div className="space-y-2">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-2 bg-blue-600/10 border-2 border-blue-600/20"
                          >
                            <span className="text-blue-400 mt-0.5">▸</span>
                            <span className="font-mono text-xs text-blue-400">{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PixelCard>
          )}

          {/* Usage Guide */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ HOW TO USE
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">1.</span>
                  <span>Enter an ALT address to view its contents and status</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">2.</span>
                  <span>Paste addresses you use frequently to see ALT benefits</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">3.</span>
                  <span>Higher coverage = more transaction cost savings</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">4.</span>
                  <span>Consider creating an ALT for frequently used addresses</span>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}