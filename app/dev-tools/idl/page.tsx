'use client'

import { IDLGeneratorComponent } from '@/components/dev-tools/idl-generator'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, FileCode, Settings, Shield, Hash, AlertTriangle, BookOpen, Cpu } from 'lucide-react'

export default function IDLGeneratorPage() {
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
              IDL GENERATOR
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Auto-generate Interface Description Language files from Solana programs
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT IDL GENERATION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">GENERATION</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Automatic IDL extraction from programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Instruction parsing & analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Account structure detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Type definition extraction</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Error code documentation</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Anchor program support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Native program analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Multiple output formats</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Instruction simulation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Validation & verification</span>
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
                    <span>Read-only program access</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No modification to programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Safe bytecode analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Verified program data only</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Client-side processing</span>
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
                        1. Enter program address or upload bytecode<br/>
                        2. Select analysis depth and output format<br/>
                        3. Tool extracts program instructions & accounts<br/>
                        4. Generates comprehensive IDL definition<br/>
                        5. Download or copy generated IDL file
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <div className="font-pixel text-sm text-red-400">LIMITATIONS:</div>
                      <div className="font-mono text-xs text-gray-300">
                        • Complex programs may need manual review<br/>
                        • Some instruction details may be incomplete<br/>
                        • Custom types might require adjustment<br/>
                        • Generated IDL should be validated before use
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* IDL Generator Component */}
      <IDLGeneratorComponent />

      {/* Documentation */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                📚 IDL FORMAT & STRUCTURE
              </h2>
            </div>

            <div className="space-y-6">
              {/* IDL Structure */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Standard IDL Structure:</h3>
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <pre className="font-mono text-xs text-gray-300 overflow-x-auto">
{`{
  "version": "0.1.0",
  "name": "my_program",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "UserAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [...],
  "errors": [...],
  "constants": [...]
}`}
                  </pre>
                </div>
              </div>

              {/* Supported Program Types */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Supported Program Types:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-green-400 mb-2">Anchor Programs</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Full IDL generation support</div>
                        <div>• Complete instruction parsing</div>
                        <div>• Account structure extraction</div>
                        <div>• Error code documentation</div>
                        <div>• Type definitions included</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-blue-400 mb-2">Native Programs</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Basic instruction identification</div>
                        <div>• Account pattern analysis</div>
                        <div>• Data structure estimation</div>
                        <div>• Manual verification recommended</div>
                        <div>• Limited type information</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-purple-400 mb-2">SPL Programs</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Standard SPL token support</div>
                        <div>• Associated token accounts</div>
                        <div>• Token-2022 extensions</div>
                        <div>• Metadata program support</div>
                        <div>• Well-documented interfaces</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-yellow-400 mb-2">Custom Programs</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Best-effort instruction parsing</div>
                        <div>• Pattern-based account detection</div>
                        <div>• Heuristic type inference</div>
                        <div>• Manual review recommended</div>
                        <div>• Community contributions welcome</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Output Formats */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Output Formats:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-green-400 mb-2">JSON IDL</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Standard Anchor format</div>
                      <div>• Widely supported</div>
                      <div>• Easy to parse</div>
                      <div>• Tool-friendly</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">TypeScript</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Type-safe interfaces</div>
                      <div>• Direct import support</div>
                      <div>• IntelliSense compatible</div>
                      <div>• Development-ready</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-purple-400 mb-2">Rust Definitions</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Native Rust structs</div>
                      <div>• Serialization support</div>
                      <div>• Anchor compatibility</div>
                      <div>• Build integration</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Examples */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Use Cases:</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">Development Integration</div>
                    <div className="font-mono text-xs text-gray-300">
                      Generate IDL files for unknown or undocumented programs to enable 
                      type-safe client development with Anchor TypeScript.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Protocol Analysis</div>
                    <div className="font-mono text-xs text-gray-300">
                      Reverse engineer program interfaces to understand instruction 
                      structures and account requirements for integration or research.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-purple-400">
                    <div className="font-pixel text-sm text-purple-400 mb-2">Documentation Generation</div>
                    <div className="font-mono text-xs text-gray-300">
                      Create comprehensive documentation for existing programs 
                      including instruction details and account structures.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">Testing & Validation</div>
                    <div className="font-mono text-xs text-gray-300">
                      Generate test cases and validation logic based on program 
                      interfaces to ensure correct client implementation.
                    </div>
                  </div>
                </div>
              </div>

              {/* Known Limitations */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Known Limitations & Solutions:</h3>
                <div className="space-y-3">
                  {[
                    {
                      limitation: 'Complex custom types may not be fully detected',
                      solution: 'Review and manually adjust type definitions in generated IDL',
                      severity: 'warning'
                    },
                    {
                      limitation: 'Some instruction variants might be missed',
                      solution: 'Cross-reference with program source or documentation',
                      severity: 'warning'
                    },
                    {
                      limitation: 'Error messages may be generic or incomplete',
                      solution: 'Supplement with program-specific error documentation',
                      severity: 'info'
                    },
                    {
                      limitation: 'Obfuscated programs cannot be analyzed',
                      solution: 'Request IDL from program authors or use verified sources',
                      severity: 'error'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 border-2 ${
                      item.severity === 'error' 
                        ? 'bg-red-900/20 border-red-600/30' 
                        : item.severity === 'warning'
                        ? 'bg-yellow-900/20 border-yellow-600/30'
                        : 'bg-blue-900/20 border-blue-600/30'
                    }`}>
                      <div className={`font-pixel text-sm mb-2 ${
                        item.severity === 'error' ? 'text-red-400' : 
                        item.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                      }`}>
                        {item.limitation}
                      </div>
                      <div className="font-mono text-xs text-gray-300">
                        <strong>Solution:</strong> {item.solution}
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