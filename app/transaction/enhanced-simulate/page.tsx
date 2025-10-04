'use client'

import { useState, useEffect } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { EnhancedTransactionService, TransactionTemplate, EnhancedSimulationResult } from '@/lib/solana/transactions/enhanced-service'
import { 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  Settings,
  ChevronDown,
  ChevronUp,
  Play,
  RotateCcw,
  Info
} from 'lucide-react'

export default function EnhancedSimulationPage() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  // State
  const [service, setService] = useState<EnhancedTransactionService | null>(null)
  const [templates, setTemplates] = useState<TransactionTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TransactionTemplate | null>(null)
  const [parameters, setParameters] = useState<Record<string, string>>({})
  const [simulationConfig, setSimulationConfig] = useState({
    computeUnits: 0,
    priorityFee: 1000,
    skipPreflight: false
  })
  const [result, setResult] = useState<EnhancedSimulationResult | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize service
  useEffect(() => {
    if (connection) {
      const txService = new EnhancedTransactionService(connection)
      setService(txService)
      setTemplates(txService.getTemplates())
    }
  }, [connection])

  // Update compute units when template changes
  useEffect(() => {
    if (selectedTemplate) {
      setSimulationConfig(prev => ({
        ...prev,
        computeUnits: selectedTemplate.estimatedComputeUnits
      }))
      
      // Reset parameters
      const defaultParams: Record<string, string> = {}
      selectedTemplate.parameters.forEach(param => {
        defaultParams[param.name] = ''
      })
      setParameters(defaultParams)
    }
  }, [selectedTemplate])

  const handleParameterChange = (name: string, value: string) => {
    setParameters(prev => ({ ...prev, [name]: value }))
    setErrors([]) // Clear errors when user types
  }

  const validateAndSimulate = async () => {
    if (!service || !selectedTemplate || !publicKey) return

    // Validate parameters
    const validation = service.validateTransaction(selectedTemplate.id, parameters)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setIsSimulating(true)
    setErrors([])
    setResult(null)

    try {
      // Build transaction
      const transaction = await service.buildTransaction(
        selectedTemplate.id,
        parameters,
        publicKey,
        simulationConfig
      )

      if (!transaction) {
        throw new Error('Failed to build transaction')
      }

      // Simulate with analysis
      const simulationResult = await service.simulateWithAnalysis(transaction, simulationConfig)
      setResult(simulationResult)

    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unknown error'])
    } finally {
      setIsSimulating(false)
    }
  }

  const reset = () => {
    setSelectedTemplate(null)
    setParameters({})
    setResult(null)
    setErrors([])
  }

  const formatComputeUnits = (units: number) => {
    if (units >= 1000000) return `${(units / 1000000).toFixed(1)}M`
    if (units >= 1000) return `${(units / 1000).toFixed(1)}K`
    return units.toString()
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'LOW': return 'text-green-400'
      case 'MEDIUM': return 'text-yellow-400'
      case 'HIGH': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system': return '⚙️'
      case 'token': return '🪙'
      case 'defi': return '🔄'
      case 'nft': return '🖼️'
      case 'advanced': return '🔧'
      default: return '📦'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-pixel text-2xl text-green-400 mb-2 flex items-center gap-3">
          <span className="animate-pulse">▸</span>
          ENHANCED TRANSACTION SIMULATION
        </h1>
        <p className="font-mono text-sm text-gray-400">
          Test different transaction types with advanced analysis and optimization
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Template Selection */}
        <div className="xl:col-span-1 space-y-6">
          <PixelCard>
            <div className="space-y-4">
              <div className="border-b-4 border-green-400/20 pb-3">
                <h3 className="font-pixel text-sm text-green-400">
                  📋 TRANSACTION TEMPLATES
                </h3>
              </div>

              <div className="space-y-2">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    className={`w-full p-3 text-left border-2 transition-colors ${
                      selectedTemplate?.id === template.id
                        ? 'border-green-400 bg-green-400/10'
                        : 'border-gray-700 hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{template.icon}</span>
                      <div className="flex-1">
                        <div className="font-pixel text-xs text-white">
                          {template.name}
                        </div>
                        <div className="font-mono text-xs text-gray-400">
                          {template.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-mono text-xs text-blue-400">
                            {formatComputeUnits(template.estimatedComputeUnits)} CU
                          </span>
                          <span className={`font-pixel text-xs ${getRiskColor(template.riskLevel)}`}>
                            {template.riskLevel}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </PixelCard>

          {/* Template Info */}
          {selectedTemplate && (
            <PixelCard>
              <div className="space-y-4">
                <div className="border-b-4 border-green-400/20 pb-3">
                  <h3 className="font-pixel text-sm text-green-400">
                    ℹ️ TEMPLATE INFO
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedTemplate.icon}</span>
                    <div>
                      <div className="font-pixel text-sm text-white">
                        {selectedTemplate.name}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        {getCategoryIcon(selectedTemplate.category)} {selectedTemplate.category.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-800 border-2 border-gray-700">
                    <div className="font-mono text-xs text-gray-300">
                      {selectedTemplate.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-2 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-sm text-blue-400">
                        {formatComputeUnits(selectedTemplate.estimatedComputeUnits)}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Compute Units</div>
                    </div>
                    <div className="text-center p-2 bg-gray-800 border-2 border-gray-700">
                      <div className={`font-pixel text-sm ${getRiskColor(selectedTemplate.riskLevel)}`}>
                        {selectedTemplate.riskLevel}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Risk Level</div>
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Middle Column: Parameters & Configuration */}
        <div className="xl:col-span-1 space-y-6">
          {selectedTemplate ? (
            <>
              {/* Parameters */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      ⚙️ PARAMETERS
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {selectedTemplate.parameters.map((param) => (
                      <div key={param.name}>
                        {param.type === 'select' ? (
                          <div className="space-y-1">
                            <label className="font-pixel text-xs text-gray-400">
                              {param.label} {param.required && '*'}
                            </label>
                            <select
                              className="w-full p-2 bg-gray-900 border-4 border-gray-700 font-mono text-sm text-white"
                              value={parameters[param.name] || ''}
                              onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            >
                              <option value="">Select...</option>
                              {param.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : param.type === 'string' && param.name === 'recipients' ? (
                          <div className="space-y-1">
                            <label className="font-pixel text-xs text-gray-400">
                              {param.label} {param.required && '*'}
                            </label>
                            <textarea
                              className="w-full p-2 bg-gray-900 border-4 border-gray-700 font-mono text-sm text-white h-24 resize-none"
                              value={parameters[param.name] || ''}
                              onChange={(e) => handleParameterChange(param.name, e.target.value)}
                              placeholder={param.placeholder}
                            />
                          </div>
                        ) : param.type === 'string' && param.name === 'memo' ? (
                          <div className="space-y-1">
                            <label className="font-pixel text-xs text-gray-400">
                              {param.label} {param.required && '*'}
                            </label>
                            <textarea
                              className="w-full p-2 bg-gray-900 border-4 border-gray-700 font-mono text-sm text-white h-20 resize-none"
                              value={parameters[param.name] || ''}
                              onChange={(e) => handleParameterChange(param.name, e.target.value)}
                              placeholder={param.placeholder}
                              maxLength={566}
                            />
                            <div className="font-mono text-xs text-gray-500">
                              {(parameters[param.name] || '').length}/566 characters
                            </div>
                          </div>
                        ) : (
                          <PixelInput
                            label={`${param.label}${param.required ? ' *' : ''}`}
                            type={param.type === 'amount' || param.type === 'number' ? 'number' : 'text'}
                            value={parameters[param.name] || ''}
                            onChange={(e) => handleParameterChange(param.name, e.target.value)}
                            placeholder={param.placeholder}
                            step={param.type === 'amount' ? '0.001' : undefined}
                            min={param.type === 'amount' || param.type === 'number' ? '0' : undefined}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </PixelCard>

              {/* Advanced Configuration */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3 flex items-center justify-between">
                    <h3 className="font-pixel text-sm text-green-400">
                      🔧 SIMULATION CONFIG
                    </h3>
                    <button
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="text-gray-400 hover:text-green-400"
                    >
                      {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <PixelInput
                      label="COMPUTE UNITS"
                      type="number"
                      value={simulationConfig.computeUnits.toString()}
                      onChange={(e) => setSimulationConfig(prev => ({
                        ...prev,
                        computeUnits: parseInt(e.target.value) || 0
                      }))}
                      placeholder="200000"
                    />

                    <PixelInput
                      label="PRIORITY FEE (µLAMPORTS)"
                      type="number"
                      value={simulationConfig.priorityFee.toString()}
                      onChange={(e) => setSimulationConfig(prev => ({
                        ...prev,
                        priorityFee: parseInt(e.target.value) || 0
                      }))}
                      placeholder="1000"
                    />

                    {showAdvanced && (
                      <div className="space-y-3 pt-3 border-t-2 border-gray-700">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={simulationConfig.skipPreflight}
                            onChange={(e) => setSimulationConfig(prev => ({
                              ...prev,
                              skipPreflight: e.target.checked
                            }))}
                            className="w-4 h-4"
                          />
                          <span className="font-mono text-xs text-gray-400">Skip preflight checks</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </PixelCard>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3">
                <PixelButton
                  onClick={validateAndSimulate}
                  disabled={!publicKey || isSimulating}
                  className="w-full"
                >
                  {isSimulating ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      [SIMULATING...]
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      [SIMULATE]
                    </>
                  )}
                </PixelButton>
                <PixelButton
                  variant="secondary"
                  onClick={reset}
                  disabled={isSimulating}
                  className="w-full"
                >
                  <RotateCcw className="h-4 w-4" />
                  [RESET]
                </PixelButton>
              </div>

              {/* Errors */}
              {errors.length > 0 && (
                <PixelCard>
                  <div className="p-4 bg-red-900/20 border-2 border-red-600/30">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-pixel text-xs text-red-400 mb-2">VALIDATION ERRORS:</div>
                        <ul className="font-mono text-xs text-red-300 space-y-1">
                          {errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}
            </>
          ) : (
            <PixelCard>
              <div className="text-center py-12">
                <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  SELECT A TEMPLATE
                </h3>
                <p className="font-mono text-sm text-gray-500">
                  Choose a transaction type from the left to configure parameters
                </p>
              </div>
            </PixelCard>
          )}
        </div>

        {/* Right Column: Results */}
        <div className="xl:col-span-1 space-y-6">
          {result ? (
            <>
              {/* Simulation Status */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📊 SIMULATION RESULT
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {result.success ? (
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    )}
                    <div>
                      <div className={`font-pixel text-sm ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? 'SIMULATION SUCCESS' : 'SIMULATION FAILED'}
                      </div>
                      <div className="font-mono text-xs text-gray-400">
                        {result.success ? 'Transaction will likely succeed' : 'Transaction will fail'}
                      </div>
                    </div>
                  </div>

                  {result.error && (
                    <div className="p-3 bg-red-900/20 border-2 border-red-600/30">
                      <div className="font-mono text-xs text-red-300">
                        Error: {result.error}
                      </div>
                    </div>
                  )}
                </div>
              </PixelCard>

              {/* Metrics */}
              <PixelCard>
                <div className="space-y-4">
                  <div className="border-b-4 border-green-400/20 pb-3">
                    <h3 className="font-pixel text-sm text-green-400">
                      📈 PERFORMANCE METRICS
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-blue-400">
                        {formatComputeUnits(result.computeUnitsConsumed)}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Compute Units Used</div>
                    </div>
                    <div className="text-center p-3 bg-gray-800 border-2 border-gray-700">
                      <div className="font-mono text-lg text-green-400">
                        {(result.fee / 1000000000).toFixed(6)}
                      </div>
                      <div className="font-mono text-xs text-gray-400">Fee (SOL)</div>
                    </div>
                  </div>

                  {result.gasOptimization && (
                    <div className="p-3 bg-blue-900/20 border-2 border-blue-600/30">
                      <div className="flex items-start gap-2">
                        <Zap className="h-4 w-4 text-blue-400 mt-0.5" />
                        <div className="font-mono text-xs text-blue-400">
                          <div className="mb-1">Gas Optimization:</div>
                          <div>Recommended: {formatComputeUnits(result.gasOptimization.recommendedComputeUnits)} CU</div>
                          {result.gasOptimization.potentialSavings > 0 && (
                            <div>Potential savings: {formatComputeUnits(result.gasOptimization.potentialSavings)} CU</div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {result.warnings && result.warnings.length > 0 && (
                    <div className="p-3 bg-yellow-900/20 border-2 border-yellow-600/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
                        <div>
                          <div className="font-pixel text-xs text-yellow-400 mb-1">WARNINGS:</div>
                          <ul className="font-mono text-xs text-yellow-300 space-y-1">
                            {result.warnings.map((warning, idx) => (
                              <li key={idx}>• {warning}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </PixelCard>

              {/* Transaction Logs */}
              {result.logs && result.logs.length > 0 && (
                <PixelCard>
                  <div className="space-y-4">
                    <div className="border-b-4 border-green-400/20 pb-3">
                      <h3 className="font-pixel text-sm text-green-400">
                        📜 EXECUTION LOGS
                      </h3>
                    </div>

                    <div className="bg-gray-900 border-2 border-gray-700 p-3 max-h-48 overflow-y-auto">
                      <div className="font-mono text-xs text-gray-300 space-y-1">
                        {result.logs.slice(0, 10).map((log, idx) => (
                          <div key={idx} className="break-all">
                            <span className="text-gray-500">[{idx}]</span> {log}
                          </div>
                        ))}
                        {result.logs.length > 10 && (
                          <div className="text-gray-500 italic">
                            ... and {result.logs.length - 10} more logs
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </PixelCard>
              )}
            </>
          ) : (
            <PixelCard>
              <div className="text-center py-12">
                <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="font-pixel text-lg text-gray-400 mb-2">
                  AWAITING SIMULATION
                </h3>
                <p className="font-mono text-sm text-gray-500 mb-4">
                  Configure your transaction and click simulate
                </p>
                <div className="p-4 bg-blue-900/20 border-2 border-blue-600/30 max-w-sm mx-auto">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-400 mt-0.5" />
                    <div className="font-mono text-xs text-blue-400">
                      Enhanced simulation provides:
                      <br/>• Gas optimization tips
                      <br/>• Error prediction
                      <br/>• Performance analysis
                      <br/>• Risk assessment
                    </div>
                  </div>
                </div>
              </div>
            </PixelCard>
          )}
        </div>
      </div>
    </div>
  )
}