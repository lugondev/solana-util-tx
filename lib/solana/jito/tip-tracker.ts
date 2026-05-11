import { Connection } from '@solana/web3.js'

export interface JitoTipData {
	timestamp: string
	tip: number
	bundleSuccess: boolean
	blockPosition: number
	validator: string
	slot: number
	blockTime: number
}

export interface JitoNetworkStats {
	avgTip: number
	successRate: number
	recommendedTip: number
	blockTime: number
	competition: 'LOW' | 'MEDIUM' | 'HIGH'
	volatility: 'LOW' | 'MEDIUM' | 'HIGH'
}

export interface JitoTipPercentiles {
	timestamp: string
	p25: number
	p50: number
	p75: number
	p95: number
	p99: number
	emaP50: number
}

// Public Jito tip-floor API — returns landed-tip percentiles updated roughly once per second.
const JITO_TIP_FLOOR_URL = 'https://bundles.jito.wtf/api/v1/bundles/tip_floor'

type RawTipFloor = {
	time: string
	landed_tips_25th_percentile: number
	landed_tips_50th_percentile: number
	landed_tips_75th_percentile: number
	landed_tips_95th_percentile: number
	landed_tips_99th_percentile: number
	ema_landed_tips_50th_percentile: number
}

export class JitoTipTracker {
	private connection: Connection
	private tipHistory: JitoTipData[] = []
	private percentileHistory: JitoTipPercentiles[] = []
	private updateInterval: ReturnType<typeof setInterval> | null = null

	constructor(connection: Connection) {
		this.connection = connection
	}

	/**
	 * Start tracking tips against the public Jito tip-floor API.
	 * The API returns landed-tip percentiles; we treat each fetch as one sample.
	 */
	startTracking(callback?: (data: JitoTipData) => void): void {
		if (this.updateInterval) {
			this.stopTracking()
		}

		const tick = async () => {
			try {
				const tipData = await this.fetchLatestTipData()
				this.tipHistory.unshift(tipData)
				if (this.tipHistory.length > 100) {
					this.tipHistory = this.tipHistory.slice(0, 100)
				}
				if (callback) callback(tipData)
			} catch (error) {
				console.error('Error fetching tip data:', error)
			}
		}

		// fire immediately so the UI shows real data without a 10s delay
		void tick()
		this.updateInterval = setInterval(tick, 10000)
	}

	stopTracking(): void {
		if (this.updateInterval) {
			clearInterval(this.updateInterval)
			this.updateInterval = null
		}
	}

	getTipHistory(): JitoTipData[] {
		return [...this.tipHistory]
	}

	getPercentileHistory(): JitoTipPercentiles[] {
		return [...this.percentileHistory]
	}

	getLatestPercentiles(): JitoTipPercentiles | null {
		return this.percentileHistory[0] ?? null
	}

	getNetworkStats(): JitoNetworkStats {
		const latest = this.getLatestPercentiles()

		if (!latest && this.tipHistory.length === 0) {
			// no data yet — return safe defaults so UI doesn't render NaN
			return {
				avgTip: 0,
				successRate: 0,
				recommendedTip: 0,
				blockTime: 400,
				competition: 'LOW',
				volatility: 'LOW',
			}
		}

		// Derive stats from real percentiles when available, otherwise from local history.
		const avgTip = latest ? latest.emaP50 : this.tipHistory.reduce((s, t) => s + t.tip, 0) / this.tipHistory.length
		const recommendedTip = latest ? latest.p75 : avgTip * 1.5

		// successRate here = share of recent ticks where percentile data was retrievable.
		// We can't infer "your bundle would land" from public data — that depends on what
		// you actually pay versus the floor at submit time. We report the floor coverage instead.
		const successRate = this.percentileHistory.length > 0 ? 100 : 0

		const recentP50s = this.percentileHistory.slice(0, 20).map((p) => p.p50)
		const volatility = this.calculateVolatility(recentP50s)
		const competition = this.classifyCompetition(latest?.p95 ?? avgTip * 3)

		return {
			avgTip,
			successRate,
			recommendedTip,
			blockTime: 400,
			competition,
			volatility,
		}
	}

	private async fetchLatestTipData(): Promise<JitoTipData> {
		const percentiles = await this.fetchTipFloor()
		this.percentileHistory.unshift(percentiles)
		if (this.percentileHistory.length > 100) {
			this.percentileHistory = this.percentileHistory.slice(0, 100)
		}

		let slot = 0
		try {
			slot = await this.connection.getSlot()
		} catch {
			// connection may not be on mainnet — slot is non-critical
		}

		return {
			timestamp: percentiles.timestamp,
			tip: percentiles.p50,
			bundleSuccess: true, // each sample represents a window where bundles did land
			blockPosition: 0,
			validator: 'Jito tip-floor',
			slot,
			blockTime: Date.parse(percentiles.timestamp) || Date.now(),
		}
	}

