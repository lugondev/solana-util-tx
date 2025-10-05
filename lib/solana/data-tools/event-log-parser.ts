import { Connection, ParsedTransactionWithMeta, PartiallyDecodedInstruction } from '@solana/web3.js'
import { Buffer } from 'buffer'

export interface SolanaEvent {
  programId: string
  programName?: string
  eventType: string
  data: any
  logs: string[]
  instructionIndex: number
  innerInstructionIndex?: number
  slot?: number
  blockTime?: number
  signature?: string
}

export interface ParsedEventLog {
  signature: string
  slot?: number
  blockTime?: number
  events: SolanaEvent[]
  totalEvents: number
  programCounts: { [programId: string]: number }
  rawLogs: string[]
  isSuccess: boolean
  error?: string
}

export interface EventParseOptions {
  includeSystemProgram?: boolean
  includeTokenProgram?: boolean
  includeUnknownPrograms?: boolean
  parseCustomEvents?: boolean
  filterByProgram?: string[]
}

export class EventLogParser {
  private connection: Connection
  private knownPrograms: Map<string, string>

  constructor(connection: Connection) {
    this.connection = connection
    this.knownPrograms = new Map([
      ['11111111111111111111111111111111', 'System Program'],
      ['TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', 'Token Program'],
      ['TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb', 'Token-2022 Program'],
      ['ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL', 'Associated Token Program'],
      ['JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4', 'Jupiter Aggregator V6'],
      ['JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB', 'Jupiter Aggregator V4'],
      ['9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM', 'Orca Whirlpool'],
      ['675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8', 'Raydium AMM V4'],
      ['srmqPiKfyn7iEp3TqApAVdxKHy4rBpGFsHW3TnHRKWe', 'Serum DEX V3'],
      ['9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin', 'Serum DEX V2'],
      ['EUqojwWA2rd19FZrzeBncJsm38Jm1hEhE3zsmX3bRc2o', 'Serum DEX V1'],
      ['mv3ekLzLbnVPNxjSKvqBpU3ZeZXPQdEC3bp5MDEBG68', 'Mercurial Stable Swap'],
      ['SSwpkEEcbUqx4vtoEByFjSkhKdCT862DNVb52nZg1UZ', 'Sabre Stable Swap'],
      ['MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr', 'Memo Program'],
      ['metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s', 'Metaplex Token Metadata'],
      ['p1exdMJcjVao65QdewkaZRUnU6VPSXhus9n2GzWfh98', 'Metaplex Auction House'],
      ['hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk', 'Metaplex Auction House V2'],
    ])
  }

  /**
   * Parse events from a transaction signature
   */
  async parseTransactionEvents(
    signature: string, 
    options: EventParseOptions = {}
  ): Promise<ParsedEventLog> {
    try {
      const transaction = await this.connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed'
      })

      if (!transaction) {
        return {
          signature,
          events: [],
          totalEvents: 0,
          programCounts: {},
          rawLogs: [],
          isSuccess: false,
          error: 'Transaction not found'
        }
      }

