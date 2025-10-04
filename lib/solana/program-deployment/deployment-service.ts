import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  Keypair,
  SystemProgram,
  sendAndConfirmTransaction,
  LAMPORTS_PER_SOL,
  Signer
} from '@solana/web3.js'
import {
  ProgramDeploymentConfig,
  DeploymentResult,
  ProgramUpgradeParams,
  ProgramCloseParams,
  IDLDeploymentParams,
  ProgramData,
  BufferAccount,
  DeploymentStats,
  BPF_LOADER_PROGRAM_ID,
  BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
  PROGRAM_SIZE_LIMITS,
  DEPLOYMENT_COSTS
} from './types'

/**
 * Solana program deployment service
 * Provides functionality to deploy, upgrade, and manage Solana programs
 */
export class ProgramDeploymentService {
  private connection: Connection
  private deploymentHistory: Map<string, DeploymentResult> = new Map()

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Calculate deployment cost for a program
   */
  calculateDeploymentCost(programSize: number, isUpgradeable: boolean = true): {
    rentExemption: number
    dataFee: number
    upgradeableFee: number
    total: number
    totalSOL: number
  } {
    const rentExemption = DEPLOYMENT_COSTS.baseRent
    const dataFee = programSize * DEPLOYMENT_COSTS.perByte
    const upgradeableFee = isUpgradeable ? DEPLOYMENT_COSTS.upgradeableProgramFee : 0
    const total = rentExemption + dataFee + upgradeableFee
    
    return {
      rentExemption,
      dataFee,
      upgradeableFee,
      total,
      totalSOL: total
    }
  }

  /**
   * Generate a new program keypair
   */
  generateProgramKeypair(): Keypair {
    return Keypair.generate()
  }

