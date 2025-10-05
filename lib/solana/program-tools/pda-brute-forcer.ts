import { PublicKey } from '@solana/web3.js'
import bs58 from 'bs58'

export interface PDASearchOptions {
  programId: string
  seeds: PDASeeds[]
  constraints: PDAConstraints
  maxAttempts?: number
  batchSize?: number
}

export interface PDASeeds {
  type: 'string' | 'publickey' | 'bytes' | 'number' | 'variable'
  value?: string | number | Uint8Array
  variableRange?: {
    min: number
    max: number
    type: 'u8' | 'u16' | 'u32' | 'u64'
  }
  description?: string
}

export interface PDAConstraints {
  prefix?: string
  suffix?: string
  contains?: string
  startsWith?: string
  endsWith?: string
  minLength?: number
  maxLength?: number
  caseSensitive?: boolean
  excludePatterns?: string[]
}

export interface PDAResult {
  address: string
  bump: number
  seeds: PDASeeds[]
  seedsUsed: (string | number | Uint8Array)[]
  attempts: number
  timeElapsed: number
  matchedConstraints: string[]
}

export interface PDAProgress {
  attempts: number
  timeElapsed: number
  rate: number
  found: PDAResult[]
  isRunning: boolean
  currentSeeds?: (string | number | Uint8Array)[]
}

export class PDABruteForcer {
  private isRunning = false
  private startTime = 0
  private onProgress?: (progress: PDAProgress) => void

  /**
   * Find PDAs matching specific constraints
   */
  async findPDAs(
    options: PDASearchOptions,
    onProgress?: (progress: PDAProgress) => void
  ): Promise<PDAResult[]> {
    this.onProgress = onProgress
    this.isRunning = true
    this.startTime = Date.now()

    const {
      programId,
      seeds,
      constraints,
      maxAttempts = 1000000,
      batchSize = 1000
    } = options

    const programPubkey = new PublicKey(programId)
    const results: PDAResult[] = []
    let attempts = 0
    let lastProgressUpdate = 0

    // Validate inputs
    this.validateInputs(options)

    // Generate seed combinations
    const seedGenerator = this.createSeedGenerator(seeds)

    while (this.isRunning && attempts < maxAttempts) {
      const batch = this.generateSeedBatch(seedGenerator, batchSize)
      
      if (batch.length === 0) {
        break // No more combinations
      }

      for (const seedCombination of batch) {
        attempts++

        try {
          // Find PDA for this seed combination
          const [pda, bump] = this.findPDAWithSeeds(programPubkey, seedCombination)
          
          // Check if PDA matches constraints
          const matchResult = this.checkConstraints(pda.toString(), constraints)
          
          if (matchResult.matches) {
            const result: PDAResult = {
              address: pda.toString(),
              bump,
              seeds,
              seedsUsed: seedCombination,
              attempts,
              timeElapsed: Date.now() - this.startTime,
              matchedConstraints: matchResult.matchedConstraints
            }

            results.push(result)
          }
        } catch (error) {
          // Skip invalid seed combinations
          continue
        }

        // Update progress
        const now = Date.now()
        if (attempts % 100 === 0 || now - lastProgressUpdate > 1000) {
          const timeElapsed = now - this.startTime
          const rate = attempts / (timeElapsed / 1000)

          const progress: PDAProgress = {
            attempts,
            timeElapsed,
            rate,
            found: [...results],
            isRunning: this.isRunning,
            currentSeeds: seedCombination
          }

          this.onProgress?.(progress)
          lastProgressUpdate = now

          // Allow UI to update
          if (attempts % 100 === 0) {
            await new Promise(resolve => setTimeout(resolve, 0))
          }
        }

        if (!this.isRunning) break
      }

      if (!this.isRunning) break
    }

    this.isRunning = false
    return results
  }

  /**
   * Stop the search process
   */
  stop(): void {
    this.isRunning = false
  }

  /**
   * Find PDA with specific seeds
   */
  private findPDAWithSeeds(
    programId: PublicKey, 
    seeds: (string | number | Uint8Array)[]
  ): [PublicKey, number] {
    const seedBuffers = seeds.map(seed => this.seedToBuffer(seed))
    
    return PublicKey.findProgramAddressSync(seedBuffers, programId)
  }

  /**
   * Convert seed to buffer
   */
  private seedToBuffer(seed: string | number | Uint8Array): Buffer {
    if (typeof seed === 'string') {
      // Check if it's a base58 public key
      try {
        const pubkey = new PublicKey(seed)
        return pubkey.toBuffer()
      } catch {
        // Regular string
        return Buffer.from(seed, 'utf8')
      }
    } else if (typeof seed === 'number') {
      // Convert number to bytes based on size
      if (seed <= 255) {
        return Buffer.from([seed])
      } else if (seed <= 65535) {
        const buf = Buffer.allocUnsafe(2)
        buf.writeUInt16LE(seed, 0)
        return buf
      } else if (seed <= 4294967295) {
        const buf = Buffer.allocUnsafe(4)
        buf.writeUInt32LE(seed, 0)
        return buf
      } else {
        const buf = Buffer.allocUnsafe(8)
        buf.writeBigUInt64LE(BigInt(seed), 0)
        return buf
      }
    } else {
      return Buffer.from(seed)
    }
  }

