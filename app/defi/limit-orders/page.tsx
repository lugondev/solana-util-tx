'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  Target, 
  TrendingUp, 
  TrendingDown, 
  ExternalLink,
  AlertTriangle,
  Info,
  ArrowUpDown
} from 'lucide-react'

export default function LimitOrdersPage() {
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
  const [tokenIn, setTokenIn] = useState('')
  const [tokenOut, setTokenOut] = useState('')
  const [amount, setAmount] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [expiry, setExpiry] = useState('7') // days

  const swapTokens = () => {
    setTokenIn(tokenOut)
    setTokenOut(tokenIn)
    setOrderType(orderType === 'buy' ? 'sell' : 'buy')
  }

  const createOrder = () => {
    if (!tokenIn.trim() || !tokenOut.trim() || !amount || !targetPrice) {
      alert('Please fill in all required fields')
      return
    }
    
    alert('Limit order functionality requires integration with order book protocols (Jupiter, OpenBook, etc.)')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          LIMIT ORDERS
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Set price targets for automated trading execution
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Order */}
        <div className="lg:col-span-1 space-y-6">
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🎯 CREATE LIMIT ORDER
                </h3>
              </div>

              {/* Order Type */}
              <div className="flex gap-2">
                <button
                  onClick={() => setOrderType('buy')}
                  className={`flex-1 px-3 py-2 font-pixel text-xs border-2 transition-colors ${
                    orderType === 'buy'
                      ? 'border-green-400 text-green-400 bg-green-400/10'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <TrendingUp className="h-4 w-4 inline mr-2" />
                  BUY
                </button>
                <button
                  onClick={() => setOrderType('sell')}
                  className={`flex-1 px-3 py-2 font-pixel text-xs border-2 transition-colors ${
                    orderType === 'sell'
                      ? 'border-red-400 text-red-400 bg-red-400/10'
                      : 'border-gray-600 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  <TrendingDown className="h-4 w-4 inline mr-2" />
                  SELL
                </button>
              </div>

              {/* Token Selection */}
              <div className="space-y-4">
                <PixelInput
                  label={orderType === 'buy' ? 'PAY WITH TOKEN:' : 'SELL TOKEN:'}
                  value={tokenIn}
                  onChange={(e) => setTokenIn(e.target.value)}
                  placeholder="Enter token mint address"
                />

                <div className="flex justify-center">
                  <PixelButton onClick={swapTokens} variant="secondary" size="sm">
                    <ArrowUpDown className="h-4 w-4" />
                    SWAP
                  </PixelButton>
                </div>

                <PixelInput
                  label={orderType === 'buy' ? 'TO BUY TOKEN:' : 'TO RECEIVE TOKEN:'}
                  value={tokenOut}
                  onChange={(e) => setTokenOut(e.target.value)}
                  placeholder="Enter token mint address"
                />
              </div>

              {/* Amount & Price */}
              <div className="space-y-4">
                <PixelInput
                  label={`AMOUNT`}
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.0"
                />

                <PixelInput
                  label="TARGET PRICE"
                  type="number"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.0"
                />
              </div>

              {/* Expiry */}
              <div>
                <label className="font-pixel text-xs text-gray-400 block mb-2">
                  EXPIRES IN:
                </label>
                <select
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 focus:border-green-400 font-mono text-sm text-white"
                >
                  <option value="1">1 Day</option>
                  <option value="3">3 Days</option>
                  <option value="7">1 Week</option>
                  <option value="14">2 Weeks</option>
                  <option value="30">1 Month</option>
                </select>
              </div>

              {/* Order Summary */}
              {amount && targetPrice && tokenIn && tokenOut && (
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-gray-400 mb-2">ORDER SUMMARY:</div>
                  <div className="space-y-1 font-mono text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Type:</span>
                      <span className="text-white uppercase">{orderType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-white">{amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Target Price:</span>
                      <span className="text-white">{targetPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Expires:</span>
                      <span className="text-white">{expiry} day(s)</span>
                    </div>
                  </div>
                </div>
              )}

              <PixelButton
                onClick={createOrder}
                disabled={!amount || !targetPrice || !tokenIn.trim() || !tokenOut.trim()}
                className="w-full"
              >
                <Target className="h-4 w-4" />
                [CREATE ORDER] - Integration Required
              </PixelButton>
            </div>
          </PixelCard>
        </div>

        {/* Right Column: Info & Tools */}
        <div className="lg:col-span-2 space-y-6">
          {/* No Orders */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📋 ACTIVE ORDERS
                </h3>
              </div>

              <div className="text-center py-12">
                <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  NO ORDERS CREATED
                </h3>
                <p className="font-mono text-sm text-gray-500 mb-4">
                  Create your first limit order to get started
                </p>
                <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30 max-w-md mx-auto">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="font-mono text-xs text-blue-400">
                      Real limit orders require integration with:<br/>
                      • Jupiter Limit Orders<br/>
                      • OpenBook (Serum) order books<br/>
                      • Custom order matching engines
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Implementation Status */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🚧 IMPLEMENTATION STATUS
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800 border-2 border-gray-700">
                  <div className="font-pixel text-xs text-yellow-400 mb-2">TODO:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Jupiter Limit Orders SDK</li>
                    <li>• OpenBook integration</li>
                    <li>• Order matching logic</li>
                    <li>• Price monitoring</li>
                    <li>• Automatic execution</li>
                    <li>• Order management</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-900/20 border-2 border-green-600/30">
                  <div className="font-pixel text-xs text-green-400 mb-2">COMPLETED:</div>
                  <ul className="font-mono text-xs text-gray-400 space-y-1">
                    <li>• Order creation UI</li>
                    <li>• Buy/sell selection</li>
                    <li>• Price/amount inputs</li>
                    <li>• Expiry settings</li>
                    <li>• Order summary</li>
                    <li>• Token swap logic</li>
                  </ul>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* Order Types Info */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📖 ORDER TYPES
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-green-400">📈 BUY LIMIT</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Execute when price drops to or below your target price
                  </p>
                </div>

                <div className="p-3 bg-gray-800 border-2 border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-pixel text-sm text-red-400">📉 SELL LIMIT</span>
                  </div>
                  <p className="font-mono text-xs text-gray-400">
                    Execute when price rises to or above your target price
                  </p>
                </div>

                <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                    <div className="font-mono text-xs text-yellow-400">
                      Orders may not execute if liquidity is insufficient or price moves too quickly
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PixelCard>

          {/* External Platforms */}
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  🔗 LIMIT ORDER PLATFORMS
                </h3>
              </div>

              <div className="space-y-2">
                <PixelButton
                  onClick={() => window.open('https://jup.ag/limit', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [JUPITER LIMIT ORDERS]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://openserum.io', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [OPENBOOK (SERUM)]
                </PixelButton>
                <PixelButton
                  onClick={() => window.open('https://mango.markets', '_blank')}
                  variant="secondary"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4" />
                  [MANGO MARKETS]
                </PixelButton>
              </div>
            </div>
          </PixelCard>
        </div>
      </div>
    </div>
  )
}