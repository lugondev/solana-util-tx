'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { Search, ExternalLink, RefreshCw, Eye } from 'lucide-react'
import { getAddressLookupTable } from '@/lib/solana/alt/create-alt'

interface ALTInfo {
  address: string
  authority: PublicKey | null
  deactivationSlot: bigint
  addresses: PublicKey[]
  isActive: boolean
  isFrozen: boolean
}

export default function ManageALTPage() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [altAddress, setAltAddress] = useState('')
  const [altInfo, setAltInfo] = useState<ALTInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const handleSearchALT = async () => {
    if (!altAddress.trim()) {
      setToast({ message: 'Please enter an ALT address', type: 'error' })
      return
    }

    setLoading(true)
    setAltInfo(null)

    try {
      const pubkey = new PublicKey(altAddress)
      const result = await getAddressLookupTable(connection, pubkey)

      if (!result?.value) {
        throw new Error('ALT not found or invalid address')
      }

      const altData = result.value.state
      setAltInfo({
        address: altAddress,
        authority: altData.authority || null,
        deactivationSlot: altData.deactivationSlot,
        addresses: altData.addresses,
        isActive: altData.deactivationSlot === BigInt('18446744073709551615'),
        isFrozen: (altData.authority || null) === null
      })

      setToast({
        message: 'ALT loaded successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error loading ALT:', error)
      setToast({
        message: error instanceof Error ? error.message : 'Failed to load ALT',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          MANAGE ADDRESS LOOKUP TABLES
        </h1>
        <p className="font-mono text-sm text-gray-400">
          View, extend, and manage existing Address Lookup Tables
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔍 SEARCH ALT
                </h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <PixelInput
                    label="ALT ADDRESS"
                    value={altAddress}
                    onChange={(e) => setAltAddress(e.target.value)}
                    placeholder="Enter Address Lookup Table address"
                  />
                </div>
                <div className="flex items-end">
                  <PixelButton
                    onClick={handleSearchALT}
                    disabled={loading}
                    className="h-12"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    [SEARCH]
                  </PixelButton>
                </div>
              </div>
            </div>
          </PixelCard>

          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    📊 ALT INFORMATION
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-white">{altInfo.addresses.length}</div>
                      <div className="font-mono text-xs text-gray-400">Addresses</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className={`font-mono text-lg ${altInfo.isActive ? 'text-green-400' : 'text-red-400'}`}>
                        {altInfo.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Status</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-mono text-xs text-gray-400">Authority:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-white">
                          {altInfo.authority 
                            ? `${altInfo.authority.toString().slice(0, 6)}...${altInfo.authority.toString().slice(-4)}`
                            : 'FROZEN'
                          }
                        </span>
                        {altInfo.authority && (
                          <Eye className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-mono text-xs text-gray-400">Size Optimization:</span>
                      <span className="font-mono text-xs text-green-400">
                        ~{Math.max(0, (altInfo.addresses.length - 1) * 32)} bytes saved
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    🛠️ ACTIONS
                  </h3>
                </div>

                <div className="space-y-3">
                  <PixelButton
                    onClick={() => window.open(`https://explorer.solana.com/address/${altInfo.address}`, '_blank')}
                    variant="secondary"
                    className="w-full"
                  >
                    <ExternalLink className="h-4 w-4" />
                    [VIEW ON EXPLORER]
                  </PixelButton>

                  <div className="space-y-2 font-mono text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⏳</span>
                      <span>Extend ALT - Coming Soon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⏳</span>
                      <span>Deactivate ALT - Coming Soon</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">⏳</span>
                      <span>Freeze ALT - Coming Soon</span>
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        <div className="space-y-6">
          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    📋 ADDRESSES ({altInfo.addresses.length})
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto border-2 border-gray-700 bg-gray-800">
                  {altInfo.addresses.map((address, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 border-b border-gray-700 last:border-b-0 flex items-center justify-between"
                    >
                      <div className="font-mono text-xs text-white">
                        <span className="text-gray-500 mr-2">{index}:</span>
                        {address.toString()}
                      </div>
                      <ExternalLink 
                        className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                        onClick={() => window.open(`https://explorer.solana.com/address/${address.toString()}`, '_blank')}
                      />
                    </div>
                  ))}
                  {altInfo.addresses.length === 0 && (
                    <div className="px-3 py-4 text-center font-mono text-xs text-gray-500">
                      No addresses in this ALT
                    </div>
                  )}
                </div>
              </div>
            </PixelCard>
          )}

          {altInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    📈 USAGE STATISTICS
                  </h3>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-lg text-green-400">
                      {Math.max(0, (altInfo.addresses.length - 1) * 32)}B
                    </div>
                    <div className="font-mono text-xs text-gray-400">Size Saved</div>
                  </div>
                  <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-lg text-blue-400">
                      ~{(altInfo.addresses.length * 0.000005).toFixed(6)}
                    </div>
                    <div className="font-mono text-xs text-gray-400">SOL Fee Saved</div>
                  </div>
                </div>

                <div className="pt-3 border-t-4 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 text-center">
                    Estimated savings per transaction using this ALT
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </div>

      {toast && (
        <PixelToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}