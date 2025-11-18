import React, { useEffect, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { usePoolCreate, TokenType, GroupType, YieldContractType } from '@/context/PoolCreateContext'
import { getTokenAddress, getYieldContractAddress } from '@/utils/tokenAddresses'
import useFetch from '@/hooks/useFetch'
import { API } from '../config/config'

export default function CreatePoolInfo() {
  const { state, setState } = usePoolCreate()
  const [name, setName] = useState(state.poolName)
  const [collectionSymbol, setCollectionSymbol] = useState(state.collectionSymbol)
  const [token, setToken] = useState<TokenType>(state.token)
  const [groupType, setGroupType] = useState<GroupType>(state.groupType)
  const [yieldContractType, setYieldContractType] = useState<YieldContractType>(state.yieldContractType)
  const [yeildContract, setYeildContract] = useState('');


  const {data: yeildPools, error, loading} = useFetch(API.markets);
 
  // Normalize markets from API (handles different response shapes)
  const markets: any[] = React.useMemo(() => {
    try {
      if (!yeildPools) return [];
      if (Array.isArray(yeildPools)) return yeildPools;
      if (Array.isArray(yeildPools?.markets)) return yeildPools.markets;
      if (Array.isArray(yeildPools?.data?.markets)) return yeildPools.data.markets;
      if (Array.isArray(yeildPools?.data)) return yeildPools.data;
      if (Array.isArray(yeildPools?.items)) return yeildPools.items;
      return [];
    } catch (_) {
      return [];
    }
  }, [yeildPools]);


  const handleTokenChange = (selectedToken: TokenType) => {
    setToken(selectedToken)
    setState((s) => ({ 
      ...s, 
      token: selectedToken,
      depositTokenAddress: getTokenAddress(selectedToken)
    }))
  }

  const handleYieldContractChange = (selectedYieldContract: YieldContractType) => {
    setYieldContractType(selectedYieldContract)
    setState((s) => ({ 
      ...s, 
      yieldContractType: selectedYieldContract,
      yieldContractAddress: getYieldContractAddress(selectedYieldContract)
    }))
  }

  const proceed = () => {
    setState((s) => ({ 
      ...s, 
      poolName: name.trim(), 
      collectionSymbol: collectionSymbol.trim(),
      token, 
      groupType,
      yieldContractType,
      yieldContractAddress: getYieldContractAddress(yieldContractType)
      
      // getYieldContractAddress(yieldContractType)
    }))
    router.push('/create-pool/members')
  }

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="p-[24px]" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex flex-row items-center justify-between mb-6">
          <TouchableOpacity className="w-[44px] h-[44px] rounded-lg bg-bg items-center justify-center" onPress={() => router.back()}>
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-[22px] font-bold">CREATE POOL</Text>
          <View className="w-[44px]" />
        </View>

        <View className="bg-bg rounded-2xl p-[20px]">
          <Text className="text-white text-[18px] font-extrabold mb-3">POOL DETAILS</Text>
          <Text className="text-text mb-2">POOL NAME</Text>
          <View className="rounded-xl border border-secondary px-3 mb-4">
            <TextInput
              placeholder="Enter pool name..."
              placeholderTextColor="#AAAAAA"
              value={name}
              onChangeText={setName}
              className="text-white h-[48px]"
            />
          </View>

          <Text className="text-text mb-2">COLLECTION SYMBOL</Text>
          <View className="rounded-xl border border-secondary px-3">
            <TextInput
              placeholder="Enter collection symbol (e.g., SAVE1)"
              placeholderTextColor="#AAAAAA"
              value={collectionSymbol}
              onChangeText={setCollectionSymbol}
              className="text-white h-[48px]"
            />
          </View>

          <Text className="text-text mt-5 mb-3">TOKEN TYPE</Text>
          <View className="flex flex-row gap-x-3">
            {(['USDT','USDC','BTC'] as TokenType[]).map((t) => (
              <TouchableOpacity key={t} onPress={() => handleTokenChange(t)} className={`flex-1 h-[70px] rounded-xl items-center justify-center ${token === t ? 'bg-secondary' : 'bg-highlight'}`}>
                <Text className={`${token === t ? 'text-black' : 'text-white'} font-extrabold`}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="bg-bg rounded-2xl p-[20px] mt-5">
          <Text className="text-white text-[18px] font-extrabold mb-3">GROUP TYPE</Text>
          <View className="gap-y-3">
            <TouchableOpacity onPress={() => setGroupType('closed')} className={`rounded-xl p-[16px] ${groupType==='closed' ? 'bg-black border-secondary border' : 'bg-highlight'}`}>
              <Text className="text-white text-[16px] font-extrabold">CLOSED GROUP</Text>
              <Text className="text-text">Invite only</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGroupType('open')} className={`rounded-xl p-[16px] ${groupType==='open' ? 'bg-black border-secondary border' : 'bg-highlight'}`}>
              <Text className="text-white text-[16px] font-extrabold">OPEN GROUP</Text>
              <Text className="text-text">Anyone can join</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-bg rounded-2xl p-[20px] mt-5">
          <Text className="text-white text-[18px] font-extrabold mb-3">YIELD PROTOCOL</Text>
          <Text className="text-text mb-3">SELECT YIELD PROTOCOL</Text>
          <View className="flex flex-row gap-x-3">
            {(['usdc','usdt','btc'] as YieldContractType[]).map((y) => (
              <TouchableOpacity key={y} onPress={() => handleYieldContractChange(y)} className={`flex-1 p-2 h-[70px] rounded-xl items-center justify-center ${yieldContractType === y ? 'bg-secondary' : 'bg-highlight'}`}>
                <Text className={`${yieldContractType === y ? 'text-black' : 'text-white'} font-extrabold text-xs text-center`}>{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Available Markets (from API) */}
          <View className="mt-5">
            <Text className="text-white text-[16px] font-extrabold mb-2">Available Markets</Text>
            {loading ? (
              <Text className="text-text">Loading markets...</Text>
            ) : error ? (
              <Text className="text-accent">Failed to load markets</Text>
            ) : markets.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {markets.map((m: any) => {
                  const key = m?.address ?? m?.pool?.id ?? `${m?.symbol || m?.name || 'm'}-${Math.random().toString(36).slice(2, 8)}`;
                  const name = m?.pool?.name || m?.name || m?.symbol || 'Unknown';
                  // Prefer curated APR if available; fallback to supply APY fraction
                  const curatedAprRaw = m?.stats?.defiSpringSupplyApr?.value ?? null;
                  const curatedAprDec = m?.stats?.defiSpringSupplyApr?.decimals ?? 18;
                  const supplyApyRaw = m?.stats?.supplyApy?.value ?? null; // fractional rate (0-1)
                  const supplyApyDec = m?.stats?.supplyApy?.decimals ?? 18;

                  let apyPercent: string | undefined = undefined;
                  if (curatedAprRaw !== null && curatedAprRaw !== undefined) {
                    const apr = Number(curatedAprRaw) / 10 ** curatedAprDec; // fraction
                    apyPercent = (apr * 100).toFixed(2);
                  } else if (supplyApyRaw !== null && supplyApyRaw !== undefined) {
                    const apyFraction = Number(supplyApyRaw) / 10 ** supplyApyDec; // fraction
                    apyPercent = (apyFraction * 100).toFixed(2);
                  }

                  return (
                    <View key={key} className="bg-black border border-secondary rounded-xl px-4 py-3 mr-3 min-w-[160px]">
                      <TouchableOpacity onPress={() => {setYeildContract(m?.vToken.address)}}>
                        <Text className="text-white font-semibold text-[12px]" numberOfLines={1}>{name}</Text>
                        <Text className="text-text text-[11px]" numberOfLines={1}>{m?.symbol}</Text>
                        {apyPercent !== undefined && (
                          <Text className="text-text text-[11px] mt-1">APY: {apyPercent}%</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )
                })}
              </ScrollView>
            ) : (
              <View>
                <Text className="text-text">No markets available</Text>
                {__DEV__ && (
                  <Text className="text-text mt-1 text-[10px]">Debug: {typeof yeildPools} {yeildPools ? 'received' : 'null'}</Text>
                )}
              </View>
            )}
          </View>

        </View>

        <TouchableOpacity onPress={proceed} className="bg-secondary rounded-2xl mt-8 h-[56px] items-center justify-center">
          <Text className="text-black text-[18px] font-extrabold">NEXT</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}


