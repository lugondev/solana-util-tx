import { Connection, PublicKey, AccountInfo } from '@solana/web3.js'
import { Buffer } from 'buffer'

export interface TokenExtension {
  name: string
  identifier: number
  size: number
  description: string
  isRequired: boolean
  data?: any
}

export interface Token2022Account {
  mint: string
  owner: string
  amount: bigint
  delegate?: string
  state: 'uninitialized' | 'initialized' | 'frozen'
  isNative?: boolean
  delegatedAmount: bigint
  closeAuthority?: string
  extensions: TokenExtension[]
}

export interface Token2022Mint {
  mintAuthority?: string
  supply: bigint
  decimals: number
  isInitialized: boolean
  freezeAuthority?: string
  extensions: TokenExtension[]
}

export interface ExtensionConfig {
  transferFeeConfig?: {
    transferFeeBasisPoints: number
    maximumFee: bigint
    withdrawWithheldAuthority?: string
    withdrawalWithheldAmount: bigint
    harvestWithheldAmount: bigint
  }
  confidentialTransfer?: {
    authority?: string
    autoApproveNewAccounts: boolean
    auditorElgamalPubkey?: string
  }
  defaultAccountState?: {
    state: 'initialized' | 'frozen'
  }
  immutableOwner?: boolean
  memoTransfer?: {
    requireIncomingTransferMemos: boolean
  }
  nonTransferable?: boolean
  interestBearingConfig?: {
    rateAuthority?: string
    initializationTimestamp: number
    preUpdateAverageRate: number
    lastUpdateTimestamp: number
    currentRate: number
  }
  permanentDelegate?: {
    delegate: string
  }
  transferHook?: {
    authority?: string
    programId?: string
  }
  metadataPointer?: {
    authority?: string
    metadataAddress?: string
  }
  groupPointer?: {
    authority?: string
    groupAddress?: string
  }
  groupMemberPointer?: {
    authority?: string
    memberAddress?: string
  }
}

export interface ExtensionValidationResult {
  isValid: boolean
  extension: string
  errors: string[]
  warnings: string[]
  gasEstimate?: number
}

export interface MigrationPlan {
  fromTokenProgram: 'token' | 'token-2022'
  toTokenProgram: 'token' | 'token-2022'
  accountsToMigrate: string[]
  requiredExtensions: TokenExtension[]
  estimatedCost: number
  instructions: any[]
  warnings: string[]
  compatibility: {
    walletsSupported: string[]
    exchangesSupported: string[]
    dexSupported: string[]
  }
}

export class TokenExtensionsManager {
  private connection: Connection
  private extensionCache = new Map<string, TokenExtension[]>()

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Get Token-2022 mint information with extensions
   */
  async getToken2022Mint(mintAddress: string): Promise<Token2022Mint | null> {
    try {
      const pubkey = new PublicKey(mintAddress)
      const accountInfo = await this.connection.getAccountInfo(pubkey)
      
      if (!accountInfo) {
        return null
      }

      // Check if it's Token-2022 program
      if (accountInfo.owner.toString() !== 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
        return null
      }

      return this.parseToken2022Mint(accountInfo, mintAddress)
    } catch (error) {
      console.error('Error getting Token-2022 mint:', error)
      return null
    }
  }

  /**
   * Get Token-2022 account information with extensions
   */
  async getToken2022Account(accountAddress: string): Promise<Token2022Account | null> {
    try {
      const pubkey = new PublicKey(accountAddress)
      const accountInfo = await this.connection.getAccountInfo(pubkey)
      
      if (!accountInfo) {
        return null
      }

      // Check if it's Token-2022 program
      if (accountInfo.owner.toString() !== 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb') {
        return null
      }

      return this.parseToken2022Account(accountInfo, accountAddress)
    } catch (error) {
      console.error('Error getting Token-2022 account:', error)
      return null
    }
  }

