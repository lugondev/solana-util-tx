import Link from 'next/link'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { Send, TestTube, BarChart3, Zap, type LucideIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
	title: 'Transaction Tools — Send, Simulate, Track',
	description: 'Build, simulate, and track Solana transactions. SOL transfers with priority fees, RPC simulation, enhanced simulation with state diffs, and persistent history.',
	alternates: { canonical: '/transaction' },
}

type Tool = {
	title: string
	description: string
	href: string
	icon: LucideIcon
	cta: string
}

const tools: Tool[] = [
	{
		title: 'SEND SOL',
		description: 'Transfer native SOL with priority-fee tuning and ATA-aware recipients. Builds and signs a versioned transaction locally.',
		href: '/transaction/send',
		icon: Send,
		cta: '[OPEN SEND]',
	},
	{
		title: 'SIMULATE',
		description: 'Dry-run any transaction against the current RPC. Returns program logs, compute units consumed, and any error before you commit fees.',
		href: '/transaction/simulate',
		icon: TestTube,
		cta: '[OPEN SIMULATOR]',
	},
	{
		title: 'ENHANCED SIMULATE',
		description: 'Template-based simulator with account-state diffs, CPI trace, and gas-optimization hints. Useful for debugging Anchor programs.',
		href: '/transaction/enhanced-simulate',
		icon: Zap,
		cta: '[OPEN ENHANCED]',
	},
	{
		title: 'HISTORY',
		description: 'Locally stored log of every transaction sent through the toolkit. Filter by type, status, and date — export/import JSON.',
		href: '/transaction/history',
		icon: BarChart3,
		cta: '[OPEN HISTORY]',
	},
]

export default function TransactionIndexPage() {
	return (
		<div className='space-y-10'>
			<div className='text-center py-10'>
				<h1 className='font-pixel text-3xl md:text-4xl text-green-400 mb-3'>Transaction Tools</h1>
				<p className='font-mono text-base text-gray-300 max-w-2xl mx-auto leading-relaxed'>
					Send, simulate, and track Solana transactions. Each tool runs entirely in the browser and signs with your connected wallet — keys never leave the device.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
				{tools.map((tool) => (
					<PixelCard key={tool.href} className='h-full'>
						<div className='flex flex-col h-full'>
							<div className='flex items-center gap-4 mb-4'>
								<tool.icon className='h-8 w-8 text-green-400' />
								<h2 className='font-pixel text-sm text-white'>{tool.title}</h2>
							</div>
							<p className='font-mono text-sm text-gray-400 leading-relaxed mb-6 flex-1'>{tool.description}</p>
							<Link href={tool.href}>
								<PixelButton variant='primary' className='w-full !text-xs'>
									{tool.cta}
								</PixelButton>
							</Link>
						</div>
					</PixelCard>
				))}
			</div>
		</div>
	)
}
