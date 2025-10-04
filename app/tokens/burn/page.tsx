'use client'

import { TokenBurnForm } from '@/components/tokens/token-burn-form'

export default function TokenBurnPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-red-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          BURN SPL TOKENS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Permanently destroy tokens to reduce total supply
        </p>
        <div className="mt-3 p-3 bg-red-600/10 border-4 border-red-600/20">
          <p className="font-mono text-xs text-red-400">
            ⚠️ Warning: Burned tokens are permanently destroyed and cannot be recovered
          </p>
        </div>
      </div>

      <TokenBurnForm />
    </div>
  )
}