  /**
   * Create seed generator for all combinations
   */
  private createSeedGenerator(seeds: PDASeeds[]): Generator<(string | number | Uint8Array)[]> {
    return this.generateSeedCombinations(seeds, 0, [])
  }

  /**
   * Generate all seed combinations recursively
   */
  private *generateSeedCombinations(
    seeds: PDASeeds[],
    index: number,
    current: (string | number | Uint8Array)[]
  ): Generator<(string | number | Uint8Array)[]> {
    if (index >= seeds.length) {
      yield [...current]
      return
    }

    const seed = seeds[index]
    
    if (seed.type === 'variable' && seed.variableRange) {
      const { min, max, type } = seed.variableRange
      
      for (let value = min; value <= max; value++) {
        current[index] = value
        yield* this.generateSeedCombinations(seeds, index + 1, current)
      }
    } else if (seed.value !== undefined) {
      current[index] = seed.value
      yield* this.generateSeedCombinations(seeds, index + 1, current)
    }
  }

  /**
   * Generate a batch of seed combinations
   */
  private generateSeedBatch(
    generator: Generator<(string | number | Uint8Array)[]>,
    batchSize: number
  ): (string | number | Uint8Array)[][] {
    const batch: (string | number | Uint8Array)[][] = []
    
    for (let i = 0; i < batchSize; i++) {
      const next = generator.next()
      if (next.done) break
      batch.push(next.value)
    }
    
    return batch
  }

  /**
   * Check if PDA address matches constraints
   */
  private checkConstraints(
    address: string, 
    constraints: PDAConstraints
  ): { matches: boolean; matchedConstraints: string[] } {
    const matchedConstraints: string[] = []
    const {
      prefix,
      suffix,
      contains,
      startsWith,
      endsWith,
      minLength,
      maxLength,
      caseSensitive = false,
      excludePatterns = []
    } = constraints

    const targetAddress = caseSensitive ? address : address.toLowerCase()

    // Check length constraints
    if (minLength && address.length < minLength) {
      return { matches: false, matchedConstraints: [] }
    }
    if (maxLength && address.length > maxLength) {
      return { matches: false, matchedConstraints: [] }
    }

    // Check exclude patterns
    for (const pattern of excludePatterns) {
      const targetPattern = caseSensitive ? pattern : pattern.toLowerCase()
      if (targetAddress.includes(targetPattern)) {
        return { matches: false, matchedConstraints: [] }
      }
    }

    // Check positive constraints
    if (prefix) {
      const targetPrefix = caseSensitive ? prefix : prefix.toLowerCase()
      if (targetAddress.startsWith(targetPrefix)) {
        matchedConstraints.push(`prefix: ${prefix}`)
      } else {
        return { matches: false, matchedConstraints: [] }
      }
    }

    if (suffix) {
      const targetSuffix = caseSensitive ? suffix : suffix.toLowerCase()
      if (targetAddress.endsWith(targetSuffix)) {
        matchedConstraints.push(`suffix: ${suffix}`)
      } else {
        return { matches: false, matchedConstraints: [] }
      }
    }

    if (contains) {
      const targetContains = caseSensitive ? contains : contains.toLowerCase()
      if (targetAddress.includes(targetContains)) {
        matchedConstraints.push(`contains: ${contains}`)
      } else {
        return { matches: false, matchedConstraints: [] }
      }
    }

    if (startsWith) {
      const targetStartsWith = caseSensitive ? startsWith : startsWith.toLowerCase()
      if (targetAddress.startsWith(targetStartsWith)) {
        matchedConstraints.push(`startsWith: ${startsWith}`)
      } else {
        return { matches: false, matchedConstraints: [] }
      }
    }

    if (endsWith) {
      const targetEndsWith = caseSensitive ? endsWith : endsWith.toLowerCase()
      if (targetAddress.endsWith(targetEndsWith)) {
        matchedConstraints.push(`endsWith: ${endsWith}`)
      } else {
        return { matches: false, matchedConstraints: [] }
      }
    }

    // If no constraints were specified, match everything
    if (matchedConstraints.length === 0 && this.hasNoConstraints(constraints)) {
      matchedConstraints.push('no constraints')
    }

    return { 
      matches: matchedConstraints.length > 0, 
      matchedConstraints 
    }
  }

