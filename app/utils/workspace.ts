// 工作区数据类型定义
export type WorkspaceData = {
  searchReq: string
  gSearchParams: Record<string, string>
  queryCardsStr: string
  valueFilter: string
}

export type Workspace = {
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

// 获取所有工作区列表
export async function getWorkspaces(): Promise<Workspace[]> {
  try {
    const response = await fetch('/api/workspace')
    if (!response.ok) {
      throw new Error('Failed to fetch workspaces')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching workspaces:', error)
    return []
  }
}

// 获取特定工作区的数据
export async function getWorkspaceData(workspaceName: string): Promise<WorkspaceData | null> {
  try {
    const response = await fetch(`/api/workspace?name=${encodeURIComponent(workspaceName)}`)
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error('Failed to fetch workspace data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching workspace data:', error)
    return null
  }
}

// 保存工作区数据
export async function saveWorkspaceData(workspaceName: string, data: WorkspaceData): Promise<boolean> {
  try {
    const response = await fetch(`/api/workspace?name=${encodeURIComponent(workspaceName)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    
    if (!response.ok) {
      throw new Error('Failed to save workspace data')
    }
    
    return true
  } catch (error) {
    console.error('Error saving workspace data:', error)
    return false
  }
}

// 创建新工作区
export async function createWorkspace(name: string, description: string = ''): Promise<Workspace | null> {
  try {
    const response = await fetch('/api/workspace', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, description }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create workspace')
    }
    
    return await response.json()
  } catch (error) {
    console.error('Error creating workspace:', error)
    return null
  }
}

// 删除工作区
export async function deleteWorkspace(workspaceName: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/workspace?name=${encodeURIComponent(workspaceName)}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      throw new Error('Failed to delete workspace')
    }
    
    return true
  } catch (error) {
    console.error('Error deleting workspace:', error)
    return false
  }
}
