import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Solana Utility Tools — 40+ free browser-based tools for Solana developers, DeFi traders, and power users'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpengraphImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'space-between',
					padding: '64px',
					background: 'linear-gradient(135deg, #020617 0%, #064e3b 100%)',
					fontFamily: 'monospace',
					color: '#ffffff',
				}}
			>
				<div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
					<div
						style={{
							width: '88px',
							height: '88px',
							background: '#10b981',
							boxShadow: '0 0 0 6px #064e3b, 0 0 0 10px #10b981',
						}}
					/>
					<div style={{ display: 'flex', flexDirection: 'column' }}>
						<div style={{ fontSize: '32px', color: '#10b981', letterSpacing: '4px' }}>solutil.dev</div>
						<div style={{ fontSize: '20px', color: '#94a3b8', marginTop: '4px' }}>SOLANA UTILITY TOOLS</div>
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
					<div style={{ fontSize: '72px', fontWeight: 700, lineHeight: 1.05, color: '#ffffff' }}>
						40+ free tools for Solana developers, traders & power users
					</div>
					<div style={{ fontSize: '28px', color: '#a7f3d0', lineHeight: 1.3 }}>
						Transaction parser · Jupiter swap · Jito MEV bundles · SPL tokens · ALT · Vanity addresses
					</div>
				</div>

				<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<div style={{ display: 'flex', gap: '12px' }}>
						{['Mainnet', 'Devnet', 'Testnet'].map((label) => (
							<div
								key={label}
								style={{
									fontSize: '20px',
									padding: '8px 18px',
									border: '2px solid #10b981',
									color: '#10b981',
									letterSpacing: '2px',
								}}
							>
								{label.toUpperCase()}
							</div>
						))}
					</div>
					<div style={{ fontSize: '22px', color: '#94a3b8' }}>100% browser-based · No signup · No fees</div>
				</div>
			</div>
		),
		{ ...size }
	)
}
