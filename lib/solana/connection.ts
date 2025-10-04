import { Connection, Commitment } from '@solana/web3.js'
import { getEndpoints, DEFAULT_CONFIG } from './config'

/**
 * RPC Endpoint interface
 */
export interface RPCEndpoint {
  url: string
  isHealthy: boolean
  lastCheck: number
}

/**
 * Connection configuration interface
 */
export interface ConnectionConfig {
  commitment: Commitment
  confirmTransactionInitialTimeout?: number
  maxRetries: number
  retryDelay: number
}

/**
 * Connection Manager class
 * Manages multiple RPC endpoints with automatic failover
 */
class ConnectionManager {
  private endpoints: RPCEndpoint[]
  private currentIndex: number = 0
  private connection: Connection
  private config: ConnectionConfig

  constructor(endpointUrls: string[], config: ConnectionConfig) {
    this.config = config
    this.endpoints = endpointUrls.map(url => ({
      url,
      isHealthy: true,
      lastCheck: Date.now()
    }))
    
    this.connection = this.createConnection(this.endpoints[0].url)
  }

  /**
   * Create a new connection instance
   */
  private createConnection(url: string): Connection {
    return new Connection(url, {
      commitment: this.config.commitment,
      confirmTransactionInitialTimeout: this.config.confirmTransactionInitialTimeout
    })
  }

  /**
   * Get current connection instance
   */
  public getConnection(): Connection {
    return this.connection
  }

  /**
   * Get current endpoint URL
   */
  public getCurrentEndpoint(): string {
    return this.endpoints[this.currentIndex].url
  }

  /**
   * Switch to next available endpoint
   */
  public async switchEndpoint(): Promise<void> {
    this.currentIndex = (this.currentIndex + 1) % this.endpoints.length
    const endpoint = this.endpoints[this.currentIndex]
    
    this.connection = this.createConnection(endpoint.url)
    
    console.log(`[ConnectionManager] Switched to RPC endpoint: ${endpoint.url}`)
  }

  /**
   * Check health of current endpoint
   */
  public async checkHealth(): Promise<boolean> {
    try {
      await this.connection.getSlot()
      this.endpoints[this.currentIndex].isHealthy = true
      this.endpoints[this.currentIndex].lastCheck = Date.now()
      return true
    } catch (error) {
      console.error('[ConnectionManager] Health check failed:', error)
      this.endpoints[this.currentIndex].isHealthy = false
      this.endpoints[this.currentIndex].lastCheck = Date.now()
      return false
    }
  }

  /**
   * Execute function with automatic retry and failover
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries?: number
  ): Promise<T> {
    const retries = maxRetries ?? this.config.maxRetries
    let lastError: Error | undefined
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn()
      } catch (error) {
        lastError = error as Error
        console.warn(`[ConnectionManager] Attempt ${i + 1} failed:`, error)
        
        if (i < retries - 1) {
          // Switch to next endpoint
          await this.switchEndpoint()
          
          // Exponential backoff
          const delay = this.config.retryDelay * Math.pow(2, i)
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }
    
    throw lastError
  }

  /**
   * Get all endpoints status
   */
  public getEndpointsStatus(): RPCEndpoint[] {
    return [...this.endpoints]
  }
}

/**
 * Singleton connection manager instance
 */
const endpoints = getEndpoints()
export const connectionManager = new ConnectionManager(endpoints, DEFAULT_CONFIG)

/**
 * Get connection instance
 */
export const getConnection = () => connectionManager.getConnection()

/**
 * Execute with retry helper
 */
export const executeWithRetry = <T>(fn: () => Promise<T>) => 
  connectionManager.executeWithRetry(fn)

/**
 * Get current endpoint
 */
export const getCurrentEndpoint = () => connectionManager.getCurrentEndpoint()
