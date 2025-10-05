'use client'

import { useState, useEffect, useMemo } from 'react'
import { BarChart, LineChart, PieChart, TrendingUp, Download, Filter, Calendar, RefreshCw, Search } from 'lucide-react'

interface MetricData {
  label: string
  value: number
  change: number
  trend: 'up' | 'down' | 'stable'
}

interface ChartData {
  timestamp: string
  transactions: number
  programs: number
  volume: number
  fees: number
}

interface ProgramData {
  programId: string
  name: string
  invocations: number
  successRate: number
  avgComputeUnits: number
  totalFees: number
}

interface AnalyticsFilter {
  timeRange: string
  programFilter: string
  dataType: string
  sortBy: string
}

const timeRanges = [
  { value: '1h', label: 'Last Hour' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '90d', label: 'Last 90 Days' },
]

const dataTypes = [
  { value: 'all', label: 'All Data' },
  { value: 'transactions', label: 'Transactions' },
  { value: 'programs', label: 'Programs' },
  { value: 'tokens', label: 'Tokens' },
  { value: 'defi', label: 'DeFi' },
  { value: 'nft', label: 'NFTs' },
]

// Mock data generators
const generateMockMetrics = (): MetricData[] => [
  {
    label: 'Total Transactions',
    value: 1250000,
    change: 12.5,
    trend: 'up'
  },
  {
    label: 'Active Programs',
    value: 3420,
    change: -2.1,
    trend: 'down'
  },
  {
    label: 'Total Volume (SOL)',
    value: 850000,
    change: 8.7,
    trend: 'up'
  },
  {
    label: 'Average TPS',
    value: 2847,
    change: 0.2,
    trend: 'stable'
  }
]

const generateMockChartData = (timeRange: string): ChartData[] => {
  const now = new Date()
  const data: ChartData[] = []
  let points = 24
  let interval = 60 * 60 * 1000 // 1 hour

  switch (timeRange) {
    case '1h':
      points = 12
      interval = 5 * 60 * 1000 // 5 minutes
      break
    case '24h':
      points = 24
      interval = 60 * 60 * 1000 // 1 hour
      break
    case '7d':
      points = 7
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case '30d':
      points = 30
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
    case '90d':
      points = 90
      interval = 24 * 60 * 60 * 1000 // 1 day
      break
  }

  for (let i = points - 1; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * interval)
    data.push({
      timestamp: timestamp.toISOString(),
      transactions: Math.floor(Math.random() * 50000) + 10000,
      programs: Math.floor(Math.random() * 200) + 50,
      volume: Math.floor(Math.random() * 100000) + 20000,
      fees: Math.floor(Math.random() * 1000) + 200
    })
  }

  return data
}

const generateMockProgramData = (): ProgramData[] => [
  {
    programId: '11111111111111111111111111111112',
    name: 'System Program',
    invocations: 450000,
    successRate: 99.8,
    avgComputeUnits: 150,
    totalFees: 125000
  },
  {
    programId: 'TokenkegQfeZyiNwAJbNbGKPFXkQd6ov',
    name: 'Token Program',
    invocations: 320000,
    successRate: 99.2,
    avgComputeUnits: 850,
    totalFees: 89000
  },
  {
    programId: 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25',
    name: 'Associated Token Program',
    invocations: 180000,
    successRate: 98.9,
    avgComputeUnits: 1200,
    totalFees: 67000
  },
  {
    programId: 'SwaPpA9LAaLfeLi3a68M4DjnLqgtticK',
    name: 'Serum DEX',
    invocations: 95000,
    successRate: 97.5,
    avgComputeUnits: 2500,
    totalFees: 45000
  },
  {
    programId: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    name: 'Jupiter',
    invocations: 78000,
    successRate: 96.8,
    avgComputeUnits: 3200,
    totalFees: 38000
  }
]

