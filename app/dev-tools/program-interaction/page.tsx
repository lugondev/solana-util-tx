'use client'

import {ProgramInteractionComponent} from '@/components/dev-tools/program-interaction'
import {PixelCard} from '@/components/ui/pixel-card'
import {PixelButton} from '@/components/ui/pixel-button'
import Link from 'next/link'
import {ArrowLeft, Zap, Upload, Code, Shield, CheckCircle, BookOpen} from 'lucide-react'

export default function ProgramInteractionPage() {
	return (
		<div className='container mx-auto px-4 py-8 max-w-6xl'>
			{/* Header */}
			<div className='mb-8'>
				<div className='flex items-center gap-4 mb-6'>
					<Link href='/dev-tools'>
						<PixelButton variant='secondary' className='!px-3'>
							<ArrowLeft className='h-4 w-4' />
						</PixelButton>
					</Link>
					<div className='flex-1 min-w-0'>
						<h1 className='font-pixel text-xl md:text-2xl text-green-400 word-break-word'>PROGRAM INTERACTION</h1>
						<p className='font-mono text-xs md:text-sm text-gray-400 mt-1 word-break-word'>Import IDL and interact with Solana programs through auto-generated forms</p>
					</div>
				</div>

				{/* Quick Info */}
				<PixelCard>
					<div className='space-y-4'>
						<div className='border-b-4 border-blue-400/20 pb-4'>
							<h2 className='font-pixel text-base md:text-lg text-blue-400 mb-2'>ℹ️ HOW IT WORKS</h2>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6'>
							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<Upload className='h-4 w-4 md:h-5 md:w-5 text-green-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-green-400'>IMPORT IDL</h3>
								</div>
								<div className='space-y-2 font-mono text-[10px] md:text-xs text-gray-300'>
									<div className='flex items-start gap-2'>
										<span className='text-green-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Upload IDL JSON file from your filesystem</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-green-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Paste IDL JSON directly into textarea</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-green-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Supports Anchor and native IDL formats</span>
									</div>
								</div>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<Code className='h-4 w-4 md:h-5 md:w-5 text-blue-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-blue-400'>AUTO FORMS</h3>
								</div>
								<div className='space-y-2 font-mono text-[10px] md:text-xs text-gray-300'>
									<div className='flex items-start gap-2'>
										<span className='text-blue-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Forms auto-generated from IDL instructions</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-blue-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Type-safe input fields with validation</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-blue-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Account and argument inputs clearly labeled</span>
									</div>
								</div>
							</div>

							<div className='space-y-3'>
								<div className='flex items-center gap-2'>
									<Zap className='h-4 w-4 md:h-5 md:w-5 text-yellow-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-yellow-400'>EXECUTE</h3>
								</div>
								<div className='space-y-2 font-mono text-[10px] md:text-xs text-gray-300'>
									<div className='flex items-start gap-2'>
										<span className='text-yellow-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Execute instructions with connected wallet</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-yellow-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>Real-time transaction status updates</span>
									</div>
									<div className='flex items-start gap-2'>
										<span className='text-yellow-400 mt-0.5 flex-shrink-0'>✓</span>
										<span className='word-break-word'>View transaction signatures and links</span>
									</div>
								</div>
							</div>
						</div>
					</div>
				</PixelCard>

				{/* Features */}
				<PixelCard className='mt-6'>
					<div className='space-y-4'>
						<div className='border-b-4 border-green-400/20 pb-4'>
							<h2 className='font-pixel text-base md:text-lg text-green-400 mb-2'>✨ KEY FEATURES</h2>
						</div>

						<div className='grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4'>
							<div className='p-3 md:p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='flex items-center gap-2 mb-2'>
									<CheckCircle className='h-3 w-3 md:h-4 md:w-4 text-green-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-green-400 word-break-word'>SMART TYPE DETECTION</h3>
								</div>
								<p className='font-mono text-[10px] md:text-xs text-gray-300 word-break-word'>Automatically detects and renders appropriate input fields for different data types (PublicKey, u64, string, bool, enums, etc.)</p>
							</div>

							<div className='p-3 md:p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='flex items-center gap-2 mb-2'>
									<Shield className='h-3 w-3 md:h-4 md:w-4 text-blue-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-blue-400 word-break-word'>VALIDATION</h3>
								</div>
								<p className='font-mono text-[10px] md:text-xs text-gray-300 word-break-word'>Built-in validation for PublicKey addresses, numeric ranges, required fields, and data type matching</p>
							</div>

							<div className='p-3 md:p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='flex items-center gap-2 mb-2'>
									<Code className='h-3 w-3 md:h-4 md:w-4 text-purple-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-purple-400 word-break-word'>COMPLEX TYPES</h3>
								</div>
								<p className='font-mono text-[10px] md:text-xs text-gray-300 word-break-word'>Supports nested structs, arrays, enums, and optional fields with intuitive form layouts</p>
							</div>

							<div className='p-3 md:p-4 bg-gray-800 border-2 border-gray-700'>
								<div className='flex items-center gap-2 mb-2'>
									<BookOpen className='h-3 w-3 md:h-4 md:w-4 text-yellow-400 flex-shrink-0' />
									<h3 className='font-pixel text-xs md:text-sm text-yellow-400 word-break-word'>INLINE DOCS</h3>
								</div>
								<p className='font-mono text-[10px] md:text-xs text-gray-300 word-break-word'>Shows instruction and parameter documentation from IDL directly in the form interface</p>
							</div>
						</div>
					</div>
				</PixelCard>
			</div>

			{/* Main Component */}
			<ProgramInteractionComponent />
		</div>
	)
}
