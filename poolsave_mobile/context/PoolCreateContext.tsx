import React, { createContext, useContext, useMemo, useState } from 'react'
import { getTokenAddress, getYieldContractAddress } from '@/utils/tokenAddresses'

export type TokenType = 'USDT' | 'USDC' | 'POL'
export type GroupType = 'closed' | 'open'
export type YieldContractType = 'usdc' | 'usdt' | 'pol'

export type Member = { id: string; handle: string }

export type CreatePoolState = {
  // Basic pool info
  poolName: string
  collectionSymbol: string
  token: TokenType
  groupType: GroupType
  members: Member[]
  
  // Pool configuration
  contributionAmount: number
  maxParticipants: number
  startDateISO: string
  
  // Contract addresses
  depositTokenAddress: string
  yieldContractType: YieldContractType
  yieldContractAddress: string
}

const defaultState: CreatePoolState = {
  // Basic pool info
  poolName: '',
  collectionSymbol: '',
  token: 'USDT',
  groupType: 'closed',
  members: [],
  
  // Pool configuration
  contributionAmount: 500,
  maxParticipants: 5,
  startDateISO: new Date().toISOString(),
  
  // Contract addresses (automatically set based on selections)
  depositTokenAddress: getTokenAddress('USDC'),
  yieldContractType: 'usdc',
  yieldContractAddress: getYieldContractAddress('usdc'),
}

type Ctx = {
  state: CreatePoolState
  setState: React.Dispatch<React.SetStateAction<CreatePoolState>>
  reset: () => void
}

const PoolCreateContext = createContext<Ctx | null>(null)

export const usePoolCreate = (): Ctx => {
  const ctx = useContext(PoolCreateContext)
  if (!ctx) throw new Error('usePoolCreate must be used within PoolCreateProvider')
  return ctx
}

export const PoolCreateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<CreatePoolState>(defaultState)
  const value = useMemo(() => ({ state, setState, reset: () => setState(defaultState) }), [state])
  return <PoolCreateContext.Provider value={value}>{children}</PoolCreateContext.Provider>
}


