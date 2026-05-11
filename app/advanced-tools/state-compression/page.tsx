'use client'

import { useEffect, useMemo, useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Loader2, AlertTriangle, Search, TreePine, Calculator, Hash } from 'lucide-react'

// Canonical valid (maxDepth, maxBufferSize) pairs accepted by spl-account-compression.
// Source: @solana/spl-account-compression validDepthSizePair.ts
const VALID_DEPTH_BUFFER_PAIRS: ReadonlyArray<{ depth: number; buffer: number }> = [
	{ depth: 3, buffer: 8 },
	{ depth: 5, buffer: 8 },
	{ depth: 14, buffer: 64 },
	{ depth: 14, buffer: 256 },
	{ depth: 14, buffer: 1024 },
	{ depth: 14, buffer: 2048 },
	{ depth: 15, buffer: 64 },
	{ depth: 16, buffer: 64 },
	{ depth: 17, buffer: 64 },
	{ depth: 18, buffer: 64 },
	{ depth: 19, buffer: 64 },
	{ depth: 20, buffer: 64 },
	{ depth: 20, buffer: 256 },
	{ depth: 20, buffer: 1024 },
	{ depth: 20, buffer: 2048 },
	{ depth: 24, buffer: 64 },
	{ depth: 24, buffer: 256 },
	{ depth: 24, buffer: 512 },
	{ depth: 24, buffer: 1024 },
	{ depth: 24, buffer: 2048 },
	{ depth: 26, buffer: 512 },
	{ depth: 26, buffer: 1024 },
	{ depth: 26, buffer: 2048 },
	{ depth: 30, buffer: 512 },
	{ depth: 30, buffer: 1024 },
	{ depth: 30, buffer: 2048 },
]

// Tree account size formula matches getConcurrentMerkleTreeAccountSize() from
// @solana/spl-account-compression. Result is in bytes.
function concurrentMerkleTreeAccountSize(maxDepth: number, maxBufferSize: number, canopyDepth: number): number {
	const headerSize = 8 + 54 // anchor discriminator + ConcurrentMerkleTreeHeader
	const changeLogSize = (maxDepth + 1) * 32 + 8 // path nodes + index
	const treeBodySize = changeLogSize * maxBufferSize + 32 + 32 + 32 + 4 + 32 // active changelogs + rightmost proof + leaf + sequence + activeIndex
	const canopySize = canopyDepth > 0 ? ((1 << (canopyDepth + 1)) - 2) * 32 : 0
	return headerSize + treeBodySize + canopySize
}

