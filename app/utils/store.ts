import { useContext } from 'react'
import {
  useStore as useZustandStore,
} from 'zustand'
import { createStore } from 'zustand/vanilla'
import { ESLogContext } from './context'
import { query_value1, result_value1 } from './examples'

type StoreStateValues = {
  searchReq: string
  searchRes: string
  gSearchParams: {}
  queryCardsStr: string
}

type StoreState = StoreStateValues & {
  setSearchReq: (searchReq: string) => void
  setSearchRes: (searchRes: string) => void
  storeSearchReq: (text: string) => void
  storeSearchRes: (text: string) => void
  setGlobalSearchParams: (params: {}) => void
  storeGlobalSearchParams: (params: {}) => void
  storeQueryCardsStr: (queryCardsStr: string) => void
}

type RuntimeState = {
  showModal: boolean
  setShowModal: (showModal: boolean) => void
}

type ESLogState = StoreState & RuntimeState

const LOCAL_STORAGE_KEY = 'eslog'
const S_REQ = LOCAL_STORAGE_KEY+'_searchRequest'
const S_RES = LOCAL_STORAGE_KEY+'_searchResult'
const S_GParam = LOCAL_STORAGE_KEY+'_globalParams'
const S_QueryCard = LOCAL_STORAGE_KEY+'_queryCards';
const loadFromLocalStorage: ()=>StoreStateValues = () => {
  if(typeof localStorage == 'undefined') return {searchReq: '',searchRes: '',gSearchParams: {}, queryCardsStr: '[]'}
  const s_gparam = localStorage.getItem(S_GParam)
  return {
    searchReq: localStorage.getItem(S_REQ) || query_value1,
    searchRes: localStorage.getItem(S_RES) || result_value1,
    gSearchParams: s_gparam? JSON.parse(s_gparam) : {"$开始时间": "2024-10-13 00:00:00", "$结束时间": "2024-10-14 00:00:00"}, 
    queryCardsStr: localStorage.getItem(S_QueryCard) || '[]'
  }
};

export const createESLogStore = () => {
  return createStore<ESLogState>((set) => {
    const initialState: StoreState =  {
      ...loadFromLocalStorage(),

      setSearchReq: searchReq => set(() => ({ searchReq })),
      setSearchRes: searchRes => set(() => ({ searchRes })),
      
      storeSearchReq: (searchReq: string) => {
        set((state) => {
          const newState = { ...state, searchReq };
          localStorage.setItem(S_REQ, searchReq)
          return newState;
        });
      },
      storeSearchRes: (searchRes: string) => {
        set((state) => {
          const newState = { ...state, searchRes };
          localStorage.setItem(S_RES, searchRes)
          return newState;
        });
      },
      setGlobalSearchParams: (params: {}) => set(() => ({ gSearchParams: params })),
      storeGlobalSearchParams: (params)=> {
        set((state) => {
          const newState = { ...state, gSearchParams: params };
          localStorage.setItem(S_GParam, JSON.stringify(params))
          return newState;
        });
      },
      storeQueryCardsStr: (queryCardsStr) =>{
        set((state) => {
          const newState = { ...state, queryCardsStr };
          localStorage.setItem(S_QueryCard, queryCardsStr)
          return newState;
        });
      },
    }
    const runtimeState: RuntimeState = {
      showModal: false,
      setShowModal: showModal => set(() => ({ showModal })),
    }

    return {
      ...initialState,
      ...runtimeState
    }
  })
}

/** 用于获取 state。 state 更新时会触发所在组件的更新 */
export function useStore<T>(selector: (state: ESLogState) => T): T {
  const store = useContext(ESLogContext)
  if (!store)
    throw new Error('Missing ESLogContext.Provider in the tree')
  return useZustandStore(store, selector)
}

/**
 * 用于获取 value。
 * value 不更新，什么时候初始化就是时候的值,
 * 可以便捷地得到 store 内的值而不用订阅更新，即“随用随取”，避免不必要的重渲染
*/
export const useESLogStore = () => {
  return useContext(ESLogContext)!
}
