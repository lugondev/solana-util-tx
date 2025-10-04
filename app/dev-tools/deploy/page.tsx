'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import ProgramDeploymentService from '@/lib/solana/program-deployment/deployment-service'
import { 
  Upload, 
  Rocket, 
  Shield, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  FileCode,
  Zap,
  DollarSign,
  Clock,
  ExternalLink,
  Download
} from 'lucide-react'

interface DeploymentFormData {
  programName: string
  programType: 'immutable' | 'upgradeable'
  upgradeAuthority: string
  description: string
  bytecodeFile: File | null
}

export default function ProgramDeploymentPage() {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  
  const [deploymentService, setDeploymentService] = useState<ProgramDeploymentService | null>(null)
  const [activeTab, setActiveTab] = useState<'deploy' | 'upgrade' | 'manage'>('deploy')
  
  // Deploy state
  const [deployForm, setDeployForm] = useState<DeploymentFormData>({
    programName: '',
    programType: 'upgradeable',
    upgradeAuthority: '',
    description: '',
    bytecodeFile: null
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [deployResult, setDeployResult] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)

  // File upload state
  const [dragActive, setDragActive] = useState(false)

  // Stats
  const [stats, setStats] = useState<any>(null)

  // Initialize service
  useEffect(() => {
    if (connection) {
      const service = new ProgramDeploymentService(connection)
      setDeploymentService(service)
      setStats(service.getDeploymentStats())
    }
  }, [connection])

  // Update upgrade authority when wallet connects
  useEffect(() => {
    if (publicKey && !deployForm.upgradeAuthority) {
      setDeployForm(prev => ({
        ...prev,
        upgradeAuthority: publicKey.toString()
      }))
    }
  }, [publicKey])

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (!deploymentService) return

    setDeployForm(prev => ({ ...prev, bytecodeFile: file }))

    // Read and validate file
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const buffer = Buffer.from(e.target?.result as ArrayBuffer)
        const validationResult = deploymentService.validateProgramBytecode(buffer)
        setValidation(validationResult)
      } catch (error) {
        console.error('Error reading file:', error)
        setValidation({
          isValid: false,
          size: 0,
          sizeCategory: 'unknown',
          estimatedCost: 0,
          issues: ['Failed to read bytecode file']
        })
      }
    }
    reader.readAsArrayBuffer(file)
  }

  // Handle drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }

  // Deploy program
  const handleDeploy = async () => {
    if (!deploymentService || !publicKey || !deployForm.bytecodeFile) {
      alert('Please fill in all required fields and select a bytecode file')
      return
    }

    if (!validation?.isValid) {
      alert('Please upload a valid program bytecode file')
      return
    }

    setIsDeploying(true)
    setDeployResult(null)

    try {
      // Read bytecode file
      const bytecode = await new Promise<Buffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(Buffer.from(e.target?.result as ArrayBuffer))
        reader.onerror = reject
        reader.readAsArrayBuffer(deployForm.bytecodeFile!)
      })

      let result
      if (deployForm.programType === 'upgradeable') {
        const upgradeAuthority = new PublicKey(deployForm.upgradeAuthority)
        result = await deploymentService.deployUpgradeableProgram(
          bytecode,
          publicKey,
          upgradeAuthority,
          {
            programName: deployForm.programName
          }
        )
      } else {
        result = await deploymentService.deployProgram(
          bytecode,
          publicKey,
          {
            programName: deployForm.programName
          }
        )
      }

      // Send transaction
      const signature = await sendTransaction(result.transaction, connection)
      
      setDeployResult({
        programId: result.programKeypair.publicKey.toString(),
        signature,
        estimatedCost: result.estimatedCost,
        type: deployForm.programType
      })

      // Reset form
      setDeployForm({
        programName: '',
        programType: 'upgradeable',
        upgradeAuthority: publicKey.toString(),
        description: '',
        bytecodeFile: null
      })
      setValidation(null)

    } catch (error) {
      console.error('Deployment error:', error)
      alert(`Deployment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsDeploying(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getSizeColor = (category: string) => {
    switch (category) {
      case 'small': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'large': return 'text-orange-400'
      case 'xlarge': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          PROGRAM DEPLOYMENT
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Deploy, upgrade, and manage Solana programs
        </p>
      </div>

      {!publicKey && (
        <PixelCard>
          <div className="text-center py-8">
            <Rocket className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="font-pixel text-lg text-yellow-400 mb-4">
              WALLET CONNECTION REQUIRED
            </h3>
            <p className="font-mono text-sm text-gray-400">
              Connect your wallet to deploy and manage programs
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
                { id: 'deploy', label: 'DEPLOY', icon: Rocket },
                { id: 'upgrade', label: 'UPGRADE', icon: Settings },
                { id: 'manage', label: 'MANAGE', icon: Shield }
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

          {/* Deploy Tab */}
          {activeTab === 'deploy' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Main Deploy Form */}
              <div className="xl:col-span-2 space-y-6">
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3">
                      <h3 className="font-pixel text-sm text-green-400">
                        🚀 DEPLOY NEW PROGRAM
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <PixelInput
                        label="PROGRAM NAME"
                        value={deployForm.programName}
                        onChange={(e) => setDeployForm(prev => ({ ...prev, programName: e.target.value }))}
                        placeholder="My Solana Program"
                      />
                      <div>
                        <label className="block font-pixel text-xs text-green-400 mb-2">
                          PROGRAM TYPE
                        </label>
                        <select
                          value={deployForm.programType}
                          onChange={(e) => setDeployForm(prev => ({ ...prev, programType: e.target.value as any }))}
                          className="w-full p-3 bg-gray-800 border-4 border-gray-700 text-white font-mono text-sm focus:border-green-400 focus:outline-none"
                        >
                          <option value="upgradeable">Upgradeable</option>
                          <option value="immutable">Immutable</option>
                        </select>
                      </div>
                    </div>

                    {deployForm.programType === 'upgradeable' && (
                      <PixelInput
                        label="UPGRADE AUTHORITY"
                        value={deployForm.upgradeAuthority}
                        onChange={(e) => setDeployForm(prev => ({ ...prev, upgradeAuthority: e.target.value }))}
                        placeholder="Public key of upgrade authority"
                      />
                    )}

                    <div>
                      <label className="block font-pixel text-xs text-green-400 mb-2">
                        DESCRIPTION (OPTIONAL)
                      </label>
                      <textarea
                        value={deployForm.description}
                        onChange={(e) => setDeployForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of your program"
                        className="w-full h-24 p-3 bg-gray-800 border-4 border-gray-700 text-white font-mono text-sm resize-none focus:border-green-400 focus:outline-none"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <label className="block font-pixel text-xs text-green-400 mb-2">
                        PROGRAM BYTECODE (.so file)
                      </label>
                      <div
                        className={`border-4 border-dashed p-8 text-center transition-colors ${
                          dragActive 
                            ? 'border-green-400 bg-green-400/10' 
                            : 'border-gray-600 hover:border-gray-500'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="h-8 w-8 text-gray-500 mx-auto mb-3" />
                        <div className="font-pixel text-sm text-gray-400 mb-2">
                          DROP .SO FILE HERE
                        </div>
                        <div className="font-mono text-xs text-gray-500 mb-3">
                          or click to browse
                        </div>
                        <input
                          type="file"
                          accept=".so"
                          onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                          className="hidden"
                          id="bytecode-upload"
                        />
                        <label htmlFor="bytecode-upload">
                          <PixelButton variant="secondary" className="cursor-pointer">
                            <FileCode className="h-4 w-4" />
                            [BROWSE FILES]
                          </PixelButton>
                        </label>
                        
                        {deployForm.bytecodeFile && (
                          <div className="mt-4 p-3 bg-gray-800 border-2 border-gray-700">
                            <div className="font-mono text-sm text-green-400">
                              📁 {deployForm.bytecodeFile.name}
                            </div>
                            <div className="font-mono text-xs text-gray-400">
                              {formatBytes(deployForm.bytecodeFile.size)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Validation Results */}
                    {validation && (
                      <div className={`p-4 border-4 ${
                        validation.isValid 
                          ? 'border-green-600/20 bg-green-600/10' 
                          : 'border-red-600/20 bg-red-600/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-3">
                          {validation.isValid ? (
                            <CheckCircle className="h-4 w-4 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          )}
                          <span className={`font-pixel text-sm ${
                            validation.isValid ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {validation.isValid ? 'BYTECODE VALID' : 'VALIDATION FAILED'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div className="text-center">
                            <div className="font-mono text-sm text-white">
                              {formatBytes(validation.size)}
                            </div>
                            <div className="font-mono text-xs text-gray-400">Size</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-mono text-sm ${getSizeColor(validation.sizeCategory)}`}>
                              {validation.sizeCategory.toUpperCase()}
                            </div>
                            <div className="font-mono text-xs text-gray-400">Category</div>
                          </div>
                          <div className="text-center">
                            <div className="font-mono text-sm text-yellow-400">
                              {validation.estimatedCost.toFixed(6)} SOL
                            </div>
                            <div className="font-mono text-xs text-gray-400">Est. Cost</div>
                          </div>
                          <div className="text-center">
                            <div className={`font-mono text-sm ${
                              validation.issues.length === 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {validation.issues.length}
                            </div>
                            <div className="font-mono text-xs text-gray-400">Issues</div>
                          </div>
                        </div>

                        {validation.issues.length > 0 && (
                          <div className="space-y-1">
                            <div className="font-pixel text-xs text-red-400">ISSUES:</div>
                            {validation.issues.map((issue: string, index: number) => (
                              <div key={index} className="font-mono text-xs text-red-300">
                                • {issue}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <PixelButton
                      onClick={handleDeploy}
                      disabled={isDeploying || !validation?.isValid}
                      isLoading={isDeploying}
                      className="w-full"
                    >
                      {isDeploying ? '[DEPLOYING...]' : '[🚀 DEPLOY PROGRAM 🚀]'}
                    </PixelButton>
                  </div>
                </PixelCard>

                {/* Deploy Result */}
                {deployResult && (
                  <PixelCard>
                    <div className="space-y-4">
                      <div className="border-b-4 border-green-400/20 pb-3">
                        <h3 className="font-pixel text-sm text-green-400">
                          ✅ PROGRAM DEPLOYED SUCCESSFULLY
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="font-mono text-xs text-gray-400 mb-1">PROGRAM ID:</div>
                          <div className="font-mono text-sm text-green-400 break-all">
                            {deployResult.programId}
                          </div>
                        </div>

                        <div>
                          <div className="font-mono text-xs text-gray-400 mb-1">TRANSACTION:</div>
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-xs text-blue-400 break-all flex-1">
                              {deployResult.signature}
                            </div>
                            <button
                              onClick={() => window.open(`https://explorer.solana.com/tx/${deployResult.signature}`, '_blank')}
                              className="text-gray-400 hover:text-green-400"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="font-mono text-xs text-gray-400 mb-1">TYPE:</div>
                            <div className="font-mono text-sm text-white">
                              {deployResult.type.toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-mono text-xs text-gray-400 mb-1">COST:</div>
                            <div className="font-mono text-sm text-yellow-400">
                              {deployResult.estimatedCost.toFixed(6)} SOL
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PixelCard>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Size Guide */}
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3">
                      <h3 className="font-pixel text-sm text-green-400">
                        📏 SIZE GUIDE
                      </h3>
                    </div>

                    <div className="space-y-3">
                      {ProgramDeploymentService.getSizeRecommendations().map((rec) => (
                        <div key={rec.category} className="p-3 bg-gray-800 border-2 border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-pixel text-xs ${getSizeColor(rec.category.toLowerCase())}`}>
                              {rec.category.toUpperCase()}
                            </span>
                            <span className="font-mono text-xs text-gray-400">
                              {formatBytes(rec.maxSize)}
                            </span>
                          </div>
                          <div className="font-mono text-xs text-gray-400 mb-2">
                            {rec.description}
                          </div>
                          <div className="space-y-1">
                            {rec.examples.slice(0, 2).map((example, idx) => (
                              <div key={idx} className="font-mono text-xs text-gray-500">
                                • {example}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PixelCard>

                {/* Cost Calculator */}
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3">
                      <h3 className="font-pixel text-sm text-green-400">
                        💰 COST BREAKDOWN
                      </h3>
                    </div>

                    {validation && (
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Base Rent:</span>
                          <span className="font-mono text-xs text-white">
                            {deploymentService?.calculateDeploymentCost(validation.size, deployForm.programType === 'upgradeable').rentExemption.toFixed(6)} SOL
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-mono text-xs text-gray-400">Data Fee:</span>
                          <span className="font-mono text-xs text-white">
                            {deploymentService?.calculateDeploymentCost(validation.size, deployForm.programType === 'upgradeable').dataFee.toFixed(6)} SOL
                          </span>
                        </div>
                        {deployForm.programType === 'upgradeable' && (
                          <div className="flex justify-between">
                            <span className="font-mono text-xs text-gray-400">Upgradeable Fee:</span>
                            <span className="font-mono text-xs text-white">
                              {deploymentService?.calculateDeploymentCost(validation.size, true).upgradeableFee.toFixed(6)} SOL
                            </span>
                          </div>
                        )}
                        <div className="border-t border-gray-600 pt-2">
                          <div className="flex justify-between">
                            <span className="font-pixel text-sm text-green-400">TOTAL:</span>
                            <span className="font-pixel text-sm text-yellow-400">
                              {validation.estimatedCost.toFixed(6)} SOL
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {!validation && (
                      <div className="text-center py-4">
                        <DollarSign className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                        <div className="font-mono text-sm text-gray-500">
                          Upload bytecode to see cost estimate
                        </div>
                      </div>
                    )}
                  </div>
                </PixelCard>

                {/* Quick Stats */}
                {stats && (
                  <PixelCard>
                    <div className="space-y-4">
                      <div className="border-b-4 border-green-400/20 pb-3">
                        <h3 className="font-pixel text-sm text-green-400">
                          📊 DEPLOYMENT STATS
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                          <div className="font-mono text-lg text-green-400">{stats.totalDeployments}</div>
                          <div className="font-mono text-xs text-gray-400">Total</div>
                        </div>
                        <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                          <div className="font-mono text-lg text-yellow-400">{stats.successRate}%</div>
                          <div className="font-mono text-xs text-gray-400">Success</div>
                        </div>
                      </div>
                    </div>
                  </PixelCard>
                )}
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {activeTab === 'upgrade' && (
            <PixelCard>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  PROGRAM UPGRADE
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Program upgrade functionality coming soon
                </p>
              </div>
            </PixelCard>
          )}

          {activeTab === 'manage' && (
            <PixelCard>
              <div className="text-center py-12">
                <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  PROGRAM MANAGEMENT
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Program management interface coming soon
                </p>
              </div>
            </PixelCard>
          )}
        </>
      )}
    </div>
  )
}