  /**
   * Create new Token-2022 mint with extensions
   */
  async createMintWithExtensions(
    decimals: number,
    mintAuthority: string,
    freezeAuthority?: string,
    extensions: ExtensionConfig = {}
  ): Promise<{
    mintAddress: string
    instructions: any[]
    signers: string[]
    estimatedCost: number
  } | null> {
    try {
      const mintKeypair = PublicKey.unique()
      const mintAddress = mintKeypair.toString()
      
      const instructions: any[] = []
      const signers = [mintAuthority]
      
      // Calculate required space for extensions
      const extensionSpace = this.calculateExtensionSpace(extensions)
      const totalSpace = 82 + extensionSpace // Base mint size + extensions
      
      // System instruction to create account
      instructions.push({
        type: 'create_account',
        space: totalSpace,
        owner: 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb',
        mintAddress
      })

      // Add extension initialization instructions
      if (extensions.transferFeeConfig) {
        instructions.push({
          type: 'initialize_transfer_fee_config',
          mintAddress,
          transferFeeBasisPoints: extensions.transferFeeConfig.transferFeeBasisPoints,
          maximumFee: extensions.transferFeeConfig.maximumFee,
          withdrawWithheldAuthority: extensions.transferFeeConfig.withdrawWithheldAuthority
        })
      }

      if (extensions.confidentialTransfer) {
        instructions.push({
          type: 'initialize_confidential_transfer',
          mintAddress,
          authority: extensions.confidentialTransfer.authority,
          autoApproveNewAccounts: extensions.confidentialTransfer.autoApproveNewAccounts
        })
      }

      if (extensions.defaultAccountState) {
        instructions.push({
          type: 'initialize_default_account_state',
          mintAddress,
          defaultState: extensions.defaultAccountState.state
        })
      }

      if (extensions.nonTransferable) {
        instructions.push({
          type: 'initialize_non_transferable',
          mintAddress
        })
      }

      if (extensions.interestBearingConfig) {
        instructions.push({
          type: 'initialize_interest_bearing_config',
          mintAddress,
          rateAuthority: extensions.interestBearingConfig.rateAuthority,
          currentRate: extensions.interestBearingConfig.currentRate
        })
      }

      if (extensions.permanentDelegate) {
        instructions.push({
          type: 'initialize_permanent_delegate',
          mintAddress,
          delegate: extensions.permanentDelegate.delegate
        })
      }

      if (extensions.transferHook) {
        instructions.push({
          type: 'initialize_transfer_hook',
          mintAddress,
          authority: extensions.transferHook.authority,
          programId: extensions.transferHook.programId
        })
      }

      if (extensions.metadataPointer) {
        instructions.push({
          type: 'initialize_metadata_pointer',
          mintAddress,
          authority: extensions.metadataPointer.authority,
          metadataAddress: extensions.metadataPointer.metadataAddress
        })
      }

      // Initialize mint instruction
      instructions.push({
        type: 'initialize_mint',
        mintAddress,
        decimals,
        mintAuthority,
        freezeAuthority
      })

      const estimatedCost = instructions.length * 5000 + (totalSpace * 6960) // Rent for account space

      return {
        mintAddress,
        instructions,
        signers,
        estimatedCost
      }
    } catch (error) {
      console.error('Error creating mint with extensions:', error)
      return null
    }
  }

