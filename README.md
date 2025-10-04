# Solana Utility Tools

![Solana Utility Tools](./public/og-image.png)

A comprehensive, pixel-perfect Solana utility platform built with Next.js 15 and React 19. This all-in-one toolkit provides developers and users with essential Solana blockchain operations including token management, DeFi integrations, transaction building, and advanced developer tools.

## 🚀 Features

### 🪙 Token Management
- **Token Minting**: Create new SPL tokens with custom metadata
- **Token Transfer**: Send SPL tokens with priority fee support
- **Token Burning**: Reduce token supply safely
- **Bulk Operations**: Perform multiple token operations efficiently
- **Token Analytics**: Track token performance and metrics

### 💹 DeFi Operations  
- **Jupiter Swap Integration**: Best-rate token swapping
- **Liquidity Management**: Add/remove liquidity from pools
- **Limit Orders**: Set conditional trades
- **Real-time Price Feeds**: Live market data integration

### 🔗 Transaction Tools
- **Transaction Builder**: Visual transaction construction
- **Simulation Engine**: Test transactions before execution
- **Priority Fee Optimization**: Dynamic fee calculation
- **Transaction History**: Comprehensive activity tracking
- **Batch Processing**: Multiple operations in single transaction

### ⚡ Jito Integration
- **MEV Protection**: Bundle transactions for MEV protection
- **Tip Optimization**: Maximize transaction inclusion probability
- **Bundle Management**: Create and manage transaction bundles

### � Address Lookup Tables (ALT)
- **ALT Creation**: Create new lookup tables
- **ALT Management**: Add/remove addresses efficiently
- **ALT Explorer**: Analyze table contents and benefits
- **Cost Optimization**: Reduce transaction sizes

### 👩‍� Developer Tools
- **Keypair Generator**: Secure key generation utilities
- **Program Utilities**: Smart contract interaction tools
- **Network Utilities**: Connection and RPC management
- **Account Explorer**: Inspect Solana accounts
- **PDA Calculator**: Program Derived Address tools

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, TypeScript
- **Styling**: Tailwind CSS with pixel-perfect design
- **Blockchain**: Solana Web3.js, SPL Token
- **Wallet**: Solana Wallet Adapter
- **Package Manager**: pnpm
- **Development**: ESLint, Prettier

## � Getting Started

### Prerequisites

- Node.js 18.17+ 
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/lugondev/solana-util-tx.git
   cd solana-util-tx
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Open in browser**
   ```
   http://localhost:3333
   ```

### Environment Variables

Create a `.env.local` file with:

```env
# Solana Network Configuration
NEXT_PUBLIC_SOLANA_NETWORK=devnet # or mainnet-beta, testnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com

# Jito Configuration (optional)
NEXT_PUBLIC_JITO_ENDPOINT=https://amsterdam.mainnet.block-engine.jito.wtf

# Jupiter API (optional)
NEXT_PUBLIC_JUPITER_API=https://quote-api.jup.ag/v6
```

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (features)/        # Feature-based routing
│   │   ├── tokens/        # Token management pages
│   │   ├── defi/          # DeFi operation pages
│   │   ├── transaction/   # Transaction tools
│   │   ├── jito/          # Jito bundle pages
│   │   ├── alt/           # ALT management pages
│   │   ├── accounts/      # Account explorer pages
│   │   └── dev-tools/     # Developer utilities
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── metadata.ts        # SEO metadata
│   └── globals.css        # Global styles
├── components/            # Reusable React components
│   ├── ui/               # UI component library
│   ├── tokens/           # Token-specific components
│   ├── jito/             # Jito-specific components
│   └── alt/              # ALT-specific components
├── lib/                  # Utility libraries
│   ├── solana/           # Solana-specific utilities
│   │   ├── tokens/       # Token operations
│   │   ├── transactions/ # Transaction builders
│   │   ├── jito/         # Jito integrations
│   │   └── alt/          # ALT utilities
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
├── contexts/             # React context providers
├── types/                # TypeScript type definitions
└── public/               # Static assets
```

## 🎨 Design System

The application uses a **pixel-perfect retro aesthetic** with:

- **Pixel Fonts**: Press Start 2P, VT323
- **Color Scheme**: Dark theme with green accents (#10b981)
- **UI Components**: Custom pixel-styled components
- **Animations**: Subtle retro animations and effects
- **Responsive**: Mobile-first responsive design

## 🔗 Key Integrations

### Solana Web3.js
- Connection management and RPC optimization
- Transaction building and simulation
- Account management and PDA calculations

### Jupiter Protocol
- Token price feeds and routing
- Best-rate swap execution
- Slippage protection

### Jito MEV Protection
- Bundle creation and submission
- Tip optimization strategies
- MEV protection for sensitive transactions

### Wallet Adapters
- Multi-wallet support (Phantom, Solflare, etc.)
- Automatic wallet detection
- Secure transaction signing

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Manual Deployment

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## � Performance & SEO

- **Perfect Lighthouse Scores**: Optimized for performance
- **SEO Optimized**: Complete meta tags, structured data, sitemap
- **PWA Ready**: Service worker and manifest configured
- **Server Components**: Optimal loading with React 19
- **Image Optimization**: Next.js Image component usage

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## � Links

- **Live Demo**: [https://solana-util-tx.vercel.app](https://solana-util-tx.vercel.app)
- **GitHub**: [https://github.com/lugondev/solana-util-tx](https://github.com/lugondev/solana-util-tx)
- **Documentation**: [./docs](./docs)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always test on devnet before using on mainnet. Never share private keys or seed phrases.

---

**Built with ❤️ by [LugonDev](https://github.com/lugondev)**
