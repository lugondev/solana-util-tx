'use client'

import { IDLGeneratorComponent } from '@/components/dev-tools/idl-generator'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, FileText, Code, Zap, Shield, AlertTriangle, BookOpen } from 'lucide-react'

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
              Extract Interface Definition Language (IDL) from deployed Solana programs
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
                  <FileText className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">WHAT IS IDL</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Interface Definition Language describes program structure</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Defines instructions, accounts, and data types</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Enables automatic client code generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Essential for program integration</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-yellow-400" />
                  <h3 className="font-pixel text-sm text-yellow-400">FEATURES</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Automatic IDL extraction from programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>TypeScript interface generation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Reverse engineering for unknown programs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Support for Anchor and custom programs</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  <h3 className="font-pixel text-sm text-purple-400">OUTPUT FORMATS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">📋</span>
                    <span>Standard JSON IDL format</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">📋</span>
                    <span>TypeScript interfaces and types</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">📋</span>
                    <span>Complete instruction definitions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">📋</span>
                    <span>Account structure documentation</span>
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
                        1. Enter the program ID you want to analyze<br/>
                        2. Choose generation options (TypeScript, comments, etc.)<br/>
                        3. Click "Extract IDL" to begin analysis<br/>
                        4. Review extracted instructions and types<br/>
                        5. Download IDL JSON or TypeScript files
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
                        • Some programs may not have embedded IDL<br/>
                        • Reverse engineering provides basic structure only<br/>
                        • Custom programs may need manual analysis<br/>
                        • Complex types might need additional documentation
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

      {/* Documentation & Examples */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                💡 IDL STRUCTURE & EXAMPLES
              </h2>
            </div>

            <div className="space-y-6">
              {/* IDL Structure */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">IDL Structure Overview:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Instructions</div>
                    <div className="font-mono text-xs text-gray-300">
                      Define program entry points with parameters, accounts, and validation rules. 
                      Each instruction specifies required accounts (mutable/signer) and input arguments.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">Accounts</div>
                    <div className="font-mono text-xs text-gray-300">
                      Data structures stored on-chain. Define fields, types, and serialization format 
                      for program state and user data.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-purple-400">
                    <div className="font-pixel text-sm text-purple-400 mb-2">Types</div>
                    <div className="font-mono text-xs text-gray-300">
                      Custom data types used by instructions and accounts. Include structs, enums, 
                      and complex nested structures.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">Errors</div>
                    <div className="font-mono text-xs text-gray-300">
                      Custom error definitions with codes and messages for debugging and 
                      user-friendly error handling.
                    </div>
                  </div>
                </div>
              </div>

              {/* Known Program Types */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Supported Program Types:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-green-400">ANCHOR PROGRAMS</div>
                    <div className="space-y-2">
                      {[
                        'Full IDL extraction',
                        'Complete type information',
                        'Instruction documentation',
                        'Error code definitions'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                          <span className="font-mono text-xs text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-blue-400">NATIVE PROGRAMS</div>
                    <div className="space-y-2">
                      {[
                        'System Program',
                        'SPL Token Program',
                        'Associated Token Program',
                        'Stake Program'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                          <span className="font-mono text-xs text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="font-pixel text-sm text-purple-400">CUSTOM PROGRAMS</div>
                    <div className="space-y-2">
                      {[
                        'Reverse engineering',
                        'Basic structure detection',
                        'Manual analysis required',
                        'Best-effort extraction'
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                          <span className="font-mono text-xs text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Example IDL Structure */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Example IDL Structure:</h3>
                <div className="p-4 bg-gray-800 border-4 border-gray-700 overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-300">
{`{
  "name": "example_program",
  "version": "0.1.0",
  "instructions": [
    {
      "name": "initialize",
      "accounts": [
        {
          "name": "account",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "data",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "ExampleAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          }
        ]
      }
    }
  ],
  "types": [],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidData",
      "msg": "The provided data is invalid"
    }
  ]
}`}
                  </pre>
                </div>
              </div>

              {/* TypeScript Output Example */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Generated TypeScript Example:</h3>
                <div className="p-4 bg-gray-800 border-4 border-gray-700 overflow-x-auto">
                  <pre className="font-mono text-xs text-gray-300">
{`import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'

// Account Interfaces
export interface ExampleAccount {
  data: BN
  owner: PublicKey
}

// Instruction Interfaces
export interface InitializeArgs {
  data: BN
}

export interface InitializeAccounts {
  account: PublicKey
  user: PublicKey
}

// Error Codes
export enum ProgramError {
  InvalidData = 6000
}`}
                  </pre>
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Use Cases:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="font-pixel text-sm text-green-400 mb-2">DEVELOPMENT:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Generate client SDKs automatically</div>
                      <div>• Create TypeScript types for frontend</div>
                      <div>• Understand program interfaces</div>
                      <div>• Build integration tools</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
                    <div className="font-pixel text-sm text-blue-400 mb-2">ANALYSIS:</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Reverse engineer unknown programs</div>
                      <div>• Security auditing and analysis</div>
                      <div>• Program documentation generation</div>
                      <div>• Integration planning</div>
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