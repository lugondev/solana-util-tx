'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Upload, Download, Send, Coins, FileText, AlertCircle } from 'lucide-react'

export default function BulkTokenOperationsPage() {
  const [operation, setOperation] = useState<'multi-send' | 'airdrop' | ''>('')
  const [addressList, setAddressList] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenMint, setTokenMint] = useState('')

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      if (file.name.endsWith('.csv')) {
        // Parse CSV - expecting format: address,amount
        const lines = text.split('\n').filter(line => line.trim())
        const addresses = lines.map(line => {
          const [addr, amt] = line.split(',')
          return `${addr.trim()}${amt ? ` - ${amt.trim()}` : ''}`
        }).join('\n')
        setAddressList(addresses)
      } else {
        // Plain text - one address per line
        setAddressList(text)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          BULK TOKEN OPERATIONS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Efficiently send tokens to multiple addresses at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Operation Selection */}
        <div className="space-y-6">
          {/* Operation Type */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  SELECT OPERATION
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setOperation('multi-send')}
                  className={`w-full text-left p-4 border-4 transition-colors ${
                    operation === 'multi-send'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Send className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="font-pixel text-sm text-white">MULTI-SEND</div>
                      <div className="font-mono text-xs text-gray-400">
                        Send same amount to multiple addresses
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOperation('airdrop')}
                  className={`w-full text-left p-4 border-4 transition-colors ${
                    operation === 'airdrop'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="font-pixel text-sm text-white">AIRDROP</div>
                      <div className="font-mono text-xs text-gray-400">
                        Send different amounts to different addresses
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>

          {/* Configuration */}
          {operation && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    CONFIGURATION
                  </h3>
                </div>

                <PixelInput
                  label="TOKEN MINT ADDRESS"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  placeholder="Enter SPL token mint address"
                />

                {operation === 'multi-send' && (
                  <PixelInput
                    label="AMOUNT PER ADDRESS"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to send to each address"
                    min="0"
                    step="0.000001"
                  />
                )}

                <div>
                  <label className="block font-pixel text-xs text-gray-400 mb-2">
                    RECIPIENT ADDRESSES:
                  </label>
                  <textarea
                    value={addressList}
                    onChange={(e) => setAddressList(e.target.value)}
                    placeholder={
                      operation === 'multi-send'
                        ? "Enter addresses (one per line):\nAddress1\nAddress2\nAddress3"
                        : "Enter addresses with amounts (CSV format):\nAddress1,Amount1\nAddress2,Amount2\nAddress3,Amount3"
                    }
                    rows={10}
                    className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
                  />
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
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-xs text-gray-400">
                        Upload CSV or TXT file
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          {/* Preview */}
          {operation && addressList && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    OPERATION PREVIEW
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-white">
                        {addressList.split('\n').filter(line => line.trim()).length}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Recipients</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-green-400">
                        {operation === 'multi-send' 
                          ? (parseFloat(amount || '0') * addressList.split('\n').filter(line => line.trim()).length).toLocaleString()
                          : 'Varies'
                        }
                      </div>
                      <div className="font-mono text-xs text-gray-400">Total Amount</div>
                    </div>
                  </div>

                  {/* Preview List */}
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-2">
                      PREVIEW (First 5):
                    </div>
                    <div className="max-h-32 overflow-y-auto border-2 border-gray-700 bg-gray-800">
                      {addressList.split('\n').filter(line => line.trim()).slice(0, 5).map((line, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="font-mono text-xs text-white break-all">
                            {operation === 'multi-send' 
                              ? `${line.trim()} → ${amount || '0'}`
                              : line.trim()
                            }
                          </div>
                        </div>
                      ))}
                      {addressList.split('\n').filter(line => line.trim()).length > 5 && (
                        <div className="px-3 py-2 text-center font-mono text-xs text-gray-500">
                          ... and {addressList.split('\n').filter(line => line.trim()).length - 5} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                    <div className="font-mono text-xs text-blue-400 mb-1">
                      ESTIMATED COST:
                    </div>
                    <div className="font-mono text-sm text-white">
                      ~{(addressList.split('\n').filter(line => line.trim()).length * 0.000005).toFixed(6)} SOL
                    </div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Transaction fees only (excludes token amounts)
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {/* Actions */}
          {operation && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ACTIONS
                  </h3>
                </div>

                <div className="space-y-3">
                  <PixelButton
                    variant="secondary"
                    disabled
                    className="w-full"
                  >
                    [VALIDATE ADDRESSES]
                  </PixelButton>

                  <PixelButton
                    variant="primary"
                    disabled
                    className="w-full"
                  >
                    [EXECUTE BULK OPERATION]
                  </PixelButton>

                  <div className="text-center">
                    <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 font-pixel text-xs">
                      COMING SOON
                    </span>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {/* Templates */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📄 TEMPLATES
                </h3>
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="text-left">
                    <div className="font-pixel text-xs text-white">Multi-send Template</div>
                    <div className="font-mono text-xs text-gray-400">Download CSV template</div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 ml-auto" />
                </button>

                <button className="w-full flex items-center gap-3 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="text-left">
                    <div className="font-pixel text-xs text-white">Airdrop Template</div>
                    <div className="font-mono text-xs text-gray-400">Download CSV template</div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* Info */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              ℹ️ BULK OPERATIONS INFO
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-pixel text-sm text-white mb-3">MULTI-SEND:</h4>
              <div className="space-y-2 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Send same amount to multiple recipients</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Perfect for equal distribution campaigns</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Batched transactions for efficiency</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-pixel text-sm text-white mb-3">AIRDROP:</h4>
              <div className="space-y-2 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Send different amounts to different recipients</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Great for proportional distributions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>CSV format: address,amount per line</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-4 border-gray-700">
            <div className="p-3 bg-yellow-600/10 border-4 border-yellow-600/20">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="font-mono text-xs text-yellow-400">
                  <strong>Coming Soon:</strong> Bulk token operations are currently in development. 
                  This feature will support efficient batch processing of multiple token transfers 
                  with automatic retry logic and progress tracking.
                </div>
              </div>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}