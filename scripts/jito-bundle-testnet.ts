#!/usr/bin/env ts-node

import 'dotenv/config'
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from '@solana/web3.js'
import bs58 from 'bs58'
import { JitoBundleService, BundleTransaction } from '../lib/solana/jito/bundle-service'
import { JITO_TIP_PRESETS } from '../lib/solana/jito/config'
import { BundleBuilder, formatBundleInfo } from '../lib/solana/jito/bundle-utils'

// ============================================================================
// Configuration
// ============================================================================

const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'testnet'
const PRIVATE_KEY = process.env.PRIVATE_KEY

if (!PRIVATE_KEY) {
  console.error('❌ Error: PRIVATE_KEY not found in environment variables')
  process.exit(1)
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get RPC endpoint for network
 */
function getRpcEndpoint(network: string): string {
  switch (network) {
    case 'mainnet-beta':
      return process.env.NEXT_PUBLIC_MAINNET_RPC || clusterApiUrl('mainnet-beta')
    case 'testnet':
      return process.env.NEXT_PUBLIC_TESTNET_RPC || clusterApiUrl('testnet')
    case 'devnet':
      return process.env.NEXT_PUBLIC_DEVNET_RPC || clusterApiUrl('devnet')
    default:
      return clusterApiUrl('testnet')
  }
}

/**
 * Load keypair from private key
 */
function loadKeypair(privateKey: string): Keypair {
  try {
    // Try to decode as base58
    const decoded = bs58.decode(privateKey)
    return Keypair.fromSecretKey(decoded)
  } catch (error) {
    console.error('❌ Failed to load keypair from private key')
    throw error
  }
}

/**
 * Create sample transactions for the bundle
 */
async function createSampleTransactions(
  connection: Connection,
  payer: PublicKey
): Promise<BundleTransaction[]> {
  const { blockhash } = await connection.getLatestBlockhash('confirmed')

  // Transaction 1: Transfer 0.1 SOL to first wallet
  const recipient1 = new PublicKey('5o4Xcu4nYJMkAYUtV6HV62ds1PFKxjFktYUX6sgNnTbi')
  const tx1 = new Transaction()
  tx1.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient1,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    })
  )
  tx1.recentBlockhash = blockhash
  tx1.feePayer = payer

  // Transaction 2: Transfer 0.1 SOL to second wallet
  const recipient2 = new PublicKey('9DbY8i8tmEkgKTvkBkRaXJKEYMAJWU6uStif9mHUD4bk')
  const tx2 = new Transaction()
  tx2.add(
    SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: recipient2,
      lamports: 0.1 * LAMPORTS_PER_SOL,
    })
  )
  tx2.recentBlockhash = blockhash
  tx2.feePayer = payer

  return [
    {
      id: 'tx-1',
      transaction: tx1,
      description: `Transfer 0.1 SOL to ${recipient1.toBase58().slice(0, 8)}...`,
      estimatedCU: 450,
      priority: 'high' as const,
    },
    {
      id: 'tx-2',
      transaction: tx2,
      description: `Transfer 0.1 SOL to ${recipient2.toBase58().slice(0, 8)}...`,
      estimatedCU: 450,
      priority: 'high' as const,
    },
  ]
}

