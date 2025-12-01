'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useState} from 'react'
import {ChevronRight, ChevronDown, Home, Star, BarChart3, Rocket, Wallet, Zap, Coins, Clipboard, RefreshCw, Wrench, Microscope, Factory, Flame, Package, Users} from 'lucide-react'
import {LucideIcon} from 'lucide-react'

interface NavigationItem {
	label: string
	href?: string
	children?: NavigationItem[]
	icon?: LucideIcon
	comingSoon?: boolean
}

const navigationItems: NavigationItem[] = [
	{
		label: 'DASHBOARD',
		href: '/',
		icon: Home,
	},
	{
		label: 'FEATURES',
		href: '/features',
		icon: Star,
	},
	{
		label: 'WALLET',
		icon: Wallet,
		children: [
			{label: 'Overview', href: '/wallet'},
			{label: 'Multisig', href: '/wallet/multisig', icon: Users},
		],
	},
	{
		label: 'TRANSACTIONS',
		icon: Zap,
		children: [
			{label: 'Send', href: '/transaction/send'},
			{label: 'Simulate', href: '/transaction/simulate'},
			{label: 'Enhanced Simulate', href: '/transaction/enhanced-simulate', icon: Microscope},
			{label: 'History', href: '/transaction/history'},
		],
	},
	{
		label: 'TOKENS',
		icon: Coins,
		children: [
			{label: 'Transfer', href: '/tokens/transfer', icon: RefreshCw},
			{label: 'Mint', href: '/tokens/mint', icon: Factory},
			{label: 'Burn', href: '/tokens/burn', icon: Flame},
			{label: 'Bulk Operations', href: '/tokens/bulk', icon: Package},
			{label: 'Analytics', href: '/tokens/analytics', icon: BarChart3},
		],
	},
	{
		label: 'DEV TOOLS',
		icon: Wrench,
		children: [
			{label: 'Overview', href: '/dev-tools'},
			{label: 'Keypair', href: '/dev-tools/keypair'},
			{label: 'Bulk Keypair', href: '/dev-tools/bulk-keypair'},
			{label: 'Vanity Generator', href: '/dev-tools/vanity-generator'},
			{label: 'Keypair Converter', href: '/dev-tools/keypair-converter'},
			{label: 'HD Wallet', href: '/dev-tools/hd-wallet'},
			{label: 'PDA Calculator', href: '/dev-tools/pda'},
			{label: 'PDA Brute Force', href: '/dev-tools/pda-brute-force'},
			{label: 'Programs', href: '/dev-tools/programs'},
			{label: 'Program Interaction', href: '/dev-tools/program-interaction'},
			{label: 'Inspector', href: '/dev-tools/inspector'},
			{label: 'Deploy', href: '/dev-tools/deploy'},
			{label: 'IDL', href: '/dev-tools/idl'},
			{label: 'IDL Generator', href: '/dev-tools/idl-generator'},
			{label: 'Transaction Parser', href: '/dev-tools/transaction-parser'},
			{label: 'RPC Benchmarker', href: '/dev-tools/rpc'},
			{label: 'CLI', href: '/dev-tools/cli'},
			{label: 'Utilities', href: '/dev-tools/utils'},
		],
	},
	{
		label: 'DEFI',
		icon: RefreshCw,
		children: [
			{label: 'Swap (Jupiter)', href: '/defi/swap'},
			{label: 'Liquidity', href: '/defi/liquidity'},
			{label: 'Limit Orders', href: '/defi/limit-orders'},
		],
	},
	{
		label: 'JITO/MEV',
		icon: Rocket,
		children: [
			{label: 'Bundles', href: '/jito/bundle'},
			{label: 'Tips', href: '/jito/tips'},
		],
	},
	{
		label: 'ACCOUNTS',
		icon: BarChart3,
		children: [
			{label: 'Explorer', href: '/accounts/explorer'},
			{label: 'PDA Calculator', href: '/accounts/pda'},
		],
	},
	{
		label: 'DATA TOOLS',
		icon: BarChart3,
		children: [
			{label: 'Overview', href: '/data-tools'},
			{label: 'Analytics', href: '/data-tools/analytics'},
			{label: 'Borsh Inspector', href: '/data-tools/borsh-inspector'},
			{label: 'Binary Viewer', href: '/data-tools/binary-viewer'},
			{label: 'Event Parser', href: '/data-tools/event-parser'},
			{label: 'Anchor CPI', href: '/data-tools/anchor-cpi'},
			{label: 'Schema Validator', href: '/data-tools/schema-validator'},
		],
	},
	{
		label: 'ALT',
		icon: Clipboard,
		children: [
			{label: 'Create ALT', href: '/alt/create'},
			{label: 'Manage ALT', href: '/alt/manage'},
			{label: 'ALT Explorer', href: '/alt/explorer'},
		],
	},
	{
		label: 'ADVANCED TOOLS',
		icon: Rocket,
		children: [
			{label: 'Overview', href: '/advanced-tools'},
			{label: 'Program Versioning', href: '/advanced-tools/program-versioning'},
			{label: 'State Compression', href: '/advanced-tools/state-compression'},
			{label: 'Token Extensions', href: '/advanced-tools/token-extensions'},
		],
	},
]

