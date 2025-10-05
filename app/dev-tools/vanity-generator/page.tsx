'use client'

import { VanityAddressGeneratorComponent } from '@/components/dev-tools/vanity-address-generator'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, Target, Zap, Shield, Clock, AlertTriangle, BookOpen } from 'lucide-react'

export default function VanityGeneratorPage() {
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
              VANITY ADDRESS GENERATOR
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Generate custom Solana addresses with specific prefixes or suffixes
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT VANITY ADDRESSES
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">WHAT IT DOES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Generate addresses that start with specific text</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Create addresses that end with custom suffixes</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Combine both prefix and suffix matching</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Case-sensitive or insensitive options</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">PERFORMANCE</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>High-speed generation (5000+ attempts/sec)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Real-time progress tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Difficulty estimation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Automatic rate calculation</span>
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
                    <span>Cryptographically secure generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Private keys never leave your browser</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Full control over generated wallets</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Export options for safe storage</span>
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
                        1. Enter desired prefix (e.g., "Cool", "777")<br/>
                        2. Optionally add suffix (e.g., "DOGE", "xyz")<br/>
                        3. Check difficulty estimate<br/>
                        4. Click "Start Generation" and wait<br/>
                        5. Save your wallet safely when found
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-red-400">IMPORTANT NOTES:</div>
                      <div className="font-mono text-xs text-gray-300">
                        • Longer patterns take exponentially more time<br/>
                        • Keep private keys secure - they control funds<br/>
                        • Base58 characters only (no 0, O, I, l)<br/>
                        • Consider using shorter patterns for faster results
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Vanity Generator Component */}
      <VanityAddressGeneratorComponent />

      {/* Examples & Tips */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                💡 EXAMPLES & DIFFICULTY GUIDE
              </h2>
            </div>

            <div className="space-y-6">
              {/* Difficulty Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Generation Time Examples:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">EASY (seconds)</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>1 character: "A", "7", "z"</div>
                      <div>2 characters: "Ab", "12", "XY"</div>
                      <div>Very fast generation</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">MEDIUM (minutes)</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>3 characters: "ABC", "777", "xyz"</div>
                      <div>4 characters: "Cool", "DOGE"</div>
                      <div>Reasonable wait time</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-red-400">
                    <div className="font-pixel text-sm text-red-400 mb-2">HARD (hours+)</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>5+ characters: "Solana", "Bitcoin"</div>
                      <div>Prefix + Suffix combinations</div>
                      <div>May take very long time</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Popular Patterns */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Popular Vanity Patterns:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-mono text-sm text-blue-400">Prefixes:</div>
                    <div className="space-y-2">
                      {[
                        { pattern: 'A', desc: 'Single letter (very fast)' },
                        { pattern: '1', desc: 'Lucky number' },
                        { pattern: 'Sol', desc: 'Solana themed' },
                        { pattern: '777', desc: 'Lucky numbers' },
                        { pattern: 'DEV', desc: 'Developer themed' }
                      ].map((item, i) => (
                        <div key={i} className="p-2 bg-gray-800 border border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm text-green-400">{item.pattern}</span>
                            <span className="font-mono text-xs text-gray-400">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-mono text-sm text-purple-400">Suffixes:</div>
                    <div className="space-y-2">
                      {[
                        { pattern: 'z', desc: 'Single letter (very fast)' },
                        { pattern: '69', desc: 'Popular numbers' },
                        { pattern: 'dev', desc: 'Developer tag' },
                        { pattern: 'HODL', desc: 'Crypto meme' },
                        { pattern: 'moon', desc: 'To the moon!' }
                      ].map((item, i) => (
                        <div key={i} className="p-2 bg-gray-800 border border-gray-700">
                          <div className="flex justify-between items-center">
                            <span className="font-mono text-sm text-purple-400">{item.pattern}</span>
                            <span className="font-mono text-xs text-gray-400">{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Base58 Character Set */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Valid Characters (Base58):</h3>
                <div className="p-4 bg-gray-800 border-4 border-gray-700">
                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-sm text-blue-400 mb-2">Allowed:</div>
                      <div className="font-mono text-sm text-white break-all">
                        123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-sm text-red-400 mb-2">Not Allowed:</div>
                      <div className="font-mono text-sm text-gray-400">
                        0 (zero), O (capital o), I (capital i), l (lowercase L)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Tips */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Performance Tips:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">DO:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Start with 1-3 character patterns</div>
                      <div>• Use case-insensitive for faster results</div>
                      <div>• Keep browser tab active for best performance</div>
                      <div>• Use common letters (a-z, A-Z, 1-9)</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="font-pixel text-sm text-red-400 mb-2">AVOID:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Patterns longer than 5 characters</div>
                      <div>• Combining long prefix + suffix</div>
                      <div>• Case-sensitive unless necessary</div>
                      <div>• Running on slow devices/connections</div>
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