import React, { useRef, useState } from 'react'
import { useESLogStore } from '@/store/esLogStore'
import { parseEsLog } from '@/utils/text_process'
import { clearAllServiceWorkers } from '@/utils/serviceWorker/swRegistration'
import WorkspaceManager from '@/components/workspace/WorkspaceManager'

const Config = () => {
  const { searchRes, valueFilter, setSearchRes, setQueryCardsStr, setGlobalSearchParams, setValueFilter, currentWorkspace } = useESLogStore();
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [valueFilterEdit, setValueFilterEdit] = useState(valueFilter)
  
  const handleExport = () => {
    const queryCardsStr = localStorage.getItem('eslog_queryCards') || '[]'
    const globalParamsStr = localStorage.getItem('eslog_globalParams') || '{}'

    // Create a combined data object
    const exportData = {
      queryCards: JSON.parse(queryCardsStr),
      globalParams: JSON.parse(globalParamsStr),
      workspace: currentWorkspace
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `eslog_config_${currentWorkspace}.json`
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
          setQueryCardsStr(JSON.stringify(importedData.queryCards))

          // Import global params
          setGlobalSearchParams(importedData.globalParams)

          const workspaceInfo = importedData.workspace ? ` (来自工作区: ${importedData.workspace})` : ''
          alert(`成功导入配置到当前工作区 "${currentWorkspace}"${workspaceInfo}`)
        }
        // Check if it's the old format (just query cards)
        else if (Array.isArray(importedData)) {
          setQueryCardsStr(content)
          alert('成功导入查询卡片')
        }
        else {
          alert('无效的配置文件格式')
        }
      } catch (error) {
        console.error('Invalid JSON file:', error)
        alert('无效的 JSON 文件格式')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="w-full h-full p-4 flex flex-col gap-4 overflow-y-auto">
      {/* 工作区管理 */}
      <div className="flex flex-col gap-2">
        <WorkspaceManager />
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">值过滤器</h3>
        <div className="flex flex-row justify-between items-center w-full gap-2">
          <input
            value={valueFilterEdit}
            onChange={(e) => setValueFilterEdit(e.target.value)}
            className="flex-1 bg-zinc-800 text-white pl-2 font-mono text-sm rounded-sm h-8 outline-none"
            spellCheck="false"
            placeholder="param,createTime,message"
          />

          <button
            className="px-3 h-8 bg-zinc-800 hover:bg-zinc-700 rounded-sm text-sm"
            onClick={() => {
              setValueFilter(valueFilterEdit)
              setSearchRes(parseEsLog(searchRes, valueFilterEdit))
            }}
          >
            应用
          </button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">
          指定要显示的字段，用逗号分隔
        </p>
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
          导出/导入当前工作区 &quot;{currentWorkspace}&quot; 的查询语句和全局参数
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-neutral-300">开发工具</h3>
        <div className="flex flex-row gap-2">
          <button
            className="px-3 h-8 bg-red-900 hover:bg-red-800 rounded-sm text-sm"
            onClick={() => {
              if (confirm("这将清除所有 Service Worker 缓存并重新加载页面。是否继续？")) {
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