  /**
   * Validate extension configuration
   */
  async validateExtensionConfig(config: ExtensionConfig): Promise<ExtensionValidationResult[]> {
    const results: ExtensionValidationResult[] = []

    // Validate Transfer Fee Config
    if (config.transferFeeConfig) {
      const validation: ExtensionValidationResult = {
        isValid: true,
        extension: 'Transfer Fee Config',
        errors: [],
        warnings: [],
        gasEstimate: 15000
      }

      if (config.transferFeeConfig.transferFeeBasisPoints > 10000) {
        validation.errors.push('Transfer fee basis points cannot exceed 10000 (100%)')
        validation.isValid = false
      }

      if (config.transferFeeConfig.transferFeeBasisPoints > 1000) {
        validation.warnings.push('High transfer fee (>10%) may deter users')
      }

      if (!config.transferFeeConfig.withdrawWithheldAuthority) {
        validation.warnings.push('No withdraw withheld authority set - fees cannot be collected')
      }

      results.push(validation)
    }

    // Validate Confidential Transfer
    if (config.confidentialTransfer) {
      const validation: ExtensionValidationResult = {
        isValid: true,
        extension: 'Confidential Transfer',
        errors: [],
        warnings: [],
        gasEstimate: 25000
      }

      if (!config.confidentialTransfer.authority) {
        validation.warnings.push('No confidential transfer authority set')
      }

      validation.warnings.push('Confidential transfers require additional client-side encryption')
      results.push(validation)
    }

    // Validate Interest Bearing Config
    if (config.interestBearingConfig) {
      const validation: ExtensionValidationResult = {
        isValid: true,
        extension: 'Interest Bearing Config',
        errors: [],
        warnings: [],
        gasEstimate: 20000
      }

      if (!config.interestBearingConfig.rateAuthority) {
        validation.errors.push('Rate authority is required for interest bearing tokens')
        validation.isValid = false
      }

      if (Math.abs(config.interestBearingConfig.currentRate) > 32767) {
        validation.errors.push('Interest rate out of valid range')
        validation.isValid = false
      }

      validation.warnings.push('Interest rates require regular updates to remain accurate')
      results.push(validation)
    }

    // Validate Transfer Hook
    if (config.transferHook) {
      const validation: ExtensionValidationResult = {
        isValid: true,
        extension: 'Transfer Hook',
        errors: [],
        warnings: [],
        gasEstimate: 30000
      }

      if (!config.transferHook.programId) {
        validation.errors.push('Program ID is required for transfer hooks')
        validation.isValid = false
      }

      validation.warnings.push('Transfer hooks add complexity and may break wallet compatibility')
      results.push(validation)
    }

    // Check for conflicting extensions
    if (config.nonTransferable && (config.transferFeeConfig || config.transferHook)) {
      results.push({
        isValid: false,
        extension: 'Compatibility Check',
        errors: ['Non-transferable tokens cannot have transfer fees or hooks'],
        warnings: []
      })
    }

    return results
  }

  /**
   * Create migration plan from Token to Token-2022
   */
  async createMigrationPlan(
    tokenMint: string,
    targetExtensions: ExtensionConfig
  ): Promise<MigrationPlan | null> {
    try {
      // Get current token mint info
      const mintInfo = await this.connection.getAccountInfo(new PublicKey(tokenMint))
      if (!mintInfo) {
        throw new Error('Token mint not found')
      }

      const isToken2022 = mintInfo.owner.toString() === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
      
      // Get all token accounts for this mint
      const tokenAccounts = await this.getTokenAccounts(tokenMint)
      
      const requiredExtensions = this.configToExtensions(targetExtensions)
      const estimatedCost = this.estimateMigrationCost(tokenAccounts.length, requiredExtensions)
      
      const warnings: string[] = []
      
      if (tokenAccounts.length > 100) {
        warnings.push(`Large number of accounts to migrate (${tokenAccounts.length})`)
      }
      
      if (targetExtensions.transferHook) {
        warnings.push('Transfer hooks may break existing integrations')
      }
      
      if (targetExtensions.nonTransferable) {
        warnings.push('Non-transferable tokens cannot be moved after migration')
      }

      // Build migration instructions
      const instructions = [
        {
          type: 'create_new_mint_2022',
          extensions: targetExtensions
        },
        {
          type: 'migrate_token_accounts',
          fromMint: tokenMint,
          accountCount: tokenAccounts.length
        },
        {
          type: 'update_metadata',
          newMint: 'new_token_2022_mint'
        }
      ]

      return {
        fromTokenProgram: isToken2022 ? 'token-2022' : 'token',
        toTokenProgram: 'token-2022',
        accountsToMigrate: tokenAccounts,
        requiredExtensions,
        estimatedCost,
        instructions,
        warnings,
        compatibility: {
          walletsSupported: ['Phantom', 'Solflare', 'Backpack'],
          exchangesSupported: ['Limited support'],
          dexSupported: ['Jupiter', 'Orca (partial)']
        }
      }
    } catch (error) {
      console.error('Error creating migration plan:', error)
      return null
    }
  }

