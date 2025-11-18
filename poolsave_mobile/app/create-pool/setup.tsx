import React, { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { usePoolCreate } from '@/context/PoolCreateContext'
import { useAegis } from '@cavos/aegis'
import { cairo } from 'starknet'
import { CONTRACTS } from '../config/config'

export default function RotationSetup() {
  const { state, setState, reset } = usePoolCreate()
  const [contributionAmount, setContributionAmount] = useState(String(state.contributionAmount))
  const [startDate, setStartDate] = useState(state.startDateISO.slice(0, 10))

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { aegisAccount } = useAegis();

  const createPool = async () => {
    const amount = parseInt(contributionAmount || '0', 10)
    setState((s) => ({ ...s, contributionAmount: isNaN(amount) ? 0 : amount, startDateISO: new Date(startDate).toISOString() }))

    // Validation
    if (!aegisAccount.isConnected) {
      alert('Please connect your wallet first')
      return;
    }

    if (!state.poolName.trim()) {
      alert('Please enter a pool name')
      return;
    }

    if (!state.collectionSymbol.trim()) {
      alert('Please enter a collection symbol')
      return;
    }

    if (amount <= 0) {
      alert('Please enter a valid contribution amount')
      return;
    }

    if (state.maxParticipants <= 0) {
      alert('Please set a valid number of participants')
      return;
    }

    setIsLoading(true);

    try {
       const result = await aegisAccount.execute(
        CONTRACTS.saveQuest,
        "create_pool",
        [
          cairo.felt(state.poolName),
          cairo.felt(state.collectionSymbol),
          cairo.uint256(state.contributionAmount),
          state.maxParticipants,
          state.depositTokenAddress,
          state.yieldContractAddress,
          Math.floor(new Date(state.startDateISO).getTime() / 1000)
        ],
      );
      
      console.log('Transaction successful:', result);
      alert('Pool created successfully!')
      
      // Navigate to success page or reset form
      router.replace({ pathname: '/pool/overview', params: { name: state.poolName, token: state.token, members: String(state.members.length || 1) } })
      reset()
      
    } catch (error) {
        console.error("Error creating pool:", error);
        alert('Failed to create pool. Please try again.')
    } finally {
        setIsLoading(false);
    }
  }


  const create = () => {
    const amount = parseInt(contributionAmount || '0', 10)
    setState((s) => ({ ...s, contributionAmount: isNaN(amount) ? 0 : amount, startDateISO: new Date(startDate).toISOString() }))
    // Here you would call the contract/wallet flow, then show overview
    alert(state)
    // router.replace({ pathname: '/pool/overview', params: { name: state.poolName, token: state.token, members: String(state.members.length || 1) } })
    // reset()
  }

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="p-[24px]" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex flex-row items-center justify-between mb-6">
          <TouchableOpacity className="w-[44px] h-[44px] rounded-lg bg-bg items-center justify-center" onPress={() => router.back()}>
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-[22px] font-bold">ROTATION SETUP</Text>
          <View className="w-[44px]" />
        </View>

        <View className="bg-bg rounded-2xl p-[20px]">
          <Text className="text-white text-[18px] font-extrabold mb-4">POOL SETTINGS</Text>
          <View className="gap-y-4">
            <View>
              <Text className="text-text mb-2">Contribution Amount (USD)</Text>
              <View className="rounded-xl border border-secondary px-3">
                <TextInput value={contributionAmount} onChangeText={setContributionAmount} keyboardType="number-pad" placeholder="500" placeholderTextColor="#AAAAAA" className="text-white h-[48px]" />
              </View>
            </View>
            <View>
              <Text className="text-text mb-2">Start Date</Text>
              <View className="rounded-xl border border-secondary px-3">
                <TextInput value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" placeholderTextColor="#AAAAAA" className="text-white h-[48px]" />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity 
          onPress={createPool} 
          disabled={isLoading}
          className={`rounded-2xl mt-8 h-[56px] items-center justify-center flex-row ${
            isLoading 
              ? 'bg-gray-500' 
              : 'bg-secondary'
          }`}
        >
          {isLoading ? (
            <>
              <ActivityIndicator size="small" color="#000000" style={{ marginRight: 8 }} />
              <Text className="text-black text-[18px] font-extrabold">CREATING POOL...</Text>
            </>
          ) : (
            <Text className="text-black text-[18px] font-extrabold">✓ CREATE POOL</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


