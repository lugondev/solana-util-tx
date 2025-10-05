import { Connection, PublicKey } from '@solana/web3.js'
import { BorshCoder } from '@coral-xyz/anchor'
import { sha256 } from 'js-sha256'

export interface InspectionOptions {
  includeSecurityAnalysis: boolean
  includeBytecodeAnalysis: boolean
  includePerformanceMetrics: boolean
  includeInstructionAnalysis: boolean
  deepAnalysis: boolean
}

export interface ProgramOverview {
  programType: 'Anchor' | 'Native' | 'SPL' | 'Unknown'
  codeSize: number
  version?: string
  description?: string
  authority?: string
  isUpgradeable: boolean
}

export interface SecurityIssue {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  location?: string
  recommendation?: string
}

export interface SecurityAnalysis {
  issues: SecurityIssue[]
  securityScore: number
  recommendations: string[]
}

export interface PerformanceMetric {
  name: string
  value: string | number
  unit: string
  recommendation?: string
}

export interface PerformanceAnalysis {
  metrics: PerformanceMetric[]
  computeUnitsEstimate: number
  memoryUsage: number
}

export interface InstructionAccount {
  name: string
  isMut: boolean
  isSigner: boolean
  description?: string
}

export interface InstructionArg {
  name: string
  type: string
  description?: string
}

export interface InstructionInfo {
  name: string
  discriminator: string
  description?: string
  accounts?: InstructionAccount[]
  args?: InstructionArg[]
  computeUnits?: number
}

export interface BytecodeAnalysis {
  size: number
  hash: string
  deployedAt?: number
  isUpgradeable: boolean
  disassembly?: string
  entropy: number
}

export interface ProgramMetadata {
  name?: string
  version?: string
  repository?: string
  contact?: string
  idl?: any
}

export interface ProgramAnalysis {
  programId: string
  overview: ProgramOverview
  security?: SecurityAnalysis
  performance?: PerformanceAnalysis
  instructions?: InstructionInfo[]
  bytecode?: BytecodeAnalysis
  metadata?: ProgramMetadata
  timestamp: number
}

export class ProgramInspector {
  constructor(private connection: Connection) {}

  /**
   * Analyze a Solana program
   */
  async analyzeProgram(programId: string, options: InspectionOptions): Promise<ProgramAnalysis> {
    const pubkey = new PublicKey(programId)
    
    // Get account info
    const accountInfo = await this.connection.getAccountInfo(pubkey)
    if (!accountInfo) {
      throw new Error('Program not found or invalid address')
    }

    const analysis: ProgramAnalysis = {
      programId,
      overview: await this.analyzeOverview(pubkey, accountInfo),
      timestamp: Date.now()
    }

    // Security analysis
    if (options.includeSecurityAnalysis) {
      analysis.security = await this.analyzeSecurityIssues(pubkey, accountInfo)
    }

    // Performance analysis
    if (options.includePerformanceMetrics) {
      analysis.performance = await this.analyzePerformance(pubkey, accountInfo)
    }

    // Instruction analysis
    if (options.includeInstructionAnalysis) {
      analysis.instructions = await this.analyzeInstructions(pubkey, accountInfo, options.deepAnalysis)
    }

    // Bytecode analysis
    if (options.includeBytecodeAnalysis) {
      analysis.bytecode = await this.analyzeBytecode(pubkey, accountInfo)
    }

    // Try to extract metadata
    analysis.metadata = await this.extractMetadata(pubkey, accountInfo)

    return analysis
  }

