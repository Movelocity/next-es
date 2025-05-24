'use client'

import { useState, useEffect } from 'react'
import { useESLogStore } from '@/components/EsLogPanel/store'
import { getWorkspaces, createWorkspace, deleteWorkspace, type Workspace } from '@/utils/workspace'

export default function WorkspaceManager() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [newWorkspaceDescription, setNewWorkspaceDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { currentWorkspace, switchWorkspace } = useESLogStore()

  // 加载工作区列表
  const loadWorkspaces = async () => {
    try {
      const spaces = await getWorkspaces()
      setWorkspaces(spaces)
    } catch (error) {
      console.error('Failed to load workspaces:', error)
    }
  }

  useEffect(() => {
    loadWorkspaces()
  }, [])

  // 处理工作区切换
  const handleSwitchWorkspace = async (workspaceName: string) => {
    if (workspaceName === currentWorkspace) return
    
    setIsLoading(true)
    try {
      await switchWorkspace(workspaceName)
      await loadWorkspaces() // 刷新列表以更新 updatedAt
    } catch (error) {
      console.error('Failed to switch workspace:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 处理创建工作区
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return

    setIsLoading(true)
    try {
      await createWorkspace(newWorkspaceName.trim(), newWorkspaceDescription.trim())
      setNewWorkspaceName('')
      setNewWorkspaceDescription('')
      setShowCreateModal(false)
      await loadWorkspaces()
    } catch (error) {
      console.error('Failed to create workspace:', error)
      alert('创建工作区失败，请检查名称是否已存在')
    } finally {
      setIsLoading(false)
    }
  }

  // 处理删除工作区
  const handleDeleteWorkspace = async (workspaceName: string) => {
    if (workspaceName === 'default') {
      alert('不能删除默认工作区')
      return
    }

    if (!confirm(`确定要删除工作区 "${workspaceName}" 吗？此操作不可恢复。`)) {
      return
    }

    setIsLoading(true)
    try {
      await deleteWorkspace(workspaceName)
      await loadWorkspaces()
      
      // 如果删除的是当前工作区，切换到默认工作区
      if (workspaceName === currentWorkspace) {
        await handleSwitchWorkspace('default')
      }
    } catch (error) {
      console.error('Failed to delete workspace:', error)
      alert('删除工作区失败')
    } finally {
      setIsLoading(false)
    }
  }

  // 格式化时间
  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN')
  }

  return (
    <div className="">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">工作区管理</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          disabled={isLoading}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          新建工作区
        </button>
      </div>

      {/* 工作区列表 */}
      <div className="space-y-2">
        {workspaces.map((workspace) => (
          <div
            key={workspace.name}
            className={`p-3 border rounded cursor-pointer transition-colors ${
              workspace.name === currentWorkspace
                ? 'border-zinc-700 bg-zinc-800'
                : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-700'
            }`}
            onClick={() => handleSwitchWorkspace(workspace.name)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{workspace.name}</h4>
                  {workspace.name === currentWorkspace && (
                    <span className="px-2 py-1 text-xs bg-blue-500 text-white rounded">当前</span>
                  )}
                </div>
                {workspace.description && (
                  <p className="text-sm text-gray-400 mt-1">{workspace.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  更新时间: {formatTime(workspace.updatedAt)}
                </p>
              </div>
              
              {workspace.name !== 'default' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteWorkspace(workspace.name)
                  }}
                  disabled={isLoading}
                  className="ml-2 px-2 py-1 text-sm text-red-500 hover:bg-red-500 hover:text-white rounded disabled:opacity-50"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="mt-4 p-3 bg-zinc-800 rounded text-center text-gray-200">
          正在处理...
        </div>
      )}

      {/* 创建工作区模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-zinc-800 rounded-lg p-6 w-96 max-w-full mx-4 border border-zinc-700">
            <h3 className="text-lg font-semibold mb-4">创建新工作区</h3>
            
            <form onSubmit={handleCreateWorkspace}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  工作区名称 *
                </label>
                <input
                  type="text"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700 bg-zinc-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="请输入工作区名称"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-200 mb-2">
                  描述
                </label>
                <textarea
                  value={newWorkspaceDescription}
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-700 bg-zinc-800 text-white rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="请输入工作区描述（可选）"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !newWorkspaceName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  创建
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setNewWorkspaceName('')
                    setNewWorkspaceDescription('')
                  }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 border border-zinc-700 rounded hover:bg-zinc-700 disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 