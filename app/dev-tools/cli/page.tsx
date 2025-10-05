'use client'

import { Metadata } from 'next'
import { PixelCard } from '@/components/ui/pixel-card'
import { SolanaCLIHelperComponent } from '@/components/dev-tools/solana-cli-helper'

export default function SolanaCLIHelperPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-3xl text-green-400 mb-4">Solana CLI Helper</h1>
        <p className="text-gray-300 leading-relaxed">
          Generate and learn Solana CLI commands. Create complex commands with a simple GUI interface.
        </p>
      </div>

      {/* Main Tool */}
      <div className="mb-8">
        <SolanaCLIHelperComponent />
      </div>

      {/* Documentation */}
      <div className="grid md:grid-cols-2 gap-6">
        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">🔧 Command Categories</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Wallet Management</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">solana-keygen</code> - Generate keypairs</li>
                <li>• <code className="text-blue-400">solana balance</code> - Check SOL balance</li>
                <li>• <code className="text-blue-400">solana transfer</code> - Send SOL</li>
                <li>• <code className="text-blue-400">solana airdrop</code> - Request airdrop</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Token Operations</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">spl-token create-token</code> - Create token</li>
                <li>• <code className="text-blue-400">spl-token create-account</code> - Token account</li>
                <li>• <code className="text-blue-400">spl-token mint</code> - Mint tokens</li>
                <li>• <code className="text-blue-400">spl-token transfer</code> - Transfer tokens</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">📋 Program Commands</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Development</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">solana program deploy</code> - Deploy program</li>
                <li>• <code className="text-blue-400">solana program show</code> - Program info</li>
                <li>• <code className="text-blue-400">solana program close</code> - Close program</li>
                <li>• <code className="text-blue-400">anchor build</code> - Build Anchor program</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Account Operations</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">solana account</code> - Account info</li>
                <li>• <code className="text-blue-400">solana rent</code> - Rent calculation</li>
                <li>• <code className="text-blue-400">solana create-account</code> - Create account</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">🌐 Network Commands</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Configuration</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">solana config set</code> - Set cluster/keypair</li>
                <li>• <code className="text-blue-400">solana config get</code> - Show config</li>
                <li>• <code className="text-blue-400">solana cluster-version</code> - Cluster info</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Monitoring</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• <code className="text-blue-400">solana block</code> - Block info</li>
                <li>• <code className="text-blue-400">solana transaction-history</code> - TX history</li>
                <li>• <code className="text-blue-400">solana ping</code> - Network ping</li>
              </ul>
            </div>
          </div>
        </PixelCard>

        <PixelCard className="h-fit">
          <h2 className="font-pixel text-xl text-green-400 mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3 text-sm">
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Common Workflows</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Setup new wallet</li>
                <li>• Deploy program to devnet</li>
                <li>• Create and mint token</li>
                <li>• Transfer SOL/tokens</li>
                <li>• Check account balances</li>
              </ul>
            </div>
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Developer Tools</h3>
              <ul className="space-y-1 text-gray-300 ml-4">
                <li>• Generate command templates</li>
                <li>• Copy to clipboard</li>
                <li>• Export as shell script</li>
                <li>• Parameter validation</li>
              </ul>
            </div>
          </div>
        </PixelCard>
      </div>

      {/* Installation Guide */}
      <PixelCard className="mt-6">
        <h2 className="font-pixel text-xl text-green-400 mb-4">📦 Installation Guide</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Solana CLI</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Install Solana CLI</div>
                <div className="text-green-400">sh -c "$(curl -sSfL https://release.solana.com/stable/install)"</div>
              </div>
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Verify installation</div>
                <div className="text-green-400">solana --version</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">SPL Token CLI</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Install SPL Token CLI</div>
                <div className="text-green-400">cargo install spl-token-cli</div>
              </div>
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Verify installation</div>
                <div className="text-green-400">spl-token --version</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Anchor CLI</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Install Anchor CLI</div>
                <div className="text-green-400">cargo install --git https://github.com/coral-xyz/anchor avm --locked --force</div>
              </div>
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Install latest Anchor</div>
                <div className="text-green-400">avm install latest && avm use latest</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Environment Setup</h3>
            <div className="space-y-2">
              <div className="bg-gray-900 p-3 rounded font-mono text-xs border border-gray-700">
                <div className="text-gray-400 mb-1"># Add to PATH (add to ~/.bashrc or ~/.zshrc)</div>
                <div className="text-green-400">export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"</div>
              </div>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Tips */}
      <PixelCard className="mt-6">
        <h2 className="font-pixel text-xl text-green-400 mb-4">💡 Pro Tips</h2>
        <div className="grid md:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">CLI Efficiency</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Use aliases for frequently used commands</li>
              <li>• Create shell scripts for complex workflows</li>
              <li>• Use <code className="text-blue-400">--help</code> flag for command details</li>
              <li>• Store keypairs securely with proper permissions</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Development Workflow</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Test on devnet before mainnet</li>
              <li>• Use different keypairs for different environments</li>
              <li>• Monitor transaction logs for debugging</li>
              <li>• Keep backups of important keypairs</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Security Best Practices</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Never share private keys or seed phrases</li>
              <li>• Use hardware wallets for mainnet</li>
              <li>• Verify addresses before transactions</li>
              <li>• Double-check network settings</li>
            </ul>
          </div>
          <div>
            <h3 className="text-yellow-400 font-medium mb-2">Troubleshooting</h3>
            <ul className="space-y-1 text-gray-300 ml-4">
              <li>• Check RPC endpoint connectivity</li>
              <li>• Verify sufficient SOL for transactions</li>
              <li>• Use <code className="text-blue-400">--verbose</code> for detailed logs</li>
              <li>• Update CLI tools regularly</li>
            </ul>
          </div>
        </div>
      </PixelCard>
    </div>
  )
}