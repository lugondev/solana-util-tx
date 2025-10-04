'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { BundleTransaction } from '@/lib/solana/jito/bundle-service'
import { SystemProgram, PublicKey, Transaction } from '@solana/web3.js'
import { Package, Trash2, Plus, Settings, Zap } from 'lucide-react'

interface BundleTransactionBuilderProps {
  transactions: BundleTransaction[]
  onTransactionsChange: (transactions: BundleTransaction[]) => void
}

const TRANSACTION_TEMPLATES = {
  'sol-transfer': {
    name: 'SOL Transfer',
    description: 'Transfer SOL to another address',
    estimatedCU: 450,
    priority: 'medium' as const,
    fields: [
      { name: 'recipient', label: 'Recipient Address', type: 'text', required: true },
      { name: 'amount', label: 'Amount (SOL)', type: 'number', required: true }
    ]
  },
  'token-transfer': {
    name: 'Token Transfer', 
    description: 'Transfer SPL tokens',
    estimatedCU: 80000,
    priority: 'medium' as const,
    fields: [
      { name: 'tokenMint', label: 'Token Mint Address', type: 'text', required: true },
      { name: 'recipient', label: 'Recipient Address', type: 'text', required: true },
      { name: 'amount', label: 'Amount', type: 'number', required: true }
    ]
  },
  'swap': {
    name: 'Token Swap',
    description: 'Swap tokens via Jupiter',
    estimatedCU: 120000,
    priority: 'high' as const,
    fields: [
      { name: 'inputMint', label: 'Input Token Mint', type: 'text', required: true },
      { name: 'outputMint', label: 'Output Token Mint', type: 'text', required: true },
      { name: 'amount', label: 'Input Amount', type: 'number', required: true }
    ]
  },
  'custom': {
    name: 'Custom Transaction',
    description: 'Custom transaction instructions',
    estimatedCU: 200000,
    priority: 'medium' as const,
    fields: [
      { name: 'description', label: 'Description', type: 'text', required: true }
    ]
  }
}

