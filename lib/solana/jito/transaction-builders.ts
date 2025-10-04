import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import { 
  createTransferInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { BundleTransaction } from './bundle-service'

/**
 * Create a SOL transfer transaction for bundle
 */
export async function createSolTransferTransaction(
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey,
  amount: number, // in SOL
  id?: string
): Promise<BundleTransaction> {
  const transaction = new Transaction()
  
  const transferInstruction = SystemProgram.transfer({
    fromPubkey: payer,
    toPubkey: recipient,
    lamports: Math.floor(amount * LAMPORTS_PER_SOL)
  })
  
  transaction.add(transferInstruction)
  
  return {
    id: id || `sol_transfer_${Date.now()}`,
    transaction,
    description: `Transfer ${amount} SOL to ${recipient.toBase58().slice(0, 8)}...`,
    estimatedCU: 450,
    priority: 'medium'
  }
}

/**
 * Create a SPL token transfer transaction for bundle
 */
export async function createTokenTransferTransaction(
  connection: Connection,
  payer: PublicKey,
  recipient: PublicKey,
  tokenMint: PublicKey,
  amount: number,
  decimals: number = 6,
  id?: string
): Promise<BundleTransaction> {
  const transaction = new Transaction()
  
  // Get associated token addresses
  const sourceATA = await getAssociatedTokenAddress(tokenMint, payer)
  const destinationATA = await getAssociatedTokenAddress(tokenMint, recipient)
  
  // Check if destination ATA exists, create if not
  const destinationATAInfo = await connection.getAccountInfo(destinationATA)
  if (!destinationATAInfo) {
    const createATAInstruction = await import('@solana/spl-token').then(spl =>
      spl.createAssociatedTokenAccountInstruction(
        payer,
        destinationATA,
        recipient,
        tokenMint,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      )
    )
    transaction.add(createATAInstruction)
  }
  
  // Create transfer instruction
  const transferInstruction = createTransferInstruction(
    sourceATA,
    destinationATA,
    payer,
    Math.floor(amount * Math.pow(10, decimals)),
    [],
    TOKEN_PROGRAM_ID
  )
  
  transaction.add(transferInstruction)
  
  return {
    id: id || `token_transfer_${Date.now()}`,
    transaction,
    description: `Transfer ${amount} tokens to ${recipient.toBase58().slice(0, 8)}...`,
    estimatedCU: destinationATAInfo ? 80000 : 120000, // Higher if creating ATA
    priority: 'medium'
  }
}

/**
 * Create a simple memo transaction for testing bundles
 */
export async function createMemoTransaction(
  memo: string,
  id?: string
): Promise<BundleTransaction> {
  const transaction = new Transaction()
  
  // Add memo instruction
  const memoInstruction = {
    keys: [],
    programId: new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'),
    data: Buffer.from(memo, 'utf8')
  }
  
  transaction.add(memoInstruction)
  
  return {
    id: id || `memo_${Date.now()}`,
    transaction,
    description: `Memo: ${memo.slice(0, 30)}${memo.length > 30 ? '...' : ''}`,
    estimatedCU: 100,
    priority: 'low'
  }
}

/**
 * Helper to validate transaction inputs
 */
export function validateTransactionInputs(
  type: 'sol-transfer' | 'token-transfer' | 'memo',
  inputs: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  switch (type) {
    case 'sol-transfer':
      if (!inputs.recipient) errors.push('Recipient address is required')
      if (!inputs.amount || inputs.amount <= 0) errors.push('Amount must be greater than 0')
      try {
        new PublicKey(inputs.recipient)
      } catch {
        if (inputs.recipient) errors.push('Invalid recipient address')
      }
      break
      
    case 'token-transfer':
      if (!inputs.recipient) errors.push('Recipient address is required')
      if (!inputs.tokenMint) errors.push('Token mint address is required')
      if (!inputs.amount || inputs.amount <= 0) errors.push('Amount must be greater than 0')
      try {
        new PublicKey(inputs.recipient)
        new PublicKey(inputs.tokenMint)
      } catch {
        if (inputs.recipient || inputs.tokenMint) errors.push('Invalid address format')
      }
      break
      
    case 'memo':
      if (!inputs.memo || inputs.memo.length === 0) errors.push('Memo text is required')
      if (inputs.memo && inputs.memo.length > 566) errors.push('Memo too long (max 566 characters)')
      break
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Estimate total bundle size and fees
 */
export function estimateBundleMetrics(transactions: BundleTransaction[]) {
  const totalCU = transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
  const totalTransactions = transactions.length
  const estimatedFees = totalCU * 0.000001 // Rough estimate
  
  const priorityDistribution = {
    high: transactions.filter(tx => tx.priority === 'high').length,
    medium: transactions.filter(tx => tx.priority === 'medium').length,
    low: transactions.filter(tx => tx.priority === 'low').length
  }
  
  return {
    totalCU,
    totalTransactions,
    estimatedFees,
    priorityDistribution,
    averageCUPerTx: totalTransactions > 0 ? Math.floor(totalCU / totalTransactions) : 0
  }
}