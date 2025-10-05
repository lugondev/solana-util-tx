'use client'

import { useState, useCallback, useMemo } from 'react'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelLoading } from '@/components/ui/pixel-loading'
import { Connection } from '@solana/web3.js'
import { 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  Play,
  Pause
} from 'lucide-react'

interface TestResult {
  endpoint: string
  method: string
  latency: number
  success: boolean
  error?: string
  timestamp: number
}

interface BenchmarkStats {
  endpoint: string
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageLatency: number
  minLatency: number
  maxLatency: number
  successRate: number
  requestsPerSecond: number
  errors: string[]
}

interface EndpointConfig {
  name: string
  url: string
  enabled: boolean
}

const DEFAULT_ENDPOINTS: EndpointConfig[] = [
  { name: 'Solana Mainnet', url: 'https://api.mainnet-beta.solana.com', enabled: true },
  { name: 'Solana Devnet', url: 'https://api.devnet.solana.com', enabled: true },
  { name: 'Solana Testnet', url: 'https://api.testnet.solana.com', enabled: false },
]

const TEST_METHODS = [
  { name: 'getHealth', description: 'Health check' },
  { name: 'getSlot', description: 'Current slot' },
  { name: 'getBlockHeight', description: 'Block height' },
  { name: 'getVersion', description: 'RPC version' },
]

