'use client'

import { KeypairConverterComponent } from '@/components/dev-tools/keypair-converter'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, RefreshCw, Key, Hash, Shield, AlertTriangle, BookOpen, ArrowRightLeft } from 'lucide-react'

export default function KeypairConverterPage() {
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
              KEYPAIR FORMAT CONVERTER
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Convert between different Solana keypair formats and representations
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT FORMAT CONVERSION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">CONVERSIONS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Base58 ↔ Hexadecimal</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Array ↔ Base58/Hex</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>JSON ↔ Multiple formats</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Wallet file imports</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Batch processing</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Real-time conversion preview</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Format validation & verification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Public key derivation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Copy & export options</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Error detection & correction</span>
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
                    <span>Client-side processing only</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No network transmission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Memory cleared after use</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Format integrity verification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Secure clipboard handling</span>
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
                        1. Select input format (Base58, Hex, Array, JSON)<br/>
                        2. Paste or type your keypair data<br/>
                        3. Choose desired output format<br/>
                        4. View real-time conversion results<br/>
                        5. Copy or export converted keypairs
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-red-400">IMPORTANT:</div>
                      <div className="font-mono text-xs text-gray-300">
                        • Always verify converted keypairs before use<br/>
                        • Private keys should be kept absolutely secure<br/>
                        • Double-check format compatibility<br/>
                        • Clear sensitive data after conversion
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Keypair Converter Component */}
      <KeypairConverterComponent />

      {/* Format Documentation */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                📚 FORMAT DOCUMENTATION
              </h2>
            </div>

            <div className="space-y-6">
              {/* Format Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Supported Formats & Examples:</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-green-400 mb-2">Base58 (Standard)</div>
                      <div className="font-mono text-xs text-gray-300 mb-2">
                        Most common format used by Solana wallets
                      </div>
                      <div className="p-2 bg-gray-900 border border-gray-600 font-mono text-xs text-white break-all">
                        5KJvsng....xK7ZpZyw (Private Key)<br/>
                        9WzDXk....mB8pEf3Q (Public Key)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-blue-400 mb-2">Hexadecimal</div>
                      <div className="font-mono text-xs text-gray-300 mb-2">
                        Raw bytes encoded as hex string
                      </div>
                      <div className="p-2 bg-gray-900 border border-gray-600 font-mono text-xs text-white break-all">
                        0x1a2b3c4d...f9e8d7c6 (64 chars)<br/>
                        1a2b3c4d...f9e8d7c6 (without 0x)
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-purple-400 mb-2">Byte Array</div>
                      <div className="font-mono text-xs text-gray-300 mb-2">
                        JavaScript/JSON array format
                      </div>
                      <div className="p-2 bg-gray-900 border border-gray-600 font-mono text-xs text-white break-all">
                        [26, 43, 60, 77, ..., 249, 232, 215, 198]<br/>
                        (64 numbers, 0-255 each)
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-orange-400 mb-2">JSON Keypair</div>
                      <div className="font-mono text-xs text-gray-300 mb-2">
                        Structured JSON object format
                      </div>
                      <div className="p-2 bg-gray-900 border border-gray-600 font-mono text-xs text-white break-all">
                        {`{"publicKey": "...", "privateKey": "...", "secretKey": [...]}`}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Conversion Matrix */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Conversion Matrix:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          From \ To
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-center">
                          Base58
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-center">
                          Hex
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-center">
                          Array
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-center">
                          JSON
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { from: 'Base58', to: ['---', '✓', '✓', '✓'] },
                        { from: 'Hex', to: ['✓', '---', '✓', '✓'] },
                        { from: 'Array', to: ['✓', '✓', '---', '✓'] },
                        { from: 'JSON', to: ['✓', '✓', '✓', '---'] }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-pixel text-sm text-white">
                            {row.from}
                          </td>
                          {row.to.map((cell, j) => (
                            <td key={j} className="border border-gray-600 p-3 text-center">
                              <span className={`font-pixel text-sm ${
                                cell === '✓' ? 'text-green-400' : 'text-gray-500'
                              }`}>
                                {cell}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Wallet Compatibility */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Wallet Compatibility:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-blue-400">IMPORT FORMATS:</div>
                    <div className="space-y-2">
                      {[
                        { wallet: 'Phantom', formats: ['Base58', 'JSON', 'Array'] },
                        { wallet: 'Solflare', formats: ['Base58', 'JSON'] },
                        { wallet: 'Backpack', formats: ['Base58', 'Array'] },
                        { wallet: 'Glow', formats: ['Base58', 'JSON'] },
                        { wallet: 'Sollet', formats: ['JSON', 'Array'] }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-gray-800 border border-gray-600">
                          <div className="flex justify-between items-center">
                            <span className="font-pixel text-sm text-white">{item.wallet}</span>
                            <div className="flex gap-1">
                              {item.formats.map((format, j) => (
                                <span key={j} className="px-2 py-1 bg-green-600/20 text-green-400 font-mono text-xs border border-green-600/30">
                                  {format}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-purple-400">EXPORT FORMATS:</div>
                    <div className="space-y-2">
                      {[
                        { use: 'Command Line Tools', format: 'Array/JSON' },
                        { use: 'Web Wallets', format: 'Base58' },
                        { use: 'Hardware Wallets', format: 'Hex' },
                        { use: 'Development', format: 'All formats' },
                        { use: 'Backup Storage', format: 'Base58/JSON' }
                      ].map((item, i) => (
                        <div key={i} className="p-3 bg-gray-800 border border-gray-600">
                          <div className="font-mono text-sm text-white mb-1">{item.use}</div>
                          <div className="font-mono text-xs text-blue-400">{item.format}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Best Practices */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Best Practices & Tips:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">SECURITY TIPS:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Always verify converted keypairs work correctly</div>
                      <div>• Test with small amounts before using for large funds</div>
                      <div>• Double-check public key derivation matches</div>
                      <div>• Clear clipboard after copying sensitive data</div>
                      <div>• Use offline conversion for high-value keys</div>
                      <div>• Keep backups in multiple secure formats</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
                    <div className="font-pixel text-sm text-blue-400 mb-2">CONVERSION TIPS:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Base58 is most widely supported format</div>
                      <div>• Hex format is useful for debugging</div>
                      <div>• Array format works well with JavaScript</div>
                      <div>• JSON format preserves all key information</div>
                      <div>• Always include public key for verification</div>
                      <div>• Check format requirements before converting</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Issues */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Issues & Solutions:</h3>
                <div className="space-y-3">
                  {[
                    {
                      issue: 'Invalid Base58 characters',
                      solution: 'Check for similar characters: 0/O, 1/I/l. Remove invalid chars.',
                      severity: 'error'
                    },
                    {
                      issue: 'Wrong array length',
                      solution: 'Solana private keys should be exactly 64 bytes (64 numbers).',
                      severity: 'error'
                    },
                    {
                      issue: 'Hex format issues',
                      solution: 'Ensure even number of characters. Add leading zero if needed.',
                      severity: 'warning'
                    },
                    {
                      issue: 'JSON parsing errors',
                      solution: 'Validate JSON syntax. Check for proper quotes and commas.',
                      severity: 'warning'
                    },
                    {
                      issue: 'Public key mismatch',
                      solution: 'Verify derived public key matches expected. Check conversion.',
                      severity: 'error'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 border-2 ${
                      item.severity === 'error' 
                        ? 'bg-red-900/20 border-red-600/30' 
                        : 'bg-yellow-900/20 border-yellow-600/30'
                    }`}>
                      <div className={`font-pixel text-sm mb-2 ${
                        item.severity === 'error' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                        {item.issue}
                      </div>
                      <div className="font-mono text-xs text-gray-300">
                        {item.solution}
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