export default function DataAnalyticsDashboard() {
  const [filter, setFilter] = useState<AnalyticsFilter>({
    timeRange: '24h',
    programFilter: '',
    dataType: 'all',
    sortBy: 'invocations'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<string>('transactions')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

  const metrics = useMemo(() => generateMockMetrics(), [])
  const chartData = useMemo(() => generateMockChartData(filter.timeRange), [filter.timeRange])
  const programData = useMemo(() => {
    let data = generateMockProgramData()
    
    if (filter.programFilter) {
      data = data.filter(program => 
        program.name.toLowerCase().includes(filter.programFilter.toLowerCase()) ||
        program.programId.includes(filter.programFilter)
      )
    }
    
    // Sort data
    data.sort((a, b) => {
      switch (filter.sortBy) {
        case 'invocations':
          return b.invocations - a.invocations
        case 'successRate':
          return b.successRate - a.successRate
        case 'fees':
          return b.totalFees - a.totalFees
        default:
          return b.invocations - a.invocations
      }
    })
    
    return data
  }, [filter.programFilter, filter.sortBy])

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }

  const exportData = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      chartData,
      programData,
      filter
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `solana_analytics_${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
  }

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp)
    if (filter.timeRange === '1h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else if (filter.timeRange === '24h') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const renderChart = () => {
    const maxValue = Math.max(...chartData.map(d => d[selectedMetric as keyof ChartData] as number))
    
    return (
      <div className="h-64 flex items-end space-x-2 p-4">
        {chartData.map((data, index) => {
          const value = data[selectedMetric as keyof ChartData] as number
          const height = (value / maxValue) * 100
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center group">
              <div 
                className={`w-full transition-all duration-300 group-hover:opacity-80 ${
                  chartType === 'line' 
                    ? 'bg-blue-500 rounded-t' 
                    : 'bg-gradient-to-t from-blue-600 to-blue-400 rounded'
                }`}
                style={{ height: `${height}%`, minHeight: '2px' }}
                title={`${formatNumber(value)} at ${formatDate(data.timestamp)}`}
              />
              <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                {formatDate(data.timestamp)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Controls */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={filter.timeRange}
              onChange={(e) => setFilter(prev => ({ ...prev, timeRange: e.target.value }))}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {timeRanges.map(range => (
                <option key={range.value} value={range.value}>{range.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter.dataType}
              onChange={(e) => setFilter(prev => ({ ...prev, dataType: e.target.value }))}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {dataTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={filter.programFilter}
              onChange={(e) => setFilter(prev => ({ ...prev, programFilter: e.target.value }))}
              placeholder="Filter programs..."
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm w-40"
            />
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded text-sm transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportData}
            className="flex items-center space-x-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-400">{metric.label}</h3>
              <div className={`flex items-center space-x-1 text-sm ${
                metric.trend === 'up' ? 'text-green-400' :
                metric.trend === 'down' ? 'text-red-400' : 'text-gray-400'
              }`}>
                <TrendingUp className={`w-3 h-3 transform ${
                  metric.trend === 'down' ? 'rotate-180' : 
                  metric.trend === 'stable' ? 'rotate-90' : ''
                }`} />
                <span>{Math.abs(metric.change)}%</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {formatNumber(metric.value)}
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Data Trends</h3>
          <div className="flex items-center space-x-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value="transactions">Transactions</option>
              <option value="programs">Programs</option>
              <option value="volume">Volume</option>
              <option value="fees">Fees</option>
            </select>
            <div className="flex space-x-1">
              <button
                onClick={() => setChartType('line')}
                className={`p-2 rounded ${chartType === 'line' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <LineChart className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded ${chartType === 'bar' ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <BarChart className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900 rounded border border-gray-600">
          {renderChart()}
        </div>
      </div>

      {/* Program Analytics */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Program Analytics</h3>
          <select
            value={filter.sortBy}
            onChange={(e) => setFilter(prev => ({ ...prev, sortBy: e.target.value }))}
            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
          >
            <option value="invocations">Sort by Invocations</option>
            <option value="successRate">Sort by Success Rate</option>
            <option value="fees">Sort by Total Fees</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Program</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Invocations</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Success Rate</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg CU</th>
                <th className="text-right py-3 px-4 text-gray-400 font-medium">Total Fees</th>
              </tr>
            </thead>
            <tbody>
              {programData.map((program, index) => (
                <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                  <td className="py-3 px-4">
                    <div>
                      <div className="text-white font-medium">{program.name}</div>
                      <div className="text-gray-400 text-xs font-mono">
                        {program.programId.slice(0, 8)}...{program.programId.slice(-8)}
                      </div>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 text-white font-mono">
                    {formatNumber(program.invocations)}
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className={`font-mono ${
                      program.successRate >= 99 ? 'text-green-400' :
                      program.successRate >= 95 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {program.successRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="text-right py-3 px-4 text-white font-mono">
                    {formatNumber(program.avgComputeUnits)}
                  </td>
                  <td className="text-right py-3 px-4 text-white font-mono">
                    {formatNumber(program.totalFees)} SOL
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-6">Summary Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-blue-400 mb-4">Transaction Overview</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Volume:</span>
                <span className="text-white font-mono">{formatNumber(850000)} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Average TPS:</span>
                <span className="text-white font-mono">2,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peak TPS:</span>
                <span className="text-white font-mono">4,200</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-green-400 font-mono">98.7%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-green-400 mb-4">Program Distribution</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Active Programs:</span>
                <span className="text-white font-mono">3,420</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Top 10 Usage:</span>
                <span className="text-white font-mono">67.3%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">New Programs:</span>
                <span className="text-white font-mono">142</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg CU/Instruction:</span>
                <span className="text-white font-mono">1,850</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-4">Network Health</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Block Time:</span>
                <span className="text-white font-mono">0.4s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Skip Rate:</span>
                <span className="text-white font-mono">2.1%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Validator Count:</span>
                <span className="text-white font-mono">1,847</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stake Concentration:</span>
                <span className="text-white font-mono">31.2%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}