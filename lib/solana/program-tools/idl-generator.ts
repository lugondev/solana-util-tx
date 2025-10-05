import { Connection, PublicKey } from '@solana/web3.js'
import { Program, AnchorProvider, Idl } from '@coral-xyz/anchor'

export interface IDLInfo {
  programId: string
  idl: Idl | null
  programName?: string
  version?: string
  instructions: IDLInstruction[]
  accounts: IDLAccount[]
  types: IDLType[]
  errors: IDLError[]
  metadata?: {
    repository?: string
    contact?: string
    description?: string
  }
}

export interface IDLInstruction {
  name: string
  discriminator?: number[]
  accounts: {
    name: string
    isMut: boolean
    isSigner: boolean
    docs?: string[]
    optional?: boolean
  }[]
  args: {
    name: string
    type: string
    docs?: string[]
  }[]
  docs?: string[]
}

export interface IDLAccount {
  name: string
  type: {
    kind: string
    fields?: {
      name: string
      type: string
      docs?: string[]
    }[]
  }
  docs?: string[]
}

export interface IDLType {
  name: string
  type: {
    kind: string
    fields?: {
      name: string
      type: string
      docs?: string[]
    }[]
    variants?: {
      name: string
      fields?: {
        name: string
        type: string
      }[]
    }[]
  }
  docs?: string[]
}

export interface IDLError {
  code: number
  name: string
  msg?: string
}

export interface IDLGenerationOptions {
  includeMetadata: boolean
  generateTypeScript: boolean
  includeComments: boolean
  formatOutput: boolean
}

