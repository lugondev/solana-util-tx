'use client'

import { useState } from 'react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { Calculator, Copy, Plus, Trash2, ExternalLink } from 'lucide-react'

interface PDAResult {
  address: string
  bump: number
  seeds: string[]
  programId: string
}

export default function PDACalculatorPage() {
  const [programId, setProgramId] = useState('')
  const [seeds, setSeeds] = useState<string[]>([''])
  const [pdaResult, setPdaResult] = useState<PDAResult | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const addSeed = () => {
    setSeeds([...seeds, ''])
  }

  const removeSeed = (index: number) => {
    if (seeds.length > 1) {
      setSeeds(seeds.filter((_, i) => i !== index))
    }
  }

  const updateSeed = (index: number, value: string) => {
    const newSeeds = [...seeds]
    newSeeds[index] = value
    setSeeds(newSeeds)
  }

  const calculatePDA = async () => {
    if (!programId.trim()) {
      setToast({ message: 'Please enter a program ID', type: 'error' })
      return
    }

    const validSeeds = seeds.filter(seed => seed.trim() !== '')
    if (validSeeds.length === 0) {
      setToast({ message: 'Please enter at least one seed', type: 'error' })
      return
    }

    try {
      const programPublicKey = new PublicKey(programId)
      
      // Convert seeds to Uint8Array
      const seedBuffers = validSeeds.map(seed => {
        // Try to parse as hex if it starts with 0x
        if (seed.startsWith('0x')) {
          return Buffer.from(seed.slice(2), 'hex')
        }
        // Otherwise treat as UTF-8 string
        return Buffer.from(seed, 'utf8')
      })

      const [pda, bump] = PublicKey.findProgramAddressSync(
        seedBuffers,
        programPublicKey
      )

      setPdaResult({
        address: pda.toString(),
        bump,
        seeds: validSeeds,
        programId
      })

      setToast({
        message: 'PDA calculated successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error calculating PDA:', error)
      setToast({
        message: error instanceof Error ? error.message : 'Failed to calculate PDA',
        type: 'error'
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setToast({ message: 'Copied to clipboard!', type: 'success' })
  }

  const loadExample = (example: 'token' | 'metadata' | 'vault') => {
    switch (example) {
      case 'token':
        setProgramId('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        setSeeds(['wallet_address', 'token_mint'])
        break
      case 'metadata':
        setProgramId('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
        setSeeds(['metadata', 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', 'mint_address'])
        break
      case 'vault':
        setProgramId('vau1zxA2LbssAUEF7Gpw91zMM1LvXrvpzJtmZ58rPsn')
        setSeeds(['vault', 'user_address'])
        break
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          PDA CALCULATOR
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Calculate Program Derived Addresses (PDAs) for Solana programs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Calculator */}
        <div className="space-y-6">
          {/* PDA Calculator */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🧮 PDA CALCULATOR
                </h3>
              </div>

              <div className="space-y-4">
                <PixelInput
                  label="PROGRAM ID"
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Enter program public key"
                />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-pixel text-xs text-gray-400">
                      SEEDS:
                    </label>
                    <PixelButton
                      onClick={addSeed}
                      variant="secondary"
                      className="text-xs"
                    >
                      <Plus className="h-3 w-3" />
                      [ADD SEED]
                    </PixelButton>
                  </div>

                  <div className="space-y-2">
                    {seeds.map((seed, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={seed}
                          onChange={(e) => updateSeed(index, e.target.value)}
                          placeholder={`Seed ${index + 1} (string or 0x...)`}
                          className="flex-1 px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                        />
                        {seeds.length > 1 && (
                          <button
                            onClick={() => removeSeed(index)}
                            className="px-3 py-2 border-4 border-red-600/50 hover:border-red-600 text-red-400 hover:bg-red-600/10 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <PixelButton
                  onClick={calculatePDA}
                  disabled={!programId.trim() || seeds.every(s => !s.trim())}
                  className="w-full"
                >
                  <Calculator className="h-4 w-4" />
                  [CALCULATE PDA]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* PDA Result */}
          {pdaResult && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ✅ PDA RESULT
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">PDA ADDRESS:</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                      <span className="font-mono text-xs text-white break-all flex-1">
                        {pdaResult.address}
                      </span>
                      <Copy 
                        className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                        onClick={() => copyToClipboard(pdaResult.address)}
                      />
                      <ExternalLink 
                        className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                        onClick={() => window.open(`https://explorer.solana.com/address/${pdaResult.address}`, '_blank')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-1">BUMP:</div>
                      <div className="p-2 bg-gray-800 border-2 border-gray-700">
                        <span className="font-mono text-xs text-green-400">
                          {pdaResult.bump}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-1">SEEDS COUNT:</div>
                      <div className="p-2 bg-gray-800 border-2 border-gray-700">
                        <span className="font-mono text-xs text-white">
                          {pdaResult.seeds.length}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">PROGRAM ID:</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                      <span className="font-mono text-xs text-white break-all flex-1">
                        {pdaResult.programId}
                      </span>
                      <Copy 
                        className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                        onClick={() => copyToClipboard(pdaResult.programId)}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">SEEDS USED:</div>
                    <div className="space-y-1">
                      {pdaResult.seeds.map((seed, index) => (
                        <div key={index} className="p-2 bg-gray-800 border-2 border-gray-700">
                          <span className="font-mono text-xs text-gray-500 mr-2">
                            [{index}]:
                          </span>
                          <span className="font-mono text-xs text-white">
                            {seed}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Examples & Info */}
        <div className="space-y-6">
          {/* Common Examples */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📚 COMMON EXAMPLES
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => loadExample('token')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">ASSOCIATED TOKEN ACCOUNT</div>
                      <div className="font-mono text-xs text-gray-400">
                        SPL Token associated account PDA
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loadExample('metadata')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">NFT METADATA</div>
                      <div className="font-mono text-xs text-gray-400">
                        Metaplex token metadata PDA
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => loadExample('vault')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Calculator className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">VAULT ACCOUNT</div>
                      <div className="font-mono text-xs text-gray-400">
                        User vault or escrow PDA
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>

          {/* PDA Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ ABOUT PDAs
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>PDAs are addresses derived from program ID and seeds</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>They don't have private keys (program controlled)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Bump ensures address is off the Ed25519 curve</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Used for storing program state and data</span>
                </div>
              </div>

              <div className="pt-3 border-t-4 border-gray-700">
                <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                  <div className="font-mono text-xs text-blue-400 mb-1">
                    💡 TIP:
                  </div>
                  <div className="font-mono text-xs text-blue-300">
                    Seeds can be strings (UTF-8) or hex bytes (0x...). 
                    Mix and match based on your program's requirements.
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Seed Types */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🌱 SEED TYPES
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-white mb-1">STRING SEEDS:</div>
                  <div className="font-mono text-xs text-gray-400">
                    "metadata", "vault", "user_account"
                  </div>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-white mb-1">HEX SEEDS:</div>
                  <div className="font-mono text-xs text-gray-400">
                    0x6d657461646174610a (for specific byte sequences)
                  </div>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-white mb-1">PUBKEY SEEDS:</div>
                  <div className="font-mono text-xs text-gray-400">
                    Use public key strings as seeds for user-specific PDAs
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Coming Soon */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚀 COMING SOON
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>PDA validation and existence check</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Batch PDA calculation</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Common program PDA templates</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>PDA reverse lookup</span>
                </div>
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