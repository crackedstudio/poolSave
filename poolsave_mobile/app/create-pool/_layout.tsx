import React from 'react'
import { Stack } from 'expo-router'
import { PoolCreateProvider } from '@/context/PoolCreateContext'

export default function CreatePoolLayout() {
  return (
    <PoolCreateProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#1A1A1A' } }} />
    </PoolCreateProvider>
  )
}


