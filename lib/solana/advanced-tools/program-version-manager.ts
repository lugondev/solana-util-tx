import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { Buffer } from 'buffer'

export interface ProgramVersion {
  programId: string
  version: string
  deployedAt: number // Unix timestamp
  authority: string
  upgradeAuthority?: string
  size: number
  dataHash: string
  isUpgradeable: boolean
  slot: number
  description?: string
}

export interface ProgramVersionHistory {
  programId: string
  programName?: string
  currentVersion: ProgramVersion
  versions: ProgramVersion[]
  totalVersions: number
  isActive: boolean
  lastUpdated: number
}

export interface VersionDiff {
  fromVersion: ProgramVersion
  toVersion: ProgramVersion
  sizeChange: number
  hashChanged: boolean
  authorityChanged: boolean
  upgradeAuthorityChanged: boolean
  timeDifference: number
  changes: string[]
}

export interface DeploymentPlan {
  programId: string
  targetVersion: string
  authority: string
  upgradeAuthority?: string
  bufferAccount?: string
  estimatedCost: number
  requiredSigners: string[]
  instructions: any[]
  warnings: string[]
}

export class ProgramVersionManager {
  private connection: Connection
  private programCache = new Map<string, ProgramVersionHistory>()

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Get current program version information
   */
  async getCurrentVersion(programId: string): Promise<ProgramVersion | null> {
    try {
      const pubkey = new PublicKey(programId)
      const accountInfo = await this.connection.getAccountInfo(pubkey)
      
      if (!accountInfo) {
        return null
      }

      const slot = await this.connection.getSlot()
      
      return {
        programId,
        version: 'current',
        deployedAt: Date.now(),
        authority: accountInfo.owner.toString(),
        size: accountInfo.data.length,
        dataHash: this.hashBuffer(accountInfo.data),
        isUpgradeable: this.checkIfUpgradeable(accountInfo),
        slot,
        upgradeAuthority: await this.getUpgradeAuthority(programId)
      }
    } catch (error) {
      console.error('Error getting current version:', error)
      return null
    }
  }

  /**
   * Get program version history
   */
  async getVersionHistory(programId: string): Promise<ProgramVersionHistory | null> {
    try {
      // Check cache first
      if (this.programCache.has(programId)) {
        const cached = this.programCache.get(programId)!
        // Return cached if less than 5 minutes old
        if (Date.now() - cached.lastUpdated < 5 * 60 * 1000) {
          return cached
        }
      }

      const currentVersion = await this.getCurrentVersion(programId)
      if (!currentVersion) {
        return null
      }

      // Get historical versions from transaction history
      const versions = await this.getHistoricalVersions(programId)
      
      const history: ProgramVersionHistory = {
        programId,
        programName: await this.getProgramName(programId),
        currentVersion,
        versions: [currentVersion, ...versions],
        totalVersions: versions.length + 1,
        isActive: true,
        lastUpdated: Date.now()
      }

      // Cache the result
      this.programCache.set(programId, history)
      
      return history
    } catch (error) {
      console.error('Error getting version history:', error)
      return null
    }
  }

  /**
   * Compare two program versions
   */
  async compareVersions(
    programId: string, 
    fromVersion: string, 
    toVersion: string
  ): Promise<VersionDiff | null> {
    try {
      const history = await this.getVersionHistory(programId)
      if (!history) return null

      const from = history.versions.find(v => v.version === fromVersion)
      const to = history.versions.find(v => v.version === toVersion)
      
      if (!from || !to) return null

      const changes: string[] = []
      
      if (from.size !== to.size) {
        changes.push(`Size changed from ${from.size} to ${to.size} bytes`)
      }
      
      if (from.dataHash !== to.dataHash) {
        changes.push('Program bytecode changed')
      }
      
      if (from.authority !== to.authority) {
        changes.push(`Authority changed from ${from.authority} to ${to.authority}`)
      }
      
      if (from.upgradeAuthority !== to.upgradeAuthority) {
        changes.push('Upgrade authority changed')
      }

      return {
        fromVersion: from,
        toVersion: to,
        sizeChange: to.size - from.size,
        hashChanged: from.dataHash !== to.dataHash,
        authorityChanged: from.authority !== to.authority,
        upgradeAuthorityChanged: from.upgradeAuthority !== to.upgradeAuthority,
        timeDifference: to.deployedAt - from.deployedAt,
        changes
      }
    } catch (error) {
      console.error('Error comparing versions:', error)
      return null
    }
  }

