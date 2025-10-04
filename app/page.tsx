'use client'

import Link from 'next/link'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button'
import { useState, useEffect } from 'react'
import { useTransactionHistory } from '@/lib/transaction-history'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export default function HomePage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const { getStatistics } = useTransactionHistory()
  
  const [stats, setStats] = useState<any>(null)
  const [balance, setBalance] = useState<number | null>(null)

  useEffect(() => {
    setStats(getStatistics())
  }, [])

  useEffect(() => {
    if (connected && publicKey) {
      connection.getBalance(publicKey).then(bal => {
        setBalance(bal / LAMPORTS_PER_SOL)
      }).catch(console.error)
    }
  }, [connected, publicKey, connection])

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Solana Utility Tools",
    "alternateName": "SolanaUtils",
    "description": "Comprehensive Solana utility platform for token management, DeFi operations, transaction building, Jito bundles, and developer tools",
    "url": "https://solana-util-tx.vercel.app",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Person",
      "name": "LugonDev",
      "url": "https://github.com/lugondev"
    },
    "keywords": "Solana, blockchain, cryptocurrency, DeFi, tokens, transaction, wallet, developer tools",
    "featureList": [
      "SOL transfers with priority fees",
      "Transaction simulation and testing", 
      "SPL token management",
      "Address Lookup Table management",
      "Jupiter token swaps",
      "Jito MEV protected bundles",
      "Developer tools and utilities"
    ],
    "screenshot": "https://solana-util-tx.vercel.app/og-image.png"
  }

  const features = [
    {
      title: 'WALLET',
      description: 'Connect and manage your Solana wallet',
      href: '/wallet',
      icon: '💰',
      status: 'active',
    },
    {
      title: 'SEND SOL',
      description: 'Transfer SOL with priority fees',
      href: '/transaction/send',
      icon: '⚡',
      status: 'active',
    },
    {
      title: 'SIMULATE TX',
      description: 'Test transactions before sending',
      href: '/transaction/simulate',
      icon: '🧪',
      status: 'active',
    },
    {
      title: 'TX HISTORY',
      description: 'Track all your transactions',
      href: '/transaction/history',
      icon: '📊',
      status: 'active',
    },
    {
      title: 'TOKEN TRANSFER',
      description: 'Transfer SPL tokens',
      href: '/tokens/transfer',
      icon: '🪙',
      status: 'active',
    },
    {
      title: 'CREATE ALT',
      description: 'Create Address Lookup Tables',
      href: '/alt/create',
      icon: '📋',
      status: 'active',
    },
    {
      title: 'MANAGE ALT',
      description: 'Track and manage ALTs',
      href: '/alt/manage',
      icon: '🔧',
      status: 'active',
    },
    {
      title: 'ALT EXPLORER',
      description: 'Explore ALT contents and benefits',
      href: '/alt/explorer',
      icon: '🔍',
      status: 'active',
    },
    {
      title: 'TOKEN MINT',
      description: 'Create new SPL tokens',
      href: '/tokens/mint',
      icon: '🏭',
      status: 'active',
    },
    {
      title: 'JUPITER SWAP',
      description: 'Token swapping with best rates',
      href: '/defi/swap',
      icon: '�',
      status: 'active',
    },
    {
      title: 'DEV TOOLS',
      description: 'Developer utilities and tools',
      href: '/dev-tools/keypair',
      icon: '�️',
      status: 'active',
    },
    {
      title: 'JITO BUNDLES',
      description: 'MEV protected transaction bundles',
      href: '/jito/bundle',
      icon: '🚀',
      status: 'active',
    },
  ]

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div className="space-y-10">
      {/* Hero Section */}
      <div className="text-center py-16">
        <div className="flex items-center justify-center mb-8">
          <div className="w-20 h-20 bg-green-400 border-8 border-green-400 animate-pulse mr-6" />
          <div>
            <h1 className="font-pixel text-4xl text-green-400 mb-3">
              SOLANA UTIL-TX
            </h1>
            <p className="font-mono text-lg text-gray-400">
              Ultimate Solana transaction utility toolkit
            </p>
          </div>
        </div>

        {!connected ? (
          <div className="space-y-6">
            <p className="font-mono text-sm text-gray-500 mb-8">
              Connect your wallet to start using advanced Solana features
            </p>
            <PixelWalletButton variant="success" />
          </div>
        ) : (
          <div className="space-y-6">
            <p className="font-mono text-sm text-green-400">
              Welcome back! Ready to build some transactions?
            </p>
            {balance !== null && (
              <p className="font-mono text-sm text-gray-400">
                Balance: {balance.toFixed(4)} SOL
              </p>
            )}
          </div>
        )}
      </div>

      {/* Stats Section */}
      {connected && stats && stats.total > 0 && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-green-400/20 pb-3">
              <h3 className="font-pixel text-sm text-green-400">
                📊 YOUR ACTIVITY
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-white">{stats.total}</div>
                <div className="font-mono text-xs text-gray-400">Transactions</div>
              </div>
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-green-400">{stats.confirmed}</div>
                <div className="font-mono text-xs text-gray-400">Confirmed</div>
              </div>
              {stats.totalVolume > 0 && (
                <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-mono text-lg text-blue-400">
                    {stats.totalVolume.toFixed(2)}
                  </div>
                  <div className="font-mono text-xs text-gray-400">SOL Volume</div>
                </div>
              )}
              <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                <div className="font-mono text-lg text-purple-400">
                  {((stats.confirmed / stats.total) * 100).toFixed(0)}%
                </div>
                <div className="font-mono text-xs text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Features Grid */}
      <div>
        <h2 className="font-pixel text-xl text-green-400 mb-8 flex items-center gap-4">
          <span className="animate-pulse">▸</span>
          AVAILABLE FEATURES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature) => (
            <PixelCard key={feature.title} className="h-full">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{feature.icon}</span>
                    <div>
                      <h3 className="font-pixel text-sm text-white mb-2">
                        {feature.title}
                      </h3>
                      {feature.status === 'coming-soon' && (
                        <span className="px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 font-pixel text-xs">
                          SOON
                        </span>
                      )}
                      {feature.status === 'beta' && (
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 font-pixel text-xs">
                          BETA
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="font-mono text-sm text-gray-400 mb-6 flex-1">
                  {feature.description}
                </p>

                {feature.status === 'active' || feature.status === 'beta' ? (
                  <Link href={feature.href}>
                    <PixelButton
                      variant="primary"
                      className="w-full !text-xs"
                    >
                      {feature.status === 'beta' ? '[OPEN BETA]' : '[OPEN]'}
                    </PixelButton>
                  </Link>
                ) : (
                  <PixelButton
                    variant="secondary"
                    disabled
                    className="w-full !text-xs opacity-50 cursor-not-allowed"
                  >
                    [COMING SOON]
                  </PixelButton>
                )}
              </div>
            </PixelCard>
          ))}
        </div>
      </div>

      {/* About Section */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-3">
            <h3 className="font-pixel text-sm text-green-400">
              ℹ️ ABOUT SOLANA UTIL-TX
            </h3>
          </div>

          <div className="space-y-4 font-mono text-xs text-gray-400">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-pixel text-sm text-white mb-3">CURRENT FEATURES:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>SOL transfers with priority fees</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Transaction simulation and testing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>SPL token transfers and management</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Address Lookup Table management</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Transaction history tracking</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>SPL token minting and creation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Jupiter token swaps integration</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Developer keypair generator</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    <span>Jito MEV protected bundles</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-pixel text-sm text-white mb-3">COMING SOON:</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⏳</span>
                    <span>Token burning functionality</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⏳</span>
                    <span>Advanced DeFi integrations</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⏳</span>
                    <span>Program deployment tools</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⏳</span>
                    <span>Multi-signature wallet support</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⏳</span>
                    <span>Token analytics and insights</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t-4 border-gray-700">
              <p className="text-center">
                <span className="text-green-400">SOLANA UTIL-TX</span> - 
                Built with Next.js 15, React 19, and pixel-perfect design. 
                Your comprehensive toolkit for Solana blockchain operations.
              </p>
            </div>
          </div>
        </div>
      </PixelCard>
      </div>
    </>
  )
}