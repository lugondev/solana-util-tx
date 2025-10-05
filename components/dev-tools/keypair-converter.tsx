'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  KeypairConverter,
  KeypairFormats,
  ConversionResult,
  validateFormat,
  detectInputFormat
} from '@/lib/solana/generators/keypair-converter'
import { 
  ArrowRightLeft,
  Copy,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Upload,
  FileText
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

type FormatType = 'base58' | 'hex' | 'array' | 'json'

export function KeypairConverterComponent() {
  // State
  const [inputFormat, setInputFormat] = useState<FormatType>('base58')
  const [outputFormat, setOutputFormat] = useState<FormatType>('hex')
  const [inputData, setInputData] = useState('')
  const [result, setResult] = useState<ConversionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [autoDetect, setAutoDetect] = useState(true)
  const [copied, setCopied] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const converter = new KeypairConverter()

  // Auto-detect input format
  useEffect(() => {
    if (autoDetect && inputData.trim()) {
      const detected = detectInputFormat(inputData.trim())
      if (detected && detected !== inputFormat) {
        setInputFormat(detected)
      }
    }
  }, [inputData, autoDetect, inputFormat])

  // Convert on input change
  useEffect(() => {
    if (inputData.trim()) {
      handleConvert()
    } else {
      setResult(null)
      setError(null)
    }
  }, [inputData, inputFormat, outputFormat])

  const handleConvert = () => {
    if (!inputData.trim()) {
      setResult(null)
      setError(null)
      return
    }

    try {
      setError(null)
      const conversionResult = converter.convert(inputData.trim(), inputFormat, outputFormat)
      setResult(conversionResult)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed')
      setResult(null)
    }
  }

  const handleSwapFormats = () => {
    if (result) {
      const temp = inputFormat
      setInputFormat(outputFormat)
      setOutputFormat(temp)
      setInputData(getOutputForFormat(outputFormat))
    }
  }

  const getOutputForFormat = (format: FormatType): string => {
    if (!result) return ''
    
    switch (format) {
      case 'base58':
        return result.base58.privateKey
      case 'hex':
        return result.hex.privateKey
      case 'array':
        return `[${result.array.privateKey.join(', ')}]`
      case 'json':
        return JSON.stringify(result.json, null, 2)
      default:
        return ''
    }
  }

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

  const exportResult = () => {
    if (!result) return

    const exportData = {
      input: {
        format: inputFormat,
        data: inputData
      },
      output: {
        format: outputFormat,
        data: getOutputForFormat(outputFormat)
      },
      verification: {
        publicKey: result.base58.publicKey,
        timestamp: new Date().toISOString()
      }
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `keypair-conversion-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputData(content)
    }
    reader.readAsText(file)
  }

  const formatLabels = {
    base58: 'Base58',
    hex: 'Hexadecimal',
    array: 'Byte Array',
    json: 'JSON Object'
  }

  const formatDescriptions = {
    base58: 'Standard Solana wallet format',
    hex: 'Raw bytes as hexadecimal',
    array: 'JavaScript array of bytes',
    json: 'Structured JSON object'
  }

  const isValidInput = inputData.trim() && validateFormat(inputData.trim(), inputFormat)

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-pixel text-lg text-green-400">
                🔄 FORMAT CONVERTER
              </h2>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="autoDetect"
                  checked={autoDetect}
                  onChange={(e) => setAutoDetect(e.target.checked)}
                  className="w-4 h-4 text-green-400 border-gray-600 rounded"
                />
                <label htmlFor="autoDetect" className="font-pixel text-sm text-white">
                  Auto-detect
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-sm text-white mb-2">
                  Input Format:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(formatLabels) as FormatType[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setInputFormat(format)}
                      disabled={autoDetect}
                      className={`
                        p-3 border-4 font-pixel text-xs transition-all
                        ${inputFormat === format
                          ? 'border-green-400 bg-green-400/20 text-green-400'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                        }
                        ${autoDetect ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-700'}
                      `}
                    >
                      {formatLabels[format]}
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDescriptions[format]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-pixel text-sm text-white">
                    Input Data:
                  </label>
                  <label className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-pixel text-xs cursor-pointer">
                    <Upload className="h-3 w-3 inline mr-1" />
                    Upload
                    <input
                      type="file"
                      accept=".json,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder={`Enter ${formatLabels[inputFormat]} data...`}
                  className={`w-full px-3 py-3 bg-gray-800 border-4 ${
                    isValidInput ? 'border-green-600' : inputData ? 'border-red-600' : 'border-gray-700'
                  } focus:border-green-400 font-mono text-sm text-white placeholder-gray-500 resize-none`}
                  rows={6}
                />
                {inputData && (
                  <div className="mt-1 flex items-center gap-2">
                    {isValidInput ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="font-mono text-xs text-green-400">
                          Valid {formatLabels[inputFormat]} format
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="font-mono text-xs text-red-400">
                          Invalid format
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Output Section */}
            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-sm text-white mb-2">
                  Output Format:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(formatLabels) as FormatType[]).map((format) => (
                    <button
                      key={format}
                      onClick={() => setOutputFormat(format)}
                      className={`
                        p-3 border-4 font-pixel text-xs transition-all
                        ${outputFormat === format
                          ? 'border-blue-400 bg-blue-400/20 text-blue-400'
                          : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                        }
                        hover:bg-gray-700
                      `}
                    >
                      {formatLabels[format]}
                      <div className="text-xs text-gray-400 mt-1">
                        {formatDescriptions[format]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-pixel text-sm text-white">
                    Output Data:
                  </label>
                  <div className="flex gap-2">
                    {result && (
                      <>
                        <button
                          onClick={() => copyToClipboard(getOutputForFormat(outputFormat), 'output')}
                          className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white font-pixel text-xs"
                        >
                          {copied === 'output' ? (
                            <CheckCircle className="h-3 w-3 inline" />
                          ) : (
                            <Copy className="h-3 w-3 inline" />
                          )}
                        </button>
                        <button
                          onClick={exportResult}
                          className="px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-pixel text-xs"
                        >
                          <Download className="h-3 w-3 inline" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                <textarea
                  value={result ? getOutputForFormat(outputFormat) : ''}
                  readOnly
                  placeholder="Converted data will appear here..."
                  className="w-full px-3 py-3 bg-gray-900 border-4 border-gray-600 font-mono text-sm text-white placeholder-gray-500 resize-none"
                  rows={6}
                />
              </div>
            </div>
          </div>

          {/* Convert Button */}
          <div className="flex justify-center">
            <PixelButton
              onClick={handleSwapFormats}
              variant="secondary"
              className="flex items-center gap-2"
              disabled={!result}
            >
              <ArrowRightLeft className="h-4 w-4" />
              Swap Formats
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
              <span className="font-pixel text-sm text-red-400">CONVERSION ERROR:</span>
            </div>
            <div className="font-mono text-sm text-gray-300 mt-1">{error}</div>
          </div>
        </PixelCard>
      )}

      {/* Results Display */}
      {result && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-purple-400/20 pb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-pixel text-lg text-purple-400">
                  ✅ CONVERSION RESULTS
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPrivateKey(!showPrivateKey)}
                    className="flex items-center gap-2 font-pixel text-sm text-yellow-400 hover:text-yellow-300"
                  >
                    {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showPrivateKey ? 'Hide' : 'Show'} Private Keys
                  </button>
                </div>
              </div>
            </div>

            {/* Public Key Display */}
            <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
              <div className="flex justify-between items-center mb-2">
                <span className="font-pixel text-sm text-green-400">PUBLIC KEY (Verification):</span>
                <button
                  onClick={() => copyToClipboard(result.base58.publicKey, 'pubkey')}
                  className="text-gray-400 hover:text-white"
                >
                  {copied === 'pubkey' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="font-mono text-sm text-white bg-gray-900 p-3 border border-gray-600 break-all">
                {result.base58.publicKey}
              </div>
            </div>

            {/* All Format Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {(Object.keys(formatLabels) as FormatType[]).map((format) => (
                <div key={format} className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-pixel text-sm text-blue-400">
                      {formatLabels[format].toUpperCase()}:
                    </span>
                    <button
                      onClick={() => copyToClipboard(getOutputForFormat(format), format)}
                      className="text-gray-400 hover:text-white"
                    >
                      {copied === format ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-xs text-white bg-gray-900 p-3 border border-gray-600 break-all max-h-32 overflow-y-auto">
                    {showPrivateKey ? getOutputForFormat(format) : '•'.repeat(40)}
                  </div>
                </div>
              ))}
            </div>

            {/* Validation Info */}
            <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30">
              <div className="font-pixel text-sm text-blue-400 mb-2">VALIDATION INFO:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs text-gray-300">
                <div>
                  <span className="text-gray-400">Input Format:</span><br/>
                  <span className="text-white">{formatLabels[inputFormat]}</span>
                </div>
                <div>
                  <span className="text-gray-400">Output Format:</span><br/>
                  <span className="text-white">{formatLabels[outputFormat]}</span>
                </div>
                <div>
                  <span className="text-gray-400">Key Length:</span><br/>
                  <span className="text-white">64 bytes</span>
                </div>
                <div>
                  <span className="text-gray-400">Status:</span><br/>
                  <span className="text-green-400">✓ Valid</span>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <div className="p-4 bg-red-900/20 border-4 border-red-600/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-pixel text-sm text-red-400">SECURITY WARNING:</div>
                  <div className="font-mono text-xs text-gray-300">
                    • Verify the public key matches your expected address<br/>
                    • Test with small amounts before using with large funds<br/>
                    • Keep converted private keys absolutely secure<br/>
                    • Clear sensitive data from clipboard after use<br/>
                    • Double-check format compatibility with target wallet
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