  /**
   * Create deployment plan for program upgrade
   */
  async createDeploymentPlan(
    programId: string,
    bufferAccount: string,
    authority: string
  ): Promise<DeploymentPlan | null> {
    try {
      const currentVersion = await this.getCurrentVersion(programId)
      if (!currentVersion) {
        throw new Error('Program not found')
      }

      // Get buffer account info
      const bufferInfo = await this.connection.getAccountInfo(new PublicKey(bufferAccount))
      if (!bufferInfo) {
        throw new Error('Buffer account not found')
      }

      const warnings: string[] = []
      const requiredSigners = [authority]

      // Check if upgrade authority is required
      if (currentVersion.upgradeAuthority) {
        requiredSigners.push(currentVersion.upgradeAuthority)
        warnings.push('Upgrade authority signature required')
      }

      // Estimate transaction cost
      const estimatedCost = await this.estimateUpgradeCost(programId, bufferAccount)

      // Check for potential issues
      if (bufferInfo.data.length > currentVersion.size * 2) {
        warnings.push('New program is significantly larger - consider impact on accounts')
      }

      if (!currentVersion.isUpgradeable) {
        warnings.push('Program is not upgradeable - deployment will fail')
      }

      return {
        programId,
        targetVersion: 'new',
        authority,
        upgradeAuthority: currentVersion.upgradeAuthority,
        bufferAccount,
        estimatedCost,
        requiredSigners,
        instructions: await this.buildUpgradeInstructions(programId, bufferAccount, authority),
        warnings
      }
    } catch (error) {
      console.error('Error creating deployment plan:', error)
      return null
    }
  }

  /**
   * Monitor program for changes
   */
  async monitorProgram(
    programId: string, 
    callback: (change: ProgramVersion) => void
  ): Promise<() => void> {
    let isMonitoring = true
    let lastHash = ''
    
    const monitor = async () => {
      if (!isMonitoring) return
      
      try {
        const currentVersion = await this.getCurrentVersion(programId)
        if (currentVersion && currentVersion.dataHash !== lastHash) {
          lastHash = currentVersion.dataHash
          callback(currentVersion)
        }
      } catch (error) {
        console.error('Monitor error:', error)
      }
      
      // Check again in 30 seconds
      setTimeout(monitor, 30000)
    }
    
    // Start monitoring
    const currentVersion = await this.getCurrentVersion(programId)
    if (currentVersion) {
      lastHash = currentVersion.dataHash
    }
    monitor()
    
    // Return stop function
    return () => {
      isMonitoring = false
    }
  }

  /**
   * Get multiple program versions in batch
   */
  async getBatchVersions(programIds: string[]): Promise<ProgramVersionHistory[]> {
    const results = await Promise.allSettled(
      programIds.map(id => this.getVersionHistory(id))
    )
    
    return results
      .filter((result): result is PromiseFulfilledResult<ProgramVersionHistory> => 
        result.status === 'fulfilled' && result.value !== null
      )
      .map(result => result.value)
  }

  /**
   * Get program statistics
   */
  async getProgramStatistics(programIds: string[]): Promise<{
    totalPrograms: number
    upgradeablePrograms: number
    totalSize: number
    averageSize: number
    oldestProgram: ProgramVersion | null
    newestProgram: ProgramVersion | null
    programsByAuthority: { [authority: string]: number }
  }> {
    const versions = await this.getBatchVersions(programIds)
    
    const stats = {
      totalPrograms: versions.length,
      upgradeablePrograms: 0,
      totalSize: 0,
      averageSize: 0,
      oldestProgram: null as ProgramVersion | null,
      newestProgram: null as ProgramVersion | null,
      programsByAuthority: {} as { [authority: string]: number }
    }
    
    versions.forEach(program => {
      const current = program.currentVersion
      
      if (current.isUpgradeable) {
        stats.upgradeablePrograms++
      }
      
      stats.totalSize += current.size
      
      // Track oldest/newest
      if (!stats.oldestProgram || current.deployedAt < stats.oldestProgram.deployedAt) {
        stats.oldestProgram = current
      }
      
      if (!stats.newestProgram || current.deployedAt > stats.newestProgram.deployedAt) {
        stats.newestProgram = current
      }
      
      // Count by authority
      stats.programsByAuthority[current.authority] = 
        (stats.programsByAuthority[current.authority] || 0) + 1
    })
    
    stats.averageSize = stats.totalPrograms > 0 ? stats.totalSize / stats.totalPrograms : 0
    
    return stats
  }