	/**
	 * Fetch the latest tip-floor percentiles from Jito's public API.
	 * Throws if the network call fails — caller decides how to surface it.
	 */
	async fetchTipFloor(): Promise<JitoTipPercentiles> {
		const res = await fetch(JITO_TIP_FLOOR_URL, { cache: 'no-store' })
		if (!res.ok) {
			throw new Error(`Jito tip-floor API returned ${res.status}`)
		}
		const json = (await res.json()) as RawTipFloor[]
		const first = Array.isArray(json) ? json[0] : null
		if (!first) {
			throw new Error('Jito tip-floor API returned empty payload')
		}
		return {
			timestamp: first.time,
			p25: first.landed_tips_25th_percentile,
			p50: first.landed_tips_50th_percentile,
			p75: first.landed_tips_75th_percentile,
			p95: first.landed_tips_95th_percentile,
			p99: first.landed_tips_99th_percentile,
			emaP50: first.ema_landed_tips_50th_percentile,
		}
	}

	private calculateVolatility(values: number[]): 'LOW' | 'MEDIUM' | 'HIGH' {
		if (values.length < 2) return 'LOW'
		const changes: number[] = []
		for (let i = 1; i < values.length; i++) {
			if (values[i - 1] !== 0) {
				changes.push(Math.abs((values[i] - values[i - 1]) / values[i - 1]))
			}
		}
		if (changes.length === 0) return 'LOW'
		const avgChange = changes.reduce((s, c) => s + c, 0) / changes.length
		if (avgChange > 0.3) return 'HIGH'
		if (avgChange > 0.15) return 'MEDIUM'
		return 'LOW'
	}

	private classifyCompetition(p95: number): 'LOW' | 'MEDIUM' | 'HIGH' {
		if (p95 >= 0.01) return 'HIGH'
		if (p95 >= 0.001) return 'MEDIUM'
		return 'LOW'
	}

	getTipRecommendation(targetSuccessRate: number = 0.8): {
		tip: number
		confidence: number
		reasoning: string
	} {
		const latest = this.getLatestPercentiles()
		if (!latest) {
			return {
				tip: 0.0001,
				confidence: 0,
				reasoning: 'Waiting for live tip-floor data from Jito API…',
			}
		}

		// Map target success-rate to a percentile of landed tips.
		// 0.5 → p50, 0.75 → p75, 0.9 → p95, ≥0.95 → p99
		let tip = latest.p50
		let percentileLabel = '50th'
		if (targetSuccessRate >= 0.95) {
			tip = latest.p99
			percentileLabel = '99th'
		} else if (targetSuccessRate >= 0.85) {
			tip = latest.p95
			percentileLabel = '95th'
		} else if (targetSuccessRate >= 0.7) {
			tip = latest.p75
			percentileLabel = '75th'
		}

		const confidence = Math.min(0.95, this.percentileHistory.length / 20)
		return {
			tip,
			confidence,
			reasoning: `Matches the ${percentileLabel} percentile of landed tips on Jito right now (${tip.toFixed(6)} SOL).`,
		}
	}

	analyzeTipEfficiency(userTip: number): {
		efficiency: number
		suggestion: string
		expectedSuccessRate: number
	} {
		const latest = this.getLatestPercentiles()
		if (!latest) {
			return {
				efficiency: 0,
				suggestion: 'Waiting for live tip-floor data…',
				expectedSuccessRate: 0,
			}
		}

		if (userTip < latest.p25) {
			return {
				efficiency: 0.2,
				suggestion: 'Below 25th percentile — most bundles at this tip do not land.',
				expectedSuccessRate: 0.15,
			}
		}
		if (userTip < latest.p50) {
			return {
				efficiency: 0.5,
				suggestion: 'Between 25th–50th percentile — moderate chance.',
				expectedSuccessRate: 0.4,
			}
		}
		if (userTip < latest.p75) {
			return {
				efficiency: 0.8,
				suggestion: 'Between 50th–75th percentile — likely to land.',
				expectedSuccessRate: 0.7,
			}
		}
		if (userTip < latest.p95) {
			return {
				efficiency: 0.95,
				suggestion: 'Above 75th percentile — strong inclusion probability.',
				expectedSuccessRate: 0.9,
			}
		}
		return {
			efficiency: 0.75,
			suggestion: 'Above 95th percentile — likely overpaying.',
			expectedSuccessRate: 0.97,
		}
	}
}

export default JitoTipTracker