  /**
   * Check if no constraints are specified
   */
  private hasNoConstraints(constraints: PDAConstraints): boolean {
    return !constraints.prefix &&
           !constraints.suffix &&
           !constraints.contains &&
           !constraints.startsWith &&
           !constraints.endsWith &&
           !constraints.minLength &&
           !constraints.maxLength
  }

  /**
   * Validate search inputs
   */
  private validateInputs(options: PDASearchOptions): void {
    const { programId, seeds, constraints } = options

    // Validate program ID
    try {
      new PublicKey(programId)
    } catch {
      throw new Error('Invalid program ID')
    }

    // Validate seeds
    if (!seeds || seeds.length === 0) {
      throw new Error('At least one seed must be specified')
    }

    if (seeds.length > 8) {
      throw new Error('Maximum 8 seeds allowed')
    }

    // Validate each seed
    seeds.forEach((seed, index) => {
      if (seed.type === 'variable') {
        if (!seed.variableRange) {
          throw new Error(`Variable seed at index ${index} must have variableRange`)
        }
        
        const { min, max } = seed.variableRange
        if (min > max) {
          throw new Error(`Invalid range for seed at index ${index}: min > max`)
        }
        
        const rangeSize = max - min + 1
        if (rangeSize > 100000) {
          throw new Error(`Range too large for seed at index ${index} (max 100,000 values)`)
        }
      } else if (seed.value === undefined) {
        throw new Error(`Non-variable seed at index ${index} must have a value`)
      }
    })

    // Check if constraints are reasonable
    if (this.hasNoConstraints(constraints)) {
      console.warn('No constraints specified - this will return many results')
    }
  }

  /**
   * Estimate search difficulty
   */
  estimateSearchDifficulty(options: PDASearchOptions): {
    totalCombinations: number
    estimatedTime: string
    difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme'
  } {
    let totalCombinations = 1

    options.seeds.forEach(seed => {
      if (seed.type === 'variable' && seed.variableRange) {
        const rangeSize = seed.variableRange.max - seed.variableRange.min + 1
        totalCombinations *= rangeSize
      }
    })

    // Estimate based on constraints difficulty
    let constraintDifficulty = 1
    const { constraints } = options

    if (constraints.prefix) constraintDifficulty *= Math.pow(58, constraints.prefix.length)
    if (constraints.suffix) constraintDifficulty *= Math.pow(58, constraints.suffix.length)
    if (constraints.contains) constraintDifficulty *= Math.pow(58, constraints.contains.length)

    const effectiveDifficulty = Math.min(totalCombinations, constraintDifficulty)
    
    // Estimate time (assuming 1000 attempts per second)
    const estimatedSeconds = effectiveDifficulty / 1000

    let difficulty: 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Extreme'
    let estimatedTime: string

    if (estimatedSeconds < 1) {
      difficulty = 'Easy'
      estimatedTime = '< 1 second'
    } else if (estimatedSeconds < 10) {
      difficulty = 'Medium'
      estimatedTime = `~${Math.ceil(estimatedSeconds)} seconds`
    } else if (estimatedSeconds < 300) {
      difficulty = 'Hard'
      estimatedTime = `~${Math.ceil(estimatedSeconds / 60)} minutes`
    } else if (estimatedSeconds < 3600) {
      difficulty = 'Very Hard'
      estimatedTime = `~${Math.ceil(estimatedSeconds / 60)} minutes`
    } else {
      difficulty = 'Extreme'
      estimatedTime = `~${Math.ceil(estimatedSeconds / 3600)} hours`
    }

    return {
      totalCombinations,
      estimatedTime,
      difficulty
    }
  }

  /**
   * Check if search is running
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

export function createCommonSeeds(): { name: string; seeds: PDASeeds[] }[] {
  return [
    {
      name: 'User Account',
      seeds: [
        { type: 'string', value: 'user', description: 'Static prefix' },
        { type: 'publickey', value: '', description: 'User wallet address' }
      ]
    },
    {
      name: 'Token Account',
      seeds: [
        { type: 'string', value: 'token', description: 'Static prefix' },
        { type: 'publickey', value: '', description: 'Owner address' },
        { type: 'publickey', value: '', description: 'Mint address' }
      ]
    },
    {
      name: 'Counter with ID',
      seeds: [
        { type: 'string', value: 'counter', description: 'Static prefix' },
        { type: 'variable', variableRange: { min: 0, max: 1000, type: 'u32' }, description: 'Counter ID' }
      ]
    },
    {
      name: 'Game State',
      seeds: [
        { type: 'string', value: 'game', description: 'Static prefix' },
        { type: 'publickey', value: '', description: 'Player address' },
        { type: 'variable', variableRange: { min: 1, max: 100, type: 'u8' }, description: 'Level' }
      ]
    }
  ]
}