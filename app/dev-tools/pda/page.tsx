'use client'

import { PDABruteForceComponent } from '@/components/dev-tools/pda-brute-force'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, Target, Search, Hash, Shield, AlertTriangle, BookOpen, Cpu } from 'lucide-react'

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
              PDA BRUTE FORCE FINDER
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Find Program Derived Addresses with specific properties and patterns
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
                  <h3 className="font-pixel text-sm text-green-400">SEARCH METHODS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Address prefix/suffix matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Pattern-based searching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Custom seed generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Bump seed optimization</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Multi-threaded processing</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">PERFORMANCE</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>High-speed PDA generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Smart search strategies</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Progress tracking & ETA</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Pause/resume functionality</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Memory efficient scanning</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <h3 className="font-pixel text-sm text-purple-400">SECURITY</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Client-side computation only</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No private data transmission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Cryptographically secure</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Deterministic results</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Verification included</span>
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
                      <div className="font-pixel text-sm text-green-400">HOW IT WORKS:</div>
                      <div className="font-mono text-xs text-gray-300">
                        1. Enter program ID and search criteria<br/>
                        2. Configure seeds and search patterns<br/>
                        3. Set performance and limit parameters<br/>
                        4. Start brute force search process<br/>
                        5. Review found PDAs matching criteria
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
                        • Complex patterns may take significant time<br/>
                        • CPU intensive - may affect device performance<br/>
                        • Longer patterns exponentially harder to find<br/>
                        • Use reasonable search limits and timeouts
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

      {/* Technical Documentation */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                📚 PDA TECHNICAL GUIDE
              </h2>
            </div>

            <div className="space-y-6">
              {/* PDA Basics */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Program Derived Address Basics:</h3>
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="space-y-4">
                    <div className="font-mono text-sm text-green-400 mb-2">
                      PDA = findProgramAddress([seeds...], programId)
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-blue-400">SEED COMPONENTS:</div>
                        <div className="space-y-1 font-mono text-xs text-gray-300">
                          <div>• String seeds (UTF-8 encoded)</div>
                          <div>• PublicKey seeds (32 bytes)</div>
                          <div>• Number seeds (u8, u16, u32, u64)</div>
                          <div>• Custom byte arrays</div>
                          <div>• Bump seed (0-255)</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-purple-400">DERIVATION PROCESS:</div>
                        <div className="space-y-1 font-mono text-xs text-gray-300">
                          <div>1. Concatenate all seeds</div>
                          <div>2. Append program ID</div>
                          <div>3. Hash with SHA256</div>
                          <div>4. Check if on curve</div>
                          <div>5. If on curve, increment bump</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search Strategies */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Search Strategies & Difficulty:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Pattern Type
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Difficulty
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Time Estimate
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Strategy
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          pattern: '1 char prefix', 
                          difficulty: 'Easy', 
                          time: '< 1 second', 
                          strategy: 'Sequential seed variation' 
                        },
                        { 
                          pattern: '2 char prefix', 
                          difficulty: 'Easy', 
                          time: '1-5 seconds', 
                          strategy: 'Random seed generation' 
                        },
                        { 
                          pattern: '3 char prefix', 
                          difficulty: 'Medium', 
                          time: '10-60 seconds', 
                          strategy: 'Multi-threaded search' 
                        },
                        { 
                          pattern: '4 char prefix', 
                          difficulty: 'Hard', 
                          time: '5-30 minutes', 
                          strategy: 'Optimized algorithms' 
                        },
                        { 
                          pattern: '5+ char prefix', 
                          difficulty: 'Very Hard', 
                          time: 'Hours to days', 
                          strategy: 'Distributed computing' 
                        },
                        { 
                          pattern: 'Specific suffix', 
                          difficulty: 'Variable', 
                          time: 'Similar to prefix', 
                          strategy: 'Reverse search patterns' 
                        }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-white">
                            {row.pattern}
                          </td>
                          <td className={`border border-gray-600 p-3 font-pixel text-sm ${
                            row.difficulty === 'Easy' ? 'text-green-400' :
                            row.difficulty === 'Medium' ? 'text-yellow-400' :
                            row.difficulty === 'Hard' ? 'text-orange-400' : 'text-red-400'
                          }`}>
                            {row.difficulty}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-blue-400">
                            {row.time}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-gray-300">
                            {row.strategy}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Use Cases */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Use Cases:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                      <div className="font-pixel text-sm text-green-400 mb-2">Vanity Program Accounts</div>
                      <div className="font-mono text-xs text-gray-300">
                        Create program accounts with memorable addresses for branding 
                        and user recognition. Useful for DEX pools, token vaults, etc.
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                      <div className="font-pixel text-sm text-blue-400 mb-2">Gas Optimization</div>
                      <div className="font-mono text-xs text-gray-300">
                        Find PDAs with specific properties that can reduce transaction 
                        costs or improve program efficiency through address patterns.
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-800 border-l-4 border-purple-400">
                      <div className="font-pixel text-sm text-purple-400 mb-2">Security Research</div>
                      <div className="font-mono text-xs text-gray-300">
                        Research address collision possibilities and test program 
                        security assumptions related to PDA generation.
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                      <div className="font-pixel text-sm text-yellow-400 mb-2">Development Tools</div>
                      <div className="font-mono text-xs text-gray-300">
                        Generate test addresses for development, find addresses with 
                        specific properties for testing edge cases.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Optimization */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Performance Optimization Tips:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">SPEED OPTIMIZATION:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Use shorter search patterns when possible</div>
                      <div>• Increase worker thread count for CPU-intensive tasks</div>
                      <div>• Close other applications to free up resources</div>
                      <div>• Use incremental search strategies</div>
                      <div>• Set reasonable time limits for complex searches</div>
                      <div>• Consider prefix over suffix for better performance</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
                    <div className="font-pixel text-sm text-blue-400 mb-2">SEARCH STRATEGY:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Start with common seed patterns</div>
                      <div>• Use meaningful seed combinations</div>
                      <div>• Leverage program-specific seed structures</div>
                      <div>• Consider bump seed optimization</div>
                      <div>• Use batch processing for multiple searches</div>
                      <div>• Save successful patterns for reuse</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Example Seed Configurations:</h3>
                <div className="space-y-3">
                  {[
                    {
                      title: 'Token Vault PDA',
                      seeds: ['vault', 'user_pubkey', 'mint_pubkey'],
                      example: 'findProgramAddress(["vault", userKey, mintKey], programId)',
                      use: 'User-specific token storage accounts'
                    },
                    {
                      title: 'Liquidity Pool PDA',
                      seeds: ['pool', 'token_a', 'token_b'],
                      example: 'findProgramAddress(["pool", tokenA, tokenB], programId)',
                      use: 'AMM liquidity pool addresses'
                    },
                    {
                      title: 'User Profile PDA',
                      seeds: ['profile', 'authority', 'counter'],
                      example: 'findProgramAddress(["profile", authority, counter], programId)',
                      use: 'User account management'
                    },
                    {
                      title: 'Governance PDA',
                      seeds: ['governance', 'realm', 'proposal_id'],
                      example: 'findProgramAddress(["governance", realm, proposalId], programId)',
                      use: 'DAO governance structures'
                    }
                  ].map((item, i) => (
                    <div key={i} className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="font-pixel text-sm text-blue-400">{item.title}</div>
                          <div className="font-mono text-xs text-gray-300">
                            <strong>Seeds:</strong> {item.seeds.map(s => `"${s}"`).join(', ')}
                          </div>
                          <div className="font-mono text-xs text-green-400">
                            <strong>Use case:</strong> {item.use}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="font-mono text-xs text-white bg-gray-900 p-2 border border-gray-600 break-all">
                            {item.example}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}