'use client'

import { useState, useRef, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  VanityAddressGenerator, 
  VanityResult, 
  VanityProgress, 
  VanitySearchOptions,
  formatDuration,
  formatRate,
  isValidBase58Char,
  suggestValidPattern
} from '@/lib/solana/generators/vanity-address'
import { 
  Play, 
  Square, 
  Copy, 
  Download, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Target,
  Clock,
  Hash
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

interface VanityAddressGeneratorComponentProps {
  className?: string
}

export function VanityAddressGeneratorComponent({ className }: VanityAddressGeneratorComponentProps) {
  const [prefix, setPrefix] = useState('')
  const [suffix, setSuffix] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [maxAttempts, setMaxAttempts] = useState(1000000)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState<VanityProgress | null>(null)
  const [result, setResult] = useState<VanityResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const generatorRef = useRef<VanityAddressGenerator | null>(null)

  useEffect(() => {
    generatorRef.current = new VanityAddressGenerator()
    return () => {
      generatorRef.current?.stop()
    }
  }, [])

  const getDifficultyInfo = () => {
    if (!prefix && !suffix) return null
    
    try {
      const generator = new VanityAddressGenerator()
      return generator.getDifficultyRating(prefix, suffix, includeNumbers)
    } catch {
      return null
    }
  }

  const validateInputs = (): { valid: boolean; error?: string } => {
    if (!prefix && !suffix) {
      return { valid: false, error: 'Please enter a prefix or suffix' }
    }

    // Check for invalid characters
    const invalidPrefixChars = prefix.split('').filter(char => !isValidBase58Char(char))
    const invalidSuffixChars = suffix.split('').filter(char => !isValidBase58Char(char))

    if (invalidPrefixChars.length > 0) {
      return { valid: false, error: `Invalid characters in prefix: ${invalidPrefixChars.join(', ')}` }
    }

    if (invalidSuffixChars.length > 0) {
      return { valid: false, error: `Invalid characters in suffix: ${invalidSuffixChars.join(', ')}` }
    }

    if (prefix.length > 8) {
      return { valid: false, error: 'Prefix too long (max 8 characters for reasonable generation time)' }
    }

    if (suffix.length > 8) {
      return { valid: false, error: 'Suffix too long (max 8 characters for reasonable generation time)' }
    }

    return { valid: true }
  }

  const handleGenerate = async () => {
    const validation = validateInputs()
    if (!validation.valid) {
      setError(validation.error || 'Invalid input')
      return
    }

    setError(null)
    setResult(null)
    setIsGenerating(true)
    setProgress(null)

    const options: VanitySearchOptions = {
      prefix: prefix || undefined,
      suffix: suffix || undefined,
      caseSensitive,
      includeNumbers,
      maxAttempts
    }

    try {
      const generator = generatorRef.current!
      const result = await generator.generateVanityAddress(
        options,
        (progress) => setProgress(progress),
        (result) => setResult(result)
      )

      if (!result) {
        setError(`No match found after ${maxAttempts.toLocaleString()} attempts`)
      }
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

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowToast({ message: `${label} copied to clipboard!`, type: 'success' })
      setTimeout(() => setShowToast(null), 2000)
    } catch (err) {
      setShowToast({ message: 'Failed to copy to clipboard', type: 'error' })
      setTimeout(() => setShowToast(null), 2000)
    }
  }

  const handleDownload = () => {
    if (!result) return

    const content = `Vanity Address Generation Result
================================

Address: ${result.address}
Private Key: ${result.privateKey}
Match Type: ${result.matchType}
Pattern: ${result.matchedPattern}
Attempts: ${result.attempts.toLocaleString()}
Time Elapsed: ${formatDuration(result.timeElapsed / 1000)}
Rate: ${formatRate(result.attempts / (result.timeElapsed / 1000))}

Generated on: ${new Date().toISOString()}

SECURITY WARNING:
- Keep your private key secure and never share it
- This private key gives full control over the wallet
- Store it safely or import it into your wallet immediately
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vanity-wallet-${result.address.slice(0, 8)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handlePrefixChange = (value: string) => {
    const cleaned = suggestValidPattern(value)
    setPrefix(cleaned)
    setError(null)
  }

  const handleSuffixChange = (value: string) => {
    const cleaned = suggestValidPattern(value)
    setSuffix(cleaned)
    setError(null)
  }

  const difficultyInfo = getDifficultyInfo()

  const getDifficultyColor = (rating: string) => {
    switch (rating) {
      case 'Easy': return 'text-green-400'
      case 'Medium': return 'text-yellow-400'
      case 'Hard': return 'text-orange-400'
      case 'Very Hard': return 'text-red-400'
      case 'Extreme': return 'text-purple-400'
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
              ✨ VANITY ADDRESS GENERATOR
            </h2>
            <p className="font-mono text-sm text-gray-400">
              Generate custom Solana addresses with specific prefixes or suffixes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Prefix Input */}
            <div>
              <label className="font-mono text-sm text-gray-300 block mb-2">
                Prefix (starts with):
              </label>
              <PixelInput
                value={prefix}
                onChange={(e) => handlePrefixChange(e.target.value)}
                placeholder="e.g., Cool, 777, ABC"
                disabled={isGenerating}
                className="font-mono"
              />
              <div className="font-mono text-xs text-gray-500 mt-1">
                Max 8 characters, base58 only
              </div>
            </div>

            {/* Suffix Input */}
            <div>
              <label className="font-mono text-sm text-gray-300 block mb-2">
                Suffix (ends with):
              </label>
              <PixelInput
                value={suffix}
                onChange={(e) => handleSuffixChange(e.target.value)}
                placeholder="e.g., DOGE, 123, xyz"
                disabled={isGenerating}
                className="font-mono"
              />
              <div className="font-mono text-xs text-gray-500 mt-1">
                Max 8 characters, base58 only
              </div>
            </div>
          </div>

          {/* Difficulty Display */}
          {difficultyInfo && (
            <div className="p-4 bg-gray-800 border-4 border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Difficulty:</div>
                  <div className={`font-pixel text-sm ${getDifficultyColor(difficultyInfo.rating)}`}>
                    {difficultyInfo.rating}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Estimated Time:</div>
                  <div className="font-mono text-sm text-white">
                    {difficultyInfo.estimatedTime}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Expected Attempts:</div>
                  <div className="font-mono text-sm text-blue-400">
                    {difficultyInfo.difficulty.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                      Max Attempts:
                    </label>
                    <PixelInput
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      min={1000}
                      max={100000000}
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={caseSensitive}
                        onChange={(e) => setCaseSensitive(e.target.checked)}
                        disabled={isGenerating}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Case Sensitive</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={includeNumbers}
                        onChange={(e) => setIncludeNumbers(e.target.checked)}
                        disabled={isGenerating}
                        className="w-4 h-4"
                      />
                      <span className="font-mono text-sm text-gray-300">Include Numbers</span>
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
                disabled={(!prefix && !suffix) || !!error}
                className="flex-1 min-w-0"
              >
                <Play className="h-4 w-4" />
                [START GENERATION]
              </PixelButton>
            ) : (
              <PixelButton
                onClick={handleStop}
                variant="secondary"
                className="flex-1 min-w-0"
              >
                <Square className="h-4 w-4" />
                [STOP]
              </PixelButton>
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
                  <span className="font-mono text-xs text-gray-400">Attempts</span>
                </div>
                <div className="font-pixel text-sm text-white">
                  {progress.attempts.toLocaleString()}
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
                  {formatDuration(progress.timeElapsed / 1000)}
                </div>
              </div>

              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="font-mono text-xs text-gray-400">ETA</span>
                </div>
                <div className="font-pixel text-sm text-orange-400">
                  {progress.estimated === Infinity ? '∞' : formatDuration(progress.estimated)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-gray-400">Progress</span>
                <span className="font-mono text-xs text-gray-400">
                  {((progress.attempts / maxAttempts) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 border-4 border-gray-600 h-6">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-1000"
                  style={{ width: `${Math.min((progress.attempts / maxAttempts) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Result Display */}
      {result && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="font-pixel text-lg text-green-400">
                  ✅ VANITY ADDRESS FOUND!
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {/* Address */}
              <div>
                <div className="font-mono text-sm text-gray-400 mb-2">Generated Address:</div>
                <div className="p-4 bg-gray-800 border-4 border-green-600/30 break-all">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm text-green-400 break-all">
                      {result.address}
                    </span>
                    <PixelButton
                      variant="secondary"
                      onClick={() => handleCopy(result.address, 'Address')}
                      className="!px-3 flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </PixelButton>
                  </div>
                </div>
              </div>

              {/* Private Key */}
              <div>
                <div className="font-mono text-sm text-gray-400 mb-2">Private Key (Keep Secret!):</div>
                <div className="p-4 bg-red-900/20 border-4 border-red-600/30 break-all">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono text-sm text-red-300 break-all">
                      {result.privateKey}
                    </span>
                    <PixelButton
                      variant="secondary"
                      onClick={() => handleCopy(result.privateKey, 'Private Key')}
                      className="!px-3 flex-shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </PixelButton>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Match Type:</div>
                  <div className="font-pixel text-sm text-blue-400">{result.matchType}</div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Pattern:</div>
                  <div className="font-mono text-sm text-green-400">{result.matchedPattern}</div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Attempts:</div>
                  <div className="font-pixel text-sm text-purple-400">
                    {result.attempts.toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-gray-400 mb-1">Time:</div>
                  <div className="font-pixel text-sm text-yellow-400">
                    {formatDuration(result.timeElapsed / 1000)}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <PixelButton onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  [DOWNLOAD WALLET]
                </PixelButton>
                <PixelButton 
                  variant="secondary"
                  onClick={() => setResult(null)}
                >
                  [GENERATE ANOTHER]
                </PixelButton>
              </div>

              {/* Security Warning */}
              <div className="p-4 bg-red-900/20 border-4 border-red-600/30">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <div className="font-pixel text-sm text-red-400">SECURITY WARNING:</div>
                    <div className="font-mono text-xs text-gray-300">
                      • Keep your private key secure and never share it<br/>
                      • This private key gives full control over the wallet<br/>
                      • Import it into your wallet immediately or store it safely<br/>
                      • Anyone with this key can access and control your funds
                    </div>
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