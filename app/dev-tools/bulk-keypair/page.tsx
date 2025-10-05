'use client'

import { BulkKeypairGeneratorComponent } from '@/components/dev-tools/bulk-keypair-generator'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, Package, Zap, Shield, Download, AlertTriangle, BookOpen } from 'lucide-react'

export default function BulkKeypairPage() {
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
              BULK KEYPAIR GENERATOR
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Generate multiple Solana keypairs at once with export options
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT BULK GENERATION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">BULK FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Generate 1-10,000 keypairs in one go</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Real-time progress tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Multiple export formats (JSON, CSV, TXT)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Optional index numbering</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Pause/resume functionality</span>
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
                    <span>High-speed generation (1000+ keys/sec)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Optimized memory usage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Background processing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Automatic time estimation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Browser-based (no server)</span>
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
                    <span>Client-side generation only</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Keys never leave your device</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Cryptographically secure</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No network transmission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Local storage control</span>
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
                        1. Set the number of keypairs to generate<br/>
                        2. Choose your preferred export format<br/>
                        3. Optionally configure advanced settings<br/>
                        4. Click "Generate" and wait for completion<br/>
                        5. Download or copy your keypairs safely
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
                        • Larger batches take more time and memory<br/>
                        • Keep your browser tab active during generation<br/>
                        • Download results immediately after completion<br/>
                        • Store private keys securely - they control funds
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Bulk Generator Component */}
      <BulkKeypairGeneratorComponent />

      {/* Use Cases & Tips */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                💡 USE CASES & BEST PRACTICES
              </h2>
            </div>

            <div className="space-y-6">
              {/* Use Cases */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Use Cases:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Development & Testing</div>
                    <div className="font-mono text-xs text-gray-300">
                      Generate test wallets for development, create multiple accounts for testing scenarios, 
                      simulate user interactions, and prototype multi-wallet applications.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">Airdrop Campaigns</div>
                    <div className="font-mono text-xs text-gray-300">
                      Prepare recipient wallets for token airdrops, create distribution lists, 
                      manage multi-wallet campaigns, and organize community rewards.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-purple-400">
                    <div className="font-pixel text-sm text-purple-400 mb-2">Portfolio Management</div>
                    <div className="font-mono text-xs text-gray-300">
                      Create separate wallets for different investment strategies, 
                      organize holdings by categories, and maintain privacy between activities.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">Security Practices</div>
                    <div className="font-mono text-xs text-gray-300">
                      Generate cold storage wallets, create backup keypairs, 
                      implement multi-signature setups, and practice key rotation.
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Format Guide */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Export Format Guide:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">JSON Format</div>
                    <div className="font-mono text-xs text-gray-300 mb-3">
                      Structured data format ideal for:
                    </div>
                    <div className="space-y-1 font-mono text-xs text-gray-400">
                      <div>• Programming applications</div>
                      <div>• API integrations</div>
                      <div>• Database imports</div>
                      <div>• Automated processing</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-green-400 mb-2">CSV Format</div>
                    <div className="font-mono text-xs text-gray-300 mb-3">
                      Spreadsheet format perfect for:
                    </div>
                    <div className="space-y-1 font-mono text-xs text-gray-400">
                      <div>• Excel/Google Sheets</div>
                      <div>• Data analysis</div>
                      <div>• Bulk operations</div>
                      <div>• Database imports</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-purple-400 mb-2">TXT Format</div>
                    <div className="font-mono text-xs text-gray-300 mb-3">
                      Human-readable format for:
                    </div>
                    <div className="space-y-1 font-mono text-xs text-gray-400">
                      <div>• Manual review</div>
                      <div>• Documentation</div>
                      <div>• Secure storage</div>
                      <div>• Easy copying</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Tips */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Performance & Security Tips:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">PERFORMANCE TIPS:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Keep browser tab active during generation</div>
                      <div>• Close unnecessary applications for large batches</div>
                      <div>• Use modern browsers (Chrome, Firefox, Safari)</div>
                      <div>• Start with smaller batches to test performance</div>
                      <div>• Don't navigate away during generation</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="font-pixel text-sm text-red-400 mb-2">SECURITY BEST PRACTICES:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Download keypairs immediately after generation</div>
                      <div>• Store private keys in secure locations</div>
                      <div>• Use encrypted storage for sensitive keypairs</div>
                      <div>• Never share private keys with anyone</div>
                      <div>• Consider hardware wallets for large amounts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Generation Time Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Generation Time Examples:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Keypairs
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Estimated Time
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          File Size (JSON)
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Use Case
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { count: '10', time: '< 1 second', size: '~2 KB', use: 'Quick testing' },
                        { count: '100', time: '< 1 second', size: '~18 KB', use: 'Small project' },
                        { count: '1,000', time: '~1 second', size: '~175 KB', use: 'Medium campaign' },
                        { count: '5,000', time: '~5 seconds', size: '~875 KB', use: 'Large distribution' },
                        { count: '10,000', time: '~10 seconds', size: '~1.7 MB', use: 'Max batch size' }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-white">
                            {row.count}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-yellow-400">
                            {row.time}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-blue-400">
                            {row.size}
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
            </div>
          </div>
        </PixelCard>
      </div>
    </div>
  )
}