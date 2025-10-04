import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://solana-util-tx.vercel.app'
  
  // Main pages
  const pages = [
    '',
    '/tokens/mint',
    '/tokens/burn', 
    '/tokens/transfer',
    '/tokens/bulk',
    '/tokens/analytics',
    '/defi/swap',
    '/defi/liquidity',
    '/defi/limit-orders',
    '/transaction',
    '/transaction/send',
    '/transaction/history',
    '/transaction/simulate',
    '/wallet',
    '/jito/bundle',
    '/jito/tips',
    '/alt/create',
    '/alt/manage',
    '/alt/explorer',
    '/accounts/explorer',
    '/accounts/pda',
    '/dev-tools/keypair',
    '/dev-tools/programs',
    '/dev-tools/utils'
  ]

  return pages.map(page => ({
    url: `${baseUrl}${page}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: page === '' ? 1 : 0.8,
  }))
}