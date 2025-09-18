'use client'

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  // Fetch wallet balance when connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        setLoading(true)
        try {
          const balance = await connection.getBalance(publicKey)
          setBalance(balance / LAMPORTS_PER_SOL)
        } catch (error) {
          console.error('Error fetching balance:', error)
          setBalance(null)
        } finally {
          setLoading(false)
        }
      } else {
        setBalance(null)
      }
    }

    fetchBalance()
  }, [connected, publicKey, connection])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Wallet Status Section */}
        {connected && publicKey && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Wallet Status</h2>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Connected Wallet:</p>
              <p className="text-xs font-mono text-gray-800 break-all bg-gray-50 p-2 rounded">{publicKey.toString()}</p>
              {loading ? (
                <p className="text-sm text-gray-600">Loading balance...</p>
              ) : balance !== null ? (
                <p className="text-sm text-gray-900 font-medium">Balance: {balance.toFixed(4)} SOL</p>
              ) : (
                <p className="text-sm text-red-600">Failed to load balance</p>
              )}
            </div>
          </div>
        )}

        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Solana Utilities
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Powerful tools for managing your Solana wallet and transactions
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-600 text-xl">💰</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Wallet Management</h3>
            <p className="text-gray-600">
              Generate new wallets, check balances, and manage your Solana accounts securely.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-gray-600 text-xl">🔄</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Transaction Tools</h3>
            <p className="text-gray-600">
              Send SOL, create transactions, and monitor your transaction history.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
          {connected ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/wallet"
                className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Manage Wallet
              </a>
              <a
                href="/transaction"
                className="bg-gray-900 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Send Transaction
              </a>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-600 mb-4">Please connect your wallet to get started</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-50">
                <span className="bg-gray-400 text-white px-8 py-3 rounded-lg font-medium cursor-not-allowed">
                  Manage Wallet
                </span>
                <span className="bg-gray-400 text-white px-8 py-3 rounded-lg font-medium cursor-not-allowed">
                  Send Transaction
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}