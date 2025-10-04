'use client'

import React from 'react'
import { TransactionStatus, TransactionUpdate } from '@/lib/solana/transactions/types'
import { PixelCard } from './pixel-card'
import { PixelLoading } from './pixel-loading'

interface TransactionStatusTrackerProps {
  update: TransactionUpdate
  showDetails?: boolean
}

export function TransactionStatusTracker({
  update,
  showDetails = true,
}: TransactionStatusTrackerProps) {
  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
      case TransactionStatus.FINALIZED:
        return 'green'
      case TransactionStatus.FAILED:
      case TransactionStatus.EXPIRED:
        return 'red'
      case TransactionStatus.SENDING:
      case TransactionStatus.CONFIRMING:
      case TransactionStatus.RETRYING:
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.CONFIRMED:
      case TransactionStatus.FINALIZED:
        return '✓'
      case TransactionStatus.FAILED:
      case TransactionStatus.EXPIRED:
        return '✗'
      case TransactionStatus.SENDING:
      case TransactionStatus.CONFIRMING:
      case TransactionStatus.RETRYING:
        return '◉'
      default:
        return '○'
    }
  }

  const isProcessing = [
    TransactionStatus.SENDING,
    TransactionStatus.CONFIRMING,
    TransactionStatus.RETRYING,
  ].includes(update.status)

  const color = getStatusColor(update.status)
  const icon = getStatusIcon(update.status)

  return (
    <PixelCard>
      <div className="space-y-4">
        {/* Status Header */}
        <div className="flex items-center gap-3">
          <div
            className={`
              w-12 h-12 border-4 
              flex items-center justify-center
              font-pixel text-xl
              ${color === 'green' && 'border-green-500 bg-green-500/10 text-green-400'}
              ${color === 'red' && 'border-red-500 bg-red-500/10 text-red-400'}
              ${color === 'yellow' && 'border-yellow-500 bg-yellow-500/10 text-yellow-400'}
              ${color === 'gray' && 'border-gray-500 bg-gray-500/10 text-gray-400'}
              ${isProcessing && 'animate-pulse'}
            `}
          >
            {icon}
          </div>
          <div className="flex-1">
            <div
              className={`
                font-pixel text-sm uppercase
                ${color === 'green' && 'text-green-400'}
                ${color === 'red' && 'text-red-400'}
                ${color === 'yellow' && 'text-yellow-400'}
                ${color === 'gray' && 'text-gray-400'}
              `}
            >
              {update.status.replace('_', ' ')}
            </div>
            <div className="font-mono text-xs text-gray-500 mt-1">
              {update.message}
            </div>
          </div>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="py-2">
            <PixelLoading size="sm" />
          </div>
        )}

        {/* Details */}
        {showDetails && (
          <div className="space-y-2">
            {/* Signature */}
            {update.signature && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-1">
                  SIGNATURE:
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs text-primary break-all">
                    {update.signature}
                  </code>
                  <button
                    onClick={() => navigator.clipboard.writeText(update.signature || '')}
                    className="px-2 py-1 border-4 border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary text-xs transition-colors"
                    title="Copy signature"
                  >
                    📋
                  </button>
                  <a
                    href={`https://solscan.io/tx/${update.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 border-4 border-primary/50 bg-primary/5 hover:bg-primary/10 text-primary text-xs transition-colors"
                    title="View on Solscan"
                  >
                    🔗
                  </a>
                </div>
              </div>
            )}

            {/* Attempt */}
            {update.attempt !== undefined && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400">
                  ATTEMPT:{' '}
                  <span className="text-primary">{update.attempt}</span>
                </div>
              </div>
            )}

            {/* Confirmations */}
            {update.confirmations !== undefined && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400">
                  CONFIRMATIONS:{' '}
                  <span className="text-primary">{update.confirmations}</span>
                </div>
                {/* Confirmation Progress Bar */}
                <div className="mt-2 h-2 bg-gray-800 border-2 border-gray-700">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.min((update.confirmations / 32) * 100, 100)}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Slot */}
            {update.slot && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400">
                  SLOT:{' '}
                  <span className="text-primary">{update.slot.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Block Time */}
            {update.blockTime && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400">
                  TIME:{' '}
                  <span className="text-primary">
                    {new Date(update.blockTime * 1000).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            {/* Error */}
            {update.error && (
              <div className="p-3 border-4 border-red-500 bg-red-500/10">
                <div className="font-mono text-xs text-gray-400 mb-1">
                  ERROR:
                </div>
                <div className="font-mono text-sm text-red-400 break-words">
                  {update.error}
                </div>
              </div>
            )}

            {/* Logs */}
            {update.logs && update.logs.length > 0 && (
              <div className="p-2 bg-gray-900 border-4 border-gray-700">
                <div className="font-mono text-xs text-gray-400 mb-2 flex items-center justify-between">
                  <span>LOGS ({update.logs.length}):</span>
                  <button
                    onClick={() => {
                      const logsText = update.logs?.join('\n') || ''
                      navigator.clipboard.writeText(logsText)
                    }}
                    className="text-primary hover:text-primary/80 text-xs"
                  >
                    [COPY]
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
                  {update.logs.map((log, index) => (
                    <div
                      key={index}
                      className="font-mono text-xs text-gray-500"
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Success/Error Summary */}
        {update.status === TransactionStatus.CONFIRMED && (
          <div className="p-3 border-4 border-green-500/30 bg-green-500/5">
            <div className="flex items-start gap-2">
              <span className="text-green-400 text-xl">✓</span>
              <div>
                <div className="font-pixel text-xs text-green-400 mb-1">
                  TRANSACTION CONFIRMED
                </div>
                <div className="font-mono text-xs text-gray-400">
                  Your transaction has been successfully confirmed on the blockchain.
                </div>
              </div>
            </div>
          </div>
        )}

        {update.status === TransactionStatus.FAILED && (
          <div className="p-3 border-4 border-red-500/30 bg-red-500/5">
            <div className="flex items-start gap-2">
              <span className="text-red-400 text-xl">✗</span>
              <div>
                <div className="font-pixel text-xs text-red-400 mb-1">
                  TRANSACTION FAILED
                </div>
                <div className="font-mono text-xs text-gray-400">
                  Your transaction could not be confirmed. Please try again.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #00ff41;
          border: 1px solid #1a1a1a;
        }
      `}</style>
    </PixelCard>
  )
}
