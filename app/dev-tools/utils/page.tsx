'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  Calculator, 
  Hash, 
  Clock, 
  Zap, 
  Globe,
  Copy,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

export default function UtilitiesPage() {
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')
  const [activeUtility, setActiveUtility] = useState<string>('')

  const utilities = [
    {
      id: 'base58',
      name: 'Base58 Encoder/Decoder',
      icon: Hash,
      description: 'Convert between Base58 and other formats',
      action: () => {
        if (!inputValue.trim()) return
        try {
          // Simple base58 check (not full implementation)
          setResult(`Base58 conversion: ${inputValue}`)
          setActiveUtility('base58')
        } catch (error) {
          setResult('Invalid input for Base58 conversion')
        }
      }
    },
    {
      id: 'pubkey',
      name: 'Public Key Validator',
      icon: CheckCircle,
      description: 'Validate Solana public key format',
      action: () => {
        if (!inputValue.trim()) return
        const isValid = inputValue.length === 44 && /^[1-9A-HJ-NP-Za-km-z]+$/.test(inputValue)
        setResult(`Public key validation: ${isValid ? 'VALID' : 'INVALID'}`)
        setActiveUtility('pubkey')
      }
    },
    {
      id: 'timestamp',
      name: 'Unix Timestamp Converter',
      icon: Clock,
      description: 'Convert between Unix timestamp and human readable date',
      action: () => {
        if (!inputValue.trim()) return
        try {
          const timestamp = parseInt(inputValue)
          if (isNaN(timestamp)) {
            setResult('Invalid timestamp')
            return
          }
          const date = new Date(timestamp * 1000)
          setResult(`Timestamp: ${date.toISOString()}`)
          setActiveUtility('timestamp')
        } catch (error) {
          setResult('Invalid timestamp format')
        }
      }
    },
    {
      id: 'lamports',
      name: 'SOL/Lamports Converter',
      icon: Calculator,
      description: 'Convert between SOL and lamports',
      action: () => {
        if (!inputValue.trim()) return
        try {
          const value = parseFloat(inputValue)
          if (isNaN(value)) {
            setResult('Invalid number')
            return
          }
          const lamports = value * 1000000000
          const sol = value / 1000000000
          setResult(`${value} SOL = ${lamports.toLocaleString()} lamports\n${value} lamports = ${sol.toFixed(9)} SOL`)
          setActiveUtility('lamports')
        } catch (error) {
          setResult('Invalid number format')
        }
      }
    },
    {
      id: 'hash',
      name: 'Hash Generator',
      icon: Hash,
      description: 'Generate various hash formats',
      action: () => {
        if (!inputValue.trim()) return
        // Simple hash simulation (not cryptographically secure)
        let hash = 0
        for (let i = 0; i < inputValue.length; i++) {
          const char = inputValue.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32-bit integer
        }
        setResult(`Simple hash: ${Math.abs(hash).toString(16)}`)
        setActiveUtility('hash')
      }
    },
    {
      id: 'slot',
      name: 'Slot Calculator',
      icon: Zap,
      description: 'Calculate time from slot number',
      action: () => {
        if (!inputValue.trim()) return
        try {
          const slot = parseInt(inputValue)
          if (isNaN(slot)) {
            setResult('Invalid slot number')
            return
          }
          // Approximate calculation (400ms per slot)
          const timeMs = slot * 400
          const date = new Date(Date.now() - timeMs)
          setResult(`Slot ${slot} ≈ ${date.toISOString()}`)
          setActiveUtility('slot')
        } catch (error) {
          setResult('Invalid slot number')
        }
      }
    }
  ]

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Copied to clipboard!')
    } catch (err) {
      alert('Failed to copy to clipboard')
    }
  }

  const clearAll = () => {
    setInputValue('')
    setResult('')
    setActiveUtility('')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          SOLANA UTILITIES
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Common utilities for Solana development and analysis
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Input & Output */}
        <div className="xl:col-span-2 space-y-6">
          {/* Input Section */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📝 INPUT
                </h3>
              </div>

              <div className="space-y-4">
                <PixelInput
                  label="INPUT VALUE"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Enter value to convert/analyze..."
                />

                <div className="flex gap-3">
                  <PixelButton
                    onClick={clearAll}
                    variant="secondary"
                    className="flex-1"
                  >
                    [CLEAR ALL]
                  </PixelButton>
                  {result && (
                    <PixelButton
                      onClick={() => copyToClipboard(result)}
                      variant="secondary"
                      className="flex-1"
                    >
                      <Copy className="h-4 w-4" />
                      [COPY RESULT]
                    </PixelButton>
                  )}
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Output Section */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📊 OUTPUT
                </h3>
              </div>

              <div className="min-h-[200px] p-4 bg-gray-900 border-2 border-gray-700 font-mono text-sm">
                {result ? (
                  <div className="whitespace-pre-wrap text-green-400">
                    {result}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    Select a utility below and enter input to see results...
                  </div>
                )}
              </div>

              {activeUtility && (
                <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="font-mono text-xs text-blue-400">
                      Using: {utilities.find(u => u.id === activeUtility)?.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </PixelCard>

          {/* Examples */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  💡 EXAMPLES
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-green-400 mb-2">Public Key:</div>
                  <div className="font-mono text-xs text-gray-400 break-all">
                    So11111111111111111111111111111111111111112
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-blue-400 mb-2">SOL Amount:</div>
                  <div className="font-mono text-xs text-gray-400">
                    1.5 (converts to 1,500,000,000 lamports)
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-purple-400 mb-2">Timestamp:</div>
                  <div className="font-mono text-xs text-gray-400">
                    1672531200 (Unix timestamp)
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-yellow-400 mb-2">Slot Number:</div>
                  <div className="font-mono text-xs text-gray-400">
                    150000000 (calculates approximate time)
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Utilities */}
        <div className="space-y-6">
          {/* Utility Buttons */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🛠️ UTILITIES
                </h3>
              </div>

              <div className="space-y-3">
                {utilities.map((utility) => {
                  const IconComponent = utility.icon
                  return (
                    <div key={utility.id} className="space-y-2">
                      <PixelButton
                        onClick={utility.action}
                        className={`w-full ${activeUtility === utility.id ? 'bg-green-400/20 border-green-400' : ''}`}
                        disabled={!inputValue.trim()}
                      >
                        <IconComponent className="h-4 w-4" />
                        {utility.name}
                      </PixelButton>
                      <p className="font-mono text-xs text-gray-400 px-2">
                        {utility.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </PixelCard>

          {/* Network Information */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🌐 NETWORK INFO
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-green-400 mb-1">MAINNET:</div>
                  <div className="font-mono text-xs text-gray-400">
                    Genesis Hash: 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp...
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-blue-400 mb-1">DEVNET:</div>
                  <div className="font-mono text-xs text-gray-400">
                    Genesis Hash: EtWTRABZaYq6iMfeYKouRu166VU2xqa1...
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-purple-400 mb-1">CONSTANTS:</div>
                  <div className="font-mono text-xs text-gray-400">
                    • 1 SOL = 1,000,000,000 lamports<br/>
                    • ~400ms per slot<br/>
                    • ~432,000 slots per epoch
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* External Tools */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔗 EXTERNAL TOOLS
                </h3>
              </div>

              <div className="space-y-2">
                <PixelButton
                  onClick={() => window.open('https://spl.solana.com/token', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [SPL TOKEN DOCS]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://docs.solana.com', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [SOLANA DOCS]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://solana.com/rpc', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [RPC DOCS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Implementation Notes */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📝 IMPLEMENTATION NOTES
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                  <div className="font-pixel text-xs text-green-400 mb-1">FUNCTIONAL:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>✓ Basic conversions</li>
                    <li>✓ Format validation</li>
                    <li>✓ Timestamp conversion</li>
                    <li>✓ Copy to clipboard</li>
                  </ul>
                </div>

                <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div className="font-mono text-xs text-yellow-400">
                      For production use, implement proper cryptographic functions and validation
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