interface NavigationMenuProps {
	item: NavigationItem
	level?: number
}

function NavigationMenu({item, level = 0}: NavigationMenuProps) {
	const [isOpen, setIsOpen] = useState(false)
	const pathname = usePathname()

	const hasChildren = item.children && item.children.length > 0
	const isActive = item.href ? pathname === item.href : false
	const hasActiveChild = item.children?.some((child) => pathname === child.href)

	const paddingClass = level === 0 ? 'pl-4' : 'pl-8'

	if (hasChildren) {
		return (
			<div>
				<button onClick={() => setIsOpen(!isOpen)} className={`w-full flex items-center justify-between ${paddingClass} pr-4 py-2 font-pixel text-xs transition-colors ${hasActiveChild ? 'text-green-400 bg-green-400/10' : 'text-gray-400 hover:text-green-400'}`}>
					<div className='flex items-center gap-2'>
						{item.icon && <item.icon className='h-3.5 w-3.5' />}
						<span>{item.label}</span>
					</div>
					{isOpen ? <ChevronDown className='h-3 w-3' /> : <ChevronRight className='h-3 w-3' />}
				</button>

				{isOpen && (
					<div className='border-l-2 border-green-400/20 ml-4'>
						{item.children?.map((child, index) => (
							<NavigationMenu key={index} item={child} level={level + 1} />
						))}
					</div>
				)}
			</div>
		)
	}

	const linkContent = (
		<div className='flex items-center gap-2'>
			{item.icon && <item.icon className='h-3.5 w-3.5' />}
			<span>{item.label}</span>
			{item.comingSoon && <span className='text-xs px-1.5 py-0.5 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'>SOON</span>}
		</div>
	)

	if (item.comingSoon) {
		return <div className={`${paddingClass} pr-4 py-2 font-pixel text-xs cursor-not-allowed opacity-50`}>{linkContent}</div>
	}

	return (
		<Link href={item.href || '#'} className={`block ${paddingClass} pr-4 py-2 font-pixel text-xs transition-colors ${isActive ? 'text-green-400 bg-green-400/10 border-r-2 border-green-400' : 'text-gray-400 hover:text-green-400'}`}>
			{linkContent}
		</Link>
	)
}

interface NavigationProps {
	isMobileMenuOpen?: boolean
	onMobileMenuToggle?: () => void
	className?: string
}

