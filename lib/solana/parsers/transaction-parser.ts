import { 
  Transaction, 
  VersionedTransaction, 
  TransactionMessage,
  MessageV0,
  PublicKey,
  SystemProgram,
  ComputeBudgetProgram,
  StakeProgram,
  VoteProgram,
  Message
} from '@solana/web3.js'
import { 
  TOKEN_PROGRAM_ID, 
  TOKEN_2022_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from '@solana/spl-token'
import bs58 from 'bs58'

export interface ParsedInstruction {
  programId: string
  programName: string
  instructionType: string
  data: any
  accounts: Array<{
    pubkey: string
    isSigner: boolean
    isWritable: boolean
    name?: string
  }>
  rawData: string
}

export interface ParsedTransaction {
  signature?: string
  version: 'legacy' | 'v0'
  feePayer: string
  recentBlockhash: string
  instructions: ParsedInstruction[]
  addressLookupTables?: Array<{
    accountKey: string
    writableIndexes: number[]
    readonlyIndexes: number[]
  }>
  computeUnitLimit?: number
  computeUnitPrice?: number
  priorityFee?: number
  totalFee?: number
  accounts: Array<{
    pubkey: string
    isSigner: boolean
    isWritable: boolean
  }>
}

// Known program IDs and their names
const PROGRAM_NAMES: Record<string, string> = {
  [SystemProgram.programId.toString()]: 'System Program',
  [TOKEN_PROGRAM_ID.toString()]: 'SPL Token Program',
  [TOKEN_2022_PROGRAM_ID.toString()]: 'SPL Token-2022 Program',
  [ASSOCIATED_TOKEN_PROGRAM_ID.toString()]: 'Associated Token Program',
  [ComputeBudgetProgram.programId.toString()]: 'Compute Budget Program',
  [StakeProgram.programId.toString()]: 'Stake Program',
  [VoteProgram.programId.toString()]: 'Vote Program',
  // Jupiter
  'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4': 'Jupiter V6',
  'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB': 'Jupiter V4',
  // Orca
  'whirLbMiicVdio4qvUfM5KAg6Ct8VwpYzGff3uctyCc': 'Orca Whirlpool',
  '9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP': 'Orca Legacy',
  // Raydium
  '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8': 'Raydium AMM V4',
  'CAMMCzo5YL8w4VFF8KVHrK22GGUsp5VTaW7grrKgrWqK': 'Raydium CLMM',
  // Metaplex
  'metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s': 'Metaplex Token Metadata',
  'BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY': 'Metaplex Bubblegum',
  // Others
  'noopb9bkMVfRPU8AsbpTUg8AQkHtKwMYZiFUjNRtMmV': 'Noop Program',
  'memo1111111111111111111111111111111111111111': 'Memo Program',
  'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr': 'Memo Program V2',
}

// System Program instruction types
const SYSTEM_INSTRUCTION_TYPES: Record<number, string> = {
  0: 'CreateAccount',
  1: 'Assign',
  2: 'Transfer',
  3: 'CreateAccountWithSeed',
  4: 'AdvanceNonceAccount',
  5: 'WithdrawNonceAccount',
  6: 'InitializeNonceAccount',
  7: 'AuthorizeNonceAccount',
  8: 'Allocate',
  9: 'AllocateWithSeed',
  10: 'AssignWithSeed',
  11: 'TransferWithSeed',
  12: 'UpgradeNonceAccount'
}

// SPL Token instruction types
const TOKEN_INSTRUCTION_TYPES: Record<number, string> = {
  0: 'InitializeMint',
  1: 'InitializeAccount',
  2: 'InitializeMultisig',
  3: 'Transfer',
  4: 'Approve',
  5: 'Revoke',
  6: 'SetAuthority',
  7: 'MintTo',
  8: 'Burn',
  9: 'CloseAccount',
  10: 'FreezeAccount',
  11: 'ThawAccount',
  12: 'TransferChecked',
  13: 'ApproveChecked',
  14: 'MintToChecked',
  15: 'BurnChecked',
  16: 'InitializeAccount2',
  17: 'SyncNative',
  18: 'InitializeAccount3',
  19: 'InitializeMultisig2',
  20: 'InitializeMint2'
}

// Compute Budget instruction types
const COMPUTE_BUDGET_INSTRUCTION_TYPES: Record<number, string> = {
  0: 'RequestUnits',
  1: 'RequestHeapFrame', 
  2: 'SetComputeUnitLimit',
  3: 'SetComputeUnitPrice'
}

export class TransactionParser {
  /**
   * Parse a transaction from base58 string, Transaction object, or VersionedTransaction
   */
  static parseTransaction(input: string | Transaction | VersionedTransaction): ParsedTransaction {
    let transaction: Transaction | VersionedTransaction
    let signature: string | undefined

    if (typeof input === 'string') {
      try {
        // Try to parse as base58 encoded transaction
        const buffer = bs58.decode(input)
        transaction = VersionedTransaction.deserialize(buffer)
      } catch (error) {
        try {
          // Try legacy transaction
          const buffer = bs58.decode(input)
          transaction = Transaction.from(buffer)
        } catch (legacyError) {
          throw new Error('Invalid transaction format. Must be base58 encoded transaction.')
        }
      }
    } else {
      transaction = input
    }

    const isVersioned = transaction instanceof VersionedTransaction
    const version = isVersioned ? 'v0' : 'legacy'

    let accountKeys: PublicKey[]
    let compiledInstructions: any[]
    let recentBlockhash: string
    let header: any
    let addressLookupTables: ParsedTransaction['addressLookupTables'] = undefined

    if (isVersioned) {
      const versionedTx = transaction as VersionedTransaction
      const message = versionedTx.message as MessageV0
      
      // For versioned transactions, we need to get static account keys
      accountKeys = message.staticAccountKeys
      compiledInstructions = message.compiledInstructions
      recentBlockhash = message.recentBlockhash
      header = message.header
      
      if (message.addressTableLookups && message.addressTableLookups.length > 0) {
        addressLookupTables = message.addressTableLookups.map((lookup: any) => ({
          accountKey: lookup.accountKey.toString(),
          writableIndexes: Array.from(lookup.writableIndexes),
          readonlyIndexes: Array.from(lookup.readonlyIndexes)
        }))
      }
    } else {
      const legacyTx = transaction as Transaction
      const message = legacyTx.compileMessage()
      accountKeys = message.accountKeys
      compiledInstructions = message.instructions
      recentBlockhash = message.recentBlockhash
      header = message.header
    }

    // Parse accounts
    const accounts = accountKeys.map((key: PublicKey, index: number) => ({
      pubkey: key.toString(),
      isSigner: index < header.numRequiredSignatures,
      isWritable: index < header.numRequiredSignatures - header.numReadonlySignedAccounts ||
                 (index >= header.numRequiredSignatures && 
                  index < accountKeys.length - header.numReadonlyUnsignedAccounts)
    }))

    // Parse instructions
    const instructions = compiledInstructions.map((instruction: any, index: number) => 
      this.parseInstruction(instruction, accounts, index)
    )

    // Extract compute budget info
    const computeBudgetInfo = this.extractComputeBudgetInfo(instructions)

    return {
      signature,
      version,
      feePayer: accountKeys[0].toString(),
      recentBlockhash,
      instructions,
      addressLookupTables,
      accounts,
      ...computeBudgetInfo
    }
  }

  /**
   * Parse individual instruction
   */
  private static parseInstruction(
    instruction: any, 
    accounts: Array<{ pubkey: string; isSigner: boolean; isWritable: boolean }>,
    index: number
  ): ParsedInstruction {
    const programId = accounts[instruction.programIdIndex].pubkey
    const programName = PROGRAM_NAMES[programId] || 'Unknown Program'
    
    const instructionAccounts = instruction.accounts.map((accountIndex: number) => ({
      ...accounts[accountIndex],
      name: this.getAccountName(accounts[accountIndex].pubkey, programId)
    }))

    const rawData = bs58.encode(instruction.data)
    
    // Parse instruction data based on program
    const parsed = this.parseInstructionData(programId, instruction.data, instructionAccounts)

    return {
      programId,
      programName,
      instructionType: parsed.instructionType,
      data: parsed.data,
      accounts: instructionAccounts,
      rawData
    }
  }

  /**
   * Parse instruction data based on program type
   */
  private static parseInstructionData(
    programId: string, 
    data: Uint8Array, 
    accounts: any[]
  ): { instructionType: string; data: any } {
    if (data.length === 0) {
      return { instructionType: 'Unknown', data: {} }
    }

    const instructionType = data[0]

    switch (programId) {
      case SystemProgram.programId.toString():
        return this.parseSystemInstruction(instructionType, data, accounts)
        
      case TOKEN_PROGRAM_ID.toString():
      case TOKEN_2022_PROGRAM_ID.toString():
        return this.parseTokenInstruction(instructionType, data, accounts)
        
      case ComputeBudgetProgram.programId.toString():
        return this.parseComputeBudgetInstruction(instructionType, data)
        
      default:
        return { 
          instructionType: 'Unknown', 
          data: { 
            hex: Buffer.from(data).toString('hex'),
            instruction: instructionType 
          } 
        }
    }
  }

  /**
   * Parse System Program instructions
   */
  private static parseSystemInstruction(
    instructionType: number, 
    data: Uint8Array, 
    accounts: any[]
  ): { instructionType: string; data: any } {
    const type = SYSTEM_INSTRUCTION_TYPES[instructionType] || 'Unknown'
    
    switch (instructionType) {
      case 2: // Transfer
        if (data.length >= 12) {
          const lamports = new DataView(data.buffer, data.byteOffset + 4, 8).getBigUint64(0, true)
          return {
            instructionType: type,
            data: {
              from: accounts[0]?.pubkey,
              to: accounts[1]?.pubkey,
              lamports: lamports.toString(),
              sol: Number(lamports) / 1e9
            }
          }
        }
        break
        
      case 0: // CreateAccount
        if (data.length >= 52) {
          const view = new DataView(data.buffer, data.byteOffset + 4)
          const lamports = view.getBigUint64(0, true)
          const space = view.getBigUint64(8, true)
          const owner = new PublicKey(data.slice(20, 52))
          
          return {
            instructionType: type,
            data: {
              from: accounts[0]?.pubkey,
              newAccount: accounts[1]?.pubkey,
              lamports: lamports.toString(),
              space: space.toString(),
              owner: owner.toString()
            }
          }
        }
        break
    }

    return { instructionType: type, data: {} }
  }

  /**
   * Parse SPL Token instructions
   */
  private static parseTokenInstruction(
    instructionType: number, 
    data: Uint8Array, 
    accounts: any[]
  ): { instructionType: string; data: any } {
    const type = TOKEN_INSTRUCTION_TYPES[instructionType] || 'Unknown'
    
    switch (instructionType) {
      case 3: // Transfer
      case 12: // TransferChecked
        if (data.length >= 9) {
          const amount = new DataView(data.buffer, data.byteOffset + 1, 8).getBigUint64(0, true)
          return {
            instructionType: type,
            data: {
              source: accounts[0]?.pubkey,
              destination: accounts[1]?.pubkey,
              authority: accounts[2]?.pubkey,
              amount: amount.toString()
            }
          }
        }
        break
        
      case 7: // MintTo
      case 14: // MintToChecked
        if (data.length >= 9) {
          const amount = new DataView(data.buffer, data.byteOffset + 1, 8).getBigUint64(0, true)
          return {
            instructionType: type,
            data: {
              mint: accounts[0]?.pubkey,
              account: accounts[1]?.pubkey,
              authority: accounts[2]?.pubkey,
              amount: amount.toString()
            }
          }
        }
        break
        
      case 8: // Burn
      case 15: // BurnChecked
        if (data.length >= 9) {
          const amount = new DataView(data.buffer, data.byteOffset + 1, 8).getBigUint64(0, true)
          return {
            instructionType: type,
            data: {
              account: accounts[0]?.pubkey,
              mint: accounts[1]?.pubkey,
              authority: accounts[2]?.pubkey,
              amount: amount.toString()
            }
          }
        }
        break
    }

    return { instructionType: type, data: {} }
  }

  /**
   * Parse Compute Budget instructions
   */
  private static parseComputeBudgetInstruction(
    instructionType: number, 
    data: Uint8Array
  ): { instructionType: string; data: any } {
    const type = COMPUTE_BUDGET_INSTRUCTION_TYPES[instructionType] || 'Unknown'
    
    switch (instructionType) {
      case 2: // SetComputeUnitLimit
        if (data.length >= 5) {
          const units = new DataView(data.buffer, data.byteOffset + 1, 4).getUint32(0, true)
          return {
            instructionType: type,
            data: { computeUnitLimit: units }
          }
        }
        break
        
      case 3: // SetComputeUnitPrice
        if (data.length >= 9) {
          const microLamports = new DataView(data.buffer, data.byteOffset + 1, 8).getBigUint64(0, true)
          return {
            instructionType: type,
            data: { 
              computeUnitPrice: microLamports.toString(),
              microLamports: Number(microLamports)
            }
          }
        }
        break
    }

    return { instructionType: type, data: {} }
  }

  /**
   * Get account name/role based on context
   */
  private static getAccountName(pubkey: string, programId: string): string | undefined {
    // Common known addresses
    const knownAddresses: Record<string, string> = {
      '11111111111111111111111111111111': 'System Program',
      'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA': 'Token Program',
      'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb': 'Token-2022 Program',
      'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL': 'Associated Token Program',
    }

    return knownAddresses[pubkey]
  }

  /**
   * Extract compute budget information from instructions
   */
  private static extractComputeBudgetInfo(instructions: ParsedInstruction[]) {
    let computeUnitLimit: number | undefined
    let computeUnitPrice: number | undefined
    let priorityFee: number | undefined

    for (const instruction of instructions) {
      if (instruction.programId === ComputeBudgetProgram.programId.toString()) {
        if (instruction.instructionType === 'SetComputeUnitLimit') {
          computeUnitLimit = instruction.data.computeUnitLimit
        } else if (instruction.instructionType === 'SetComputeUnitPrice') {
          computeUnitPrice = instruction.data.microLamports
        }
      }
    }

    if (computeUnitLimit && computeUnitPrice) {
      priorityFee = (computeUnitLimit * computeUnitPrice) / 1e6
    }

    return {
      computeUnitLimit,
      computeUnitPrice,
      priorityFee
    }
  }

  /**
   * Format parsed transaction as human-readable text
   */
  static formatParsedTransaction(parsed: ParsedTransaction): string {
    let output = `Transaction Details:\n`
    output += `==================\n`
    output += `Version: ${parsed.version}\n`
    output += `Fee Payer: ${parsed.feePayer}\n`
    output += `Recent Blockhash: ${parsed.recentBlockhash}\n`
    
    if (parsed.computeUnitLimit) {
      output += `Compute Unit Limit: ${parsed.computeUnitLimit.toLocaleString()}\n`
    }
    if (parsed.computeUnitPrice) {
      output += `Compute Unit Price: ${parsed.computeUnitPrice} microLamports\n`
    }
    if (parsed.priorityFee) {
      output += `Priority Fee: ${parsed.priorityFee} SOL\n`
    }

    output += `\nInstructions (${parsed.instructions.length}):\n`
    output += `========================\n`

    parsed.instructions.forEach((instruction, index) => {
      output += `\n${index + 1}. ${instruction.programName}\n`
      output += `   Type: ${instruction.instructionType}\n`
      output += `   Program ID: ${instruction.programId}\n`
      
      if (Object.keys(instruction.data).length > 0) {
        output += `   Data:\n`
        Object.entries(instruction.data).forEach(([key, value]) => {
          output += `     ${key}: ${value}\n`
        })
      }

      if (instruction.accounts.length > 0) {
        output += `   Accounts:\n`
        instruction.accounts.forEach((account, i) => {
          const flags = []
          if (account.isSigner) flags.push('signer')
          if (account.isWritable) flags.push('writable')
          const flagStr = flags.length > 0 ? ` [${flags.join(', ')}]` : ''
          const name = account.name ? ` (${account.name})` : ''
          output += `     ${i}: ${account.pubkey}${name}${flagStr}\n`
        })
      }
    })

    if (parsed.addressLookupTables && parsed.addressLookupTables.length > 0) {
      output += `\nAddress Lookup Tables:\n`
      output += `=====================\n`
      parsed.addressLookupTables.forEach((alt, index) => {
        output += `${index + 1}. ${alt.accountKey}\n`
        output += `   Writable Indexes: [${alt.writableIndexes.join(', ')}]\n`
        output += `   Readonly Indexes: [${alt.readonlyIndexes.join(', ')}]\n`
      })
    }

    return output
  }
}