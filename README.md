# ⚡ Solana Utility Transaction Tool

A comprehensive, pixel-art styled utility toolkit for Solana blockchain operations. Built with Next.js 15, React 19, and modern web technologies.

## ✨ Features

### 🚀 Currently Available
- **💰 Wallet Management** - Connect, view balance, and manage Solana wallets
- **⚡ SOL Transfers** - Send SOL with customizable priority fees and simulation
- **🧪 Transaction Simulation** - Test transactions before sending to avoid failures
- **📊 Transaction History** - Track, filter, and export all your transaction history
- **🪙 SPL Token Transfer** - Transfer any SPL tokens with automatic ATA creation
- **📋 Address Lookup Tables (ALT)** - Create, manage, and optimize ALTs for transaction cost reduction
- **🔍 ALT Explorer** - Analyze ALT contents and calculate transaction benefits
- **🎨 Pixel Art UI** - Retro-styled interface with 8-bit aesthetics

### 🚧 Coming Soon (Phases 3-9)
- **🔄 Priority fees management** - Advanced fee optimization strategies
- **🪙 SPL Token operations** - Mint, burn, and advanced token operations
- **💎 Token-2022 support** - Next-generation token standard features
- **⚡ Jito/MEV bundle submission** - MEV protection and bundle optimization
- **🏦 DeFi integration** - Jupiter swaps, Raydium, Orca liquidity operations
- **🛠️ Developer tools** - Keypair management, program deployment utilities
- **📈 Analytics & monitoring** - Advanced transaction analytics and portfolio tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone https://github.com/lugondev/solana-util-tx.git
cd solana-util-tx

# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Start development server
pnpm dev
```

Visit `http://localhost:3333`

## 📦 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **React**: 19.x with Server Components
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + Custom Pixel CSS
- **Fonts**: Press Start 2P, VT323
- **Solana**: @solana/web3.js, @solana/spl-token
- **Wallet**: @solana/wallet-adapter-react
- **Package Manager**: pnpm

## 📁 Project Structure

```
solana-util-tx/
├── .docs/                          # Documentation (Vietnamese)
│   ├── development-plan.md         # 16-week roadmap
│   ├── pixel-ui-guide.md          # Pixel UI design guide
│   ├── api-structure.md           # Service layer architecture
│   ├── implementation-checklist.md # Task checklist
│   └── quick-start.md             # Quick start guide
├── app/                            # Next.js App Router
│   ├── globals.css                # Global styles with pixel theme
│   ├── layout.tsx                 # Root layout with fonts
│   ├── page.tsx                   # Homepage
│   ├── transaction/               # Transaction pages
│   └── wallet/                    # Wallet pages
├── components/
│   ├── ui/                        # Pixel UI components
│   │   ├── pixel-button.tsx
│   │   ├── pixel-card.tsx
│   │   ├── pixel-input.tsx
│   │   ├── pixel-modal.tsx
│   │   ├── pixel-toast.tsx
│   │   └── pixel-loading.tsx
│   ├── Navigation.tsx
│   └── WalletProvider.tsx
├── lib/
│   ├── solana/
│   │   ├── config.ts              # RPC endpoints config
│   │   └── connection.ts          # Connection manager
│   └── utils.ts
├── styles/
│   ├── pixel-palette.css          # Color palette
│   └── pixel-animations.css       # Pixel animations
├── hooks/
│   └── useTheme.ts
└── types/
    └── index.ts
```

## 🎨 Pixel UI Components

All UI components follow retro pixel art design:

```tsx
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelInput } from '@/components/ui/pixel-input'

// Button variants
<PixelButton variant="primary" size="lg">PRIMARY</PixelButton>
<PixelButton variant="success" size="md">SUCCESS</PixelButton>
<PixelButton variant="danger" size="sm">DANGER</PixelButton>

// Card with header
<PixelCard header="TITLE">
  Content here
</PixelCard>

// Input with label
<PixelInput 
  label="WALLET ADDRESS"
  placeholder="Enter address..."
  error="Invalid address"
/>
```

## 🛠️ Available Scripts

```bash
# Development
pnpm dev          # Start dev server (port 3333)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking
```

## 🌐 Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_RPC_ENDPOINT=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_ENABLE_JITO=true
NEXT_PUBLIC_ENABLE_DEFI=true
```

## 📚 Documentation

Detailed documentation (in Vietnamese) available in `.docs/` folder:

- **Development Plan**: Complete 16-week roadmap
- **Pixel UI Guide**: Design system and component guidelines
- **API Structure**: Service layer architecture
- **Implementation Checklist**: Task-by-task breakdown
- **Quick Start**: Step-by-step setup guide

## 🎯 Development Roadmap

| Phase | Status | Focus |
|-------|--------|-------|
| Phase 1 | ✅ Complete | Pixel UI System + Infrastructure |
| Phase 2 | 🔄 Next | Core Transactions |
| Phase 3 | 📋 Planned | Token Operations |
| Phase 4 | 📋 Planned | Jito/MEV Features |
| Phase 5 | 📋 Planned | Account Management |
| Phase 6 | 📋 Planned | DeFi Integration |
| Phase 7 | 📋 Planned | Developer Tools |
| Phase 8 | 📋 Planned | Analytics |
| Phase 9 | 📋 Planned | Polish & Testing |

## 🤝 Contributing

Contributions are welcome! Please read the documentation in `.docs/` folder first.

## 📄 License

MIT License

## 🔗 Links

- [Solana Docs](https://docs.solana.com/)
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

---

Built with ⚡ by [lugondev](https://github.com/lugondev)
