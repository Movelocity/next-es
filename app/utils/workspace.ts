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

// 将localStorage数据迁移到默认工作区
// export async function migrateLocalStorageToWorkspace(): Promise<boolean> {
//   if (typeof localStorage === 'undefined') {
//     return false
//   }

//   const LOCAL_STORAGE_KEY = 'eslog'
//   const S_REQ = LOCAL_STORAGE_KEY + '_searchRequest'
//   const S_RES = LOCAL_STORAGE_KEY + '_searchResult'
//   const S_GParam = LOCAL_STORAGE_KEY + '_globalParams'
//   const S_QueryCard = LOCAL_STORAGE_KEY + '_queryCards'
//   const S_ValueFilter = LOCAL_STORAGE_KEY + '_valueFilter'

//   try {
//     const s_gparam = localStorage.getItem(S_GParam)
    
//     const localData: WorkspaceData = {
//       searchReq: localStorage.getItem(S_REQ) || '',
//       gSearchParams: s_gparam ? JSON.parse(s_gparam) : {},
//       queryCardsStr: localStorage.getItem(S_QueryCard) || '[]',
//       valueFilter: localStorage.getItem(S_ValueFilter) || 'param,createTime,message',
//     }

//     // 只有在本地存储有数据时才迁移
//     const hasData = localData.searchReq || 
//                    Object.keys(localData.gSearchParams).length > 0 || 
//                    localData.queryCardsStr !== '[]' || 
//                    localData.valueFilter !== 'param,createTime,message'

//     if (hasData) {
//       const success = await saveWorkspaceData('default', localData)
//       if (success) {
//         console.log('Successfully migrated localStorage data to default workspace')
//         return true
//       }
//     }
    
//     return false
//   } catch (error) {
//     console.error('Error migrating localStorage to workspace:', error)
//     return false
//   }
// } 