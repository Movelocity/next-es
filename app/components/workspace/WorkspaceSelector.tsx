'use client'

import { useState, useEffect } from 'react'
import { useESLogStore } from '@/components/EsLogPanel/store'
import { getWorkspaces, type Workspace } from '@/utils/workspace'

interface WorkspaceSelectorProps {
  className?: string
}

export default function WorkspaceSelector({ className = '' }: WorkspaceSelectorProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const { currentWorkspace, switchWorkspace, initializeWorkspace } = useESLogStore()

  // 加载工作区列表
  const loadWorkspaces = async () => {
    try {
      const spaces = await getWorkspaces()
      setWorkspaces(spaces)
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    }
  }

  // 初始化工作区（仅在客户端执行一次）
  useEffect(() => {
    const init = async () => {
      await initializeWorkspace()
      await loadWorkspaces()
    }
    init()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 标记组件已水合，避免 SSR 不匹配
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // 处理工作区切换
  const handleSwitchWorkspace = async (workspaceName: string) => {
    if (workspaceName === currentWorkspace) {
      setIsOpen(false)
      return
    }
    
    setIsLoading(true)
    setIsOpen(false)
    
    try {
      await switchWorkspace(workspaceName)
      await loadWorkspaces() // 刷新列表
    } catch (error) {
      console.error('Failed to switch workspace:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* 当前工作区显示 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className="flex items-center gap-2 p-1 disabled:opacity-50"
      >
        <span className="text-sm text-gray-200">工作区</span>
        <span className="font-medium text-white">{isHydrated ? (currentWorkspace || '加载中...') : ''}</span>
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
        
        {isLoading && (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        )}
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 下拉选项 */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-zinc-900 text-white rounded-md border border-zinc-700 z-20 max-h-60 overflow-y-auto">
            <div className="p-2">
              <div className="text-xs mb-2 px-2">选择工作区</div>
              
              {workspaces.map((workspace) => (
                <button
                  key={workspace.name}
                  onClick={() => handleSwitchWorkspace(workspace.name)}
                  className={`w-full text-left px-3 py-2 rounded hover:bg-zinc-800 transition-colors ${
                    workspace.name === currentWorkspace ? 'bg-black' : 'text-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{workspace.name}</span>
                        {workspace.name === currentWorkspace && (
                          <span className="text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded">当前</span>
                        )}
                      </div>
                      {workspace.description && (
                        <div className="text-xs text-gray-400 mt-0.5 truncate">
                          {workspace.description}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
              
              {workspaces.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 text-center">
                  暂无工作区
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 