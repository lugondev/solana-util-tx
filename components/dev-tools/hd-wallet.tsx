'use client'

import { useState, useEffect } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { 
  HDWalletGenerator,
  HDWalletResult,
  DerivationAccount,
  validateMnemonic,
  generateMnemonic
} from '@/lib/solana/generators/hd-wallet'
import { 
  Plus,
  Download,
  Copy,
  Eye,
  EyeOff,
  RefreshCw,
  Key,
  TreePine,
  Hash,
  CheckCircle,
  AlertTriangle,
  Settings
} from 'lucide-react'
import { PixelToast } from '@/components/ui/pixel-toast'

export function HDWalletComponent() {
  // State
  const [mnemonic, setMnemonic] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [derivationPath, setDerivationPath] = useState("m/44'/501'/0'/0/")
  const [accountStart, setAccountStart] = useState(0)
  const [accountCount, setAccountCount] = useState(5)
  const [includeChange, setIncludeChange] = useState(false)
  
  const [accounts, setAccounts] = useState<DerivationAccount[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [showMnemonic, setShowMnemonic] = useState(false)
  const [showPrivateKeys, setShowPrivateKeys] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [mnemonicWordCount, setMnemonicWordCount] = useState<12 | 15 | 18 | 21 | 24>(12)
  
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const generator = new HDWalletGenerator()

  // Generate new mnemonic
  const handleGenerateNewMnemonic = async () => {
    try {
      setError(null)
      const newMnemonic = await generateMnemonic(mnemonicWordCount)
      setMnemonic(newMnemonic)
      setShowToast({ message: 'New mnemonic generated successfully!', type: 'success' })
    } catch (err) {
      setError('Failed to generate mnemonic')
      setShowToast({ message: 'Failed to generate mnemonic', type: 'error' })
    }
  }

  // Derive accounts
  const handleDeriveAccounts = async () => {
    if (!mnemonic.trim()) {
      setError('Please enter or generate a mnemonic phrase')
      return
    }

    if (!validateMnemonic(mnemonic)) {
      setError('Invalid mnemonic phrase')
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const result = await generator.deriveAccounts({
        mnemonic: mnemonic.trim(),
        passphrase: passphrase || undefined,
        derivationPath,
        accountStart,
        accountCount,
        includeChange
      })

      setAccounts(result.accounts)
      setShowToast({ message: `Successfully derived ${result.accounts.length} accounts!`, type: 'success' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to derive accounts')
      setShowToast({ message: 'Failed to derive accounts', type: 'error' })
    } finally {
      setIsGenerating(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  // Export accounts
  const exportAccounts = () => {
    const exportData = {
      mnemonic: showMnemonic ? mnemonic : '[HIDDEN]',
      passphrase: passphrase || null,
      derivationPath,
      accounts: accounts.map(acc => ({
        index: acc.index,
        path: acc.path,
        publicKey: acc.publicKey,
        privateKey: showPrivateKeys ? acc.privateKey : '[HIDDEN]'
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hd-wallet-accounts-${accounts.length}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Validate inputs
  const isValidMnemonic = mnemonic.trim() && validateMnemonic(mnemonic)

  return (
    <div className="space-y-6">
      {/* Mnemonic Section */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-green-400/20 pb-4">
            <h2 className="font-pixel text-lg text-green-400">
              🔑 SEED PHRASE MANAGEMENT
            </h2>
          </div>

          <div className="space-y-4">
            {/* Mnemonic Input */}
            <div>
              <label className="block font-pixel text-sm text-white mb-2">
                Mnemonic Phrase (BIP39):
              </label>
              <div className="relative">
                <textarea
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="Enter existing mnemonic or generate new one..."
                  className={`w-full px-3 py-3 bg-gray-800 border-4 ${
                    isValidMnemonic ? 'border-green-600' : 'border-gray-700'
                  } focus:border-green-400 font-mono text-sm text-white placeholder-gray-500 resize-none`}
                  rows={3}
                />
                <button
                  onClick={() => setShowMnemonic(!showMnemonic)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-white"
                >
                  {showMnemonic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {mnemonic && (
                <div className="mt-1 flex items-center gap-2">
                  {isValidMnemonic ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="font-mono text-xs text-green-400">
                        Valid mnemonic ({mnemonic.trim().split(' ').length} words)
                      </span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 text-red-400" />
                      <span className="font-mono text-xs text-red-400">
                        Invalid mnemonic phrase
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Generation Controls */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <label className="font-pixel text-sm text-white">Words:</label>
                <select
                  value={mnemonicWordCount}
                  onChange={(e) => setMnemonicWordCount(parseInt(e.target.value) as any)}
                  className="px-2 py-1 bg-gray-800 border-2 border-gray-600 text-white font-mono text-sm"
                >
                  <option value={12}>12</option>
                  <option value={15}>15</option>
                  <option value={18}>18</option>
                  <option value={21}>21</option>
                  <option value={24}>24</option>
                </select>
              </div>

              <PixelButton
                onClick={handleGenerateNewMnemonic}
                variant="primary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Generate New
              </PixelButton>

              {mnemonic && (
                <PixelButton
                  onClick={() => copyToClipboard(mnemonic, 'mnemonic')}
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  {copied === 'mnemonic' ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  Copy Mnemonic
                </PixelButton>
              )}
            </div>

            {/* Optional Passphrase */}
            <div>
              <label className="block font-pixel text-sm text-white mb-2">
                BIP39 Passphrase (Optional):
              </label>
              <PixelInput
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Optional additional passphrase for extra security"
              />
              <div className="mt-1 font-mono text-xs text-gray-400">
                Adding a passphrase creates a completely different set of wallets
              </div>
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Derivation Settings */}
      <PixelCard>
        <div className="space-y-4">
          <div className="border-b-4 border-blue-400/20 pb-4">
            <div className="flex justify-between items-center">
              <h2 className="font-pixel text-lg text-blue-400">
                🌳 DERIVATION SETTINGS
              </h2>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 font-pixel text-sm text-blue-400 hover:text-blue-300"
              >
                <Settings className="h-4 w-4" />
                Advanced
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Settings */}
            <div className="space-y-4">
              <div>
                <label className="block font-pixel text-sm text-white mb-2">
                  Base Derivation Path:
                </label>
                <PixelInput
                  value={derivationPath}
                  onChange={(e) => setDerivationPath(e.target.value)}
                  placeholder="m/44'/501'/0'/0/"
                />
                <div className="mt-1 font-mono text-xs text-gray-400">
                  Standard Solana path: m/44'/501'/0'/0/
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-sm text-white mb-2">
                    Start Index:
                  </label>
                  <PixelInput
                    type="number"
                    value={accountStart}
                    onChange={(e) => setAccountStart(Math.max(0, parseInt(e.target.value) || 0))}
                    min={0}
                    max={100}
                  />
                </div>

                <div>
                  <label className="block font-pixel text-sm text-white mb-2">
                    Account Count:
                  </label>
                  <PixelInput
                    type="number"
                    value={accountCount}
                    onChange={(e) => setAccountCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                    min={1}
                    max={20}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="includeChange"
                  checked={includeChange}
                  onChange={(e) => setIncludeChange(e.target.checked)}
                  className="w-4 h-4 text-blue-400 border-gray-600 rounded"
                />
                <label htmlFor="includeChange" className="font-pixel text-sm text-white">
                  Include Change Addresses (1/)
                </label>
              </div>
            </div>

            {/* Advanced Settings */}
            {showAdvanced && (
              <div className="p-4 bg-gray-800/50 border-2 border-blue-400/30 space-y-4">
                <div className="font-pixel text-sm text-blue-400 mb-2">Advanced Options:</div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 border border-gray-600">
                    <div className="font-mono text-xs text-gray-300 mb-2">Common Derivation Paths:</div>
                    <div className="space-y-1">
                      {[
                        { label: 'Standard Solana', path: "m/44'/501'/0'/0/" },
                        { label: 'Phantom Wallet', path: "m/44'/501'/0'/0/" },
                        { label: 'Ledger Live', path: "m/44'/501'/0'/" },
                        { label: 'Custom Account', path: "m/44'/501'/1'/0/" }
                      ].map((preset, i) => (
                        <button
                          key={i}
                          onClick={() => setDerivationPath(preset.path)}
                          className="block w-full text-left p-2 hover:bg-gray-700 font-mono text-xs text-white"
                        >
                          <span className="text-blue-400">{preset.label}:</span> {preset.path}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showPrivateKeys"
                      checked={showPrivateKeys}
                      onChange={(e) => setShowPrivateKeys(e.target.checked)}
                      className="w-4 h-4 text-red-400 border-gray-600 rounded"
                    />
                    <label htmlFor="showPrivateKeys" className="font-pixel text-sm text-red-400">
                      Show Private Keys in Results
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <PixelButton
            onClick={handleDeriveAccounts}
            variant="primary"
            disabled={!isValidMnemonic || isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Deriving Accounts...
              </>
            ) : (
              <>
                <TreePine className="h-4 w-4" />
                Derive {accountCount} Account{accountCount > 1 ? 's' : ''}
              </>
            )}
          </PixelButton>
        </div>
      </PixelCard>

      {/* Error Display */}
      {error && (
        <PixelCard>
          <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <span className="font-pixel text-sm text-red-400">ERROR:</span>
            </div>
            <div className="font-mono text-sm text-gray-300 mt-1">{error}</div>
          </div>
        </PixelCard>
      )}

      {/* Results */}
      {accounts.length > 0 && (
        <PixelCard>
          <div className="space-y-4">
            <div className="border-b-4 border-purple-400/20 pb-4">
              <div className="flex justify-between items-center">
                <h2 className="font-pixel text-lg text-purple-400">
                  📋 DERIVED ACCOUNTS ({accounts.length})
                </h2>
                <div className="flex gap-2">
                  <PixelButton
                    onClick={exportAccounts}
                    variant="primary"
                    className="flex items-center gap-2 !text-xs"
                  >
                    <Download className="h-3 w-3" />
                    Export
                  </PixelButton>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                <div className="font-pixel text-xs text-green-400">ACCOUNTS</div>
                <div className="font-mono text-lg text-white">{accounts.length}</div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                <div className="font-pixel text-xs text-blue-400">PATH</div>
                <div className="font-mono text-sm text-white">{derivationPath}</div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                <div className="font-pixel text-xs text-purple-400">RANGE</div>
                <div className="font-mono text-lg text-white">{accountStart}-{accountStart + accountCount - 1}</div>
              </div>
              <div className="p-3 bg-gray-800 border-2 border-gray-700 text-center">
                <div className="font-pixel text-xs text-yellow-400">CHANGE</div>
                <div className="font-mono text-lg text-white">{includeChange ? 'Yes' : 'No'}</div>
              </div>
            </div>

            {/* Account List */}
            <div className="space-y-3">
              {accounts.map((account, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-800 border-2 border-gray-700 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <div className="font-pixel text-sm text-blue-400">
                      Account #{account.index} {account.path.includes('/1/') ? '(Change)' : ''}
                    </div>
                    <div className="font-mono text-xs text-gray-400">
                      {account.path}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-pixel text-xs text-green-400">PUBLIC KEY:</span>
                        <button
                          onClick={() => copyToClipboard(account.publicKey, `pub-${index}`)}
                          className="text-gray-400 hover:text-white"
                        >
                          {copied === `pub-${index}` ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-xs text-white bg-gray-900 p-2 border border-gray-600 break-all">
                        {account.publicKey}
                      </div>
                    </div>
                    
                    {showPrivateKeys && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-pixel text-xs text-red-400">PRIVATE KEY:</span>
                          <button
                            onClick={() => copyToClipboard(account.privateKey, `priv-${index}`)}
                            className="text-gray-400 hover:text-white"
                          >
                            {copied === `priv-${index}` ? (
                              <CheckCircle className="h-3 w-3 text-green-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                        <div className="font-mono text-xs text-white bg-gray-900 p-2 border border-gray-600 break-all">
                          {account.privateKey}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Security Warning */}
            <div className="p-4 bg-red-900/20 border-4 border-red-600/30">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <div className="font-pixel text-sm text-red-400">CRITICAL SECURITY WARNING:</div>
                  <div className="font-mono text-xs text-gray-300">
                    • Your seed phrase controls ALL derived accounts<br/>
                    • Store your mnemonic phrase extremely securely<br/>
                    • Anyone with the seed phrase can access all derived wallets<br/>
                    • Export and store this information safely before closing<br/>
                    • Consider using hardware wallets for significant funds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Toast */}
      {showToast && (
        <PixelToast
          message={showToast.message}
          type={showToast.type}
          onClose={() => setShowToast(null)}
        />
      )}
    </div>
  )
}