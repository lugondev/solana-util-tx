'use client'

import { useState } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import {
	getMint,
	getExtensionTypes,
	ExtensionType,
	getTransferFeeConfig,
	getMintCloseAuthority,
	getNonTransferable,
	getInterestBearingMintConfigState,
	getDefaultAccountState,
	getPermanentDelegate,
	getMetadataPointerState,
	getGroupPointerState,
	getGroupMemberPointerState,
	getTokenGroupState,
	getTokenGroupMemberState,
	getTransferHook,
	getScaledUiAmountConfig,
	getTokenMetadata,
	TOKEN_2022_PROGRAM_ID,
	TOKEN_PROGRAM_ID,
	AccountState,
} from '@solana/spl-token'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { Loader2, AlertTriangle, Search, Hash, Layers } from 'lucide-react'

const EXTENSION_LABELS: Record<number, string> = {
	0: 'Uninitialized',
	1: 'TransferFeeConfig',
	2: 'TransferFeeAmount',
	3: 'MintCloseAuthority',
	4: 'ConfidentialTransferMint',
	5: 'ConfidentialTransferAccount',
	6: 'DefaultAccountState',
	7: 'ImmutableOwner',
	8: 'MemoTransfer',
	9: 'NonTransferable',
	10: 'InterestBearingConfig',
	11: 'CpiGuard',
	12: 'PermanentDelegate',
	13: 'NonTransferableAccount',
	14: 'TransferHook',
	15: 'TransferHookAccount',
	18: 'MetadataPointer',
	19: 'TokenMetadata',
	20: 'GroupPointer',
	21: 'TokenGroup',
	22: 'GroupMemberPointer',
	23: 'TokenGroupMember',
	25: 'ScaledUiAmountConfig',
	26: 'PausableConfig',
	27: 'PausableAccount',
}

type DecodedExtension = {
	id: number
	label: string
	details: Record<string, string | number | null>
}

type MintReport = {
	address: string
	programId: 'spl-token' | 'token-2022'
	decimals: number
	supply: string
	mintAuthority: string | null
	freezeAuthority: string | null
	extensions: DecodedExtension[]
	metadata: { name: string; symbol: string; uri: string; additional: Array<[string, string]> } | null
}

const fmtPk = (pk: PublicKey | null | undefined) => (pk ? pk.toBase58() : null)
const bpsToPercent = (bps: number) => `${(bps / 100).toFixed(2)}%`

const formatAccountState = (s: number) => {
	switch (s) {
		case AccountState.Uninitialized:
			return 'Uninitialized'
		case AccountState.Initialized:
			return 'Initialized'
		case AccountState.Frozen:
			return 'Frozen'
		default:
			return String(s)
	}
}

