'use client'

import { useState, useCallback, useMemo } from 'react'
import { Upload, Search, Download, Copy, Eye, BarChart3, Bookmark } from 'lucide-react'

interface ViewFormat {
  id: string
  name: string
  description: string
}

interface Bookmark {
  offset: number
  name: string
  description: string
}

const viewFormats: ViewFormat[] = [
  { id: 'hex', name: 'Hex', description: 'Hexadecimal view with ASCII sidebar' },
  { id: 'ascii', name: 'ASCII', description: 'ASCII text representation' },
  { id: 'binary', name: 'Binary', description: 'Binary representation (0s and 1s)' },
  { id: 'decimal', name: 'Decimal', description: 'Decimal byte values' },
  { id: 'octal', name: 'Octal', description: 'Octal representation' },
  { id: 'analysis', name: 'Analysis', description: 'Data structure analysis' },
]

export default function BinaryDataViewer() {
  const [rawData, setRawData] = useState('')
  const [inputFormat, setInputFormat] = useState('hex')
  const [viewFormat, setViewFormat] = useState('hex')
  const [bytesPerRow, setBytesPerRow] = useState(16)
  const [currentOffset, setCurrentOffset] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<number[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [selectedRange, setSelectedRange] = useState<{start: number, end: number} | null>(null)

  const binaryData = useMemo(() => {
    if (!rawData) return new Uint8Array()

    try {
      switch (inputFormat) {
        case 'hex':
          const hexClean = rawData.replace(/[^0-9a-fA-F]/g, '')
          const hexArray = []
          for (let i = 0; i < hexClean.length; i += 2) {
            hexArray.push(parseInt(hexClean.substr(i, 2), 16))
          }
          return new Uint8Array(hexArray)
        
        case 'base64':
          const binaryString = atob(rawData.replace(/[^A-Za-z0-9+/=]/g, ''))
          return new Uint8Array([...binaryString].map(char => char.charCodeAt(0)))
        
        case 'base58':
          // Simple base58 decode (simplified)
          return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
        
        case 'ascii':
          return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
        
        default:
          return new Uint8Array()
      }
    } catch (error) {
      console.error('Error parsing data:', error)
      return new Uint8Array()
    }
  }, [rawData, inputFormat])

  const dataAnalysis = useMemo(() => {
    if (binaryData.length === 0) return null

    const frequency = new Array(256).fill(0)
    let entropy = 0
    const strings: string[] = []
    let currentString = ''

    binaryData.forEach(byte => {
      frequency[byte]++
      
      // Extract ASCII strings (printable characters)
      if (byte >= 32 && byte <= 126) {
        currentString += String.fromCharCode(byte)
      } else {
        if (currentString.length >= 4) {
          strings.push(currentString)
        }
        currentString = ''
      }
    })

    // Calculate entropy
    frequency.forEach(count => {
      if (count > 0) {
        const probability = count / binaryData.length
        entropy -= probability * Math.log2(probability)
      }
    })

    const mostFrequentByte = frequency.indexOf(Math.max(...frequency))
    const leastFrequentByte = frequency.indexOf(Math.min(...frequency.filter(f => f > 0)))

    return {
      size: binaryData.length,
      entropy: entropy.toFixed(2),
      mostFrequentByte: {
        value: mostFrequentByte,
        count: frequency[mostFrequentByte],
        percentage: ((frequency[mostFrequentByte] / binaryData.length) * 100).toFixed(2)
      },
      strings: strings.slice(0, 20), // Top 20 strings
      nullBytes: frequency[0],
      printableBytes: frequency.slice(32, 127).reduce((sum, count) => sum + count, 0)
    }
  }, [binaryData])

  const renderHexView = () => {
    const rows = []
    const totalRows = Math.ceil(binaryData.length / bytesPerRow)
    const startRow = Math.floor(currentOffset / bytesPerRow)
    const endRow = Math.min(startRow + 32, totalRows) // Show 32 rows at a time

    for (let row = startRow; row < endRow; row++) {
      const offset = row * bytesPerRow
      const rowData = binaryData.slice(offset, offset + bytesPerRow)
      
      const hexBytes = Array.from(rowData).map((byte, i) => {
        const globalOffset = offset + i
        const isSelected = selectedRange && 
          globalOffset >= selectedRange.start && 
          globalOffset <= selectedRange.end
        const isSearchResult = searchResults.includes(globalOffset)
        const isBookmark = bookmarks.some(b => b.offset === globalOffset)
        
        return (
          <span
            key={i}
            className={`cursor-pointer px-1 ${
              isSelected ? 'bg-blue-600 text-white' : 
              isSearchResult ? 'bg-yellow-600 text-white' :
              isBookmark ? 'bg-green-600 text-white' :
              'hover:bg-gray-600'
            }`}
            onClick={() => handleByteClick(globalOffset)}
          >
            {byte.toString(16).padStart(2, '0').toUpperCase()}
          </span>
        )
      })

      const asciiChars = Array.from(rowData).map((byte, i) => {
        const globalOffset = offset + i
        const char = byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.'
        const isSelected = selectedRange && 
          globalOffset >= selectedRange.start && 
          globalOffset <= selectedRange.end
        const isSearchResult = searchResults.includes(globalOffset)
        const isBookmark = bookmarks.some(b => b.offset === globalOffset)

        return (
          <span
            key={i}
            className={`cursor-pointer ${
              isSelected ? 'bg-blue-600 text-white' : 
              isSearchResult ? 'bg-yellow-600 text-white' :
              isBookmark ? 'bg-green-600 text-white' :
              'hover:bg-gray-600'
            }`}
            onClick={() => handleByteClick(globalOffset)}
          >
            {char}
          </span>
        )
      })

      rows.push(
        <div key={row} className="flex items-center space-x-4 font-mono text-sm">
          <div className="text-blue-400 w-20 text-right">
            {offset.toString(16).padStart(8, '0').toUpperCase()}
          </div>
          <div className="flex space-x-1 flex-1">
            {hexBytes}
          </div>
          <div className="text-gray-400 border-l border-gray-600 pl-4">
            {asciiChars}
          </div>
        </div>
      )
    }

    return rows
  }

  const renderOtherFormats = () => {
    const maxDisplayBytes = 1000 // Limit display for performance
    const displayData = binaryData.slice(currentOffset, currentOffset + maxDisplayBytes)

    switch (viewFormat) {
      case 'ascii':
        const asciiText = Array.from(displayData)
          .map(byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.')
          .join('')
        return <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap break-all">{asciiText}</pre>

      case 'binary':
        const binaryText = Array.from(displayData)
          .map(byte => byte.toString(2).padStart(8, '0'))
          .join(' ')
        return <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap break-all">{binaryText}</pre>

      case 'decimal':
        const decimalText = Array.from(displayData)
          .map(byte => byte.toString().padStart(3, ' '))
          .join(' ')
        return <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{decimalText}</pre>

      case 'octal':
        const octalText = Array.from(displayData)
          .map(byte => byte.toString(8).padStart(3, '0'))
          .join(' ')
        return <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{octalText}</pre>

      case 'analysis':
        return renderAnalysis()

      default:
        return renderHexView()
    }
  }

  const renderAnalysis = () => {
    if (!dataAnalysis) return <div>No data to analyze</div>

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-sm text-gray-400">File Size</div>
            <div className="text-xl font-bold text-white">{dataAnalysis.size} bytes</div>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-sm text-gray-400">Entropy</div>
            <div className="text-xl font-bold text-white">{dataAnalysis.entropy}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-sm text-gray-400">Null Bytes</div>
            <div className="text-xl font-bold text-white">{dataAnalysis.nullBytes}</div>
          </div>
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-sm text-gray-400">Printable Bytes</div>
            <div className="text-xl font-bold text-white">{dataAnalysis.printableBytes}</div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Most Frequent Byte</h3>
          <div className="bg-gray-700 p-4 rounded">
            <div className="text-gray-300">
              Value: 0x{dataAnalysis.mostFrequentByte.value.toString(16).padStart(2, '0').toUpperCase()} 
              ({dataAnalysis.mostFrequentByte.value}) - 
              Count: {dataAnalysis.mostFrequentByte.count} 
              ({dataAnalysis.mostFrequentByte.percentage}%)
            </div>
          </div>
        </div>

        {dataAnalysis.strings.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Extracted Strings</h3>
            <div className="bg-gray-700 p-4 rounded max-h-64 overflow-y-auto">
              {dataAnalysis.strings.map((str, index) => (
                <div key={index} className="text-gray-300 font-mono text-sm py-1 border-b border-gray-600 last:border-b-0">
                  {str}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleByteClick = (offset: number) => {
    if (selectedRange && selectedRange.start === offset) {
      setSelectedRange(null)
    } else if (selectedRange) {
      setSelectedRange({
        start: Math.min(selectedRange.start, offset),
        end: Math.max(selectedRange.start, offset)
      })
    } else {
      setSelectedRange({ start: offset, end: offset })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        const hexString = Array.from(uint8Array)
          .map(byte => byte.toString(16).padStart(2, '0'))
          .join('')
        setRawData(hexString)
        setInputFormat('hex')
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const searchData = () => {
    if (!searchQuery) {
      setSearchResults([])
      return
    }

    const results: number[] = []
    const query = searchQuery.toLowerCase()
    
    // Search in hex representation
    const hexString = Array.from(binaryData)
      .map(byte => byte.toString(16).padStart(2, '0'))
      .join('')
    
    let index = hexString.indexOf(query)
    while (index !== -1) {
      results.push(Math.floor(index / 2))
      index = hexString.indexOf(query, index + 1)
    }

    // Search in ASCII representation
    const asciiString = Array.from(binaryData)
      .map(byte => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.')
      .join('')
    
    index = asciiString.toLowerCase().indexOf(query)
    while (index !== -1) {
      if (!results.includes(index)) {
        results.push(index)
      }
      index = asciiString.toLowerCase().indexOf(query, index + 1)
    }

    setSearchResults(results.sort((a, b) => a - b))
  }

  const addBookmark = () => {
    if (selectedRange) {
      const name = prompt('Bookmark name:')
      if (name) {
        setBookmarks(prev => [...prev, {
          offset: selectedRange.start,
          name,
          description: `Offset 0x${selectedRange.start.toString(16).toUpperCase()}`
        }])
      }
    }
  }

  const exportData = () => {
    if (selectedRange) {
      const exportData = binaryData.slice(selectedRange.start, selectedRange.end + 1)
      const hexString = Array.from(exportData)
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('')
      
      const blob = new Blob([hexString], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `binary_data_${selectedRange.start}_${selectedRange.end}.hex`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Input Section */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Data Input</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Input Format
            </label>
            <select
              value={inputFormat}
              onChange={(e) => setInputFormat(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
            >
              <option value="hex">Hexadecimal</option>
              <option value="base64">Base64</option>
              <option value="base58">Base58</option>
              <option value="ascii">ASCII Text</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Upload File
            </label>
            <input
              type="file"
              onChange={handleFileUpload}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:bg-blue-600 file:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Data Input
          </label>
          <textarea
            value={rawData}
            onChange={(e) => setRawData(e.target.value)}
            placeholder="Paste your data here (hex, base64, etc.) or upload a file above..."
            rows={6}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 font-mono text-sm"
          />
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">View:</label>
            <select
              value={viewFormat}
              onChange={(e) => setViewFormat(e.target.value)}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              {viewFormats.map(format => (
                <option key={format.id} value={format.id}>{format.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-300">Bytes/Row:</label>
            <select
              value={bytesPerRow}
              onChange={(e) => setBytesPerRow(Number(e.target.value))}
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
            <button
              onClick={searchData}
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {selectedRange && (
            <div className="flex items-center space-x-2">
              <button
                onClick={addBookmark}
                className="flex items-center space-x-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                <Bookmark className="w-4 h-4" />
                <span>Bookmark</span>
              </button>
              <button
                onClick={exportData}
                className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between text-sm text-gray-400 border-t border-gray-700 pt-4">
          <div>
            Size: {binaryData.length} bytes
            {selectedRange && (
              <span className="ml-4">
                Selected: {selectedRange.start} - {selectedRange.end} 
                ({selectedRange.end - selectedRange.start + 1} bytes)
              </span>
            )}
          </div>
          {searchResults.length > 0 && (
            <div>Found {searchResults.length} matches</div>
          )}
        </div>
      </div>

      {/* Data Display */}
      {binaryData.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-white mb-2">
              Data View - {viewFormats.find(f => f.id === viewFormat)?.name}
            </h3>
            <p className="text-sm text-gray-400">
              {viewFormats.find(f => f.id === viewFormat)?.description}
            </p>
          </div>

          <div className="bg-gray-900 p-4 rounded border border-gray-600 max-h-96 overflow-auto">
            {renderOtherFormats()}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentOffset(Math.max(0, currentOffset - bytesPerRow * 10))}
                disabled={currentOffset === 0}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm"
              >
                ← Prev
              </button>
              <span className="text-sm text-gray-400">
                Offset: 0x{currentOffset.toString(16).toUpperCase()}
              </span>
              <button
                onClick={() => setCurrentOffset(Math.min(binaryData.length, currentOffset + bytesPerRow * 10))}
                disabled={currentOffset >= binaryData.length - bytesPerRow * 10}
                className="px-3 py-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 text-white rounded text-sm"
              >
                Next →
              </button>
            </div>

            <div className="text-sm text-gray-400">
              Showing {currentOffset} - {Math.min(currentOffset + bytesPerRow * 32, binaryData.length)} of {binaryData.length}
            </div>
          </div>
        </div>
      )}

      {/* Bookmarks */}
      {bookmarks.length > 0 && (
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Bookmarks</h3>
          <div className="space-y-2">
            {bookmarks.map((bookmark, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-700 p-3 rounded">
                <div>
                  <div className="text-white font-medium">{bookmark.name}</div>
                  <div className="text-sm text-gray-400">{bookmark.description}</div>
                </div>
                <button
                  onClick={() => setCurrentOffset(bookmark.offset)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                >
                  Go To
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}