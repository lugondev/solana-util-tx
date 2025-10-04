import { Connection, PublicKey, AccountInfo, ParsedAccountData } from '@solana/web3.js'
import { BorshCoder, Idl, Program } from '@coral-xyz/anchor'

export interface ProgramInfo {
  programId: string
  executable: boolean
  owner: string
  lamports: number
  dataLength: number
  programData?: {
    slot: number
    authority?: string
    lastModified?: number
  }
  idl?: Idl
  type: 'native' | 'bpf' | 'anchor' | 'unknown'
  isUpgradeable: boolean
}

export interface ProgramInstruction {
  name: string
  accounts: Array<{
    name: string
    isMut: boolean
    isSigner: boolean
    docs?: string[]
  }>
  args: Array<{
    name: string
    type: string
    docs?: string[]
  }>
  docs?: string[]
}

export interface IdlMetadata {
  name: string
  version: string
  description?: string
  instructions: ProgramInstruction[]
  accounts: Array<{
    name: string
    type: any
    docs?: string[]
  }>
  types?: Array<{
    name: string
    type: any
    docs?: string[]
  }>
  events?: Array<{
    name: string
    fields: any[]
    docs?: string[]
  }>
  errors?: Array<{
    code: number
    name: string
    msg?: string
  }>
  constants?: Array<{
    name: string
    type: string
    value: any
  }>
}

export class ProgramService {
  private connection: Connection
  private knownIdls: Map<string, Idl> = new Map()
  
  // Well-known program addresses and their types
  private readonly KNOWN_PROGRAMS = new Map([
    ['11111111111111111111111111111112', { name: 'System Program', type: 'native' }],
    ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', { name: 'SPL Token Program', type: 'native' }],
    ['ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', { name: 'SPL Associated Token Account', type: 'native' }],
    ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', { name: 'Raydium AMM V4', type: 'bpf' }],
    ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', { name: 'Raydium Pool V4', type: 'bpf' }],
    ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', { name: 'Jupiter V6', type: 'anchor' }],
    ['whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc', { name: 'Orca Whirlpool', type: 'anchor' }],
  ])

  constructor(connection: Connection) {
    this.connection = connection
  }

  async getProgramInfo(programId: string): Promise<ProgramInfo> {
    try {
      const pubkey = new PublicKey(programId)
      const accountInfo = await this.connection.getAccountInfo(pubkey)
      
      if (!accountInfo) {
        throw new Error('Program not found')
      }

      const isUpgradeable = this.isUpgradeableProgram(accountInfo)
      const programType = this.determineProgramType(programId, accountInfo)
      
      let programData: ProgramInfo['programData']
      
      if (isUpgradeable) {
        programData = await this.getUpgradeableProgramData(programId)
      }

      const knownProgram = this.KNOWN_PROGRAMS.get(programId)
      
      return {
        programId,
        executable: accountInfo.executable,
        owner: accountInfo.owner.toBase58(),
        lamports: accountInfo.lamports,
        dataLength: accountInfo.data.length,
        programData,
        type: knownProgram?.type as any || programType,
        isUpgradeable,
      }
    } catch (error) {
      console.error('Error fetching program info:', error)
      throw error
    }
  }

  async searchProgramsByOwner(ownerId: string): Promise<Array<{address: string, info: ProgramInfo}>> {
    try {
      const owner = new PublicKey(ownerId)
      const accounts = await this.connection.getProgramAccounts(owner, {
        filters: [
          {
            memcmp: {
              offset: 0,
              bytes: ownerId,
            },
          },
        ],
      })

      const programs: Array<{address: string, info: ProgramInfo}> = []
      
      for (const account of accounts.slice(0, 10)) { // Limit to 10 results
        try {
          const info = await this.getProgramInfo(account.pubkey.toBase58())
          programs.push({
            address: account.pubkey.toBase58(),
            info
          })
        } catch (error) {
          console.warn(`Failed to fetch info for program ${account.pubkey.toBase58()}:`, error)
        }
      }

      return programs
    } catch (error) {
      console.error('Error searching programs:', error)
      throw error
    }
  }

  async tryDiscoverIdl(programId: string): Promise<IdlMetadata | null> {
    try {
      // Check if we have cached IDL
      if (this.knownIdls.has(programId)) {
        const idl = this.knownIdls.get(programId)!
        return this.parseIdlToMetadata(idl)
      }

      // Try to fetch IDL from common locations
      const idl = await this.fetchIdlFromSources(programId)
      if (idl) {
        this.knownIdls.set(programId, idl)
        return this.parseIdlToMetadata(idl)
      }

      return null
    } catch (error) {
      console.warn('Could not discover IDL:', error)
      return null
    }
  }

  async validateProgram(programId: string): Promise<{
    isValid: boolean
    exists: boolean
    executable: boolean
    issues: string[]
  }> {
    const issues: string[] = []
    
    try {
      const pubkey = new PublicKey(programId)
      const accountInfo = await this.connection.getAccountInfo(pubkey)
      
      if (!accountInfo) {
        return {
          isValid: false,
          exists: false,
          executable: false,
          issues: ['Program account does not exist']
        }
      }

      if (!accountInfo.executable) {
        issues.push('Account is not executable (not a program)')
      }

      if (accountInfo.lamports === 0) {
        issues.push('Program account has no SOL balance')
      }

      if (accountInfo.data.length === 0) {
        issues.push('Program has no data')
      }

      // Check if program is owned by BPF Loader
      const bpfLoaders = [
        'BPFLoaderUpgradeab1e11111111111111111111111',
        'BPFLoader2111111111111111111111111111111111',
        'BPFLoader1111111111111111111111111111111111'
      ]
      
      if (!bpfLoaders.includes(accountInfo.owner.toBase58()) && 
          accountInfo.owner.toBase58() !== 'NativeLoader1111111111111111111111111111111') {
        issues.push(`Unexpected program owner: ${accountInfo.owner.toBase58()}`)
      }

      return {
        isValid: issues.length === 0,
        exists: true,
        executable: accountInfo.executable,
        issues
      }
    } catch (error) {
      return {
        isValid: false,
        exists: false,
        executable: false,
        issues: [`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`]
      }
    }
  }

