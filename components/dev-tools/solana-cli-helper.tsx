'use client'

import { useState, useCallback, useMemo } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  Terminal, 
  Copy, 
  Download, 
  Settings, 
  Wallet,
  Coins,
  Code,
  Network,
  FileText,
  Play,
  Book,
  Zap
} from 'lucide-react'

interface CommandCategory {
  id: string
  name: string
  icon: any
  description: string
}

interface CommandTemplate {
  id: string
  category: string
  name: string
  description: string
  template: string
  parameters: Parameter[]
  examples: string[]
}

interface Parameter {
  name: string
  description: string
  required: boolean
  type: 'string' | 'number' | 'boolean' | 'select'
  options?: string[]
  defaultValue?: string
  placeholder?: string
}

const COMMAND_CATEGORIES: CommandCategory[] = [
  { id: 'wallet', name: 'Wallet Management', icon: Wallet, description: 'Keypair and balance operations' },
  { id: 'token', name: 'Token Operations', icon: Coins, description: 'SPL token commands' },
  { id: 'program', name: 'Program Development', icon: Code, description: 'Deploy and manage programs' },
  { id: 'network', name: 'Network Commands', icon: Network, description: 'Cluster and configuration' },
  { id: 'account', name: 'Account Operations', icon: FileText, description: 'Account management' },
  { id: 'workflow', name: 'Common Workflows', icon: Zap, description: 'Multi-step procedures' }
]

