'use client'

import { ProgramInspectorComponent } from '@/components/dev-tools/program-inspector'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import Link from 'next/link'
import { ArrowLeft, Search, Code, Shield, Hash, AlertTriangle, BookOpen, Cpu } from 'lucide-react'

export default function ProgramInspectorPage() {
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
              PROGRAM INSPECTOR
            </h1>
            <p className="font-mono text-sm text-gray-400 mt-1">
              Analyze and inspect Solana programs for security and functionality
            </p>
          </div>
        </div>

        {/* Quick Info */}
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-blue-400/20 pb-4">
              <h2 className="font-pixel text-lg text-blue-400 mb-2">
                ℹ️ ABOUT PROGRAM INSPECTION
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Search className="h-5 w-5 text-green-400" />
                  <h3 className="font-pixel text-sm text-green-400">ANALYSIS</h3>
                </div>
                <div className="space-y-2 font-mono text-xs text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Bytecode disassembly & analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Instruction pattern detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Account structure analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Program dependency mapping</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Security vulnerability scanning</span>
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
                    <span>Anchor program detection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Metadata extraction</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Instruction documentation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Account requirement analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚡</span>
                    <span>Performance metrics</span>
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
                    <span>Read-only program analysis</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Safe bytecode inspection</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>No program modification</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Verified data sources</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">🔒</span>
                    <span>Privacy-preserving analysis</span>
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
                        1. Enter program address or upload bytecode<br/>
                        2. Select analysis depth and modules<br/>
                        3. Review program structure and instructions<br/>
                        4. Check security analysis results<br/>
                        5. Export findings and documentation
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
                        • Obfuscated programs may limit analysis<br/>
                        • Complex custom instructions need review<br/>
                        • Some security checks are heuristic<br/>
                        • Results should be verified independently
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Program Inspector Component */}
      <ProgramInspectorComponent />

      {/* Analysis Categories */}
      <div className="mt-8">
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h2 className="font-pixel text-lg text-yellow-400 mb-2">
                🔍 ANALYSIS CATEGORIES
              </h2>
            </div>

            <div className="space-y-6">
              {/* Security Analysis */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Security Analysis:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                      <div className="font-pixel text-sm text-red-400 mb-2">CRITICAL CHECKS</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Authority validation patterns</div>
                        <div>• Signer requirement enforcement</div>
                        <div>• Account ownership verification</div>
                        <div>• Integer overflow protection</div>
                        <div>• Reentrancy attack prevention</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-900/20 border-2 border-yellow-600/30">
                      <div className="font-pixel text-sm text-yellow-400 mb-2">WARNING SIGNS</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Missing signer checks</div>
                        <div>• Unbounded loops or recursion</div>
                        <div>• Hardcoded addresses</div>
                        <div>• Insufficient input validation</div>
                        <div>• Missing error handling</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                      <div className="font-pixel text-sm text-green-400 mb-2">BEST PRACTICES</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Proper account validation</div>
                        <div>• Safe mathematical operations</div>
                        <div>• Comprehensive error codes</div>
                        <div>• Access control implementation</div>
                        <div>• Resource limit enforcement</div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
                      <div className="font-pixel text-sm text-blue-400 mb-2">AUDIT POINTS</div>
                      <div className="space-y-1 font-mono text-xs text-gray-300">
                        <div>• Cross-program invocation safety</div>
                        <div>• State transition validation</div>
                        <div>• Economic attack resistance</div>
                        <div>• Upgrade mechanism security</div>
                        <div>• Emergency stop capabilities</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Program Types */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Program Type Detection:</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-green-400 mb-2">Anchor Programs</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Full IDL extraction</div>
                      <div>• Instruction documentation</div>
                      <div>• Account constraint analysis</div>
                      <div>• Error code mapping</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Native Programs</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Bytecode analysis</div>
                      <div>• Instruction pattern detection</div>
                      <div>• Control flow mapping</div>
                      <div>• Resource usage analysis</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-purple-400 mb-2">SPL Programs</div>
                    <div className="space-y-1 font-mono text-xs text-gray-300">
                      <div>• Standard compliance check</div>
                      <div>• Extension support detection</div>
                      <div>• Interface compatibility</div>
                      <div>• Implementation verification</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Metrics */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Performance Metrics:</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-4 border-gray-700">
                    <thead>
                      <tr className="bg-gray-800">
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Metric
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Description
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Good Range
                        </th>
                        <th className="border border-gray-600 p-3 font-pixel text-sm text-green-400 text-left">
                          Impact
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { 
                          metric: 'Code Size', 
                          description: 'Total program bytecode size', 
                          range: '< 100KB', 
                          impact: 'Deployment cost' 
                        },
                        { 
                          metric: 'Instruction Count', 
                          description: 'Number of different instructions', 
                          range: '5-50', 
                          impact: 'Complexity & gas' 
                        },
                        { 
                          metric: 'Account Slots', 
                          description: 'Maximum accounts per instruction', 
                          range: '< 20', 
                          impact: 'Transaction size' 
                        },
                        { 
                          metric: 'Compute Units', 
                          description: 'Estimated CU consumption', 
                          range: '< 200K', 
                          impact: 'Transaction cost' 
                        },
                        { 
                          metric: 'Memory Usage', 
                          description: 'Heap and stack allocation', 
                          range: '< 32KB', 
                          impact: 'Runtime limits' 
                        }
                      ].map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                          <td className="border border-gray-600 p-3 font-pixel text-sm text-white">
                            {row.metric}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-gray-300">
                            {row.description}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-green-400">
                            {row.range}
                          </td>
                          <td className="border border-gray-600 p-3 font-mono text-sm text-blue-400">
                            {row.impact}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Common Issues */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Common Issues & Solutions:</h3>
                <div className="space-y-3">
                  {[
                    {
                      issue: 'Missing signer verification',
                      severity: 'critical',
                      description: 'Instructions accepting accounts without verifying signer status',
                      solution: 'Add explicit signer checks or use Anchor constraints'
                    },
                    {
                      issue: 'Integer overflow vulnerabilities',
                      severity: 'high',
                      description: 'Mathematical operations without overflow protection',
                      solution: 'Use checked arithmetic or safe math libraries'
                    },
                    {
                      issue: 'Insufficient account validation',
                      severity: 'medium',
                      description: 'Accepting accounts without proper ownership checks',
                      solution: 'Verify account owners and validate account types'
                    },
                    {
                      issue: 'Hardcoded program addresses',
                      severity: 'low',
                      description: 'Using fixed addresses instead of dynamic resolution',
                      solution: 'Use program-derived addresses or configuration'
                    }
                  ].map((item, i) => (
                    <div key={i} className={`p-4 border-2 ${
                      item.severity === 'critical' ? 'bg-red-900/20 border-red-600/30' :
                      item.severity === 'high' ? 'bg-orange-900/20 border-orange-600/30' :
                      item.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-600/30' :
                      'bg-blue-900/20 border-blue-600/30'
                    }`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className={`font-pixel text-sm ${
                            item.severity === 'critical' ? 'text-red-400' :
                            item.severity === 'high' ? 'text-orange-400' :
                            item.severity === 'medium' ? 'text-yellow-400' :
                            'text-blue-400'
                          }`}>
                            {item.issue} ({item.severity.toUpperCase()})
                          </div>
                          <div className="font-mono text-xs text-gray-300">
                            {item.description}
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="font-pixel text-xs text-green-400">SOLUTION:</div>
                          <div className="font-mono text-xs text-gray-300">
                            {item.solution}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tools Integration */}
              <div>
                <h3 className="font-pixel text-sm text-white mb-4">Integration with Other Tools:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 border-l-4 border-green-400">
                    <div className="font-pixel text-sm text-green-400 mb-2">IDL Generator</div>
                    <div className="font-mono text-xs text-gray-300">
                      Use inspection results to improve IDL generation accuracy and 
                      identify missing documentation or instruction variants.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-blue-400">
                    <div className="font-pixel text-sm text-blue-400 mb-2">Transaction Simulator</div>
                    <div className="font-mono text-xs text-gray-300">
                      Apply analysis findings to create more accurate transaction 
                      simulations and test edge cases identified during inspection.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-purple-400">
                    <div className="font-pixel text-sm text-purple-400 mb-2">Security Audits</div>
                    <div className="font-mono text-xs text-gray-300">
                      Export inspection reports for professional security audits 
                      and compliance verification processes.
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800 border-l-4 border-yellow-400">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">Documentation</div>
                    <div className="font-mono text-xs text-gray-300">
                      Generate comprehensive documentation from inspection results 
                      including API references and security considerations.
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