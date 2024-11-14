'use client'
import { createContext, useRef } from 'react'
import { createESLogStore } from './store'

type ESLogStore = ReturnType<typeof createESLogStore>
export const ESLogContext = createContext<ESLogStore | null>(null)

type ESLogContextProviderProps = {
  children: React.ReactNode
}

export const ESLogContextProvider = ({ children }: ESLogContextProviderProps) => {
  const storeRef = useRef<ESLogStore>()

  if (!storeRef.current)
    storeRef.current = createESLogStore()

  return (
    <ESLogContext.Provider value={storeRef.current}>
      {children}
    </ESLogContext.Provider>
  )
}
