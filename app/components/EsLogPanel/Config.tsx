import React, { useRef, useState } from 'react'
import { useESLogStore, useStore } from './store'
import { parseEsLog } from '@/utils/text_process'
import { clearAllServiceWorkers } from '@/utils/serviceWorker/swRegistration'

const Config = () => {
  const eslogStore = useESLogStore()
  const { valueFilter, setSearchRes, storeQueryCardsStr, storeGlobalSearchParams, setValueFilter } = eslogStore.getState()
  const searchRes = useStore(state => state.searchRes)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [valueFilterEdit, setValueFilterEdit] = useState(valueFilter)
  const handleExport = () => {
    const queryCardsStr = localStorage.getItem('eslog_queryCards') || '[]'
    const globalParamsStr = localStorage.getItem('eslog_globalParams') || '{}'

    // Create a combined data object
    const exportData = {
      queryCards: JSON.parse(queryCardsStr),
      globalParams: JSON.parse(globalParamsStr)
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'eslog_config.json'
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
        const importedData = JSON.parse(content)

        // Check if it's the combined format
        if (importedData.queryCards && importedData.globalParams) {
          // Import query cards
          storeQueryCardsStr(JSON.stringify(importedData.queryCards))

          // Import global params
          storeGlobalSearchParams(importedData.globalParams)

          alert('Successfully imported configuration')
        }
        // Check if it's the old format (just query cards)
        else if (Array.isArray(importedData)) {
          storeQueryCardsStr(content)
          alert('Successfully imported query cards')
        }
        else {
          alert('Invalid configuration file format')
        }
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
            value={valueFilterEdit}
            onChange={(e) => setValueFilterEdit(e.target.value)}
            className="flex-1 bg-zinc-800 text-white pl-2 font-mono text-sm rounded-sm h-8 outline-none"
            spellCheck="false"
          />

          <button
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={() => {
              setValueFilter(valueFilterEdit)
              setSearchRes(parseEsLog(searchRes, valueFilterEdit))
            }}
          >
            Filter
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">配置管理</h3>
        <div className="flex flex-row gap-2">
          <button
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={handleExport}
          >
            导出配置
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
            导入配置
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          导出/导入当前工作区的查询语句和全局参数
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">开发工具</h3>
        <div className="flex flex-row gap-2">
          <button
            className="px-3 h-8 bg-red-900 hover:bg-red-800 rounded-sm text-sm"
            onClick={() => {
              if (confirm("This will clear all service workers and reload the page. Continue?")) {
                clearAllServiceWorkers();
              }
            }}
          >
            清除 Service Worker 缓存
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">代码更新后页面索引无法更新时使用</p>
      </div>
    </div>
  )
}

export default Config