export function BundleTransactionBuilder({ 
  transactions, 
  onTransactionsChange 
}: BundleTransactionBuilderProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof TRANSACTION_TEMPLATES>('sol-transfer')
  const [formData, setFormData] = useState<Record<string, any>>({})

  const addTransaction = () => {
    const template = TRANSACTION_TEMPLATES[selectedTemplate]
    const newTransaction: BundleTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      transaction: new Transaction(), // Will be built later with actual instructions
      description: template.description,
      estimatedCU: template.estimatedCU,
      priority: template.priority
    }

    // Add form data to description if available
    if (formData.description) {
      newTransaction.description = formData.description
    } else if (selectedTemplate === 'sol-transfer' && formData.recipient && formData.amount) {
      newTransaction.description = `Transfer ${formData.amount} SOL to ${formData.recipient.slice(0, 8)}...`
    } else if (selectedTemplate === 'token-transfer' && formData.amount) {
      newTransaction.description = `Transfer ${formData.amount} tokens`
    }

    onTransactionsChange([...transactions, newTransaction])
    setFormData({}) // Reset form
  }

  const removeTransaction = (id: string) => {
    onTransactionsChange(transactions.filter(tx => tx.id !== id))
  }

  const updateTransaction = (id: string, updates: Partial<BundleTransaction>) => {
    onTransactionsChange(
      transactions.map(tx => 
        tx.id === id ? { ...tx, ...updates } : tx
      )
    )
  }

  const duplicateTransaction = (id: string) => {
    const txToDuplicate = transactions.find(tx => tx.id === id)
    if (txToDuplicate) {
      const duplicated: BundleTransaction = {
        ...txToDuplicate,
        id: `tx_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        description: `${txToDuplicate.description} (Copy)`
      }
      onTransactionsChange([...transactions, duplicated])
    }
  }

  const getTotalCU = () => {
    return transactions.reduce((sum, tx) => sum + tx.estimatedCU, 0)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 border-red-600/30'
      case 'medium': return 'text-yellow-400 border-yellow-600/30'
      case 'low': return 'text-green-400 border-green-600/30'
      default: return 'text-gray-400 border-gray-600/30'
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Transaction Form */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              ADD TRANSACTION
            </h3>
          </div>

          <div className="space-y-4">
            {/* Template Selection */}
            <div>
              <label className="block font-pixel text-xs text-gray-400 mb-2">
                TRANSACTION TYPE:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value as keyof typeof TRANSACTION_TEMPLATES)
                  setFormData({}) // Reset form data when template changes
                }}
                className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white"
              >
                {Object.entries(TRANSACTION_TEMPLATES).map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name} - {template.description}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TRANSACTION_TEMPLATES[selectedTemplate].fields.map((field) => (
                <PixelInput
                  key={field.name}
                  label={field.label}
                  type={field.type}
                  value={formData[field.name] || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [field.name]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                  }))}
                  placeholder={`Enter ${field.label.toLowerCase()}`}
                  required={field.required}
                />
              ))}
            </div>

            {/* Estimated CU Override */}
            <div className="grid grid-cols-2 gap-4">
              <PixelInput
                label="ESTIMATED COMPUTE UNITS"
                type="number"
                value={TRANSACTION_TEMPLATES[selectedTemplate].estimatedCU}
                disabled
              />
              <div>
                <label className="block font-pixel text-xs text-gray-400 mb-2">
                  PRIORITY:
                </label>
                <select
                  value={TRANSACTION_TEMPLATES[selectedTemplate].priority}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border-4 border-gray-600 font-mono text-sm text-gray-400 cursor-not-allowed"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
            </div>

            <PixelButton
              onClick={addTransaction}
              className="w-full"
              disabled={!TRANSACTION_TEMPLATES[selectedTemplate].fields.every(field => 
                !field.required || formData[field.name]
              )}
            >
              <Plus className="h-4 w-4" />
              [ADD TO BUNDLE]
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Transaction List */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
            <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
              <Package className="h-4 w-4" />
              BUNDLE TRANSACTIONS ({transactions.length})
            </h3>
            <div className="flex items-center gap-4">
              <div className="font-mono text-xs text-gray-400">
                Total CU: <span className="text-white">{getTotalCU().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={tx.id} className="p-4 border-4 border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-sm text-white">
                      #{index + 1}
                    </span>
                    <span className={`px-2 py-1 border font-pixel text-xs ${getPriorityColor(tx.priority)}`}>
                      {tx.priority.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => duplicateTransaction(tx.id)}
                      className="text-blue-400 hover:text-blue-300 font-pixel text-xs"
                      title="Duplicate"
                    >
                      [COPY]
                    </button>
                    <button
                      onClick={() => removeTransaction(tx.id)}
                      className="text-red-400 hover:text-red-300 font-pixel text-xs"
                      title="Remove"
                    >
                      [REMOVE]
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-mono text-sm text-white">
                    {tx.description}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Compute Units:</span>
                      <div className="text-white">{tx.estimatedCU.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Priority:</span>
                      <div className="text-white capitalize">{tx.priority}</div>
                    </div>
                    <div>
                      <span className="text-gray-400">Status:</span>
                      <div className="text-yellow-400">Pending</div>
                    </div>
                  </div>

                  {/* Transaction Controls */}
                  <div className="pt-2 border-t-2 border-gray-600">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={tx.estimatedCU}
                        onChange={(e) => updateTransaction(tx.id, { 
                          estimatedCU: parseInt(e.target.value) || 0 
                        })}
                        placeholder="Compute Units"
                        className="px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                      />
                      <select
                        value={tx.priority}
                        onChange={(e) => updateTransaction(tx.id, { 
                          priority: e.target.value as 'low' | 'medium' | 'high' 
                        })}
                        className="px-2 py-1 bg-gray-800 border-2 border-gray-700 focus:border-green-400 font-mono text-xs text-white"
                      >
                        <option value="low">Low Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="high">High Priority</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-12 border-4 border-dashed border-gray-700">
                <Package className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <div className="font-pixel text-lg text-gray-500 mb-2">
                  NO TRANSACTIONS IN BUNDLE
                </div>
                <div className="font-mono text-sm text-gray-600">
                  Add transactions above to start building your bundle
                </div>
              </div>
            )}
          </div>
        </div>
      </PixelCard>

      {/* Bundle Summary */}
      {transactions.length > 0 && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                BUNDLE SUMMARY
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-white">{transactions.length}</div>
                <div className="font-mono text-xs text-gray-400">Transactions</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-green-400">{getTotalCU().toLocaleString()}</div>
                <div className="font-mono text-xs text-gray-400">Total CU</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-red-400">
                  {transactions.filter(tx => tx.priority === 'high').length}
                </div>
                <div className="font-mono text-xs text-gray-400">High Priority</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-blue-400">
                  ~{(getTotalCU() * 0.000001).toFixed(6)}
                </div>
                <div className="font-mono text-xs text-gray-400">Est. Fee (SOL)</div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}
    </div>
  )
}