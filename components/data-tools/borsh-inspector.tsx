'use client'

import { useState, useCallback } from 'react'
import { BorshInspector, BorshSchema, BorshDecodedData, BorshEncodeResult, BorshType } from '@/lib/solana/data-tools/borsh-inspector'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { PixelLoading } from '@/components/ui/pixel-loading'

interface BorshInspectorProps {
  onDataDecoded?: (data: BorshDecodedData) => void
  onDataEncoded?: (data: BorshEncodeResult) => void
}

export function BorshInspectorComponent({ onDataDecoded, onDataEncoded }: BorshInspectorProps) {
  const [mode, setMode] = useState<'decode' | 'encode'>('decode')
  const [inputData, setInputData] = useState('')
  const [dataFormat, setDataFormat] = useState<'hex' | 'base64' | 'utf8'>('hex')
  const [schema, setSchema] = useState<BorshSchema | null>(null)
  const [customSchema, setCustomSchema] = useState('')
  const [encodeData, setEncodeData] = useState('')
  const [result, setResult] = useState<BorshDecodedData | BorshEncodeResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Common schemas
  const commonSchemas = BorshInspector.getCommonSchemas()

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const parseInputData = useCallback((input: string, format: 'hex' | 'base64' | 'utf8'): Uint8Array => {
    try {
      switch (format) {
        case 'hex':
          const cleanHex = input.replace(/[^0-9a-fA-F]/g, '')
          if (cleanHex.length % 2 !== 0) {
            throw new Error('Hex string must have even length')
          }
          return new Uint8Array(Buffer.from(cleanHex, 'hex'))
        
        case 'base64':
          return new Uint8Array(Buffer.from(input, 'base64'))
        
        case 'utf8':
          return new Uint8Array(Buffer.from(input, 'utf8'))
        
        default:
          throw new Error('Unsupported data format')
      }
    } catch (error) {
      throw new Error(`Failed to parse ${format} data: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  const parseJsonData = useCallback((jsonString: string): any => {
    try {
      return JSON.parse(jsonString)
    } catch (error) {
      throw new Error('Invalid JSON data')
    }
  }, [])

  const parseSchemaJson = useCallback((schemaJson: string): BorshSchema => {
    try {
      const parsed = JSON.parse(schemaJson)
      
      // Validate basic schema structure
      if (!parsed.name || !parsed.type) {
        throw new Error('Schema must have name and type fields')
      }
      
      return parsed as BorshSchema
    } catch (error) {
      throw new Error(`Invalid schema JSON: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  const handleDecode = async () => {
    if (!inputData.trim() || !schema) {
      showToast('Please provide both data and schema', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const data = parseInputData(inputData, dataFormat)
      const decoded = BorshInspector.decode(data, schema)
      
      setResult(decoded)
      onDataDecoded?.(decoded)
      
      if (decoded.isValid) {
        showToast('Data decoded successfully', 'success')
      } else {
        showToast(`Decode failed: ${decoded.error}`, 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEncode = async () => {
    if (!encodeData.trim() || !schema) {
      showToast('Please provide both data and schema', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const data = parseJsonData(encodeData)
      const encoded = BorshInspector.encode(data, schema)
      
      setResult(encoded)
      onDataEncoded?.(encoded)
      
      if (encoded.isValid) {
        showToast('Data encoded successfully', 'success')
      } else {
        showToast(`Encode failed: ${encoded.error}`, 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSchemaSelect = (selectedSchema: BorshSchema) => {
    setSchema(selectedSchema)
    setCustomSchema(JSON.stringify(selectedSchema, null, 2))
  }

  const handleCustomSchemaChange = (schemaJson: string) => {
    setCustomSchema(schemaJson)
    try {
      if (schemaJson.trim()) {
        const parsed = parseSchemaJson(schemaJson)
        setSchema(parsed)
      } else {
        setSchema(null)
      }
    } catch (error) {
      // Don't update schema if JSON is invalid
      setSchema(null)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard`, 'success')
  }

  const downloadResult = () => {
    if (!result) return

    const data = mode === 'decode' 
      ? JSON.stringify((result as BorshDecodedData).data, null, 2)
      : JSON.stringify({
          hex: (result as BorshEncodeResult).hex,
          base64: (result as BorshEncodeResult).base64,
          size: (result as BorshEncodeResult).size
        }, null, 2)

    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `borsh-${mode}-result.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateExampleData = () => {
    if (!schema) {
      showToast('Please select a schema first', 'error')
      return
    }

    const example = generateExampleFromSchema(schema.type)
    setEncodeData(JSON.stringify(example, null, 2))
  }

  const generateExampleFromSchema = (type: BorshType): any => {
    switch (type.kind) {
      case 'primitive':
        const primitiveType = (type as any).primitiveType || 'u8'
        switch (primitiveType) {
          case 'u8': case 'u16': case 'u32': return 42
          case 'u64': case 'u128': return '1000000000'
          case 'i8': case 'i16': case 'i32': case 'i64': case 'i128': return -42
          case 'f32': case 'f64': return 3.14
          case 'bool': return true
          case 'string': return 'example string'
          case 'pubkey': return 'So11111111111111111111111111111111111111112'
          default: return null
        }
      
      case 'struct':
        const structResult: any = {}
        if (type.fields) {
          for (const field of type.fields) {
            structResult[field.name] = generateExampleFromSchema(field.type)
          }
        }
        return structResult
      
      case 'enum':
        if (type.variants && type.variants.length > 0) {
          const variant = type.variants[0]
          const enumResult: any = { variant: variant.name }
          if (variant.fields) {
            for (const field of variant.fields) {
              enumResult[field.name] = generateExampleFromSchema(field.type)
            }
          }
          return enumResult
        }
        return { variant: 'Unknown' }
      
      case 'array':
        if (type.elementType && type.length) {
          return Array(Math.min(type.length, 3)).fill(null).map(() => generateExampleFromSchema(type.elementType!))
        }
        return []
      
      case 'vec':
        if (type.elementType) {
          return [generateExampleFromSchema(type.elementType)]
        }
        return []
      
      case 'option':
        if (type.elementType) {
          return generateExampleFromSchema(type.elementType)
        }
        return null
      
      case 'map':
        return {}
      
      case 'set':
        return []
      
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Borsh Inspector Mode</h3>
          <div className="flex gap-4">
            <PixelButton
              onClick={() => setMode('decode')}
              variant={mode === 'decode' ? 'primary' : 'secondary'}
            >
              Decode Borsh Data
            </PixelButton>
            <PixelButton
              onClick={() => setMode('encode')}
              variant={mode === 'encode' ? 'primary' : 'secondary'}
            >
              Encode to Borsh
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Schema Configuration */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Schema Configuration</h3>
          
          {/* Common Schemas */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Common Schemas
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {commonSchemas.map((template) => (
                <PixelButton
                  key={template.name}
                  onClick={() => handleSchemaSelect(template.schema)}
                  variant="secondary"
                  size="sm"
                >
                  {template.name}
                </PixelButton>
              ))}
            </div>
          </div>

          {/* Custom Schema */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Schema (JSON)
            </label>
            <textarea
              value={customSchema}
              onChange={(e) => handleCustomSchemaChange(e.target.value)}
              placeholder="Enter Borsh schema in JSON format..."
              rows={8}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {schema && (
            <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
              <p className="text-green-400 text-sm">
                ✓ Schema loaded: {schema.name}
              </p>
            </div>
          )}
        </div>
      </PixelCard>

      {/* Input/Output */}
      {mode === 'decode' ? (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Decode Borsh Data</h3>
            
            <div className="space-y-4">
              {/* Data Format */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Data Format
                </label>
                <select
                  value={dataFormat}
                  onChange={(e) => setDataFormat(e.target.value as 'hex' | 'base64' | 'utf8')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-blue-500 focus:outline-none"
                >
                  <option value="hex">Hex</option>
                  <option value="base64">Base64</option>
                  <option value="utf8">UTF-8</option>
                </select>
              </div>

              {/* Data Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Raw Data
                </label>
                <textarea
                  value={inputData}
                  onChange={(e) => setInputData(e.target.value)}
                  placeholder={`Enter ${dataFormat} encoded data...`}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <PixelButton
                onClick={handleDecode}
                disabled={!inputData.trim() || !schema || isProcessing}
                className="w-full"
              >
                {isProcessing ? <PixelLoading size="sm" /> : 'Decode Data'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      ) : (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Encode to Borsh</h3>
            
            <div className="space-y-4">
              {/* Generate Example */}
              <div className="flex gap-2">
                <PixelButton
                  onClick={generateExampleData}
                  disabled={!schema}
                  variant="secondary"
                  size="sm"
                >
                  Generate Example
                </PixelButton>
              </div>

              {/* Data Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  JSON Data
                </label>
                <textarea
                  value={encodeData}
                  onChange={(e) => setEncodeData(e.target.value)}
                  placeholder="Enter JSON data to encode..."
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <PixelButton
                onClick={handleEncode}
                disabled={!encodeData.trim() || !schema || isProcessing}
                className="w-full"
              >
                {isProcessing ? <PixelLoading size="sm" /> : 'Encode Data'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Results */}
      {result && (
        <PixelCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {mode === 'decode' ? 'Decoded Data' : 'Encoded Data'}
              </h3>
              <div className="flex gap-2">
                <PixelButton
                  onClick={downloadResult}
                  variant="secondary"
                  size="sm"
                >
                  Download
                </PixelButton>
              </div>
            </div>

            {mode === 'decode' ? (
              <div className="space-y-4">
                {(result as BorshDecodedData).isValid ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Decoded Data
                      </label>
                      <div className="relative">
                        <pre className="bg-gray-900 p-4 rounded border overflow-auto max-h-96 text-sm text-green-400">
                          {JSON.stringify((result as BorshDecodedData).data, null, 2)}
                        </pre>
                        <PixelButton
                          onClick={() => copyToClipboard(
                            JSON.stringify((result as BorshDecodedData).data, null, 2),
                            'Decoded data'
                          )}
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          Copy
                        </PixelButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Raw Data Info
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900 rounded border">
                        <div>
                          <span className="text-gray-400">Size:</span>
                          <span className="ml-2 text-white">{(result as BorshDecodedData).rawData.length} bytes</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Schema:</span>
                          <span className="ml-2 text-white">{(result as BorshDecodedData).schema.name}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400">
                      Decode Error: {(result as BorshDecodedData).error}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(result as BorshEncodeResult).isValid ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Hex Output
                      </label>
                      <div className="relative">
                        <div className="bg-gray-900 p-4 rounded border font-mono text-sm text-green-400 break-all">
                          {(result as BorshEncodeResult).hex}
                        </div>
                        <PixelButton
                          onClick={() => copyToClipboard((result as BorshEncodeResult).hex, 'Hex data')}
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          Copy
                        </PixelButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Base64 Output
                      </label>
                      <div className="relative">
                        <div className="bg-gray-900 p-4 rounded border font-mono text-sm text-green-400 break-all">
                          {(result as BorshEncodeResult).base64}
                        </div>
                        <PixelButton
                          onClick={() => copyToClipboard((result as BorshEncodeResult).base64, 'Base64 data')}
                          variant="secondary"
                          size="sm"
                          className="absolute top-2 right-2"
                        >
                          Copy
                        </PixelButton>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Encoding Info
                      </label>
                      <div className="p-4 bg-gray-900 rounded border">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-gray-400">Size:</span>
                            <span className="ml-2 text-white">{(result as BorshEncodeResult).size} bytes</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Schema:</span>
                            <span className="ml-2 text-white">{schema?.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-red-900/20 border border-red-500/30 rounded">
                    <p className="text-red-400">
                      Encode Error: {(result as BorshEncodeResult).error}
                    </p>
                  </div>
                )}
              </div>
            )}
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