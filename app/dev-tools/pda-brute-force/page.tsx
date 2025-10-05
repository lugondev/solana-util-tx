'use client'

import { PDABruteForceComponent } from '@/components/dev-tools/pda-brute-force'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, Target, Search, Zap, Shield, AlertTriangle, BookOpen } from 'lucide-react'

export default function PDABruteForcePage() {
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
              PDA BRUTE FORCER
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Find Program Derived Addresses (PDAs) with specific properties
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT PDA BRUTE FORCING
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">WHAT ARE PDAs</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Program Derived Addresses are deterministic addresses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Generated from seeds and program ID</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Used for program-controlled accounts</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Essential for Solana program architecture</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">BRUTE FORCE FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Search with custom constraints</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Variable seed ranges for iteration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Address pattern matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Real-time progress tracking</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <h3 className="font-pixel text-sm text-purple-400">USE CASES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🎯</span>
                    <span>Find vanity PDAs for branding</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🎯</span>
                    <span>Optimize gas costs with short addresses</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🎯</span>
                    <span>Research program address spaces</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🎯</span>
                    <span>Discover address patterns</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-green-400">HOW TO USE:</div>
                      <div className="font-mono text-xs text-gray-300">
                        1. Enter the program ID you want to search<br/>
                        2. Configure seeds (static values or variable ranges)<br/>
                        3. Set address constraints (prefix, suffix, contains)<br/>
                        4. Review difficulty estimation<br/>
                        5. Start search and monitor progress
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-red-400">PERFORMANCE NOTES:</div>
                      <div className="font-mono text-xs text-gray-300">
                        • Longer constraints take exponentially more time<br/>
                        • Large variable ranges can be computationally expensive<br/>
                        • Consider starting with shorter patterns<br/>
                        • Monitor difficulty estimation before searching
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* PDA Brute Force Component */}
      <PDABruteForceComponent />

      {/* Documentation & Examples */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                💡 PDA STRUCTURE & EXAMPLES
              </h2>
            </div>

            <div className="space-y-6">
              {/* PDA Generation */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">How PDAs are Generated:</h3>
                <div className="p-4 bg-gray-800 border-4 border-gray-700">
                  <div className="space-y-3">
                    <div className="font-mono text-sm text-blue-400">
                      PDA = findProgramAddress([seed1, seed2, ...], programId)
                    </div>
                    <div className="font-mono text-xs text-gray-300">
                      1. Seeds are concatenated with bump value (255 → 0)<br/>
                      2. SHA256 hash is computed with program ID<br/>
                      3. First valid address (not on curve) is returned<br/>
                      4. Bump value ensures address is not a valid public key
                    </div>
                  </div>
                </div>
              </div>

              {/* Seed Types */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Seed Types & Usage:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Static Seeds</div>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div><strong>String:</strong> "user", "token", "vault"</div>
                      <div><strong>Public Key:</strong> User wallet, token mint</div>
                      <div><strong>Number:</strong> Fixed IDs, timestamps</div>
                      <div><strong>Use:</strong> Predictable, deterministic addresses</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">Variable Seeds</div>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div><strong>Range:</strong> 0-1000, 1-255</div>
                      <div><strong>Type:</strong> u8, u16, u32, u64</div>
                      <div><strong>Use:</strong> Finding vanity addresses</div>
                      <div><strong>Note:</strong> Computationally expensive</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Patterns */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common PDA Patterns:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-green-400">USER ACCOUNTS</div>
                    <div className="p-3 bg-gray-800 border border-gray-700">
                      <div className="font-mono text-xs text-gray-300">
                        Seeds: ["user", user_pubkey]<br/>
                        Purpose: User-specific program accounts<br/>
                        Example: User profiles, settings, state
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-blue-400">TOKEN ACCOUNTS</div>
                    <div className="p-3 bg-gray-800 border border-gray-700">
                      <div className="font-mono text-xs text-gray-300">
                        Seeds: ["token", owner, mint]<br/>
                        Purpose: Token-specific data<br/>
                        Example: Token balances, metadata
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-purple-400">GAME STATE</div>
                    <div className="p-3 bg-gray-800 border border-gray-700">
                      <div className="font-mono text-xs text-gray-300">
                        Seeds: ["game", player, level_id]<br/>
                        Purpose: Game-specific state<br/>
                        Example: Player progress, items, stats
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-yellow-400">AUTHORITY</div>
                    <div className="p-3 bg-gray-800 border border-gray-700">
                      <div className="font-mono text-xs text-gray-300">
                        Seeds: ["authority"]<br/>
                        Purpose: Program authority/admin<br/>
                        Example: Protocol admin, treasury
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Constraint Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Constraint Examples:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Constraint
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Example
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Difficulty
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Use Case
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { constraint: 'Prefix', example: 'Cool...', difficulty: 'Medium', use: 'Branding, recognition' },
                        { constraint: 'Suffix', example: '...DOGE', difficulty: 'Medium', use: 'Token themes' },
                        { constraint: 'Contains', example: '...777...', difficulty: 'Hard', use: 'Lucky numbers' },
                        { constraint: 'Multiple', example: 'A...Z', difficulty: 'Very Hard', use: 'Perfect vanity' },
                        { constraint: 'None', example: 'Any address', difficulty: 'Easy', use: 'Testing, research' }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-white">
                            {row.constraint}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-blue-400">
                            {row.example}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-yellow-400">
                            {row.difficulty}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-gray-300">
                            {row.use}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Guide */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Performance Optimization:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">FASTER SEARCHES:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Use shorter constraint patterns (1-3 chars)</div>
                      <div>• Limit variable ranges (max 1000 values)</div>
                      <div>• Prefer prefix over suffix constraints</div>
                      <div>• Use case-insensitive matching</div>
                      <div>• Start with smaller seed combinations</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="font-pixel text-sm text-red-400 mb-2">AVOID:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Very long constraint patterns (5+ chars)</div>
                      <div>• Large variable ranges (10,000+ values)</div>
                      <div>• Multiple complex constraints together</div>
                      <div>• Case-sensitive matching unless needed</div>
                      <div>• Too many seeds (limit to 4-5 max)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Code */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Example: Finding User Account PDA</h3>
                <div className="p-4 bg-gray-800 border-4 border-gray-700 overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-300">
{`// Program ID
const PROGRAM_ID = "YourProgramID..."

// Seeds configuration
const seeds = [
  {
    type: "string",
    value: "user",
    description: "Static prefix"
  },
  {
    type: "publickey", 
    value: "UserWalletAddress...",
    description: "User wallet"
  },
  {
    type: "variable",
    variableRange: { min: 0, max: 100, type: "u8" },
    description: "User ID"
  }
]

// Constraints
const constraints = {
  prefix: "Cool",    // Address starts with "Cool"
  caseSensitive: false
}

// This will search for PDAs like:
// CoolXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
// Generated from seeds: ["user", userWallet, 0-100]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}