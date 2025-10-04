'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Key, Download, Upload, Copy, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

interface GeneratedKeypair {
  publicKey: string
  privateKey: string
  mnemonic?: string
}

export default function KeypairGeneratorPage() {
  const [keypairs, setKeypairs] = useState<GeneratedKeypair[]>([])
  const [showPrivateKeys, setShowPrivateKeys] = useState<{ [key: string]: boolean }>({})
  const [importKey, setImportKey] = useState('')
  const [numberOfKeys, setNumberOfKeys] = useState('1')

  const generateKeypair = () => {
    const count = parseInt(numberOfKeys) || 1
    const newKeypairs: GeneratedKeypair[] = []

    for (let i = 0; i < Math.min(count, 10); i++) {
      const keypair = Keypair.generate()
      newKeypairs.push({
        publicKey: keypair.publicKey.toString(),
        privateKey: bs58.encode(keypair.secretKey)
      })
    }

    setKeypairs([...newKeypairs, ...keypairs])
  }

  const importKeypair = () => {
    if (!importKey.trim()) return

    try {
      let keypair: Keypair

      // Try different import formats
      if (importKey.startsWith('[') && importKey.endsWith(']')) {
        // Array format
        const array = JSON.parse(importKey)
        keypair = Keypair.fromSecretKey(new Uint8Array(array))
      } else {
        // Base58 format
        const secretKey = bs58.decode(importKey)
        keypair = Keypair.fromSecretKey(secretKey)
      }

      const newKeypair: GeneratedKeypair = {
        publicKey: keypair.publicKey.toString(),
        privateKey: bs58.encode(keypair.secretKey)
      }

      setKeypairs([newKeypair, ...keypairs])
      setImportKey('')
    } catch (error) {
      alert('Invalid private key format')
    }
  }

  const togglePrivateKeyVisibility = (publicKey: string) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [publicKey]: !prev[publicKey]
    }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportKeypairs = () => {
    const data = {
      keypairs: keypairs,
      exported: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solana-keypairs.json'
    a.click()
  }

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all keypairs?')) {
      setKeypairs([])
      setShowPrivateKeys({})
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          KEYPAIR GENERATOR
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Generate and manage Solana keypairs securely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Generator */}
        <div className="space-y-6">
          {/* Generate New */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ⚡ GENERATE NEW
                </h3>
              </div>

              <div className="space-y-3">
                <PixelInput
                  label="NUMBER OF KEYPAIRS"
                  type="number"
                  value={numberOfKeys}
                  onChange={(e) => setNumberOfKeys(e.target.value)}
                  min="1"
                  max="10"
                />

                <PixelButton
                  onClick={generateKeypair}
                  className="w-full"
                >
                  <Key className="h-4 w-4" />
                  [GENERATE KEYPAIRS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Import Existing */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📥 IMPORT EXISTING
                </h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block font-pixel text-xs text-gray-400 mb-2">
                    PRIVATE KEY:
                  </label>
                  <textarea
                    value={importKey}
                    onChange={(e) => setImportKey(e.target.value)}
                    placeholder="Enter private key (Base58 or array format)"
                    rows={4}
                    className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
                  />
                </div>

                <PixelButton
                  onClick={importKeypair}
                  disabled={!importKey.trim()}
                  variant="secondary"
                  className="w-full"
                >
                  <Upload className="h-4 w-4" />
                  [IMPORT KEYPAIR]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Actions */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🛠️ ACTIONS
                </h3>
              </div>

              <div className="space-y-3">
                <PixelButton
                  onClick={exportKeypairs}
                  disabled={keypairs.length === 0}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="h-4 w-4" />
                  [EXPORT ALL]
                </PixelButton>

                <PixelButton
                  onClick={clearAll}
                  disabled={keypairs.length === 0}
                  variant="secondary"
                  className="w-full text-red-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  [CLEAR ALL]
                </PixelButton>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Keypair List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Keypair List */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔑 GENERATED KEYPAIRS ({keypairs.length})
                </h3>
              </div>

              <div className="space-y-4">
                {keypairs.map((keypair, index) => (
                  <div key={index} className="p-4 border-4 border-gray-700">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-pixel text-sm text-white">
                          KEYPAIR #{index + 1}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => togglePrivateKeyVisibility(keypair.publicKey)}
                            className="text-gray-400 hover:text-green-400"
                          >
                            {showPrivateKeys[keypair.publicKey] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">PUBLIC KEY:</div>
                        <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                          <span className="font-mono text-xs text-white break-all flex-1">
                            {keypair.publicKey}
                          </span>
                          <Copy 
                            className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                            onClick={() => copyToClipboard(keypair.publicKey)}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">PRIVATE KEY:</div>
                        <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                          <span className="font-mono text-xs text-white break-all flex-1">
                            {showPrivateKeys[keypair.publicKey] 
                              ? keypair.privateKey 
                              : '•'.repeat(keypair.privateKey.length)
                            }
                          </span>
                          <Copy 
                            className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                            onClick={() => copyToClipboard(keypair.privateKey)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {keypairs.length === 0 && (
                  <div className="text-center py-12 border-4 border-dashed border-gray-700">
                    <Key className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <div className="font-pixel text-lg text-gray-500 mb-2">
                      NO KEYPAIRS GENERATED
                    </div>
                    <div className="font-mono text-sm text-gray-600">
                      Generate or import keypairs to get started
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PixelCard>

          {/* Security Notice */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔒 SECURITY NOTICE
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="p-3 bg-red-600/10 border-4 border-red-600/20">
                  <div className="text-red-400 font-pixel text-xs mb-2">⚠️ IMPORTANT:</div>
                  <div className="space-y-1 text-red-300">
                    <div>• Never share your private keys with anyone</div>
                    <div>• Store private keys securely offline</div>
                    <div>• This tool runs locally in your browser</div>
                    <div>• Private keys are not sent to any server</div>
                  </div>
                </div>

                <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                  <div className="text-blue-400 font-pixel text-xs mb-2">💡 TIPS:</div>
                  <div className="space-y-1 text-blue-300">
                    <div>• Use hardware wallets for large amounts</div>
                    <div>• Test with small amounts first</div>
                    <div>• Keep multiple backups of important keys</div>
                    <div>• Consider using multisig for security</div>
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