export default function Navigation({isMobileMenuOpen = false, onMobileMenuToggle, className = ''}: NavigationProps) {
	const [isCollapsed, setIsCollapsed] = useState(false)
	const pathname = usePathname()

	return (
		<nav className={`h-screen bg-gray-900 border-r-2 border-green-400/20 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-72'} ${className}`}>
			{/* Header */}
			<div className={`border-b-2 border-green-400/20 transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-6'}`}>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-4 overflow-hidden'>
						<div className='w-10 h-10 bg-green-400 border-2 border-green-400 animate-pulse flex-shrink-0' />
						<div className={`transition-all duration-300 overflow-hidden ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>
							<h1 className='font-pixel text-base text-green-400 whitespace-nowrap'>SOLANA</h1>
							<p className='font-pixel text-xs text-gray-400 whitespace-nowrap'>UTIL-TX</p>
						</div>
					</div>

					<div className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>
						{!isCollapsed && (
							<button onClick={() => setIsCollapsed(true)} className='p-2 rounded-md hover:bg-gray-800 transition-all duration-200 hover:text-green-400' title='Collapse sidebar'>
								<ChevronRight size={18} className='text-gray-400' />
							</button>
						)}
					</div>
				</div>

				{isCollapsed && (
					<div className='flex justify-center mt-4 animate-in fade-in duration-300'>
						<button onClick={() => setIsCollapsed(false)} className='p-2 rounded-md hover:bg-gray-800 transition-all duration-200 hover:text-green-400 group' title='Expand sidebar'>
							<ChevronRight size={18} className='text-gray-400 group-hover:text-green-400 transition-colors' />
						</button>
					</div>
				)}
			</div>

			{/* Navigation Items */}
			<div className='flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-green-400/20 scrollbar-track-transparent'>
				{!isCollapsed && (
					<div className='py-2'>
						{navigationItems.map((item, index) => (
							<NavigationMenu key={index} item={item} />
						))}
					</div>
				)}

				{isCollapsed && (
					<div className='py-2 space-y-1'>
						{navigationItems.map((item, index) => {
							const isActive = item.href ? pathname === item.href : false
							const hasActiveChild = item.children?.some((child) => pathname === child.href)

							return (
								<div key={index} className='px-2 flex justify-center group'>
									{item.href ? (
										<Link href={item.href} className={`w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-lg relative ${isActive || hasActiveChild ? 'text-green-400 bg-green-400/10 border-2 border-green-400' : 'text-gray-400 hover:text-green-400 hover:bg-green-400/5 border-2 border-transparent hover:border-green-400/30'}`} title={item.label}>
											{item.icon && <item.icon className='h-5 w-5' />}
											{(isActive || hasActiveChild) && <div className='absolute -right-1 w-1 h-8 bg-green-400 rounded-l-full' />}
										</Link>
									) : (
										<div className={`w-12 h-12 flex items-center justify-center transition-all duration-200 cursor-pointer rounded-lg ${hasActiveChild ? 'text-green-400 bg-green-400/10 border-2 border-green-400' : 'text-gray-400 hover:text-green-400 hover:bg-green-400/5 border-2 border-transparent hover:border-green-400/30'}`} title={item.label}>
											{item.icon && <item.icon className='h-5 w-5' />}
										</div>
									)}
								</div>
							)
						})}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className={`border-t-2 border-green-400/20 transition-all duration-300 ${isCollapsed ? 'p-3' : 'p-4'}`}>
				{!isCollapsed ? (
					<div className='font-mono text-xs text-gray-500 space-y-1'>
						<div className='flex items-center gap-2'>
							<span className='text-green-400'>●</span>
							<span>v2.0.1</span>
						</div>
						<div className='flex items-center gap-2'>
							<span className='text-yellow-400'>◐</span>
							<span>WIP</span>
						</div>
					</div>
				) : (
					<div className='flex justify-center'>
						<div className='w-2 h-2 bg-green-400 rounded-full animate-pulse' />
					</div>
				)}
			</div>
		</nav>
	)
}
