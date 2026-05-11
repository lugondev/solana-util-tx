'use client'

import Link from 'next/link'

const navGroups: Array<{
	heading: string
	links: Array<{label: string; href: string}>
}> = [
	{
		heading: 'TRANSACTION',
		links: [
			{label: 'Send SOL', href: '/transaction/send'},
			{label: 'Simulate', href: '/transaction/simulate'},
			{label: 'History', href: '/transaction/history'},
		],
	},
	{
		heading: 'TOKENS & DEFI',
		links: [
			{label: 'Token Mint', href: '/tokens/mint'},
			{label: 'Token Transfer', href: '/tokens/transfer'},
			{label: 'Jupiter Swap', href: '/defi/swap'},
			{label: 'Jito Bundles', href: '/jito/bundle'},
		],
	},
	{
		heading: 'DEV TOOLS',
		links: [
			{label: 'Transaction Parser', href: '/dev-tools/transaction-parser'},
			{label: 'Vanity Generator', href: '/dev-tools/vanity-generator'},
			{label: 'Bulk Keypair', href: '/dev-tools/bulk-keypair'},
			{label: 'PDA Finder', href: '/dev-tools/pda'},
		],
	},
	{
		heading: 'DATA & ADVANCED',
		links: [
			{label: 'Borsh Inspector', href: '/data-tools/borsh-inspector'},
			{label: 'Event Parser', href: '/data-tools/event-parser'},
			{label: 'Program Versioning', href: '/advanced-tools/program-versioning'},
			{label: 'Create ALT', href: '/alt/create'},
		],
	},
]

export default function Footer() {
	return (
		<footer className='mt-auto bg-gray-800 border-t-4 border-green-400/20 px-4 lg:px-8 py-8'>
			<div className='max-w-7xl mx-auto space-y-8'>
				<nav aria-label='Site navigation' className='grid grid-cols-2 md:grid-cols-4 gap-6 text-sm font-mono'>
					{navGroups.map((group) => (
						<div key={group.heading} className='space-y-3'>
							<h2 className='font-pixel text-xs text-green-400'>{group.heading}</h2>
							<ul className='space-y-2'>
								{group.links.map((link) => (
									<li key={link.href}>
										<Link href={link.href} className='text-gray-400 hover:text-green-300 transition-colors'>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</nav>

				<div className='border-t border-green-400/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-center md:text-left text-sm text-gray-400 font-mono'>
					<p className='pixel-text'>
						Built with ❤️ by{' '}
						<a href='https://github.com/lugondev' target='_blank' rel='noopener noreferrer' className='text-green-400 hover:text-green-300 transition-colors underline'>
							LugonDev
						</a>
						{' '}• Solana Utility Tools
					</p>
					<div className='flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs'>
						<a href='mailto:tegufy@gmail.com' className='text-green-400 hover:text-green-300 transition-colors underline'>
							tegufy@gmail.com
						</a>
						<a href='/sitemap.xml' className='text-gray-400 hover:text-green-300 transition-colors'>
							sitemap.xml
						</a>
						<a href='/llms.txt' className='text-gray-400 hover:text-green-300 transition-colors'>
							llms.txt
						</a>
						<a href='https://github.com/lugondev' target='_blank' rel='noopener noreferrer' className='text-gray-400 hover:text-green-300 transition-colors'>
							GitHub
						</a>
					</div>
				</div>
			</div>
		</footer>
	)
}
