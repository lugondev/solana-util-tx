'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  buildTokenTransfer,
  getTokenAccounts,
  getTokenMetadata,
  hasTokenBalance,
  POPULAR_TOKENS,
  TOKEN_METADATA,
  type TokenMetadata 
} from '@/lib/solana/tokens/spl-token/transfer'
import { ChevronDown, Search, RefreshCw } from 'lucide-react'

interface TokenAccount {
  pubkey: PublicKey
  mint: PublicKey
  balance: number
  decimals: number
  uiAmount: number
  metadata?: TokenMetadata
}

interface TokenTransferFormData {
  selectedToken: string
  customMint: string
  recipient: string
  amount: string
  createRecipientATA: boolean
}

export function TokenTransferForm() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [tokenAccounts, setTokenAccounts] = useState<TokenAccount[]>([])
  const [isLoadingTokens, setIsLoadingTokens] = useState(false)
  const [showTokenSelector, setShowTokenSelector] = useState(false)
  const [useCustomMint, setUseCustomMint] = useState(false)

  const [formData, setFormData] = useState<TokenTransferFormData>({
    selectedToken: '',
    customMint: '',
    recipient: '',
    amount: '',
    createRecipientATA: true,
  })

  const [isTransferring, setIsTransferring] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [result, setResult] = useState<{ signature: string } | null>(null)

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
        const metadata = TOKEN_METADATA[mintPubkey.toBase58()]
        return {
          pubkey: PublicKey.default,
          mint: mintPubkey,
          balance: 0,
          decimals: metadata?.decimals || 9,
          uiAmount: 0,
          metadata,
        }
      } catch {
        return null
      }
    }

    return tokenAccounts.find(acc => acc.mint.toBase58() === formData.selectedToken) || null
  }

  const validateForm = (): boolean => {
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

    // Validate recipient
    if (!formData.recipient) {
      newErrors.recipient = 'Recipient address is required'
    } else {
      try {
        new PublicKey(formData.recipient)
      } catch {
        newErrors.recipient = 'Invalid recipient address'
      }
    }

    // Validate amount
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    // Check balance for owned tokens
    const selectedToken = getSelectedTokenAccount()
    if (selectedToken && !useCustomMint && selectedToken.uiAmount < parseFloat(formData.amount || '0')) {
      newErrors.amount = `Insufficient balance. Available: ${selectedToken.uiAmount}`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleTransfer = async () => {
    if (!publicKey) {
      alert('Please connect your wallet')
      return
    }

    if (!validateForm()) return

    const selectedToken = getSelectedTokenAccount()
    if (!selectedToken) return

    setIsTransferring(true)
    setResult(null)

    try {
      const { transaction } = await buildTokenTransfer({
        connection,
        sender: publicKey,
        recipient: new PublicKey(formData.recipient),
        mintAddress: selectedToken.mint,
        amount: parseFloat(formData.amount),
        decimals: selectedToken.decimals,
        createRecipientATA: formData.createRecipientATA,
      })

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

      // Send transaction
      const signature = await sendTransaction(transaction, connection)

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      setResult({ signature })

      // Reset form
      setFormData({
        selectedToken: '',
        customMint: '',
        recipient: '',
        amount: '',
        createRecipientATA: true,
      })

      // Reload token accounts
      await loadTokenAccounts()

    } catch (error) {
      console.error('Transfer error:', error)
      alert(`Transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTransferring(false)
    }
  }

  const handleInputChange = (field: keyof TokenTransferFormData, value: string | boolean) => {
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

  const selectedToken = getSelectedTokenAccount()

  return (
    <div className="space-y-6">
      {/* Token Selection */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              SELECT TOKEN
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
                          <div className="font-mono text-sm text-green-400">
                            {account.uiAmount.toLocaleString()}
                          </div>
                          <div className="font-mono text-xs text-gray-400">
                            Balance
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
              {/* Custom Mint */}
              <PixelInput
                label="TOKEN MINT ADDRESS"
                value={formData.customMint}
                onChange={(e) => handleInputChange('customMint', e.target.value)}
                placeholder="Enter token mint address"
                error={errors.customMint}
                disabled={isTransferring}
              />

              {/* Popular tokens quick select */}
              <div className="mt-3">
                <div className="font-mono text-xs text-gray-400 mb-2">POPULAR TOKENS:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(TOKEN_METADATA).map(([mint, metadata]) => (
                    <button
                      key={mint}
                      onClick={() => handleInputChange('customMint', mint)}
                      className="p-2 border-2 border-gray-700 hover:border-green-400/50 transition-colors"
                    >
                      <div className="font-pixel text-xs text-white">{metadata.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </PixelCard>

      {/* Transfer Form */}
      {selectedToken && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                TRANSFER {selectedToken.metadata?.symbol || 'TOKEN'}
              </h3>
            </div>

            <PixelInput
              label="RECIPIENT ADDRESS"
              value={formData.recipient}
              onChange={(e) => handleInputChange('recipient', e.target.value)}
              placeholder="Enter recipient address"
              error={errors.recipient}
              disabled={isTransferring}
            />

            <PixelInput
              label="AMOUNT"
              type="number"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.0"
              step={`${1 / Math.pow(10, selectedToken.decimals)}`}
              min="0"
              error={errors.amount}
              disabled={isTransferring}
            />

            {/* Available balance */}
            {!useCustomMint && selectedToken.uiAmount > 0 && (
              <div className="p-3 bg-gray-800 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">AVAILABLE BALANCE:</div>
                <div className="font-mono text-sm text-green-400">
                  {selectedToken.uiAmount.toLocaleString()} {selectedToken.metadata?.symbol}
                </div>
              </div>
            )}

            {/* Options */}
            <div>
              <label className="flex items-center gap-2 font-pixel text-xs text-gray-400">
                <input
                  type="checkbox"
                  checked={formData.createRecipientATA}
                  onChange={(e) => handleInputChange('createRecipientATA', e.target.checked)}
                  disabled={isTransferring}
                  className="w-4 h-4"
                />
                CREATE RECIPIENT TOKEN ACCOUNT IF NEEDED
              </label>
              <p className="font-mono text-xs text-gray-500 mt-1 ml-6">
                Costs ~0.002 SOL to create. Uncheck if recipient already has the token account.
              </p>
            </div>

            <PixelButton
              variant="primary"
              onClick={handleTransfer}
              disabled={!publicKey || isTransferring}
              isLoading={isTransferring}
              className="w-full"
            >
              {isTransferring ? '[TRANSFERRING...]' : '[TRANSFER TOKEN]'}
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
                ✅ TRANSFER SUCCESSFUL
              </h3>
            </div>

            <div>
              <div className="font-mono text-xs text-gray-400 mb-1">TRANSACTION SIGNATURE:</div>
              <div className="font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700">
                {result.signature}
              </div>
            </div>

            <div className="p-3 bg-green-400/10 border-4 border-green-400/20">
              <div className="font-mono text-xs text-green-400">
                ℹ️ Your token transfer has been confirmed on the network.
              </div>
            </div>
          </div>
        </PixelCard>
      )}
    </div>
  )
}