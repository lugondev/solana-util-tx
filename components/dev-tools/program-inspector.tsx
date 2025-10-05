'use client'

import { useState, useEffect } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  ProgramInspector,
  ProgramAnalysis,
  InspectionOptions,
  SecurityIssue,
  PerformanceMetric
} from '@/lib/solana/program-tools/program-inspector'
import { 
  Search,
  Code,
  Shield,
  Cpu,
  Download,
  Copy,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  FileText,
  Settings
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

export function ProgramInspectorComponent() {
  // State
  const [programId, setProgramId] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<ProgramAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<InspectionOptions>({
    includeSecurityAnalysis: true,
    includeBytecodeAnalysis: true,
    includePerformanceMetrics: true,
    includeInstructionAnalysis: true,
    deepAnalysis: false
  })
  const [activeTab, setActiveTab] = useState<'overview' | 'security' | 'performance' | 'instructions' | 'bytecode'>('overview')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const { connection } = useConnection()
  const inspector = new ProgramInspector(connection)

  // Analyze program
  const handleAnalyze = async () => {
    if (!programId.trim()) {
      setError('Please enter a program ID')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await inspector.analyzeProgram(programId.trim(), options)
      setAnalysis(result)
      setShowToast({ message: 'Program analysis completed successfully!', type: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
      setShowToast({ message: 'Analysis failed', type: 'error' })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
      setShowToast({ message: 'Copied to clipboard!', type: 'success' })
    } catch (error) {
      setShowToast({ message: 'Failed to copy', type: 'error' })
    }
  }

  // Export analysis
  const exportAnalysis = () => {
    if (!analysis) return

    const exportData = {
      programId,
      timestamp: new Date().toISOString(),
      analysis: {
        overview: analysis.overview,
        security: analysis.security,
        performance: analysis.performance,
        instructions: analysis.instructions,
        metadata: analysis.metadata
      },
      options
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `program-analysis-${programId.slice(0, 8)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const getSeverityColor = (severity: 'low' | 'medium' | 'high' | 'critical') => {
    switch (severity) {
      case 'critical': return 'text-red-400'
      case 'high': return 'text-orange-400'
      case 'medium': return 'text-yellow-400'
      case 'low': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'performance', label: 'Performance', icon: Cpu },
    { id: 'instructions', label: 'Instructions', icon: Code },
    { id: 'bytecode', label: 'Bytecode', icon: FileText }
  ]

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-4">
            <h2 className="font-pixel text-lg text-green-400">
              🔍 PROGRAM ANALYSIS
            </h2>
          </div>

          <div className="space-y-4">
            {/* Program ID Input */}
            <div>
              <label className="block font-pixel text-sm text-white mb-2">
                Program ID:
              </label>
              <PixelInput
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="Enter Solana program address (e.g., TokenkegQfeZyiNwEJbNbGKPFXCWuBvf9Ss623VQ5DA)"
                disabled={isAnalyzing}
              />
            </div>

            {/* Analysis Options */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="font-pixel text-sm text-white">Analysis Options:</div>
                <div className="space-y-3">
                  {[
                    { key: 'includeSecurityAnalysis', label: 'Security Analysis', desc: 'Scan for vulnerabilities' },
                    { key: 'includeBytecodeAnalysis', label: 'Bytecode Analysis', desc: 'Disassemble program code' },
                    { key: 'includePerformanceMetrics', label: 'Performance Metrics', desc: 'Compute usage analysis' },
                    { key: 'includeInstructionAnalysis', label: 'Instruction Analysis', desc: 'Decode instructions' }
                  ].map((option) => (
                    <div key={option.key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={option.key}
                        checked={options[option.key as keyof InspectionOptions] as boolean}
                        onChange={(e) => setOptions(prev => ({ ...prev, [option.key]: e.target.checked }))}
                        disabled={isAnalyzing}
                        className="w-4 h-4 text-green-400 border-gray-600 rounded"
                      />
                      <div>
                        <label htmlFor={option.key} className="font-pixel text-sm text-white">
                          {option.label}
                        </label>
                        <div className="font-mono text-xs text-gray-400">{option.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-blue-400" />
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="font-pixel text-sm text-blue-400 hover:text-blue-300"
                  >
                    Advanced Settings
                  </button>
                </div>

                {showAdvanced && (
                  <div className="p-4 bg-gray-800/50 border-2 border-blue-400/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="deepAnalysis"
                        checked={options.deepAnalysis}
                        onChange={(e) => setOptions(prev => ({ ...prev, deepAnalysis: e.target.checked }))}
                        disabled={isAnalyzing}
                        className="w-4 h-4 text-yellow-400 border-gray-600 rounded"
                      />
                      <div>
                        <label htmlFor="deepAnalysis" className="font-pixel text-sm text-yellow-400">
                          Deep Analysis
                        </label>
                        <div className="font-mono text-xs text-gray-400">
                          Comprehensive analysis (slower, more detailed)
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <PixelButton
              onClick={handleAnalyze}
              variant="primary"
              disabled={!programId.trim() || isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Search className="h-4 w-4 animate-spin" />
                  Analyzing Program...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Analyze Program
                </>
              )}
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Error Display */}
      {error && (
        <PixelCard>
          <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="font-pixel text-sm text-red-400">ANALYSIS ERROR:</span>
            </div>
            <div className="font-mono text-sm text-gray-300 mt-1">{error}</div>
          </div>
        </PixelCard>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Tab Navigation */}
          <PixelCard>
            <div className="border-b-4 border-purple-400/20 pb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-pixel text-lg text-purple-400">
                  📊 ANALYSIS RESULTS
                </h2>
                <div className="flex gap-2">
                  <PixelButton
                    onClick={exportAnalysis}
                    variant="secondary"
                    className="flex items-center gap-2 !text-xs"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </PixelButton>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 border-2 font-pixel text-xs transition-all ${
                    activeTab === id
                      ? 'border-green-400 bg-green-400/20 text-green-400'
                      : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </PixelCard>

          {/* Tab Content */}
          <PixelCard>
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div className="border-b-4 border-blue-400/20 pb-4">
                  <h3 className="font-pixel text-lg text-blue-400">Program Overview</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-green-400 mb-2">TYPE</div>
                    <div className="font-mono text-lg text-white">{analysis.overview.programType}</div>
                  </div>
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">SIZE</div>
                    <div className="font-mono text-lg text-white">{analysis.overview.codeSize} bytes</div>
                  </div>
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-purple-400 mb-2">VERSION</div>
                    <div className="font-mono text-lg text-white">{analysis.overview.version || 'Unknown'}</div>
                  </div>
                </div>

                {analysis.overview.description && (
                  <div className="p-4 bg-gray-800 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-yellow-400 mb-2">DESCRIPTION</div>
                    <div className="font-mono text-sm text-gray-300">{analysis.overview.description}</div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && analysis.security && (
              <div className="space-y-4">
                <div className="border-b-4 border-red-400/20 pb-4">
                  <h3 className="font-pixel text-lg text-red-400">Security Analysis</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {Object.entries({
                    Critical: analysis.security.issues.filter(i => i.severity === 'critical').length,
                    High: analysis.security.issues.filter(i => i.severity === 'high').length,
                    Medium: analysis.security.issues.filter(i => i.severity === 'medium').length,
                    Low: analysis.security.issues.filter(i => i.severity === 'low').length
                  }).map(([severity, count]) => (
                    <div key={severity} className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                      <div className={`font-pixel text-xs ${getSeverityColor(severity.toLowerCase() as any)}`}>
                        {severity.toUpperCase()}
                      </div>
                      <div className="font-mono text-lg text-white">{count}</div>
                    </div>
                  ))}
                </div>

                {analysis.security.issues.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.security.issues.map((issue, i) => (
                      <div key={i} className={`p-4 border-2 ${
                        issue.severity === 'critical' ? 'bg-red-900/20 border-red-600/30' :
                        issue.severity === 'high' ? 'bg-orange-900/20 border-orange-600/30' :
                        issue.severity === 'medium' ? 'bg-yellow-900/20 border-yellow-600/30' :
                        'bg-blue-900/20 border-blue-600/30'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className={`font-pixel text-sm ${getSeverityColor(issue.severity)}`}>
                            {issue.type} ({issue.severity.toUpperCase()})
                          </div>
                          <button
                            onClick={() => copyToClipboard(issue.description, `issue-${i}`)}
                            className="text-gray-400 hover:text-white"
                          >
                            {copied === `issue-${i}` ? (
                              <CheckCircle className="h-4 w-4 text-green-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        <div className="font-mono text-sm text-gray-300 mb-2">{issue.description}</div>
                        {issue.recommendation && (
                          <div className="font-mono text-xs text-green-400">
                            <strong>Recommendation:</strong> {issue.recommendation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="font-pixel text-sm text-green-400">No security issues detected</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'performance' && analysis.performance && (
              <div className="space-y-4">
                <div className="border-b-4 border-yellow-400/20 pb-4">
                  <h3 className="font-pixel text-lg text-yellow-400">Performance Metrics</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.performance.metrics.map((metric, i) => (
                    <div key={i} className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="font-pixel text-sm text-blue-400 mb-2">{metric.name.toUpperCase()}</div>
                      <div className="font-mono text-lg text-white mb-1">{metric.value}</div>
                      <div className="font-mono text-xs text-gray-400">{metric.unit}</div>
                      {metric.recommendation && (
                        <div className="font-mono text-xs text-yellow-400 mt-2">
                          {metric.recommendation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'instructions' && analysis.instructions && (
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-4">
                  <h3 className="font-pixel text-lg text-green-400">Instructions ({analysis.instructions.length})</h3>
                </div>

                <div className="space-y-3">
                  {analysis.instructions.map((instruction, i) => (
                    <div key={i} className="p-4 bg-gray-800 border-2 border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-pixel text-sm text-blue-400">{instruction.name}</div>
                        <div className="font-mono text-xs text-gray-400">ID: {instruction.discriminator}</div>
                      </div>
                      
                      {instruction.description && (
                        <div className="font-mono text-sm text-gray-300 mb-3">{instruction.description}</div>
                      )}

                      {instruction.accounts && instruction.accounts.length > 0 && (
                        <div className="mb-3">
                          <div className="font-pixel text-xs text-yellow-400 mb-2">ACCOUNTS:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {instruction.accounts.map((account, j) => (
                              <div key={j} className="p-2 bg-gray-900 border border-gray-600">
                                <div className="font-mono text-xs text-white">{account.name}</div>
                                <div className="font-mono text-xs text-gray-400">
                                  {account.isMut ? 'Mutable' : 'Readonly'} • {account.isSigner ? 'Signer' : 'No signer'}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {instruction.args && instruction.args.length > 0 && (
                        <div>
                          <div className="font-pixel text-xs text-purple-400 mb-2">ARGUMENTS:</div>
                          <div className="space-y-1">
                            {instruction.args.map((arg, k) => (
                              <div key={k} className="font-mono text-xs text-gray-300">
                                <span className="text-white">{arg.name}</span>: {arg.type}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'bytecode' && analysis.bytecode && (
              <div className="space-y-4">
                <div className="border-b-4 border-purple-400/20 pb-4">
                  <h3 className="font-pixel text-lg text-purple-400">Bytecode Analysis</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                    <div className="font-pixel text-xs text-green-400">SIZE</div>
                    <div className="font-mono text-lg text-white">{analysis.bytecode.size}</div>
                  </div>
                  <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                    <div className="font-pixel text-xs text-blue-400">HASH</div>
                    <div className="font-mono text-sm text-white">{analysis.bytecode.hash.slice(0, 8)}...</div>
                  </div>
                  <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                    <div className="font-pixel text-xs text-purple-400">DEPLOYED</div>
                    <div className="font-mono text-sm text-white">
                      {analysis.bytecode.deployedAt ? new Date(analysis.bytecode.deployedAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                    <div className="font-pixel text-xs text-yellow-400">UPGRADEABLE</div>
                    <div className="font-mono text-sm text-white">
                      {analysis.bytecode.isUpgradeable ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {analysis.bytecode.disassembly && (
                  <div className="p-4 bg-gray-900 border-2 border-gray-700">
                    <div className="font-pixel text-sm text-blue-400 mb-2">DISASSEMBLY (First 20 lines):</div>
                    <pre className="font-mono text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
                      {analysis.bytecode.disassembly.split('\n').slice(0, 20).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </PixelCard>
        </>
      )}

      {/* Toast */}
      {showToast && (
        <PixelToast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  )
}