  /**
   * Validate program upgrade compatibility
   */
  async validateUpgrade(
    programId: string,
    bufferAccount: string
  ): Promise<{
    isValid: boolean
    warnings: string[]
    errors: string[]
  }> {
    const warnings: string[] = []
    const errors: string[] = []
    
    try {
      const currentVersion = await this.getCurrentVersion(programId)
      if (!currentVersion) {
        errors.push('Program not found')
        return { isValid: false, warnings, errors }
      }
      
      if (!currentVersion.isUpgradeable) {
        errors.push('Program is not upgradeable')
      }
      
      const bufferInfo = await this.connection.getAccountInfo(new PublicKey(bufferAccount))
      if (!bufferInfo) {
        errors.push('Buffer account not found')
        return { isValid: false, warnings, errors }
      }
      
      // Check size differences
      const sizeDiff = bufferInfo.data.length - currentVersion.size
      if (sizeDiff > currentVersion.size * 0.5) {
        warnings.push(`New program is ${Math.round(sizeDiff / 1024)}KB larger`)
      }
      
      // Check if buffer is ready for deployment
      if (bufferInfo.owner.toString() !== 'BPFLoaderUpgradeab1e11111111111111111111111') {
        errors.push('Buffer account is not owned by upgradeable loader')
      }
      
      return {
        isValid: errors.length === 0,
        warnings,
        errors
      }
    } catch (error) {
      errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      return { isValid: false, warnings, errors }
    }
  }

  /**
   * Private helper methods
   */
  private hashBuffer(buffer: Buffer): string {
    // Simple hash for demo - in production use crypto hash
    let hash = 0
    for (let i = 0; i < buffer.length; i++) {
      const char = buffer[i]
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString(16)
  }

  private checkIfUpgradeable(accountInfo: AccountInfo<Buffer>): boolean {
    // Check if owned by upgradeable loader
    return accountInfo.owner.toString() === 'BPFLoaderUpgradeab1e11111111111111111111111'
  }

  private async getUpgradeAuthority(programId: string): Promise<string | undefined> {
    try {
      // In a real implementation, parse the program data account
      // For now, return undefined
      return undefined
    } catch {
      return undefined
    }
  }

  private async getProgramName(programId: string): Promise<string | undefined> {
    // Map of known programs
    const knownPrograms: { [key: string]: string } = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022 Program',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Program',
      'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter Aggregator V6',
      '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM': 'Orca Whirlpool',
      '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM V4'
    }
    
    return knownPrograms[programId]
  }

  private async getHistoricalVersions(programId: string): Promise<ProgramVersion[]> {
    // In a real implementation, this would query transaction history
    // For now, return empty array
    return []
  }

  private async estimateUpgradeCost(programId: string, bufferAccount: string): Promise<number> {
    // Estimate based on recent block hash and program size
    const recentBlockhash = await this.connection.getRecentBlockhash()
    return recentBlockhash.feeCalculator?.lamportsPerSignature || 5000
  }

  private async buildUpgradeInstructions(
    programId: string, 
    bufferAccount: string, 
    authority: string
  ): Promise<any[]> {
    // In a real implementation, build actual upgrade instructions
    return [
      {
        type: 'upgrade',
        programId,
        bufferAccount,
        authority,
        description: 'Upgrade program from buffer'
      }
    ]
  }

  /**
   * Get common program IDs for quick access
   */
  static getCommonPrograms(): { name: string; programId: string; category: string }[] {
    return [
      {
        name: 'System Program',
        programId: '11111111111111111111111111111111',
        category: 'Core'
      },
      {
        name: 'Token Program',
        programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
        category: 'Core'
      },
      {
        name: 'Token-2022 Program',
        programId: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
        category: 'Core'
      },
      {
        name: 'Associated Token Program',
        programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL',
        category: 'Core'
      },
      {
        name: 'Jupiter Aggregator V6',
        programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
        category: 'DeFi'
      },
      {
        name: 'Jupiter Aggregator V4',
        programId: 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB',
        category: 'DeFi'
      },
      {
        name: 'Orca Whirlpool',
        programId: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        category: 'DeFi'
      },
      {
        name: 'Raydium AMM V4',
        programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8',
        category: 'DeFi'
      },
      {
        name: 'Serum DEX V3',
        programId: 'srmqPiKfyn7iEp3TqApAVdxKHy4rBpGFsHW3TnHRKWe',
        category: 'DeFi'
      },
      {
        name: 'Metaplex Token Metadata',
        programId: 'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s',
        category: 'NFT'
      }
    ]
  }
}