'use client'

import {useState, useEffect, useCallback, useRef} from 'react'
import {useRouter} from 'next/navigation'
import {Search, Command} from 'lucide-react'
import {useSearch, SearchableItem} from '@/contexts/SearchContext'

interface SearchModalProps {
	isOpen: boolean
	onClose: () => void
}

export function SearchModal({isOpen, onClose}: SearchModalProps) {
	const [query, setQuery] = useState('')
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [results, setResults] = useState<SearchableItem[]>([])
	const {search} = useSearch()
	const router = useRouter()
	const inputRef = useRef<HTMLInputElement>(null)

	// Search as user types
	useEffect(() => {
		const searchResults = search(query)
		setResults(searchResults)
		setSelectedIndex(0)
	}, [query, search])

	// Focus input when modal opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			switch (e.key) {
				case 'ArrowDown':
					e.preventDefault()
					setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1))
					break
				case 'ArrowUp':
					e.preventDefault()
					setSelectedIndex((prev) => Math.max(prev - 1, 0))
					break
				case 'Enter':
					e.preventDefault()
					if (results[selectedIndex]) {
						navigateToResult(results[selectedIndex])
					}
					break
				case 'Escape':
					e.preventDefault()
					onClose()
					break
			}
		},
		[results, selectedIndex, onClose],
	)

	const navigateToResult = (item: SearchableItem) => {
		router.push(item.href)
		onClose()
		setQuery('')
	}

	const handleResultClick = (item: SearchableItem) => {
		navigateToResult(item)
	}

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24'>
			{/* Backdrop */}
			<div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />

			{/* Modal */}
			<div className='relative w-full max-w-2xl mx-4 bg-gray-900 rounded-lg border-2 border-green-400/30 shadow-2xl overflow-hidden'>
				{/* Search Input */}
				<div className='flex items-center px-4 py-3 border-b border-gray-700'>
					<Search className='w-5 h-5 mr-3 text-gray-400' />
					<input ref={inputRef} type='text' value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown} placeholder='Search tools and features...' className='flex-1 bg-transparent text-lg outline-none text-white placeholder-gray-400' />
					<div className='flex items-center gap-1 text-xs text-gray-400'>
						<kbd className='px-2 py-1 rounded bg-gray-800'>ESC</kbd>
					</div>
				</div>

				{/* Results */}
				<div className='max-h-96 overflow-y-auto'>
					{query.trim() === '' ? (
						<div className='p-8 text-center text-gray-400'>
							<Search className='w-12 h-12 mx-auto mb-4 opacity-50' />
							<p className='text-lg font-medium mb-2'>Search Solana Tools</p>
							<p className='text-sm'>Type to search across all features and tools</p>
							<div className='mt-4 flex items-center justify-center gap-2 text-xs'>
								<span>Quick shortcuts:</span>
								<kbd className='px-2 py-1 rounded bg-gray-800'>/</kbd>
								<span>or</span>
								<kbd className='px-2 py-1 rounded bg-gray-800'>⌘K</kbd>
							</div>
						</div>
					) : results.length === 0 ? (
						<div className='p-8 text-center text-gray-400'>
							<Search className='w-12 h-12 mx-auto mb-4 opacity-50' />
							<p className='text-lg font-medium mb-2'>No results found</p>
							<p className='text-sm'>Try a different search term or browse categories</p>
						</div>
					) : (
						<div className='py-2'>
							{results.map((item, index) => (
								<button key={item.id} onClick={() => handleResultClick(item)} className={`w-full flex items-center px-4 py-3 hover:bg-gray-800 transition-colors ${index === selectedIndex ? 'bg-gray-800' : ''}`}>
									<div className='flex items-center flex-1 min-w-0'>
										{item.icon && <span className='text-2xl mr-3 flex-shrink-0'>{item.icon}</span>}
										<div className='min-w-0 flex-1 text-left'>
											<div className='font-medium text-white'>{item.title}</div>
											<div className='text-sm truncate text-gray-400'>{item.description}</div>
										</div>
									</div>
									<div className='text-xs px-2 py-1 rounded flex-shrink-0 ml-3 bg-gray-700 text-gray-300'>{item.category}</div>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Footer */}
				{results.length > 0 && (
					<div className='flex items-center justify-between px-4 py-2 text-xs border-t border-gray-700 text-gray-400 bg-gray-800/50'>
						<div className='flex items-center gap-4'>
							<span className='flex items-center gap-1'>
								<kbd className='px-1.5 py-0.5 rounded bg-gray-700'>↑↓</kbd>
								Navigate
							</span>
							<span className='flex items-center gap-1'>
								<kbd className='px-1.5 py-0.5 rounded bg-gray-700'>↵</kbd>
								Select
							</span>
						</div>
						<span>
							{results.length} result{results.length !== 1 ? 's' : ''}
						</span>
					</div>
				)}
			</div>
		</div>
	)
}

export function SearchTrigger() {
	const [isOpen, setIsOpen] = useState(false)

	// Global keyboard shortcuts
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			// Slash key (/)
			if (e.key === '/' && !e.metaKey && !e.ctrlKey) {
				// Only trigger if not typing in an input/textarea
				const activeElement = document.activeElement
				const isTyping = activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement || activeElement?.getAttribute('contenteditable') === 'true'

				if (!isTyping) {
					e.preventDefault()
					setIsOpen(true)
				}
			}

			// Cmd+K / Ctrl+K
			if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
				e.preventDefault()
				setIsOpen(true)
			}
		}

		document.addEventListener('keydown', handleKeyDown)
		return () => document.removeEventListener('keydown', handleKeyDown)
	}, [])

	return (
		<>
			<button onClick={() => setIsOpen(true)} className='flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' title='Search tools (/ or ⌘K)'>
				<Search className='w-4 h-4' />
				<span className='hidden sm:inline text-sm'>Search...</span>
				<div className='hidden sm:flex items-center gap-1 ml-auto'>
					<kbd className='px-1.5 py-0.5 text-xs rounded bg-gray-700'>⌘K</kbd>
				</div>
			</button>

			<SearchModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	)
}
