import { Keypair, PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export interface VanitySearchOptions {
  prefix?: string
  suffix?: string
  caseSensitive?: boolean
  maxAttempts?: number
  includeNumbers?: boolean
  includeSpecialChars?: boolean
}

export interface VanityResult {
  keypair: Keypair
  address: string
  privateKey: string
  attempts: number
  timeElapsed: number
  matchType: 'prefix' | 'suffix' | 'both'
  matchedPattern: string
}

export interface VanityProgress {
  attempts: number
  timeElapsed: number
  rate: number // attempts per second
  estimated: number // estimated time remaining in seconds
  isRunning: boolean
}

export class VanityAddressGenerator {
  private isRunning = false
  private startTime = 0
  private onProgress?: (progress: VanityProgress) => void
  private onResult?: (result: VanityResult) => void

  /**
   * Generate a vanity address with specified criteria
   */
  async generateVanityAddress(
    options: VanitySearchOptions,
    onProgress?: (progress: VanityProgress) => void,
    onResult?: (result: VanityResult) => void
  ): Promise<VanityResult | null> {
    this.onProgress = onProgress
    this.onResult = onResult
    this.isRunning = true
    this.startTime = Date.now()

    const {
      prefix = '',
      suffix = '',
      caseSensitive = false,
      maxAttempts = 1000000,
      includeNumbers = true,
      includeSpecialChars = false
    } = options

    // Validate inputs
    if (!prefix && !suffix) {
      throw new Error('At least one of prefix or suffix must be specified')
    }

    const validation = this.validatePattern(prefix, suffix, includeNumbers, includeSpecialChars)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    let attempts = 0
    let lastProgressUpdate = 0

    while (this.isRunning && attempts < maxAttempts) {
      attempts++

      // Generate new keypair
      const keypair = Keypair.generate()
      const address = keypair.publicKey.toString()
      
      // Check if address matches criteria
      const match = this.checkMatch(address, prefix, suffix, caseSensitive)
      
      if (match.isMatch) {
        const timeElapsed = Date.now() - this.startTime
        const result: VanityResult = {
          keypair,
          address,
          privateKey: bs58.encode(keypair.secretKey),
          attempts,
          timeElapsed,
          matchType: match.type,
          matchedPattern: match.pattern
        }

        this.isRunning = false
        this.onResult?.(result)
        return result
      }

      // Update progress every 1000 attempts or 1 second
      const now = Date.now()
      if (attempts % 1000 === 0 || now - lastProgressUpdate > 1000) {
        const timeElapsed = now - this.startTime
        const rate = attempts / (timeElapsed / 1000)
        const estimated = this.estimateTimeRemaining(attempts, maxAttempts, rate)

        const progress: VanityProgress = {
          attempts,
          timeElapsed,
          rate,
          estimated,
          isRunning: this.isRunning
        }

        this.onProgress?.(progress)
        lastProgressUpdate = now

        // Allow UI to update
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    this.isRunning = false
    return null // Max attempts reached
  }

  /**
   * Stop the generation process
   */
  stop(): void {
    this.isRunning = false
  }

  /**
   * Check if address matches the specified criteria
   */
  private checkMatch(
    address: string, 
    prefix: string, 
    suffix: string, 
    caseSensitive: boolean
  ): { isMatch: boolean; type: 'prefix' | 'suffix' | 'both'; pattern: string } {
    const targetAddress = caseSensitive ? address : address.toLowerCase()
    const targetPrefix = caseSensitive ? prefix : prefix.toLowerCase()
    const targetSuffix = caseSensitive ? suffix : suffix.toLowerCase()

    const hasPrefix = !prefix || targetAddress.startsWith(targetPrefix)
    const hasSuffix = !suffix || targetAddress.endsWith(targetSuffix)

    if (hasPrefix && hasSuffix) {
      if (prefix && suffix) {
        return { isMatch: true, type: 'both', pattern: `${prefix}...${suffix}` }
      } else if (prefix) {
        return { isMatch: true, type: 'prefix', pattern: prefix }
      } else {
        return { isMatch: true, type: 'suffix', pattern: suffix }
      }
    }

    return { isMatch: false, type: 'prefix', pattern: '' }
  }

  /**
   * Validate the search pattern
   */
  private validatePattern(
    prefix: string, 
    suffix: string, 
    includeNumbers: boolean, 
    includeSpecialChars: boolean
  ): { valid: boolean; error?: string } {
    const base58Chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const numbers = '123456789'
    const specialChars = 'il0O' // Characters that are not in base58

    let validChars = base58Chars
    if (!includeNumbers) {
      validChars = validChars.replace(/[123456789]/g, '')
    }
    if (includeSpecialChars) {
      validChars += specialChars
    }

    // Check prefix
    if (prefix) {
      if (prefix.length > 10) {
        return { valid: false, error: 'Prefix too long (max 10 characters)' }
      }
      
      for (const char of prefix) {
        if (!validChars.includes(char)) {
          return { valid: false, error: `Invalid character in prefix: ${char}` }
        }
      }
    }

    // Check suffix
    if (suffix) {
      if (suffix.length > 10) {
        return { valid: false, error: 'Suffix too long (max 10 characters)' }
      }
      
      for (const char of suffix) {
        if (!validChars.includes(char)) {
          return { valid: false, error: `Invalid character in suffix: ${char}` }
        }
      }
    }

    // Estimate difficulty
    const difficulty = this.estimateDifficulty(prefix, suffix, includeNumbers)
    if (difficulty > 10000000) {
      return { 
        valid: false, 
        error: `Pattern too difficult (estimated ${difficulty.toLocaleString()} attempts needed)` 
      }
    }

    return { valid: true }
  }

  /**
   * Estimate the difficulty of finding a match
   */
  estimateDifficulty(prefix: string, suffix: string, includeNumbers: boolean): number {
    const baseChars = includeNumbers ? 58 : 49 // Base58 with or without numbers
    let difficulty = 1

    if (prefix) {
      difficulty *= Math.pow(baseChars, prefix.length)
    }
    
    if (suffix) {
      difficulty *= Math.pow(baseChars, suffix.length)
    }

    return Math.floor(difficulty)
  }

  /**
   * Estimate time remaining based on current rate
   */
  private estimateTimeRemaining(attempts: number, maxAttempts: number, rate: number): number {
    if (rate === 0) return Infinity
    
    const remainingAttempts = maxAttempts - attempts
    return remainingAttempts / rate
  }

  /**
   * Get difficulty rating as human-readable string
   */
  getDifficultyRating(prefix: string, suffix: string, includeNumbers: boolean): {
    difficulty: number
    rating: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme'
    estimatedTime: string
  } {
    const difficulty = this.estimateDifficulty(prefix, suffix, includeNumbers)
    const avgRate = 5000 // Conservative estimate: 5000 attempts per second
    const estimatedSeconds = difficulty / avgRate

    let rating: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme'
    let estimatedTime: string

    if (difficulty < 1000) {
      rating = 'Easy'
      estimatedTime = '< 1 second'
    } else if (difficulty < 50000) {
      rating = 'Medium'
      estimatedTime = '< 10 seconds'
    } else if (difficulty < 1000000) {
      rating = 'Hard'
      estimatedTime = '< 5 minutes'
    } else if (difficulty < 50000000) {
      rating = 'Very Hard'
      estimatedTime = '< 3 hours'
    } else {
      rating = 'Extreme'
      estimatedTime = '> 1 day'
    }

    if (estimatedSeconds < 60) {
      estimatedTime = `~${Math.ceil(estimatedSeconds)} seconds`
    } else if (estimatedSeconds < 3600) {
      estimatedTime = `~${Math.ceil(estimatedSeconds / 60)} minutes`
    } else if (estimatedSeconds < 86400) {
      estimatedTime = `~${Math.ceil(estimatedSeconds / 3600)} hours`
    } else {
      estimatedTime = `~${Math.ceil(estimatedSeconds / 86400)} days`
    }

    return { difficulty, rating, estimatedTime }
  }

  /**
   * Generate multiple vanity addresses in batch
   */
  async generateBatch(
    options: VanitySearchOptions,
    count: number,
    onProgress?: (progress: VanityProgress & { found: VanityResult[] }) => void
  ): Promise<VanityResult[]> {
    const results: VanityResult[] = []
    const startTime = Date.now()
    let totalAttempts = 0

    this.isRunning = true

    while (this.isRunning && results.length < count) {
      try {
        const result = await this.generateVanityAddress(
          { ...options, maxAttempts: 100000 },
          (progress) => {
            const timeElapsed = Date.now() - startTime
            onProgress?.({
              ...progress,
              attempts: totalAttempts + progress.attempts,
              timeElapsed,
              found: [...results]
            })
          }
        )

        if (result) {
          results.push(result)
          totalAttempts += result.attempts
        } else {
          // If we can't find one in 100k attempts, break
          break
        }
      } catch (error) {
        console.error('Error in batch generation:', error)
        break
      }
    }

    this.isRunning = false
    return results
  }

  /**
   * Check if generator is currently running
   */
  get running(): boolean {
    return this.isRunning
  }
}

// Utility functions
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`
  } else if (seconds < 3600) {
    return `${(seconds / 60).toFixed(1)}m`
  } else if (seconds < 86400) {
    return `${(seconds / 3600).toFixed(1)}h`
  } else {
    return `${(seconds / 86400).toFixed(1)}d`
  }
}

export function formatRate(rate: number): string {
  if (rate < 1000) {
    return `${rate.toFixed(0)}/s`
  } else if (rate < 1000000) {
    return `${(rate / 1000).toFixed(1)}k/s`
  } else {
    return `${(rate / 1000000).toFixed(1)}M/s`
  }
}

export function isValidBase58Char(char: string): boolean {
  return '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'.includes(char)
}

export function suggestValidPattern(input: string): string {
  return input
    .split('')
    .map(char => isValidBase58Char(char) ? char : '')
    .join('')
    .slice(0, 8) // Limit to reasonable length
}