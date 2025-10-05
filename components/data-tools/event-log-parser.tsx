'use client'

import { useState, useCallback } from 'react'
import { useConnection } from '@solana/wallet-adapter-react'
import { EventLogParser, ParsedEventLog, SolanaEvent, EventParseOptions } from '@/lib/solana/data-tools/event-log-parser'
import { PixelCard } from '@/components/ui/pixel-card'
import { PixelButton } from '@/components/ui/pixel-button'
import { PixelInput } from '@/components/ui/pixel-input'
import { PixelToast } from '@/components/ui/pixel-toast'
import { PixelLoading } from '@/components/ui/pixel-loading'

interface EventLogParserProps {
  onEventsParsed?: (logs: ParsedEventLog[]) => void
}

export function EventLogParserComponent({ onEventsParsed }: EventLogParserProps) {
  const { connection } = useConnection()
  const [mode, setMode] = useState<'signature' | 'multiple' | 'logs'>('signature')
  const [signature, setSignature] = useState('')
  const [signatures, setSignatures] = useState('')
  const [rawLogs, setRawLogs] = useState('')
  const [options, setOptions] = useState<EventParseOptions>({
    includeSystemProgram: true,
    includeTokenProgram: true,
    includeUnknownPrograms: true,
    parseCustomEvents: true,
    filterByProgram: []
  })
  const [filterPrograms, setFilterPrograms] = useState('')
  const [results, setResults] = useState<ParsedEventLog[]>([])
  const [selectedEvent, setSelectedEvent] = useState<SolanaEvent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const parser = new EventLogParser(connection)

  const handleParseTransaction = async () => {
    if (!signature.trim()) {
      showToast('Please enter a transaction signature', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const parseOptions = {
        ...options,
        filterByProgram: filterPrograms.trim() 
          ? filterPrograms.split(',').map(p => p.trim()).filter(Boolean)
          : []
      }

      const result = await parser.parseTransactionEvents(signature.trim(), parseOptions)
      setResults([result])
      onEventsParsed?.([result])

      if (result.isSuccess) {
        showToast(`Parsed ${result.totalEvents} events successfully`, 'success')
      } else {
        showToast(`Failed to parse transaction: ${result.error}`, 'error')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParseMultiple = async () => {
    const sigs = signatures.split('\n').map(s => s.trim()).filter(Boolean)
    
    if (sigs.length === 0) {
      showToast('Please enter transaction signatures', 'error')
      return
    }

    if (sigs.length > 50) {
      showToast('Maximum 50 transactions at once', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const parseOptions = {
        ...options,
        filterByProgram: filterPrograms.trim() 
          ? filterPrograms.split(',').map(p => p.trim()).filter(Boolean)
          : []
      }

      const results = await parser.parseMultipleTransactions(sigs, parseOptions)
      setResults(results)
      onEventsParsed?.(results)

      const successful = results.filter(r => r.isSuccess).length
      const total = results.length
      showToast(`Parsed ${successful}/${total} transactions successfully`, 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleParseLogs = async () => {
    if (!rawLogs.trim()) {
      showToast('Please enter raw logs', 'error')
      return
    }

    setIsProcessing(true)
    try {
      const logs = rawLogs.split('\n').filter(line => line.trim())
      const result = parser.parseLogsOnly(logs)
      setResults([result])
      onEventsParsed?.([result])

      showToast(`Parsed ${result.totalEvents} events from logs`, 'success')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      showToast(errorMessage, 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    showToast(`${label} copied to clipboard`, 'success')
  }

  const downloadResults = () => {
    const data = JSON.stringify(results, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `event-logs-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getEventTypeColor = (eventType: string): string => {
    const colors: { [key: string]: string } = {
      'invoke': 'text-blue-400',
      'program_log': 'text-green-400',
      'program_data': 'text-purple-400',
      'compute_budget': 'text-yellow-400',
      'success': 'text-green-500',
      'error': 'text-red-500',
      'instruction': 'text-cyan-400',
      'raw_instruction': 'text-gray-400',
      'inner_instruction': 'text-orange-400',
      'jupiter_swap': 'text-blue-500',
      'orca_whirlpool': 'text-teal-400',
      'raydium_amm': 'text-indigo-400',
      'token_transfer': 'text-green-600'
    }
    return colors[eventType] || 'text-gray-300'
  }

  const formatEventData = (event: SolanaEvent): string => {
    if (typeof event.data === 'object') {
      return JSON.stringify(event.data, null, 2)
    }
    return String(event.data)
  }

  const statistics = results.length > 0 ? parser.getEventStatistics(results) : null

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Parser Mode</h3>
          <div className="flex gap-4 flex-wrap">
            <PixelButton
              onClick={() => setMode('signature')}
              variant={mode === 'signature' ? 'primary' : 'secondary'}
            >
              Single Transaction
            </PixelButton>
            <PixelButton
              onClick={() => setMode('multiple')}
              variant={mode === 'multiple' ? 'primary' : 'secondary'}
            >
              Multiple Transactions
            </PixelButton>
            <PixelButton
              onClick={() => setMode('logs')}
              variant={mode === 'logs' ? 'primary' : 'secondary'}
            >
              Raw Logs Only
            </PixelButton>
          </div>
        </div>
      </PixelCard>

      {/* Parse Options */}
      <PixelCard>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4">Parse Options</h3>
          
          <div className="space-y-4">
            {/* Filter Checkboxes */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeSystemProgram}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeSystemProgram: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm text-gray-300">System Program</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeTokenProgram}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeTokenProgram: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm text-gray-300">Token Programs</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.includeUnknownPrograms}
                  onChange={(e) => setOptions(prev => ({ ...prev, includeUnknownPrograms: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm text-gray-300">Unknown Programs</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={options.parseCustomEvents}
                  onChange={(e) => setOptions(prev => ({ ...prev, parseCustomEvents: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                />
                <span className="text-sm text-gray-300">Custom Events</span>
              </label>
            </div>

            {/* Program Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Filter by Programs (comma-separated program IDs)
              </label>
              <PixelInput
                value={filterPrograms}
                onChange={(e) => setFilterPrograms(e.target.value)}
                placeholder="Enter program IDs to filter, leave empty for all..."
              />
            </div>
          </div>
        </div>
      </PixelCard>

      {/* Input Section */}
      {mode === 'signature' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Transaction Signature</h3>
            <div className="space-y-4">
              <PixelInput
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                placeholder="Enter transaction signature..."
              />
              <PixelButton
                onClick={handleParseTransaction}
                disabled={!signature.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? <PixelLoading size="sm" /> : 'Parse Transaction'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {mode === 'multiple' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Multiple Transaction Signatures</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Transaction Signatures (one per line, max 50)
                </label>
                <textarea
                  value={signatures}
                  onChange={(e) => setSignatures(e.target.value)}
                  placeholder="Enter transaction signatures, one per line..."
                  rows={6}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <PixelButton
                onClick={handleParseMultiple}
                disabled={!signatures.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? <PixelLoading size="sm" /> : 'Parse Transactions'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {mode === 'logs' && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Raw Transaction Logs</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Raw Logs (one log per line)
                </label>
                <textarea
                  value={rawLogs}
                  onChange={(e) => setRawLogs(e.target.value)}
                  placeholder="Enter raw transaction logs, one per line..."
                  rows={8}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded font-mono text-sm text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <PixelButton
                onClick={handleParseLogs}
                disabled={!rawLogs.trim() || isProcessing}
                className="w-full"
              >
                {isProcessing ? <PixelLoading size="sm" /> : 'Parse Logs'}
              </PixelButton>
            </div>
          </div>
        </PixelCard>
      )}

      {/* Statistics */}
      {statistics && (
        <PixelCard>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Statistics</h3>
              <PixelButton
                onClick={downloadResults}
                variant="secondary"
                size="sm"
              >
                Download Results
              </PixelButton>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded border">
                <div className="text-2xl font-bold text-white">{statistics.totalTransactions}</div>
                <div className="text-sm text-gray-400">Total Transactions</div>
              </div>
              <div className="bg-gray-800 p-4 rounded border">
                <div className="text-2xl font-bold text-green-400">{statistics.totalEvents}</div>
                <div className="text-sm text-gray-400">Total Events</div>
              </div>
              <div className="bg-gray-800 p-4 rounded border">
                <div className="text-2xl font-bold text-green-500">{statistics.successfulTransactions}</div>
                <div className="text-sm text-gray-400">Successful</div>
              </div>
              <div className="bg-gray-800 p-4 rounded border">
                <div className="text-2xl font-bold text-red-500">{statistics.failedTransactions}</div>
                <div className="text-sm text-gray-400">Failed</div>
              </div>
            </div>

            {/* Top Programs */}
            {statistics.topPrograms.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-semibold text-white mb-3">Top Programs</h4>
                <div className="space-y-2">
                  {statistics.topPrograms.slice(0, 5).map((program, index) => (
                    <div key={program.programId} className="flex items-center justify-between bg-gray-800 p-3 rounded">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {program.programName || 'Unknown Program'}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {program.programId}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-blue-400">
                        {program.count}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Event Types */}
            {statistics.eventTypes.length > 0 && (
              <div>
                <h4 className="text-md font-semibold text-white mb-3">Event Types</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {statistics.eventTypes.slice(0, 9).map((eventType) => (
                    <div key={eventType.type} className="flex items-center justify-between bg-gray-800 p-2 rounded text-sm">
                      <span className={getEventTypeColor(eventType.type)}>
                        {eventType.type}
                      </span>
                      <span className="text-white font-medium">
                        {eventType.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </PixelCard>
      )}

      {/* Results */}
      {results.length > 0 && (
        <PixelCard>
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">Parsed Events</h3>
            
            <div className="space-y-4">
              {results.map((result, resultIndex) => (
                <div key={result.signature} className="border border-gray-700 rounded">
                  {/* Transaction Header */}
                  <div className="p-4 bg-gray-800 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">
                          Transaction {resultIndex + 1}
                        </div>
                        <div className="text-xs text-gray-400 font-mono">
                          {result.signature}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-gray-300">
                          {result.totalEvents} events
                        </div>
                        <div className={`text-sm font-medium ${result.isSuccess ? 'text-green-400' : 'text-red-400'}`}>
                          {result.isSuccess ? 'Success' : 'Failed'}
                        </div>
                        <PixelButton
                          onClick={() => copyToClipboard(JSON.stringify(result, null, 2), 'Transaction data')}
                          variant="secondary"
                          size="sm"
                        >
                          Copy
                        </PixelButton>
                      </div>
                    </div>
                  </div>

                  {/* Events List */}
                  <div className="max-h-96 overflow-y-auto">
                    {result.events.map((event, eventIndex) => (
                      <div 
                        key={eventIndex}
                        className="p-3 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 cursor-pointer"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`text-sm font-medium ${getEventTypeColor(event.eventType)}`}>
                              {event.eventType}
                            </div>
                            <div className="text-sm text-gray-300">
                              {event.programName || 'Unknown Program'}
                            </div>
                            <div className="text-xs text-gray-500">
                              Inst #{event.instructionIndex}
                              {event.innerInstructionIndex !== undefined && ` / Inner #${event.innerInstructionIndex}`}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 font-mono">
                            {event.programId.slice(0, 8)}...
                          </div>
                        </div>
                        
                        {/* Preview data */}
                        <div className="mt-2 text-xs text-gray-500 truncate">
                          {typeof event.data === 'object' 
                            ? JSON.stringify(event.data).slice(0, 100) + '...'
                            : String(event.data).slice(0, 100) + '...'
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PixelCard>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-lg max-w-4xl max-h-[80vh] w-full overflow-hidden">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Event Details</h3>
                <PixelButton
                  onClick={() => setSelectedEvent(null)}
                  variant="secondary"
                  size="sm"
                >
                  Close
                </PixelButton>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Event Type</label>
                    <div className={`text-lg font-medium ${getEventTypeColor(selectedEvent.eventType)}`}>
                      {selectedEvent.eventType}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Program</label>
                    <div className="text-sm text-white">
                      {selectedEvent.programName || 'Unknown Program'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">
                      {selectedEvent.programId}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Event Data</label>
                  <div className="relative">
                    <pre className="bg-gray-800 p-4 rounded border overflow-auto max-h-64 text-sm text-green-400">
                      {formatEventData(selectedEvent)}
                    </pre>
                    <PixelButton
                      onClick={() => copyToClipboard(formatEventData(selectedEvent), 'Event data')}
                      variant="secondary"
                      size="sm"
                      className="absolute top-2 right-2"
                    >
                      Copy
                    </PixelButton>
                  </div>
                </div>

                {selectedEvent.logs.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Raw Logs</label>
                    <div className="bg-gray-800 p-4 rounded border">
                      {selectedEvent.logs.map((log, index) => (
                        <div key={index} className="text-sm text-gray-300 font-mono break-all">
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <PixelToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}