const fmtBytes = (b: number): string => {
	if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(2)} MB`
	if (b >= 1024) return `${(b / 1024).toFixed(2)} KB`
	return `${b} B`
}

const fmtNumber = (n: number): string => n.toLocaleString('en-US')

export default function StateCompressionPage() {
	const { connection } = useConnection()

	// Cost calculator state
	const [depth, setDepth] = useState(14)
	const [buffer, setBuffer] = useState(64)
	const [canopy, setCanopy] = useState(0)
	const [rentLamports, setRentLamports] = useState<number | null>(null)
	const [rentLoading, setRentLoading] = useState(false)
	const [rentError, setRentError] = useState<string | null>(null)

	// Tree inspector state
	const [treeAddress, setTreeAddress] = useState('')
	const [inspecting, setInspecting] = useState(false)
	const [inspectError, setInspectError] = useState<string | null>(null)
	const [treeInfo, setTreeInfo] = useState<{
		address: string
		owner: string
		size: number
		lamports: number
		executable: boolean
	} | null>(null)

	const maxLeaves = useMemo(() => Math.pow(2, depth), [depth])
	const accountSize = useMemo(() => concurrentMerkleTreeAccountSize(depth, buffer, canopy), [depth, buffer, canopy])

	useEffect(() => {
		let cancelled = false
		setRentLamports(null)
		setRentError(null)
		setRentLoading(true)
		connection
			.getMinimumBalanceForRentExemption(accountSize)
			.then((l) => {
				if (!cancelled) setRentLamports(l)
			})
			.catch((err: unknown) => {
				if (!cancelled) setRentError(err instanceof Error ? err.message : 'Failed to fetch rent')
			})
			.finally(() => {
				if (!cancelled) setRentLoading(false)
			})
		return () => {
			cancelled = true
		}
	}, [connection, accountSize])

	const availableBuffers = VALID_DEPTH_BUFFER_PAIRS.filter((p) => p.depth === depth).map((p) => p.buffer)
	const availableDepths = Array.from(new Set(VALID_DEPTH_BUFFER_PAIRS.map((p) => p.depth)))

	const onDepthChange = (newDepth: number) => {
		setDepth(newDepth)
		const buffers = VALID_DEPTH_BUFFER_PAIRS.filter((p) => p.depth === newDepth).map((p) => p.buffer)
		if (buffers.length > 0 && !buffers.includes(buffer)) {
			setBuffer(buffers[0])
		}
		if (canopy > newDepth) setCanopy(newDepth)
	}

	const inspectTree = async () => {
		setInspectError(null)
		setTreeInfo(null)
		if (!treeAddress.trim()) {
			setInspectError('Enter a Merkle tree account address.')
			return
		}
		setInspecting(true)
		try {
			const pk = new PublicKey(treeAddress.trim())
			const info = await connection.getAccountInfo(pk)
			if (!info) throw new Error('Account not found on the current network.')
			setTreeInfo({
				address: pk.toBase58(),
				owner: info.owner.toBase58(),
				size: info.data.length,
				lamports: info.lamports,
				executable: info.executable,
			})
		} catch (err) {
			setInspectError(err instanceof Error ? err.message : 'Failed to inspect tree account')
		} finally {
			setInspecting(false)
		}
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					STATE COMPRESSION UTILS
				</h1>
				<p className='font-mono text-sm text-gray-400'>Concurrent Merkle tree (cMT) cost calculator and inspector. Used by Bubblegum / compressed NFTs and any custom compression program.</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
							<Calculator className='h-4 w-4 text-green-400' />
							<h2 className='font-pixel text-sm text-green-400'>TREE COST CALCULATOR</h2>
						</div>

						<div className='space-y-3'>
							<div>
								<label className='font-pixel text-xs text-gray-400 block mb-2'>MAX DEPTH (= log2 of max leaves)</label>
								<select value={depth} onChange={(e) => onDepthChange(parseInt(e.target.value, 10))} className='w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 focus:border-green-400 font-mono text-sm text-white'>
									{availableDepths.map((d) => (
										<option key={d} value={d}>{d} (max {fmtNumber(Math.pow(2, d))} leaves)</option>
									))}
								</select>
							</div>

							<div>
								<label className='font-pixel text-xs text-gray-400 block mb-2'>BUFFER SIZE (concurrent updates)</label>
								<select value={buffer} onChange={(e) => setBuffer(parseInt(e.target.value, 10))} className='w-full px-3 py-2 bg-gray-900 border-2 border-gray-600 focus:border-green-400 font-mono text-sm text-white'>
									{availableBuffers.map((b) => (
										<option key={b} value={b}>{b}</option>
									))}
								</select>
							</div>

							<div>
								<label className='font-pixel text-xs text-gray-400 block mb-2'>CANOPY DEPTH (0 — {depth})</label>
								<input type='range' min={0} max={Math.min(depth, 17)} value={canopy} onChange={(e) => setCanopy(parseInt(e.target.value, 10))} className='w-full' />
								<div className='font-mono text-xs text-gray-400 mt-1'>{canopy} — fewer proof nodes to pass to mint/transfer instructions ({fmtNumber(Math.max(0, depth - canopy))} proof nodes per tx)</div>
							</div>
						</div>

						<div className='pt-3 border-t-2 border-gray-700 space-y-2 font-mono text-xs'>
							<KV k='Max leaves (NFTs)' v={fmtNumber(maxLeaves)} highlight />
							<KV k='Account size' v={`${fmtBytes(accountSize)} (${fmtNumber(accountSize)} bytes)`} />
							<KV k='Rent (one-time)' v={rentLoading ? '…' : rentLamports !== null ? `${(rentLamports / LAMPORTS_PER_SOL).toFixed(4)} SOL (${fmtNumber(rentLamports)} lamports)` : '—'} highlight />
							<KV k='Cost per NFT (amortised)' v={rentLamports !== null ? `${(rentLamports / LAMPORTS_PER_SOL / maxLeaves * 1_000_000).toFixed(2)} micro-SOL` : '—'} />
						</div>

						{rentError && (
							<div className='p-2 bg-red-900/20 border-2 border-red-600/30 font-mono text-xs text-red-400 flex items-start gap-2'>
								<AlertTriangle className='h-3 w-3 mt-0.5 flex-shrink-0' />
								{rentError}
							</div>
						)}

						<div className='p-3 bg-blue-900/20 border-2 border-blue-600/30 font-mono text-xs text-blue-300 leading-relaxed'>
							<strong>Tip:</strong> higher canopy = much cheaper transfers (fewer proof nodes) but bigger upfront rent. For minting-heavy use cases keep canopy low; for transfer-heavy use cases bump canopy to depth − 3.
						</div>
					</div>
				</PixelCard>

				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
							<TreePine className='h-4 w-4 text-green-400' />
							<h2 className='font-pixel text-sm text-green-400'>TREE ACCOUNT INSPECTOR</h2>
						</div>

						<div className='flex flex-col gap-3'>
							<PixelInput label='TREE ADDRESS' value={treeAddress} onChange={(e) => setTreeAddress(e.target.value)} placeholder='Concurrent Merkle tree account pubkey' />
							<PixelButton onClick={inspectTree} disabled={inspecting} className='w-full'>
								{inspecting ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
								[INSPECT TREE]
							</PixelButton>
						</div>

						{inspectError && (
							<div className='p-2 bg-red-900/20 border-2 border-red-600/30 font-mono text-xs text-red-400 flex items-start gap-2'>
								<AlertTriangle className='h-3 w-3 mt-0.5 flex-shrink-0' />
								{inspectError}
							</div>
						)}

						{treeInfo && (
							<div className='space-y-2 font-mono text-xs pt-3 border-t-2 border-gray-700'>
								<KV k='Address' v={treeInfo.address} mono />
								<KV k='Owner' v={treeInfo.owner} mono />
								<KV k='Size' v={`${fmtBytes(treeInfo.size)} (${fmtNumber(treeInfo.size)} bytes)`} />
								<KV k='Rent locked' v={`${(treeInfo.lamports / LAMPORTS_PER_SOL).toFixed(4)} SOL`} highlight />
								<KV k='Executable' v={treeInfo.executable ? 'yes' : 'no'} />
								<div className='pt-2'>
									<a href={`https://explorer.solana.com/address/${treeInfo.address}`} target='_blank' rel='noopener noreferrer' className='text-green-400 hover:underline'>
										View on Solana Explorer →
									</a>
								</div>
							</div>
						)}

						<div className='p-3 bg-gray-800 border-2 border-gray-700 font-mono text-xs text-gray-400 leading-relaxed'>
							The owner of a valid tree account is typically <code className='text-green-400'>cmtDvXumGCrqC1Age74AVPhSRVXJMd8PJS91L8KbNCK</code> (spl-account-compression). Bubblegum trees have an additional Bubblegum-owned tree-config PDA next to it.
						</div>
					</div>
				</PixelCard>
			</div>

			<PixelCard>
				<div className='mt-6 space-y-3'>
					<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
						<Hash className='h-4 w-4 text-green-400' />
						<h2 className='font-pixel text-sm text-green-400'>POPULAR CONFIGURATIONS</h2>
					</div>
					<div className='overflow-x-auto'>
						<table className='w-full font-mono text-xs'>
							<thead>
								<tr className='text-left text-gray-400 border-b border-gray-700'>
									<th className='py-2 pr-3'>Use case</th>
									<th className='py-2 pr-3'>Depth</th>
									<th className='py-2 pr-3'>Buffer</th>
									<th className='py-2 pr-3'>Canopy</th>
									<th className='py-2 pr-3'>Max leaves</th>
									<th className='py-2 pr-3'>Size</th>
									<th className='py-2 pr-3'>Action</th>
								</tr>
							</thead>
							<tbody className='text-gray-300'>
								{[
									{ name: 'Small cNFT drop', d: 14, b: 64, c: 0 },
									{ name: 'Medium drop (transfer-friendly)', d: 14, b: 64, c: 11 },
									{ name: 'Large cNFT collection', d: 20, b: 64, c: 10 },
									{ name: 'High-throughput trading', d: 20, b: 256, c: 11 },
									{ name: 'Massive scale (16M leaves)', d: 24, b: 64, c: 14 },
								].map((preset) => {
									const size = concurrentMerkleTreeAccountSize(preset.d, preset.b, preset.c)
									return (
										<tr key={preset.name} className='border-b border-gray-800'>
											<td className='py-2 pr-3'>{preset.name}</td>
											<td className='py-2 pr-3'>{preset.d}</td>
											<td className='py-2 pr-3'>{preset.b}</td>
											<td className='py-2 pr-3'>{preset.c}</td>
											<td className='py-2 pr-3'>{fmtNumber(Math.pow(2, preset.d))}</td>
											<td className='py-2 pr-3'>{fmtBytes(size)}</td>
											<td className='py-2 pr-3'>
												<button
													className='text-green-400 hover:underline'
													onClick={() => {
														onDepthChange(preset.d)
														setBuffer(preset.b)
														setCanopy(preset.c)
													}}
												>
													Use this
												</button>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>
				</div>
			</PixelCard>
		</div>
	)
}

function KV({ k, v, mono, highlight }: { k: string; v: string; mono?: boolean; highlight?: boolean }) {
	return (
		<div className='flex flex-col md:flex-row md:items-start md:gap-3'>
			<div className='text-gray-400 md:w-48 md:flex-shrink-0'>{k}</div>
			<div className={`break-all ${mono ? 'font-mono' : ''} ${highlight ? 'text-green-400' : 'text-white'}`}>{v}</div>
		</div>
	)
}
