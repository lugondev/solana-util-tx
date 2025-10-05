import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export type KeypairFormats = 'base58' | 'hex' | 'array' | 'json'

export interface ConversionResult {
  base58: {
    privateKey: string
    publicKey: string
  }
  hex: {
    privateKey: string
    publicKey: string
  }
  array: {
    privateKey: number[]
    publicKey: number[]
  }
  json: {
    publicKey: string
    privateKey: string
    secretKey: number[]
  }
}

export class KeypairConverter {
  /**
   * Convert keypair between different formats
   */
  convert(input: string, fromFormat: KeypairFormats, toFormat: KeypairFormats): ConversionResult {
    // First, parse the input to get the secret key
    const secretKey = this.parseInput(input, fromFormat)
    
    // Create keypair from secret key
    const keypair = Keypair.fromSecretKey(new Uint8Array(secretKey))
    
    // Generate all formats
    return this.generateAllFormats(keypair)
  }

  /**
   * Parse input data to secret key array
   */
  private parseInput(input: string, format: KeypairFormats): number[] {
    switch (format) {
      case 'base58':
        return this.parseBase58(input)
      case 'hex':
        return this.parseHex(input)
      case 'array':
        return this.parseArray(input)
      case 'json':
        return this.parseJSON(input)
      default:
        throw new Error(`Unsupported format: ${format}`)
    }
  }

