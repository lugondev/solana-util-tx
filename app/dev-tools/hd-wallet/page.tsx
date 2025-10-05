'use client'

import { HDWalletComponent } from '@/components/dev-tools/hd-wallet'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, TreePine, Key, Shield, Hash, AlertTriangle, BookOpen, Settings } from 'lucide-react'

export default function HDWalletPage() {
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
              HD WALLET DERIVATION
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Hierarchical Deterministic wallets with BIP39/BIP44 support
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT HD WALLETS
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">HIERARCHICAL</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>BIP39 mnemonic phrase generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>BIP44 derivation path support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Multiple account generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Custom derivation paths</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Seed phrase validation</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">KEY FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>12/15/18/21/24 word phrases</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Multiple language support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Batch account generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Export in multiple formats</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Derivation path preview</span>
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
                    <span>Client-side seed generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Cryptographically secure entropy</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No network transmission</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Standard compliance (BIP39/44)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Wallet software compatible</span>
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
                        1. Generate new mnemonic or import existing<br/>
                        2. Choose derivation path and account range<br/>
                        3. Generate multiple accounts from single seed<br/>
                        4. Export accounts in preferred format<br/>
                        5. Import to compatible wallet software
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-red-400">SECURITY WARNING:</div>
                      <div className="font-mono text-xs text-gray-300">
                        • Seed phrases give full access to ALL derived wallets<br/>
                        • Store mnemonic phrases extremely securely<br/>
                        • Never share or store online unencrypted<br/>
                        • Consider hardware wallets for large amounts
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* HD Wallet Component */}
      <HDWalletComponent />

      {/* Technical Documentation */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                📚 TECHNICAL DOCUMENTATION
              </h2>
            </div>

            <div className="space-y-6">
              {/* BIP Standards */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">BIP Standards Implementation:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-green-400 mb-2">BIP39 - Mnemonic Phrases</div>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div>• Standard for generating mnemonic phrases</div>
                      <div>• 2048 word dictionary for entropy</div>
                      <div>• Checksum validation for phrase integrity</div>
                      <div>• Multiple language support available</div>
                      <div>• Converts entropy to human-readable words</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">BIP44 - HD Wallets</div>
                    <div className="space-y-2 font-mono text-xs text-gray-300">
                      <div>• Hierarchical Deterministic wallet structure</div>
                      <div>• Standard derivation path format</div>
                      <div>• Purpose / Coin / Account / Change / Index</div>
                      <div>• Cross-wallet compatibility standard</div>
                      <div>• Unlimited accounts from single seed</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Derivation Path Guide */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Derivation Path Structure:</h3>
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="space-y-4">
                    <div className="font-mono text-sm text-green-400">
                      m / 44' / 501' / account' / change / address_index
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-blue-400">PURPOSE (44')</div>
                        <div className="font-mono text-xs text-gray-300">
                          • Always 44 for BIP44<br/>
                          • Indicates HD wallet standard<br/>
                          • Hardened derivation (')
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-green-400">COIN TYPE (501')</div>
                        <div className="font-mono text-xs text-gray-300">
                          • 501 for Solana network<br/>
                          • Registered coin type<br/>
                          • Hardened derivation (')
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-purple-400">ACCOUNT (X')</div>
                        <div className="font-mono text-xs text-gray-300">
                          • User account number<br/>
                          • 0', 1', 2', etc.<br/>
                          • Hardened derivation (')
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-yellow-400">CHANGE (0/1)</div>
                        <div className="font-mono text-xs text-gray-300">
                          • 0 for external addresses<br/>
                          • 1 for internal (change)<br/>
                          • Non-hardened derivation
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="font-pixel text-xs text-orange-400">ADDRESS INDEX</div>
                        <div className="font-mono text-xs text-gray-300">
                          • Sequential address number<br/>
                          • 0, 1, 2, 3, etc.<br/>
                          • Non-hardened derivation
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Paths */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Derivation Path Examples:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Derivation Path
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Description
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Use Case
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          path: "m/44'/501'/0'/0/0", 
                          desc: "First account, first address", 
                          use: "Primary wallet address" 
                        },
                        { 
                          path: "m/44'/501'/0'/0/1", 
                          desc: "First account, second address", 
                          use: "Secondary receiving address" 
                        },
                        { 
                          path: "m/44'/501'/1'/0/0", 
                          desc: "Second account, first address", 
                          use: "Separate account/purpose" 
                        },
                        { 
                          path: "m/44'/501'/0'/1/0", 
                          desc: "First account, change address", 
                          use: "Internal change handling" 
                        },
                        { 
                          path: "m/44'/501'/2'/0/0", 
                          desc: "Third account, first address", 
                          use: "Business/trading account" 
                        }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-blue-400">
                            {row.path}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-white">
                            {row.desc}
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

              {/* Security Best Practices */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Security Best Practices:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">SEED PHRASE SECURITY:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Write down mnemonic on paper (multiple copies)</div>
                      <div>• Store in different secure physical locations</div>
                      <div>• Never store digitally unencrypted</div>
                      <div>• Consider steel backup plates for durability</div>
                      <div>• Test recovery before using with funds</div>
                      <div>• Use BIP39 passphrase for additional security</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="font-pixel text-sm text-red-400 mb-2">AVOID THESE RISKS:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Don't take photos of seed phrases</div>
                      <div>• Never store in cloud services</div>
                      <div>• Don't share via messaging apps</div>
                      <div>• Avoid typing into untrusted devices</div>
                      <div>• Don't store near other sensitive documents</div>
                      <div>• Never use brain wallets or weak seeds</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Compatibility */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Wallet Compatibility:</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { name: 'Phantom', compatible: true, note: 'Full BIP44 support' },
                    { name: 'Solflare', compatible: true, note: 'HD wallet support' },
                    { name: 'Backpack', compatible: true, note: 'Multi-account' },
                    { name: 'Glow', compatible: true, note: 'BIP39 import' },
                    { name: 'Ledger', compatible: true, note: 'Hardware HD' },
                    { name: 'Trezor', compatible: true, note: 'Hardware HD' },
                    { name: 'Sollet', compatible: true, note: 'Web wallet' },
                    { name: 'Trust Wallet', compatible: true, note: 'Mobile HD' }
                  ].map((wallet, i) => (
                    <div key={i} className="p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="space-y-1">
                        <div className="font-pixel text-sm text-white">{wallet.name}</div>
                        <div className={`font-mono text-xs ${wallet.compatible ? 'text-green-400' : 'text-red-400'}`}>
                          {wallet.compatible ? '✓ Compatible' : '✗ Not supported'}
                        </div>
                        <div className="font-mono text-xs text-gray-400">{wallet.note}</div>
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