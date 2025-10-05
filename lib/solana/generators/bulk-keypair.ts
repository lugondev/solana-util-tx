import { Keypair } from '@solana/web3.js'
import bs58 from 'bs58'

export interface KeypairInfo {
  publicKey: string
  privateKey: string
  index: number
}

export interface BulkGenerationOptions {
  count: number
  format: 'json' | 'csv' | 'txt'
  includeIndex: boolean
  prefix?: string
}

export interface BulkGenerationProgress {
  completed: number
  total: number
  percentage: number
  timeElapsed: number
  estimatedTimeRemaining: number
  rate: number
  isRunning: boolean
}

export class BulkKeypairGenerator {
  private isRunning = false
  private startTime = 0
  private onProgress?: (progress: BulkGenerationProgress) => void

  /**
   * Generate multiple keypairs in bulk
   */
  async generateBulkKeypairs(
    options: BulkGenerationOptions,
    onProgress?: (progress: BulkGenerationProgress) => void
  ): Promise<KeypairInfo[]> {
    this.onProgress = onProgress
    this.isRunning = true
    this.startTime = Date.now()

    const { count } = options
    const keypairs: KeypairInfo[] = []
    let lastProgressUpdate = 0

    for (let i = 0; i < count && this.isRunning; i++) {
      // Generate keypair
      const keypair = Keypair.generate()
      const keypairInfo: KeypairInfo = {
        publicKey: keypair.publicKey.toString(),
        privateKey: bs58.encode(keypair.secretKey),
        index: i + 1
      }

      keypairs.push(keypairInfo)

      // Update progress
      const now = Date.now()
      if (i % 100 === 0 || now - lastProgressUpdate > 1000 || i === count - 1) {
        const timeElapsed = now - this.startTime
        const rate = (i + 1) / (timeElapsed / 1000)
        const remaining = count - (i + 1)
        const estimatedTimeRemaining = remaining / rate

        const progress: BulkGenerationProgress = {
          completed: i + 1,
          total: count,
          percentage: ((i + 1) / count) * 100,
          timeElapsed,
          estimatedTimeRemaining: estimatedTimeRemaining * 1000,
          rate,
          isRunning: this.isRunning
        }

        this.onProgress?.(progress)
        lastProgressUpdate = now

        // Allow UI to update every 100 keypairs
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0))
        }
      }
    }

    this.isRunning = false
    return keypairs
  }

  /**
   * Stop the generation process
   */
  stop(): void {
    this.isRunning = false
  }

  /**
   * Format keypairs for export
   */
  formatForExport(keypairs: KeypairInfo[], options: BulkGenerationOptions): string {
    const { format, includeIndex, prefix = 'wallet' } = options

    switch (format) {
      case 'json':
        return this.formatAsJSON(keypairs, includeIndex)
      case 'csv':
        return this.formatAsCSV(keypairs, includeIndex)
      case 'txt':
        return this.formatAsText(keypairs, includeIndex, prefix)
      default:
        return this.formatAsJSON(keypairs, includeIndex)
    }
  }

  /**
   * Format as JSON
   */
  private formatAsJSON(keypairs: KeypairInfo[], includeIndex: boolean): string {
    const data = keypairs.map(kp => {
      const obj: any = {
        publicKey: kp.publicKey,
        privateKey: kp.privateKey
      }
      if (includeIndex) {
        obj.index = kp.index
      }
      return obj
    })

    return JSON.stringify(data, null, 2)
  }

  /**
   * Format as CSV
   */
  private formatAsCSV(keypairs: KeypairInfo[], includeIndex: boolean): string {
    const headers = []
    if (includeIndex) headers.push('Index')
    headers.push('Public Key', 'Private Key')

    const rows = [headers.join(',')]
    
    keypairs.forEach(kp => {
      const row = []
      if (includeIndex) row.push(kp.index.toString())
      row.push(kp.publicKey, kp.privateKey)
      rows.push(row.join(','))
    })

    return rows.join('\n')
  }

  /**
   * Format as plain text
   */
  private formatAsText(keypairs: KeypairInfo[], includeIndex: boolean, prefix: string): string {
    const lines = [
      `Bulk Keypair Generation Results`,
      `=====================================`,
      `Generated: ${keypairs.length} keypairs`,
      `Date: ${new Date().toISOString()}`,
      ``,
      `SECURITY WARNING:`,
      `- Keep these private keys secure and never share them`,
      `- Each private key gives full control over its wallet`,
      `- Store them safely or import them into your wallet`,
      ``,
      `Keypairs:`,
      `=========`
    ]

    keypairs.forEach(kp => {
      lines.push('')
      if (includeIndex) {
        lines.push(`${prefix} #${kp.index}:`)
      } else {
        lines.push(`${prefix}:`)
      }
      lines.push(`Public Key:  ${kp.publicKey}`)
      lines.push(`Private Key: ${kp.privateKey}`)
    })

    return lines.join('\n')
  }

  /**
   * Create download blob
   */
  createDownloadBlob(content: string, format: BulkGenerationOptions['format']): Blob {
    const mimeTypes = {
      json: 'application/json',
      csv: 'text/csv',
      txt: 'text/plain'
    }

    return new Blob([content], { type: mimeTypes[format] })
  }

  /**
   * Get file extension for format
   */
  getFileExtension(format: BulkGenerationOptions['format']): string {
    return format === 'txt' ? 'txt' : format
  }

  /**
   * Validate generation options
   */
  validateOptions(options: BulkGenerationOptions): { valid: boolean; error?: string } {
    const { count } = options

    if (count < 1) {
      return { valid: false, error: 'Count must be at least 1' }
    }

    if (count > 10000) {
      return { valid: false, error: 'Count cannot exceed 10,000 for performance reasons' }
    }

    return { valid: true }
  }

  /**
   * Estimate generation time
   */
  estimateGenerationTime(count: number): {
    estimatedSeconds: number
    estimatedText: string
    difficulty: 'Fast' | 'Medium' | 'Slow'
  } {
    // Conservative estimate: 1000 keypairs per second
    const estimatedSeconds = count / 1000

    let estimatedText: string
    let difficulty: 'Fast' | 'Medium' | 'Slow'

    if (estimatedSeconds < 1) {
      estimatedText = '< 1 second'
      difficulty = 'Fast'
    } else if (estimatedSeconds < 10) {
      estimatedText = `~${Math.ceil(estimatedSeconds)} seconds`
      difficulty = 'Fast'
    } else if (estimatedSeconds < 60) {
      estimatedText = `~${Math.ceil(estimatedSeconds)} seconds`
      difficulty = 'Medium'
    } else {
      estimatedText = `~${Math.ceil(estimatedSeconds / 60)} minutes`
      difficulty = 'Slow'
    }

    return { estimatedSeconds, estimatedText, difficulty }
  }

  /**
   * Check if generator is running
   */
  get running(): boolean {
    return this.isRunning
  }
}

// Utility functions
export function formatDuration(ms: number): string {
  const seconds = ms / 1000
  
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)}m`
  } else {
    return `${(seconds / 3600).toFixed(1)}h`
  }
}

export function formatRate(rate: number): string {
  if (rate < 1000) {
    return `${rate.toFixed(0)}/s`
  } else {
    return `${(rate / 1000).toFixed(1)}k/s`
  }
}

export function calculateFileSize(keypairs: KeypairInfo[], format: BulkGenerationOptions['format']): string {
  const generator = new BulkKeypairGenerator()
  const content = generator.formatForExport(keypairs, { 
    count: keypairs.length, 
    format, 
    includeIndex: true 
  })
  
  const bytes = new Blob([content]).size
  
  if (bytes < 1024) {
    return `${bytes} bytes`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
}