function decodeExtension(e: ExtensionType, mint: Awaited<ReturnType<typeof getMint>>): DecodedExtension['details'] {
	switch (e) {
		case ExtensionType.TransferFeeConfig: {
			const cfg = getTransferFeeConfig(mint)
			if (!cfg) return {}
			return {
				transferFeeConfigAuthority: fmtPk(cfg.transferFeeConfigAuthority),
				withdrawWithheldAuthority: fmtPk(cfg.withdrawWithheldAuthority),
				withheldAmount: cfg.withheldAmount.toString(),
				newerFee_bps: cfg.newerTransferFee.transferFeeBasisPoints,
				newerFee_pct: bpsToPercent(cfg.newerTransferFee.transferFeeBasisPoints),
				newerFee_max: cfg.newerTransferFee.maximumFee.toString(),
				newerFee_epoch: cfg.newerTransferFee.epoch.toString(),
				olderFee_bps: cfg.olderTransferFee.transferFeeBasisPoints,
				olderFee_pct: bpsToPercent(cfg.olderTransferFee.transferFeeBasisPoints),
			}
		}
		case ExtensionType.MintCloseAuthority: {
			const a = getMintCloseAuthority(mint)
			return { closeAuthority: fmtPk(a?.closeAuthority ?? null) }
		}
		case ExtensionType.NonTransferable: {
			const a = getNonTransferable(mint)
			return { present: a ? 'yes' : 'no' }
		}
		case ExtensionType.InterestBearingConfig: {
			const a = getInterestBearingMintConfigState(mint)
			if (!a) return {}
			return {
				rateAuthority: fmtPk(a.rateAuthority),
				currentRate_bps: a.currentRate,
				currentRate_pct: bpsToPercent(a.currentRate),
				preUpdateRate_bps: a.preUpdateAverageRate,
				initializationTimestamp: a.initializationTimestamp.toString(),
				lastUpdateTimestamp: a.lastUpdateTimestamp.toString(),
			}
		}
		case ExtensionType.DefaultAccountState: {
			const a = getDefaultAccountState(mint)
			return { state: a ? formatAccountState(a.state) : null }
		}
		case ExtensionType.PermanentDelegate: {
			const a = getPermanentDelegate(mint)
			return { delegate: fmtPk(a?.delegate ?? null) }
		}
		case ExtensionType.MetadataPointer: {
			const a = getMetadataPointerState(mint)
			return { authority: fmtPk(a?.authority ?? null), metadataAddress: fmtPk(a?.metadataAddress ?? null) }
		}
		case ExtensionType.GroupPointer: {
			const a = getGroupPointerState(mint)
			return { authority: fmtPk(a?.authority ?? null), groupAddress: fmtPk(a?.groupAddress ?? null) }
		}
		case ExtensionType.GroupMemberPointer: {
			const a = getGroupMemberPointerState(mint)
			return { authority: fmtPk(a?.authority ?? null), memberAddress: fmtPk(a?.memberAddress ?? null) }
		}
		case ExtensionType.TokenGroup: {
			const a = getTokenGroupState(mint)
			return {
				updateAuthority: fmtPk(a?.updateAuthority ?? null),
				mint: fmtPk(a?.mint ?? null),
				size: a?.size?.toString() ?? null,
				maxSize: a?.maxSize?.toString() ?? null,
			}
		}
		case ExtensionType.TokenGroupMember: {
			const a = getTokenGroupMemberState(mint)
			return {
				group: fmtPk(a?.group ?? null),
				mint: fmtPk(a?.mint ?? null),
				memberNumber: a?.memberNumber?.toString() ?? null,
			}
		}
		case ExtensionType.TransferHook: {
			const a = getTransferHook(mint)
			return { authority: fmtPk(a?.authority ?? null), programId: fmtPk(a?.programId ?? null) }
		}
		case ExtensionType.ScaledUiAmountConfig: {
			const a = getScaledUiAmountConfig(mint)
			if (!a) return {}
			return {
				authority: fmtPk(a.authority),
				multiplier: a.multiplier.toString(),
				newMultiplier: a.newMultiplier.toString(),
				newMultiplierEffectiveTimestamp: a.newMultiplierEffectiveTimestamp.toString(),
			}
		}
		default:
			return { note: 'Detected — no decoder wired for this extension yet.' }
	}
}