export class IDLGenerator {
  private connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Extract IDL from a deployed program
   */
  async extractIDL(programId: string): Promise<IDLInfo> {
    try {
      const programPubkey = new PublicKey(programId)
      
      // Try to fetch IDL from program account
      const idl = await this.fetchIDLFromProgram(programPubkey)
      
      // If no IDL found, try to reverse engineer basic structure
      if (!idl) {
        return await this.reverseEngineerProgram(programPubkey)
      }

      return this.parseIDL(programId, idl)
    } catch (error) {
      throw new Error(`Failed to extract IDL: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Try to fetch IDL from program account data
   */
  private async fetchIDLFromProgram(programId: PublicKey): Promise<Idl | null> {
    try {
      // Check if program has IDL account
      const idlAddress = this.getIDLAddress(programId)
      const accountInfo = await this.connection.getAccountInfo(idlAddress)
      
      if (!accountInfo) {
        return null
      }

      // Try to parse IDL from account data
      return this.parseIDLFromAccountData(accountInfo.data)
    } catch (error) {
      console.warn('Could not fetch IDL from program:', error)
      return null
    }
  }

  /**
   * Get IDL account address for a program
   */
  private getIDLAddress(programId: PublicKey): PublicKey {
    const [idlAddress] = PublicKey.findProgramAddressSync(
      [Buffer.from('anchor:idl'), programId.toBuffer()],
      programId
    )
    return idlAddress
  }

  /**
   * Parse IDL from account data
   */
  private parseIDLFromAccountData(data: Buffer): Idl | null {
    try {
      // Skip account discriminator (8 bytes)
      const idlData = data.slice(8)
      
      // Decompress if needed (Anchor uses zlib compression)
      const decompressed = this.decompressData(idlData)
      
      // Parse JSON
      const idl = JSON.parse(decompressed.toString())
      
      // Validate IDL structure
      if (this.validateIDL(idl)) {
        return idl as Idl
      }
      
      return null
    } catch (error) {
      console.warn('Failed to parse IDL from account data:', error)
      return null
    }
  }

  /**
   * Decompress data (basic implementation)
   */
  private decompressData(data: Buffer): Buffer {
    try {
      // Try to decompress using zlib
      const zlib = require('zlib')
      return zlib.inflateSync(data)
    } catch (error) {
      // If decompression fails, return original data
      return data
    }
  }

  /**
   * Validate IDL structure
   */
  private validateIDL(idl: any): boolean {
    return (
      idl &&
      typeof idl === 'object' &&
      typeof idl.name === 'string' &&
      Array.isArray(idl.instructions) &&
      Array.isArray(idl.accounts)
    )
  }

  /**
   * Reverse engineer program structure when no IDL is available
   */
  private async reverseEngineerProgram(programId: PublicKey): Promise<IDLInfo> {
    // Get program account info
    const programInfo = await this.connection.getAccountInfo(programId)
    
    if (!programInfo) {
      throw new Error('Program not found')
    }

    // Analyze program data to extract what we can
    const info: IDLInfo = {
      programId: programId.toString(),
      idl: null,
      programName: 'Unknown Program',
      instructions: [],
      accounts: [],
      types: [],
      errors: [],
      metadata: {
        description: 'Reverse engineered program (no IDL available)'
      }
    }

    // Try to identify common program patterns
    await this.analyzeKnownPrograms(programId, info)

    return info
  }

  /**
   * Analyze known program patterns
   */
  private async analyzeKnownPrograms(programId: PublicKey, info: IDLInfo): Promise<void> {
    const programIdStr = programId.toString()
    
    // Known program patterns
    const knownPrograms: Record<string, Partial<IDLInfo>> = {
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': {
        programName: 'SPL Token Program',
        instructions: [
          {
            name: 'initializeMint',
            accounts: [],
            args: [
              { name: 'decimals', type: 'u8' },
              { name: 'mintAuthority', type: 'publicKey' },
              { name: 'freezeAuthority', type: 'publicKey' }
            ]
          },
          {
            name: 'transfer',
            accounts: [],
            args: [
              { name: 'amount', type: 'u64' }
            ]
          }
        ]
      },
      '11111111111111111111111111111111': {
        programName: 'System Program',
        instructions: [
          {
            name: 'createAccount',
            accounts: [],
            args: [
              { name: 'lamports', type: 'u64' },
              { name: 'space', type: 'u64' },
              { name: 'owner', type: 'publicKey' }
            ]
          },
          {
            name: 'transfer',
            accounts: [],
            args: [
              { name: 'lamports', type: 'u64' }
            ]
          }
        ]
      }
    }

    if (knownPrograms[programIdStr]) {
      Object.assign(info, knownPrograms[programIdStr])
    }
  }

  /**
   * Parse full IDL structure
   */
  private parseIDL(programId: string, idl: Idl): IDLInfo {
    return {
      programId,
      idl,
      programName: (idl as any).name || 'Unknown Program',
      version: (idl as any).version,
      instructions: this.parseInstructions((idl as any).instructions || []),
      accounts: this.parseAccounts((idl as any).accounts || []),
      types: this.parseTypes((idl as any).types || []),
      errors: this.parseErrors((idl as any).errors || []),
      metadata: (idl as any).metadata ? {
        repository: (idl as any).metadata.repository,
        contact: (idl as any).metadata.contact,
        description: (idl as any).metadata.description
      } : undefined
    }
  }

  /**
   * Parse instructions from IDL
   */
  private parseInstructions(instructions: any[]): IDLInstruction[] {
    return instructions.map(ix => ({
      name: ix.name,
      discriminator: ix.discriminator,
      accounts: (ix.accounts || []).map((acc: any) => ({
        name: acc.name,
        isMut: acc.isMut,
        isSigner: acc.isSigner,
        docs: acc.docs,
        optional: acc.optional
      })),
      args: (ix.args || []).map((arg: any) => ({
        name: arg.name,
        type: this.formatType(arg.type),
        docs: arg.docs
      })),
      docs: ix.docs
    }))
  }

  /**
   * Parse accounts from IDL
   */
  private parseAccounts(accounts: any[]): IDLAccount[] {
    return accounts.map(acc => ({
      name: acc.name,
      type: {
        kind: acc.type.kind,
        fields: acc.type.fields?.map((field: any) => ({
          name: field.name,
          type: this.formatType(field.type),
          docs: field.docs
        }))
      },
      docs: acc.docs
    }))
  }

  /**
   * Parse types from IDL
   */
  private parseTypes(types: any[]): IDLType[] {
    return types.map(type => ({
      name: type.name,
      type: {
        kind: type.type.kind,
        fields: type.type.fields?.map((field: any) => ({
          name: field.name,
          type: this.formatType(field.type),
          docs: field.docs
        })),
        variants: type.type.variants?.map((variant: any) => ({
          name: variant.name,
          fields: variant.fields?.map((field: any) => ({
            name: field.name,
            type: this.formatType(field.type)
          }))
        }))
      },
      docs: type.docs
    }))
  }

  /**
   * Parse errors from IDL
   */
  private parseErrors(errors: any[]): IDLError[] {
    return errors.map(err => ({
      code: err.code,
      name: err.name,
      msg: err.msg
    }))
  }

  /**
   * Format type information
   */
  private formatType(type: any): string {
    if (typeof type === 'string') {
      return type
    }
    
    if (type.vec) {
      return `Vec<${this.formatType(type.vec)}>`
    }
    
    if (type.option) {
      return `Option<${this.formatType(type.option)}>`
    }
    
    if (type.array) {
      return `[${this.formatType(type.array[0])}; ${type.array[1]}]`
    }
    
    if (type.defined) {
      return type.defined
    }
    
    return JSON.stringify(type)
  }

  /**
   * Generate TypeScript interfaces from IDL
   */
  generateTypeScript(idlInfo: IDLInfo, options: IDLGenerationOptions = {
    includeMetadata: true,
    generateTypeScript: true,
    includeComments: true,
    formatOutput: true
  }): string {
    let output = ''

    // Add file header
    if (options.includeComments) {
      output += `/**\n * Generated TypeScript interfaces for ${idlInfo.programName || 'Unknown Program'}\n`
      output += ` * Program ID: ${idlInfo.programId}\n`
      if (idlInfo.version) {
        output += ` * Version: ${idlInfo.version}\n`
      }
      output += ` * Generated on: ${new Date().toISOString()}\n */\n\n`
    }

    // Add imports
    output += `import { PublicKey } from '@solana/web3.js'\nimport { BN } from '@coral-xyz/anchor'\n\n`

    // Generate type definitions
    if (idlInfo.types.length > 0) {
      output += '// Type Definitions\n'
      idlInfo.types.forEach(type => {
        if (options.includeComments && type.docs) {
          output += `/**\n${type.docs.map(doc => ` * ${doc}`).join('\n')}\n */\n`
        }
        
        if (type.type.kind === 'struct') {
          output += `export interface ${type.name} {\n`
          type.type.fields?.forEach(field => {
            if (options.includeComments && field.docs) {
              output += `  /** ${field.docs.join(' ')} */\n`
            }
            output += `  ${field.name}: ${this.toTypeScriptType(field.type)}\n`
          })
          output += '}\n\n'
        } else if (type.type.kind === 'enum') {
          output += `export enum ${type.name} {\n`
          type.type.variants?.forEach(variant => {
            output += `  ${variant.name},\n`
          })
          output += '}\n\n'
        }
      })
    }

    // Generate account interfaces
    if (idlInfo.accounts.length > 0) {
      output += '// Account Interfaces\n'
      idlInfo.accounts.forEach(account => {
        if (options.includeComments && account.docs) {
          output += `/**\n${account.docs.map(doc => ` * ${doc}`).join('\n')}\n */\n`
        }
        
        output += `export interface ${account.name} {\n`
        account.type.fields?.forEach(field => {
          if (options.includeComments && field.docs) {
            output += `  /** ${field.docs.join(' ')} */\n`
          }
          output += `  ${field.name}: ${this.toTypeScriptType(field.type)}\n`
        })
        output += '}\n\n'
      })
    }

    // Generate instruction interfaces
    if (idlInfo.instructions.length > 0) {
      output += '// Instruction Interfaces\n'
      idlInfo.instructions.forEach(instruction => {
        if (options.includeComments && instruction.docs) {
          output += `/**\n${instruction.docs.map(doc => ` * ${doc}`).join('\n')}\n */\n`
        }
        
        // Args interface
        if (instruction.args.length > 0) {
          output += `export interface ${this.capitalizeFirst(instruction.name)}Args {\n`
          instruction.args.forEach(arg => {
            if (options.includeComments && arg.docs) {
              output += `  /** ${arg.docs.join(' ')} */\n`
            }
            output += `  ${arg.name}: ${this.toTypeScriptType(arg.type)}\n`
          })
          output += '}\n\n'
        }

        // Accounts interface
        if (instruction.accounts.length > 0) {
          output += `export interface ${this.capitalizeFirst(instruction.name)}Accounts {\n`
          instruction.accounts.forEach(account => {
            if (options.includeComments && account.docs) {
              output += `  /** ${account.docs.join(' ')} */\n`
            }
            const optional = account.optional ? '?' : ''
            output += `  ${account.name}${optional}: PublicKey\n`
          })
          output += '}\n\n'
        }
      })
    }

    return output
  }

  /**
   * Convert IDL types to TypeScript types
   */
  private toTypeScriptType(type: string): string {
    const typeMap: Record<string, string> = {
      'bool': 'boolean',
      'u8': 'number',
      'i8': 'number',
      'u16': 'number',
      'i16': 'number',
      'u32': 'number',
      'i32': 'number',
      'u64': 'BN',
      'i64': 'BN',
      'u128': 'BN',
      'i128': 'BN',
      'f32': 'number',
      'f64': 'number',
      'string': 'string',
      'publicKey': 'PublicKey',
      'bytes': 'Buffer'
    }

    // Handle basic types
    if (typeMap[type]) {
      return typeMap[type]
    }

    // Handle Vec<T>
    if (type.startsWith('Vec<')) {
      const innerType = type.slice(4, -1)
      return `${this.toTypeScriptType(innerType)}[]`
    }

    // Handle Option<T>
    if (type.startsWith('Option<')) {
      const innerType = type.slice(7, -1)
      return `${this.toTypeScriptType(innerType)} | null`
    }

    // Handle arrays [T; N]
    if (type.match(/^\[.+;\s*\d+\]$/)) {
      const innerType = type.split(';')[0].slice(1).trim()
      return `${this.toTypeScriptType(innerType)}[]`
    }

    // Default to the type as-is (likely a custom type)
    return type
  }

  /**
   * Capitalize first letter
   */
  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  /**
   * Format IDL as JSON
   */
  formatAsJSON(idlInfo: IDLInfo, pretty = true): string {
    const data = {
      programId: idlInfo.programId,
      programName: idlInfo.programName,
      version: idlInfo.version,
      idl: idlInfo.idl,
      instructions: idlInfo.instructions,
      accounts: idlInfo.accounts,
      types: idlInfo.types,
      errors: idlInfo.errors,
      metadata: idlInfo.metadata
    }

    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
  }
}