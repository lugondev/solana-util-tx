'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { FeeSelector } from '@/components/ui/fee-selector'
import { SimulationResultDisplay } from '@/components/ui/simulation-result-display'
import { TransactionStatusTracker } from '@/components/ui/transaction-status-tracker'
import { useTransaction } from '@/hooks/useTransaction'
import { useTransactionSimulation } from '@/hooks/useTransactionSimulation'
import { usePriorityFees } from '@/hooks/usePriorityFees'
import { useTransactionHistory } from '@/lib/transaction-history'
import { TransactionBuilder } from '@/lib/solana/transactions/builder'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function SendTransactionPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction: walletSendTransaction } = useWallet()
  const { addTransaction, updateTransaction } = useTransactionHistory()

  // Form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Transaction hooks
  const { sendTransaction, update: txUpdate, isSending, reset: resetTransaction } = useTransaction({
    connection,
  })

  const {
    simulate,
    result: simulationResult,
    isSimulating,
    reset: resetSimulation,
  } = useTransactionSimulation({ connection })

  const {
    recommendations,
    selectedSpeed,
    setSelectedSpeed,
    currentFee,
    isLoading: isLoadingFees,
  } = usePriorityFees({ connection })

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!recipient) {
      newErrors.recipient = 'Recipient address is required'
    } else {
      try {
        new PublicKey(recipient)
      } catch {
        newErrors.recipient = 'Invalid Solana address'
      }
    }

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Build transaction
  const buildTransaction = async (): Promise<Transaction | null> => {
    if (!publicKey) return null
    if (!validateForm()) return null

    try {
      const recipientPubkey = new PublicKey(recipient)
      const lamports = Math.floor(parseFloat(amount) * LAMPORTS_PER_SOL)

      const builder = new TransactionBuilder(connection, {
        feePayer: publicKey,
        priorityFee: {
          type: 'manual',
          microLamports: currentFee,
        },
      })

      // Add SOL transfer instruction
      builder.addInstruction(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      )

      // Add memo if provided
      if (memo) {
        // Memo program instruction would go here
        // For now, skipping memo implementation
      }

      const result = await builder.buildLegacy()
      return result.transaction as Transaction
    } catch (error) {
      console.error('[SendTransaction] Build error:', error)
      return null
    }
  }

  // Handle simulate
  const handleSimulate = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    resetSimulation()

    const transaction = await buildTransaction()
    if (!transaction) return

    await simulate(transaction)
  }

  // Handle send
  const handleSend = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first')
      return
    }

    resetTransaction()

    const transaction = await buildTransaction()
    if (!transaction) return

    try {
      // Sign with wallet
      const signed = await walletSendTransaction(transaction, connection, {
        skipPreflight: true,
      })

      // Add to transaction history
      const historyItem = addTransaction({
        signature: signed,
        type: 'sol-transfer',
        status: 'pending',
        amount: parseFloat(amount),
        recipient,
        sender: publicKey.toBase58(),
        description: memo || 'SOL transfer',
      })

      console.log('Transaction sent:', signed)
      
      // Monitor confirmation
      try {
        await connection.confirmTransaction(signed, 'confirmed')
        updateTransaction(signed, { status: 'confirmed' })
      } catch (confirmError) {
        console.error('Confirmation failed:', confirmError)
        updateTransaction(signed, { 
          status: 'failed', 
          error: confirmError instanceof Error ? confirmError.message : 'Confirmation failed'
        })
      }

    } catch (error) {
      console.error('[SendTransaction] Send error:', error)
      alert(`Failed to send: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle reset
  const handleReset = () => {
    setRecipient('')
    setAmount('')
    setMemo('')
    setErrors({})
    resetSimulation()
    resetTransaction()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-primary mb-2 flex items-center gap-3">
          <span className="animate-pixel-blink">▸</span>
          SEND TRANSACTION
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Transfer SOL with priority fees and simulation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Form */}
        <div className="space-y-6">
          {/* Transaction Details */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-primary/20 pb-3">
                <h3 className="font-pixel text-sm text-primary">
                  TRANSACTION DETAILS
                </h3>
              </div>

              <PixelInput
                label="RECIPIENT ADDRESS"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="Enter Solana address"
                error={errors.recipient}
                disabled={isSending}
              />

              <PixelInput
                label="AMOUNT (SOL)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                step="0.001"
                min="0"
                error={errors.amount}
                disabled={isSending}
              />

              <PixelInput
                label="MEMO (OPTIONAL)"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="Add a note..."
                disabled={isSending}
              />

              {/* Wallet Info */}
              {publicKey && (
                <div className="p-3 bg-gray-900 border-4 border-gray-700">
                  <div className="font-mono text-xs text-gray-400">
                    FROM:
                  </div>
                  <div className="font-mono text-xs text-primary break-all mt-1">
                    {publicKey.toBase58()}
                  </div>
                </div>
              )}
            </div>
          </PixelCard>

          {/* Priority Fees */}
          {!isLoadingFees && (
            <FeeSelector
              recommendations={recommendations}
              selectedSpeed={selectedSpeed}
              onSpeedChange={setSelectedSpeed}
              disabled={isSending}
              showCustom
            />
          )}

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <PixelButton
              variant="secondary"
              onClick={handleSimulate}
              disabled={!publicKey || isSimulating || isSending}
              isLoading={isSimulating}
            >
              [SIMULATE]
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={handleSend}
              disabled={!publicKey || isSending || (simulationResult !== null && !simulationResult.success)}
              isLoading={isSending}
            >
              [SEND]
            </PixelButton>
          </div>

          <PixelButton
            variant="secondary"
            onClick={handleReset}
            disabled={isSending}
            className="w-full"
          >
            [RESET]
          </PixelButton>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Simulation Result */}
          {simulationResult && (
            <SimulationResultDisplay
              result={simulationResult}
              isLoading={isSimulating}
            />
          )}

          {/* Transaction Status */}
          {txUpdate && (
            <TransactionStatusTracker
              update={txUpdate}
              showDetails
            />
          )}

          {/* Info */}
          {!simulationResult && !txUpdate && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-primary/20 pb-3">
                  <h3 className="font-pixel text-sm text-primary">
                    ℹ INFORMATION
                  </h3>
                </div>

                <div className="space-y-3 font-mono text-xs text-gray-400">
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    <span>
                      Simulation checks if your transaction will succeed before sending
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    <span>
                      Priority fees help your transaction get confirmed faster
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    <span>
                      Transactions are automatically retried if they fail
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">▸</span>
                    <span>
                      Higher priority fees = faster confirmation but higher cost
                    </span>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </div>
    </div>
  )
}