  getKnownPrograms(): Array<{id: string, name: string, type: string}> {
    return Array.from(this.KNOWN_PROGRAMS.entries()).map(([id, info]) => ({
      id,
      name: info.name,
      type: info.type
    }))
  }

  private isUpgradeableProgram(accountInfo: AccountInfo<Buffer>): boolean {
    return accountInfo.owner.toBase58() === 'BPFLoaderUpgradeab1e11111111111111111111111'
  }

  private determineProgramType(programId: string, accountInfo: AccountInfo<Buffer>): 'native' | 'bpf' | 'anchor' | 'unknown' {
    const owner = accountInfo.owner.toBase58()
    
    if (owner === 'NativeLoader1111111111111111111111111111111') {
      return 'native'
    }
    
    if (owner.includes('BPFLoader')) {
      // Try to determine if it's Anchor by looking for common patterns
      if (this.KNOWN_PROGRAMS.get(programId)?.type === 'anchor') {
        return 'anchor'
      }
      return 'bpf'
    }
    
    return 'unknown'
  }

  private async getUpgradeableProgramData(programId: string): Promise<ProgramInfo['programData']> {
    try {
      // For upgradeable programs, the program account points to program data
      const programAccount = await this.connection.getAccountInfo(new PublicKey(programId))
      
      if (programAccount && programAccount.data.length >= 4) {
        // Parse program data account address (first 32 bytes after 4-byte discriminator)
        const programDataAddress = new PublicKey(programAccount.data.slice(4, 36))
        const programDataAccount = await this.connection.getAccountInfo(programDataAddress)
        
        if (programDataAccount) {
          return {
            slot: programDataAccount.data.readBigUInt64LE(0).toString() as any,
            authority: programDataAccount.data.length >= 45 ? 
              new PublicKey(programDataAccount.data.slice(13, 45)).toBase58() : undefined,
            lastModified: Date.now() - (Math.random() * 86400000) // Mock last modified time
          }
        }
      }
      
      return undefined
    } catch (error) {
      console.warn('Could not fetch program data:', error)
      return undefined
    }
  }

  private async fetchIdlFromSources(programId: string): Promise<Idl | null> {
    // This is a simplified implementation
    // In a real app, you would:
    // 1. Check program data account for IDL
    // 2. Query known IDL registries
    // 3. Try to fetch from GitHub/CDN
    
    // For now, return null - would need actual IDL fetching logic
    return null
  }

  private parseIdlToMetadata(idl: Idl): IdlMetadata {
    return {
      name: (idl as any).name || 'Unknown Program',
      version: (idl as any).version || '0.1.0',
      description: (idl as any).metadata?.description,
      instructions: idl.instructions.map(ix => ({
        name: ix.name,
        accounts: ix.accounts.map((acc: any) => ({
          name: acc.name,
          isMut: acc.isMut || false,
          isSigner: acc.isSigner || false,
          docs: acc.docs
        })),
        args: ix.args.map(arg => ({
          name: arg.name,
          type: typeof arg.type === 'string' ? arg.type : JSON.stringify(arg.type),
          docs: (arg as any).docs
        })),
        docs: (ix as any).docs
      })),
      accounts: (idl as any).accounts?.map((acc: any) => ({
        name: acc.name,
        type: acc.type,
        docs: acc.docs
      })) || [],
      types: (idl as any).types?.map((type: any) => ({
        name: type.name,
        type: type.type,
        docs: type.docs
      })) || [],
      events: (idl as any).events?.map((event: any) => ({
        name: event.name,
        fields: event.fields,
        docs: event.docs
      })) || [],
      errors: (idl as any).errors?.map((error: any) => ({
        code: error.code,
        name: error.name,
        msg: error.msg
      })) || [],
      constants: (idl as any).constants?.map((constant: any) => ({
        name: constant.name,
        type: typeof constant.type === 'string' ? constant.type : JSON.stringify(constant.type),
        value: constant.value
      })) || []
    }
  }

  // Utility method to check if a string is a valid public key
  static isValidPublicKey(address: string): boolean {
    try {
      new PublicKey(address)
      return true
    } catch {
      return false
    }
  }

  // Get program deployment cost estimate
  static estimateDeploymentCost(bytecodeSize: number): {
    minBalance: number
    deploymentFee: number
    total: number
  } {
    // These are rough estimates based on Solana's rent and deployment costs
    const rentExemptMinimum = 0.00203928 // SOL for rent exemption
    const deploymentFeePerByte = 0.000005 // SOL per byte
    
    const deploymentFee = bytecodeSize * deploymentFeePerByte
    const total = rentExemptMinimum + deploymentFee
    
    return {
      minBalance: rentExemptMinimum,
      deploymentFee,
      total
    }
  }
}