export function RPCBenchmarkerComponent() {
  const [endpoints, setEndpoints] = useState<EndpointConfig[]>(DEFAULT_ENDPOINTS)
  const [customEndpoint, setCustomEndpoint] = useState('')
  const [testType, setTestType] = useState<'quick' | 'load'>('quick')
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [currentTest, setCurrentTest] = useState<string>('')
  const [progress, setProgress] = useState(0)
  // Simple toast replacement with console
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${message}`)
    // TODO: Implement proper toast system
  }, [])

  // Test configuration
  const testConfig = useMemo(() => ({
    quick: { requests: 5, concurrent: 1, methods: ['getHealth', 'getSlot'] },
    load: { requests: 20, concurrent: 3, methods: TEST_METHODS.map(m => m.name) }
  }), [])

  const enabledEndpoints = endpoints.filter(ep => ep.enabled)

  const benchmarkStats = useMemo(() => {
    const stats: BenchmarkStats[] = []
    
    for (const endpoint of enabledEndpoints) {
      const endpointResults = results.filter(r => r.endpoint === endpoint.url)
      
      if (endpointResults.length === 0) continue

      const successful = endpointResults.filter(r => r.success)
      const failed = endpointResults.filter(r => !r.success)
      const latencies = successful.map(r => r.latency)
      
      stats.push({
        endpoint: endpoint.name,
        totalRequests: endpointResults.length,
        successfulRequests: successful.length,
        failedRequests: failed.length,
        averageLatency: latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0,
        minLatency: latencies.length > 0 ? Math.min(...latencies) : 0,
        maxLatency: latencies.length > 0 ? Math.max(...latencies) : 0,
        successRate: endpointResults.length > 0 ? (successful.length / endpointResults.length) * 100 : 0,
        requestsPerSecond: 0, // Will calculate based on time span
        errors: [...new Set(failed.map(r => r.error || 'Unknown error'))]
      })
    }
    
    return stats
  }, [results, enabledEndpoints])

  const addCustomEndpoint = useCallback(() => {
    if (!customEndpoint.trim()) {
      showToast('Please enter a valid RPC endpoint URL', 'error')
      return
    }

    try {
      new URL(customEndpoint)
    } catch {
      showToast('Please enter a valid URL', 'error')
      return
    }

    const newEndpoint: EndpointConfig = {
      name: `Custom (${new URL(customEndpoint).hostname})`,
      url: customEndpoint,
      enabled: true
    }

    setEndpoints(prev => [...prev, newEndpoint])
    setCustomEndpoint('')
    showToast('Custom endpoint added', 'success')
  }, [customEndpoint, showToast])

  const toggleEndpoint = useCallback((index: number) => {
    setEndpoints(prev => prev.map((ep, i) => 
      i === index ? { ...ep, enabled: !ep.enabled } : ep
    ))
  }, [])

  const removeEndpoint = useCallback((index: number) => {
    setEndpoints(prev => prev.filter((_, i) => i !== index))
  }, [])

  const performTest = useCallback(async (endpoint: string, method: string): Promise<TestResult> => {
    const startTime = Date.now()
    
    try {
      const connection = new Connection(endpoint, 'confirmed')
      
      let result: any
      switch (method) {
        case 'getHealth':
          // Custom health check since Connection doesn't have getHealth
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 1,
              method: 'getHealth'
            })
          })
          result = await response.json()
          break
        case 'getSlot':
          result = await connection.getSlot()
          break
        case 'getBlockHeight':
          result = await connection.getBlockHeight()
          break
        case 'getVersion':
          result = await connection.getVersion()
          break
        default:
          throw new Error(`Unknown method: ${method}`)
      }

      const latency = Date.now() - startTime
      
      return {
        endpoint,
        method,
        latency,
        success: true,
        timestamp: Date.now()
      }
    } catch (error) {
      const latency = Date.now() - startTime
      
      return {
        endpoint,
        method,
        latency,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now()
      }
    }
  }, [])

  const runBenchmark = useCallback(async () => {
    if (enabledEndpoints.length === 0) {
      showToast('Please enable at least one endpoint', 'error')
      return
    }

    setIsRunning(true)
    setResults([])
    setProgress(0)

    const config = testConfig[testType]
    const totalTests = enabledEndpoints.length * config.requests * config.methods.length
    let completedTests = 0

    try {
      const newResults: TestResult[] = []

      for (const endpoint of enabledEndpoints) {
        setCurrentTest(`Testing ${endpoint.name}...`)

        for (const method of config.methods) {
          const promises: Promise<TestResult>[] = []

          for (let i = 0; i < config.requests; i++) {
            promises.push(performTest(endpoint.url, method))
            
            // Batch concurrent requests
            if (promises.length >= config.concurrent || i === config.requests - 1) {
              const batchResults = await Promise.all(promises)
              newResults.push(...batchResults)
              setResults(prev => [...prev, ...batchResults])
              
              completedTests += promises.length
              setProgress((completedTests / totalTests) * 100)
              
              promises.length = 0
              
              // Small delay between batches
              if (i < config.requests - 1) {
                await new Promise(resolve => setTimeout(resolve, 100))
              }
            }
          }
        }
      }

      showToast('Benchmark completed successfully', 'success')
    } catch (error) {
      showToast('Benchmark failed: ' + (error instanceof Error ? error.message : 'Unknown error'), 'error')
    } finally {
      setIsRunning(false)
      setCurrentTest('')
      setProgress(0)
    }
  }, [enabledEndpoints, testType, testConfig, performTest, showToast])

  const exportResults = useCallback(() => {
    const data = {
      timestamp: new Date().toISOString(),
      testType,
      endpoints: enabledEndpoints.map(ep => ({ name: ep.name, url: ep.url })),
      stats: benchmarkStats,
      rawResults: results
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rpc-benchmark-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    showToast('Results exported successfully', 'success')
  }, [testType, enabledEndpoints, benchmarkStats, results, showToast])

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <PixelCard>
        <h2 className="font-pixel text-xl text-green-400 mb-4">⚙️ Test Configuration</h2>
        
        {/* Test Type */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Test Type</label>
          <div className="flex gap-3">
            <PixelButton
              variant={testType === 'quick' ? 'primary' : 'secondary'}
              onClick={() => setTestType('quick')}
              className="flex-1"
            >
              <Zap className="w-4 h-4 mr-2" />
              Quick Test (5 requests)
            </PixelButton>
            <PixelButton
              variant={testType === 'load' ? 'primary' : 'secondary'}
              onClick={() => setTestType('load')}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Load Test (20 requests)
            </PixelButton>
          </div>
        </div>

        {/* Endpoints */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Endpoints</label>
          <div className="space-y-2 mb-4">
            {endpoints.map((endpoint, index) => (
              <div key={index} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded">
                <input
                  type="checkbox"
                  checked={endpoint.enabled}
                  onChange={() => toggleEndpoint(index)}
                  className="w-4 h-4 text-green-400 bg-gray-700 border-gray-600 rounded focus:ring-green-400"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-100">{endpoint.name}</div>
                  <div className="text-xs text-gray-400 font-mono">{endpoint.url}</div>
                </div>
                {index >= DEFAULT_ENDPOINTS.length && (
                  <PixelButton
                    variant="danger"
                    size="sm"
                    onClick={() => removeEndpoint(index)}
                  >
                    <XCircle className="w-4 h-4" />
                  </PixelButton>
                )}
              </div>
            ))}
          </div>

          {/* Add Custom Endpoint */}
          <div className="flex gap-2">
            <PixelInput
              value={customEndpoint}
              onChange={(e) => setCustomEndpoint(e.target.value)}
              placeholder="https://your-custom-rpc.com"
              className="flex-1"
            />
            <PixelButton onClick={addCustomEndpoint}>
              Add
            </PixelButton>
          </div>
        </div>

        {/* Run Test */}
        <div className="flex gap-3">
          <PixelButton
            onClick={runBenchmark}
            disabled={isRunning || enabledEndpoints.length === 0}
            className="flex-1"
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Benchmark
              </>
            )}
          </PixelButton>
          
          {results.length > 0 && (
            <PixelButton
              onClick={exportResults}
              variant="secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </PixelButton>
          )}
        </div>

        {/* Progress */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>{currentTest}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </PixelCard>

      {/* Results */}
      {benchmarkStats.length > 0 && (
        <PixelCard>
          <h2 className="font-pixel text-xl text-green-400 mb-4">📊 Benchmark Results</h2>
          
          <div className="space-y-4">
            {benchmarkStats.map((stat, index) => (
              <div key={index} className="p-4 bg-gray-800/50 rounded border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-medium text-gray-100">{stat.endpoint}</h3>
                  <div className="flex items-center gap-2">
                    {stat.successRate >= 95 ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : stat.successRate >= 80 ? (
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-mono text-gray-300">
                      {stat.successRate.toFixed(1)}% success
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Avg Latency</div>
                    <div className="text-green-400 font-mono">
                      {stat.averageLatency.toFixed(0)}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Min/Max</div>
                    <div className="text-blue-400 font-mono">
                      {stat.minLatency}ms / {stat.maxLatency}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Requests</div>
                    <div className="text-yellow-400 font-mono">
                      {stat.successfulRequests}/{stat.totalRequests}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 mb-1">Errors</div>
                    <div className="text-red-400 font-mono">
                      {stat.failedRequests}
                    </div>
                  </div>
                </div>

                {stat.errors.length > 0 && (
                  <div className="mt-3 p-2 bg-red-900/20 border border-red-500/30 rounded">
                    <div className="text-xs text-red-400 font-medium mb-1">Errors:</div>
                    <div className="text-xs text-red-300 space-y-1">
                      {stat.errors.map((error, i) => (
                        <div key={i} className="font-mono">{error}</div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </PixelCard>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="flex justify-center">
          <PixelLoading text="Running benchmark tests..." />
        </div>
      )}
    </div>
  )
}