  /**
   * Get extension compatibility info
   */
  getExtensionCompatibility(): {
    [extensionName: string]: {
      walletSupport: string[]
      dexSupport: string[]
      limitations: string[]
    }
  } {
    return {
      'Transfer Fee': {
        walletSupport: ['Phantom', 'Solflare', 'Backpack'],
        dexSupport: ['Jupiter', 'Orca'],
        limitations: ['Fees are taken on every transfer', 'May require manual fee collection']
      },
      'Confidential Transfer': {
        walletSupport: ['Limited'],
        dexSupport: ['None'],
        limitations: ['Requires special client support', 'High computation cost']
      },
      'Default Account State': {
        walletSupport: ['Phantom', 'Solflare'],
        dexSupport: ['Jupiter'],
        limitations: ['New accounts start frozen if configured']
      },
      'Immutable Owner': {
        walletSupport: ['All'],
        dexSupport: ['All'],
        limitations: ['Account ownership cannot be changed']
      },
      'Memo Transfer': {
        walletSupport: ['Phantom', 'Solflare'],
        dexSupport: ['Limited'],
        limitations: ['Requires memo on all incoming transfers']
      },
      'Non Transferable': {
        walletSupport: ['Limited'],
        dexSupport: ['None'],
        limitations: ['Tokens cannot be transferred after creation']
      },
      'Interest Bearing': {
        walletSupport: ['Phantom'],
        dexSupport: ['None'],
        limitations: ['Requires rate updates', 'Complex calculation']
      },
      'Permanent Delegate': {
        walletSupport: ['Limited'],
        dexSupport: ['None'],
        limitations: ['Delegate has permanent control over tokens']
      },
      'Transfer Hook': {
        walletSupport: ['Developer wallets only'],
        dexSupport: ['Custom integration required'],
        limitations: ['Requires custom program', 'May break existing flows']
      },
      'Metadata Pointer': {
        walletSupport: ['Phantom', 'Solflare'],
        dexSupport: ['Jupiter'],
        limitations: ['Points to external metadata', 'Requires metadata program']
      }
    }
  }

  /**
   * Estimate gas costs for extension operations
   */
  estimateExtensionCosts(extensions: ExtensionConfig): {
    initializationCost: number
    operationCosts: { [operation: string]: number }
    totalSetupCost: number
  } {
    let initializationCost = 0
    const operationCosts: { [operation: string]: number } = {}

    if (extensions.transferFeeConfig) {
      initializationCost += 15000
      operationCosts['transfer_with_fee'] = 25000
      operationCosts['withdraw_withheld_tokens'] = 15000
    }

    if (extensions.confidentialTransfer) {
      initializationCost += 50000
      operationCosts['confidential_transfer'] = 100000
    }

    if (extensions.interestBearingConfig) {
      initializationCost += 20000
      operationCosts['update_rate'] = 15000
      operationCosts['harvest_interest'] = 20000
    }

    if (extensions.transferHook) {
      initializationCost += 30000
      operationCosts['transfer_with_hook'] = 50000
    }

    if (extensions.metadataPointer) {
      initializationCost += 10000
      operationCosts['update_metadata'] = 15000
    }

    const baseSetupCost = 10000 // Base mint creation
    const totalSetupCost = baseSetupCost + initializationCost

    return {
      initializationCost,
      operationCosts,
      totalSetupCost
    }
  }

  /**
   * Private helper methods
   */
  private parseToken2022Mint(accountInfo: AccountInfo<Buffer>, address: string): Token2022Mint {
    // Mock parsing - in real implementation, parse the actual account data
    return {
      mintAuthority: '11111111111111111111111111111111',
      supply: BigInt(1000000),
      decimals: 6,
      isInitialized: true,
      freezeAuthority: '11111111111111111111111111111111',
      extensions: [
        {
          name: 'Transfer Fee Config',
          identifier: 1,
          size: 108,
          description: 'Configures transfer fees for the mint',
          isRequired: false,
          data: {
            transferFeeBasisPoints: 100,
            maximumFee: BigInt(5000)
          }
        }
      ]
    }
  }

  private parseToken2022Account(accountInfo: AccountInfo<Buffer>, address: string): Token2022Account {
    // Mock parsing - in real implementation, parse the actual account data
    return {
      mint: '11111111111111111111111111111111',
      owner: '11111111111111111111111111111111',
      amount: BigInt(100000),
      state: 'initialized',
      delegatedAmount: BigInt(0),
      extensions: [
        {
          name: 'Immutable Owner',
          identifier: 2,
          size: 0,
          description: 'Prevents ownership changes',
          isRequired: false
        }
      ]
    }
  }

