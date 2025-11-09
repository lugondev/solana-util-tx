'use client'

import { useWallet } from '@solana/wallet-adapter-react'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button'
import { useTokenInfo } from '@/contexts/TokenContext'
import { Wallet, ExternalLink, CheckCircle, AlertCircle, DollarSign, Loader2, RefreshCw, ShieldAlert, Ban } from 'lucide-react'
import { JupiterQuote } from '@/hooks/useJupiterSwap'
import { formatTokenAmount } from '@/lib/solana/tokens/token-info'

interface SwapWalletConnectorProps {
  quote: JupiterQuote | null
  loadingSwap: boolean
  onExecuteSwap: (quote: JupiterQuote) => Promise<string | null>
  transactionSignature?: string | null
  className?: string
}

export function SwapWalletConnector({
  quote,
  loadingSwap,
  onExecuteSwap,
  transactionSignature,
  className = ''
}: SwapWalletConnectorProps) {
  const { connected, publicKey, connecting, wallet } = useWallet()
  
  // Get token info using hooks
  const inputTokenData = useTokenInfo(quote?.inputMint || '')
  const outputTokenData = useTokenInfo(quote?.outputMint || '')

  // Check if using MetaMask (blocked wallet)
  const isMetaMask = wallet?.adapter?.name?.toLowerCase().includes('metamask')

  // If MetaMask is connected, show blocking message instead of normal UI
  if (connected && isMetaMask) {
    return (
      <PixelCard className={className}>
        <div className="space-y-4">
          <div className="border-b-4 border-red-400/20 pb-3">
            <h3 className="font-pixel text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              METAMASK NOT SUPPORTED
            </h3>
          </div>

          <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
            <div className="flex items-start gap-2">
              <Ban className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="font-mono text-xs text-red-400">
                MetaMask Solana Snap is currently blocked due to critical stability issues that cause transaction failures.
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-pixel text-xs text-yellow-400 mb-2">RECOMMENDED WALLETS:</div>
            <div className="space-y-2 font-mono text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <span className="text-green-400">•</span>
                <span className="text-green-400 font-semibold">Phantom</span> - Most reliable for Solana swaps
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">•</span>
                <span className="text-blue-400 font-semibold">Solflare</span> - Excellent web3 experience
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-400">•</span>
                <span className="text-purple-400 font-semibold">Backpack</span> - Modern Solana wallet
              </div>
            </div>
          </div>

          <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
            <div className="font-pixel text-xs text-yellow-400 mb-2">HOW TO SWITCH:</div>
            <div className="font-mono text-xs text-yellow-400 space-y-1">
              <div>1. Disconnect MetaMask using button below</div>
              <div>2. Install Phantom from phantom.app</div>
              <div>3. Connect with your preferred wallet</div>
              <div>4. Import your existing wallet if needed</div>
            </div>
          </div>

          <PixelWalletButton variant="danger" disconnectText="[DISCONNECT METAMASK]" />
          
          <div className="text-center">
            <PixelButton
              onClick={() => window.open('https://phantom.app/', '_blank')}
              variant="secondary"
              className="w-full !bg-purple-600 !border-purple-400 !text-white"
            >
              [DOWNLOAD PHANTOM]
            </PixelButton>
          </div>
        </div>
      </PixelCard>
    )
  }

  // Debug log
  console.log('SwapWalletConnector - connected:', connected, 'publicKey:', publicKey?.toString(), 'wallet:', wallet?.adapter?.name)

  const handleExecuteSwap = async () => {
    if (!quote) return
    await onExecuteSwap(quote)
  }

  const getExplorerUrl = (signature: string) => {
    return `https://explorer.solana.com/tx/${signature}`
  }

  // Show wallet connection UI if not connected AND no publicKey
  if (!connected && !publicKey) {
    return (
      <PixelCard className={className}>
        <div className="space-y-4">
          <div className="border-b-4 border-yellow-400/20 pb-3">
            <h3 className="font-pixel text-sm text-yellow-400 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              WALLET CONNECTION
            </h3>
          </div>

          <div className="p-4 bg-yellow-900/20 border-2 border-yellow-600/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div className="font-mono text-xs text-yellow-400">
                Connect your wallet to execute swaps
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="font-mono text-xs text-gray-400 space-y-1">
              <div>• Supports Phantom, Solflare, and more</div>
              <div>• Secure transaction signing</div>
              <div>• Real-time transaction monitoring</div>
            </div>

            <PixelWalletButton variant="success" connectText="[CONNECT WALLET]" />
          </div>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard className={className}>
      <div className="space-y-4">
        <div className="border-b-4 border-green-400/20 pb-3">
          <h3 className="font-pixel text-sm text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            WALLET CONNECTED - READY TO SWAP
          </h3>
        </div>

        {/* Wallet Info */}
        <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
          <div className="font-mono text-xs text-green-400 space-y-1">
            <div className="font-pixel text-xs mb-1 flex items-center gap-2">
              <CheckCircle className="h-3 w-3" />
              WALLET READY FOR SWAPS:
            </div>
            <div className="break-all text-white">
              {publicKey?.toString().slice(0, 12)}...{publicKey?.toString().slice(-12)}
            </div>
            <div className="text-xs text-blue-400 mt-1">
              {wallet?.adapter?.name || 'Unknown Wallet'}
            </div>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2">
              Connected: {connected ? '✓' : '✗'} | PublicKey: {publicKey ? '✓' : '✗'} | Connecting: {connecting ? '✓' : '✗'}
            </div>
          </div>
        </div>

        {/* MetaMask Warning */}
        {isMetaMask && (
          <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-400 mt-0.5" />
              <div className="font-mono text-xs text-yellow-400">
                ⚠️ MetaMask Solana Snap can be unstable. If swap fails, try refreshing or use Phantom wallet for better reliability.
              </div>
            </div>
          </div>
        )}

        {/* Transaction Status */}
        {transactionSignature && (
          <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
            <div className="font-mono text-xs text-blue-400 space-y-2">
              <div className="font-pixel text-xs">TRANSACTION SENT:</div>
              <div className="break-all">
                {transactionSignature.slice(0, 12)}...{transactionSignature.slice(-12)}
              </div>
              <PixelButton
                onClick={() => window.open(getExplorerUrl(transactionSignature), '_blank')}
                variant="secondary"
                className="w-full !text-xs !py-1"
              >
                <ExternalLink className="h-3 w-3" />
                [VIEW ON EXPLORER]
              </PixelButton>
            </div>
          </div>
        )}

        {/* Swap Execution */}
        <div className="space-y-3">
          {quote ? (
            <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
              <div className="font-mono text-xs text-green-400 space-y-2">
                <div className="font-pixel text-xs text-green-400 mb-2">✓ READY TO SWAP:</div>
                <div className="flex justify-between">
                  <span>From:</span>
                  <span className="text-white">
                    {formatTokenAmount(quote.inAmount, inputTokenData.decimals, 4)} {inputTokenData.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>To:</span>
                  <span className="text-green-400">
                    ~{formatTokenAmount(quote.outAmount, outputTokenData.decimals, 4)} {outputTokenData.symbol}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Price Impact:</span>
                  <span className={parseFloat(quote.priceImpactPct) <= 1 ? 'text-green-400' : 'text-red-400'}>
                    {parseFloat(quote.priceImpactPct).toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
              <div className="font-mono text-xs text-blue-400 text-center">
                ℹ️ Enter token details and get a quote first, then you can execute swap here
              </div>
            </div>
          )}

          {/* Always show swap button when wallet connected */}
          <PixelButton
            onClick={handleExecuteSwap}
            disabled={!quote || loadingSwap || connecting}
            className={`w-full ${!quote ? '!bg-gray-600 !text-gray-300 !border-gray-500' : '!bg-green-400 !text-gray-900 !border-green-400'}`}
          >
            {loadingSwap ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                [WAITING FOR WALLET CONFIRMATION...]
              </>
            ) : !quote ? (
              <>
                <DollarSign className="h-4 w-4" />
                [GET QUOTE FIRST TO ENABLE]
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4" />
                [EXECUTE SWAP NOW]
              </>
            )}
          </PixelButton>

          {/* Additional status info */}
          <div className="p-2 bg-gray-800 border border-gray-600">
            <div className="font-mono text-xs text-gray-400 text-center">
              {!quote 
                ? "Enter token details → Get Quote → Execute Swap"
                : `Ready to swap ${formatTokenAmount(quote.inAmount, inputTokenData.decimals, 2)} ${inputTokenData.symbol} → ${formatTokenAmount(quote.outAmount, outputTokenData.decimals, 2)} ${outputTokenData.symbol}`
              }
            </div>
          </div>

          {quote && (
            <div className={`p-3 border-2 ${loadingSwap ? 'bg-blue-900/20 border-blue-600/30' : 'bg-yellow-900/20 border-yellow-600/30'}`}>
              <div className="flex items-start gap-2">
                {loadingSwap ? (
                  <RefreshCw className="h-4 w-4 mt-0.5 text-blue-400 animate-spin flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-400 flex-shrink-0" />
                )}
                <div className={`font-mono text-xs ${loadingSwap ? 'text-blue-400' : 'text-yellow-400'}`}>
                  {loadingSwap 
                    ? 'Please confirm the transaction in your wallet popup. This may take a moment...'
                    : isMetaMask 
                      ? 'MetaMask detected. If transaction fails, try refreshing page or reconnecting wallet.'
                      : 'Review transaction details before signing. Swaps are irreversible.'
                  }
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wallet Actions */}
        <div className="pt-3 border-t-4 border-gray-700">
          <PixelWalletButton variant="secondary" />
        </div>
      </div>
    </PixelCard>
  )
}