const COMMAND_TEMPLATES: CommandTemplate[] = [
  // Wallet Management
  {
    id: 'keygen-new',
    category: 'wallet',
    name: 'Generate New Keypair',
    description: 'Create a new Solana keypair',
    template: 'solana-keygen new{{outfile ? ` --outfile ${outfile}` : ""}}{{force ? " --force" : ""}}{{silent ? " --silent" : ""}}',
    parameters: [
      { name: 'outfile', description: 'Output file path', required: false, type: 'string', placeholder: '/path/to/keypair.json' },
      { name: 'force', description: 'Overwrite existing file', required: false, type: 'boolean' },
      { name: 'silent', description: 'Silent mode', required: false, type: 'boolean' }
    ],
    examples: [
      'solana-keygen new',
      'solana-keygen new --outfile ~/.config/solana/id.json',
      'solana-keygen new --outfile ./wallet.json --force'
    ]
  },
  {
    id: 'balance',
    category: 'wallet',
    name: 'Check Balance',
    description: 'Check SOL balance of an account',
    template: 'solana balance{{address ? ` ${address}` : ""}}{{url ? ` --url ${url}` : ""}}',
    parameters: [
      { name: 'address', description: 'Account address (default: configured wallet)', required: false, type: 'string', placeholder: 'Public key address' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] }
    ],
    examples: [
      'solana balance',
      'solana balance 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      'solana balance --url https://api.devnet.solana.com'
    ]
  },
  {
    id: 'transfer',
    category: 'wallet',
    name: 'Transfer SOL',
    description: 'Transfer SOL to another account',
    template: 'solana transfer ${recipient} ${amount}{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}{{fee_payer ? ` --fee-payer ${fee_payer}` : ""}}',
    parameters: [
      { name: 'recipient', description: 'Recipient address', required: true, type: 'string', placeholder: 'Recipient public key' },
      { name: 'amount', description: 'Amount to transfer', required: true, type: 'number', placeholder: '1.5' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Sender keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' },
      { name: 'fee_payer', description: 'Fee payer keypair', required: false, type: 'string', placeholder: '/path/to/fee-payer.json' }
    ],
    examples: [
      'solana transfer 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1.5',
      'solana transfer 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1.0 --url https://api.devnet.solana.com'
    ]
  },
  {
    id: 'airdrop',
    category: 'wallet',
    name: 'Request Airdrop',
    description: 'Request SOL airdrop (devnet/testnet only)',
    template: 'solana airdrop ${amount}{{address ? ` ${address}` : ""}}{{url ? ` --url ${url}` : ""}}',
    parameters: [
      { name: 'amount', description: 'Amount of SOL', required: true, type: 'number', placeholder: '2' },
      { name: 'address', description: 'Recipient address (default: configured wallet)', required: false, type: 'string', placeholder: 'Public key address' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] }
    ],
    examples: [
      'solana airdrop 2',
      'solana airdrop 1 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --url https://api.devnet.solana.com'
    ]
  },

  // Token Operations
  {
    id: 'create-token',
    category: 'token',
    name: 'Create Token',
    description: 'Create a new SPL token',
    template: 'spl-token create-token{{decimals ? ` --decimals ${decimals}` : ""}}{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}',
    parameters: [
      { name: 'decimals', description: 'Token decimals', required: false, type: 'number', defaultValue: '9', placeholder: '9' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' }
    ],
    examples: [
      'spl-token create-token',
      'spl-token create-token --decimals 6',
      'spl-token create-token --url https://api.devnet.solana.com'
    ]
  },
  {
    id: 'create-account',
    category: 'token',
    name: 'Create Token Account',
    description: 'Create a token account for a specific token',
    template: 'spl-token create-account ${token}{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}',
    parameters: [
      { name: 'token', description: 'Token mint address', required: true, type: 'string', placeholder: 'Token mint public key' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' }
    ],
    examples: [
      'spl-token create-account 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      'spl-token create-account 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --url https://api.devnet.solana.com'
    ]
  },
  {
    id: 'mint-token',
    category: 'token',
    name: 'Mint Tokens',
    description: 'Mint tokens to a token account',
    template: 'spl-token mint ${token} ${amount}{{recipient ? ` ${recipient}` : ""}}{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}',
    parameters: [
      { name: 'token', description: 'Token mint address', required: true, type: 'string', placeholder: 'Token mint public key' },
      { name: 'amount', description: 'Amount to mint', required: true, type: 'number', placeholder: '1000' },
      { name: 'recipient', description: 'Recipient token account (optional)', required: false, type: 'string', placeholder: 'Token account address' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' }
    ],
    examples: [
      'spl-token mint 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 1000',
      'spl-token mint 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM 500 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
    ]
  },

  // Program Development
  {
    id: 'program-deploy',
    category: 'program',
    name: 'Deploy Program',
    description: 'Deploy a Solana program',
    template: 'solana program deploy ${program_path}{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}{{program_id ? ` --program-id ${program_id}` : ""}}',
    parameters: [
      { name: 'program_path', description: 'Path to program .so file', required: true, type: 'string', placeholder: './target/deploy/program.so' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' },
      { name: 'program_id', description: 'Program ID keypair', required: false, type: 'string', placeholder: '/path/to/program-keypair.json' }
    ],
    examples: [
      'solana program deploy ./target/deploy/my_program.so',
      'solana program deploy ./target/deploy/my_program.so --url https://api.devnet.solana.com',
      'solana program deploy ./target/deploy/my_program.so --program-id ./target/deploy/my_program-keypair.json'
    ]
  },
  {
    id: 'program-show',
    category: 'program',
    name: 'Show Program Info',
    description: 'Display program information',
    template: 'solana program show ${program_id}{{url ? ` --url ${url}` : ""}}',
    parameters: [
      { name: 'program_id', description: 'Program ID', required: true, type: 'string', placeholder: 'Program public key' },
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] }
    ],
    examples: [
      'solana program show 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
      'solana program show 9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM --url https://api.devnet.solana.com'
    ]
  },

  // Network Commands
  {
    id: 'config-set',
    category: 'network',
    name: 'Set Configuration',
    description: 'Set cluster URL or keypair',
    template: 'solana config set{{url ? ` --url ${url}` : ""}}{{keypair ? ` --keypair ${keypair}` : ""}}',
    parameters: [
      { name: 'url', description: 'RPC URL', required: false, type: 'select', options: ['https://api.mainnet-beta.solana.com', 'https://api.devnet.solana.com', 'https://api.testnet.solana.com', 'http://localhost:8899'] },
      { name: 'keypair', description: 'Keypair path', required: false, type: 'string', placeholder: '/path/to/keypair.json' }
    ],
    examples: [
      'solana config set --url https://api.devnet.solana.com',
      'solana config set --keypair ~/.config/solana/id.json',
      'solana config set --url https://api.devnet.solana.com --keypair ./devnet-wallet.json'
    ]
  },
  {
    id: 'config-get',
    category: 'network',
    name: 'Get Configuration',
    description: 'Display current configuration',
    template: 'solana config get',
    parameters: [],
    examples: ['solana config get']
  }
]

export function SolanaCLIHelperComponent() {
  const [selectedCategory, setSelectedCategory] = useState<string>('wallet')
  const [selectedCommand, setSelectedCommand] = useState<string>('')
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [generatedCommand, setGeneratedCommand] = useState<string>('')

  const filteredCommands = useMemo(() => {
    return COMMAND_TEMPLATES.filter(cmd => cmd.category === selectedCategory)
  }, [selectedCategory])

  const currentCommand = useMemo(() => {
    return COMMAND_TEMPLATES.find(cmd => cmd.id === selectedCommand)
  }, [selectedCommand])

  const generateCommand = useCallback(() => {
    if (!currentCommand) return ''

    let command = currentCommand.template
    
    // Replace template variables
    for (const param of currentCommand.parameters) {
      const value = parameters[param.name]
      const regex = new RegExp(`{{\\s*${param.name}.*?}}`, 'g')
      
      if (value !== undefined && value !== '') {
        if (param.type === 'boolean') {
          command = command.replace(regex, value ? ` --${param.name.replace('_', '-')}` : '')
        } else {
          command = command.replace(regex, ` --${param.name.replace('_', '-')} ${value}`)
        }
      } else {
        command = command.replace(regex, '')
      }
    }

    // Replace direct parameter substitution
    for (const param of currentCommand.parameters) {
      const value = parameters[param.name]
      if (value !== undefined && value !== '') {
        command = command.replace(new RegExp(`\\$\\{${param.name}\\}`, 'g'), value)
      }
    }

    return command.trim()
  }, [currentCommand, parameters])

  const handleParameterChange = useCallback((paramName: string, value: any) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }))
  }, [])

  const copyToClipboard = useCallback(async () => {
    const command = generateCommand()
    if (command) {
      await navigator.clipboard.writeText(command)
      console.log('Command copied to clipboard')
    }
  }, [generateCommand])

  const exportAsScript = useCallback(() => {
    const command = generateCommand()
    if (!command) return

    const script = `#!/bin/bash
# Generated Solana CLI command
# ${currentCommand?.description || ''}

${command}
`

    const blob = new Blob([script], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solana-command-${Date.now()}.sh`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generateCommand, currentCommand])

  // Update generated command when parameters change
  useState(() => {
    setGeneratedCommand(generateCommand())
  })

  return (
    <div className="space-y-6">
      {/* Category Selection */}
      <PixelCard>
        <h2 className="font-pixel text-xl text-green-400 mb-4">📋 Command Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {COMMAND_CATEGORIES.map((category) => {
            const Icon = category.icon
            return (
              <PixelButton
                key={category.id}
                variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setSelectedCommand('')
                  setParameters({})
                }}
                className="flex flex-col items-center gap-2 h-auto py-4"
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs opacity-75">{category.description}</div>
                </div>
              </PixelButton>
            )
          })}
        </div>
      </PixelCard>

      {/* Command Selection */}
      {filteredCommands.length > 0 && (
        <PixelCard>
          <h2 className="font-pixel text-xl text-green-400 mb-4">⚡ Available Commands</h2>
          <div className="grid gap-3">
            {filteredCommands.map((command) => (
              <PixelButton
                key={command.id}
                variant={selectedCommand === command.id ? 'primary' : 'secondary'}
                onClick={() => {
                  setSelectedCommand(command.id)
                  setParameters({})
                }}
                className="text-left justify-start"
              >
                <div>
                  <div className="font-medium">{command.name}</div>
                  <div className="text-xs opacity-75">{command.description}</div>
                </div>
              </PixelButton>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Parameter Configuration */}
      {currentCommand && (
        <PixelCard>
          <h2 className="font-pixel text-xl text-green-400 mb-4">⚙️ Parameters</h2>
          
          {currentCommand.parameters.length > 0 ? (
            <div className="space-y-4">
              {currentCommand.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {param.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {param.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <div className="text-xs text-gray-400 mb-2">{param.description}</div>
                  
                  {param.type === 'boolean' ? (
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={parameters[param.name] || false}
                        onChange={(e) => handleParameterChange(param.name, e.target.checked)}
                        className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                      />
                      <span className="text-sm text-gray-300">Enable {param.name}</span>
                    </label>
                  ) : param.type === 'select' && param.options ? (
                    <select
                      value={parameters[param.name] || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-100 focus:ring-2 focus:ring-green-400 focus:border-transparent"
                    >
                      <option value="">Select {param.name}</option>
                      {param.options.map((option) => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <PixelInput
                      type={param.type === 'number' ? 'number' : 'text'}
                      value={parameters[param.name] || param.defaultValue || ''}
                      onChange={(e) => handleParameterChange(param.name, e.target.value)}
                      placeholder={param.placeholder}
                      className="w-full"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No parameters required for this command.</p>
          )}
        </PixelCard>
      )}

      {/* Generated Command */}
      {currentCommand && (
        <PixelCard>
          <h2 className="font-pixel text-xl text-green-400 mb-4">🔧 Generated Command</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-900 p-4 rounded border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-400">Command:</span>
                <div className="flex gap-2">
                  <PixelButton size="sm" onClick={copyToClipboard}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </PixelButton>
                  <PixelButton size="sm" onClick={exportAsScript} variant="secondary">
                    <Download className="w-4 h-4 mr-1" />
                    Export
                  </PixelButton>
                </div>
              </div>
              <div className="font-mono text-sm text-green-400 break-all">
                {generateCommand() || 'Configure parameters to generate command...'}
              </div>
            </div>

            {/* Examples */}
            {currentCommand.examples.length > 0 && (
              <div>
                <h3 className="text-yellow-400 font-medium mb-2">Examples:</h3>
                <div className="space-y-2">
                  {currentCommand.examples.map((example, index) => (
                    <div key={index} className="bg-gray-800 p-3 rounded border border-gray-700">
                      <div className="font-mono text-xs text-gray-300">{example}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PixelCard>
      )}
    </div>
  )
}