export default function TokenExtensionsPage() {
	const { connection } = useConnection()
	const [mintAddress, setMintAddress] = useState('')
	const [loading, setLoading] = useState(false)
	const [report, setReport] = useState<MintReport | null>(null)
	const [error, setError] = useState<string | null>(null)

	const inspect = async () => {
		setError(null)
		setReport(null)
		if (!mintAddress.trim()) {
			setError('Enter a token mint address.')
			return
		}

		setLoading(true)
		try {
			const mintPk = new PublicKey(mintAddress.trim())
			const accountInfo = await connection.getAccountInfo(mintPk)
			if (!accountInfo) throw new Error('Account not found on the current network.')

			const programId = accountInfo.owner.equals(TOKEN_2022_PROGRAM_ID) ? 'token-2022' : accountInfo.owner.equals(TOKEN_PROGRAM_ID) ? 'spl-token' : null
			if (!programId) {
				throw new Error(`Account owner is ${accountInfo.owner.toBase58()}, not an SPL-Token / Token-2022 mint.`)
			}

			const mint = await getMint(connection, mintPk, undefined, accountInfo.owner)

			const decoded: DecodedExtension[] = []
			if (programId === 'token-2022' && mint.tlvData.length > 0) {
				const extTypes = getExtensionTypes(mint.tlvData)
				for (const e of extTypes) {
					decoded.push({ id: e, label: EXTENSION_LABELS[e] ?? `Unknown(${e})`, details: decodeExtension(e, mint) })
				}
			}

			let metadata: MintReport['metadata'] = null
			if (programId === 'token-2022') {
				try {
					const tm = await getTokenMetadata(connection, mintPk)
					if (tm) {
						metadata = {
							name: tm.name,
							symbol: tm.symbol,
							uri: tm.uri,
							additional: tm.additionalMetadata.map(([k, v]) => [k, v] as [string, string]),
						}
					}
				} catch {
					// metadata extension may not be present — that's fine
				}
			}

			setReport({
				address: mintPk.toBase58(),
				programId,
				decimals: mint.decimals,
				supply: mint.supply.toString(),
				mintAuthority: fmtPk(mint.mintAuthority),
				freezeAuthority: fmtPk(mint.freezeAuthority),
				extensions: decoded,
				metadata,
			})
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to inspect mint')
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					TOKEN-2022 EXTENSIONS INSPECTOR
				</h1>
				<p className='font-mono text-sm text-gray-400'>Decode every Token-2022 extension on a mint: transfer fees, interest, metadata, transfer hooks, permanent delegate, and more.</p>
			</div>

			<PixelCard>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>🔍 INSPECT A MINT</h3>
					</div>
					<div className='flex flex-col md:flex-row gap-3'>
						<div className='flex-1'>
							<PixelInput label='MINT ADDRESS' value={mintAddress} onChange={(e) => setMintAddress(e.target.value)} placeholder='Token mint pubkey' />
						</div>
						<div className='flex items-end'>
							<PixelButton onClick={inspect} disabled={loading} className='h-12'>
								{loading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Search className='h-4 w-4' />}
								[INSPECT]
							</PixelButton>
						</div>
					</div>
				</div>
			</PixelCard>

			{error && (
				<div className='mt-6 p-3 bg-red-900/20 border-2 border-red-600/30 font-mono text-sm text-red-400 flex items-start gap-2'>
					<AlertTriangle className='h-4 w-4 mt-0.5 flex-shrink-0' />
					{error}
				</div>
			)}

			{report && (
				<div className='mt-6 space-y-6'>
					<PixelCard>
						<div className='space-y-3'>
							<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
								<Hash className='h-4 w-4 text-green-400' />
								<h3 className='font-pixel text-sm text-green-400'>MINT INFO</h3>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs'>
								<KV k='Address' v={report.address} mono />
								<KV k='Program' v={report.programId === 'token-2022' ? 'Token-2022' : 'SPL Token (classic)'} />
								<KV k='Decimals' v={String(report.decimals)} />
								<KV k='Supply' v={report.supply} />
								<KV k='Mint Authority' v={report.mintAuthority ?? 'None (fixed supply)'} mono />
								<KV k='Freeze Authority' v={report.freezeAuthority ?? 'None'} mono />
							</div>
						</div>
					</PixelCard>

					{report.metadata && (
						<PixelCard>
							<div className='space-y-3'>
								<div className='border-b-4 border-green-400/20 pb-3'>
									<h3 className='font-pixel text-sm text-green-400'>📛 ON-CHAIN METADATA</h3>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs'>
									<KV k='Name' v={report.metadata.name} />
									<KV k='Symbol' v={report.metadata.symbol} />
								</div>
								<KV k='URI' v={report.metadata.uri} mono />
								{report.metadata.additional.length > 0 && (
									<div className='space-y-1'>
										<div className='font-pixel text-xs text-gray-400'>Additional fields:</div>
										{report.metadata.additional.map(([k, v]) => (
											<KV key={k} k={k} v={v} mono />
										))}
									</div>
								)}
							</div>
						</PixelCard>
					)}

					<PixelCard>
						<div className='space-y-3'>
							<div className='border-b-4 border-green-400/20 pb-3 flex items-center gap-2'>
								<Layers className='h-4 w-4 text-green-400' />
								<h3 className='font-pixel text-sm text-green-400'>EXTENSIONS ({report.extensions.length})</h3>
							</div>

							{report.programId === 'spl-token' && <div className='p-3 bg-blue-900/20 border-2 border-blue-600/30 font-mono text-xs text-blue-300'>This mint uses the classic SPL Token program — Token-2022 extensions are not applicable.</div>}

							{report.programId === 'token-2022' && report.extensions.length === 0 && <div className='font-mono text-sm text-gray-400'>No extensions are present on this Token-2022 mint.</div>}

							<div className='space-y-3'>
								{report.extensions.map((ext) => (
									<div key={ext.id} className='p-3 bg-gray-800 border-2 border-gray-700 space-y-2'>
										<div className='flex items-center justify-between'>
											<span className='font-pixel text-xs text-green-400'>{ext.label}</span>
											<span className='font-mono text-xs text-gray-500'>id={ext.id}</span>
										</div>
										<div className='space-y-1 font-mono text-xs'>
											{Object.entries(ext.details).map(([k, v]) => (
												<KV key={k} k={k} v={v == null ? 'null' : String(v)} mono />
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					</PixelCard>
				</div>
			)}
		</div>
	)
}

function KV({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
	return (
		<div className='flex flex-col md:flex-row md:items-start md:gap-3'>
			<div className='text-gray-400 md:w-48 md:flex-shrink-0'>{k}</div>
			<div className={`text-white break-all ${mono ? 'font-mono' : ''}`}>{v}</div>
		</div>
	)
}
