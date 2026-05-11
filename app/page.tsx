'use client'

import Link from 'next/link'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import {useWallet, useConnection} from '@solana/wallet-adapter-react'
import {PixelWalletButton} from '@/components/ui/pixel-wallet-button'
import {useState, useEffect} from 'react'
import {useTransactionHistory} from '@/lib/transaction-history'
import {LAMPORTS_PER_SOL} from '@solana/web3.js'
import {Wallet, Zap, TestTube, BarChart3, Coins, Clipboard, Wrench, Search, Factory, Globe, Hammer, Sparkles, Package, Rocket, FileText, Info, LucideIcon} from 'lucide-react'

export default function HomePage() {
	const {publicKey, connected} = useWallet()
	const {connection} = useConnection()
	const {getStatistics} = useTransactionHistory()

	const [stats, setStats] = useState<any>(null)
	const [balance, setBalance] = useState<number | null>(null)

	useEffect(() => {
		setStats(getStatistics())
	}, [])

	useEffect(() => {
		if (connected && publicKey) {
			connection
				.getBalance(publicKey)
				.then((bal) => {
					setBalance(bal / LAMPORTS_PER_SOL)
				})
				.catch(console.error)
		}
	}, [connected, publicKey, connection])

	// Structured data for SEO
	const structuredData = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		'name': 'Solana Utility Tools',
		'alternateName': 'SolanaUtils',
		'description': 'Comprehensive Solana utility platform for token management, DeFi operations, transaction building, Jito bundles, and developer tools',
		'url': 'https://solutil.dev',
		'applicationCategory': 'FinanceApplication',
		'operatingSystem': 'Web',
		'offers': {
			'@type': 'Offer',
			'price': '0',
			'priceCurrency': 'USD',
		},
		'author': {
			'@type': 'Person',
			'name': 'LugonDev',
			'url': 'https://github.com/lugondev',
		},
		'keywords': 'Solana, blockchain, cryptocurrency, DeFi, tokens, transaction, wallet, developer tools',
		'featureList': ['SOL transfers with priority fees', 'Transaction simulation and testing', 'SPL token management', 'Address Lookup Table management', 'Jupiter token swaps', 'Jito MEV protected bundles', 'Developer tools and utilities'],
		'screenshot': 'https://solutil.dev/og-image.svg',
	}

	// Organization schema with support contact (helps Knowledge Panel + AI Overviews)
	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'name': 'Solana Utility Tools',
		'alternateName': 'SolanaUtils',
		'url': 'https://solutil.dev',
		'logo': 'https://solutil.dev/icon-512.svg',
		'description': '40+ professional tools for Solana blockchain development, DeFi trading, transaction building, and developer utilities.',
		'sameAs': ['https://github.com/lugondev'],
		'contactPoint': {
			'@type': 'ContactPoint',
			'email': 'tegufy@gmail.com',
			'contactType': 'Customer Support',
			'availableLanguage': ['English', 'Vietnamese'],
		},
	}

	// FAQ schema — matches the visible FAQ section below; AI assistants pull from this directly
	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'mainEntity': [
			{
				'@type': 'Question',
				'name': 'Is Solana Utility Tools free to use?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Yes — every tool on solutil.dev is 100% free with no signup, no API keys, and no usage limits. The platform runs entirely in your browser; we never charge for transactions or store your data on a backend.',
				},
			},
			{
				'@type': 'Question',
				'name': 'Do I need to connect my wallet to use the tools?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Most read-only tools (transaction parser, Borsh inspector, vanity address generator, PDA finder) work without a wallet. Connecting a wallet is only required for tools that send signed transactions — SOL transfer, token mint, Jupiter swap, ALT creation, and Jito bundles.',
				},
			},
			{
				'@type': 'Question',
				'name': 'Which Solana networks are supported?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Mainnet-beta, Devnet, and Testnet. Switch networks anytime via the network switcher in the top bar — your wallet and all tools react instantly. Custom RPC endpoints are also supported in the settings panel.',
				},
			},
			{
				'@type': 'Question',
				'name': 'How do Jito bundles protect against MEV?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Jito bundles submit your transactions through Jito\'s block-engine instead of the public mempool. Bundled transactions execute atomically in the same slot, blocking sandwich attacks and frontrunning. The bundle builder lets you tip validators directly to prioritize inclusion.',
				},
			},
			{
				'@type': 'Question',
				'name': 'Does Solana Utility Tools store my private keys or transaction data?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'No. All key generation (vanity addresses, bulk keypairs) and transaction signing happen locally in your browser — keys never leave your device. Transaction history is stored in browser localStorage only and can be cleared at any time.',
				},
			},
			{
				'@type': 'Question',
				'name': 'How do I report a bug or request a feature?',
				'acceptedAnswer': {
					'@type': 'Answer',
					'text': 'Email tegufy@gmail.com with a description and screenshot if applicable, or open an issue on GitHub at github.com/lugondev. Bug reports usually get a fix within 48 hours; new tool requests are reviewed weekly.',
				},
			},
		],
	}

	const features: Array<{
		title: string
		description: string
		href: string
		icon: LucideIcon
		status: 'active' | 'beta' | 'coming-soon'
	}> = [
		{
			title: 'WALLET',
			description: 'Connect and manage your Solana wallet',
			href: '/wallet',
			icon: Wallet,
			status: 'active',
		},
		{
			title: 'SEND SOL',
			description: 'Transfer SOL with priority fees',
			href: '/transaction/send',
			icon: Zap,
			status: 'active',
		},
		{
			title: 'SIMULATE TX',
			description: 'Test transactions before sending',
			href: '/transaction/simulate',
			icon: TestTube,
			status: 'active',
		},
		{
			title: 'TX HISTORY',
			description: 'Track all your transactions',
			href: '/transaction/history',
			icon: BarChart3,
			status: 'active',
		},
		{
			title: 'TOKEN TRANSFER',
			description: 'Transfer SPL tokens',
			href: '/tokens/transfer',
			icon: Coins,
			status: 'active',
		},
		{
			title: 'CREATE ALT',
			description: 'Create Address Lookup Tables',
			href: '/alt/create',
			icon: Clipboard,
			status: 'active',
		},
		{
			title: 'MANAGE ALT',
			description: 'Track and manage ALTs',
			href: '/alt/manage',
			icon: Wrench,
			status: 'active',
		},
		{
			title: 'ALT EXPLORER',
			description: 'Explore ALT contents and benefits',
			href: '/alt/explorer',
			icon: Search,
			status: 'active',
		},
		{
			title: 'TOKEN MINT',
			description: 'Create new SPL tokens',
			href: '/tokens/mint',
			icon: Factory,
			status: 'active',
		},
		{
			title: 'JUPITER SWAP',
			description: 'Token swapping with best rates',
			href: '/defi/swap',
			icon: Globe,
			status: 'active',
		},
		{
			title: 'DEV TOOLS',
			description: 'Developer utilities and tools',
			href: '/dev-tools',
			icon: Hammer,
			status: 'active',
		},
		{
			title: 'TX PARSER',
			description: 'Decode raw transactions to human-readable',
			href: '/dev-tools/transaction-parser',
			icon: Search,
			status: 'active',
		},
		{
			title: 'VANITY ADDRESS',
			description: 'Generate custom addresses with prefixes',
			href: '/dev-tools/vanity-generator',
			icon: Sparkles,
			status: 'active',
		},
		{
			title: 'BULK KEYPAIRS',
			description: 'Generate multiple wallets at once',
			href: '/dev-tools/bulk-keypair',
			icon: Package,
			status: 'active',
		},
		{
			title: 'JITO BUNDLES',
			description: 'MEV protected transaction bundles',
			href: '/jito/bundle',
			icon: Rocket,
			status: 'active',
		},
		{
			title: 'BORSH INSPECTOR',
			description: 'Decode/encode Borsh data with schemas',
			href: '/data-tools/borsh-inspector',
			icon: Search,
			status: 'active',
		},
		{
			title: 'EVENT LOG PARSER',
			description: 'Parse transaction logs and events',
			href: '/data-tools/event-parser',
			icon: BarChart3,
			status: 'active',
		},
		{
			title: 'PROGRAM VERSIONING',
			description: 'Manage program versions and upgrades',
			href: '/advanced-tools/program-versioning',
			icon: FileText,
			status: 'active',
		},
		{
			title: 'DATA TOOLS',
			description: 'Data processing and analysis suite',
			href: '/data-tools',
			icon: BarChart3,
			status: 'active',
		},
		{
			title: 'ADVANCED TOOLS',
			description: 'Enterprise Solana development tools',
			href: '/advanced-tools',
			icon: Rocket,
			status: 'active',
		},
	]

	return (
		<>
			{/* Structured Data for SEO + GEO (AI citation) */}
			<script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(structuredData)}} />
			<script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(organizationSchema)}} />
			<script type='application/ld+json' dangerouslySetInnerHTML={{__html: JSON.stringify(faqSchema)}} />

			<div className='space-y-10'>
				{/* Hero Section */}
				<div className='text-center py-16'>
					<div className='flex items-center justify-center mb-8'>
						<div className='w-20 h-20 bg-green-400 border-4 border-green-400 animate-pulse mr-6' />
						<div>
							<h1 className='font-pixel text-4xl text-green-400 mb-3'>SOLANA UTIL-TX</h1>
							<p className='font-mono text-lg text-gray-400'>Ultimate Solana transaction utility toolkit</p>
						</div>
					</div>

					{!connected ? (
						<div className='space-y-6'>
							<p className='font-mono text-sm text-gray-500 mb-8'>Connect your wallet to start using advanced Solana features</p>
							<PixelWalletButton variant='success' />
						</div>
					) : (
						<div className='space-y-6'>
							<p className='font-mono text-sm text-green-400'>Welcome back! Ready to build some transactions?</p>
							{balance !== null && <p className='font-mono text-sm text-gray-400'>Balance: {balance.toFixed(4)} SOL</p>}
						</div>
					)}
				</div>

				{/* Answer-Ready intro for SEO/GEO — direct answer in first 80 words */}
				<PixelCard>
					<div className='space-y-3 font-mono text-sm text-gray-300 leading-relaxed'>
						<p>
							<span className='text-green-400 font-bold'>Solana Utility Tools</span> is a free, browser-based platform with 40+ professional utilities for Solana blockchain development — transaction parsing, Jupiter swaps, Jito MEV bundles, SPL token mint/burn/transfer, vanity address generation, and Address Lookup Tables. No signup, no API keys, no fees.
						</p>
						<p>
							Built for Solana developers, traders, and power users on Mainnet, Devnet, and Testnet. All key generation and signing happens locally in your browser — private keys never leave your device. Compatible with Phantom, Solflare, Backpack, and every major Solana wallet.
						</p>
						<p className='text-xs text-gray-500'>
							Updated: May 2026 · Need help? Email <a href='mailto:tegufy@gmail.com' className='text-green-400 hover:text-green-300 underline'>tegufy@gmail.com</a>
						</p>
					</div>
				</PixelCard>

				{/* Stats Section */}
				{connected && stats && stats.total > 0 && (
					<PixelCard>
						<div className='space-y-4'>
							<div className='border-b-2 border-green-400/20 pb-3'>
								<div className='flex items-center gap-2'>
									<BarChart3 className='h-4 w-4 text-green-400' />
									<h3 className='font-pixel text-sm text-green-400'>YOUR ACTIVITY</h3>
								</div>
							</div>

							<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
								<div className='text-center p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-mono text-lg text-white'>{stats.total}</div>
									<div className='font-mono text-xs text-gray-400'>Transactions</div>
								</div>
								<div className='text-center p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-mono text-lg text-green-400'>{stats.confirmed}</div>
									<div className='font-mono text-xs text-gray-400'>Confirmed</div>
								</div>
								{stats.totalVolume > 0 && (
									<div className='text-center p-3 bg-gray-800 border-2 border-gray-700'>
										<div className='font-mono text-lg text-blue-400'>{stats.totalVolume.toFixed(2)}</div>
										<div className='font-mono text-xs text-gray-400'>SOL Volume</div>
									</div>
								)}
								<div className='text-center p-3 bg-gray-800 border-2 border-gray-700'>
									<div className='font-mono text-lg text-purple-400'>{((stats.confirmed / stats.total) * 100).toFixed(0)}%</div>
									<div className='font-mono text-xs text-gray-400'>Success Rate</div>
								</div>
							</div>
						</div>
					</PixelCard>
				)}

				{/* Features Grid */}
				<div>
					<h2 className='font-pixel text-xl text-green-400 mb-8 flex items-center gap-4'>
						<span className='animate-pulse'>▸</span>
						AVAILABLE FEATURES
					</h2>

					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
						{features.map((feature) => (
							<PixelCard key={feature.title} className='h-full'>
								<div className='flex flex-col h-full'>
									<div className='flex items-start justify-between mb-5'>
										<div className='flex items-center gap-4'>
											<feature.icon className='h-8 w-8 text-green-400' />
											<div>
												<h3 className='font-pixel text-sm text-white mb-2'>{feature.title}</h3>
												{feature.status === 'coming-soon' && <span className='px-3 py-1 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 font-pixel text-xs'>SOON</span>}
												{feature.status === 'beta' && <span className='px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-600/30 font-pixel text-xs'>BETA</span>}
											</div>
										</div>
									</div>

									<p className='font-mono text-sm text-gray-400 mb-6 flex-1'>{feature.description}</p>

									{feature.status === 'active' || feature.status === 'beta' ? (
										<Link href={feature.href}>
											<PixelButton variant='primary' className='w-full !text-xs'>
												{feature.status === 'beta' ? '[OPEN BETA]' : '[OPEN]'}
											</PixelButton>
										</Link>
									) : (
										<PixelButton variant='secondary' disabled className='w-full !text-xs opacity-50 cursor-not-allowed'>
											[COMING SOON]
										</PixelButton>
									)}
								</div>
							</PixelCard>
						))}
					</div>
				</div>

				{/* About Section */}
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-2 border-green-400/20 pb-3'>
							<div className='flex items-center gap-2'>
								<Info className='h-4 w-4 text-green-400' />
								<h3 className='font-pixel text-sm text-green-400'>ABOUT SOLANA DEVELOPER TOOLKIT</h3>
							</div>
						</div>

						<div className='space-y-4 font-mono text-xs text-gray-400'>
							<p className='text-gray-300 leading-relaxed mb-6'>Your all-in-one Solana blockchain development platform featuring 40+ specialized tools. From transaction parsing and program deployment to advanced DeFi integrations and data analysis, this comprehensive suite empowers developers, traders, and blockchain enthusiasts with professional-grade utilities for every aspect of Solana development.</p>

							<div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
								<div>
									<h4 className='font-pixel text-sm text-white mb-3'>CORE CATEGORIES:</h4>
									<div className='space-y-2'>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Developer Tools (5 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Transaction Management (4 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Token Operations (5 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Account & Wallet Tools (5 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>DeFi & Trading (3 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Advanced Solana Features (6 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Data Processing & Analysis (3 tools)</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Jito MEV Protection (2 tools)</span>
										</div>
									</div>
								</div>

								<div>
									<h4 className='font-pixel text-sm text-white mb-3'>KEY FEATURES:</h4>
									<div className='space-y-2'>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Transaction parser & decoder</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Vanity address generator</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Bulk keypair generation</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Program deployment tools</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>PDA finder & brute forcer</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Token extensions manager</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>State compression utilities</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Jupiter DEX aggregation</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Multisig wallet support</span>
										</div>
										<div className='flex items-start gap-2'>
											<span className='text-green-400 mt-0.5'>✓</span>
											<span>Global search with hotkeys (/ or Cmd+K)</span>
										</div>
									</div>
								</div>
							</div>

							<div className='pt-4 border-t-2 border-gray-700'>
								<p className='text-center'>
									<span className='text-green-400'>SOLANA DEVELOPER TOOLKIT</span> - Built with Next.js 15, React 19, and pixel-perfect design. Your comprehensive 40+ tool platform for professional Solana blockchain development.
								</p>
							</div>
						</div>
					</div>
				</PixelCard>

				{/* FAQ — visible Q&A that mirrors the FAQPage JSON-LD; AI assistants pull from both */}
				<PixelCard>
					<div className='space-y-5'>
						<div className='border-b-2 border-green-400/20 pb-3'>
							<div className='flex items-center gap-2'>
								<Info className='h-4 w-4 text-green-400' />
								<h2 className='font-pixel text-sm text-green-400'>FREQUENTLY ASKED QUESTIONS</h2>
							</div>
						</div>

						<div className='space-y-5 font-mono text-sm'>
							<div>
								<h3 className='text-white font-bold mb-2'>Is Solana Utility Tools free to use?</h3>
								<p className='text-gray-400 leading-relaxed'>
									Yes — every tool on solutil.dev is 100% free with no signup, no API keys, and no usage limits. The platform runs entirely in your browser; we never charge for transactions or store your data on a backend.
								</p>
							</div>

							<div>
								<h3 className='text-white font-bold mb-2'>Do I need to connect my wallet to use the tools?</h3>
								<p className='text-gray-400 leading-relaxed'>
									Most read-only tools (transaction parser, Borsh inspector, vanity address generator, PDA finder) work without a wallet. Connecting a wallet is only required for tools that send signed transactions — SOL transfer, token mint, Jupiter swap, ALT creation, and Jito bundles.
								</p>
							</div>

							<div>
								<h3 className='text-white font-bold mb-2'>Which Solana networks are supported?</h3>
								<p className='text-gray-400 leading-relaxed'>
									Mainnet-beta, Devnet, and Testnet. Switch networks anytime via the network switcher in the top bar — your wallet and all tools react instantly. Custom RPC endpoints are also supported in the settings panel.
								</p>
							</div>

							<div>
								<h3 className='text-white font-bold mb-2'>How do Jito bundles protect against MEV?</h3>
								<p className='text-gray-400 leading-relaxed'>
									Jito bundles submit your transactions through Jito&apos;s block-engine instead of the public mempool. Bundled transactions execute atomically in the same slot, blocking sandwich attacks and frontrunning. The bundle builder lets you tip validators directly to prioritize inclusion.
								</p>
							</div>

							<div>
								<h3 className='text-white font-bold mb-2'>Does Solana Utility Tools store my private keys or transaction data?</h3>
								<p className='text-gray-400 leading-relaxed'>
									No. All key generation (vanity addresses, bulk keypairs) and transaction signing happen locally in your browser — keys never leave your device. Transaction history is stored in browser localStorage only and can be cleared at any time.
								</p>
							</div>

							<div>
								<h3 className='text-white font-bold mb-2'>How do I report a bug or request a feature?</h3>
								<p className='text-gray-400 leading-relaxed'>
									Email{' '}
									<a href='mailto:tegufy@gmail.com' className='text-green-400 hover:text-green-300 underline'>
										tegufy@gmail.com
									</a>{' '}
									with a description and screenshot if applicable, or open an issue on{' '}
									<a href='https://github.com/lugondev' target='_blank' rel='noopener noreferrer' className='text-green-400 hover:text-green-300 underline'>
										GitHub
									</a>
									. Bug reports usually get a fix within 48 hours; new tool requests are reviewed weekly.
								</p>
							</div>
						</div>
					</div>
				</PixelCard>
			</div>
		</>
	)
}
