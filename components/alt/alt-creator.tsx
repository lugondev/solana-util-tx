'use client'

import { useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { createAddressLookupTable, buildCreateALTTransaction } from '@/lib/solana/alt/create-alt'
import { ALTStorage } from '@/lib/solana/alt/manage-alt'

interface CreateALTFormData {
  name: string
  description: string
  initialAddresses: string
  useCustomAuthority: boolean
  customAuthority: string
}

export function ALTCreator() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()

  const [formData, setFormData] = useState<CreateALTFormData>({
    name: '',
    description: '',
    initialAddresses: '',
    useCustomAuthority: false,
    customAuthority: '',
  })

  const [isCreating, setIsCreating] = useState(false)
  const [result, setResult] = useState<{
    altAddress: string
    signature: string
    slot: number
  } | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (formData.useCustomAuthority && !formData.customAuthority.trim()) {
      newErrors.customAuthority = 'Custom authority is required when enabled'
    }

    if (formData.useCustomAuthority && formData.customAuthority.trim()) {
      try {
        new PublicKey(formData.customAuthority)
      } catch {
        newErrors.customAuthority = 'Invalid authority address'
      }
    }

    // Validate initial addresses if provided
    if (formData.initialAddresses.trim()) {
      const addresses = formData.initialAddresses.split('\n').filter(addr => addr.trim())
      for (const addr of addresses) {
        try {
          new PublicKey(addr.trim())
        } catch {
          newErrors.initialAddresses = `Invalid address: ${addr.trim()}`
          break
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle create ALT
  const handleCreate = async () => {
    if (!publicKey) {
      alert('Please connect your wallet')
      return
    }

    if (!validateForm()) return

    setIsCreating(true)
    setResult(null)

    try {
      // Parse authority
      const authority = formData.useCustomAuthority 
        ? new PublicKey(formData.customAuthority)
        : publicKey

      // Parse initial addresses
      const initialAddresses: PublicKey[] = []
      if (formData.initialAddresses.trim()) {
        const addresses = formData.initialAddresses.split('\n').filter(addr => addr.trim())
        for (const addr of addresses) {
          initialAddresses.push(new PublicKey(addr.trim()))
        }
      }

      // Build transaction
      const { transaction, lookupTableAddress, slot } = await buildCreateALTTransaction({
        connection,
        payer: publicKey,
        authority,
        initialAddresses,
      })

      // Send transaction
      const signature = await sendTransaction(transaction, connection)

      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed')

      // Save to local storage
      ALTStorage.saveALT(lookupTableAddress.toBase58(), {
        name: formData.name,
        description: formData.description,
        authority,
        addresses: initialAddresses,
        isDeactivated: false,
        isFrozen: false,
        canBeClosed: false,
      })

      setResult({
        altAddress: lookupTableAddress.toBase58(),
        signature,
        slot,
      })

      // Reset form
      setFormData({
        name: '',
        description: '',
        initialAddresses: '',
        useCustomAuthority: false,
        customAuthority: '',
      })

    } catch (error) {
      console.error('Error creating ALT:', error)
      alert(`Failed to create ALT: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Handle input changes
  const handleInputChange = (field: keyof CreateALTFormData, value: string | boolean) => {
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

  return (
    <div className="space-y-6">
      {/* Form */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              CREATE ADDRESS LOOKUP TABLE
            </h3>
          </div>

          {/* Name */}
          <PixelInput
            label="ALT NAME"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="My Custom ALT"
            error={errors.name}
            disabled={isCreating}
          />

          {/* Description */}
          <div>
            <label className="block font-pixel text-xs text-gray-400 mb-2">
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Description of this ALT..."
              rows={3}
              disabled={isCreating}
              className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-sm text-white placeholder-gray-500 resize-none"
            />
          </div>

          {/* Custom Authority */}
          <div>
            <label className="flex items-center gap-2 font-pixel text-xs text-gray-400 mb-2">
              <input
                type="checkbox"
                checked={formData.useCustomAuthority}
                onChange={(e) => handleInputChange('useCustomAuthority', e.target.checked)}
                disabled={isCreating}
                className="w-4 h-4"
              />
              USE CUSTOM AUTHORITY
            </label>
            {formData.useCustomAuthority && (
              <PixelInput
                value={formData.customAuthority}
                onChange={(e) => handleInputChange('customAuthority', e.target.value)}
                placeholder="Authority address"
                error={errors.customAuthority}
                disabled={isCreating}
              />
            )}
          </div>

          {/* Initial Addresses */}
          <div>
            <label className="block font-pixel text-xs text-gray-400 mb-2">
              INITIAL ADDRESSES (OPTIONAL)
            </label>
            <textarea
              value={formData.initialAddresses}
              onChange={(e) => handleInputChange('initialAddresses', e.target.value)}
              placeholder="Enter addresses (one per line)&#10;11111111111111111111111111111112&#10;TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
              rows={6}
              disabled={isCreating}
              className="w-full px-3 py-2 bg-gray-800 border-4 border-gray-700 focus:border-green-400 font-mono text-xs text-white placeholder-gray-500 resize-none"
            />
            {errors.initialAddresses && (
              <p className="text-red-400 text-xs mt-1">{errors.initialAddresses}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Each address on a new line. Maximum 256 addresses.
            </p>
          </div>

          {/* Authority Info */}
          {publicKey && (
            <div className="p-3 bg-gray-800 border-4 border-gray-700">
              <div className="font-mono text-xs text-gray-400 mb-1">
                AUTHORITY WILL BE:
              </div>
              <div className="font-mono text-xs text-green-400 break-all">
                {formData.useCustomAuthority && formData.customAuthority 
                  ? formData.customAuthority 
                  : publicKey.toBase58()
                }
              </div>
            </div>
          )}

          {/* Create Button */}
          <PixelButton
            variant="primary"
            onClick={handleCreate}
            disabled={!publicKey || isCreating}
            isLoading={isCreating}
            className="w-full"
          >
            {isCreating ? '[CREATING...]' : '[CREATE ALT]'}
          </PixelButton>
        </div>
      </PixelCard>

      {/* Result */}
      {result && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                ✅ ALT CREATED SUCCESSFULLY
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">ALT ADDRESS:</div>
                <div className="font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700">
                  {result.altAddress}
                </div>
              </div>

              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">TRANSACTION:</div>
                <div className="font-mono text-xs text-green-400 break-all p-2 bg-gray-800 border-4 border-gray-700">
                  {result.signature}
                </div>
              </div>

              <div>
                <div className="font-mono text-xs text-gray-400 mb-1">SLOT:</div>
                <div className="font-mono text-xs text-green-400 p-2 bg-gray-800 border-4 border-gray-700">
                  {result.slot}
                </div>
              </div>
            </div>

            <div className="p-3 bg-green-400/10 border-4 border-green-400/20">
              <div className="font-mono text-xs text-green-400">
                ℹ️ Your ALT is now active and can be used immediately for new addresses.
                Wait 1 slot before extending with more addresses.
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
              ℹ️ ABOUT ADDRESS LOOKUP TABLES
            </h3>
          </div>

          <div className="space-y-3 font-mono text-xs text-gray-400">
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                ALTs reduce transaction size by storing frequently used addresses in a lookup table
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Each address in your transaction can reference an index instead of the full 32-byte address
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                This can significantly reduce transaction costs for complex transactions
              </span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-400 mt-0.5">▸</span>
              <span>
                Authority can extend the ALT with more addresses or deactivate it
              </span>
            </div>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}