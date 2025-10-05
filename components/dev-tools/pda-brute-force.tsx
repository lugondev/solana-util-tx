'use client'

import { useState, useRef, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import {
  PDABruteForcer,
  PDASearchOptions,
  PDASeeds,
  PDAConstraints,
  PDAResult,
  PDAProgress,
  createCommonSeeds,
  formatDuration,
  formatRate
} from '@/lib/solana/program-tools/pda-brute-forcer'
import {
  Play,
  Square,
  Plus,
  Trash2,
  Copy,
  Download,
  Settings,
  Target,
  Hash,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  BookOpen
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

interface PDABruteForceComponentProps {
  className?: string
}

export function PDABruteForceComponent({ className }: PDABruteForceComponentProps) {
  const [programId, setProgramId] = useState('')
  const [seeds, setSeeds] = useState<PDASeeds[]>([
    { type: 'string', value: '', description: 'Static prefix' }
  ])
  const [constraints, setConstraints] = useState<PDAConstraints>({
    caseSensitive: false
  })
  const [maxAttempts, setMaxAttempts] = useState(100000)
  
  const [isSearching, setIsSearching] = useState(false)
  const [progress, setProgress] = useState<PDAProgress | null>(null)
  const [results, setResults] = useState<PDAResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const bruteForceRef = useRef<PDABruteForcer | null>(null)

  useEffect(() => {
    bruteForceRef.current = new PDABruteForcer()
    return () => {
      bruteForceRef.current?.stop()
    }
  }, [])

  const validateInputs = (): { valid: boolean; error?: string } => {
    if (!programId.trim()) {
      return { valid: false, error: 'Program ID is required' }
    }

    if (seeds.length === 0) {
      return { valid: false, error: 'At least one seed is required' }
    }

    for (let i = 0; i < seeds.length; i++) {
      const seed = seeds[i]
      if (seed.type === 'variable') {
        if (!seed.variableRange) {
          return { valid: false, error: `Variable seed ${i + 1} needs a range` }
        }
        if (seed.variableRange.min > seed.variableRange.max) {
          return { valid: false, error: `Invalid range for seed ${i + 1}` }
        }
      } else if (seed.value === undefined || seed.value === '') {
        return { valid: false, error: `Seed ${i + 1} needs a value` }
      }
    }

    return { valid: true }
  }

  const getEstimation = () => {
    if (!bruteForceRef.current) return null
    
    try {
      const options: PDASearchOptions = { programId, seeds, constraints, maxAttempts }
      return bruteForceRef.current.estimateSearchDifficulty(options)
    } catch {
      return null
    }
  }

  const handleSearch = async () => {
    const validation = validateInputs()
    if (!validation.valid) {
      setError(validation.error || 'Invalid input')
      return
    }

    if (!bruteForceRef.current) {
      setError('Brute forcer not initialized')
      return
    }

    setError(null)
    setResults([])
    setIsSearching(true)
    setProgress(null)

    const options: PDASearchOptions = {
      programId: programId.trim(),
      seeds,
      constraints,
      maxAttempts
    }

    try {
      const foundPDAs = await bruteForceRef.current.findPDAs(
        options,
        (progress) => setProgress(progress)
      )

      setResults(foundPDAs)
      setShowToast({ 
        message: `Found ${foundPDAs.length} matching PDAs!`, 
        type: 'success' 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setIsSearching(false)
    }
  }

  const handleStop = () => {
    bruteForceRef.current?.stop()
    setIsSearching(false)
  }

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setShowToast({ message: `${label} copied to clipboard!`, type: 'success' })
    } catch (err) {
      setShowToast({ message: 'Failed to copy to clipboard', type: 'error' })
    }
  }

  const handleDownload = () => {
    if (results.length === 0) return

    const content = `PDA Brute Force Results
=======================
Program ID: ${programId}
Search completed: ${new Date().toISOString()}
Results found: ${results.length}

Seeds Configuration:
${seeds.map((seed, i) => `${i + 1}. ${seed.type}: ${seed.description || 'No description'}`).join('\n')}

Constraints:
${Object.entries(constraints).filter(([_, value]) => value !== undefined && value !== '').map(([key, value]) => `${key}: ${value}`).join('\n')}

Results:
========
${results.map((result, i) => `
${i + 1}. Address: ${result.address}
   Bump: ${result.bump}
   Attempts: ${result.attempts}
   Time: ${formatDuration(result.timeElapsed)}
   Matched: ${result.matchedConstraints.join(', ')}
   Seeds Used: [${result.seedsUsed.map(s => typeof s === 'string' ? `"${s}"` : s).join(', ')}]
`).join('')}
`

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pda-results-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setShowToast({ message: 'Results downloaded successfully!', type: 'success' })
  }

  const addSeed = () => {
    setSeeds([...seeds, { type: 'string', value: '', description: '' }])
  }

  const removeSeed = (index: number) => {
    setSeeds(seeds.filter((_, i) => i !== index))
  }

  const updateSeed = (index: number, updates: Partial<PDASeeds>) => {
    const newSeeds = [...seeds]
    newSeeds[index] = { ...newSeeds[index], ...updates }
    setSeeds(newSeeds)
  }

  const loadCommonSeeds = (commonSeeds: PDASeeds[]) => {
    setSeeds(commonSeeds)
  }

  const estimation = getEstimation()

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
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
              🎯 PDA BRUTE FORCER
            </h2>
            <p className="font-mono text-sm text-gray-400">
              Find Program Derived Addresses (PDAs) with specific properties
            </p>
          </div>

          {/* Program ID */}
          <div>
            <label className="font-mono text-sm text-gray-300 block mb-2">
              Program ID:
            </label>
            <PixelInput
              value={programId}
              onChange={(e) => setProgramId(e.target.value)}
              placeholder="Enter program address"
              disabled={isSearching}
            />
          </div>

          {/* Seeds Configuration */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="font-mono text-sm text-gray-300">
                Seeds Configuration:
              </label>
              <PixelButton
                onClick={addSeed}
                disabled={isSearching || seeds.length >= 8}
                variant="secondary"
                className="!px-3 !py-2"
              >
                <Plus className="h-4 w-4" />
              </PixelButton>
            </div>

            <div className="space-y-3">
              {seeds.map((seed, index) => (
                <div key={index} className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm text-blue-400">Seed {index + 1}</span>
                      <button
                        onClick={() => removeSeed(index)}
                        disabled={isSearching || seeds.length <= 1}
                        className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Type */}
                      <div>
                        <label className="font-mono text-xs text-gray-400 block mb-1">Type:</label>
                        <select
                          value={seed.type}
                          onChange={(e) => updateSeed(index, { type: e.target.value as any })}
                          disabled={isSearching}
                          className="w-full bg-gray-700 border-2 border-gray-600 font-mono text-sm text-white p-2 focus:border-green-400 focus:outline-none"
                        >
                          <option value="string">String</option>
                          <option value="publickey">Public Key</option>
                          <option value="number">Number</option>
                          <option value="variable">Variable Range</option>
                        </select>
                      </div>

                      {/* Value/Range */}
                      <div>
                        <label className="font-mono text-xs text-gray-400 block mb-1">
                          {seed.type === 'variable' ? 'Range:' : 'Value:'}
                        </label>
                        {seed.type === 'variable' ? (
                          <div className="flex gap-1">
                            <input
                              type="number"
                              placeholder="Min"
                              value={seed.variableRange?.min || 0}
                              onChange={(e) => updateSeed(index, {
                                variableRange: {
                                  ...seed.variableRange,
                                  min: Number(e.target.value),
                                  max: seed.variableRange?.max || 100,
                                  type: seed.variableRange?.type || 'u32'
                                }
                              })}
                              disabled={isSearching}
                              className="w-full bg-gray-700 border-2 border-gray-600 font-mono text-sm text-white p-2 focus:border-green-400 focus:outline-none"
                            />
                            <input
                              type="number"
                              placeholder="Max"
                              value={seed.variableRange?.max || 100}
                              onChange={(e) => updateSeed(index, {
                                variableRange: {
                                  ...seed.variableRange,
                                  min: seed.variableRange?.min || 0,
                                  max: Number(e.target.value),
                                  type: seed.variableRange?.type || 'u32'
                                }
                              })}
                              disabled={isSearching}
                              className="w-full bg-gray-700 border-2 border-gray-600 font-mono text-sm text-white p-2 focus:border-green-400 focus:outline-none"
                            />
                          </div>
                        ) : (
                          <PixelInput
                            value={seed.value?.toString() || ''}
                            onChange={(e) => updateSeed(index, { 
                              value: seed.type === 'number' ? Number(e.target.value) : e.target.value 
                            })}
                            placeholder={`Enter ${seed.type} value`}
                            disabled={isSearching}
                          />
                        )}
                      </div>

                      {/* Description */}
                      <div>
                        <label className="font-mono text-xs text-gray-400 block mb-1">Description:</label>
                        <PixelInput
                          value={seed.description || ''}
                          onChange={(e) => updateSeed(index, { description: e.target.value })}
                          placeholder="Optional description"
                          disabled={isSearching}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Common Seeds */}
            <div>
              <div className="font-mono text-sm text-gray-400 mb-2">Common Patterns:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {createCommonSeeds().map((pattern) => (
                  <button
                    key={pattern.name}
                    onClick={() => loadCommonSeeds(pattern.seeds)}
                    disabled={isSearching}
                    className="p-2 bg-gray-800 border-2 border-gray-700 hover:border-blue-500 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="font-mono text-xs text-blue-400">{pattern.name}</div>
                    <div className="font-mono text-xs text-gray-400">
                      {pattern.seeds.length} seeds
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Constraints */}
          <div>
            <label className="font-mono text-sm text-gray-300 block mb-2">
              Address Constraints:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <PixelInput
                value={constraints.prefix || ''}
                onChange={(e) => setConstraints(prev => ({ ...prev, prefix: e.target.value || undefined }))}
                placeholder="Starts with (prefix)"
                disabled={isSearching}
              />
              <PixelInput
                value={constraints.suffix || ''}
                onChange={(e) => setConstraints(prev => ({ ...prev, suffix: e.target.value || undefined }))}
                placeholder="Ends with (suffix)"
                disabled={isSearching}
              />
              <PixelInput
                value={constraints.contains || ''}
                onChange={(e) => setConstraints(prev => ({ ...prev, contains: e.target.value || undefined }))}
                placeholder="Contains text"
                disabled={isSearching}
              />
              <PixelInput
                type="number"
                value={maxAttempts}
                onChange={(e) => setMaxAttempts(Number(e.target.value))}
                placeholder="Max attempts"
                disabled={isSearching}
              />
            </div>
            
            <div className="mt-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={constraints.caseSensitive || false}
                  onChange={(e) => setConstraints(prev => ({ ...prev, caseSensitive: e.target.checked }))}
                  disabled={isSearching}
                  className="w-4 h-4"
                />
                <span className="font-mono text-sm text-gray-300">Case Sensitive</span>
              </label>
            </div>
          </div>

          {/* Difficulty Estimation */}
          {estimation && (
            <div className="p-4 bg-gray-800 border-4 border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Difficulty:</div>
                  <div className={`font-pixel text-sm ${getDifficultyColor(estimation.difficulty)}`}>
                    {estimation.difficulty}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Estimated Time:</div>
                  <div className="font-mono text-sm text-white">
                    {estimation.estimatedTime}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs text-gray-400 mb-1">Combinations:</div>
                  <div className="font-mono text-sm text-blue-400">
                    {estimation.totalCombinations.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          )}

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
            {!isSearching ? (
              <PixelButton
                onClick={handleSearch}
                disabled={!validateInputs().valid}
                className="flex-1 min-w-0"
              >
                <Play className="h-4 w-4" />
                [START SEARCH]
              </PixelButton>
            ) : (
              <PixelButton
                onClick={handleStop}
                variant="secondary"
                className="flex-1 min-w-0"
              >
                <Square className="h-4 w-4" />
                [STOP SEARCH]
              </PixelButton>
            )}

            {results.length > 0 && !isSearching && (
              <PixelButton
                onClick={handleDownload}
                variant="secondary"
              >
                <Download className="h-4 w-4" />
                [DOWNLOAD]
              </PixelButton>
            )}
          </div>
        </div>
      </PixelCard>

      {/* Progress Display */}
      {progress && isSearching && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-yellow-400/20 pb-4">
              <h3 className="font-pixel text-lg text-yellow-400 mb-2">
                🔍 SEARCH IN PROGRESS
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
                  {formatDuration(progress.timeElapsed)}
                </div>
              </div>

              <div className="p-4 bg-gray-800 border-4 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-orange-400" />
                  <span className="font-mono text-xs text-gray-400">Found</span>
                </div>
                <div className="font-pixel text-sm text-orange-400">
                  {progress.found.length}
                </div>
              </div>
            </div>

            {/* Current Seeds */}
            {progress.currentSeeds && (
              <div>
                <div className="font-mono text-sm text-gray-400 mb-2">Current Seeds:</div>
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-xs text-white">
                    [{progress.currentSeeds.map(seed => 
                      typeof seed === 'string' ? `"${seed}"` : seed
                    ).join(', ')}]
                  </div>
                </div>
              </div>
            )}
          </div>
        </PixelCard>
      )}

      {/* Results Display */}
      {results.length > 0 && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                <h3 className="font-pixel text-lg text-green-400">
                  ✅ FOUND {results.length} MATCHING PDAs
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="p-4 bg-gray-800 border-4 border-green-600/30">
                  <div className="space-y-3">
                    {/* Address */}
                    <div>
                      <div className="font-mono text-sm text-gray-400 mb-1">PDA Address:</div>
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-mono text-sm text-green-400 break-all">
                          {result.address}
                        </span>
                        <PixelButton
                          variant="secondary"
                          onClick={() => handleCopy(result.address, 'PDA Address')}
                          className="!px-3 flex-shrink-0"
                        >
                          <Copy className="h-4 w-4" />
                        </PixelButton>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-2 bg-gray-700 border border-gray-600">
                        <div className="font-mono text-xs text-gray-400">Bump:</div>
                        <div className="font-mono text-sm text-white">{result.bump}</div>
                      </div>
                      <div className="p-2 bg-gray-700 border border-gray-600">
                        <div className="font-mono text-xs text-gray-400">Attempts:</div>
                        <div className="font-mono text-sm text-white">{result.attempts.toLocaleString()}</div>
                      </div>
                      <div className="p-2 bg-gray-700 border border-gray-600">
                        <div className="font-mono text-xs text-gray-400">Time:</div>
                        <div className="font-mono text-sm text-white">{formatDuration(result.timeElapsed)}</div>
                      </div>
                      <div className="p-2 bg-gray-700 border border-gray-600">
                        <div className="font-mono text-xs text-gray-400">Matched:</div>
                        <div className="font-mono text-sm text-blue-400">
                          {result.matchedConstraints.join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Seeds Used */}
                    <div>
                      <div className="font-mono text-sm text-gray-400 mb-1">Seeds Used:</div>
                      <div className="p-3 bg-gray-700 border border-gray-600">
                        <div className="font-mono text-xs text-white">
                          [{result.seedsUsed.map(seed => 
                            typeof seed === 'string' ? `"${seed}"` : seed
                          ).join(', ')}]
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
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