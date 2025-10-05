import { TransactionParser } from '@/lib/solana/parsers/transaction-parser'

// Sample transaction data for testing
export const sampleTransactions = {
  // Simple SOL transfer (legacy)
  solTransfer: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAEDBqTMqc3Mx1gKUY4I7jqVGBOUH9FUhAQgEOzXVU8LrYYP8JQgNOvqZGjuGNm7Tx3xxn7+z8xKqJZI5Nx6zQ9LK9UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABJQON8yIrEQCggPJy0ZSRSxJ2GCFP9AJjHxpY1Gz0RaGAAAAAGp9UXGSHnb2/v6e6FPWFKwF6sSa0J6Q+XKaKRgMlHfhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgGAxAAECAAUGCAAAAAAAAAAQJwAAAAAAAAEBAgAADAIAAAAQJwAAAAAAAA==',
  
  // SPL Token transfer
  tokenTransfer: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAQHBqTMqc3Mx1gKUY4I7jqVGBOUH9FUhAQgEOzXVU8LrYYP8JQgNOvqZGjuGNm7Tx3xxn7+z8xKqJZI5Nx6zQ9LK9UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABJQON8yIrEQCggPJy0ZSRSxJ2GCFP9AJjHxpY1Gz0RaGAAAAAGp9UXGSHnb2/v6e6FPWFKwF6sSa0J6Q+XKaKRgMlHfhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKF6Q6tLNxJhGDQ/uX7V7lEApVjcx0Vdql0zGRpKJE2UMAEJzK0sK8bOw3fO+9BG4C0r7t7tB7mQbGVBCwwGaxwACw==',
  
  // Jupiter swap (complex)
  jupiterSwap: 'AQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAcNBqTMqc3Mx1gKUY4I7jqVGBOUH9FUhAQgEOzXVU8LrYYP8JQgNOvqZGjuGNm7Tx3xxn7+z8xKqJZI5Nx6zQ9LK9UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABJQON8yIrEQCggPJy0ZSRSxJ2GCFP9AJjHxpY1Gz0RaGAAAAAGp9UXGSHnb2/v6e6FPWFKwF6sSa0J6Q+XKaKRgMlHfhAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAChdkOsyzwVG7M6JCdN9W1M4FcCH2r7tB7mQbGVBCwwGaxwGgOHQe4tAJqtS8rZQ9sC0r7t7tB7mQbGVBCwwGaxwBAgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=='
}

// Test function to validate parser
export function testTransactionParser() {
  console.log('🧪 Testing Transaction Parser...\n')
  
  Object.entries(sampleTransactions).forEach(([name, txData]) => {
    try {
      console.log(`Testing ${name}:`)
      const parsed = TransactionParser.parseTransaction(txData)
      
      console.log(`✅ Success - Version: ${parsed.version}`)
      console.log(`   Instructions: ${parsed.instructions.length}`)
      console.log(`   Accounts: ${parsed.accounts.length}`)
      console.log(`   Fee Payer: ${parsed.feePayer.slice(0, 8)}...`)
      
      // Show first instruction
      if (parsed.instructions.length > 0) {
        const firstIx = parsed.instructions[0]
        console.log(`   First IX: ${firstIx.programName} - ${firstIx.instructionType}`)
      }
      
      console.log('')
    } catch (error) {
      console.log(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      console.log('')
    }
  })
}

// Helper function to format parsed transaction for display
export function formatTransactionSummary(txData: string): string {
  try {
    const parsed = TransactionParser.parseTransaction(txData)
    
    let summary = `Transaction Summary:\n`
    summary += `==================\n`
    summary += `Version: ${parsed.version}\n`
    summary += `Instructions: ${parsed.instructions.length}\n`
    summary += `Accounts: ${parsed.accounts.length}\n`
    summary += `Fee Payer: ${parsed.feePayer}\n`
    
    if (parsed.priorityFee) {
      summary += `Priority Fee: ${parsed.priorityFee} SOL\n`
    }
    
    summary += `\nInstructions:\n`
    parsed.instructions.forEach((ix, i) => {
      summary += `${i + 1}. ${ix.programName} - ${ix.instructionType}\n`
    })
    
    return summary
  } catch (error) {
    return `Error parsing transaction: ${error instanceof Error ? error.message : 'Unknown error'}`
  }
}

// Example usage for different transaction types
export const transactionExamples = {
  solTransfer: {
    title: 'SOL Transfer',
    description: 'Simple SOL transfer with priority fees',
    features: ['System Program', 'Compute Budget', 'Priority Fees'],
    data: sampleTransactions.solTransfer
  },
  
  tokenTransfer: {
    title: 'SPL Token Transfer',
    description: 'Transfer SPL tokens between accounts',
    features: ['SPL Token Program', 'Account validation', 'Amount parsing'],
    data: sampleTransactions.tokenTransfer
  },
  
  jupiterSwap: {
    title: 'Jupiter Swap',
    description: 'Complex token swap via Jupiter aggregator',
    features: ['Multiple instructions', 'Route optimization', 'Slippage protection'],
    data: sampleTransactions.jupiterSwap
  }
}

// Validation helpers
export function validateTransactionFormat(input: string): { valid: boolean; error?: string } {
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input must be a non-empty string' }
  }
  
  const trimmed = input.trim()
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Input cannot be empty' }
  }
  
  // Check if it looks like base58
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(trimmed)) {
    return { valid: false, error: 'Input must be valid base58 encoding' }
  }
  
  // Basic length check (very rough)
  if (trimmed.length < 20) {
    return { valid: false, error: 'Transaction data appears too short' }
  }
  
  return { valid: true }
}

// Get instruction statistics
export function getInstructionStats(txData: string) {
  try {
    const parsed = TransactionParser.parseTransaction(txData)
    
    const programCounts = parsed.instructions.reduce((acc, ix) => {
      acc[ix.programName] = (acc[ix.programName] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const instructionCounts = parsed.instructions.reduce((acc, ix) => {
      acc[ix.instructionType] = (acc[ix.instructionType] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return {
      totalInstructions: parsed.instructions.length,
      uniquePrograms: Object.keys(programCounts).length,
      programBreakdown: programCounts,
      instructionBreakdown: instructionCounts,
      hasComputeBudget: parsed.computeUnitLimit !== undefined,
      hasPriorityFee: parsed.priorityFee !== undefined,
      version: parsed.version
    }
  } catch (error) {
    throw new Error(`Failed to analyze transaction: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}