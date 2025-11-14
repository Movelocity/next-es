import { create } from 'zustand'
import { query_value1, result_value1 } from '@/utils/examples'
import { getWorkspaceData, saveWorkspaceData, getWorkspaces, type WorkspaceData } from '@/utils/workspace'

type StoreStateValues = {
  searchReq: string
  searchRes: string
  gSearchParams: Record<string, string>
  queryCardsStr: string
  valueFilter: string
}

type StoreState = StoreStateValues & {
  setSearchReq: (searchReq: string) => void
  setSearchRes: (searchRes: string) => void
  storeSearchReq: (text: string) => void
  storeSearchRes: (text: string) => void
  setGlobalSearchParams: (params: Record<string, string>) => void
  setQueryCardsStr: (queryCardsStr: string) => void
  setValueFilter: (valueFilter: string) => void
  setTimeLast24Hours: () => void
}

type WorkspaceState = {
  isSearching: boolean
  setIsSearching: (isSearching: boolean) => void
  cancelSearching: () => void
  searchingControl?: AbortController // abort controller
  setSearchingControl: (searchingControl: AbortController) => void

  currentWorkspace: string
  workspaceDataLoaded: boolean
  setCurrentWorkspace: (workspaceName: string) => void
  switchWorkspace: (workspaceName: string) => Promise<void>
  syncToServer: () => Promise<void>
  loadWorkspaceData: (workspaceName: string) => Promise<void>
  initializeWorkspace: () => Promise<void>
  enableWorkspaceSync: () => void
}

