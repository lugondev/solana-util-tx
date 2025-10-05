'use client'

import { TransactionParserComponent } from '@/components/dev-tools/transaction-parser'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Code, Zap } from 'lucide-react'

export default function TransactionParserPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dev-tools">
            <PixelButton variant="secondary" className="!px-3">
              <ArrowLeft className="h-4 w-4" />
            </PixelButton>
          </Link>
          <div>
            <h1 className="font-pixel text-2xl text-green-400">
              TRANSACTION PARSER
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Decode raw transactions into human-readable format
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT TRANSACTION PARSER
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Parse Legacy & Versioned transactions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Decode instruction data & accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Support major programs (System, SPL, Jupiter, etc.)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Extract priority fees & compute budget</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Parse Address Lookup Tables (ALTs)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">SUPPORTED PROGRAMS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-400">🏦</span>
                    <span>System Program</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400">🪙</span>
                    <span>SPL Token & Token-2022</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400">🪐</span>
                    <span>Jupiter (V4 & V6)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400">🌊</span>
                    <span>Orca Whirlpool</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-pink-400">🌈</span>
                    <span>Raydium AMM & CLMM</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-purple-400" />
                  <h3 className="font-pixel text-sm text-purple-400">INPUT FORMATS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Base58 encoded transaction</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Transaction signature (lookup)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Raw transaction bytes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">→</span>
                    <span>Both Legacy & Versioned formats</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-gray-700">
              <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-pixel text-sm text-blue-400">HOW TO USE:</div>
                    <div className="font-mono text-xs text-gray-300">
                      1. Paste a base58 encoded transaction or signature into the input field<br/>
                      2. Click "Parse Transaction" to decode and analyze<br/>
                      3. Review the detailed breakdown of instructions, accounts, and data<br/>
                      4. Copy formatted output or download as text file for further analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Transaction Parser Component */}
      <TransactionParserComponent />

      {/* Example Section */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                💡 EXAMPLE USAGE
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="font-pixel text-sm text-white mb-3">Common Use Cases:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-sm text-green-400 mb-2">Debug Failed Transactions</div>
                    <div className="font-mono text-xs text-gray-300">
                      Analyze why transactions failed by examining instruction data and account states
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-sm text-blue-400 mb-2">Reverse Engineer Programs</div>
                    <div className="font-mono text-xs text-gray-300">
                      Understand how programs work by analyzing their instruction formats
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-sm text-purple-400 mb-2">Audit Security</div>
                    <div className="font-mono text-xs text-gray-300">
                      Review transaction flows and account permissions for security analysis
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-sm text-yellow-400 mb-2">Learn Solana Development</div>
                    <div className="font-mono text-xs text-gray-300">
                      Study how different protocols structure their transactions
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-pixel text-sm text-white mb-3">Sample Transaction Types:</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-mono text-sm text-green-400">SOL Transfer</div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Basic System Program transfer with priority fees
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-mono text-sm text-blue-400">SPL Token Transfer</div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Token transfers using SPL Token Program
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 border-l-4 border-purple-400">
                    <div className="font-mono text-sm text-purple-400">Jupiter Swap</div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Complex multi-instruction swaps with route optimization
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-800 border-l-4 border-cyan-400">
                    <div className="font-mono text-sm text-cyan-400">DeFi Operations</div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Liquidity provision, staking, and yield farming transactions
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}