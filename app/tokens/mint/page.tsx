'use client'

import {useState} from 'react'
import {TokenMintForm} from '@/components/tokens/token-mint-form'
import {Token2022MintForm} from '@/components/tokens/token-2022-mint-form'
import {PixelCard} from '@/components/ui/pixel-card'

export default function TokenMintPage() {
	const [tokenVersion, setTokenVersion] = useState<'spl' | 'token-2022'>('spl')

	return (
		<div className='container mx-auto px-4 py-8 max-w-4xl'>
			{/* Header */}
			<div className='mb-8'>
				<h1 className='font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3'>
					<span className='animate-pulse'>▸</span>
					CREATE SPL TOKEN
				</h1>
				<p className='font-mono text-sm text-gray-400'>Create a new SPL token or Token-2022 with custom parameters and extensions</p>
			</div>

			{/* Token Version Selector */}
			<PixelCard className='mb-6'>
				<div className='space-y-4'>
					<div className='border-b-4 border-green-400/20 pb-3'>
						<h3 className='font-pixel text-sm text-green-400'>SELECT TOKEN PROGRAM</h3>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
						<button onClick={() => setTokenVersion('spl')} className={`p-4 border-4 transition-colors text-left ${tokenVersion === 'spl' ? 'border-green-400 bg-green-400/10' : 'border-gray-700 hover:border-green-400/50'}`}>
							<div className='font-pixel text-sm text-white mb-2'>SPL TOKEN (STANDARD)</div>
							<div className='font-mono text-xs text-gray-400'>Classic SPL token program - widely supported by all wallets, exchanges, and DEXs</div>
							<div className='mt-2 flex flex-wrap gap-2'>
								<span className='px-2 py-1 bg-green-400/20 text-green-400 font-pixel text-xs'>STABLE</span>
								<span className='px-2 py-1 bg-blue-400/20 text-blue-400 font-pixel text-xs'>UNIVERSAL</span>
							</div>
						</button>

						<button onClick={() => setTokenVersion('token-2022')} className={`p-4 border-4 transition-colors text-left ${tokenVersion === 'token-2022' ? 'border-green-400 bg-green-400/10' : 'border-gray-700 hover:border-green-400/50'}`}>
							<div className='font-pixel text-sm text-white mb-2'>TOKEN-2022 (ADVANCED)</div>
							<div className='font-mono text-xs text-gray-400'>Next-generation token program with extensions like transfer fees, interest bearing, and more</div>
							<div className='mt-2 flex flex-wrap gap-2'>
								<span className='px-2 py-1 bg-purple-400/20 text-purple-400 font-pixel text-xs'>EXTENSIONS</span>
								<span className='px-2 py-1 bg-yellow-400/20 text-yellow-400 font-pixel text-xs'>ADVANCED</span>
							</div>
						</button>
					</div>

					<div className='p-3 bg-blue-400/10 border-4 border-blue-400/20'>
						<div className='font-mono text-xs text-blue-400'>{tokenVersion === 'spl' ? <>✓ Standard SPL tokens are compatible with all Solana wallets and applications. Perfect for general-purpose tokens, NFTs, and most use cases.</> : <>⚠ Token-2022 offers advanced features but may have limited wallet/DEX support. Choose extensions carefully as they are permanent and cannot be changed.</>}</div>
					</div>
				</div>
			</PixelCard>

			{/* Render appropriate form */}
			{tokenVersion === 'spl' ? <TokenMintForm /> : <Token2022MintForm />}
		</div>
	)
}
