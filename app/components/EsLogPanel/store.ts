import { create } from 'zustand'
import { query_value1, result_value1 } from '@/utils/examples'

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
const S_ValueFilter = LOCAL_STORAGE_KEY+'_valueFilter';

const DEFAULT_VALUE_FILTER = 'param,createTime,message'
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


export const useESLogStore = create<ESLogState>((set) => ({
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
    setGlobalSearchParams: (params: Record<string, string>) => set(() => ({ gSearchParams: params })),
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
    setValueFilter: (valueFilter: string) => set(() => ({ valueFilter })), // 设计不完善，暂不写入 localStorage
  
    showModal: false,
    setShowModal: showModal => set(() => ({ showModal })),
}))

