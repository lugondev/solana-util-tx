'use client'

import { useEffect, useState } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelWalletButton } from '@/components/ui/pixel-wallet-button'
import {
	Target,
	TrendingUp,
	TrendingDown,
	ExternalLink,
	AlertTriangle,
	Info,
	ArrowUpDown,
	RefreshCw,
	XCircle,
	Loader2,
} from 'lucide-react'

// Jupiter Limit Order v2 — public endpoints documented at https://dev.jup.ag/docs/limit-order-api/
const JUP_LIMIT_BASE = 'https://api.jup.ag/limit/v2'

interface JupOpenOrder {
	publicKey: string
	account: {
		maker: string
		inputMint: string
		outputMint: string
		oriMakingAmount: string
		oriTakingAmount: string
		makingAmount: string
		takingAmount: string
		expiredAt: string | null
		createdAt: string
	}
}

export default function LimitOrdersPage() {
	const { connection } = useConnection()
	const { publicKey, connected, sendTransaction, signTransaction } = useWallet()

	const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy')
	const [tokenIn, setTokenIn] = useState('')
	const [tokenOut, setTokenOut] = useState('')
	const [amount, setAmount] = useState('')
	const [targetPrice, setTargetPrice] = useState('')
	const [expiry, setExpiry] = useState('7')

	const [isCreating, setIsCreating] = useState(false)
	const [isLoadingOrders, setIsLoadingOrders] = useState(false)
	const [cancellingOrder, setCancellingOrder] = useState<string | null>(null)
	const [orders, setOrders] = useState<JupOpenOrder[]>([])
	const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null)

	const swapTokens = () => {
		const tIn = tokenIn
		setTokenIn(tokenOut)
		setTokenOut(tIn)
		setOrderType(orderType === 'buy' ? 'sell' : 'buy')
	}

	const loadOpenOrders = async () => {
		if (!publicKey) return
		setIsLoadingOrders(true)
		try {
			const res = await fetch(`${JUP_LIMIT_BASE}/openOrders?wallet=${publicKey.toBase58()}`)
			if (!res.ok) throw new Error(`Jupiter API returned ${res.status}`)
			const data = (await res.json()) as JupOpenOrder[]
			setOrders(Array.isArray(data) ? data : [])
		} catch (err) {
			setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to fetch open orders' })
		} finally {
			setIsLoadingOrders(false)
		}
	}

	useEffect(() => {
		if (connected && publicKey) {
			void loadOpenOrders()
		} else {
			setOrders([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [connected, publicKey?.toBase58()])

	const createOrder = async () => {
		setMessage(null)
		if (!connected || !publicKey) {
			setMessage({ type: 'error', text: 'Connect a wallet first' })
			return
		}
		if (!tokenIn.trim() || !tokenOut.trim() || !amount || !targetPrice) {
			setMessage({ type: 'error', text: 'Fill in all four fields' })
			return
		}

		setIsCreating(true)
		try {
			const inputMint = new PublicKey(tokenIn.trim())
			const outputMint = new PublicKey(tokenOut.trim())

			// Fetch decimals from chain so user can type human amounts.
			const [inputMintInfo, outputMintInfo] = await Promise.all([
				getMint(connection, inputMint),
				getMint(connection, outputMint),
			])

			const inputAmount = parseFloat(amount)
			const price = parseFloat(targetPrice)
			if (!Number.isFinite(inputAmount) || inputAmount <= 0) throw new Error('Amount must be a positive number')
			if (!Number.isFinite(price) || price <= 0) throw new Error('Target price must be a positive number')

			// "Making amount" = what user gives up. "Taking amount" = what user receives at target price.
			const makingAmountUi = inputAmount
			const takingAmountUi = orderType === 'buy' ? inputAmount / price : inputAmount * price

			const makingAmount = BigInt(Math.floor(makingAmountUi * 10 ** inputMintInfo.decimals)).toString()
			const takingAmount = BigInt(Math.floor(takingAmountUi * 10 ** outputMintInfo.decimals)).toString()

			const expiredAt = parseInt(expiry, 10) > 0 ? Math.floor(Date.now() / 1000) + parseInt(expiry, 10) * 86400 : undefined

			const res = await fetch(`${JUP_LIMIT_BASE}/createOrder`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					inputMint: inputMint.toBase58(),
					outputMint: outputMint.toBase58(),
					maker: publicKey.toBase58(),
					payer: publicKey.toBase58(),
					params: {
						makingAmount,
						takingAmount,
						...(expiredAt ? { expiredAt: expiredAt.toString() } : {}),
					},
					computeUnitPrice: 'auto',
				}),
			})

			if (!res.ok) {
				const text = await res.text()
				throw new Error(`Jupiter createOrder failed (${res.status}): ${text.slice(0, 200)}`)
			}

			const data = (await res.json()) as { tx?: string; transaction?: string; order?: string; error?: string }
			if (data.error) throw new Error(data.error)
			const serialized = data.tx ?? data.transaction
			if (!serialized) throw new Error('Jupiter API did not return a transaction')

			const txBytes = Buffer.from(serialized, 'base64')
			const tx = VersionedTransaction.deserialize(txBytes)

			const signature = await sendTransaction(tx, connection)
			await connection.confirmTransaction(signature, 'confirmed')

			setMessage({ type: 'success', text: `Order created. Signature: ${signature}` })
			await loadOpenOrders()
		} catch (err) {
			setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create limit order' })
		} finally {
			setIsCreating(false)
		}
	}

	const cancelOrder = async (orderPubkey: string) => {
		if (!publicKey || !signTransaction) return
		setMessage(null)
		setCancellingOrder(orderPubkey)
		try {
			const res = await fetch(`${JUP_LIMIT_BASE}/cancelOrders`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					maker: publicKey.toBase58(),
					orders: [orderPubkey],
					computeUnitPrice: 'auto',
				}),
			})
			if (!res.ok) {
				const text = await res.text()
				throw new Error(`Jupiter cancelOrders failed (${res.status}): ${text.slice(0, 200)}`)
			}
			const data = (await res.json()) as { txs?: string[]; transactions?: string[]; error?: string }
			if (data.error) throw new Error(data.error)
			const txs = data.txs ?? data.transactions ?? []
			if (txs.length === 0) throw new Error('Jupiter returned no cancel transactions')

			for (const serialized of txs) {
				const tx = VersionedTransaction.deserialize(Buffer.from(serialized, 'base64'))
				const sig = await sendTransaction(tx, connection)
				await connection.confirmTransaction(sig, 'confirmed')
			}
			setMessage({ type: 'success', text: 'Order cancelled' })
			await loadOpenOrders()
		} catch (err) {
			setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to cancel order' })
		} finally {
			setCancellingOrder(null)
		}
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-7xl'>
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					LIMIT ORDERS
				</h1>
				<p className='font-mono text-sm text-gray-400'>Create and cancel Jupiter limit orders. Orders execute on-chain when your target price is met.</p>
			</div>

			{message && (
				<div className={`mb-6 p-3 border-2 font-mono text-sm flex items-start gap-2 ${message.type === 'error' ? 'bg-red-900/20 border-red-600/30 text-red-400' : message.type === 'success' ? 'bg-green-900/20 border-green-600/30 text-green-400' : 'bg-blue-900/20 border-blue-600/30 text-blue-400'}`}>
					<AlertTriangle className='h-4 w-4 mt-0.5 flex-shrink-0' />
					<span className='break-all'>{message.text}</span>
				</div>
			)}

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
				{/* Left: create order */}
				<div className='lg:col-span-1 space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>🎯 CREATE LIMIT ORDER</h3>
							</div>

							<div className='flex gap-2'>
								<button onClick={() => setOrderType('buy')} className={`flex-1 px-3 py-2 font-pixel text-xs border-2 transition-colors ${orderType === 'buy' ? 'border-green-400 text-green-400 bg-green-400/10' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}>
									<TrendingUp className='h-4 w-4 inline mr-2' />
									BUY
								</button>
								<button onClick={() => setOrderType('sell')} className={`flex-1 px-3 py-2 font-pixel text-xs border-2 transition-colors ${orderType === 'sell' ? 'border-red-400 text-red-400 bg-red-400/10' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}>
									<TrendingDown className='h-4 w-4 inline mr-2' />
									SELL
								</button>
							</div>

							<PixelInput label={orderType === 'buy' ? 'PAY WITH MINT:' : 'SELL MINT:'} value={tokenIn} onChange={(e) => setTokenIn(e.target.value)} placeholder='Token mint address' />

							<div className='flex justify-center'>
								<PixelButton onClick={swapTokens} variant='secondary'>
									<ArrowUpDown className='h-4 w-4' />
									SWAP
								</PixelButton>
							</div>

							<PixelInput label={orderType === 'buy' ? 'BUY MINT:' : 'RECEIVE MINT:'} value={tokenOut} onChange={(e) => setTokenOut(e.target.value)} placeholder='Token mint address' />

							<PixelInput label='AMOUNT (input token)' type='number' value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='0.0' />

							<PixelInput label={`TARGET PRICE (out per in)`} type='number' value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} placeholder='0.0' />

							<div>
								<label className='font-pixel text-xs text-gray-400 block mb-2'>EXPIRES IN:</label>
								<select value={expiry} onChange={(e) => setExpiry(e.target.value)} className='w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 focus:border-green-400 font-mono text-sm text-white'>
									<option value='0'>No expiry</option>
									<option value='1'>1 Day</option>
									<option value='3'>3 Days</option>
									<option value='7'>1 Week</option>
									<option value='14'>2 Weeks</option>
									<option value='30'>1 Month</option>
								</select>
							</div>

							{connected ? (
								<PixelButton onClick={createOrder} disabled={isCreating || !amount || !targetPrice || !tokenIn.trim() || !tokenOut.trim()} className='w-full'>
									{isCreating ? <Loader2 className='h-4 w-4 animate-spin' /> : <Target className='h-4 w-4' />}
									{isCreating ? 'CREATING…' : '[CREATE ORDER]'}
								</PixelButton>
							) : (
								<PixelWalletButton variant='primary' />
							)}
						</div>
					</PixelCard>
				</div>

				{/* Right: open orders + info */}
				<div className='lg:col-span-2 space-y-6'>
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3 flex items-center justify-between'>
								<h3 className='font-pixel text-sm text-green-400'>📋 OPEN ORDERS ({orders.length})</h3>
								<button onClick={loadOpenOrders} disabled={!connected || isLoadingOrders} className='font-pixel text-xs text-gray-400 hover:text-green-400 flex items-center gap-1 disabled:opacity-50'>
									<RefreshCw className={`h-3 w-3 ${isLoadingOrders ? 'animate-spin' : ''}`} />
									REFRESH
								</button>
							</div>

							{!connected && <div className='font-mono text-sm text-gray-400 text-center py-6'>Connect wallet to load your open orders.</div>}

							{connected && orders.length === 0 && !isLoadingOrders && (
								<div className='text-center py-8'>
									<Target className='h-12 w-12 text-gray-600 mx-auto mb-3' />
									<p className='font-mono text-sm text-gray-500'>No open orders.</p>
								</div>
							)}

							<div className='space-y-3'>
								{orders.map((order) => (
									<div key={order.publicKey} className='p-3 bg-gray-800 border-2 border-gray-700 space-y-2'>
										<div className='flex items-center justify-between'>
											<a href={`https://explorer.solana.com/address/${order.publicKey}`} target='_blank' rel='noopener noreferrer' className='font-mono text-xs text-green-400 hover:underline break-all'>
												{order.publicKey.slice(0, 8)}…{order.publicKey.slice(-6)}
											</a>
											<PixelButton onClick={() => cancelOrder(order.publicKey)} disabled={cancellingOrder === order.publicKey} variant='secondary'>
												{cancellingOrder === order.publicKey ? <Loader2 className='h-3 w-3 animate-spin' /> : <XCircle className='h-3 w-3' />}
												CANCEL
											</PixelButton>
										</div>
										<div className='grid grid-cols-2 gap-3 font-mono text-xs'>
											<div>
												<div className='text-gray-400'>In:</div>
												<div className='text-white break-all'>{order.account.inputMint.slice(0, 10)}…</div>
												<div className='text-gray-500'>making: {order.account.makingAmount} / {order.account.oriMakingAmount}</div>
											</div>
											<div>
												<div className='text-gray-400'>Out:</div>
												<div className='text-white break-all'>{order.account.outputMint.slice(0, 10)}…</div>
												<div className='text-gray-500'>taking: {order.account.takingAmount} / {order.account.oriTakingAmount}</div>
											</div>
										</div>
										{order.account.expiredAt && (
											<div className='font-mono text-xs text-gray-500'>Expires: {new Date(parseInt(order.account.expiredAt, 10) * 1000).toLocaleString()}</div>
										)}
									</div>
								))}
							</div>
						</div>
					</PixelCard>

					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-4 border-green-400/20 pb-3'>
								<h3 className='font-pixel text-sm text-green-400'>📖 HOW IT WORKS</h3>
							</div>
							<div className='space-y-3 font-mono text-xs text-gray-400 leading-relaxed'>
								<p>This page wraps Jupiter&apos;s Limit Order v2 API. Orders are escrowed on-chain and a keeper executes them when the price hits your target.</p>
								<ul className='list-disc list-inside space-y-1'>
									<li>Input token mint addresses (not symbols). Decimals are fetched from chain automatically.</li>
									<li>BUY: target = price you&apos;re willing to pay per unit of output (lower is better).</li>
									<li>SELL: target = price you want to receive per unit of input (higher is better).</li>
									<li>Cancelling returns the escrowed input tokens to your wallet minus a small rent.</li>
								</ul>
								<div className='flex items-start gap-2 p-3 bg-blue-900/20 border-2 border-blue-600/30'>
									<Info className='h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0' />
									<div className='text-blue-300'>For a visual order book, see the official <a href='https://jup.ag/limit' target='_blank' rel='noopener noreferrer' className='underline'>jup.ag/limit <ExternalLink className='inline h-3 w-3' /></a>.</div>
								</div>
							</div>
						</div>
					</PixelCard>
				</div>
			</div>
		</div>
	)
}