  /**
   * Analyze program overview
   */
  private async analyzeOverview(pubkey: PublicKey, accountInfo: any): Promise<ProgramOverview> {
    const programType = this.detectProgramType(accountInfo.data)
    
    return {
      programType,
      codeSize: accountInfo.data.length,
      isUpgradeable: accountInfo.owner.equals(new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')),
      authority: accountInfo.owner.toString()
    }
  }

  /**
   * Detect program type
   */
  private detectProgramType(data: Buffer): 'Anchor' | 'Native' | 'SPL' | 'Unknown' {
    const dataStr = data.toString('hex')
    
    // Check for Anchor discriminators
    if (this.hasAnchorPatterns(data)) {
      return 'Anchor'
    }
    
    // Check for SPL program patterns
    if (this.hasSPLPatterns(data)) {
      return 'SPL'
    }
    
    // Check for native program patterns
    if (this.hasNativePatterns(data)) {
      return 'Native'
    }
    
    return 'Unknown'
  }

  /**
   * Check for Anchor patterns
   */
  private hasAnchorPatterns(data: Buffer): boolean {
    const hex = data.toString('hex')
    // Look for common Anchor discriminator patterns
    return hex.includes('af71d2e7') || // Common Anchor discriminator start
           hex.includes('b712469c') || // Another common pattern
           data.includes(Buffer.from('anchor', 'utf8'))
  }

  /**
   * Check for SPL patterns
   */
  private hasSPLPatterns(data: Buffer): boolean {
    const hex = data.toString('hex')
    // Look for SPL token program patterns
    return hex.includes('060000000100000001000000') || // SPL token instruction pattern
           hex.includes('TokenkegQfeZyiNwEJbNbGKPFXCWuBvf9Ss623VQ5DA')
  }

  /**
   * Check for native patterns
   */
  private hasNativePatterns(data: Buffer): boolean {
    // Native programs often have specific instruction layouts
    return data.length > 0 && !this.hasAnchorPatterns(data) && !this.hasSPLPatterns(data)
  }

  /**
   * Analyze security issues
   */
  private async analyzeSecurityIssues(pubkey: PublicKey, accountInfo: any): Promise<SecurityAnalysis> {
    const issues: SecurityIssue[] = []
    
    // Check for common security issues
    this.checkSignerValidation(accountInfo.data, issues)
    this.checkOwnershipValidation(accountInfo.data, issues)
    this.checkIntegerOverflow(accountInfo.data, issues)
    this.checkReentrancy(accountInfo.data, issues)
    this.checkHardcodedAddresses(accountInfo.data, issues)
    
    const securityScore = this.calculateSecurityScore(issues)
    
    return {
      issues,
      securityScore,
      recommendations: this.generateSecurityRecommendations(issues)
    }
  }

  /**
   * Check signer validation
   */
  private checkSignerValidation(data: Buffer, issues: SecurityIssue[]): void {
    const hex = data.toString('hex')
    
    // Look for patterns that might indicate missing signer checks
    if (!hex.includes('is_signer') && !hex.includes('signer')) {
      issues.push({
        type: 'Missing Signer Validation',
        severity: 'high',
        description: 'Program may not properly validate signer requirements',
        recommendation: 'Ensure all sensitive operations require proper signer validation'
      })
    }
  }

  /**
   * Check ownership validation
   */
  private checkOwnershipValidation(data: Buffer, issues: SecurityIssue[]): void {
    const hex = data.toString('hex')
    
    if (!hex.includes('owner') && data.length > 1000) {
      issues.push({
        type: 'Insufficient Ownership Checks',
        severity: 'medium',
        description: 'Program may not properly validate account ownership',
        recommendation: 'Implement comprehensive account ownership validation'
      })
    }
  }

  /**
   * Check for integer overflow
   */
  private checkIntegerOverflow(data: Buffer, issues: SecurityIssue[]): void {
    const hex = data.toString('hex')
    
    // Look for arithmetic operations without overflow checks
    if (hex.includes('add') || hex.includes('mul')) {
      if (!hex.includes('checked_add') && !hex.includes('checked_mul')) {
        issues.push({
          type: 'Potential Integer Overflow',
          severity: 'medium',
          description: 'Arithmetic operations detected without overflow protection',
          recommendation: 'Use checked arithmetic operations or implement overflow guards'
        })
      }
    }
  }

  /**
   * Check for reentrancy issues
   */
  private checkReentrancy(data: Buffer, issues: SecurityIssue[]): void {
    const hex = data.toString('hex')
    
    // Look for external calls that might enable reentrancy
    if (hex.includes('invoke') && !hex.includes('mutex') && !hex.includes('lock')) {
      issues.push({
        type: 'Potential Reentrancy Vulnerability',
        severity: 'low',
        description: 'External calls detected without apparent reentrancy protection',
        recommendation: 'Implement reentrancy guards for state-changing external calls'
      })
    }
  }

  /**
   * Check for hardcoded addresses
   */
  private checkHardcodedAddresses(data: Buffer, issues: SecurityIssue[]): void {
    const hex = data.toString('hex')
    
    // Count potential pubkey patterns (32 bytes = 64 hex chars)
    const pubkeyPattern = /[0-9a-f]{64}/gi
    const matches = hex.match(pubkeyPattern)
    
    if (matches && matches.length > 10) {
      issues.push({
        type: 'Multiple Hardcoded Addresses',
        severity: 'low',
        description: `Detected ${matches.length} potential hardcoded addresses`,
        recommendation: 'Consider using configuration or program-derived addresses'
      })
    }
  }

  /**
   * Calculate security score
   */
  private calculateSecurityScore(issues: SecurityIssue[]): number {
    let score = 100
    
    issues.forEach(issue => {
      switch (issue.severity) {
        case 'critical': score -= 25; break
        case 'high': score -= 15; break
        case 'medium': score -= 10; break
        case 'low': score -= 5; break
      }
    })
    
    return Math.max(0, score)
  }

  /**
   * Generate security recommendations
   */
  private generateSecurityRecommendations(issues: SecurityIssue[]): string[] {
    const recommendations = new Set<string>()
    
    issues.forEach(issue => {
      if (issue.recommendation) {
        recommendations.add(issue.recommendation)
      }
    })
    
    return Array.from(recommendations)
  }

  /**
   * Analyze performance metrics
   */
  private async analyzePerformance(pubkey: PublicKey, accountInfo: any): Promise<PerformanceAnalysis> {
    const metrics: PerformanceMetric[] = []
    
    // Code size metric
    metrics.push({
      name: 'Code Size',
      value: accountInfo.data.length,
      unit: 'bytes',
      recommendation: accountInfo.data.length > 100000 ? 'Consider code optimization' : undefined
    })
    
    // Estimated compute units (heuristic)
    const estimatedCU = this.estimateComputeUnits(accountInfo.data)
    metrics.push({
      name: 'Estimated Compute Units',
      value: estimatedCU,
      unit: 'CU',
      recommendation: estimatedCU > 200000 ? 'High compute usage detected' : undefined
    })
    
    // Memory usage estimate
    const memoryUsage = this.estimateMemoryUsage(accountInfo.data)
    metrics.push({
      name: 'Memory Usage',
      value: memoryUsage,
      unit: 'bytes',
      recommendation: memoryUsage > 32000 ? 'High memory usage' : undefined
    })
    
    return {
      metrics,
      computeUnitsEstimate: estimatedCU,
      memoryUsage
    }
  }

  /**
   * Estimate compute units
   */
  private estimateComputeUnits(data: Buffer): number {
    // Simple heuristic based on code size and complexity
    const baseUnits = Math.floor(data.length / 10)
    const complexityMultiplier = this.calculateComplexity(data)
    return Math.min(baseUnits * complexityMultiplier, 1400000)
  }

  /**
   * Calculate code complexity
   */
  private calculateComplexity(data: Buffer): number {
    const hex = data.toString('hex')
    let complexity = 1
    
    // Increase complexity for various patterns
    if (hex.includes('invoke')) complexity += 0.5
    if (hex.includes('loop')) complexity += 0.3
    if (hex.includes('branch')) complexity += 0.2
    
    return complexity
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(data: Buffer): number {
    // Estimate based on data structures and allocations
    return Math.floor(data.length * 0.1) + 1000 // Base overhead
  }

  /**
   * Analyze instructions
   */
  private async analyzeInstructions(pubkey: PublicKey, accountInfo: any, deepAnalysis: boolean): Promise<InstructionInfo[]> {
    const instructions: InstructionInfo[] = []
    
    try {
      // Try to extract instructions from Anchor programs
      if (this.hasAnchorPatterns(accountInfo.data)) {
        instructions.push(...this.extractAnchorInstructions(accountInfo.data))
      } else {
        // Fallback to heuristic instruction detection
        instructions.push(...this.extractHeuristicInstructions(accountInfo.data))
      }
    } catch (error) {
      // If instruction extraction fails, return basic info
      instructions.push({
        name: 'Unknown',
        discriminator: '0x00000000',
        description: 'Could not extract instruction information'
      })
    }
    
    return instructions
  }

  /**
   * Extract Anchor instructions
   */
  private extractAnchorInstructions(data: Buffer): InstructionInfo[] {
    const instructions: InstructionInfo[] = []
    
    // This is a simplified extraction - real implementation would parse IDL
    const hex = data.toString('hex')
    const discriminatorPattern = /[0-9a-f]{8}/gi
    const matches = hex.match(discriminatorPattern)
    
    if (matches) {
      matches.slice(0, 10).forEach((discriminator, i) => {
        instructions.push({
          name: `Instruction${i + 1}`,
          discriminator: `0x${discriminator}`,
          description: 'Anchor instruction (extracted from bytecode)'
        })
      })
    }
    
    return instructions
  }

  /**
   * Extract instructions using heuristics
   */
  private extractHeuristicInstructions(data: Buffer): InstructionInfo[] {
    const instructions: InstructionInfo[] = []
    
    // Basic pattern detection for common instruction types
    const patterns = [
      { name: 'Initialize', pattern: 'init' },
      { name: 'Transfer', pattern: 'transfer' },
      { name: 'Update', pattern: 'update' },
      { name: 'Close', pattern: 'close' }
    ]
    
    const hex = data.toString('hex').toLowerCase()
    
    patterns.forEach((pattern, i) => {
      if (hex.includes(pattern.pattern)) {
        instructions.push({
          name: pattern.name,
          discriminator: `0x${i.toString(16).padStart(8, '0')}`,
          description: `Detected ${pattern.name.toLowerCase()} operation`
        })
      }
    })
    
    return instructions
  }

  /**
   * Analyze bytecode
   */
  private async analyzeBytecode(pubkey: PublicKey, accountInfo: any): Promise<BytecodeAnalysis> {
    const data = accountInfo.data
    const hash = sha256(data)
    
    return {
      size: data.length,
      hash,
      isUpgradeable: accountInfo.owner.equals(new PublicKey('BPFLoaderUpgradeab1e11111111111111111111111')),
      entropy: this.calculateEntropy(data),
      disassembly: this.generateSimpleDisassembly(data)
    }
  }

  /**
   * Calculate data entropy
   */
  private calculateEntropy(data: Buffer): number {
    const frequency: { [key: number]: number } = {}
    
    for (let i = 0; i < data.length; i++) {
      const byte = data[i]
      frequency[byte] = (frequency[byte] || 0) + 1
    }
    
    let entropy = 0
    const length = data.length
    
    for (const count of Object.values(frequency)) {
      const probability = count / length
      entropy -= probability * Math.log2(probability)
    }
    
    return entropy
  }

  /**
   * Generate simple disassembly
   */
  private generateSimpleDisassembly(data: Buffer): string {
    const lines: string[] = []
    
    for (let i = 0; i < Math.min(data.length, 200); i += 4) {
      const bytes = data.slice(i, i + 4)
      const hex = bytes.toString('hex').padEnd(8, '0')
      const offset = i.toString(16).padStart(4, '0')
      lines.push(`${offset}: ${hex}`)
    }
    
    if (data.length > 200) {
      lines.push('... (truncated)')
    }
    
    return lines.join('\n')
  }

  /**
   * Extract metadata
   */
  private async extractMetadata(pubkey: PublicKey, accountInfo: any): Promise<ProgramMetadata> {
    const metadata: ProgramMetadata = {}
    
    // Try to extract metadata from various sources
    try {
      // Check for embedded metadata
      const dataStr = accountInfo.data.toString('utf8', 0, Math.min(1000, accountInfo.data.length))
      
      // Look for version strings
      const versionMatch = dataStr.match(/version["\s:]+([0-9.]+)/i)
      if (versionMatch) {
        metadata.version = versionMatch[1]
      }
      
      // Look for name
      const nameMatch = dataStr.match(/name["\s:]+([a-zA-Z0-9_-]+)/i)
      if (nameMatch) {
        metadata.name = nameMatch[1]
      }
      
    } catch (error) {
      // Ignore errors in metadata extraction
    }
    
    return metadata
  }
}