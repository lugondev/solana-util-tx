'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useConnection } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { TrendingUp, DollarSign, Activity, Clock, AlertTriangle, BarChart3, ExternalLink, RefreshCw } from 'lucide-react'
import JitoTipTracker, { JitoTipData, JitoNetworkStats, JitoTipPercentiles } from '@/lib/solana/jito/tip-tracker'

export default function JitoTipsPage() {
	const { connection } = useConnection()
	const [tipAmount, setTipAmount] = useState('0.0001')
	const [liveData, setLiveData] = useState<JitoTipData[]>([])
	const [percentiles, setPercentiles] = useState<JitoTipPercentiles | null>(null)
	const [networkStats, setNetworkStats] = useState<JitoNetworkStats | null>(null)
	const [fetchError, setFetchError] = useState<string | null>(null)
	const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
	const tipTracker = useMemo(() => new JitoTipTracker(connection), [connection])

	useEffect(() => {
		let cancelled = false

		const refresh = () => {
			if (cancelled) return
			setLiveData(tipTracker.getTipHistory())
			setPercentiles(tipTracker.getLatestPercentiles())
			setNetworkStats(tipTracker.getNetworkStats())
			setLastUpdate(new Date())
		}

		tipTracker.startTracking((sample) => {
			setFetchError(null)
			setLiveData((prev) => [sample, ...prev].slice(0, 50))
			setPercentiles(tipTracker.getLatestPercentiles())
			setNetworkStats(tipTracker.getNetworkStats())
			setLastUpdate(new Date())
		})

		// surface fetch errors by probing once
		tipTracker.fetchTipFloor().catch((err) => {
			if (!cancelled) setFetchError(err instanceof Error ? err.message : 'Failed to fetch Jito tip floor')
		})

		refresh()
		return () => {
			cancelled = true
			tipTracker.stopTracking()
		}
	}, [tipTracker])

	const tipAnalysis = tipTracker.analyzeTipEfficiency(parseFloat(tipAmount) || 0)
	const recommendation = tipTracker.getTipRecommendation(0.85)

	const applyStrategy = (sol: number) => setTipAmount(sol.toFixed(6))

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					JITO TIP TRACKER
				</h1>
				<p className='font-mono text-sm text-gray-400'>Live landed-tip percentiles from Jito&apos;s public block-engine API. Updated every 10 seconds.</p>
			</div>

			{fetchError && (
				<div className='mb-6 p-3 bg-red-900/20 border-2 border-red-600/30 font-mono text-sm text-red-400 flex items-center gap-2'>
					<AlertTriangle className='h-4 w-4' />
					Failed to fetch Jito tip floor: {fetchError}
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left: real percentile data */}
				<div className='lg:col-span-2 space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3 flex items-center justify-between'>
								<h2 className='font-pixel text-sm text-green-400'>📊 LANDED-TIP PERCENTILES (LIVE)</h2>
								<span className='font-mono text-xs text-gray-500 flex items-center gap-1'>
									<RefreshCw className='h-3 w-3' />
									{lastUpdate ? lastUpdate.toLocaleTimeString() : '—'}
								</span>
							</div>

							{percentiles ? (
								<div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
									{[
										{ label: '25th', value: percentiles.p25, color: 'text-green-400' },
										{ label: '50th', value: percentiles.p50, color: 'text-blue-400' },
										{ label: '75th', value: percentiles.p75, color: 'text-yellow-400' },
										{ label: '95th', value: percentiles.p95, color: 'text-orange-400' },
										{ label: '99th', value: percentiles.p99, color: 'text-red-400' },
									].map((p) => (
										<button key={p.label} onClick={() => applyStrategy(p.value)} className='text-center p-3 bg-gray-800 border-2 border-gray-700 hover:border-green-400 transition-colors cursor-pointer'>
											<div className={`font-mono text-base ${p.color}`}>{p.value.toFixed(6)}</div>
											<div className='font-mono text-xs text-gray-400'>{p.label} %ile (SOL)</div>
										</button>
									))}
								</div>
							) : (
								<div className='font-mono text-sm text-gray-400 p-3'>Loading live data from bundles.jito.wtf…</div>
							)}

							{percentiles && (
								<div className='p-3 bg-blue-600/10 border-4 border-blue-600/20'>
									<div className='flex items-center gap-2 mb-2'>
										<TrendingUp className='h-4 w-4 text-blue-400' />
										<span className='font-pixel text-xs text-blue-400'>RECOMMENDATION</span>
									</div>
									<div className='font-mono text-xs text-blue-300'>
										For ~85% landing probability, tip <span className='text-white'>{recommendation.tip.toFixed(6)} SOL</span>. {recommendation.reasoning}
									</div>
									<div className='font-mono text-xs text-gray-500 mt-2'>
										EMA p50 (smoothed) = {percentiles.emaP50.toFixed(6)} SOL · Source: <a href='https://bundles.jito.wtf/api/v1/bundles/tip_floor' target='_blank' rel='noopener noreferrer' className='text-blue-400 underline'>Jito tip-floor API</a>
									</div>
								</div>
							)}
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h2 className='font-pixel text-sm text-green-400'>📡 RECENT SAMPLES</h2>
							</div>

							<div className='max-h-96 overflow-y-auto space-y-2'>
								{liveData.length === 0 && <div className='font-mono text-sm text-gray-500 p-3'>Waiting for first sample…</div>}
								{liveData.map((tip, index) => (
									<div key={index} className='p-3 border-2 border-green-600/30 bg-green-600/5 flex items-center justify-between'>
										<div className='flex items-center gap-3'>
											<div className='w-2 h-2 rounded-full bg-green-400 animate-pulse' />
											<span className='font-mono text-xs text-gray-400'>{new Date(tip.timestamp).toLocaleTimeString()}</span>
										</div>
										<div className='flex items-center gap-4'>
											<span className='font-mono text-sm text-green-400'>p50 = {tip.tip.toFixed(6)} SOL</span>
											{tip.slot > 0 && <span className='font-mono text-xs text-gray-500'>slot {tip.slot.toLocaleString()}</span>}
										</div>
									</div>
								))}
							</div>
						</div>
					</PixelCard>
				</div>

				{/* Right: tools */}
				<div className='space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🧮 TIP CALCULATOR</h3>
							</div>

							<div className='space-y-3'>
								<PixelInput label='TIP AMOUNT (SOL)' type='number' value={tipAmount} onChange={(e) => setTipAmount(e.target.value)} placeholder='0.0001' min='0' step='0.000001' />

								<div className='space-y-2'>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Landing Probability:</span>
										<span className={`font-mono text-xs ${tipAnalysis.expectedSuccessRate >= 0.8 ? 'text-green-400' : tipAnalysis.expectedSuccessRate >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>{(tipAnalysis.expectedSuccessRate * 100).toFixed(0)}%</span>
									</div>
									<div className='flex justify-between'>
										<span className='font-mono text-xs text-gray-400'>Efficiency:</span>
										<span className={`font-mono text-xs ${tipAnalysis.efficiency >= 0.8 ? 'text-green-400' : tipAnalysis.efficiency >= 0.6 ? 'text-yellow-400' : 'text-red-400'}`}>{(tipAnalysis.efficiency * 100).toFixed(0)}%</span>
									</div>
									<div className='font-mono text-xs text-gray-300 leading-relaxed pt-1'>{tipAnalysis.suggestion}</div>
								</div>

								<Link href='/jito/bundle'>
									<PixelButton variant='primary' className='w-full !text-xs'>
										[BUILD BUNDLE WITH THIS TIP] <ExternalLink className='inline h-3 w-3 ml-1' />
									</PixelButton>
								</Link>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🎯 STRATEGIES</h3>
							</div>

							<div className='space-y-3'>
								<button onClick={() => percentiles && applyStrategy(percentiles.p50)} disabled={!percentiles} className='w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors disabled:opacity-50'>
									<div className='flex items-center gap-3'>
										<Activity className='h-4 w-4 text-green-400' />
										<div>
											<div className='font-pixel text-xs text-white'>MATCH p50</div>
											<div className='font-mono text-xs text-gray-400'>{percentiles ? `${percentiles.p50.toFixed(6)} SOL · ~50% landing` : '—'}</div>
										</div>
									</div>
								</button>

								<button onClick={() => percentiles && applyStrategy(percentiles.p75)} disabled={!percentiles} className='w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors disabled:opacity-50'>
									<div className='flex items-center gap-3'>
										<DollarSign className='h-4 w-4 text-yellow-400' />
										<div>
											<div className='font-pixel text-xs text-white'>MATCH p75</div>
											<div className='font-mono text-xs text-gray-400'>{percentiles ? `${percentiles.p75.toFixed(6)} SOL · ~75% landing` : '—'}</div>
										</div>
									</div>
								</button>

								<button onClick={() => percentiles && applyStrategy(percentiles.p95)} disabled={!percentiles} className='w-full text-left p-3 border-4 border-gray-700 hover:border-green-400/50 transition-colors disabled:opacity-50'>
									<div className='flex items-center gap-3'>
										<AlertTriangle className='h-4 w-4 text-red-400' />
										<div>
											<div className='font-pixel text-xs text-white'>MATCH p95</div>
											<div className='font-mono text-xs text-gray-400'>{percentiles ? `${percentiles.p95.toFixed(6)} SOL · ~95% landing` : '—'}</div>
										</div>
									</div>
								</button>
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🌡️ MARKET</h3>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center gap-2'>
										<div className={`w-2 h-2 rounded-full ${networkStats?.competition === 'LOW' ? 'bg-green-400' : networkStats?.competition === 'MEDIUM' ? 'bg-yellow-400' : 'bg-red-400'}`} />
										<span className='font-mono text-xs text-gray-400'>Competition</span>
									</div>
									<span className={`font-mono text-xs ${networkStats?.competition === 'LOW' ? 'text-green-400' : networkStats?.competition === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>{networkStats?.competition ?? '—'}</span>
								</div>

								<div className='flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center gap-2'>
										<BarChart3 className='h-4 w-4 text-purple-400' />
										<span className='font-mono text-xs text-gray-400'>p50 Volatility</span>
									</div>
									<span className={`font-mono text-xs ${networkStats?.volatility === 'LOW' ? 'text-green-400' : networkStats?.volatility === 'MEDIUM' ? 'text-yellow-400' : 'text-red-400'}`}>{networkStats?.volatility ?? '—'}</span>
								</div>

								<div className='flex items-center justify-between p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='flex items-center gap-2'>
										<Clock className='h-4 w-4 text-blue-400' />
										<span className='font-mono text-xs text-gray-400'>Samples (10s)</span>
									</div>
									<span className='font-mono text-xs text-white'>{liveData.length}</span>
								</div>
							</div>
						</div>
					</PixelCard>
				</div>
			</div>
		</div>
	)
}
