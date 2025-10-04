import { PublicKey, Transaction } from '@solana/web3.js'

/**
 * Multi-signature wallet types and interfaces
 */

export interface MultisigAccount {
  address: PublicKey
  threshold: number
  owners: PublicKey[]
  signers: PublicKey[]
  isInitialized: boolean
  bump: number
}

export interface MultisigTransaction {
  account: PublicKey
  programId: PublicKey
  accounts: PublicKey[]
  data: Buffer
  didExecute: boolean
  ownerSetSeqno: number
  signers: boolean[]
}

export interface MultisigProposal {
  id: string
  multisigAccount: PublicKey
  transaction: Transaction
  proposer: PublicKey
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected' | 'executed'
  signatures: Array<{
    owner: PublicKey
    signature?: string
    approved: boolean
    signedAt?: Date
  }>
  requiredSignatures: number
  currentSignatures: number
  description?: string
  executionDate?: Date
}

export interface CreateMultisigParams {
  threshold: number
  owners: PublicKey[]
  payer: PublicKey
}

export interface CreateTransactionParams {
  multisigAccount: PublicKey
  transaction: Transaction
  proposer: PublicKey
  description?: string
}

export interface SignTransactionParams {
  proposalId: string
  signer: PublicKey
  approve: boolean
}

export interface ExecuteTransactionParams {
  proposalId: string
  executor: PublicKey
}

export const MULTISIG_PROGRAM_ID = new PublicKey('msigmtwzgXJHj2ext4XJjCDmpbcMuufFb5cHuwg6Xdt')