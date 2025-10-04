'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  Search, 
  Upload, 
  Download, 
  Code, 
  Terminal, 
  FileText,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function ProgramsPage() {
  const [programId, setProgramId] = useState('')
  const [searchResult, setSearchResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const searchProgram = async () => {
    if (!programId.trim()) {
      alert('Please enter a program ID')
      return
    }

    setLoading(true)
    
    // TODO: Implement real program search using Solana RPC
    setTimeout(() => {
      setLoading(false)
      alert('Program search requires Solana RPC integration')
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          PROGRAM TOOLS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Analyze and interact with Solana programs
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Program Search */}
        <div className="xl:col-span-2 space-y-6">
          {/* Program Search */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔍 PROGRAM INSPECTOR
                </h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <PixelInput
                    label="PROGRAM ID"
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    placeholder="Enter program address (e.g., 11111111111111111111111111111112)"
                  />
                </div>
                <div className="flex items-end">
                  <PixelButton
                    onClick={searchProgram}
                    disabled={loading || !programId.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                        [SEARCHING...]
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        [ANALYZE]
                      </>
                    )}
                  </PixelButton>
                </div>
              </div>

              {/* Popular Programs */}
              <div className="p-4 bg-gray-800 border-2 border-gray-700">
                <div className="font-pixel text-xs text-gray-400 mb-2">Popular programs:</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {[
                    { name: 'Token Program', id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
                    { name: 'System Program', id: '11111111111111111111111111111112' },
                    { name: 'SPL Associated Token', id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL' },
                    { name: 'Raydium AMM', id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8' }
                  ].map((program) => (
                    <button
                      key={program.name}
                      className="p-2 text-left font-mono text-xs border border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400 transition-colors"
                      onClick={() => setProgramId(program.id)}
                    >
                      <div className="font-pixel text-xs text-white">{program.name}</div>
                      <div className="text-xs break-all">{program.id.slice(0, 20)}...</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </PixelCard>

          {/* No Program Data */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📊 PROGRAM DETAILS
                </h3>
              </div>

              <div className="text-center py-12">
                <Code className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  NO PROGRAM LOADED
                </h3>
                <p className="font-mono text-sm text-gray-500 mb-4">
                  Enter a program ID above to analyze
                </p>
                <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30 max-w-md mx-auto">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="font-mono text-xs text-blue-400">
                      Real implementation requires:<br/>
                      • Solana RPC connection<br/>
                      • Program account parsing<br/>
                      • IDL discovery and parsing<br/>
                      • Instruction decoding
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* IDL Upload */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📄 IDL MANAGER
                </h3>
              </div>

              <div className="p-4 bg-yellow-900/20 border-2 border-yellow-600/30">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div className="font-mono text-xs text-yellow-400">
                    IDL upload and management requires file handling implementation
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <PixelButton disabled className="w-full">
                  <Upload className="h-4 w-4" />
                  [UPLOAD IDL] - Coming Soon
                </PixelButton>
                <PixelButton disabled className="w-full" variant="secondary">
                  <Download className="h-4 w-4" />
                  [EXPORT IDL] - Coming Soon
                </PixelButton>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Tools & Resources */}
        <div className="space-y-6">
          {/* Program Development */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🛠️ DEVELOPMENT TOOLS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-green-400 mb-1">ANCHOR:</div>
                  <p className="font-mono text-xs text-gray-400">
                    Framework for Solana program development
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-blue-400 mb-1">NATIVE:</div>
                  <p className="font-mono text-xs text-gray-400">
                    Raw Solana program development in Rust
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-purple-400 mb-1">SEAHORSE:</div>
                  <p className="font-mono text-xs text-gray-400">
                    Python-based Solana program framework
                  </p>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Program Types */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📋 PROGRAM TYPES
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-green-400">🪙 TOKEN</span>
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    SPL Token standard implementation
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-blue-400">🔄 AMM</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Automated Market Maker protocols
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-purple-400">🎮 NFT</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Non-fungible token collections
                  </p>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* External Resources */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔗 EXTERNAL TOOLS
                </h3>
              </div>

              <div className="space-y-2">
                <PixelButton
                  onClick={() => window.open('https://solscan.io', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [SOLSCAN]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://explorer.solana.com', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [SOLANA EXPLORER]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://anchor.so', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [ANCHOR DOCS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Implementation Status */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚧 IMPLEMENTATION STATUS
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-yellow-400 mb-1">TODO:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Solana RPC integration</li>
                    <li>• Program account parsing</li>
                    <li>• IDL discovery</li>
                    <li>• Instruction decoder</li>
                    <li>• File upload handling</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                  <div className="font-pixel text-xs text-green-400 mb-1">COMPLETED:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Program search UI</li>
                    <li>• Popular programs list</li>
                    <li>• External tool links</li>
                    <li>• Development guides</li>
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