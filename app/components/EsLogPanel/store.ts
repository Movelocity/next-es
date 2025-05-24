import { create } from 'zustand'
import { query_value1, result_value1 } from '@/utils/examples'
import { getWorkspaceData, saveWorkspaceData, migrateLocalStorageToWorkspace, type WorkspaceData } from '@/utils/workspace'

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
  storeGlobalSearchParams: (params: Record<string, string>) => void
  storeQueryCardsStr: (queryCardsStr: string) => void
  setValueFilter: (valueFilter: string) => void
}

type WorkspaceState = {
  currentWorkspace: string
  workspaceDataLoaded: boolean
  setCurrentWorkspace: (workspaceName: string) => void
  switchWorkspace: (workspaceName: string) => Promise<void>
  syncToServer: () => Promise<void>
  loadWorkspaceData: (workspaceName: string) => Promise<void>
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
 * 获取当前工作区名称
 */
const getCurrentWorkspace = (): string => {
  // 在服务端或初始化时总是返回 'default' 避免SSR错误
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return 'default'
  }
  return localStorage.getItem(S_CurrentWorkspace) || 'default'
}


export const useESLogStore = create<ESLogState>((set, get) => ({
    ...loadFromLocalStorage(),
    currentWorkspace: 'default', // 初始化时总是使用 'default' 避免 SSR 不匹配
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
      set((state) => {
        const newState = { ...state, searchRes };
        localStorage.setItem(S_RES, searchRes)
        return newState;
      });
    },
    setGlobalSearchParams: (params: Record<string, string>) => set(() => ({ gSearchParams: params })),
    storeGlobalSearchParams: (params)=> {
      set((state) => {
        const newState = { ...state, gSearchParams: params };
        localStorage.setItem(S_GParam, JSON.stringify(params))
        return newState;
      });
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
    },
    storeQueryCardsStr: (queryCardsStr) =>{
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
      // 异步同步到服务器
      setTimeout(() => get().syncToServer(), 100)
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
        } else {
          // 如果工作区数据不存在，则使用默认值
          const defaultData = loadFromLocalStorage()
          set({ ...defaultData, workspaceDataLoaded: true })
        }
      } catch (error) {
        console.error('Error loading workspace data:', error)
        set({ workspaceDataLoaded: true })
      }
    },

    syncToServer: async () => {
      const state = get()
      if (!state.workspaceDataLoaded) return

      const data: WorkspaceData = {
        searchReq: state.searchReq,
        gSearchParams: state.gSearchParams,
        queryCardsStr: state.queryCardsStr,
        valueFilter: state.valueFilter
      }

      try {
        await saveWorkspaceData(state.currentWorkspace, data)
      } catch (error) {
        console.error('Error syncing to server:', error)
      }
    },
  
    showModal: false,
    setShowModal: showModal => set(() => ({ showModal })),
}))

// 初始化：迁移localStorage数据到默认工作区并加载当前工作区数据
if (typeof window !== 'undefined') {
  const store = useESLogStore.getState()
  
  // 设置正确的当前工作区（从 localStorage 读取）
  const actualCurrentWorkspace = getCurrentWorkspace()
  store.setCurrentWorkspace(actualCurrentWorkspace)
  
  // 如果是第一次使用工作区功能，先迁移数据
  migrateLocalStorageToWorkspace().then(() => {
    // 加载当前工作区的数据
    store.loadWorkspaceData(actualCurrentWorkspace)
  })
}

