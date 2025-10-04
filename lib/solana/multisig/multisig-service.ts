import { 
  Connection, 
  PublicKey, 
  Transaction, 
  TransactionInstruction,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction
} from '@solana/web3.js'
import { 
  MultisigAccount, 
  MultisigTransaction, 
  MultisigProposal,
  CreateMultisigParams,
  CreateTransactionParams,
  SignTransactionParams,
  ExecuteTransactionParams,
  MULTISIG_PROGRAM_ID
} from './types'

/**
 * Multi-signature wallet service for Solana
 * Provides functionality to create and manage multi-sig wallets
 */
export class MultisigService {
  private connection: Connection
  private proposals: Map<string, MultisigProposal> = new Map()

  constructor(connection: Connection) {
    this.connection = connection
  }

  /**
   * Create a new multisig account
   */
  async createMultisig({ threshold, owners, payer }: CreateMultisigParams): Promise<{
    multisigAccount: PublicKey
    transaction: Transaction
    bump: number
  }> {
    if (threshold > owners.length) {
      throw new Error('Threshold cannot be greater than number of owners')
    }

    if (threshold === 0) {
      throw new Error('Threshold must be at least 1')
    }

    // Find PDA for multisig account
    const [multisigAccount, bump] = await PublicKey.findProgramAddress(
      [Buffer.from('multisig'), payer.toBuffer()],
      MULTISIG_PROGRAM_ID
    )

    // Calculate space needed for multisig account
    const multisigAccountSpace = 8 + // discriminator
      1 + // threshold
      4 + (owners.length * 32) + // owners
      4 + // signer bump
      1 // bump

    const lamports = await this.connection.getMinimumBalanceForRentExemption(multisigAccountSpace)

    const transaction = new Transaction()

    // Create multisig account instruction
    const createAccountInstruction = SystemProgram.createAccount({
      fromPubkey: payer,
      newAccountPubkey: multisigAccount,
      lamports,
      space: multisigAccountSpace,
      programId: MULTISIG_PROGRAM_ID,
    })

    // Initialize multisig instruction (pseudo-code for actual program instruction)
    const initializeInstruction = new TransactionInstruction({
      keys: [
        { pubkey: multisigAccount, isSigner: false, isWritable: true },
        { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ...owners.map(owner => ({ pubkey: owner, isSigner: false, isWritable: false }))
      ],
      programId: MULTISIG_PROGRAM_ID,
      data: Buffer.from([0, threshold, ...owners.flatMap(o => Array.from(o.toBytes()))])
    })

    transaction.add(createAccountInstruction, initializeInstruction)

    return {
      multisigAccount,
      transaction,
      bump
    }
  }

  /**
   * Get multisig account info
   */
  async getMultisigAccount(multisigAccount: PublicKey): Promise<MultisigAccount | null> {
    try {
      const accountInfo = await this.connection.getAccountInfo(multisigAccount)
      
      if (!accountInfo) {
        return null
      }

      // Parse account data (simplified parsing)
      const data = accountInfo.data
      const threshold = data[8]
      const ownersCount = data.readUInt32LE(9)
      const owners: PublicKey[] = []
      
      for (let i = 0; i < ownersCount; i++) {
        const ownerBytes = data.slice(13 + (i * 32), 13 + ((i + 1) * 32))
        owners.push(new PublicKey(ownerBytes))
      }

      return {
        address: multisigAccount,
        threshold,
        owners,
        signers: [], // Would be parsed from account data
        isInitialized: true,
        bump: data[data.length - 1]
      }
    } catch (error) {
      console.error('Error getting multisig account:', error)
      return null
    }
  }

  /**
   * Create a new transaction proposal
   */
  async createTransaction({ 
    multisigAccount, 
    transaction, 
    proposer, 
    description 
  }: CreateTransactionParams): Promise<MultisigProposal> {
    const multisigInfo = await this.getMultisigAccount(multisigAccount)
    
    if (!multisigInfo) {
      throw new Error('Multisig account not found')
    }

    if (!multisigInfo.owners.some(owner => owner.equals(proposer))) {
      throw new Error('Proposer is not an owner of this multisig')
    }

    const proposalId = `${multisigAccount.toString()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const proposal: MultisigProposal = {
      id: proposalId,
      multisigAccount,
      transaction,
      proposer,
      createdAt: new Date(),
      status: 'pending',
      signatures: multisigInfo.owners.map(owner => ({
        owner,
        approved: owner.equals(proposer), // Proposer automatically approves
        signedAt: owner.equals(proposer) ? new Date() : undefined
      })),
      requiredSignatures: multisigInfo.threshold,
      currentSignatures: 1, // Proposer's signature
      description,
    }

    this.proposals.set(proposalId, proposal)
    return proposal
  }

  /**
   * Sign a transaction proposal
   */
  async signTransaction({ proposalId, signer, approve }: SignTransactionParams): Promise<MultisigProposal> {
    const proposal = this.proposals.get(proposalId)
    
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    if (proposal.status !== 'pending') {
      throw new Error('Proposal is not in pending status')
    }

    const signerIndex = proposal.signatures.findIndex(sig => sig.owner.equals(signer))
    
    if (signerIndex === -1) {
      throw new Error('Signer is not an owner of this multisig')
    }

    // Update signature
    proposal.signatures[signerIndex] = {
      ...proposal.signatures[signerIndex],
      approved: approve,
      signedAt: new Date()
    }

    // Update current signatures count
    proposal.currentSignatures = proposal.signatures.filter(sig => sig.approved).length

    // Check if threshold is met
    if (proposal.currentSignatures >= proposal.requiredSignatures) {
      proposal.status = 'approved'
    } else if (proposal.signatures.filter(sig => !sig.approved && sig.signedAt).length > 
               proposal.signatures.length - proposal.requiredSignatures) {
      proposal.status = 'rejected'
    }

    this.proposals.set(proposalId, proposal)
    return proposal
  }

  /**
   * Execute an approved transaction
   */
  async executeTransaction({ proposalId, executor }: ExecuteTransactionParams): Promise<{
    signature: string
    proposal: MultisigProposal
  }> {
    const proposal = this.proposals.get(proposalId)
    
    if (!proposal) {
      throw new Error('Proposal not found')
    }

    if (proposal.status !== 'approved') {
      throw new Error('Proposal is not approved for execution')
    }

    if (proposal.currentSignatures < proposal.requiredSignatures) {
      throw new Error('Insufficient signatures for execution')
    }

    try {
      // Execute the transaction (simplified - would need proper multisig program integration)
      const signature = await this.connection.sendTransaction(proposal.transaction, [])
      
      // Update proposal status
      proposal.status = 'executed'
      proposal.executionDate = new Date()
      this.proposals.set(proposalId, proposal)

      return {
        signature,
        proposal
      }
    } catch (error) {
      throw new Error(`Failed to execute transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all proposals for a multisig account
   */
  getProposals(multisigAccount: PublicKey): MultisigProposal[] {
    return Array.from(this.proposals.values()).filter(
      proposal => proposal.multisigAccount.equals(multisigAccount)
    )
  }

  /**
   * Get a specific proposal
   */
  getProposal(proposalId: string): MultisigProposal | null {
    return this.proposals.get(proposalId) || null
  }

  /**
   * Get multisig accounts where the given public key is an owner
   */
  async getMultisigAccountsForOwner(owner: PublicKey): Promise<PublicKey[]> {
    // This would typically involve scanning for accounts or using an indexer
    // For now, return empty array as this requires more complex implementation
    return []
  }

  /**
   * Estimate costs for multisig operations
   */
  static estimateCosts(): {
    createMultisig: number
    createTransaction: number
    signTransaction: number
    executeTransaction: number
  } {
    return {
      createMultisig: 0.002039, // SOL for account creation
      createTransaction: 0.000005, // SOL for transaction fee
      signTransaction: 0.000005, // SOL for signature
      executeTransaction: 0.000005, // SOL for execution
    }
  }
}

export default MultisigService