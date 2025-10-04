'use client'

import React from 'react'
import { SimulationResult } from '@/lib/solana/transactions/types'
import { formatComputeUnits } from '@/lib/solana/transactions/simulation'
import { PixelCard } from './pixel-card'

interface SimulationResultDisplayProps {
  result: SimulationResult
  isLoading?: boolean
}

export function SimulationResultDisplay({
  result,
  isLoading = false,
}: SimulationResultDisplayProps) {
  if (isLoading) {
    return (
      <PixelCard>
        <div className="flex items-center justify-center py-8">
          <div className="font-pixel text-sm text-primary animate-pixel-blink">
            SIMULATING...
          </div>
        </div>
      </PixelCard>
    )
  }

  return (
    <PixelCard>
      <div className="space-y-4">
        {/* Header */}
        <div className="border-b-4 border-primary/20 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-pixel text-sm text-primary flex items-center gap-2">
              <span className="animate-pixel-blink">▸</span>
              SIMULATION RESULT
            </h3>
          </div>
          <div
            className={`
              px-3 py-1 border-4
              font-pixel text-xs
              ${
                result.success
                  ? 'border-green-500 bg-green-500/10 text-green-400'
                  : 'border-red-500 bg-red-500/10 text-red-400'
              }
            `}
          >
            {result.success ? '✓ SUCCESS' : '✗ FAILED'}
          </div>
        </div>

        {/* Success State */}
        {result.success && (
          <div className="space-y-3">
            {/* Compute Units */}
            {result.unitsConsumed && (
              <div className="p-3 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">
                  COMPUTE UNITS CONSUMED:
                </div>
                <div className="font-mono text-lg text-primary">
                  {formatComputeUnits(result.unitsConsumed)}
                </div>
                <div className="font-mono text-xs text-gray-500 mt-1">
                  Recommended limit: {formatComputeUnits(Math.ceil(result.unitsConsumed * 1.2))}
                </div>
              </div>
            )}

            {/* Return Data */}
            {result.returnData && (
              <div className="p-3 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-2">
                  RETURN DATA:
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-xs">
                    <span className="text-gray-500">Program ID:</span>
                    <span className="text-primary ml-2">{result.returnData.programId}</span>
                  </div>
                  <div className="font-mono text-xs break-all">
                    <span className="text-gray-500">Data:</span>
                    <span className="text-primary ml-2">{result.returnData.data[0]}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Logs */}
            {result.logs && result.logs.length > 0 && (
              <div className="p-3 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-2 flex items-center justify-between">
                  <span>LOGS ({result.logs.length}):</span>
                  <button
                    onClick={() => {
                      const logsText = result.logs?.join('\n') || ''
                      navigator.clipboard.writeText(logsText)
                    }}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    [COPY]
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {result.logs.map((log, index) => (
                    <div
                      key={index}
                      className="font-mono text-xs text-gray-500 hover:text-gray-400 transition-colors"
                    >
                      <span className="text-gray-600">{index + 1}.</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Success Message */}
            <div className="p-3 border-4 border-green-500/30 bg-green-500/5">
              <div className="flex items-start gap-2">
                <span className="text-green-400">✓</span>
                <div className="font-mono text-xs text-green-400">
                  Transaction simulation successful. Ready to send.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!result.success && (
          <div className="space-y-3">
            {/* Error Message */}
            <div className="p-3 border-4 border-red-500 bg-red-500/10">
              <div className="font-mono text-xs text-gray-400 mb-2">
                ERROR:
              </div>
              <div className="font-mono text-sm text-red-400 break-words">
                {result.error || 'Unknown error occurred'}
              </div>
            </div>

            {/* Error Logs */}
            {result.logs && result.logs.length > 0 && (
              <div className="p-3 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-2 flex items-center justify-between">
                  <span>ERROR LOGS ({result.logs.length}):</span>
                  <button
                    onClick={() => {
                      const logsText = result.logs?.join('\n') || ''
                      navigator.clipboard.writeText(logsText)
                    }}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    [COPY]
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                  {result.logs.map((log, index) => (
                    <div
                      key={index}
                      className="font-mono text-xs text-red-400/80"
                    >
                      <span className="text-gray-600">{index + 1}.</span> {log}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Message */}
            <div className="p-3 border-4 border-yellow-500/30 bg-yellow-500/5">
              <div className="flex items-start gap-2">
                <span className="text-yellow-400">⚠</span>
                <div className="font-mono text-xs text-yellow-400">
                  Transaction will fail if sent. Please fix the errors above.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00ff41;
          border: 2px solid #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #00cc33;
        }
      `}</style>
    </PixelCard>
  )
}