/**
 * Format time duration
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('🚀 Jito Bundle Submission Script (Testnet)')
  console.log('=' .repeat(70))
  console.log()

  // Load configuration
  console.log('📋 Configuration:')
  console.log(`   Network: ${NETWORK}`)
  console.log(`   RPC: ${getRpcEndpoint(NETWORK)}`)
  console.log()

  // Initialize connection
  const connection = new Connection(getRpcEndpoint(NETWORK), 'confirmed')
  console.log('🔌 Connected to Solana RPC')

  // Load payer keypair
  const payer = loadKeypair(PRIVATE_KEY!)
  console.log(`💰 Payer: ${payer.publicKey.toBase58()}`)

  // Check balance
  const balance = await connection.getBalance(payer.publicKey)
  console.log(`   Balance: ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL`)
  console.log()

  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    console.error('❌ Insufficient balance. Need at least 0.01 SOL for testing.')
    console.log('   Get testnet SOL from: https://faucet.solana.com')
    process.exit(1)
  }

  // Initialize Jito Bundle Service
  const tipPreset = 'standard'
  const jitoConfig = {
    region: 'ny', // Use NY endpoint for testnet
    tip: JITO_TIP_PRESETS[tipPreset].amount,
    maxRetries: 3,
    timeout: 45000, // 45 seconds
    encoding: 'base64' as const,
  }

  console.log('⚙️  Jito Configuration:')
  console.log(`   Region: ${jitoConfig.region}`)
  console.log(`   Tip: ${jitoConfig.tip} SOL (${tipPreset})`)
  console.log(`   Timeout: ${jitoConfig.timeout}ms`)
  console.log(`   Encoding: ${jitoConfig.encoding}`)
  console.log()

  const bundleService = new JitoBundleService(connection, jitoConfig)

  // Create sample transactions
  console.log('📝 Creating sample transactions...')
  const transactions = await createSampleTransactions(connection, payer.publicKey)
  console.log(`✅ Created ${transactions.length} transactions`)
  console.log()

  // Display transaction details
  console.log('📋 Transaction Details:')
  transactions.forEach((tx, index) => {
    console.log(`   ${index + 1}. [${tx.priority.toUpperCase()}] ${tx.description}`)
    console.log(`      Estimated CU: ${tx.estimatedCU.toLocaleString()}`)
  })
  console.log()

  // Build bundle
  const builder = new BundleBuilder()
  builder.addTransactions(transactions)

  // Validate bundle
  console.log('🔍 Validating bundle...')
  const validation = builder.validate()

  if (!validation.valid) {
    console.error('❌ Bundle validation failed:')
    validation.errors.forEach(error => console.error(`   - ${error}`))
    process.exit(1)
  }

  if (validation.warnings.length > 0) {
    console.log('⚠️  Warnings:')
    validation.warnings.forEach(warning => console.log(`   - ${warning}`))
  }

  console.log('✅ Bundle validation passed')
  console.log()

  // Display bundle info
  console.log(formatBundleInfo(transactions, jitoConfig))
  console.log()

  // Simulate bundle
  console.log('🧪 Simulating bundle...')
  const simulation = await bundleService.simulateBundle(transactions, payer.publicKey)

  if (!simulation.success) {
    console.error('❌ Bundle simulation failed:')
    simulation.errors.forEach(error => console.error(`   - ${error}`))
    process.exit(1)
  }

  console.log('✅ Bundle simulation successful')
  console.log(`   Estimated cost: ${simulation.estimatedCost.toFixed(6)} SOL`)
  console.log()

  // Submit bundle
  console.log('📤 Submitting bundle to Jito...')
  const startTime = Date.now()

  const result = await bundleService.submitBundle(
    transactions,
    payer.publicKey,
    async (txs) => {
      // Sign all transactions
      txs.forEach(tx => {
        tx.sign(payer)
      })
      return txs
    }
  )

  const endTime = Date.now()
  const duration = endTime - startTime

  console.log()
  console.log('=' .repeat(70))
  console.log('📊 Bundle Submission Result')
  console.log('=' .repeat(70))
  console.log()

  if (result.landed) {
    console.log('✅ Bundle landed successfully!')
    console.log()
    console.log(`   Bundle ID: ${result.bundleId}`)
    console.log(`   Status: LANDED`)
    console.log(`   Landed Slot: ${result.landedSlot || 'N/A'}`)
    console.log(`   Duration: ${formatDuration(duration)}`)
    console.log(`   Total Cost: ${result.cost.toFixed(6)} SOL`)
    console.log()
    console.log('   Transaction Signatures:')
    result.signatures.forEach((sig, index) => {
      console.log(`   ${index + 1}. ${sig}`)
      console.log(`      Explorer: https://explorer.solana.com/tx/${sig}?cluster=${NETWORK}`)
    })
    console.log()
    console.log('🎉 Bundle execution completed successfully!')
  } else {
    console.log('❌ Bundle failed to land')
    console.log()
    console.log(`   Bundle ID: ${result.bundleId || 'N/A'}`)
    console.log(`   Status: FAILED`)
    console.log(`   Duration: ${formatDuration(duration)}`)
    console.log(`   Error: ${result.error || 'Unknown error'}`)
    console.log()

    if (result.signatures.length > 0) {
      console.log('   Transaction Signatures (may not be confirmed):')
      result.signatures.forEach((sig, index) => {
        console.log(`   ${index + 1}. ${sig}`)
      })
    }
  }

  console.log()
  console.log('=' .repeat(70))
}

// ============================================================================
// Execute
// ============================================================================

main()
  .then(() => {
    console.log('\n✨ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })
