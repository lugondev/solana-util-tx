'use client'

import { useState } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { ExternalLink, AlertTriangle, Search, Loader2, Info, TrendingUp, Droplets } from 'lucide-react'

// Raydium public API v3 — documented at https://api-v3.raydium.io/docs/
const RAYDIUM_API = 'https://api-v3.raydium.io'

type RaydiumPool = {
	id: string
	type: string
	mintA: { address: string; symbol: string; decimals: number; logoURI?: string }
	mintB: { address: string; symbol: string; decimals: number; logoURI?: string }
	price: number
	tvl: number
	day?: { volume?: number; volumeFee?: number; feeApr?: number; apr?: number }
	week?: { apr?: number }
	month?: { apr?: number }
	feeRate: number
}

const POPULAR_PAIRS: Array<{ label: string; mintA: string; mintB: string }> = [
	{ label: 'SOL/USDC', mintA: 'So11111111111111111111111111111111111111112', mintB: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
	{ label: 'SOL/USDT', mintA: 'So11111111111111111111111111111111111111112', mintB: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB' },
	{ label: 'RAY/SOL', mintA: '4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R', mintB: 'So11111111111111111111111111111111111111112' },
	{ label: 'JUP/SOL', mintA: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN', mintB: 'So11111111111111111111111111111111111111112' },
]

export default function LiquidityPage() {
	const [tokenAAddress, setTokenAAddress] = useState('')
	const [tokenBAddress, setTokenBAddress] = useState('')
	const [searching, setSearching] = useState(false)
	const [pools, setPools] = useState<RaydiumPool[]>([])
	const [error, setError] = useState<string | null>(null)

	const searchForPools = async (mintA: string, mintB: string) => {
		setError(null)
		if (!mintA.trim() || !mintB.trim()) {
			setError('Enter both token mint addresses (or click a popular pair).')
			return
		}

		setSearching(true)
		setPools([])
		try {
			const url = `${RAYDIUM_API}/pools/info/mint?mint1=${mintA.trim()}&mint2=${mintB.trim()}&poolType=all&poolSortField=liquidity&sortType=desc&pageSize=20&page=1`
			const res = await fetch(url)
			if (!res.ok) throw new Error(`Raydium API returned ${res.status}`)
			const json = await res.json()
			const data = json?.data?.data ?? json?.data ?? []
			setPools(Array.isArray(data) ? (data as RaydiumPool[]) : [])
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch pools from Raydium')
		} finally {
			setSearching(false)
		}
	}

	const handleSearchClick = () => searchForPools(tokenAAddress, tokenBAddress)

	const handlePairClick = (pair: { mintA: string; mintB: string }) => {
		setTokenAAddress(pair.mintA)
		setTokenBAddress(pair.mintB)
		void searchForPools(pair.mintA, pair.mintB)
	}

	const calculateImpermanentLoss = (change: number): string => {
		const ratio = 1 + change / 100
		const il = (2 * Math.sqrt(ratio)) / (1 + ratio) - 1
		return (il * 100).toFixed(2)
	}

	const fmtUsd = (n: number | undefined) => {
		if (!n || !Number.isFinite(n)) return '—'
		if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`
		if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
		if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`
		return `$${n.toFixed(2)}`
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					LIQUIDITY POOLS
				</h1>
				<p className='font-mono text-sm text-gray-400'>Browse live Raydium pools — TVL, fees, APR — and jump to the deposit flow.</p>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
				<div className='xl:col-span-2 space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🔍 FIND LIQUIDITY POOLS</h3>
							</div>

							<div className='grid grid-cols-2 gap-4'>
								<PixelInput label='TOKEN A MINT' value={tokenAAddress} onChange={(e) => setTokenAAddress(e.target.value)} placeholder='So111…11112' />
								<PixelInput label='TOKEN B MINT' value={tokenBAddress} onChange={(e) => setTokenBAddress(e.target.value)} placeholder='EPjF…1v' />
							</div>

							<PixelButton onClick={handleSearchClick} disabled={searching || !tokenAAddress.trim() || !tokenBAddress.trim()} className='w-full'>
								{searching ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
								{searching ? '[SEARCHING…]' : '[SEARCH RAYDIUM POOLS]'}
							</PixelButton>

							<div className='p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='font-pixel text-xs text-gray-400 mb-2'>POPULAR PAIRS:</div>
								<div className='flex flex-wrap gap-2'>
									{POPULAR_PAIRS.map((pair) => (
										<button key={pair.label} onClick={() => handlePairClick(pair)} className='px-2 py-1 font-mono text-xs border border-gray-600 text-gray-400 hover:border-green-400 hover:text-green-400 transition-colors'>
											{pair.label}
										</button>
									))}
								</div>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🏊 POOL RESULTS {pools.length > 0 && <span className='text-gray-400'>({pools.length})</span>}</h3>
							</div>

							{error && (
								<div className='p-3 bg-red-900/20 border-2 border-red-600/30 font-mono text-sm text-red-400 flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 mt-0.5 flex-shrink-0' />
									{error}
								</div>
							)}

							{!searching && pools.length === 0 && !error && (
								<div className='text-center py-10'>
									<Droplets className='h-12 w-12 text-gray-600 mx-auto mb-3' />
									<p className='font-mono text-sm text-gray-500'>Enter both mints or click a popular pair to load live Raydium data.</p>
								</div>
							)}

							<div className='space-y-3'>
								{pools.map((p) => {
									const apr = p.day?.apr ?? p.week?.apr ?? p.month?.apr
									return (
										<div key={p.id} className='p-3 bg-gray-800 border-2 border-gray-700 space-y-2'>
											<div className='flex items-center justify-between flex-wrap gap-2'>
												<div className='flex items-center gap-2'>
													<span className='font-pixel text-xs text-white'>{p.mintA.symbol || p.mintA.address.slice(0, 4)} / {p.mintB.symbol || p.mintB.address.slice(0, 4)}</span>
													<span className='font-mono text-xs text-gray-500 uppercase'>{p.type}</span>
												</div>
												<a href={`https://raydium.io/liquidity/increase/?mode=add&pool_id=${p.id}`} target='_blank' rel='noopener noreferrer' className='font-mono text-xs text-green-400 hover:underline flex items-center gap-1'>
													DEPOSIT ON RAYDIUM <ExternalLink className='h-3 w-3' />
												</a>
											</div>
											<div className='grid grid-cols-2 md:grid-cols-5 gap-3 font-mono text-xs'>
												<div>
													<div className='text-gray-400'>TVL</div>
													<div className='text-white'>{fmtUsd(p.tvl)}</div>
												</div>
												<div>
													<div className='text-gray-400'>Price</div>
													<div className='text-white'>{p.price ? p.price.toFixed(6) : '—'}</div>
												</div>
												<div>
													<div className='text-gray-400'>Volume 24h</div>
													<div className='text-white'>{fmtUsd(p.day?.volume)}</div>
												</div>
												<div>
													<div className='text-gray-400'>Fees 24h</div>
													<div className='text-white'>{fmtUsd(p.day?.volumeFee)}</div>
												</div>
												<div>
													<div className='text-gray-400'>APR</div>
													<div className='text-green-400'>{apr ? `${apr.toFixed(2)}%` : '—'}</div>
												</div>
											</div>
											<div className='font-mono text-xs text-gray-500 break-all'>Pool: {p.id}</div>
										</div>
									)
								})}
							</div>
						</div>
					</PixelCard>
				</div>

				<div className='space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>⚠️ IL CALCULATOR</h3>
							</div>

							<div className='space-y-3'>
								<p className='font-mono text-xs text-gray-400'>Impermanent loss when one side moves up by:</p>

								<div className='space-y-2'>
									{[25, 50, 100, 200, 500].map((change) => (
										<div key={change} className='flex justify-between'>
											<span className='font-mono text-xs text-gray-400'>+{change}% price change:</span>
											<span className='font-mono text-xs text-red-400'>-{calculateImpermanentLoss(change)}%</span>
										</div>
									))}
								</div>

								<div className='pt-3 border-t-2 border-gray-700 flex items-start gap-2'>
									<AlertTriangle className='h-4 w-4 text-yellow-400 mt-0.5' />
									<p className='font-mono text-xs text-gray-400'>IL is the opportunity cost vs holding the same tokens outside the pool. Concentrated-liquidity (CLMM) pools amplify both fees and IL.</p>
								</div>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🏦 DEX PROTOCOLS</h3>
							</div>

							<div className='space-y-3'>
								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center justify-between mb-2'>
										<span className='font-pixel text-sm text-white'>Raydium</span>
										<span className='font-mono text-xs text-green-400'>AMM + CLMM</span>
									</div>
									<p className='font-mono text-xs text-gray-400'>Live data above is from Raydium API v3.</p>
								</div>

								<div className='p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center justify-between mb-2'>
										<span className='font-pixel text-sm text-white'>Orca</span>
										<span className='font-mono text-xs text-blue-400'>Whirlpools</span>
									</div>
									<p className='font-mono text-xs text-gray-400'>Browse Orca pools at the link below.</p>
								</div>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🔗 EXTERNAL DEX UIs</h3>
							</div>

							<div className='space-y-2'>
								<PixelButton onClick={() => window.open('https://raydium.io/liquidity-pools/', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[RAYDIUM POOLS]
								</PixelButton>
								<PixelButton onClick={() => window.open('https://www.orca.so/pools', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[ORCA WHIRLPOOLS]
								</PixelButton>
								<PixelButton onClick={() => window.open('https://jup.ag/portfolio', '_blank')} variant='secondary' className='w-full'>
									<ExternalLink className='h-4 w-4' />
									[JUPITER PORTFOLIO]
								</PixelButton>
							</div>

							<div className='p-3 bg-blue-900/20 border-2 border-blue-600/30 flex items-start gap-2'>
								<Info className='h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0' />
								<p className='font-mono text-xs text-blue-400'>Data source: Raydium API v3. Deposit and withdrawal flows happen on Raydium&apos;s own UI for safety.</p>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-3'>
							<div className='flex items-center gap-2'>
								<TrendingUp className='h-4 w-4 text-green-400' />
								<span className='font-pixel text-sm text-green-400'>WHAT YOU CAN DO HERE</span>
							</div>
							<ul className='font-mono text-xs text-gray-400 list-disc list-inside space-y-1 leading-relaxed'>
								<li>Find every Raydium pool for any token pair</li>
								<li>Compare AMM vs CLMM by TVL, volume, fees, APR</li>
								<li>Open the deposit flow on Raydium with one click</li>
								<li>Estimate impermanent loss before depositing</li>
							</ul>
						</div>
					</PixelCard>
				</div>
			</div>
		</div>
	)
}
