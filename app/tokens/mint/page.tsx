'use client'

import { TokenMintForm } from '@/components/tokens/token-mint-form'

export default function TokenMintPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          CREATE SPL TOKEN
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Create a new SPL token with custom parameters and initial supply
        </p>
      </div>

      <TokenMintForm />
    </div>
  )
}