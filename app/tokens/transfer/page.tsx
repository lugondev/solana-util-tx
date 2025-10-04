'use client'

import { TokenTransferForm } from '@/components/tokens/token-transfer-form'

export default function TokenTransferPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          SPL TOKEN TRANSFER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Transfer SPL tokens to any Solana address
        </p>
      </div>

      <TokenTransferForm />
    </div>
  )
}