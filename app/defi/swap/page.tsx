'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { ArrowUpDown, ExternalLink, AlertTriangle, Search, Loader2, Info, DollarSign } from 'lucide-react'

interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee: any
  priceImpactPct: string
  routePlan: Array<{
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
    bps: number
  }>
  contextSlot: number
  timeTaken: number
  swapUsdValue: string
}

export default function SwapPage() {
  const [inputToken, setInputToken] = useState('')
  const [outputToken, setOutputToken] = useState('')
  const [inputAmount, setInputAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5')
  const [quote, setQuote] = useState<JupiterQuote | null>(null)
  const [loadingQuote, setLoadingQuote] = useState(false)
  const [error, setError] = useState('')

  // Clear quote when input changes
  useEffect(() => {
    if (quote) {
      setQuote(null)
      setError('')
    }
  }, [inputToken, outputToken, inputAmount])

  const getQuote = async () => {
    if (!inputToken.trim() || !outputToken.trim() || !inputAmount || parseFloat(inputAmount) <= 0) {
      setError('Please enter valid token addresses and amount')
      return
    }

    setLoadingQuote(true)
    setError('')
    setQuote(null)
    
    try {
      // Convert amount to smallest unit (assuming 6 decimals for most tokens)
      const amountInSmallestUnit = Math.floor(parseFloat(inputAmount) * 1000000)
      
      // Jupiter Lite API v1 quote endpoint (updated endpoint)
      const response = await fetch(`https://lite-api.jup.ag/swap/v1/quote?inputMint=${inputToken}&outputMint=${outputToken}&amount=${amountInSmallestUnit}&slippageBps=${parseFloat(slippage) * 100}`)
      
      if (!response.ok) {
        throw new Error(`Failed to get quote: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      setQuote(data)
    } catch (err: any) {
      setError(err.message || 'Failed to get quote')
    } finally {
      setLoadingQuote(false)
    }
  }

  const swapTokens = () => {
    const temp = inputToken
    setInputToken(outputToken)
    setOutputToken(temp)
    setQuote(null)
    setError('')
  }

  const formatAmount = (amount: string, decimals: number = 6) => {
    const num = parseInt(amount) / Math.pow(10, decimals)
    return num.toFixed(6)
  }

  const formatPriceImpact = (priceImpact: string) => {
    const impact = parseFloat(priceImpact)
    return isNaN(impact) ? '0.00' : impact.toFixed(2)
  }

  const getPriceImpactColor = (priceImpact: string) => {
    const impact = parseFloat(priceImpact)
    return isNaN(impact) || impact <= 1 ? 'text-green-400' : 'text-red-400'
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          TOKEN SWAP (JUPITER)
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Swap tokens with the best rates via Jupiter aggregator
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Swap Interface */}
        <div className="space-y-6">
          {/* Swap Form */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔄 TOKEN SWAP
                </h3>
              </div>

              <div className="space-y-4">
                {/* Input Token */}
                <div className="p-4 bg-gray-800 border-4 border-gray-700">
                  <div className="font-pixel text-xs text-gray-400 mb-2">FROM TOKEN:</div>
                  <PixelInput
                    placeholder="Enter token mint address (e.g., So11111111111111111111111111111111111111112)"
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                  />
                  <div className="mt-2">
                    <PixelInput
                      type="number"
                      placeholder="Amount"
                      value={inputAmount}
                      onChange={(e) => setInputAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center">
                  <button
                    onClick={swapTokens}
                    className="p-2 border-4 border-gray-700 hover:border-green-400 transition-colors"
                  >
                    <ArrowUpDown className="h-6 w-6 text-gray-400 hover:text-green-400" />
                  </button>
                </div>

                {/* Output Token */}
                <div className="p-4 bg-gray-800 border-4 border-gray-700">
                  <div className="font-pixel text-xs text-gray-400 mb-2">TO TOKEN:</div>
                  <PixelInput
                    placeholder="Enter token mint address"
                    value={outputToken}
                    onChange={(e) => setOutputToken(e.target.value)}
                  />
                  <div className="mt-2">
                    <input
                      type="text"
                      readOnly
                      value={quote ? formatAmount(quote.outAmount) : ''}
                      placeholder="Output amount will appear here after getting quote"
                      className={`w-full px-3 py-2 bg-gray-900 border-2 font-mono text-lg ${
                        quote 
                          ? 'border-green-400 text-green-400 bg-green-900/10' 
                          : 'border-gray-600 text-gray-400'
                      } cursor-not-allowed`}
                    />
                    {quote && (
                      <div className="mt-1 font-mono text-xs text-green-400">
                        Estimated output: ~{formatAmount(quote.outAmount)} tokens
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <PixelInput
                    label="SLIPPAGE (%)"
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    min="0.1"
                    max="50"
                    step="0.1"
                  />
                  <div className="flex items-end">
                    <PixelButton
                      onClick={getQuote}
                      disabled={loadingQuote || !inputToken.trim() || !outputToken.trim() || !inputAmount}
                      className="w-full"
                    >
                      {loadingQuote ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          [GETTING QUOTE...]
                        </>
                      ) : (
                        <>
                          <Search className="h-4 w-4" />
                          [GET QUOTE]
                        </>
                      )}
                    </PixelButton>
                  </div>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                      <div className="font-mono text-xs text-red-400">
                        {error}
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Token Suggestions */}
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-gray-400 mb-3">QUICK SELECT:</div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-xs text-gray-500 mb-1">FROM Token:</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
                          { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
                          { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' }
                        ].map((token) => (
                          <button
                            key={`from-${token.symbol}`}
                            className={`px-2 py-1 font-mono text-xs border transition-colors ${
                              inputToken === token.address
                                ? 'border-green-400 text-green-400 bg-green-900/20'
                                : 'border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400'
                            }`}
                            onClick={() => setInputToken(token.address)}
                          >
                            {token.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <div className="font-mono text-xs text-gray-500 mb-1">TO Token:</div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          { symbol: 'SOL', address: 'So11111111111111111111111111111111111111112' },
                          { symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
                          { symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' }
                        ].map((token) => (
                          <button
                            key={`to-${token.symbol}`}
                            className={`px-2 py-1 font-mono text-xs border transition-colors ${
                              outputToken === token.address
                                ? 'border-green-400 text-green-400 bg-green-900/20'
                                : 'border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400'
                            }`}
                            onClick={() => setOutputToken(token.address)}
                          >
                            {token.symbol}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Quote Details */}
          {quote && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    💰 JUPITER QUOTE
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Input Amount:</span>
                    <span className="font-mono text-xs text-white">
                      {formatAmount(quote.inAmount)} tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Output Amount:</span>
                    <span className="font-mono text-xs text-green-400">
                      {formatAmount(quote.outAmount)} tokens
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Price Impact:</span>
                    <span className={`font-mono text-xs ${getPriceImpactColor(quote.priceImpactPct)}`}>
                      {formatPriceImpact(quote.priceImpactPct)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Route Hops:</span>
                    <span className="font-mono text-xs text-white">
                      {quote.routePlan.length} hop(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Swap USD Value:</span>
                    <span className="font-mono text-xs text-white">
                      ${parseFloat(quote.swapUsdValue).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-mono text-xs text-gray-400">Route DEX:</span>
                    <span className="font-mono text-xs text-white">
                      {quote.routePlan[0]?.swapInfo.label || 'Unknown'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-yellow-900/20 border-2 border-yellow-600/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div className="font-mono text-xs text-yellow-400">
                      This is a quote only. To execute swaps, wallet integration is required.
                    </div>
                  </div>
                </div>

                <PixelButton
                  className="w-full"
                  disabled
                >
                  <DollarSign className="h-4 w-4" />
                  [EXECUTE SWAP] - Requires Wallet
                </PixelButton>
              </div>
            </PixelCard>
          )}

          {/* Implementation Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  � SWAP IMPLEMENTATION
                </h3>
              </div>

              <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-green-400 mt-0.5" />
                  <div className="font-mono text-xs text-green-400">
                    ✓ Jupiter Lite API v1 integration<br/>
                    ✓ Real-time quotes (no API key required)<br/>
                    ✓ Price impact calculation<br/>
                    ✓ Multi-hop routing
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-yellow-400 mb-1">TODO:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Wallet adapter integration</li>
                    <li>• Transaction building</li>
                    <li>• Swap execution</li>
                    <li>• Transaction monitoring</li>
                  </ul>
                </div>

                <div className="p-3 bg-green-900/20 border-2 border-green-600/30">
                  <div className="font-pixel text-xs text-green-400 mb-1">COMPLETED:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Jupiter quote API</li>
                    <li>• Token input validation</li>
                    <li>• Slippage controls</li>
                    <li>• Error handling</li>
                  </ul>
                </div>
              </div>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Market Info */}
        <div className="space-y-6">
          {/* Trading Tips */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  � TRADING TIPS
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Use 0.5-1% slippage for most trades</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Higher slippage for volatile tokens</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Check price impact before swapping</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Consider transaction fees in calculations</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-400 mt-0.5">▸</span>
                  <span>Always verify token mint addresses</span>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Jupiter Integration */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  ℹ️ JUPITER LITE API
                </h3>
              </div>

              <div className="space-y-3 font-mono text-xs text-gray-400">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="text-green-400 font-pixel text-xs mb-2">LITE API ENDPOINTS:</div>
                  <div className="space-y-1">
                    <div>• Quote: /swap/v1/quote</div>
                    <div>• Swap: /swap/v1/swap (POST)</div>
                    <div>• Tokens: /tokens/v2/</div>
                    <div>• Price: /price/v3/</div>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="text-blue-400 font-pixel text-xs mb-2">FEATURES:</div>
                  <div className="space-y-1">
                    <div>• Best route aggregation</div>
                    <div>• Low slippage optimization</div>
                    <div>• Multiple DEX support</div>
                    <div>• MEV protection</div>
                  </div>
                </div>

                <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
                  <div className="text-yellow-400 font-pixel text-xs mb-2">API MIGRATION:</div>
                  <div className="space-y-1">
                    <div>• Old: quote-api.jup.ag/v6/</div>
                    <div>• New: lite-api.jup.ag/swap/v1/</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t-4 border-gray-700">
                <PixelButton
                  onClick={() => window.open('https://dev.jup.ag/docs', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [JUPITER DOCS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>


        </div>
      </div>
    </div>
  )
}