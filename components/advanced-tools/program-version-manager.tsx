'use client'

import { useState, useCallback } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { 
  ProgramVersionManager, 
  ProgramVersionHistory, 
  ProgramVersion, 
  VersionDiff,
  DeploymentPlan 
} from '@/lib/solana/advanced-tools/program-version-manager'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { PixelLoading } from '@/components/ui/pixel-loading'

interface ProgramVersionManagerProps {
  onVersionLoaded?: (version: ProgramVersionHistory) => void
}

export function ProgramVersionManagerComponent({ onVersionLoaded }: ProgramVersionManagerProps) {
  const { connection } = useConnection()
  const [mode, setMode] = useState<'single' | 'batch' | 'compare' | 'deploy'>('single')
  const [programId, setProgramId] = useState('')
  const [programIds, setProgramIds] = useState('')
  const [bufferAccount, setBufferAccount] = useState('')
  const [authority, setAuthority] = useState('')
  const [versionHistory, setVersionHistory] = useState<ProgramVersionHistory | null>(null)
  const [batchResults, setBatchResults] = useState<ProgramVersionHistory[]>([])
  const [versionDiff, setVersionDiff] = useState<VersionDiff | null>(null)
  const [deploymentPlan, setDeploymentPlan] = useState<DeploymentPlan | null>(null)
  const [selectedVersions, setSelectedVersions] = useState<{ from: string; to: string }>({ from: '', to: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const manager = new ProgramVersionManager(connection)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleGetVersion = async () => {
    if (!programId.trim()) {
      showToast('Please enter a program ID', 'error')
      return
    }

    setIsLoading(true)
    try {
      const history = await manager.getVersionHistory(programId.trim())
      if (history) {
        setVersionHistory(history)
        onVersionLoaded?.(history)
        showToast('Version history loaded successfully', 'success')
      } else {
        showToast('Program not found or invalid', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBatchAnalysis = async () => {
    const ids = programIds.split('\n').map(id => id.trim()).filter(Boolean)
    
    if (ids.length === 0) {
      showToast('Please enter program IDs', 'error')
      return
    }

    if (ids.length > 20) {
      showToast('Maximum 20 programs at once', 'error')
      return
    }

    setIsLoading(true)
    try {
      const results = await manager.getBatchVersions(ids)
      setBatchResults(results)
      showToast(`Analyzed ${results.length}/${ids.length} programs successfully`, 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompareVersions = async () => {
    if (!versionHistory || !selectedVersions.from || !selectedVersions.to) {
      showToast('Please select versions to compare', 'error')
      return
    }

    setIsLoading(true)
    try {
      const diff = await manager.compareVersions(
        versionHistory.programId,
        selectedVersions.from,
        selectedVersions.to
      )
      
      if (diff) {
        setVersionDiff(diff)
        showToast('Version comparison completed', 'success')
      } else {
        showToast('Failed to compare versions', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateDeploymentPlan = async () => {
    if (!programId.trim() || !bufferAccount.trim() || !authority.trim()) {
      showToast('Please fill all deployment fields', 'error')
      return
    }

    setIsLoading(true)
    try {
      const plan = await manager.createDeploymentPlan(
        programId.trim(),
        bufferAccount.trim(),
        authority.trim()
      )
      
      if (plan) {
        setDeploymentPlan(plan)
        showToast('Deployment plan created successfully', 'success')
      } else {
        showToast('Failed to create deployment plan', 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCommonProgram = (selectedProgramId: string) => {
    setProgramId(selectedProgramId)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard`, 'success')
  }

  const downloadData = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  const commonPrograms = ProgramVersionManager.getCommonPrograms()

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Manager Mode</h3>
          <div className="flex gap-4 flex-wrap">
            <PixelButton
              onClick={() => setMode('single')}
              variant={mode === 'single' ? 'primary' : 'secondary'}
            >
              Single Program
            </PixelButton>
            <PixelButton
              onClick={() => setMode('batch')}
              variant={mode === 'batch' ? 'primary' : 'secondary'}
            >
              Batch Analysis
            </PixelButton>
            <PixelButton
              onClick={() => setMode('compare')}
              variant={mode === 'compare' ? 'primary' : 'secondary'}
            >
              Compare Versions
            </PixelButton>
            <PixelButton
              onClick={() => setMode('deploy')}
              variant={mode === 'deploy' ? 'primary' : 'secondary'}
            >
              Deployment Plan
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Common Programs */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Common Programs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {commonPrograms.map((program) => (
              <PixelButton
                key={program.programId}
                onClick={() => handleSelectCommonProgram(program.programId)}
                variant="secondary"
                size="sm"
                className="justify-start"
              >
                <div className="text-left">
                  <div className="font-medium">{program.name}</div>
                  <div className="text-xs text-gray-400">{program.category}</div>
                </div>
              </PixelButton>
            ))}
          </div>
        </div>
      </PixelCard>

      {/* Single Program Mode */}
      {mode === 'single' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Single Program Analysis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Program ID
                </label>
                <PixelInput
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Enter program public key..."
                />
              </div>
              
              <PixelButton
                onClick={handleGetVersion}
                disabled={!programId.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? <PixelLoading size="sm" /> : 'Get Version History'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Batch Analysis Mode */}
      {mode === 'batch' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Batch Program Analysis</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Program IDs (one per line, max 20)
                </label>
                <textarea
                  value={programIds}
                  onChange={(e) => setProgramIds(e.target.value)}
                  placeholder="Enter program IDs, one per line..."
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <PixelButton
                onClick={handleBatchAnalysis}
                disabled={!programIds.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? <PixelLoading size="sm" /> : 'Analyze Programs'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Compare Versions Mode */}
      {mode === 'compare' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Compare Versions</h3>
            
            {!versionHistory ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Program ID
                  </label>
                  <PixelInput
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value)}
                    placeholder="Enter program public key..."
                  />
                </div>
                
                <PixelButton
                  onClick={handleGetVersion}
                  disabled={!programId.trim() || isLoading}
                  className="w-full"
                >
                  {isLoading ? <PixelLoading size="sm" /> : 'Load Program Versions'}
                </PixelButton>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      From Version
                    </label>
                    <select
                      value={selectedVersions.from}
                      onChange={(e) => setSelectedVersions(prev => ({ ...prev, from: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select version...</option>
                      {versionHistory.versions.map((version, index) => (
                        <option key={index} value={version.version}>
                          {version.version} ({formatTimestamp(version.deployedAt)})
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      To Version
                    </label>
                    <select
                      value={selectedVersions.to}
                      onChange={(e) => setSelectedVersions(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                    >
                      <option value="">Select version...</option>
                      {versionHistory.versions.map((version, index) => (
                        <option key={index} value={version.version}>
                          {version.version} ({formatTimestamp(version.deployedAt)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <PixelButton
                  onClick={handleCompareVersions}
                  disabled={!selectedVersions.from || !selectedVersions.to || isLoading}
                  className="w-full"
                >
                  {isLoading ? <PixelLoading size="sm" /> : 'Compare Versions'}
                </PixelButton>
              </div>
            )}
          </div>
        </PixelCard>
      )}

      {/* Deployment Plan Mode */}
      {mode === 'deploy' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Create Deployment Plan</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Program ID
                </label>
                <PixelInput
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  placeholder="Enter program public key..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Buffer Account
                </label>
                <PixelInput
                  value={bufferAccount}
                  onChange={(e) => setBufferAccount(e.target.value)}
                  placeholder="Enter buffer account address..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Authority
                </label>
                <PixelInput
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  placeholder="Enter authority public key..."
                />
              </div>
              
              <PixelButton
                onClick={handleCreateDeploymentPlan}
                disabled={!programId.trim() || !bufferAccount.trim() || !authority.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? <PixelLoading size="sm" /> : 'Create Deployment Plan'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Single Program Results */}
      {versionHistory && (
        <PixelCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {versionHistory.programName || 'Program'} Version History
              </h3>
              <div className="flex gap-2">
                <PixelButton
                  onClick={() => copyToClipboard(JSON.stringify(versionHistory, null, 2), 'Version data')}
                  variant="secondary"
                  size="sm"
                >
                  Copy
                </PixelButton>
                <PixelButton
                  onClick={() => downloadData(versionHistory, `program-version-${versionHistory.programId.slice(0, 8)}.json`)}
                  variant="secondary"
                  size="sm"
                >
                  Download
                </PixelButton>
              </div>
            </div>

            {/* Current Version */}
            <div className="bg-gray-800 p-4 rounded border mb-4">
              <h4 className="text-md font-semibold text-green-400 mb-3">Current Version</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Program ID:</span>
                  <div className="text-white font-mono break-all">
                    {versionHistory.currentVersion.programId}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Size:</span>
                  <div className="text-white">{formatBytes(versionHistory.currentVersion.size)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Upgradeable:</span>
                  <div className={versionHistory.currentVersion.isUpgradeable ? 'text-green-400' : 'text-red-400'}>
                    {versionHistory.currentVersion.isUpgradeable ? 'Yes' : 'No'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-400">Authority:</span>
                  <div className="text-white font-mono break-all">
                    {versionHistory.currentVersion.authority.slice(0, 8)}...
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-800 p-3 rounded border">
                <div className="text-lg font-bold text-blue-400">{versionHistory.totalVersions}</div>
                <div className="text-xs text-gray-400">Total Versions</div>
              </div>
              <div className="bg-gray-800 p-3 rounded border">
                <div className="text-lg font-bold text-green-400">
                  {versionHistory.isActive ? 'Active' : 'Inactive'}
                </div>
                <div className="text-xs text-gray-400">Status</div>
              </div>
              <div className="bg-gray-800 p-3 rounded border">
                <div className="text-lg font-bold text-purple-400">
                  {formatBytes(versionHistory.currentVersion.size)}
                </div>
                <div className="text-xs text-gray-400">Program Size</div>
              </div>
              <div className="bg-gray-800 p-3 rounded border">
                <div className="text-lg font-bold text-yellow-400">
                  {formatTimestamp(versionHistory.lastUpdated)}
                </div>
                <div className="text-xs text-gray-400">Last Updated</div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Batch Results */}
      {batchResults.length > 0 && (
        <PixelCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Batch Analysis Results</h3>
              <PixelButton
                onClick={() => downloadData(batchResults, `batch-analysis-${Date.now()}.json`)}
                variant="secondary"
                size="sm"
              >
                Download All
              </PixelButton>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left p-2 text-gray-300">Program</th>
                    <th className="text-left p-2 text-gray-300">Size</th>
                    <th className="text-left p-2 text-gray-300">Upgradeable</th>
                    <th className="text-left p-2 text-gray-300">Versions</th>
                    <th className="text-left p-2 text-gray-300">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {batchResults.map((result, index) => (
                    <tr key={index} className="border-b border-gray-800 hover:bg-gray-800/50">
                      <td className="p-2">
                        <div className="text-white font-medium">
                          {result.programName || 'Unknown Program'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {result.programId.slice(0, 16)}...
                        </div>
                      </td>
                      <td className="p-2 text-white">
                        {formatBytes(result.currentVersion.size)}
                      </td>
                      <td className="p-2">
                        <span className={result.currentVersion.isUpgradeable ? 'text-green-400' : 'text-red-400'}>
                          {result.currentVersion.isUpgradeable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="p-2 text-white">{result.totalVersions}</td>
                      <td className="p-2 text-gray-300">
                        {formatTimestamp(result.lastUpdated)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Version Diff Results */}
      {versionDiff && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Version Comparison</h3>
            
            <div className="space-y-4">
              {/* Comparison Overview */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800 p-4 rounded border">
                  <h4 className="text-md font-semibold text-blue-400 mb-2">From Version</h4>
                  <div className="space-y-1 text-sm">
                    <div>Version: <span className="text-white">{versionDiff.fromVersion.version}</span></div>
                    <div>Size: <span className="text-white">{formatBytes(versionDiff.fromVersion.size)}</span></div>
                    <div>Date: <span className="text-white">{formatTimestamp(versionDiff.fromVersion.deployedAt)}</span></div>
                  </div>
                </div>
                
                <div className="bg-gray-800 p-4 rounded border">
                  <h4 className="text-md font-semibold text-green-400 mb-2">To Version</h4>
                  <div className="space-y-1 text-sm">
                    <div>Version: <span className="text-white">{versionDiff.toVersion.version}</span></div>
                    <div>Size: <span className="text-white">{formatBytes(versionDiff.toVersion.size)}</span></div>
                    <div>Date: <span className="text-white">{formatTimestamp(versionDiff.toVersion.deployedAt)}</span></div>
                  </div>
                </div>
              </div>

              {/* Changes Summary */}
              <div className="bg-gray-800 p-4 rounded border">
                <h4 className="text-md font-semibold text-white mb-3">Changes Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Size Change:</span>
                    <div className={`font-medium ${versionDiff.sizeChange > 0 ? 'text-red-400' : versionDiff.sizeChange < 0 ? 'text-green-400' : 'text-gray-400'}`}>
                      {versionDiff.sizeChange > 0 ? '+' : ''}{formatBytes(Math.abs(versionDiff.sizeChange))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Code Changed:</span>
                    <div className={versionDiff.hashChanged ? 'text-yellow-400' : 'text-gray-400'}>
                      {versionDiff.hashChanged ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Authority Changed:</span>
                    <div className={versionDiff.authorityChanged ? 'text-orange-400' : 'text-gray-400'}>
                      {versionDiff.authorityChanged ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-400">Time Difference:</span>
                    <div className="text-white">
                      {Math.round(versionDiff.timeDifference / (1000 * 60 * 60 * 24))} days
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Changes */}
              {versionDiff.changes.length > 0 && (
                <div className="bg-gray-800 p-4 rounded border">
                  <h4 className="text-md font-semibold text-white mb-3">Detailed Changes</h4>
                  <ul className="space-y-2">
                    {versionDiff.changes.map((change, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                        <span className="text-gray-300">{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </PixelCard>
      )}

      {/* Deployment Plan Results */}
      {deploymentPlan && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Deployment Plan</h3>
            
            <div className="space-y-4">
              {/* Plan Overview */}
              <div className="bg-gray-800 p-4 rounded border">
                <h4 className="text-md font-semibold text-white mb-3">Plan Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Program ID:</span>
                    <div className="text-white font-mono break-all">{deploymentPlan.programId}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Buffer Account:</span>
                    <div className="text-white font-mono break-all">{deploymentPlan.bufferAccount}</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Estimated Cost:</span>
                    <div className="text-white">{(deploymentPlan.estimatedCost / 1_000_000).toFixed(4)} SOL</div>
                  </div>
                  <div>
                    <span className="text-gray-400">Required Signers:</span>
                    <div className="text-white">{deploymentPlan.requiredSigners.length}</div>
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {deploymentPlan.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-500/30 p-4 rounded">
                  <h4 className="text-md font-semibold text-yellow-400 mb-3">⚠️ Warnings</h4>
                  <ul className="space-y-1">
                    {deploymentPlan.warnings.map((warning, index) => (
                      <li key={index} className="text-yellow-300 text-sm">
                        • {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Signers */}
              <div className="bg-gray-800 p-4 rounded border">
                <h4 className="text-md font-semibold text-white mb-3">Required Signers</h4>
                <div className="space-y-2">
                  {deploymentPlan.requiredSigners.map((signer, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-700 p-2 rounded">
                      <span className="text-white font-mono text-sm">{signer}</span>
                      <span className="text-gray-400 text-xs">
                        {index === 0 ? 'Authority' : 'Upgrade Authority'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions Preview */}
              <div className="bg-gray-800 p-4 rounded border">
                <h4 className="text-md font-semibold text-white mb-3">Instructions</h4>
                <div className="space-y-2">
                  {deploymentPlan.instructions.map((instruction, index) => (
                    <div key={index} className="bg-gray-700 p-3 rounded">
                      <div className="text-sm font-medium text-blue-400">{instruction.type}</div>
                      <div className="text-xs text-gray-300 mt-1">{instruction.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {toast && (
        <PixelToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}