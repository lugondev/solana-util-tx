'use client'

import { ALTCreator } from '@/components/alt/alt-creator'

'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { Plus, List, FileText, AlertCircle, CheckCircle } from 'lucide-react'
import { buildCreateALTTransaction } from '@/lib/solana/alt/create-alt'
import { useTransaction } from '@/hooks/useTransaction'

export default function CreateALTPage() {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const { sendTransaction: sendTx } = useTransaction({ connection })
  const [addresses, setAddresses] = useState('')
  const [altName, setAltName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    signature: string
    altAddress: string
  } | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const handleCreateALT = async () => {
    if (!publicKey) {
      setToast({ message: 'Please connect your wallet first', type: 'error' })
      return
    }

    if (!addresses.trim()) {
      setToast({ message: 'Please enter at least one address', type: 'error' })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const addressList = addresses
        .split('\n')
        .map(addr => addr.trim())
        .filter(addr => addr.length > 0)
        .map(addr => new PublicKey(addr))

      if (addressList.length === 0) {
        throw new Error('No valid addresses provided')
      }

      const { transaction, lookupTableAddress } = await buildCreateALTTransaction({
        connection,
        payer: publicKey,
        initialAddresses: addressList
      })

      const result = await sendTx(transaction)

      if (!result.signature) {
        throw new Error('Transaction failed - no signature returned')
      }

      setResult({
        signature: result.signature,
        altAddress: lookupTableAddress.toString()
      })

      setToast({
        message: 'Address Lookup Table created successfully!',
        type: 'success'
      })

      // Reset form
      setAddresses('')
      setAltName('')
    } catch (error) {
      console.error('Error creating ALT:', error)
      setToast({
        message: error instanceof Error ? error.message : 'Failed to create ALT',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (file.name.endsWith('.csv')) {
        // Parse CSV - expecting one address per line or comma-separated
        const content = text.replace(/,/g, '\n')
        setAddresses(content)
      } else {
        setAddresses(text)
      }
    }
    reader.readAsText(file)
  }

  const addressCount = addresses
    .split('\n')
    .map(addr => addr.trim())
    .filter(addr => addr.length > 0).length

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          CREATE ADDRESS LOOKUP TABLE
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Create a new ALT to optimize transaction size and reduce fees
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Creation Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📝 ALT CONFIGURATION
                </h3>
              </div>

              <PixelInput
                label="ALT NAME (OPTIONAL)"
                value={altName}
                onChange={(e) => setAltName(e.target.value)}
                placeholder="Enter a name for your ALT"
              />

              <div>
                <label className="block font-pixel text-xs text-gray-400 mb-2">
                  ADDRESSES TO INCLUDE:
                </label>
                <textarea
                  value={addresses}
                  onChange={(e) => setAddresses(e.target.value)}
                  placeholder="Enter addresses (one per line):&#10;Address1&#10;Address2&#10;Address3"
                  rows={12}
                  className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="font-mono text-xs text-gray-500">
                    {addressCount} addresses
                  </span>
                  <span className="font-mono text-xs text-gray-500">
                    Estimated size reduction: ~{Math.max(0, (addressCount - 1) * 32)} bytes
                  </span>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block font-pixel text-xs text-gray-400 mb-2">
                  OR UPLOAD FILE:
                </label>
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="font-mono text-xs text-gray-400">
                      Upload CSV or TXT file
                    </span>
                  </div>
                </label>
              </div>

              <PixelButton
                onClick={handleCreateALT}
                disabled={loading || !publicKey || addressCount === 0}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    [CREATING ALT...]
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    [CREATE ALT]
                  </>
                )}
              </PixelButton>
            </div>
          </PixelCard>

          {/* Result */}
          {result && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ✅ ALT CREATED SUCCESSFULLY
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-xs text-gray-400">ALT ADDRESS:</label>
                    <div className="mt-1 p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-xs text-white break-all">
                        {result.altAddress}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="font-mono text-xs text-gray-400">TRANSACTION:</label>
                    <div className="mt-1 p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-xs text-white break-all">
                        {result.signature}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <PixelButton
                      variant="secondary"
                      onClick={() => navigator.clipboard.writeText(result.altAddress)}
                      className="flex-1"
                    >
                      [COPY ALT ADDRESS]
                    </PixelButton>
                    <PixelButton
                      variant="secondary"
                      onClick={() => window.open(`https://explorer.solana.com/tx/${result.signature}`, '_blank')}
                      className="flex-1"
                    >
                      [VIEW TX]
                    </PixelButton>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Info & Preview */}
        <div className="space-y-6">
          {/* Preview */}
          {addressCount > 0 && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    👁️ PREVIEW
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-white">{addressCount}</div>
                      <div className="font-mono text-xs text-gray-400">Addresses</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-green-400">
                        {Math.max(0, (addressCount - 1) * 32)}B
                      </div>
                      <div className="font-mono text-xs text-gray-400">Size Saved</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-2">
                      FIRST 5 ADDRESSES:
                    </div>
                    <div className="max-h-32 overflow-y-auto border-2 border-gray-700 bg-gray-800">
                      {addresses
                        .split('\n')
                        .map(addr => addr.trim())
                        .filter(addr => addr.length > 0)
                        .slice(0, 5)
                        .map((addr, index) => (
                          <div
                            key={index}
                            className="px-3 py-2 border-b border-gray-700 last:border-b-0"
                          >
                            <div className="font-mono text-xs text-white break-all">
                              {addr}
                            </div>
                          </div>
                        ))}
                      {addressCount > 5 && (
                        <div className="px-3 py-2 text-center font-mono text-xs text-gray-500">
                          ... and {addressCount - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {/* Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ ABOUT ADDRESS LOOKUP TABLES
                </h3>
              </div>

              <div className="space-y-3">
                <div className="space-y-2 font-mono text-xs text-gray-400">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Reduce transaction size by referencing addresses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Lower transaction fees for complex operations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Enable more accounts in single transaction</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Reusable across multiple transactions</span>
                  </div>
                </div>

                <div className="pt-3 border-t-4 border-gray-700">
                  <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                    <div className="font-mono text-xs text-blue-400 mb-1">
                      💡 TIP:
                    </div>
                    <div className="font-mono text-xs text-blue-300">
                      Include frequently used addresses like popular DEX programs, 
                      token mints, and common accounts for maximum benefit.
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-600/10 border-4 border-yellow-600/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <div className="font-mono text-xs text-yellow-400">
                      <strong>Note:</strong> ALT creation requires ~0.00204 SOL rent 
                      and transaction fees. ALTs have a warmup period before they can be used.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Common Addresses */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📋 COMMON ADDRESSES
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAddresses(prev => prev + '\nTokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA\nATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL\n11111111111111111111111111111111')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">TOKEN PROGRAMS</div>
                      <div className="font-mono text-xs text-gray-400">
                        SPL Token + Associated Token Account programs
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAddresses(prev => prev + '\nJUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4\nJUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <List className="h-4 w-4 text-gray-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">JUPITER DEX</div>
                      <div className="font-mono text-xs text-gray-400">
                        Jupiter aggregator programs
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* Toast */}
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