import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { usePoolCreate } from '@/context/PoolCreateContext'

export default function AddMembers() {
  const { state, setState } = usePoolCreate()
  const [handle, setHandle] = useState('')
  const [maxParticipants, setMaxParticipants] = useState(String(state.maxParticipants))

  const add = () => {
    if (!handle.trim()) return
    setState((s) => ({ ...s, members: [...s.members, { id: String(Date.now()), handle: handle.trim() }] }))
    setHandle('')
  }

  const proceed = () => {
    const max = parseInt(maxParticipants || '5', 10)
    setState((s) => ({ ...s, maxParticipants: isNaN(max) ? 5 : max }))
    router.push('/create-pool/setup')
  }

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="p-[24px]" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex flex-row items-center justify-between mb-6">
          <TouchableOpacity className="w-[44px] h-[44px] rounded-lg bg-bg items-center justify-center" onPress={() => router.back()}>
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-[22px] font-bold">ADD MEMBERS</Text>
          <View className="w-[44px]" />
        </View>

        <View className="bg-bg rounded-2xl p-[20px]">
          <Text className="text-white text-[18px] font-extrabold mb-3">POOL SETTINGS</Text>
          <Text className="text-text mb-2">MAX PARTICIPANTS</Text>
          <View className="rounded-xl border border-secondary px-3 mb-4">
            <TextInput 
              placeholder="5" 
              placeholderTextColor="#AAAAAA" 
              className="text-white h-[48px]" 
              value={maxParticipants} 
              onChangeText={setMaxParticipants}
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* <View className="bg-bg rounded-2xl p-[20px] mt-5">
          <Text className="text-white text-[18px] font-extrabold mb-3">ADD MEMBER</Text>
          <Text className="text-text mb-2">WALLET ADDRESS OR USERNAME</Text>
          <View className="rounded-xl border border-secondary px-3 mb-3">
            <TextInput placeholder="0x... or @username" placeholderTextColor="#AAAAAA" className="text-white h-[48px]" value={handle} onChangeText={setHandle} />
          </View>
          <TouchableOpacity onPress={add} className="bg-secondary rounded-xl h-[48px] items-center justify-center">
            <Text className="text-black font-extrabold">Add</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-bg rounded-2xl p-[20px] mt-5">
          <Text className="text-white text-[18px] font-extrabold mb-3">CURRENT MEMBERS ({state.members.length})</Text>
          <View className="gap-y-2">
            {state.members.map((m) => (
              <View key={m.id} className="flex flex-row justify-between items-center bg-black rounded-xl p-[14px]">
                <Text className="text-white">{m.handle}</Text>
                <TouchableOpacity onPress={() => setState((s) => ({ ...s, members: s.members.filter(x => x.id !== m.id) }))}>
                  <Text className="text-accent">Remove</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View> */}

        <TouchableOpacity onPress={proceed} className="bg-secondary rounded-2xl mt-8 h-[56px] items-center justify-center">
          <Text className="text-black text-[18px] font-extrabold">Finalize</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


