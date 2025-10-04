'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { SimulationResultDisplay } from '@/components/ui/simulation-result-display'
import { useTransactionSimulation } from '@/hooks/useTransactionSimulation'
import { TransactionBuilder } from '@/lib/solana/transactions/builder'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function SimulateTransactionPage() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  // Form state
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [computeUnits, setComputeUnits] = useState('200000')
  const [priorityFee, setPriorityFee] = useState('1000')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const {
    simulate,
    result: simulationResult,
    isSimulating,
    reset: resetSimulation,
  } = useTransactionSimulation({ connection })

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

    if (!computeUnits || parseInt(computeUnits) <= 0) {
      newErrors.computeUnits = 'Compute units must be greater than 0'
    }

    if (!priorityFee || parseInt(priorityFee) < 0) {
      newErrors.priorityFee = 'Priority fee cannot be negative'
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
        computeUnits: parseInt(computeUnits),
        priorityFee: {
          type: 'manual',
          microLamports: parseInt(priorityFee),
        },
      })

      builder.addInstruction(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPubkey,
          lamports,
        })
      )

      const result = await builder.buildLegacy()
      return result.transaction as Transaction
    } catch (error) {
      console.error('[SimulateTransaction] Build error:', error)
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

  // Handle reset
  const handleReset = () => {
    setRecipient('')
    setAmount('')
    setComputeUnits('200000')
    setPriorityFee('1000')
    setErrors({})
    resetSimulation()
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-primary mb-2 flex items-center gap-3">
          <span className="animate-pixel-blink">▸</span>
          SIMULATE TRANSACTION
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Test your transaction before sending it to the network
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
                disabled={isSimulating}
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
                disabled={isSimulating}
              />

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

          {/* Advanced Settings */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-primary/20 pb-3">
                <h3 className="font-pixel text-sm text-primary">
                  ADVANCED SETTINGS
                </h3>
              </div>

              <PixelInput
                label="COMPUTE UNITS"
                type="number"
                value={computeUnits}
                onChange={(e) => setComputeUnits(e.target.value)}
                placeholder="200000"
                min="0"
                error={errors.computeUnits}
                disabled={isSimulating}
              />

              <PixelInput
                label="PRIORITY FEE (µLAMPORTS)"
                type="number"
                value={priorityFee}
                onChange={(e) => setPriorityFee(e.target.value)}
                placeholder="1000"
                min="0"
                error={errors.priorityFee}
                disabled={isSimulating}
              />

              <div className="p-3 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-2">
                  ESTIMATED COST:
                </div>
                <div className="font-mono text-sm text-primary">
                  {((parseInt(computeUnits || '0') * parseInt(priorityFee || '0')) / 1_000_000 / LAMPORTS_PER_SOL).toFixed(9)} SOL
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <PixelButton
              variant="primary"
              onClick={handleSimulate}
              disabled={!publicKey || isSimulating}
              isLoading={isSimulating}
            >
              [SIMULATE]
            </PixelButton>
            <PixelButton
              variant="secondary"
              onClick={handleReset}
              disabled={isSimulating}
            >
              [RESET]
            </PixelButton>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {/* Simulation Result */}
          {simulationResult ? (
            <SimulationResultDisplay
              result={simulationResult}
              isLoading={isSimulating}
            />
          ) : (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-primary/20 pb-3">
                  <h3 className="font-pixel text-sm text-primary">
                    ABOUT SIMULATION
                  </h3>
                </div>

                <div className="space-y-4 font-mono text-xs text-gray-400">
                  <div className="p-3 bg-gray-900 border-4 border-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <div>
                        <div className="text-primary mb-1">What is simulation?</div>
                        <div>
                          Simulation runs your transaction without sending it to the network,
                          showing you if it will succeed or fail.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900 border-4 border-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <div>
                        <div className="text-primary mb-1">Why simulate?</div>
                        <div>
                          Catch errors before paying transaction fees. See exactly how
                          many compute units your transaction will use.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900 border-4 border-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <div>
                        <div className="text-primary mb-1">Compute units</div>
                        <div>
                          The amount of computation your transaction requires. Set too
                          low and it will fail. Simulation tells you the optimal amount.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-900 border-4 border-gray-700">
                    <div className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">▸</span>
                      <div>
                        <div className="text-primary mb-1">Priority fees</div>
                        <div>
                          Paid per compute unit consumed. Higher fees mean faster
                          confirmation by validators.
                        </div>
                      </div>
                    </div>
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
