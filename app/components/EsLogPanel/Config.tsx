import React, { useRef } from 'react'
import { useESLogStore, useStore } from './store'
import { parseEsLog } from '@/utils/json_filter'

const Config = () => {
  const eslogStore = useESLogStore()
  const { valueFilter, setSearchRes, storeQueryCardsStr, setValueFilter } = eslogStore.getState()
  const searchRes = useStore(state => state.searchRes)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleExport = () => {
    const queryCardsStr = localStorage.getItem('eslog_queryCards') || '[]'
    const blob = new Blob([queryCardsStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'query_cards.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        // Validate JSON format
        JSON.parse(content)
        storeQueryCardsStr(content)
      } catch (error) {
        console.error('Invalid JSON file:', error)
        alert('Invalid JSON file format')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">Value Filter</h3>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <input 
            value={valueFilter}
            onChange={(e) => setValueFilter(e.target.value)}
            className="flex-1 bg-zinc-800 text-white pl-2 font-mono text-sm rounded-sm h-8 outline-none" 
            spellCheck="false"
          />
          <button 
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={() => setSearchRes(parseEsLog(searchRes, valueFilter))}
          >
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">Query Cards Management</h3>
        <div className="flex flex-row gap-2">
          <button 
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={handleExport}
          >
            Export Cards
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImport}
            accept=".json"
            className="hidden"
          />
          <button 
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            Import Cards
          </button>
        </div>
      </div>
    </div>
  )
}

export default Config 