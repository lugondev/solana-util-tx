'use client'

import { useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { Search, ExternalLink, Copy, Wallet, Code, Database, RefreshCw } from 'lucide-react'

interface AccountInfo {
  address: string
  lamports: number
  owner: string
  executable: boolean
  rentEpoch: number
  dataSize: number
  accountType: 'system' | 'program' | 'token' | 'nft' | 'other'
}

export default function AccountExplorerPage() {
  const { connection } = useConnection()
  const [accountAddress, setAccountAddress] = useState('')
  const [accountInfo, setAccountInfo] = useState<AccountInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const handleSearch = async () => {
    if (!accountAddress.trim()) {
      setToast({ message: 'Please enter an account address', type: 'error' })
      return
    }

    setLoading(true)
    setAccountInfo(null)

    try {
      const pubkey = new PublicKey(accountAddress)
      const info = await connection.getAccountInfo(pubkey)

      if (!info) {
        throw new Error('Account not found or invalid address')
      }

      // Determine account type
      let accountType: AccountInfo['accountType'] = 'other'
      if (info.executable) {
        accountType = 'program'
      } else if (info.owner.equals(new PublicKey('11111111111111111111111111111111'))) {
        accountType = 'system'
      } else if (info.owner.equals(new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'))) {
        accountType = 'token'
      }

      setAccountInfo({
        address: accountAddress,
        lamports: info.lamports,
        owner: info.owner.toString(),
        executable: info.executable,
        rentEpoch: info.rentEpoch || 0,
        dataSize: info.data.length,
        accountType
      })

      setToast({
        message: 'Account loaded successfully!',
        type: 'success'
      })
    } catch (error) {
      console.error('Error loading account:', error)
      setToast({
        message: error instanceof Error ? error.message : 'Failed to load account',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setToast({ message: 'Copied to clipboard!', type: 'success' })
  }

  const getAccountTypeIcon = (type: AccountInfo['accountType']) => {
    switch (type) {
      case 'system': return <Wallet className="h-4 w-4 text-blue-400" />
      case 'program': return <Code className="h-4 w-4 text-purple-400" />
      case 'token': return <Database className="h-4 w-4 text-green-400" />
      case 'nft': return <Database className="h-4 w-4 text-yellow-400" />
      default: return <Database className="h-4 w-4 text-gray-400" />
    }
  }

  const getAccountTypeColor = (type: AccountInfo['accountType']) => {
    switch (type) {
      case 'system': return 'text-blue-400'
      case 'program': return 'text-purple-400'
      case 'token': return 'text-green-400'
      case 'nft': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          ACCOUNT EXPLORER
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Explore Solana accounts, programs, and on-chain data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Search & Info */}
        <div className="space-y-6">
          {/* Search */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔍 ACCOUNT SEARCH
                </h3>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <PixelInput
                    label="ACCOUNT ADDRESS"
                    value={accountAddress}
                    onChange={(e) => setAccountAddress(e.target.value)}
                    placeholder="Enter Solana account address"
                  />
                </div>
                <div className="flex items-end">
                  <PixelButton
                    onClick={handleSearch}
                    disabled={loading}
                    className="h-12"
                  >
                    {loading ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    [SEARCH]
                  </PixelButton>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Account Info */}
          {accountInfo && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    📊 ACCOUNT INFORMATION
                  </h3>
                </div>

                <div className="space-y-3">
                  {/* Account Type Badge */}
                  <div className="flex items-center gap-3">
                    {getAccountTypeIcon(accountInfo.accountType)}
                    <span className={`font-pixel text-sm ${getAccountTypeColor(accountInfo.accountType)}`}>
                      {accountInfo.accountType.toUpperCase()} ACCOUNT
                    </span>
                    {accountInfo.executable && (
                      <span className="px-2 py-1 bg-purple-600/20 text-purple-400 border border-purple-600/30 font-pixel text-xs">
                        EXECUTABLE
                      </span>
                    )}
                  </div>

                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-white">
                        {(accountInfo.lamports / 1e9).toFixed(6)}
                      </div>
                      <div className="font-mono text-xs text-gray-400">SOL Balance</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-green-400">
                        {accountInfo.dataSize.toLocaleString()}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Data Size (bytes)</div>
                    </div>
                  </div>

                  {/* Detailed Info */}
                  <div className="space-y-2">
                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-1">ADDRESS:</div>
                      <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                        <span className="font-mono text-xs text-white break-all flex-1">
                          {accountInfo.address}
                        </span>
                        <Copy 
                          className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                          onClick={() => copyToClipboard(accountInfo.address)}
                        />
                        <ExternalLink 
                          className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                          onClick={() => window.open(`https://explorer.solana.com/address/${accountInfo.address}`, '_blank')}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="font-mono text-xs text-gray-400 mb-1">OWNER PROGRAM:</div>
                      <div className="flex items-center gap-2 p-2 bg-gray-800 border-2 border-gray-700">
                        <span className="font-mono text-xs text-white break-all flex-1">
                          {accountInfo.owner}
                        </span>
                        <Copy 
                          className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                          onClick={() => copyToClipboard(accountInfo.owner)}
                        />
                        <ExternalLink 
                          className="h-3 w-3 text-gray-400 cursor-pointer hover:text-green-400"
                          onClick={() => window.open(`https://explorer.solana.com/address/${accountInfo.owner}`, '_blank')}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">RENT EPOCH:</div>
                        <div className="p-2 bg-gray-800 border-2 border-gray-700">
                          <span className="font-mono text-xs text-white">
                            {accountInfo.rentEpoch}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">EXECUTABLE:</div>
                        <div className="p-2 bg-gray-800 border-2 border-gray-700">
                          <span className={`font-mono text-xs ${
                            accountInfo.executable ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {accountInfo.executable ? 'YES' : 'NO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Tools & Examples */}
        <div className="space-y-6">
          {/* Quick Examples */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔧 QUICK EXAMPLES
                </h3>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setAccountAddress('11111111111111111111111111111111')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Wallet className="h-4 w-4 text-blue-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">SYSTEM PROGRAM</div>
                      <div className="font-mono text-xs text-gray-400">
                        Native Solana system program
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAccountAddress('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Database className="h-4 w-4 text-green-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">SPL TOKEN PROGRAM</div>
                      <div className="font-mono text-xs text-gray-400">
                        Standard token program
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setAccountAddress('JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4')}
                  className="w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Code className="h-4 w-4 text-purple-400" />
                    <div>
                      <div className="font-pixel text-xs text-white">JUPITER PROGRAM</div>
                      <div className="font-mono text-xs text-gray-400">
                        DEX aggregator program
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </PixelCard>

          {/* Account Types */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📋 ACCOUNT TYPES
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <Wallet className="h-4 w-4 text-blue-400 mt-0.5" />
                  <div>
                    <div className="text-blue-400 font-pixel text-xs">SYSTEM ACCOUNTS</div>
                    <div>Native SOL wallets and system-owned accounts</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Code className="h-4 w-4 text-purple-400 mt-0.5" />
                  <div>
                    <div className="text-purple-400 font-pixel text-xs">PROGRAM ACCOUNTS</div>
                    <div>Executable programs that process instructions</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-green-400 mt-0.5" />
                  <div>
                    <div className="text-green-400 font-pixel text-xs">TOKEN ACCOUNTS</div>
                    <div>SPL token balances and metadata</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 text-yellow-400 mt-0.5" />
                  <div>
                    <div className="text-yellow-400 font-pixel text-xs">NFT ACCOUNTS</div>
                    <div>Non-fungible token data and metadata</div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Coming Soon */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚀 COMING SOON
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Account data parser & decoder</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Token holder analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Program interaction history</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-400">⏳</span>
                  <span>Real-time account monitoring</span>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <PixelToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}