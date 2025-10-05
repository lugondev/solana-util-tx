'use client'

import { useState, useRef } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { IDLGenerator, IDLInfo, IDLGenerationOptions } from '@/lib/solana/program-tools/idl-generator'
import { useConnection } from '@solana/wallet-adapter-react'
import {
  Search,
  Download,
  Copy,
  Code,
  FileText,
  AlertTriangle,
  CheckCircle,
  Package,
  Settings,
  Eye,
  Layers
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

interface IDLGeneratorComponentProps {
  className?: string
}

export function IDLGeneratorComponent({ className }: IDLGeneratorComponentProps) {
  const [programId, setProgramId] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [idlInfo, setIdlInfo] = useState<IDLInfo | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState<IDLGenerationOptions>({
    includeMetadata: true,
    generateTypeScript: true,
    includeComments: true,
    formatOutput: true
  })
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'instructions' | 'accounts' | 'types' | 'typescript'>('overview')
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const { connection } = useConnection()
  const generatorRef = useRef<IDLGenerator | null>(null)

  // Initialize generator
  if (!generatorRef.current && connection) {
    generatorRef.current = new IDLGenerator(connection)
  }

  const handleExtract = async () => {
    if (!programId.trim()) {
      setError('Please enter a program ID')
      return
    }

    if (!generatorRef.current) {
      setError('Connection not available')
      return
    }

    setError(null)
    setIdlInfo(null)
    setIsExtracting(true)

    try {
      const result = await generatorRef.current.extractIDL(programId.trim())
      setIdlInfo(result)
      setActiveTab('overview')
      setShowToast({ message: 'IDL extracted successfully!', type: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to extract IDL')
    } finally {
      setIsExtracting(false)
    }
  }

  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content)
      setShowToast({ message: `${label} copied to clipboard!`, type: 'success' })
    } catch (err) {
      setShowToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowToast({ message: 'File downloaded successfully!', type: 'success' })
  }

  const getTypeScriptCode = () => {
    if (!idlInfo || !generatorRef.current) return ''
    return generatorRef.current.generateTypeScript(idlInfo, options)
  }

  const getIDLJson = () => {
    if (!idlInfo || !generatorRef.current) return ''
    return generatorRef.current.formatAsJSON(idlInfo, options.formatOutput)
  }

  const knownPrograms = [
    { id: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', name: 'SPL Token Program' },
    { id: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', name: 'Associated Token Program' },
    { id: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', name: 'Jupiter V6' },
    { id: 'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', name: 'Orca Whirlpool' },
    { id: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', name: 'Raydium AMM V4' }
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-4">
            <h2 className="font-pixel text-lg text-green-400 mb-2">
              📋 IDL GENERATOR
            </h2>
            <p className="font-mono text-sm text-gray-400">
              Extract Interface Definition Language (IDL) from deployed Solana programs
            </p>
          </div>

          <div className="space-y-4">
            {/* Program ID Input */}
            <div>
              <label className="font-mono text-sm text-gray-300 block mb-2">
                Program ID:
              </label>
              <PixelInput
                value={programId}
                onChange={(e) => setProgramId(e.target.value)}
                placeholder="Enter program address (e.g., TokenkegQfeZyiNw...)"
                disabled={isExtracting}
              />
            </div>

            {/* Known Programs */}
            <div>
              <div className="font-mono text-sm text-gray-400 mb-2">Quick Select:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {knownPrograms.map((program) => (
                  <button
                    key={program.id}
                    onClick={() => setProgramId(program.id)}
                    disabled={isExtracting}
                    className="p-2 bg-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="font-mono text-xs text-blue-400">{program.name}</div>
                    <div className="font-mono text-xs text-gray-400 truncate">
                      {program.id.slice(0, 20)}...
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced Options */}
            <div>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
                disabled={isExtracting}
              >
                <Settings className="h-4 w-4" />
                Generation Options
              </button>

              {showAdvanced && (
                <div className="mt-4 p-4 bg-gray-800 border-2 border-gray-700 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.includeMetadata}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeMetadata: e.target.checked }))}
                        disabled={isExtracting}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Include Metadata</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.generateTypeScript}
                        onChange={(e) => setOptions(prev => ({ ...prev, generateTypeScript: e.target.checked }))}
                        disabled={isExtracting}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Generate TypeScript</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.includeComments}
                        onChange={(e) => setOptions(prev => ({ ...prev, includeComments: e.target.checked }))}
                        disabled={isExtracting}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Include Comments</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={options.formatOutput}
                        onChange={(e) => setOptions(prev => ({ ...prev, formatOutput: e.target.checked }))}
                        disabled={isExtracting}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Format Output</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/20 border-4 border-red-600/30">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <span className="font-mono text-sm text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Extract Button */}
            <PixelButton
              onClick={handleExtract}
              disabled={!programId.trim() || isExtracting}
              className="w-full"
            >
              {isExtracting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  [EXTRACTING IDL...]
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  [EXTRACT IDL]
                </>
              )}
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Results */}
      {idlInfo && (
        <div className="space-y-6">
          {/* Overview */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-blue-400/20 pb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                  <h3 className="font-pixel text-lg text-green-400">
                    ✅ IDL EXTRACTED SUCCESSFULLY
                  </h3>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Program Name:</div>
                  <div className="font-pixel text-sm text-green-400">{idlInfo.programName}</div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Instructions:</div>
                  <div className="font-pixel text-sm text-blue-400">{idlInfo.instructions.length}</div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Accounts:</div>
                  <div className="font-pixel text-sm text-purple-400">{idlInfo.accounts.length}</div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Types:</div>
                  <div className="font-pixel text-sm text-yellow-400">{idlInfo.types.length}</div>
                </div>
              </div>

              {/* Program Info */}
              <div className="space-y-3">
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Program ID:</div>
                  <div className="font-mono text-sm text-white break-all">{idlInfo.programId}</div>
                </div>
                {idlInfo.version && (
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">Version:</div>
                    <div className="font-mono text-sm text-white">{idlInfo.version}</div>
                  </div>
                )}
                {idlInfo.metadata?.description && (
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-1">Description:</div>
                    <div className="font-mono text-sm text-white">{idlInfo.metadata.description}</div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <PixelButton
                  onClick={() => handleDownload(getIDLJson(), `${idlInfo.programName || 'program'}-idl.json`)}
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  [DOWNLOAD JSON]
                </PixelButton>
                {options.generateTypeScript && (
                  <PixelButton
                    onClick={() => handleDownload(getTypeScriptCode(), `${idlInfo.programName || 'program'}-types.ts`)}
                    variant="secondary"
                  >
                    <Code className="h-4 w-4" />
                    [DOWNLOAD TS]
                  </PixelButton>
                )}
                <PixelButton
                  onClick={() => handleCopy(getIDLJson(), 'IDL JSON')}
                  variant="secondary"
                >
                  <Copy className="h-4 w-4" />
                  [COPY JSON]
                </PixelButton>
              </div>
            </div>
          </PixelCard>

          {/* Detailed View */}
          <PixelCard>
            <div className="space-y-4">
              {/* Tabs */}
              <div className="border-b-4 border-gray-700 pb-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'overview', label: 'Overview', icon: Eye },
                    { id: 'instructions', label: 'Instructions', icon: Package },
                    { id: 'accounts', label: 'Accounts', icon: FileText },
                    { id: 'types', label: 'Types', icon: Layers },
                    ...(options.generateTypeScript ? [{ id: 'typescript', label: 'TypeScript', icon: Code }] : [])
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`px-4 py-2 border-2 font-mono text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-green-400 bg-green-400/10 text-green-400'
                          : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content */}
              <div className="min-h-[400px]">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <h4 className="font-pixel text-sm text-white">Program Overview</h4>
                    <div className="p-4 bg-gray-800 border-2 border-gray-700">
                      <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify({
                          name: idlInfo.programName,
                          version: idlInfo.version,
                          programId: idlInfo.programId,
                          instructionsCount: idlInfo.instructions.length,
                          accountsCount: idlInfo.accounts.length,
                          typesCount: idlInfo.types.length,
                          errorsCount: idlInfo.errors.length
                        }, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {activeTab === 'instructions' && (
                  <div className="space-y-4">
                    <h4 className="font-pixel text-sm text-white">Instructions ({idlInfo.instructions.length})</h4>
                    <div className="space-y-3">
                      {idlInfo.instructions.map((instruction, index) => (
                        <div key={index} className="p-4 bg-gray-800 border-2 border-gray-700">
                          <div className="space-y-2">
                            <div className="font-mono text-sm text-green-400">{instruction.name}</div>
                            {instruction.docs && (
                              <div className="font-mono text-xs text-gray-400">
                                {instruction.docs.join(' ')}
                              </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="font-mono text-xs text-blue-400 mb-1">
                                  Accounts ({instruction.accounts.length}):
                                </div>
                                {instruction.accounts.map((account, i) => (
                                  <div key={i} className="font-mono text-xs text-gray-300">
                                    {account.name} {account.isMut ? '[mut]' : ''} {account.isSigner ? '[signer]' : ''}
                                  </div>
                                ))}
                              </div>
                              <div>
                                <div className="font-mono text-xs text-purple-400 mb-1">
                                  Args ({instruction.args.length}):
                                </div>
                                {instruction.args.map((arg, i) => (
                                  <div key={i} className="font-mono text-xs text-gray-300">
                                    {arg.name}: {arg.type}
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'accounts' && (
                  <div className="space-y-4">
                    <h4 className="font-pixel text-sm text-white">Accounts ({idlInfo.accounts.length})</h4>
                    <div className="space-y-3">
                      {idlInfo.accounts.map((account, index) => (
                        <div key={index} className="p-4 bg-gray-800 border-2 border-gray-700">
                          <div className="space-y-2">
                            <div className="font-mono text-sm text-blue-400">{account.name}</div>
                            {account.docs && (
                              <div className="font-mono text-xs text-gray-400">
                                {account.docs.join(' ')}
                              </div>
                            )}
                            <div className="font-mono text-xs text-gray-300">
                              Type: {account.type.kind}
                            </div>
                            {account.type.fields && (
                              <div>
                                <div className="font-mono text-xs text-purple-400 mb-1">Fields:</div>
                                {account.type.fields.map((field, i) => (
                                  <div key={i} className="font-mono text-xs text-gray-300 ml-4">
                                    {field.name}: {field.type}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'types' && (
                  <div className="space-y-4">
                    <h4 className="font-pixel text-sm text-white">Types ({idlInfo.types.length})</h4>
                    <div className="space-y-3">
                      {idlInfo.types.map((type, index) => (
                        <div key={index} className="p-4 bg-gray-800 border-2 border-gray-700">
                          <div className="space-y-2">
                            <div className="font-mono text-sm text-yellow-400">{type.name}</div>
                            {type.docs && (
                              <div className="font-mono text-xs text-gray-400">
                                {type.docs.join(' ')}
                              </div>
                            )}
                            <div className="font-mono text-xs text-gray-300">
                              Kind: {type.type.kind}
                            </div>
                            {type.type.fields && (
                              <div>
                                <div className="font-mono text-xs text-green-400 mb-1">Fields:</div>
                                {type.type.fields.map((field, i) => (
                                  <div key={i} className="font-mono text-xs text-gray-300 ml-4">
                                    {field.name}: {field.type}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'typescript' && options.generateTypeScript && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-pixel text-sm text-white">Generated TypeScript</h4>
                      <div className="flex gap-2">
                        <PixelButton
                          onClick={() => handleCopy(getTypeScriptCode(), 'TypeScript code')}
                          variant="secondary"
                          className="!px-3"
                        >
                          <Copy className="h-4 w-4" />
                        </PixelButton>
                        <PixelButton
                          onClick={() => handleDownload(getTypeScriptCode(), `${idlInfo.programName || 'program'}-types.ts`)}
                          variant="secondary"
                          className="!px-3"
                        >
                          <Download className="h-4 w-4" />
                        </PixelButton>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-800 border-2 border-gray-700 overflow-x-auto">
                      <pre className="font-mono text-xs text-gray-300 whitespace-pre">
                        {getTypeScriptCode()}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </PixelCard>
        </div>
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