'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Upload, Download, Send, Coins, FileText, CheckCircle, Loader2 } from 'lucide-react'
import BulkTokenService, { BulkRecipient, BulkValidationResult } from '@/lib/solana/tokens/bulk-token-service'
import { useTokenInfo } from '@/contexts/TokenContext'

export default function BulkTokenOperationsPage() {
  const { connected, publicKey, signAllTransactions, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [operation, setOperation] = useState<'multi-send' | 'airdrop' | ''>('')
  const [addressList, setAddressList] = useState('')
  const [amount, setAmount] = useState('')
  const [tokenMint, setTokenMint] = useState('')
  const [batchSize, setBatchSize] = useState('10')
  const [isValidating, setIsValidating] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [validationResult, setValidationResult] = useState<BulkValidationResult | null>(null)
  const [executionResult, setExecutionResult] = useState<any>(null)
  
  // Token info for the selected mint
  const tokenInfo = useTokenInfo(tokenMint)
  
  // Initialize bulk token service
  const [bulkService] = useState(() => new BulkTokenService(connection))

  // Validate addresses and amounts
  const handleValidate = async () => {
    if (!operation || !tokenMint.trim() || !addressList.trim()) {
      alert('Please fill in all required fields')
      return
    }

    if (operation === 'multi-send' && !amount.trim()) {
      alert('Please enter amount for multi-send operation')
      return
    }

    setIsValidating(true)
    try {
      // Parse recipients from address list
      let recipients: BulkRecipient[]
      
      if (operation === 'multi-send') {
        // For multi-send, each line is an address, use the same amount for all
        const addresses = addressList.split('\n').filter(line => line.trim())
        recipients = addresses.map(address => ({
          address: address.trim(),
          amount: amount
        }))
      } else {
        // For airdrop, parse CSV format (address,amount)
        recipients = bulkService.parseCSVData(addressList, 'airdrop')
      }

      // Validate the operation
      const result = await bulkService.validateBulkOperation({
        tokenMint,
        operation: operation as 'multi-send' | 'airdrop',
        recipients,
        batchSize: parseInt(batchSize),
        slippage: 0.5
      })

      setValidationResult(result)
    } catch (error) {
      console.error('Validation error:', error)
      alert('Error validating addresses. Please check your input.')
    } finally {
      setIsValidating(false)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setAddressList(text)
    }
    reader.readAsText(file)
  }

  // Execute bulk operation
  const handleExecute = async () => {
    if (!connected || !publicKey || !signAllTransactions || !sendTransaction) {
      alert('Please connect your wallet first')
      return
    }

    if (!validationResult || !validationResult.valid) {
      alert('Please validate addresses first')
      return
    }

    setIsExecuting(true)
    try {
      // Parse recipients
      let recipients: BulkRecipient[]
      
      if (operation === 'multi-send') {
        const addresses = addressList.split('\n').filter(line => line.trim())
        recipients = addresses.map(address => ({
          address: address.trim(),
          amount: amount
        }))
      } else {
        recipients = bulkService.parseCSVData(addressList, 'airdrop')
      }

      // Execute the bulk operation
      const result = await bulkService.executeBulkOperation(
        {
          tokenMint,
          operation: operation as 'multi-send' | 'airdrop',
          recipients,
          batchSize: parseInt(batchSize),
          slippage: 0.5
        },
        publicKey,
        signAllTransactions,
        (tx) => sendTransaction(tx, connection),
        tokenInfo.decimals || 9
      )

      setExecutionResult(result)
      console.log('Bulk operation result:', result)
    } catch (error) {
      console.error('Execution error:', error)
      alert('Error executing bulk operation. Please try again.')
    } finally {
      setIsExecuting(false)
    }
  }

  // Download CSV template
  const downloadTemplate = (type: 'multi-send' | 'airdrop') => {
    const template = bulkService.generateCSVTemplate(type)
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${type}-template.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          BULK TOKEN OPERATIONS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Efficiently send tokens to multiple addresses at once
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Operation Selection */}
        <div className="space-y-6">
          {/* Operation Type */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  SELECT OPERATION
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setOperation('multi-send')}
                  className={`w-full text-left p-4 border-4 transition-colors ${
                    operation === 'multi-send'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Send className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="font-pixel text-sm text-white">MULTI-SEND</div>
                      <div className="font-mono text-xs text-gray-400">
                        Send same amount to multiple addresses
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setOperation('airdrop')}
                  className={`w-full text-left p-4 border-4 transition-colors ${
                    operation === 'airdrop'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-gray-700 hover:border-green-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Coins className="h-6 w-6 text-green-400" />
                    <div>
                      <div className="font-pixel text-sm text-white">AIRDROP</div>
                      <div className="font-mono text-xs text-gray-400">
                        Send different amounts to different addresses
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>

          {/* Configuration */}
          {operation && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    CONFIGURATION
                  </h3>
                </div>

                <PixelInput
                  label="TOKEN MINT ADDRESS"
                  value={tokenMint}
                  onChange={(e) => setTokenMint(e.target.value)}
                  placeholder="Enter SPL token mint address"
                />

                {operation === 'multi-send' && (
                  <PixelInput
                    label="AMOUNT PER ADDRESS"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount to send to each address"
                    min="0"
                    step="0.000001"
                  />
                )}

                <PixelInput
                  label="BATCH SIZE"
                  type="number"
                  value={batchSize}
                  onChange={(e) => setBatchSize(e.target.value)}
                  placeholder="Number of transfers per transaction"
                  min="1"
                  max="20"
                />

                <div>
                  <label className="block font-pixel text-xs text-gray-400 mb-2">
                    RECIPIENT ADDRESSES:
                  </label>
                  <textarea
                    value={addressList}
                    onChange={(e) => setAddressList(e.target.value)}
                    placeholder={
                      operation === 'multi-send'
                        ? "Enter addresses (one per line):\nAddress1\nAddress2\nAddress3"
                        : "Enter addresses with amounts (CSV format):\nAddress1,Amount1\nAddress2,Amount2\nAddress3,Amount3"
                    }
                    rows={10}
                    className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
                  />
                </div>

                {/* File Upload */}
                <div>
                  <label className="block font-pixel text-xs text-gray-400 mb-2">
                    OR UPLOAD FILE:
                  </label>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors">
                      <Upload className="h-4 w-4 text-gray-400" />
                      <span className="font-mono text-xs text-gray-400">
                        Upload CSV or TXT file
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Preview & Actions */}
        <div className="space-y-6">
          {/* Preview */}
          {operation && addressList && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    OPERATION PREVIEW
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-white">
                        {addressList.split('\n').filter(line => line.trim()).length}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Recipients</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-green-400">
                        {operation === 'multi-send' 
                          ? (parseFloat(amount || '0') * addressList.split('\n').filter(line => line.trim()).length).toLocaleString()
                          : 'Varies'
                        }
                      </div>
                      <div className="font-mono text-xs text-gray-400">Total Amount</div>
                    </div>
                  </div>

                  {/* Preview List */}
                  <div>
                    <div className="font-mono text-xs text-gray-400 mb-2">
                      PREVIEW (First 5):
                    </div>
                    <div className="max-h-32 overflow-y-auto border-2 border-gray-700 bg-gray-800">
                      {addressList.split('\n').filter(line => line.trim()).slice(0, 5).map((line, index) => (
                        <div
                          key={index}
                          className="px-3 py-2 border-b border-gray-700 last:border-b-0"
                        >
                          <div className="font-mono text-xs text-white break-all">
                            {operation === 'multi-send' 
                              ? `${line.trim()} → ${amount || '0'}`
                              : line.trim()
                            }
                          </div>
                        </div>
                      ))}
                      {addressList.split('\n').filter(line => line.trim()).length > 5 && (
                        <div className="px-3 py-2 text-center font-mono text-xs text-gray-500">
                          ... and {addressList.split('\n').filter(line => line.trim()).length - 5} more
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Estimated Cost */}
                  <div className="p-3 bg-blue-600/10 border-4 border-blue-600/20">
                    <div className="font-mono text-xs text-blue-400 mb-1">
                      ESTIMATED COST:
                    </div>
                    <div className="font-mono text-sm text-white">
                      ~{(Math.ceil(addressList.split('\n').filter(line => line.trim()).length / parseInt(batchSize)) * 0.000005).toFixed(6)} SOL
                    </div>
                    <div className="font-mono text-xs text-gray-400 mt-1">
                      Transaction fees only (excludes token amounts)
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}

          {/* Actions */}
          {operation && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ACTIONS
                  </h3>
                </div>

                <div className="space-y-3">
                  <PixelButton
                    onClick={handleValidate}
                    disabled={isValidating || !operation || !tokenMint.trim() || !addressList.trim()}
                    variant="secondary"
                    className="w-full"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        [VALIDATING...]
                      </>
                    ) : (
                      '[VALIDATE ADDRESSES]'
                    )}
                  </PixelButton>

                  <PixelButton
                    onClick={handleExecute}
                    disabled={isExecuting || !validationResult?.valid || !connected}
                    variant="primary"
                    className="w-full"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        [EXECUTING...]
                      </>
                    ) : (
                      '[EXECUTE BULK OPERATION]'
                    )}
                  </PixelButton>

                  {!connected && (
                    <div className="text-center">
                      <span className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-600/30 font-pixel text-xs">
                        WALLET NOT CONNECTED
                      </span>
                    </div>
                  )}

                  {validationResult && (
                    <div className="p-3 border-4 border-gray-700">
                      <div className="font-pixel text-xs mb-2">
                        {validationResult.valid ? (
                          <span className="text-green-400">✓ VALIDATION PASSED</span>
                        ) : (
                          <span className="text-red-400">✗ VALIDATION FAILED</span>
                        )}
                      </div>
                      
                      <div className="font-mono text-xs text-gray-400 space-y-1">
                        <div>Recipients: {validationResult.totalRecipients}</div>
                        <div>Estimated Cost: {validationResult.estimatedCost.toFixed(6)} SOL</div>
                        {validationResult.invalidAddresses.length > 0 && (
                          <div className="text-red-400">
                            Invalid addresses: {validationResult.invalidAddresses.length}
                          </div>
                        )}
                        {validationResult.duplicateAddresses.length > 0 && (
                          <div className="text-yellow-400">
                            Duplicate addresses: {validationResult.duplicateAddresses.length}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {executionResult && (
                    <div className="p-3 border-4 border-green-600/30 bg-green-900/20">
                      <div className="font-pixel text-xs text-green-400 mb-2">
                        ✓ EXECUTION COMPLETED
                      </div>
                      
                      <div className="font-mono text-xs text-gray-400 space-y-1">
                        <div>Successful: {executionResult.successfulTransfers}</div>
                        <div>Failed: {executionResult.failedTransfers}</div>
                        <div>Total Cost: {executionResult.totalCost.toFixed(6)} SOL</div>
                        <div>Signatures: {executionResult.signatures.length}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </PixelCard>
          )}

          {/* Templates */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📄 TEMPLATES
                </h3>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={() => downloadTemplate('multi-send')}
                  className="w-full flex items-center gap-3 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="text-left">
                    <div className="font-pixel text-xs text-white">Multi-send Template</div>
                    <div className="font-mono text-xs text-gray-400">Download CSV template</div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 ml-auto" />
                </button>

                <button 
                  onClick={() => downloadTemplate('airdrop')}
                  className="w-full flex items-center gap-3 p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="text-left">
                    <div className="font-pixel text-xs text-white">Airdrop Template</div>
                    <div className="font-mono text-xs text-gray-400">Download CSV template</div>
                  </div>
                  <Download className="h-4 w-4 text-gray-400 ml-auto" />
                </button>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* Info */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              ℹ️ BULK OPERATIONS INFO
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-pixel text-sm text-white mb-3">MULTI-SEND:</h4>
              <div className="space-y-2 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Send same amount to multiple recipients</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Perfect for equal distribution campaigns</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Batched transactions for efficiency</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-pixel text-sm text-white mb-3">AIRDROP:</h4>
              <div className="space-y-2 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Send different amounts to different recipients</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Great for proportional distributions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>CSV format: address,amount per line</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t-4 border-gray-700">
            <div className="p-3 bg-green-600/10 border-4 border-green-600/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <div className="font-mono text-xs text-green-400">
                  <strong>Fully Implemented:</strong> Bulk token operations now support real multi-send and airdrop 
                  functionality with proper validation, batching, and execution. Connect your wallet to get started!
                </div>
              </div>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}