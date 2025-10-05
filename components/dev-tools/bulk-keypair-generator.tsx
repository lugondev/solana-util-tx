'use client'

import { useState, useRef, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import {
  BulkKeypairGenerator,
  KeypairInfo,
  BulkGenerationProgress,
  BulkGenerationOptions,
  formatDuration,
  formatRate,
  calculateFileSize
} from '@/lib/solana/generators/bulk-keypair'
import {
  Play,
  Square,
  Download,
  Settings,
  Hash,
  Clock,
  Zap,
  FileText,
  Database,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

interface BulkKeypairGeneratorComponentProps {
  className?: string
}

export function BulkKeypairGeneratorComponent({ className }: BulkKeypairGeneratorComponentProps) {
  const [count, setCount] = useState(10)
  const [format, setFormat] = useState<'json' | 'csv' | 'txt'>('json')
  const [includeIndex, setIncludeIndex] = useState(true)
  const [prefix, setPrefix] = useState('wallet')
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<BulkGenerationProgress | null>(null)
  const [results, setResults] = useState<KeypairInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const generatorRef = useRef<BulkKeypairGenerator | null>(null)

  useEffect(() => {
    generatorRef.current = new BulkKeypairGenerator()
    return () => {
      generatorRef.current?.stop()
    }
  }, [])

  const getEstimation = () => {
    const generator = new BulkKeypairGenerator()
    return generator.estimateGenerationTime(count)
  }

  const validateInputs = (): { valid: boolean; error?: string } => {
    const generator = new BulkKeypairGenerator()
    const options: BulkGenerationOptions = { count, format, includeIndex, prefix }
    return generator.validateOptions(options)
  }

  const handleGenerate = async () => {
    const validation = validateInputs()
    if (!validation.valid) {
      setError(validation.error || 'Invalid input')
      return
    }

    setError(null)
    setResults(null)
    setIsGenerating(true)
    setProgress(null)

    const options: BulkGenerationOptions = {
      count,
      format,
      includeIndex,
      prefix
    }

    try {
      const generator = generatorRef.current!
      const keypairs = await generator.generateBulkKeypairs(
        options,
        (progress) => setProgress(progress)
      )

      setResults(keypairs)
      setShowToast({ message: `Successfully generated ${keypairs.length} keypairs!`, type: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleStop = () => {
    generatorRef.current?.stop()
    setIsGenerating(false)
  }

  const handleDownload = () => {
    if (!results) return

    const generator = new BulkKeypairGenerator()
    const options: BulkGenerationOptions = { count, format, includeIndex, prefix }
    const content = generator.formatForExport(results, options)
    const blob = generator.createDownloadBlob(content, format)
    const extension = generator.getFileExtension(format)

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bulk-keypairs-${results.length}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowToast({ message: 'Keypairs downloaded successfully!', type: 'success' })
  }

  const handleCopyAll = async () => {
    if (!results) return

    try {
      const generator = new BulkKeypairGenerator()
      const options: BulkGenerationOptions = { count, format, includeIndex, prefix }
      const content = generator.formatForExport(results, options)
      
      await navigator.clipboard.writeText(content)
      setShowToast({ message: 'All keypairs copied to clipboard!', type: 'success' })
    } catch (err) {
      setShowToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const estimation = getEstimation()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Fast': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Slow': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Input Section */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-4">
            <h2 className="font-pixel text-lg text-green-400 mb-2">
              📦 BULK KEYPAIR GENERATOR
            </h2>
            <p className="font-mono text-sm text-gray-400">
              Generate multiple Solana keypairs at once with export options
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Count Input */}
            <div>
              <label className="font-mono text-sm text-gray-300 block mb-2">
                Number of Keypairs:
              </label>
              <PixelInput
                type="number"
                value={count}
                onChange={(e) => setCount(Math.max(1, Math.min(10000, Number(e.target.value))))}
                min={1}
                max={10000}
                disabled={isGenerating}
              />
              <div className="font-mono text-xs text-gray-500 mt-1">
                Range: 1 - 10,000 keypairs
              </div>
            </div>

            {/* Format Selection */}
            <div>
              <label className="font-mono text-sm text-gray-300 block mb-2">
                Export Format:
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'json' | 'csv' | 'txt')}
                disabled={isGenerating}
                className="w-full bg-gray-800 border-4 border-gray-600 font-mono text-sm text-white p-3 focus:border-green-400 focus:outline-none"
              >
                <option value="json">JSON (structured data)</option>
                <option value="csv">CSV (spreadsheet)</option>
                <option value="txt">TXT (plain text)</option>
              </select>
            </div>
          </div>

          {/* Generation Estimation */}
          <div className="p-4 bg-gray-800 border-4 border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">Estimated Time:</div>
                <div className={`font-pixel text-sm ${getDifficultyColor(estimation.difficulty)}`}>
                  {estimation.estimatedText}
                </div>
              </div>
              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">Difficulty:</div>
                <div className={`font-pixel text-sm ${getDifficultyColor(estimation.difficulty)}`}>
                  {estimation.difficulty}
                </div>
              </div>
              {results && (
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">File Size ({format}):</div>
                  <div className="font-mono text-sm text-blue-400">
                    {calculateFileSize(results, format)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 font-mono text-sm text-blue-400 hover:text-blue-300 transition-colors"
              disabled={isGenerating}
            >
              <Settings className="h-4 w-4" />
              Advanced Settings
            </button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-800 border-2 border-gray-700 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="font-mono text-sm text-gray-300 block mb-2">
                      Wallet Prefix (for TXT format):
                    </label>
                    <PixelInput
                      value={prefix}
                      onChange={(e) => setPrefix(e.target.value)}
                      placeholder="wallet"
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="flex items-center">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeIndex}
                        onChange={(e) => setIncludeIndex(e.target.checked)}
                        disabled={isGenerating}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Include Index Numbers</span>
                    </label>
                  </div>
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

          {/* Control Buttons */}
          <div className="flex flex-wrap gap-3">
            {!isGenerating ? (
              <PixelButton
                onClick={handleGenerate}
                disabled={count < 1 || count > 10000 || !!error}
                className="flex-1 min-w-0"
              >
                <Play className="h-4 w-4" />
                [GENERATE {count} KEYPAIRS]
              </PixelButton>
            ) : (
              <PixelButton
                onClick={handleStop}
                variant="secondary"
                className="flex-1 min-w-0"
              >
                <Square className="h-4 w-4" />
                [STOP GENERATION]
              </PixelButton>
            )}

            {results && !isGenerating && (
              <>
                <PixelButton
                  onClick={handleDownload}
                  variant="secondary"
                >
                  <Download className="h-4 w-4" />
                  [DOWNLOAD]
                </PixelButton>
                <PixelButton
                  onClick={handleCopyAll}
                  variant="secondary"
                >
                  <FileText className="h-4 w-4" />
                  [COPY ALL]
                </PixelButton>
              </>
            )}
          </div>
        </div>
      </PixelCard>

      {/* Progress Display */}
      {progress && isGenerating && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h3 className="font-pixel text-lg text-yellow-400 mb-2">
                ⚡ GENERATION IN PROGRESS
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span className="font-mono text-xs text-gray-400">Progress</span>
                </div>
                <div className="font-pixel text-sm text-white">
                  {progress.completed} / {progress.total}
                </div>
              </div>

              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-green-400" />
                  <span className="font-mono text-xs text-gray-400">Rate</span>
                </div>
                <div className="font-pixel text-sm text-green-400">
                  {formatRate(progress.rate)}
                </div>
              </div>

              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-purple-400" />
                  <span className="font-mono text-xs text-gray-400">Elapsed</span>
                </div>
                <div className="font-pixel text-sm text-purple-400">
                  {formatDuration(progress.timeElapsed)}
                </div>
              </div>

              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-orange-400" />
                  <span className="font-mono text-xs text-gray-400">ETA</span>
                </div>
                <div className="font-pixel text-sm text-orange-400">
                  {formatDuration(progress.estimatedTimeRemaining)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400">Completion</span>
                <span className="font-mono text-xs text-gray-400">
                  {progress.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 border-4 border-gray-600 h-6">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Results Display */}
      {results && !isGenerating && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="font-pixel text-lg text-green-400">
                  ✅ GENERATION COMPLETE!
                </h3>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">Generated:</div>
                <div className="font-pixel text-sm text-green-400">{results.length}</div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">Format:</div>
                <div className="font-pixel text-sm text-blue-400">{format.toUpperCase()}</div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">File Size:</div>
                <div className="font-pixel text-sm text-purple-400">
                  {calculateFileSize(results, format)}
                </div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">Indexed:</div>
                <div className="font-pixel text-sm text-yellow-400">
                  {includeIndex ? 'Yes' : 'No'}
                </div>
              </div>
            </div>

            {/* Preview (first few keypairs) */}
            <div>
              <div className="font-mono text-sm text-gray-400 mb-3">
                Preview (first {Math.min(3, results.length)} keypairs):
              </div>
              <div className="space-y-3">
                {results.slice(0, 3).map((keypair) => (
                  <div key={keypair.index} className="p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="space-y-2">
                      <div className="font-mono text-xs text-blue-400">
                        {includeIndex ? `Keypair #${keypair.index}` : 'Keypair'}
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        <div>
                          <span className="font-mono text-xs text-gray-400">Public: </span>
                          <span className="font-mono text-xs text-white break-all">
                            {keypair.publicKey}
                          </span>
                        </div>
                        <div>
                          <span className="font-mono text-xs text-gray-400">Private: </span>
                          <span className="font-mono text-xs text-red-300 break-all">
                            {keypair.privateKey.slice(0, 20)}...
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {results.length > 3 && (
                  <div className="p-3 bg-gray-700 border-2 border-gray-600 text-center">
                    <span className="font-mono text-xs text-gray-400">
                      ... and {results.length - 3} more keypairs
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Security Warning */}
            <div className="p-4 bg-red-900/20 border-4 border-red-600/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-pixel text-sm text-red-400">SECURITY WARNING:</div>
                  <div className="font-mono text-xs text-gray-300">
                    • Keep your private keys secure and never share them<br/>
                    • Each private key gives full control over its wallet<br/>
                    • Download or copy your keypairs immediately<br/>
                    • Store them safely or import them into your wallet<br/>
                    • Anyone with these keys can access and control the funds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
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