      return this.parseTransactionData(transaction, signature, options)
    } catch (error) {
      return {
        signature,
        events: [],
        totalEvents: 0,
        programCounts: {},
        rawLogs: [],
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Parse events from multiple transaction signatures
   */
  async parseMultipleTransactions(
    signatures: string[],
    options: EventParseOptions = {}
  ): Promise<ParsedEventLog[]> {
    const results = await Promise.allSettled(
      signatures.map(sig => this.parseTransactionEvents(sig, options))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          signature: signatures[index],
          events: [],
          totalEvents: 0,
          programCounts: {},
          rawLogs: [],
          isSuccess: false,
          error: result.reason?.message || 'Failed to parse transaction'
        }
      }
    })
  }

  /**
   * Parse events from raw logs
   */
  parseLogsOnly(logs: string[], signature?: string): ParsedEventLog {
    try {
      const events = this.extractEventsFromLogs(logs)
      const programCounts = this.countEventsByProgram(events)

      return {
        signature: signature || 'unknown',
        events,
        totalEvents: events.length,
        programCounts,
        rawLogs: logs,
        isSuccess: true
      }
    } catch (error) {
      return {
        signature: signature || 'unknown',
        events: [],
        totalEvents: 0,
        programCounts: {},
        rawLogs: logs,
        isSuccess: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Parse transaction data
   */
  private parseTransactionData(
    transaction: ParsedTransactionWithMeta,
    signature: string,
    options: EventParseOptions
  ): ParsedEventLog {
    const logs = transaction.meta?.logMessages || []
    const isSuccess = transaction.meta?.err === null

    try {
      // Extract events from logs
      const logEvents = this.extractEventsFromLogs(logs, options)

      // Extract events from instructions
      const instructionEvents = this.extractEventsFromInstructions(
        transaction.transaction.message.instructions,
        options
      )

      // Extract events from inner instructions
      const innerInstructionEvents = this.extractEventsFromInnerInstructions(
        transaction.meta?.innerInstructions || [],
        options
      )

      // Combine all events
      const allEvents = [
        ...logEvents,
        ...instructionEvents,
        ...innerInstructionEvents
      ]

      // Filter events based on options
      const filteredEvents = this.filterEvents(allEvents, options)

      // Count events by program
      const programCounts = this.countEventsByProgram(filteredEvents)

      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime || undefined,
        events: filteredEvents,
        totalEvents: filteredEvents.length,
        programCounts,
        rawLogs: logs,
        isSuccess
      }
    } catch (error) {
      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime || undefined,
        events: [],
        totalEvents: 0,
        programCounts: {},
        rawLogs: logs,
        isSuccess,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Extract events from transaction logs
   */
  private extractEventsFromLogs(
    logs: string[], 
    options: EventParseOptions = {}
  ): SolanaEvent[] {
    const events: SolanaEvent[] = []
    let currentProgramId = ''
    let instructionIndex = 0

    for (const log of logs) {
      // Track program invocations
      if (log.startsWith('Program ')) {
        const parts = log.split(' ')
        if (parts.length >= 2 && parts[1] !== 'log:') {
          currentProgramId = parts[1]
        }
      }

      // Parse different types of logs
      if (log.includes('invoke')) {
        const invokeEvent = this.parseInvokeLog(log, currentProgramId, instructionIndex)
        if (invokeEvent) {
          events.push(invokeEvent)
        }
        instructionIndex++
      } else if (log.includes('Program log:')) {
        const programLogEvent = this.parseProgramLog(log, currentProgramId, instructionIndex)
        if (programLogEvent) {
          events.push(programLogEvent)
        }
      } else if (log.includes('Program data:')) {
        const programDataEvent = this.parseProgramData(log, currentProgramId, instructionIndex)
        if (programDataEvent) {
          events.push(programDataEvent)
        }
      } else if (log.includes('consumed') && log.includes('compute units')) {
        const computeEvent = this.parseComputeLog(log, currentProgramId, instructionIndex)
        if (computeEvent) {
          events.push(computeEvent)
        }
      } else if (log.includes('success') || log.includes('failed')) {
        const resultEvent = this.parseResultLog(log, currentProgramId, instructionIndex)
        if (resultEvent) {
          events.push(resultEvent)
        }
      } else if (options.parseCustomEvents) {
        const customEvent = this.parseCustomEvent(log, currentProgramId, instructionIndex)
        if (customEvent) {
          events.push(customEvent)
        }
      }
    }

    return events
  }

  /**
   * Parse invoke logs
   */
  private parseInvokeLog(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    const invokeMatch = log.match(/Program (\w+) invoke \[(\d+)\]/)
    if (invokeMatch) {
      return {
        programId: invokeMatch[1],
        programName: this.knownPrograms.get(invokeMatch[1]),
        eventType: 'invoke',
        data: {
          depth: parseInt(invokeMatch[2]),
          message: log
        },
        logs: [log],
        instructionIndex
      }
    }
    return null
  }

  /**
   * Parse program log events
   */
  private parseProgramLog(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    const logMatch = log.match(/Program log: (.+)/)
    if (logMatch) {
      const logData = logMatch[1]
      
      // Try to parse as JSON
      let parsedData: any = logData
      try {
        parsedData = JSON.parse(logData)
      } catch {
        // Not JSON, keep as string
      }

      return {
        programId,
        programName: this.knownPrograms.get(programId),
        eventType: 'program_log',
        data: {
          message: logData,
          parsed: parsedData
        },
        logs: [log],
        instructionIndex
      }
    }
    return null
  }

  /**
   * Parse program data events
   */
  private parseProgramData(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    const dataMatch = log.match(/Program data: (.+)/)
    if (dataMatch) {
      const base64Data = dataMatch[1]
      
      try {
        const buffer = Buffer.from(base64Data, 'base64')
        return {
          programId,
          programName: this.knownPrograms.get(programId),
          eventType: 'program_data',
          data: {
            base64: base64Data,
            hex: buffer.toString('hex'),
            size: buffer.length,
            raw: Array.from(buffer)
          },
          logs: [log],
          instructionIndex
        }
      } catch {
        return {
          programId,
          programName: this.knownPrograms.get(programId),
          eventType: 'program_data',
          data: {
            base64: base64Data,
            error: 'Failed to decode base64'
          },
          logs: [log],
          instructionIndex
        }
      }
    }
    return null
  }

  /**
   * Parse compute unit logs
   */
  private parseComputeLog(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    const computeMatch = log.match(/Program (\w+) consumed (\d+) of (\d+) compute units/)
    if (computeMatch) {
      return {
        programId: computeMatch[1],
        programName: this.knownPrograms.get(computeMatch[1]),
        eventType: 'compute_budget',
        data: {
          consumed: parseInt(computeMatch[2]),
          allocated: parseInt(computeMatch[3]),
          percentage: (parseInt(computeMatch[2]) / parseInt(computeMatch[3])) * 100
        },
        logs: [log],
        instructionIndex
      }
    }
    return null
  }

  /**
   * Parse result logs
   */
  private parseResultLog(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    if (log.includes('success')) {
      const successMatch = log.match(/Program (\w+) success/)
      if (successMatch) {
        return {
          programId: successMatch[1],
          programName: this.knownPrograms.get(successMatch[1]),
          eventType: 'success',
          data: { status: 'success' },
          logs: [log],
          instructionIndex
        }
      }
    } else if (log.includes('failed')) {
      const failedMatch = log.match(/Program (\w+) failed: (.+)/)
      if (failedMatch) {
        return {
          programId: failedMatch[1],
          programName: this.knownPrograms.get(failedMatch[1]),
          eventType: 'error',
          data: { 
            status: 'failed',
            error: failedMatch[2]
          },
          logs: [log],
          instructionIndex
        }
      }
    }
    return null
  }

  /**
   * Parse custom event patterns
   */
  private parseCustomEvent(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    // Jupiter swap events
    if (log.includes('SwapEvent')) {
      return this.parseJupiterSwapEvent(log, programId, instructionIndex)
    }

    // Orca whirlpool events
    if (log.includes('Whirlpool')) {
      return this.parseOrcaEvent(log, programId, instructionIndex)
    }

    // Raydium events
    if (log.includes('RayLog') || log.includes('SimulateInfo')) {
      return this.parseRaydiumEvent(log, programId, instructionIndex)
    }

    // Token transfer events
    if (log.includes('Transfer')) {
      return this.parseTokenEvent(log, programId, instructionIndex)
    }

    return null
  }

  /**
   * Parse Jupiter swap events
   */
  private parseJupiterSwapEvent(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    try {
      const eventMatch = log.match(/Program log: (.+)/)
      if (eventMatch) {
        return {
          programId,
          programName: 'Jupiter Aggregator',
          eventType: 'jupiter_swap',
          data: { message: eventMatch[1] },
          logs: [log],
          instructionIndex
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null
  }

  /**
   * Parse Orca events
   */
  private parseOrcaEvent(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    try {
      const eventMatch = log.match(/Program log: (.+)/)
      if (eventMatch) {
        return {
          programId,
          programName: 'Orca Whirlpool',
          eventType: 'orca_whirlpool',
          data: { message: eventMatch[1] },
          logs: [log],
          instructionIndex
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null
  }

  /**
   * Parse Raydium events
   */
  private parseRaydiumEvent(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    try {
      const eventMatch = log.match(/Program log: (.+)/)
      if (eventMatch) {
        return {
          programId,
          programName: 'Raydium AMM',
          eventType: 'raydium_amm',
          data: { message: eventMatch[1] },
          logs: [log],
          instructionIndex
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null
  }

  /**
   * Parse token events
   */
  private parseTokenEvent(log: string, programId: string, instructionIndex: number): SolanaEvent | null {
    try {
      const eventMatch = log.match(/Program log: (.+)/)
      if (eventMatch) {
        return {
          programId,
          programName: 'Token Program',
          eventType: 'token_transfer',
          data: { message: eventMatch[1] },
          logs: [log],
          instructionIndex
        }
      }
    } catch (error) {
      // Ignore parsing errors
    }
    return null
  }

  /**
   * Extract events from instructions
   */
  private extractEventsFromInstructions(
    instructions: any[],
    options: EventParseOptions
  ): SolanaEvent[] {
    const events: SolanaEvent[] = []

    instructions.forEach((instruction, index) => {
      const programId = instruction.programId.toString()
      
      if (instruction.parsed) {
        // Parsed instruction
        events.push({
          programId,
          programName: this.knownPrograms.get(programId),
          eventType: 'instruction',
          data: {
            type: instruction.parsed.type,
            info: instruction.parsed.info
          },
          logs: [],
          instructionIndex: index
        })
      } else {
        // Raw instruction
        const rawInstruction = instruction as PartiallyDecodedInstruction
        events.push({
          programId,
          programName: this.knownPrograms.get(programId),
          eventType: 'raw_instruction',
          data: {
            data: rawInstruction.data,
            accounts: rawInstruction.accounts.map(acc => acc.toString())
          },
          logs: [],
          instructionIndex: index
        })
      }
    })

    return events
  }

  /**
   * Extract events from inner instructions
   */
  private extractEventsFromInnerInstructions(
    innerInstructions: any[],
    options: EventParseOptions
  ): SolanaEvent[] {
    const events: SolanaEvent[] = []

    innerInstructions.forEach((innerInstGroup) => {
      innerInstGroup.instructions.forEach((instruction: any, innerIndex: number) => {
        const programId = instruction.programId.toString()
        
        events.push({
          programId,
          programName: this.knownPrograms.get(programId),
          eventType: 'inner_instruction',
          data: instruction.parsed || { 
            data: instruction.data,
            accounts: instruction.accounts?.map((acc: any) => acc.toString()) || []
          },
          logs: [],
          instructionIndex: innerInstGroup.index,
          innerInstructionIndex: innerIndex
        })
      })
    })

    return events
  }

  /**
   * Filter events based on options
   */
  private filterEvents(events: SolanaEvent[], options: EventParseOptions): SolanaEvent[] {
    return events.filter(event => {
      // Filter by program
      if (options.filterByProgram && options.filterByProgram.length > 0) {
        return options.filterByProgram.includes(event.programId)
      }

      // System program filter
      if (!options.includeSystemProgram && event.programId === '11111111111111111111111111111111') {
        return false
      }

      // Token program filter
      if (!options.includeTokenProgram && (
        event.programId === 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' ||
        event.programId === 'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
      )) {
        return false
      }

      // Unknown programs filter
      if (!options.includeUnknownPrograms && !this.knownPrograms.has(event.programId)) {
        return false
      }

      return true
    })
  }

  /**
   * Count events by program
   */
  private countEventsByProgram(events: SolanaEvent[]): { [programId: string]: number } {
    const counts: { [programId: string]: number } = {}
    
    events.forEach(event => {
      counts[event.programId] = (counts[event.programId] || 0) + 1
    })

    return counts
  }

  /**
   * Get statistics about parsed events
   */
  getEventStatistics(parsedLogs: ParsedEventLog[]): {
    totalTransactions: number
    totalEvents: number
    successfulTransactions: number
    failedTransactions: number
    topPrograms: { programId: string; programName?: string; count: number }[]
    eventTypes: { type: string; count: number }[]
  } {
    const stats = {
      totalTransactions: parsedLogs.length,
      totalEvents: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      programCounts: new Map<string, number>(),
      eventTypeCounts: new Map<string, number>()
    }

    parsedLogs.forEach(log => {
      stats.totalEvents += log.totalEvents
      
      if (log.isSuccess) {
        stats.successfulTransactions++
      } else {
        stats.failedTransactions++
      }

      // Count programs
      Object.entries(log.programCounts).forEach(([programId, count]) => {
        stats.programCounts.set(
          programId, 
          (stats.programCounts.get(programId) || 0) + count
        )
      })

      // Count event types
      log.events.forEach(event => {
        stats.eventTypeCounts.set(
          event.eventType,
          (stats.eventTypeCounts.get(event.eventType) || 0) + 1
        )
      })
    })

    // Sort and format results
    const topPrograms = Array.from(stats.programCounts.entries())
      .map(([programId, count]) => ({
        programId,
        programName: this.knownPrograms.get(programId),
        count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    const eventTypes = Array.from(stats.eventTypeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)

    return {
      totalTransactions: stats.totalTransactions,
      totalEvents: stats.totalEvents,
      successfulTransactions: stats.successfulTransactions,
      failedTransactions: stats.failedTransactions,
      topPrograms,
      eventTypes
    }
  }
}