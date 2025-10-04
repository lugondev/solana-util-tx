'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  burnTokens,
  getBurnableBalance,
  validateBurnAmount,
  BURN_PRESETS,
  calculateBurnByPercentage 
} from '@/lib/solana/tokens/spl-token/burn'
import { getTokenAccounts, getTokenMetadata, type TokenMetadata } from '@/lib/solana/tokens/spl-token/transfer'
import { useTransactionHistory } from '@/lib/transaction-history'
import { Flame, RefreshCw, AlertTriangle } from 'lucide-react'

interface TokenAccount {
  pubkey: PublicKey
  mint: PublicKey
  balance: number
  decimals: number
  uiAmount: number
  metadata?: TokenMetadata
}

interface TokenBurnFormData {
  selectedToken: string
  customMint: string
  amount: string
  burnPercentage: number
}

export function TokenBurnForm() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { addTransaction, updateTransaction } = useTransactionHistory()

  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [useCustomMint, setUseCustomMint] = useState(false)

  const [formData, setFormData] = useState<TokenBurnFormData>({
    selectedToken: '',
    customMint: '',
    amount: '',
    burnPercentage: 0,
  })

  const [isBurning, setIsBurning] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ signature: string; burnedAmount: number; tokenSymbol: string } | null>(null)

  // Load token accounts on wallet connect
  useEffect(() => {
    if (publicKey) {
      loadTokenAccounts()
    }
  }, [publicKey, connection])

  const loadTokenAccounts = async () => {
    if (!publicKey) return

    setIsLoadingTokens(true)
    try {
      const accounts = await getTokenAccounts(connection, publicKey)
      
      // Add metadata to accounts
      const accountsWithMetadata: TokenAccount[] = []
      for (const account of accounts) {
        const metadata = await getTokenMetadata(connection, account.mint)
        accountsWithMetadata.push({
          ...account,
          metadata: metadata || undefined,
        })
      }

      // Filter out accounts with 0 balance and sort by balance
      const filteredAccounts = accountsWithMetadata
        .filter(acc => acc.uiAmount > 0)
        .sort((a, b) => b.uiAmount - a.uiAmount)

      setTokenAccounts(filteredAccounts)
    } catch (error) {
      console.error('Error loading token accounts:', error)
    } finally {
      setIsLoadingTokens(false)
    }
  }

  const getSelectedTokenAccount = (): TokenAccount | null => {
    if (useCustomMint && formData.customMint) {
      try {
        const mintPubkey = new PublicKey(formData.customMint)
        return {
          pubkey: PublicKey.default,
          mint: mintPubkey,
          balance: 0,
          decimals: 9,
          uiAmount: 0,
          metadata: {
            name: 'Custom Token',
            symbol: 'CUSTOM',
            decimals: 9,
            mint: mintPubkey,
          },
        }
      } catch {
        return null
      }
    }

    return tokenAccounts.find(acc => acc.mint.toBase58() === formData.selectedToken) || null
  }

  const validateForm = async (): Promise<boolean> => {
    if (!publicKey) return false

    const newErrors: Record<string, string> = {}

    // Validate token selection
    if (!useCustomMint && !formData.selectedToken) {
      newErrors.selectedToken = 'Please select a token'
    }

    if (useCustomMint && !formData.customMint) {
      newErrors.customMint = 'Please enter a token mint address'
    }

    if (useCustomMint && formData.customMint) {
      try {
        new PublicKey(formData.customMint)
      } catch {
        newErrors.customMint = 'Invalid mint address'
      }
    }

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    const selectedToken = getSelectedTokenAccount()
    if (selectedToken) {
      try {
        const validation = await validateBurnAmount(
          connection,
          publicKey,
          selectedToken.mint,
          parseFloat(formData.amount || '0')
        )

        if (!validation.valid) {
          newErrors.amount = validation.error || 'Invalid burn amount'
        }
      } catch (error) {
        newErrors.amount = 'Error validating burn amount'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBurn = async () => {
    if (!publicKey) {
      alert('Please connect your wallet')
      return
    }

    const isValid = await validateForm()
    if (!isValid) return

    const selectedToken = getSelectedTokenAccount()
    if (!selectedToken) return

    setIsBurning(true)
    setResult(null)

    try {
      const { transaction, burnAmount } = await burnTokens({
        connection,
        owner: publicKey,
        mintAddress: selectedToken.mint,
        amount: parseFloat(formData.amount),
        decimals: selectedToken.decimals,
      })

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send transaction
      const signature = await sendTransaction(transaction, connection)

      // Add to transaction history
      addTransaction({
        signature,
        type: 'custom',
        status: 'pending',
        description: `Burned ${formData.amount} ${selectedToken.metadata?.symbol || 'tokens'}`,
      })

      // Wait for confirmation
      try {
        await connection.confirmTransaction(signature, 'confirmed')
        updateTransaction(signature, { status: 'confirmed' })
      } catch (confirmError) {
        console.error('Confirmation failed:', confirmError)
        updateTransaction(signature, { 
          status: 'failed', 
          error: confirmError instanceof Error ? confirmError.message : 'Confirmation failed'
        })
      }

      setResult({
        signature,
        burnedAmount: parseFloat(formData.amount),
        tokenSymbol: selectedToken.metadata?.symbol || 'TOKEN',
      })

      // Reset form
      setFormData({
        selectedToken: '',
        customMint: '',
        amount: '',
        burnPercentage: 0,
      })

      // Reload token accounts
      await loadTokenAccounts()

    } catch (error) {
      console.error('Burn error:', error)
      alert(`Burn failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsBurning(false)
    }
  }

  const handleInputChange = (field: keyof TokenBurnFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handlePercentageBurn = (percentage: number) => {
    const selectedToken = getSelectedTokenAccount()
    if (!selectedToken || selectedToken.uiAmount === 0) return

    const burnAmount = calculateBurnByPercentage(selectedToken.uiAmount, percentage)
    setFormData(prev => ({
      ...prev,
      amount: burnAmount.toString(),
      burnPercentage: percentage,
    }))
  }

  const selectedToken = getSelectedTokenAccount()

  return (
    <div className="space-y-6">
      {/* Warning */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-red-400/20 pb-3">
            <h3 className="font-pixel text-sm text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              ⚠️ WARNING
            </h3>
          </div>

          <div className="p-4 bg-red-600/10 border-4 border-red-600/20">
            <div className="space-y-2 font-mono text-xs text-red-400">
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠</span>
                <span>
                  <strong>IRREVERSIBLE ACTION:</strong> Burned tokens are permanently destroyed and cannot be recovered.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠</span>
                <span>
                  Only burn tokens you own and are certain you want to permanently remove from circulation.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 mt-0.5">⚠</span>
                <span>
                  Double-check all amounts before confirming the burn transaction.
                </span>
              </div>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Token Selection */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              SELECT TOKEN TO BURN
            </h3>
          </div>

          {/* Toggle Custom Mint */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 font-pixel text-xs text-gray-400">
              <input
                type="radio"
                checked={!useCustomMint}
                onChange={() => setUseCustomMint(false)}
                className="w-4 h-4"
              />
              FROM WALLET
            </label>
            <label className="flex items-center gap-2 font-pixel text-xs text-gray-400">
              <input
                type="radio"
                checked={useCustomMint}
                onChange={() => setUseCustomMint(true)}
                className="w-4 h-4"
              />
              CUSTOM MINT
            </label>
          </div>

          {!useCustomMint ? (
            <div>
              {/* Wallet Tokens */}
              <div className="flex items-center gap-3 mb-3">
                <PixelButton
                  variant="secondary"
                  onClick={loadTokenAccounts}
                  disabled={!publicKey || isLoadingTokens}
                  isLoading={isLoadingTokens}
                  className="!py-1 !px-3 !text-xs"
                >
                  <RefreshCw className="h-3 w-3" />
                </PixelButton>
                <span className="font-mono text-xs text-gray-400">
                  {tokenAccounts.length} tokens with balance
                </span>
              </div>

              {tokenAccounts.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {tokenAccounts.map((account) => (
                    <button
                      key={account.mint.toBase58()}
                      onClick={() => handleInputChange('selectedToken', account.mint.toBase58())}
                      className={`w-full text-left p-3 border-4 transition-colors ${
                        formData.selectedToken === account.mint.toBase58()
                          ? 'border-green-400 bg-green-400/10'
                          : 'border-gray-700 hover:border-green-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-pixel text-sm text-white">
                            {account.metadata?.symbol || 'UNK'}
                          </div>
                          <div className="font-mono text-xs text-gray-400">
                            {account.metadata?.name || 'Unknown Token'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono text-sm text-red-400">
                            {account.uiAmount.toLocaleString()}
                          </div>
                          <div className="font-mono text-xs text-gray-400">
                            Burnable
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 font-mono text-sm">
                  {!publicKey ? 'Connect wallet to see tokens' : 'No tokens with balance found'}
                </div>
              )}

              {errors.selectedToken && (
                <p className="text-red-400 text-xs mt-2">{errors.selectedToken}</p>
              )}
            </div>
          ) : (
            <div>
              <PixelInput
                label="TOKEN MINT ADDRESS"
                value={formData.customMint}
                onChange={(e) => handleInputChange('customMint', e.target.value)}
                placeholder="Enter token mint address"
                error={errors.customMint}
                disabled={isBurning}
              />
            </div>
          )}
        </div>
      </PixelCard>

      {/* Burn Form */}
      {selectedToken && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-red-400/20 pb-3">
              <h3 className="font-pixel text-sm text-red-400 flex items-center gap-2">
                <Flame className="h-4 w-4" />
                BURN {selectedToken.metadata?.symbol || 'TOKEN'}
              </h3>
            </div>

            {/* Available balance */}
            {!useCustomMint && selectedToken.uiAmount > 0 && (
              <div className="p-3 bg-gray-800 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">AVAILABLE TO BURN:</div>
                <div className="font-mono text-sm text-white">
                  {selectedToken.uiAmount.toLocaleString()} {selectedToken.metadata?.symbol}
                </div>
              </div>
            )}

            {/* Percentage Presets */}
            {!useCustomMint && selectedToken.uiAmount > 0 && (
              <div>
                <label className="block font-pixel text-xs text-gray-400 mb-2">
                  QUICK BURN:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(BURN_PRESETS).map(([key, preset]) => (
                    <button
                      key={key}
                      onClick={() => handlePercentageBurn(preset.percentage)}
                      disabled={isBurning}
                      className={`p-2 border-4 transition-colors font-pixel text-xs ${
                        formData.burnPercentage === preset.percentage
                          ? 'border-red-400 bg-red-400/10 text-red-400'
                          : 'border-gray-700 hover:border-red-400/50 text-gray-400'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <PixelInput
              label="AMOUNT TO BURN"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.0"
              step={`${1 / Math.pow(10, selectedToken.decimals)}`}
              min="0"
              max={useCustomMint ? undefined : selectedToken.uiAmount.toString()}
              error={errors.amount}
              disabled={isBurning}
            />

            {/* Burn confirmation */}
            {formData.amount && parseFloat(formData.amount) > 0 && (
              <div className="p-4 bg-red-600/10 border-4 border-red-600/20">
                <div className="font-mono text-sm text-red-400 mb-2">
                  ⚠️ CONFIRM BURN:
                </div>
                <div className="font-mono text-xs text-gray-300">
                  You are about to permanently destroy{' '}
                  <span className="text-red-400 font-bold">
                    {parseFloat(formData.amount).toLocaleString()} {selectedToken.metadata?.symbol}
                  </span>
                  . This action cannot be undone.
                </div>
              </div>
            )}

            <PixelButton
              variant="secondary"
              onClick={handleBurn}
              disabled={!publicKey || isBurning || !formData.amount || parseFloat(formData.amount) <= 0}
              isLoading={isBurning}
              className="w-full !text-red-400 !border-red-600/30 hover:!border-red-400"
            >
              {isBurning ? '[BURNING...]' : '[🔥 BURN TOKENS 🔥]'}
            </PixelButton>
          </div>
        </PixelCard>
      )}

      {/* Result */}
      {result && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                ✅ TOKENS BURNED SUCCESSFULLY
              </h3>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-red-600/10 border-4 border-red-600/20">
                <div className="font-mono text-sm text-red-400 mb-1">
                  🔥 BURNED AMOUNT:
                </div>
                <div className="font-mono text-lg text-white">
                  {result.burnedAmount.toLocaleString()} {result.tokenSymbol}
                </div>
                <div className="font-mono text-xs text-gray-400 mt-1">
                  These tokens have been permanently removed from circulation
                </div>
              </div>

              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">TRANSACTION SIGNATURE:</div>
                <div className="font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700">
                  {result.signature}
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Info */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              ℹ️ TOKEN BURNING INFO
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Token burning permanently destroys tokens, reducing total supply
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Burned tokens are removed from your wallet and cannot be recovered
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Burning can increase the value of remaining tokens by reducing supply
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Transaction fees are minimal (~0.000005 SOL)
              </span>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}