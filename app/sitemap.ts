import { MetadataRoute } from 'next'

type RouteEntry = {
	path: string
	priority: number
	changeFrequency: 'daily' | 'weekly' | 'monthly'
}

// Centralised list of canonical routes that ship with the site.
// Keep this in sync with the actual `app/**/page.tsx` files.
const routes: RouteEntry[] = [
	// Homepage
	{ path: '', priority: 1.0, changeFrequency: 'weekly' },

	// High-traffic landing tools (featured on homepage)
	{ path: '/wallet', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/transaction/send', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/transaction/simulate', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/transaction/history', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/transaction/enhanced-simulate', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/tokens/mint', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/tokens/transfer', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/defi/swap', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/jito/bundle', priority: 0.9, changeFrequency: 'monthly' },

	// Developer tools
	{ path: '/dev-tools', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/dev-tools/transaction-parser', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/dev-tools/vanity-generator', priority: 0.9, changeFrequency: 'monthly' },
	{ path: '/dev-tools/bulk-keypair', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/dev-tools/keypair', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/keypair-converter', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/hd-wallet', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/pda', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/dev-tools/pda-brute-force', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/idl', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/idl-generator', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/inspector', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/program-interaction', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/programs', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/deploy', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/dev-tools/cli', priority: 0.6, changeFrequency: 'monthly' },
	{ path: '/dev-tools/rpc', priority: 0.6, changeFrequency: 'monthly' },
	{ path: '/dev-tools/utils', priority: 0.6, changeFrequency: 'monthly' },

	// Data tools
	{ path: '/data-tools', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/data-tools/borsh-inspector', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/data-tools/event-parser', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/data-tools/anchor-cpi', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/data-tools/binary-viewer', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/data-tools/schema-validator', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/data-tools/analytics', priority: 0.7, changeFrequency: 'monthly' },

	// Advanced tools
	{ path: '/advanced-tools', priority: 0.8, changeFrequency: 'weekly' },
	{ path: '/advanced-tools/program-versioning', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/advanced-tools/state-compression', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/advanced-tools/token-extensions', priority: 0.7, changeFrequency: 'monthly' },

	// ALT
	{ path: '/alt/create', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/alt/manage', priority: 0.8, changeFrequency: 'monthly' },
	{ path: '/alt/explorer', priority: 0.8, changeFrequency: 'monthly' },

	// Accounts
	{ path: '/accounts/explorer', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/accounts/pda', priority: 0.7, changeFrequency: 'monthly' },

	// Tokens
	{ path: '/tokens/burn', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/tokens/bulk', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/tokens/analytics', priority: 0.7, changeFrequency: 'monthly' },

	// DeFi
	{ path: '/defi/liquidity', priority: 0.7, changeFrequency: 'monthly' },
	{ path: '/defi/limit-orders', priority: 0.7, changeFrequency: 'monthly' },

	// Jito
	{ path: '/jito/tips', priority: 0.7, changeFrequency: 'monthly' },

	// Wallet
	{ path: '/wallet/multisig', priority: 0.7, changeFrequency: 'monthly' },

	// Transaction index
	{ path: '/transaction', priority: 0.7, changeFrequency: 'monthly' },

	// Features overview
	{ path: '/features', priority: 0.6, changeFrequency: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
	const baseUrl = 'https://solutil.dev'
	const lastModified = new Date()

	return routes.map((route) => ({
		url: `${baseUrl}${route.path}`,
		lastModified,
		changeFrequency: route.changeFrequency,
		priority: route.priority,
	}))
}