type RuntimeState = {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

type ESLogState = StoreState & RuntimeState & WorkspaceState

const LOCAL_STORAGE_KEY = 'eslog'
const S_REQ = LOCAL_STORAGE_KEY+'_searchRequest'
const S_RES = LOCAL_STORAGE_KEY+'_searchResult'
const S_GParam = LOCAL_STORAGE_KEY+'_globalParams'
const S_QueryCard = LOCAL_STORAGE_KEY+'_queryCards';
const S_ValueFilter = LOCAL_STORAGE_KEY+'_valueFilter';
const S_CurrentWorkspace = LOCAL_STORAGE_KEY+'_currentWorkspace';

const DEFAULT_VALUE_FILTER = 'param,createTime,message'

/**
 * 从 localStorage 加载数据
 */
const loadFromLocalStorage: ()=>StoreStateValues = () => {

  if(typeof localStorage == 'undefined') return {searchReq: '',searchRes: '',gSearchParams: {}, queryCardsStr: '[]', valueFilter: DEFAULT_VALUE_FILTER}
  const s_gparam = localStorage.getItem(S_GParam)

  return {
    searchReq: localStorage.getItem(S_REQ) || query_value1,
    searchRes: localStorage.getItem(S_RES) || result_value1,
    gSearchParams: s_gparam? JSON.parse(s_gparam) : {"$开始时间": "2024-10-13 00:00:00", "$结束时间": "2024-10-14 00:00:00"}, 
    queryCardsStr: localStorage.getItem(S_QueryCard) || '[]',
    valueFilter: localStorage.getItem(S_ValueFilter) || DEFAULT_VALUE_FILTER
  }
};

/**
 * 获取初始工作区名称
 * 优先级顺序：
 * 1. localStorage 中保存的工作区
 * 2. 如果没有保存，返回空字符串（将在组件初始化时从服务器获取第一个工作区）
 */
const getInitialWorkspace = (): string => {
  if (typeof localStorage === 'undefined') {
    return '' // SSR 环境，返回空字符串
  }
  return localStorage.getItem(S_CurrentWorkspace) || ''
}

/**
 * 使用建议
 * 如果你在控制台看到以下消息之一：
 * Workspace 'xxx' not found on server, using local data without enabling sync
 * Call enableWorkspaceSync() if you want to sync current local data to server
 * 可以手动同步: useESLogStore.getState().enableWorkspaceSync()
 */
export const useESLogStore = create<ESLogState>((set, get) => ({
    ...loadFromLocalStorage(),

    /** 搜索状态控制 */
    isSearching: false,
    setIsSearching: (isSearching: boolean) => set(() => ({ isSearching })),
    cancelSearching: () => {
      get().searchingControl?.abort?.();
      set(() => ({ isSearching: false, searchingControl: undefined }))
    },
    setSearchingControl: (searchingControl: AbortController) => set(() => ({ searchingControl })),

    currentWorkspace: getInitialWorkspace(), // 从 localStorage 恢复上次选择的工作区
    workspaceDataLoaded: false,

    setSearchReq: searchReq => set(() => ({ searchReq })),
    setSearchRes: searchRes => set(() => ({ searchRes })),
    
    storeSearchReq: (searchReq: string) => {
      set((state) => {
        const newState = { ...state, searchReq };
        localStorage.setItem(S_REQ, searchReq)
        return newState;
      });
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
    },
    storeSearchRes: (searchRes: string) => {  //这段文本太长，只存本地，不用保存到服务器
      localStorage.setItem(S_RES, searchRes)
    },
    setGlobalSearchParams: (params: Record<string, string>) => {
      set((state) => {
        const newState = { ...state, gSearchParams: params };
        localStorage.setItem(S_GParam, JSON.stringify(params))
        return newState;
      });
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
    },
    setQueryCardsStr: (queryCardsStr) =>{
      set((state) => {
        const newState = { ...state, queryCardsStr };
        localStorage.setItem(S_QueryCard, queryCardsStr)
        return newState;
      });
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
    },
    setValueFilter: (valueFilter: string) => {
      set(() => ({ valueFilter }))
      // 同步更新 localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(S_ValueFilter, valueFilter)
      }
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
    },

    setTimeLast24Hours: () => {
      // gSearchParams: s_gparam? JSON.parse(s_gparam) : {"$开始时间": "2024-10-13 00:00:00", "$结束时间": "2024-10-14 00:00:00"}, 
      // 当地时间
      const now = new Date()
      const startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const endTime = new Date()
      const startTimeStr = startTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      const endTimeStr = endTime.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
      get().setGlobalSearchParams({"$开始时间": startTimeStr, "$结束时间": endTimeStr})
    },

    // 工作区相关方法
    setCurrentWorkspace: (workspaceName: string) => {
      set(() => ({ currentWorkspace: workspaceName }))
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(S_CurrentWorkspace, workspaceName)
      }
    },

    switchWorkspace: async (workspaceName: string) => {
      try {
        // 先保存当前工作区的数据
        await get().syncToServer()
        
        // 切换到新工作区
        get().setCurrentWorkspace(workspaceName)
        
        // 加载新工作区的数据
        await get().loadWorkspaceData(workspaceName)
      } catch (error) {
        console.error('Error switching workspace:', error)
      }
    },

    loadWorkspaceData: async (workspaceName: string) => {
      try {
        const data = await getWorkspaceData(workspaceName)
        
        if (data) {
          set({
            searchReq: data.searchReq,
            gSearchParams: data.gSearchParams,
            queryCardsStr: data.queryCardsStr,
            valueFilter: data.valueFilter,
            workspaceDataLoaded: true
          })
          
          // 同步更新 localStorage（可选，用于离线访问）
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem(S_REQ, data.searchReq)
            localStorage.setItem(S_GParam, JSON.stringify(data.gSearchParams))
            localStorage.setItem(S_QueryCard, data.queryCardsStr)
            localStorage.setItem(S_ValueFilter, data.valueFilter)
          }
          console.log(`Loaded workspace '${workspaceName}' from server`)
        } else {
          // 如果工作区数据不存在，不要立即设置workspaceDataLoaded为true
          // 避免将本地默认数据推送到服务器覆盖可能存在的数据
          const defaultData = loadFromLocalStorage()
          set({ ...defaultData })
          console.log(`Workspace '${workspaceName}' not found on server, using local data without enabling sync`)
          console.log('Call enableWorkspaceSync() if you want to sync current local data to server')
        }
      } catch (error) {
        console.error('Error loading workspace data:', error)
        // 出错时也不要设置workspaceDataLoaded为true，避免推送可能有问题的数据
        console.log('Failed to load workspace data, sync disabled to prevent data loss')
        console.log('Call enableWorkspaceSync() if you want to sync current local data to server')
      }
    },

    /**
     * 初始化工作区
     * 工作区选择优先级：
     * 1. 使用 localStorage 中保存的工作区（已在初始化时加载）
     * 2. 如果 localStorage 为空，从服务器获取第一个可用工作区
     * 3. 如果服务器没有工作区，保持空字符串（需要用户创建）
     */
    initializeWorkspace: async () => {
      const currentWorkspace = get().currentWorkspace

      // 如果已有工作区名称，尝试加载其数据
      if (currentWorkspace) {
        console.log(`Initializing with saved workspace: '${currentWorkspace}'`)
        await get().loadWorkspaceData(currentWorkspace)
        
        // 检查加载是否成功，如果失败则回退到第一个可用工作区
        if (!get().workspaceDataLoaded) {
          console.log(`Saved workspace '${currentWorkspace}' not found, falling back to first available workspace`)
          const workspaces = await getWorkspaces()
          if (workspaces.length > 0) {
            const firstWorkspace = workspaces[0].name
            get().setCurrentWorkspace(firstWorkspace)
            await get().loadWorkspaceData(firstWorkspace)
          } else {
            console.log('No workspaces available on server')
          }
        }
        return
      }

      // 如果没有保存的工作区，获取第一个可用工作区
      console.log('No saved workspace found, fetching first available workspace from server')
      const workspaces = await getWorkspaces()
      
      if (workspaces.length > 0) {
        const firstWorkspace = workspaces[0].name
        console.log(`Initializing with first workspace: '${firstWorkspace}'`)
        get().setCurrentWorkspace(firstWorkspace)
        await get().loadWorkspaceData(firstWorkspace)
      } else {
        console.log('No workspaces available on server. Please create a workspace to get started.')
      }
    },

    syncToServer: async () => {
      const state = get()
      if (!state.workspaceDataLoaded) {
        console.log('Sync skipped: workspace data not loaded')
        return
      }

      const data: WorkspaceData = {
        searchReq: state.searchReq,
        gSearchParams: state.gSearchParams,
        queryCardsStr: state.queryCardsStr,
        valueFilter: state.valueFilter
      }

      try {
        await saveWorkspaceData(state.currentWorkspace, data)
        console.log(`Synced data to workspace '${state.currentWorkspace}'`)
      } catch (error) {
        console.error('Error syncing to server:', error)
      }
    },
  
    showModal: false,
    setShowModal: showModal => set(() => ({ showModal })),

    enableWorkspaceSync: () => {
      set({ workspaceDataLoaded: true })
      console.log('Workspace sync enabled - future changes will be synced to server')
    },
}))