  /**
   * Parse Base58 private key
   */
  private parseBase58(input: string): number[] {
    try {
      const decoded = bs58.decode(input)
      if (decoded.length !== 64) {
        throw new Error(`Invalid Base58 key length: ${decoded.length}, expected 64`)
      }
      return Array.from(decoded)
    } catch (error) {
      throw new Error(`Invalid Base58 format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse hexadecimal private key
   */
  private parseHex(input: string): number[] {
    try {
      // Remove 0x prefix if present
      const hex = input.replace(/^0x/i, '')
      
      // Ensure even length
      if (hex.length % 2 !== 0) {
        throw new Error('Hex string must have even length')
      }
      
      // Convert to bytes
      const bytes: number[] = []
      for (let i = 0; i < hex.length; i += 2) {
        const byte = parseInt(hex.substr(i, 2), 16)
        if (isNaN(byte)) {
          throw new Error(`Invalid hex character at position ${i}`)
        }
        bytes.push(byte)
      }
      
      if (bytes.length !== 64) {
        throw new Error(`Invalid hex key length: ${bytes.length}, expected 64`)
      }
      
      return bytes
    } catch (error) {
      throw new Error(`Invalid hex format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse array format private key
   */
  private parseArray(input: string): number[] {
    try {
      // Remove brackets and parse as JSON array
      const cleaned = input.trim().replace(/^\[/, '').replace(/\]$/, '')
      const numbers = cleaned.split(',').map(s => {
        const num = parseInt(s.trim(), 10)
        if (isNaN(num) || num < 0 || num > 255) {
          throw new Error(`Invalid byte value: ${s.trim()}`)
        }
        return num
      })
      
      if (numbers.length !== 64) {
        throw new Error(`Invalid array length: ${numbers.length}, expected 64`)
      }
      
      return numbers
    } catch (error) {
      throw new Error(`Invalid array format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Parse JSON format private key
   */
  private parseJSON(input: string): number[] {
    try {
      const parsed = JSON.parse(input)
      
      // Try different JSON formats
      if (Array.isArray(parsed)) {
        // Direct array format
        return this.parseArray(`[${parsed.join(',')}]`)
      }
      
      if (parsed.secretKey && Array.isArray(parsed.secretKey)) {
        // Standard format with secretKey array
        return this.parseArray(`[${parsed.secretKey.join(',')}]`)
      }
      
      if (parsed.privateKey && typeof parsed.privateKey === 'string') {
        // Base58 private key in JSON
        return this.parseBase58(parsed.privateKey)
      }
      
      throw new Error('JSON must contain secretKey array or privateKey string')
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('Invalid JSON syntax')
      }
      throw new Error(`Invalid JSON format: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate all format representations
   */
  private generateAllFormats(keypair: Keypair): ConversionResult {
    const secretKey = Array.from(keypair.secretKey)
    const publicKeyBytes = Array.from(keypair.publicKey.toBytes())
    
    return {
      base58: {
        privateKey: bs58.encode(keypair.secretKey),
        publicKey: keypair.publicKey.toString()
      },
      hex: {
        privateKey: this.bytesToHex(secretKey),
        publicKey: this.bytesToHex(publicKeyBytes)
      },
      array: {
        privateKey: secretKey,
        publicKey: publicKeyBytes
      },
      json: {
        publicKey: keypair.publicKey.toString(),
        privateKey: bs58.encode(keypair.secretKey),
        secretKey: secretKey
      }
    }
  }

  /**
   * Convert bytes to hex string
   */
  private bytesToHex(bytes: number[]): string {
    return bytes.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Batch convert multiple keypairs
   */
  convertBatch(inputs: Array<{ data: string; format: KeypairFormats }>, outputFormat: KeypairFormats): Array<{
    input: string
    output: string
    publicKey: string
    success: boolean
    error?: string
  }> {
    return inputs.map(({ data, format }) => {
      try {
        const result = this.convert(data, format, outputFormat)
        return {
          input: data,
          output: this.getFormatOutput(result, outputFormat),
          publicKey: result.base58.publicKey,
          success: true
        }
      } catch (error) {
        return {
          input: data,
          output: '',
          publicKey: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })
  }

  /**
   * Get output for specific format
   */
  private getFormatOutput(result: ConversionResult, format: KeypairFormats): string {
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

  /**
   * Export conversion result to file
   */
  exportToFile(result: ConversionResult, format: KeypairFormats, filename?: string): Blob {
    const output = this.getFormatOutput(result, format)
    const mimeTypes = {
      base58: 'text/plain',
      hex: 'text/plain',
      array: 'text/plain',
      json: 'application/json'
    }
    
    return new Blob([output], { type: mimeTypes[format] })
  }
}

/**
 * Validate format of input data
 */
export function validateFormat(input: string, format: KeypairFormats): boolean {
  try {
    const converter = new KeypairConverter()
    converter['parseInput'](input, format)
    return true
  } catch {
    return false
  }
}

/**
 * Auto-detect input format
 */
export function detectInputFormat(input: string): KeypairFormats | null {
  const trimmed = input.trim()
  
  // Check JSON format
  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
      (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    try {
      JSON.parse(trimmed)
      return 'json'
    } catch {
      // Continue to other checks
    }
  }
  
  // Check array format
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    const content = trimmed.slice(1, -1).trim()
    if (content.includes(',') && /^\d+(\s*,\s*\d+)*$/.test(content)) {
      return 'array'
    }
  }
  
  // Check hex format
  if (/^(0x)?[0-9a-fA-F]+$/.test(trimmed)) {
    const hex = trimmed.replace(/^0x/i, '')
    if (hex.length === 128) { // 64 bytes * 2 chars per byte
      return 'hex'
    }
  }
  
  // Check Base58 format
  if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
    try {
      const decoded = bs58.decode(trimmed)
      if (decoded.length === 64) {
        return 'base58'
      }
    } catch {
      // Not valid Base58
    }
  }
  
  return null
}

/**
 * Get format requirements and examples
 */
export function getFormatInfo(format: KeypairFormats): {
  name: string
  description: string
  example: string
  validation: string
} {
  const info = {
    base58: {
      name: 'Base58',
      description: 'Standard Solana wallet format using Base58 encoding',
      example: '5KJvsng4preA9B1CizhArgJ5Hs2QiBwQLJvnMBJMH4...xK7ZpZyw',
      validation: 'Must be valid Base58 string with 64-byte length when decoded'
    },
    hex: {
      name: 'Hexadecimal',
      description: 'Raw bytes encoded as hexadecimal string',
      example: '1a2b3c4d5e6f708192a3b4c5d6e7f8091a2b3c4d...',
      validation: 'Must be 128 hex characters (64 bytes), optionally prefixed with 0x'
    },
    array: {
      name: 'Byte Array',
      description: 'JavaScript array of 64 byte values (0-255)',
      example: '[26, 43, 60, 77, 94, 111, 112, 129, 146, ...]',
      validation: 'Must be array of exactly 64 numbers between 0-255'
    },
    json: {
      name: 'JSON Object',
      description: 'Structured JSON with keypair information',
      example: '{"publicKey": "...", "privateKey": "...", "secretKey": [...]}',
      validation: 'Must contain secretKey array or privateKey string'
    }
  }
  
  return info[format]
}

/**
 * Generate format conversion examples
 */
export function generateExamples(): Record<KeypairFormats, string> {
  // Generate a sample keypair for examples
  const keypair = Keypair.generate()
  const converter = new KeypairConverter()
  const result = converter.convert('', 'base58', 'base58') // This will be replaced
  
  // Generate all formats from the keypair directly
  const secretKey = Array.from(keypair.secretKey)
  const publicKeyBytes = Array.from(keypair.publicKey.toBytes())
  
  return {
    base58: bs58.encode(keypair.secretKey),
    hex: secretKey.map(b => b.toString(16).padStart(2, '0')).join(''),
    array: `[${secretKey.join(', ')}]`,
    json: JSON.stringify({
      publicKey: keypair.publicKey.toString(),
      privateKey: bs58.encode(keypair.secretKey),
      secretKey: secretKey
    }, null, 2)
  }
}

/**
 * Check if two keypairs are equivalent
 */
export function compareKeypairs(
  keypair1: { data: string; format: KeypairFormats },
  keypair2: { data: string; format: KeypairFormats }
): boolean {
  try {
    const converter = new KeypairConverter()
    const result1 = converter.convert(keypair1.data, keypair1.format, 'base58')
    const result2 = converter.convert(keypair2.data, keypair2.format, 'base58')
    
    return result1.base58.publicKey === result2.base58.publicKey
  } catch {
    return false
  }
}

/**
 * Extract public key from any format
 */
export function extractPublicKey(input: string, format: KeypairFormats): string {
  const converter = new KeypairConverter()
  const result = converter.convert(input, format, 'base58')
  return result.base58.publicKey
}

/**
 * Common format validation patterns
 */
export const FORMAT_PATTERNS = {
  base58: /^[1-9A-HJ-NP-Za-km-z]+$/,
  hex: /^(0x)?[0-9a-fA-F]+$/,
  array: /^\[\s*\d+(\s*,\s*\d+)*\s*\]$/,
  json: /^[\{\[].*[\}\]]$/
}

/**
 * Format conversion utilities
 */
export const FormatUtils = {
  isValidBase58: (input: string): boolean => {
    try {
      const decoded = bs58.decode(input)
      return decoded.length === 64
    } catch {
      return false
    }
  },
  
  isValidHex: (input: string): boolean => {
    const hex = input.replace(/^0x/i, '')
    return hex.length === 128 && /^[0-9a-fA-F]+$/.test(hex)
  },
  
  isValidArray: (input: string): boolean => {
    try {
      const parsed = JSON.parse(input)
      return Array.isArray(parsed) && 
             parsed.length === 64 && 
             parsed.every(n => typeof n === 'number' && n >= 0 && n <= 255)
    } catch {
      return false
    }
  },
  
  isValidJSON: (input: string): boolean => {
    try {
      const parsed = JSON.parse(input)
      return (parsed.secretKey && Array.isArray(parsed.secretKey)) ||
             (parsed.privateKey && typeof parsed.privateKey === 'string')
    } catch {
      return false
    }
  }
}