'use client'

import {useState, useEffect} from 'react'
import {useWallet} from '@solana/wallet-adapter-react'
import {PixelWalletButton} from '@/components/ui/pixel-wallet-button'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {PixelInput} from '@/components/ui/pixel-input'
import {SwapWalletConnector} from '@/components/ui/swap-wallet-connector'
import {useJupiterSwap} from '@/hooks/useJupiterSwap'
import {useTokenInfo} from '@/contexts/TokenContext'
import {formatTokenAmount} from '@/lib/solana/tokens/token-info'
import {ArrowUpDown, ExternalLink, AlertTriangle, Search, Loader2, Info, CheckCircle} from 'lucide-react'

export default function SwapPage() {
	const {connected, publicKey, wallet, connecting} = useWallet()
	const {quote, loadingQuote, loadingSwap, error, getQuote, executeSwap, reset} = useJupiterSwap()

	// Debug log
	console.log('SwapPage Debug:', {
		connected,
		publicKey: publicKey?.toString(),
		walletName: wallet?.adapter?.name,
		connecting,
		quote: !!quote,
		error,
	})

	const [inputToken, setInputToken] = useState('')
	const [outputToken, setOutputToken] = useState('')
	const [inputAmount, setInputAmount] = useState('')
	const [slippage, setSlippage] = useState('0.5')
	const [transactionSignature, setTransactionSignature] = useState<string | null>(null)

	// Use token info hooks for automatic token info fetching
	const inputTokenData = useTokenInfo(inputToken)
	const outputTokenData = useTokenInfo(outputToken)

	// Debug log
	console.log('SwapPage Debug:', {
		connected,
		publicKey: publicKey?.toString(),
		walletName: wallet?.adapter?.name,
		connecting,
		quote: !!quote,
		error,
		inputToken: inputTokenData.tokenInfo ? `${inputTokenData.symbol} (${inputTokenData.decimals}d)` : 'Unknown',
		outputToken: outputTokenData.tokenInfo ? `${outputTokenData.symbol} (${outputTokenData.decimals}d)` : 'Unknown',
	})

	// Reset quote when input changes
	useEffect(() => {
		if (quote) {
			reset()
		}
	}, [inputToken, outputToken, reset])

	// Auto-fill inputAmount when new quote is available
	useEffect(() => {
		if (quote && inputTokenData.tokenInfo) {
			const formatted = formatDisplayAmount(quote.inAmount, inputTokenData.tokenInfo)
			if (inputAmount !== formatted) {
				setInputAmount(formatted)
			}
		}
	}, [quote, inputTokenData.tokenInfo])

	const handleGetQuote = async () => {
		const slippageBps = Math.floor(parseFloat(slippage) * 100)
		await getQuote(inputToken, outputToken, inputAmount, slippageBps, inputTokenData.decimals)
	}

	const handleExecuteSwap = async (quote: any) => {
		const signature = await executeSwap(quote)
		if (signature) {
			setTransactionSignature(signature)
		}
		return signature
	}

	const swapTokens = () => {
		const temp = inputToken
		setInputToken(outputToken)
		setOutputToken(temp)
		reset()
		// Auto-fill inputAmount if quote already exists
		if (quote && outputTokenData.tokenInfo) {
			const formatted = formatDisplayAmount(quote.outAmount, outputTokenData.tokenInfo)
			setInputAmount(formatted)
		}
	}

	const formatAmount = (amount: string, decimals: number = 6) => {
		return formatTokenAmount(amount, decimals, 6)
	}

	const formatDisplayAmount = (amount: string, tokenInfo: any) => {
		const decimals = tokenInfo?.decimals || 6
		return formatTokenAmount(amount, decimals, 6)
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
		<div className='container mx-auto px-6 py-10 max-w-6xl'>
			{/* Header */}
			<div className='mb-10'>
				<h1 className='font-pixel text-3xl text-green-400 mb-4 flex items-center gap-4'>
					<span className='animate-pulse'>▸</span>
					TOKEN SWAP {connected ? '(WALLET CONNECTED)' : '(JUPITER)'}
				</h1>
				<p className='font-mono text-base text-gray-400'>{connected ? 'Swap tokens with the best rates - wallet connected for execution' : 'Swap tokens with the best rates via Jupiter aggregator - connect wallet to execute'}</p>
			</div>

			{/* MetaMask Warning Banner */}
			{wallet?.adapter?.name?.toLowerCase().includes('metamask') && (
				<div className='mb-6'>
					<PixelCard>
						<div className='p-4 bg-red-900/20 border-2 border-red-600/30'>
							<div className='flex items-start gap-3'>
								<AlertTriangle className='h-6 w-6 text-red-400 mt-0.5 flex-shrink-0' />
								<div>
									<div className='font-pixel text-sm text-red-400 mb-2'>🚫 METAMASK NOT SUPPORTED FOR SWAPS</div>
									<div className='font-mono text-xs text-red-400 mb-3'>MetaMask Solana Snap has critical stability issues causing transaction failures. Swaps are disabled for MetaMask users to prevent fund loss.</div>
									<div className='flex gap-2 flex-wrap'>
										<a href='https://phantom.app/' target='_blank' rel='noopener noreferrer' className='inline-block px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white font-pixel text-xs border border-purple-400 transition-colors'>
											[GET PHANTOM]
										</a>
										<a href='https://solflare.com/' target='_blank' rel='noopener noreferrer' className='inline-block px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-pixel text-xs border border-blue-400 transition-colors'>
											[GET SOLFLARE]
										</a>
									</div>
								</div>
							</div>
						</div>
					</PixelCard>
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
				{/* Left Column: Swap Interface */}
				<div className='space-y-8'>
					{/* Swap Form */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🔄 TOKEN SWAP</h3>
							</div>

							<div className='space-y-6'>
								{/* Input Token */}
								<div className='p-6 bg-gray-800 border-4 border-gray-700'>
									<div className='font-pixel text-sm text-gray-400 mb-4 flex items-center justify-between'>
										<span>FROM TOKEN:</span>
										{inputTokenData.tokenInfo && (
											<span className='text-blue-400'>
												{inputTokenData.symbol} ({inputTokenData.decimals} decimals)
											</span>
										)}
									</div>
									<PixelInput placeholder='Enter token mint address (e.g., So11111111111111111111111111111111111111112)' value={inputToken} onChange={(e) => setInputToken(e.target.value)} />
									<div className='mt-2'>
										<PixelInput type='number' placeholder={`Amount ${inputTokenData.tokenInfo ? `(${inputTokenData.symbol})` : ''}`} value={inputAmount} onChange={(e) => setInputAmount(e.target.value)} step='any' />
									</div>
								</div>

								{/* Swap Button */}
								<div className='flex justify-center'>
									<button onClick={swapTokens} className='p-2 border-4 border-gray-700 hover:border-green-400 transition-colors'>
										<ArrowUpDown className='h-6 w-6 text-gray-400 hover:text-green-400' />
									</button>
								</div>

								{/* Output Token */}
								<div className='p-6 bg-gray-800 border-4 border-gray-700'>
									<div className='font-pixel text-sm text-gray-400 mb-4 flex items-center justify-between'>
										<span>TO TOKEN:</span>
										{outputTokenData.tokenInfo && (
											<span className='text-green-400'>
												{outputTokenData.symbol} ({outputTokenData.decimals} decimals)
											</span>
										)}
									</div>
									<PixelInput placeholder='Enter token mint address' value={outputToken} onChange={(e) => setOutputToken(e.target.value)} />
									<div className='mt-2'>
										<input type='text' readOnly value={quote ? formatDisplayAmount(quote.outAmount, outputTokenData.tokenInfo) : ''} placeholder='Output amount will appear here after getting quote' className={`w-full px-3 py-2 bg-gray-900 border-2 font-mono text-lg ${quote ? 'border-green-400 text-green-400 bg-green-900/10' : 'border-gray-600 text-gray-400'} cursor-not-allowed`} />
										{quote && (
											<div className='mt-1 font-mono text-xs text-green-400'>
												Estimated output: ~{formatDisplayAmount(quote.outAmount, outputTokenData.tokenInfo)} {outputTokenData?.symbol || 'tokens'}
											</div>
										)}
									</div>
								</div>

								{/* Controls */}
								<div className='grid grid-cols-2 gap-4'>
									<PixelInput label='SLIPPAGE (%)' type='number' value={slippage} onChange={(e) => setSlippage(e.target.value)} min='0.1' max='50' step='0.1' />
									<div className='flex items-end'>
										<PixelButton onClick={handleGetQuote} disabled={loadingQuote || !inputToken.trim() || !outputToken.trim() || !inputAmount} className='w-full'>
											{loadingQuote ? (
												<>
													<Loader2 className='h-4 w-4 animate-spin' />
													[GETTING QUOTE...]
												</>
											) : (
												<>
													<Search className='h-4 w-4' />
													[GET QUOTE]
												</>
											)}
										</PixelButton>
									</div>
								</div>

								{/* Error Display */}
								{error && (
									<div className='p-4 bg-red-900/20 border-2 border-red-600/30'>
										<div className='flex items-start gap-2'>
											<AlertTriangle className='h-4 w-4 text-red-400 mt-0.5' />
											<div className='font-mono text-xs text-red-400'>{error}</div>
										</div>
									</div>
								)}
							</div>
						</div>
					</PixelCard>

					{/* Quick Token Suggestions */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-blue-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-blue-400'>🚀 QUICK SELECT</h3>
							</div>

							<div className='space-y-3'>
								<div>
									<div className='font-mono text-xs text-gray-500 mb-1'>FROM Token:</div>
									<div className='flex flex-wrap gap-2'>
										{[
											{symbol: 'SOL', address: 'So11111111111111111111111111111111111111112'},
											{symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'},
											{symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'},
										].map((token) => (
											<button key={`from-${token.symbol}`} className={`px-2 py-1 font-mono text-xs border transition-colors ${inputToken === token.address ? 'border-green-400 text-green-400 bg-green-900/20' : 'border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400'}`} onClick={() => setInputToken(token.address)}>
												{token.symbol}
											</button>
										))}
									</div>
								</div>

								<div>
									<div className='font-mono text-xs text-gray-500 mb-1'>TO Token:</div>
									<div className='flex flex-wrap gap-2'>
										{[
											{symbol: 'SOL', address: 'So11111111111111111111111111111111111111112'},
											{symbol: 'USDC', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'},
											{symbol: 'USDT', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'},
										].map((token) => (
											<button key={`to-${token.symbol}`} className={`px-2 py-1 font-mono text-xs border transition-colors ${outputToken === token.address ? 'border-green-400 text-green-400 bg-green-900/20' : 'border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400'}`} onClick={() => setOutputToken(token.address)}>
												{token.symbol}
											</button>
										))}
									</div>
								</div>
							</div>
						</div>
					</PixelCard>

					{/* Quote Details */}
					{quote && (
						<PixelCard>
							<div className='space-y-4'>
								<div className='border-b-4 border-green-400/20 pb-3'>
									<h3 className='font-pixel text-sm text-green-400'>💰 JUPITER QUOTE</h3>
								</div>

								<div className='space-y-3'>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Input Amount:</span>
										<span className='font-mono text-xs text-white'>
											{formatDisplayAmount(quote.inAmount, inputTokenData.tokenInfo)} {inputTokenData?.symbol || 'tokens'}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Output Amount:</span>
										<span className='font-mono text-xs text-green-400'>
											{formatDisplayAmount(quote.outAmount, outputTokenData.tokenInfo)} {outputTokenData?.symbol || 'tokens'}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Price Impact:</span>
										<span className={`font-mono text-xs ${getPriceImpactColor(quote.priceImpactPct)}`}>{formatPriceImpact(quote.priceImpactPct)}%</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Route Hops:</span>
										<span className='font-mono text-xs text-white'>{quote.routePlan.length} hop(s)</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Swap USD Value:</span>
										<span className='font-mono text-xs text-white'>${parseFloat(quote.swapUsdValue).toFixed(4)}</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Route DEX:</span>
										<span className='font-mono text-xs text-white'>{quote.routePlan[0]?.swapInfo.label || 'Unknown'}</span>
									</div>
								</div>

								<div className={`p-4 border-2 ${connected ? 'bg-green-900/20 border-green-600/30' : 'bg-yellow-900/20 border-yellow-600/30'}`}>
									<div className='flex items-start gap-2'>
										<CheckCircle className={`h-4 w-4 mt-0.5 ${connected ? 'text-green-400' : 'text-yellow-400'}`} />
										<div className={`font-mono text-xs ${connected ? 'text-green-400' : 'text-yellow-400'}`}>{connected ? '✓ Wallet connected! Use the wallet panel on the right to execute this swap.' : '⚠️ This is a quote only. Connect wallet to execute swaps.'}</div>
									</div>
								</div>
							</div>
						</PixelCard>
					)}
				</div>

				{/* Right Column: Wallet & Execution */}
				<div className='space-y-8'>
					{/* Wallet Connection & Swap Execution */}
					<SwapWalletConnector quote={quote} loadingSwap={loadingSwap} onExecuteSwap={handleExecuteSwap} transactionSignature={transactionSignature} />

					{/* Transaction History */}
					{transactionSignature && (
						<PixelCard>
							<div className='space-y-4'>
								<div className='border-b-4 border-purple-400/20 pb-3'>
									<h3 className='font-pixel text-sm text-purple-400'>📋 TRANSACTION HISTORY</h3>
								</div>

								<div className='space-y-3'>
									<div className='p-3 bg-green-900/20 border-2 border-green-600/30'>
										<div className='font-mono text-xs text-green-400 space-y-2'>
											<div className='font-pixel text-xs text-green-400 mb-2'>✓ LATEST SWAP:</div>
											<div className='break-all'>
												{transactionSignature.slice(0, 12)}...{transactionSignature.slice(-12)}
											</div>
											<div className='flex gap-2'>
												<button onClick={() => window.open(`https://explorer.solana.com/tx/${transactionSignature}`, '_blank')} className='flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white font-pixel text-xs border border-blue-400 transition-colors'>
													<ExternalLink className='h-3 w-3' />
													[EXPLORER]
												</button>
												<button onClick={() => window.open(`https://solscan.io/tx/${transactionSignature}`, '_blank')} className='flex items-center gap-1 px-2 py-1 bg-purple-600 hover:bg-purple-700 text-white font-pixel text-xs border border-purple-400 transition-colors'>
													<ExternalLink className='h-3 w-3' />
													[SOLSCAN]
												</button>
											</div>
										</div>
									</div>
								</div>
							</div>
						</PixelCard>
					)}

					{/* Help & Tips */}
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-yellow-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-yellow-400'>💡 SWAP TIPS</h3>
							</div>

							<div className='space-y-3'>
								<div className='p-3 bg-blue-900/20 border-2 border-blue-600/30'>
									<div className='flex items-start gap-2'>
										<Info className='h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0' />
										<div className='font-mono text-xs text-blue-400'>
											<strong>Slippage:</strong> Set higher for volatile tokens. 0.5% is recommended for stable pairs.
										</div>
									</div>
								</div>

								<div className='p-3 bg-green-900/20 border-2 border-green-600/30'>
									<div className='flex items-start gap-2'>
										<CheckCircle className='h-4 w-4 text-green-400 mt-0.5 flex-shrink-0' />
										<div className='font-mono text-xs text-green-400'>
											<strong>Price Impact:</strong> Keep under 1% for best rates. Higher impact means less favorable prices.
										</div>
									</div>
								</div>

								<div className='p-3 bg-yellow-900/20 border-2 border-yellow-600/30'>
									<div className='flex items-start gap-2'>
										<AlertTriangle className='h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0' />
										<div className='font-mono text-xs text-yellow-400'>
											<strong>MEV Protection:</strong> Jupiter automatically routes through best DEXs for optimal prices.
										</div>
									</div>
								</div>
							</div>
						</div>
					</PixelCard>
				</div>
			</div>
		</div>
	)
}