  private calculateExtensionSpace(extensions: ExtensionConfig): number {
    let space = 0
    
    if (extensions.transferFeeConfig) space += 108
    if (extensions.confidentialTransfer) space += 97
    if (extensions.defaultAccountState) space += 1
    if (extensions.immutableOwner) space += 0
    if (extensions.memoTransfer) space += 1
    if (extensions.nonTransferable) space += 0
    if (extensions.interestBearingConfig) space += 16
    if (extensions.permanentDelegate) space += 32
    if (extensions.transferHook) space += 64
    if (extensions.metadataPointer) space += 64
    if (extensions.groupPointer) space += 64
    if (extensions.groupMemberPointer) space += 64
    
    return space
  }

  private configToExtensions(config: ExtensionConfig): TokenExtension[] {
    const extensions: TokenExtension[] = []
    
    Object.entries(config).forEach(([key, value]) => {
      if (value) {
        extensions.push({
          name: this.extensionKeyToName(key),
          identifier: this.getExtensionId(key),
          size: this.getExtensionSize(key),
          description: this.getExtensionDescription(key),
          isRequired: false,
          data: value
        })
      }
    })
    
    return extensions
  }

  private extensionKeyToName(key: string): string {
    const nameMap: { [key: string]: string } = {
      'transferFeeConfig': 'Transfer Fee Config',
      'confidentialTransfer': 'Confidential Transfer',
      'defaultAccountState': 'Default Account State',
      'immutableOwner': 'Immutable Owner',
      'memoTransfer': 'Memo Transfer',
      'nonTransferable': 'Non Transferable',
      'interestBearingConfig': 'Interest Bearing Config',
      'permanentDelegate': 'Permanent Delegate',
      'transferHook': 'Transfer Hook',
      'metadataPointer': 'Metadata Pointer'
    }
    return nameMap[key] || key
  }

  private getExtensionId(key: string): number {
    const idMap: { [key: string]: number } = {
      'transferFeeConfig': 1,
      'confidentialTransfer': 2,
      'defaultAccountState': 3,
      'immutableOwner': 4,
      'memoTransfer': 5,
      'nonTransferable': 6,
      'interestBearingConfig': 7,
      'permanentDelegate': 8,
      'transferHook': 9,
      'metadataPointer': 10
    }
    return idMap[key] || 0
  }

  private getExtensionSize(key: string): number {
    const sizeMap: { [key: string]: number } = {
      'transferFeeConfig': 108,
      'confidentialTransfer': 97,
      'defaultAccountState': 1,
      'immutableOwner': 0,
      'memoTransfer': 1,
      'nonTransferable': 0,
      'interestBearingConfig': 16,
      'permanentDelegate': 32,
      'transferHook': 64,
      'metadataPointer': 64
    }
    return sizeMap[key] || 0
  }

  private getExtensionDescription(key: string): string {
    const descMap: { [key: string]: string } = {
      'transferFeeConfig': 'Configures transfer fees for the mint',
      'confidentialTransfer': 'Enables confidential transfers',
      'defaultAccountState': 'Sets default state for new accounts',
      'immutableOwner': 'Prevents ownership changes',
      'memoTransfer': 'Requires memo on transfers',
      'nonTransferable': 'Makes tokens non-transferable',
      'interestBearingConfig': 'Configures interest bearing tokens',
      'permanentDelegate': 'Sets a permanent delegate',
      'transferHook': 'Enables transfer hooks',
      'metadataPointer': 'Points to metadata account'
    }
    return descMap[key] || 'Unknown extension'
  }

  private async getTokenAccounts(mintAddress: string): Promise<string[]> {
    // In real implementation, get all token accounts for this mint
    return ['account1', 'account2', 'account3'] // Mock
  }

  private estimateMigrationCost(accountCount: number, extensions: TokenExtension[]): number {
    const baseCost = 50000 // Base migration cost
    const perAccountCost = 10000
    const extensionCost = extensions.length * 15000
    
    return baseCost + (accountCount * perAccountCost) + extensionCost
  }
}