  /**
   * Deploy a new program (immutable)
   */
  async deployProgram(
    programBytecode: Buffer,
    payer: PublicKey,
    config: ProgramDeploymentConfig = { programName: 'Unknown Program' }
  ): Promise<{
    transaction: Transaction
    programKeypair: Keypair
    estimatedCost: number
  }> {
    const programKeypair = config.programId ? 
      { publicKey: config.programId } as Keypair : 
      this.generateProgramKeypair()

    const programSize = programBytecode.length
    const costs = this.calculateDeploymentCost(programSize, false)

    // Calculate space needed for program account
    const space = programBytecode.length
    const lamports = await this.connection.getMinimumBalanceForRentExemption(space)

    const transaction = new Transaction()

    // Create program account
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: programKeypair.publicKey,
      lamports,
      space,
      programId: BPF_LOADER_PROGRAM_ID,
    })

    // Write program data (simplified - actual implementation needs chunking)
    const writeDataInstruction = new TransactionInstruction({
      keys: [
        { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: false },
      ],
      programId: BPF_LOADER_PROGRAM_ID,
      data: Buffer.concat([
        Buffer.from([1]), // Write instruction
        Buffer.from(new Uint32Array([0]).buffer), // Offset
        programBytecode.slice(0, Math.min(1024, programBytecode.length)) // Data chunk
      ])
    })

    // Finalize program (make executable)
    const finalizeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: payer, isSigner: true, isWritable: false },
      ],
      programId: BPF_LOADER_PROGRAM_ID,
      data: Buffer.from([2]) // Finalize instruction
    })

    transaction.add(createAccountInstruction, writeDataInstruction, finalizeInstruction)

    return {
      transaction,
      programKeypair,
      estimatedCost: costs.total
    }
  }

  /**
   * Deploy an upgradeable program
   */
  async deployUpgradeableProgram(
    programBytecode: Buffer,
    payer: PublicKey,
    upgradeAuthority: PublicKey,
    config: ProgramDeploymentConfig = { programName: 'Unknown Upgradeable Program' }
  ): Promise<{
    transaction: Transaction
    programKeypair: Keypair
    bufferKeypair: Keypair
    estimatedCost: number
  }> {
    const programKeypair = this.generateProgramKeypair()
    const bufferKeypair = Keypair.generate()
    
    const programSize = programBytecode.length
    const costs = this.calculateDeploymentCost(programSize, true)

    const transaction = new Transaction()

    // Calculate buffer account size and cost
    const bufferSpace = programSize + 37 // Program data + metadata
    const bufferLamports = await this.connection.getMinimumBalanceForRentExemption(bufferSpace)

    // Create buffer account
    const createBufferInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: bufferKeypair.publicKey,
      lamports: bufferLamports,
      space: bufferSpace,
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
    })

    // Initialize buffer (simplified)
    const initBufferInstruction = new TransactionInstruction({
      keys: [
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: upgradeAuthority, isSigner: false, isWritable: false },
      ],
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
      data: Buffer.from([0]) // Initialize buffer
    })

    // Write program data to buffer (simplified)
    const writeBufferInstruction = new TransactionInstruction({
      keys: [
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: upgradeAuthority, isSigner: true, isWritable: false },
      ],
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
      data: Buffer.concat([
        Buffer.from([1]), // Write instruction
        Buffer.from(new Uint32Array([0]).buffer), // Offset
        programBytecode.slice(0, Math.min(1024, programBytecode.length))
      ])
    })

    // Deploy with buffer
    const deployInstruction = new TransactionInstruction({
      keys: [
        { pubkey: payer, isSigner: true, isWritable: true },
        { pubkey: programKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: upgradeAuthority, isSigner: false, isWritable: false },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
      data: Buffer.from([2]) // Deploy with max data len
    })

    transaction.add(
      createBufferInstruction, 
      initBufferInstruction, 
      writeBufferInstruction, 
      deployInstruction
    )

    return {
      transaction,
      programKeypair,
      bufferKeypair,
      estimatedCost: costs.total
    }
  }

  /**
   * Upgrade an existing program
   */
  async upgradeProgram(
    params: ProgramUpgradeParams,
    newBytecode: Buffer,
    payer: PublicKey
  ): Promise<Transaction> {
    const transaction = new Transaction()

    // Create new buffer for upgrade
    const bufferKeypair = Keypair.generate()
    const bufferSpace = newBytecode.length + 37
    const bufferLamports = await this.connection.getMinimumBalanceForRentExemption(bufferSpace)

    // Create and write to buffer
    const createBufferInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: bufferKeypair.publicKey,
      lamports: bufferLamports,
      space: bufferSpace,
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
    })

    // Upgrade instruction
    const upgradeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: params.programId, isSigner: false, isWritable: true },
        { pubkey: bufferKeypair.publicKey, isSigner: false, isWritable: true },
        { pubkey: params.upgradeAuthority, isSigner: true, isWritable: false },
        { pubkey: params.spillAccount || payer, isSigner: false, isWritable: true },
      ],
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
      data: Buffer.from([3]) // Upgrade instruction
    })

    transaction.add(createBufferInstruction, upgradeInstruction)
    return transaction
  }

  /**
   * Close a program and recover rent
   */
  async closeProgram(params: ProgramCloseParams): Promise<Transaction> {
    const transaction = new Transaction()

    const closeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: params.programId, isSigner: false, isWritable: true },
        { pubkey: params.recipient, isSigner: false, isWritable: true },
        { pubkey: params.authority, isSigner: true, isWritable: false },
      ],
      programId: BPF_LOADER_UPGRADEABLE_PROGRAM_ID,
      data: Buffer.from([5]) // Close instruction
    })

    transaction.add(closeInstruction)
    return transaction
  }

  /**
   * Get program data account
   */
  async getProgramData(programId: PublicKey): Promise<ProgramData | null> {
    try {
      // Derive program data account PDA
      const [programDataAccount] = await PublicKey.findProgramAddress(
        [programId.toBuffer()],
        BPF_LOADER_UPGRADEABLE_PROGRAM_ID
      )

      const accountInfo = await this.connection.getAccountInfo(programDataAccount)
      
      if (!accountInfo) {
        return null
      }

      // Parse program data (simplified)
      const data = accountInfo.data
      const slot = data.readBigUInt64LE(0)
      
      // Check if upgrade authority exists
      const hasUpgradeAuthority = data[8] === 1
      let upgradeAuthority: PublicKey | undefined
      
      if (hasUpgradeAuthority) {
        upgradeAuthority = new PublicKey(data.slice(9, 41))
      }

      return {
        slot: Number(slot),
        upgradeAuthority,
        lastDeployedSlot: Number(slot),
        dataLen: data.length - (hasUpgradeAuthority ? 41 : 9)
      }
    } catch (error) {
      console.error('Error getting program data:', error)
      return null
    }
  }

  /**
   * Check if a program is upgradeable
   */
  async isProgramUpgradeable(programId: PublicKey): Promise<boolean> {
    const programData = await this.getProgramData(programId)
    return programData !== null && programData.upgradeAuthority !== undefined
  }

  /**
   * Deploy IDL for a program
   */
  async deployIDL(params: IDLDeploymentParams): Promise<Transaction> {
    const transaction = new Transaction()

    // Create IDL account (simplified)
    const idlAccount = Keypair.generate()
    const idlData = Buffer.from(JSON.stringify(params.idl))
    const space = idlData.length + 44 // IDL data + metadata
    const lamports = await this.connection.getMinimumBalanceForRentExemption(space)

    const createIdlAccountInstruction = SystemProgram.createAccount({
      fromPubkey: params.authority,
      newAccountPubkey: idlAccount.publicKey,
      lamports,
      space,
      programId: params.programId,
    })

    transaction.add(createIdlAccountInstruction)
    return transaction
  }

  /**
   * Get deployment statistics
   */
  getDeploymentStats(): DeploymentStats {
    const deployments = Array.from(this.deploymentHistory.values())
    
    return {
      totalDeployments: deployments.length,
      totalCost: deployments.reduce((sum, d) => sum + d.cost, 0),
      avgCost: deployments.length > 0 ? 
        deployments.reduce((sum, d) => sum + d.cost, 0) / deployments.length : 0,
      successRate: 100, // Simplified - would track actual success/failure
      lastDeployment: deployments.length > 0 ? 
        new Date(Math.max(...deployments.map(d => d.deploymentSlot))) : undefined
    }
  }

  /**
   * Validate program bytecode
   */
  validateProgramBytecode(bytecode: Buffer): {
    isValid: boolean
    size: number
    sizeCategory: string
    estimatedCost: number
    issues: string[]
  } {
    const issues: string[] = []
    const size = bytecode.length

    if (size === 0) {
      issues.push('Program bytecode is empty')
    }

    if (size > PROGRAM_SIZE_LIMITS.xlarge) {
      issues.push(`Program size (${size} bytes) exceeds maximum limit (${PROGRAM_SIZE_LIMITS.xlarge} bytes)`)
    }

    // Check for valid ELF header (simplified)
    if (size > 4 && !bytecode.slice(0, 4).equals(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))) {
      issues.push('Invalid ELF header - program may not be compiled correctly')
    }

    let sizeCategory = 'unknown'
    if (size <= PROGRAM_SIZE_LIMITS.small) sizeCategory = 'small'
    else if (size <= PROGRAM_SIZE_LIMITS.medium) sizeCategory = 'medium'
    else if (size <= PROGRAM_SIZE_LIMITS.large) sizeCategory = 'large'
    else if (size <= PROGRAM_SIZE_LIMITS.xlarge) sizeCategory = 'xlarge'

    const costs = this.calculateDeploymentCost(size, true)

    return {
      isValid: issues.length === 0,
      size,
      sizeCategory,
      estimatedCost: costs.total,
      issues
    }
  }

  /**
   * Get program size recommendations
   */
  static getSizeRecommendations(): Array<{
    category: string
    maxSize: number
    description: string
    examples: string[]
  }> {
    return [
      {
        category: 'Small',
        maxSize: PROGRAM_SIZE_LIMITS.small,
        description: 'Simple programs with basic functionality',
        examples: ['Hello World', 'Basic Counter', 'Simple Token Transfer']
      },
      {
        category: 'Medium',
        maxSize: PROGRAM_SIZE_LIMITS.medium,
        description: 'Standard programs with moderate complexity',
        examples: ['SPL Token Program', 'Basic DeFi Programs', 'NFT Programs']
      },
      {
        category: 'Large',
        maxSize: PROGRAM_SIZE_LIMITS.large,
        description: 'Complex programs with advanced features',
        examples: ['DEX Programs', 'Lending Protocols', 'Advanced DeFi']
      },
      {
        category: 'Extra Large',
        maxSize: PROGRAM_SIZE_LIMITS.xlarge,
        description: 'Very complex programs with extensive functionality',
        examples: ['Full DEX Implementations', 'Complex Protocols', 'Multi-program Systems']
      }
    ]
  }
}

export default ProgramDeploymentService