import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

export default function PoolOverview() {
  const params = useLocalSearchParams<{ id?: string; name?: string; token?: string; members?: string }>()
  const title = params.name || 'My Savings Pool'
  const token = params.token || 'USDT'
  const membersCount = Number(params.members || 4)

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="p-[24px]" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex flex-row items-center justify-between mb-6">
          <TouchableOpacity className="w-[44px] h-[44px] rounded-lg bg-bg items-center justify-center" onPress={() => router.back()}>
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-[22px] font-bold">YOUR POOL</Text>
          <View className="w-[44px]" />
        </View>

        <View className="bg-secondary rounded-2xl p-[24px]">
          <Text className="text-black text-[16px] font-extrabold">POWERED BY</Text>
          <Text className="text-black text-[28px] font-extrabold mt-1">POLfi</Text>
          <Text className="text-black/80 mt-1">On Polygon</Text>
        </View>

        <View className="mt-6">
          <View className="flex-row items-end justify-between">
            <Text className="text-white text-[20px] font-extrabold">POOL MEMBERS</Text>
            <TouchableOpacity>
              <Text className="text-secondary font-extrabold">VIEW ALL</Text>
            </TouchableOpacity>
          </View>

          <View className="mt-4 gap-y-3">
            <View className="bg-bg rounded-2xl p-[16px] flex-row items-center justify-between">
              <View>
                <Text className="text-white text-[16px] font-extrabold">You</Text>
                <Text className="text-text">Pool Creator</Text>
              </View>
              <View className="bg-secondary px-3 py-2 rounded-lg"><Text className="text-black font-extrabold">ADMIN</Text></View>
            </View>

            {["@alex_crypto","@sarah_defi","@mike_pol"].slice(0, Math.max(0, membersCount-1)).map((h) => (
              <View key={h} className="bg-bg rounded-2xl p-[16px] flex-row items-center justify-between">
                <View>
                  <Text className="text-white text-[16px] font-extrabold">{h}</Text>
                  <Text className="text-text">Pending invite</Text>
                </View>
                <Text className="text-accent text-[18px]">×</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-bg rounded-2xl p-[20px] mt-8">
          <Text className="text-white text-[18px] font-extrabold mb-3">ADD MORE MEMBERS</Text>
          <View className="gap-y-3">
            <TouchableOpacity className="bg-black rounded-xl p-[16px]"><Text className="text-white font-extrabold">SHARE INVITE LINK</Text></TouchableOpacity>
            <TouchableOpacity className="bg-black rounded-xl p-[16px]"><Text className="text-white font-extrabold">SHOW QR CODE</Text></TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity className="bg-secondary rounded-2xl mt-8 h-[56px] items-center justify-center" onPress={() => router.replace('/(tabs)/savings')}>
          <Text className="text-black text-[18px] font-extrabold">GO TO SAVINGS</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


