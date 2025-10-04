'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import MultisigService from '@/lib/solana/multisig/multisig-service'
import { MultisigProposal, MultisigAccount } from '@/lib/solana/multisig/types'
import { 
  Users, 
  Plus, 
  FileText, 
  Check, 
  X, 
  Clock, 
  Shield,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye
} from 'lucide-react'

interface CreateMultisigFormData {
  threshold: string
  owners: string
  description: string
}

export default function MultisigPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  
  const [multisigService, setMultisigService] = useState<MultisigService | null>(null)
  const [activeTab, setActiveTab] = useState<'create' | 'manage' | 'proposals'>('create')
  
  // Create multisig state
  const [createForm, setCreateForm] = useState<CreateMultisigFormData>({
    threshold: '2',
    owners: '',
    description: ''
  })
  const [isCreating, setIsCreating] = useState(false)
  const [createResult, setCreateResult] = useState<{
    multisigAccount: string
    signature: string
  } | null>(null)

  // Manage multisig state
  const [multisigAccounts, setMultisigAccounts] = useState<MultisigAccount[]>([])
  const [selectedMultisig, setSelectedMultisig] = useState<string>('')
  const [loadingAccounts, setLoadingAccounts] = useState(false)

  // Proposals state
  const [proposals, setProposals] = useState<MultisigProposal[]>([])
  const [loadingProposals, setLoadingProposals] = useState(false)

  // Initialize service
  useEffect(() => {
    if (connection) {
      setMultisigService(new MultisigService(connection))
    }
  }, [connection])

  // Load multisig accounts for connected wallet
  const loadMultisigAccounts = async () => {
    if (!multisigService || !publicKey) return

    setLoadingAccounts(true)
    try {
      const accounts = await multisigService.getMultisigAccountsForOwner(publicKey)
      const accountInfos: MultisigAccount[] = []
      
      for (const accountPubkey of accounts) {
        const info = await multisigService.getMultisigAccount(accountPubkey)
        if (info) {
          accountInfos.push(info)
        }
      }
      
      setMultisigAccounts(accountInfos)
    } catch (error) {
      console.error('Error loading multisig accounts:', error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  // Load proposals for selected multisig
  const loadProposals = async () => {
    if (!multisigService || !selectedMultisig) return

    setLoadingProposals(true)
    try {
      const multisigPubkey = new PublicKey(selectedMultisig)
      const proposalList = multisigService.getProposals(multisigPubkey)
      setProposals(proposalList)
    } catch (error) {
      console.error('Error loading proposals:', error)
    } finally {
      setLoadingProposals(false)
    }
  }

  // Create new multisig
  const handleCreateMultisig = async () => {
    if (!multisigService || !publicKey) {
      alert('Please connect your wallet first')
      return
    }

    if (!createForm.threshold || !createForm.owners) {
      alert('Please fill in all required fields')
      return
    }

    const threshold = parseInt(createForm.threshold)
    const ownerAddresses = createForm.owners.split('\n')
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0)

    if (ownerAddresses.length === 0) {
      alert('Please provide at least one owner address')
      return
    }

    if (threshold > ownerAddresses.length) {
      alert('Threshold cannot be greater than number of owners')
      return
    }

    setIsCreating(true)
    setCreateResult(null)

    try {
      const owners = ownerAddresses.map(addr => new PublicKey(addr))
      
      const { multisigAccount, transaction } = await multisigService.createMultisig({
        threshold,
        owners,
        payer: publicKey
      })

      // Send transaction
      const signature = await sendTransaction(transaction, connection)
      
      setCreateResult({
        multisigAccount: multisigAccount.toString(),
        signature
      })

      // Reset form
      setCreateForm({
        threshold: '2',
        owners: '',
        description: ''
      })

      // Reload accounts
      await loadMultisigAccounts()

    } catch (error) {
      console.error('Error creating multisig:', error)
      alert(`Failed to create multisig: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  // Sign proposal
  const handleSignProposal = async (proposalId: string, approve: boolean) => {
    if (!multisigService || !publicKey) return

    try {
      const updatedProposal = await multisigService.signTransaction({
        proposalId,
        signer: publicKey,
        approve
      })

      // Update proposals list
      setProposals(prev => prev.map(p => p.id === proposalId ? updatedProposal : p))
      
      alert(`Proposal ${approve ? 'approved' : 'rejected'} successfully`)
    } catch (error) {
      console.error('Error signing proposal:', error)
      alert(`Failed to sign proposal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Execute proposal
  const handleExecuteProposal = async (proposalId: string) => {
    if (!multisigService || !publicKey) return

    try {
      const { signature } = await multisigService.executeTransaction({
        proposalId,
        executor: publicKey
      })

      alert(`Proposal executed successfully! Signature: ${signature}`)
      await loadProposals()
    } catch (error) {
      console.error('Error executing proposal:', error)
      alert(`Failed to execute proposal: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === 'manage') {
      loadMultisigAccounts()
    } else if (activeTab === 'proposals' && selectedMultisig) {
      loadProposals()
    }
  }, [activeTab, selectedMultisig, multisigService, publicKey])

  const formatAddress = (address: string) => 
    `${address.slice(0, 6)}...${address.slice(-4)}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400'
      case 'approved': return 'text-green-400'
      case 'rejected': return 'text-red-400'
      case 'executed': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'approved': return <Check className="h-4 w-4" />
      case 'rejected': return <X className="h-4 w-4" />
      case 'executed': return <Shield className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          MULTISIG WALLET
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Create and manage multi-signature wallets for enhanced security
        </p>
      </div>

      {!publicKey && (
        <PixelCard>
          <div className="text-center py-8">
            <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="font-pixel text-lg text-yellow-400 mb-4">
              WALLET CONNECTION REQUIRED
            </h3>
            <p className="font-mono text-sm text-gray-400">
              Connect your wallet to create and manage multisig wallets
            </p>
          </div>
        </PixelCard>
      )}

      {publicKey && (
        <>
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2">
              {[
                { id: 'create', label: 'CREATE MULTISIG', icon: Plus },
                { id: 'manage', label: 'MANAGE', icon: Users },
                { id: 'proposals', label: 'PROPOSALS', icon: FileText }
              ].map(tab => (
                <PixelButton
                  key={tab.id}
                  variant={activeTab === tab.id ? 'primary' : 'secondary'}
                  onClick={() => setActiveTab(tab.id as any)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  [{tab.label}]
                </PixelButton>
              ))}
            </div>
          </div>

          {/* Create Multisig Tab */}
          {activeTab === 'create' && (
            <div className="space-y-6">
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      🛡️ CREATE NEW MULTISIG
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PixelInput
                      label="THRESHOLD"
                      type="number"
                      value={createForm.threshold}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, threshold: e.target.value }))}
                      placeholder="2"
                      min="1"
                    />
                    <PixelInput
                      label="DESCRIPTION (OPTIONAL)"
                      value={createForm.description}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="My Company Multisig"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-xs text-green-400 mb-2">
                      OWNER ADDRESSES (ONE PER LINE)
                    </label>
                    <textarea
                      value={createForm.owners}
                      onChange={(e) => setCreateForm(prev => ({ ...prev, owners: e.target.value }))}
                      placeholder={`${publicKey.toString()}\nEnter additional owner addresses...`}
                      className="w-full h-32 p-3 bg-gray-800 border-4 border-gray-700 text-white font-mono text-sm resize-none focus:border-green-400 focus:outline-none"
                    />
                  </div>

                  <div className="p-4 bg-yellow-900/20 border-4 border-yellow-600/20">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                      <div className="font-mono text-xs text-yellow-400">
                        <strong>Security Notice:</strong> Make sure all owner addresses are correct. 
                        Multisig accounts cannot be modified after creation.
                      </div>
                    </div>
                  </div>

                  <PixelButton
                    onClick={handleCreateMultisig}
                    disabled={isCreating}
                    isLoading={isCreating}
                    className="w-full"
                  >
                    {isCreating ? '[CREATING...]' : '[CREATE MULTISIG]'}
                  </PixelButton>
                </div>
              </PixelCard>

              {/* Create Result */}
              {createResult && (
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3">
                      <h3 className="font-pixel text-sm text-green-400">
                        ✅ MULTISIG CREATED SUCCESSFULLY
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">MULTISIG ADDRESS:</div>
                        <div className="flex items-center gap-2">
                          <div className="font-mono text-sm text-green-400 break-all">
                            {createResult.multisigAccount}
                          </div>
                          <button
                            onClick={() => navigator.clipboard.writeText(createResult.multisigAccount)}
                            className="text-gray-400 hover:text-green-400"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="font-mono text-xs text-gray-400 mb-1">TRANSACTION SIGNATURE:</div>
                        <div className="font-mono text-xs text-blue-400 break-all">
                          {createResult.signature}
                        </div>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}

              {/* Cost Information */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      💰 COST BREAKDOWN
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(MultisigService.estimateCosts()).map(([operation, cost]) => (
                      <div key={operation} className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                        <div className="font-mono text-sm text-white">{cost} SOL</div>
                        <div className="font-mono text-xs text-gray-400 capitalize">
                          {operation.replace(/([A-Z])/g, ' $1').trim()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </PixelCard>
            </div>
          )}

          {/* Manage Tab */}
          {activeTab === 'manage' && (
            <div className="space-y-6">
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                    <h3 className="font-pixel text-sm text-green-400">
                      👥 YOUR MULTISIG ACCOUNTS
                    </h3>
                    <PixelButton
                      variant="secondary"
                      onClick={loadMultisigAccounts}
                      disabled={loadingAccounts}
                      className="!py-1 !px-3 !text-xs"
                    >
                      {loadingAccounts ? 'LOADING...' : 'REFRESH'}
                    </PixelButton>
                  </div>

                  {multisigAccounts.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                      <div className="font-pixel text-sm text-gray-500">
                        NO MULTISIG ACCOUNTS FOUND
                      </div>
                      <div className="font-mono text-xs text-gray-600">
                        Create your first multisig account to get started
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {multisigAccounts.map((account, index) => (
                        <div 
                          key={index}
                          className="p-4 bg-gray-800 border-2 border-gray-700 hover:border-green-400/50 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-mono text-sm text-white">
                              {formatAddress(account.address.toString())}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-pixel text-xs text-green-400">
                                {account.threshold}/{account.owners.length}
                              </span>
                              <PixelButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setSelectedMultisig(account.address.toString())}
                              >
                                <Eye className="h-3 w-3" />
                              </PixelButton>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="font-mono text-xs text-gray-400">
                              Owners: {account.owners.length} | Threshold: {account.threshold}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {account.owners.map((owner: PublicKey, ownerIndex: number) => (
                                <span 
                                  key={ownerIndex}
                                  className={`font-mono text-xs px-2 py-1 border ${
                                    owner.equals(publicKey!) 
                                      ? 'border-green-400 text-green-400 bg-green-400/10' 
                                      : 'border-gray-600 text-gray-400'
                                  }`}
                                >
                                  {formatAddress(owner.toString())}
                                  {owner.equals(publicKey!) && ' (YOU)'}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </PixelCard>
            </div>
          )}

          {/* Proposals Tab */}
          {activeTab === 'proposals' && (
            <div className="space-y-6">
              {/* Multisig Selection */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📋 SELECT MULTISIG ACCOUNT
                    </h3>
                  </div>

                  <PixelInput
                    label="MULTISIG ADDRESS"
                    value={selectedMultisig}
                    onChange={(e) => setSelectedMultisig(e.target.value)}
                    placeholder="Enter multisig account address"
                  />
                </div>
              </PixelCard>

              {/* Proposals List */}
              {selectedMultisig && (
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                      <h3 className="font-pixel text-sm text-green-400">
                        📄 PROPOSALS
                      </h3>
                      <PixelButton
                        variant="secondary"
                        onClick={loadProposals}
                        disabled={loadingProposals}
                        className="!py-1 !px-3 !text-xs"
                      >
                        {loadingProposals ? 'LOADING...' : 'REFRESH'}
                      </PixelButton>
                    </div>

                    {proposals.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                        <div className="font-pixel text-sm text-gray-500">
                          NO PROPOSALS FOUND
                        </div>
                        <div className="font-mono text-xs text-gray-600">
                          Create a transaction proposal to get started
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {proposals.map((proposal) => (
                          <div 
                            key={proposal.id}
                            className="p-4 bg-gray-800 border-2 border-gray-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(proposal.status)}
                                <span className={`font-pixel text-sm ${getStatusColor(proposal.status)}`}>
                                  {proposal.status.toUpperCase()}
                                </span>
                              </div>
                              <div className="font-mono text-xs text-gray-400">
                                {proposal.currentSignatures}/{proposal.requiredSignatures} signatures
                              </div>
                            </div>

                            {proposal.description && (
                              <div className="mb-3">
                                <div className="font-mono text-sm text-white">
                                  {proposal.description}
                                </div>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="font-mono text-xs text-gray-400">
                                Proposed by: {formatAddress(proposal.proposer.toString())}
                              </div>
                              
                              {proposal.status === 'pending' && (
                                <div className="flex gap-2">
                                  <PixelButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSignProposal(proposal.id, true)}
                                    className="!text-green-400"
                                  >
                                    <Check className="h-3 w-3" />
                                    APPROVE
                                  </PixelButton>
                                  <PixelButton
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSignProposal(proposal.id, false)}
                                    className="!text-red-400"
                                  >
                                    <X className="h-3 w-3" />
                                    REJECT
                                  </PixelButton>
                                </div>
                              )}

                              {proposal.status === 'approved' && (
                                <PixelButton
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleExecuteProposal(proposal.id)}
                                >
                                  <Shield className="h-3 w-3" />
                                  EXECUTE
                                </PixelButton>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </PixelCard>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}