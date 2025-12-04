import { View, Text, Image, TouchableOpacity, ScrollView, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ICONS } from '@/constants/icons'
import { router } from 'expo-router'
import { useAegis } from "@cavos/aegis";
import { Contract, RpcProvider } from 'starknet'
import savequestAbi from '@/app/Abis/savequestAbi.json'
import { CONTRACTS, NETWORK } from '../config/config';

// PoolCard component for displaying individual pools
const PoolCard = ({ pool }: { pool: any }) => {
  const formatAmount = (amount: string) => {
    return (Number(amount) / 1e18).toFixed(2); // Convert from wei to ETH
  };

  const getPoolName = (poolId: number) => {
    const names = ['Stablecoin Squad', 'POL Vault', 'Yield Masters', 'Crypto Circle', 'DeFi Alliance'];
    return names[poolId % names.length] || `Pool ${poolId}`;
  };

  const getTokenType = (depositToken: string) => {
    // This would need to be mapped based on actual token addresses
    return 'USDC Pool';
  };

  const getNextRecipient = (poolId: number) => {
    const names = ['Sarah M.', 'John D.', 'Alice K.', 'Bob L.', 'Emma R.'];
    return names[poolId % names.length] || 'Member';
  };

  const getProgressPercentage = (participants: number, maxParticipants: number) => {
    return Math.min((participants / maxParticipants) * 100, 100);
  };

  const getDaysRemaining = (startTimestamp: number) => {
    const now = Math.floor(Date.now() / 1000);
    const daysSinceStart = Math.floor((now - startTimestamp) / (24 * 60 * 60));
    return Math.max(30 - daysSinceStart, 0); // Assuming 30-day cycles
  };

  const getYieldAccrued = (principalAmount: string) => {
    const amount = Number(principalAmount) / 1e18;
    return (amount * 0.075).toFixed(2); // 7.5% APY approximation
  };

  return (
    <View className='bg-bg rounded-2xl p-[16px] w-full border-l-[8px] border-secondary mb-4'>
      <View className='flex flex-row justify-between items-start'>
        <View className='flex flex-row items-center gap-x-4'>
          <View className='w-[48px] h-[48px] rounded-xl bg-secondary' />
          <View className='flex flex-col gap-y-1'>
            <Text className='text-white text-[18px] font-bold'>{Number(pool.id)}</Text>
            <Text className='text-text text-[12px]'>{getTokenType(pool.deposit_token.toString())}</Text>
          </View>
        </View>
        <View className='items-end'>
          <Text className='text-secondary text-[22px] font-extrabold'>${( Number(pool.contribution_amount)).toFixed(2) }</Text>
          <Text className='text-text text-[12px]'>{Number(pool.participants_count)} members</Text>
        </View>
      </View>

      <View className='mt-6'>
        <View className='flex flex-row justify-between items-center mb-2'>
          <Text className='text-white text-[16px] font-bold'>Next Yield Recipient:</Text>
          <Text className='text-secondary text-[16px] font-bold'></Text>
        </View>
        <View className='w-full h-[10px] bg-[#5A5A5A] rounded-full overflow-hidden'>
          <View 
            className='h-full bg-black' 
            style={{ width: `${getProgressPercentage(Number(pool?.participants_count), Number(pool?.max_participants))}%` }}
          />
        </View>
        <Text className='text-text text-[12px] mt-2'>{getDaysRemaining(Number(pool?.start_timestamp))} days remaining</Text>
      </View>

      <View className='mt-6 flex flex-row justify-between items-center'>
        {/* <View>
          <Text className='text-accent text-[18px] font-extrabold'>+${getYieldAccrued(pool.principal_amount)}</Text>
          <Text className='text-text text-[12px]'>Yield accrued</Text>
        </View> */}
        <TouchableOpacity 
          className='bg-secondary px-[18px] py-[12px] rounded-xl' 
          onPress={() => router.push({ pathname: `/pool/[id]`, params: { id: Number(pool.id) } })}
        >
          <Text className='text-black text-[16px] font-extrabold'>VIEW DETAILS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const pools = () => {
  const { aegisAccount } = useAegis();
  const [pools, setPools] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const provider = new RpcProvider({ nodeUrl: NETWORK.rpcUrl });  

  const getPools = async () => {
    if (!aegisAccount?.isWalletConnected()) return;
    
    setIsLoading(true);
    try {

      const savequestInstance = new Contract(savequestAbi, CONTRACTS.saveQuest, provider);

      let response = await savequestInstance.get_all_pools();

      setPools(response);
      // console.log(parsedPools)
    } catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getPools();
  }, [setPools]);

  
  return (
    <SafeAreaView
     className="w-full h-full bg-primary"
    >
    {/* <ScrollView className='w-full' contentContainerStyle={{ padding: 24, rowGap: 24 }}> */}
    <View className='flex flex-col gap-y-6 w-full'>
      {/* Header */}
      <View className="flex flex-row justify-between items-center">
        <View className="flex flex-row justify-center bg-primary items-center gap-x-2">
          <Image className="h-[36px] w-[36px]" source={ICONS.logo} />
          <Text className="text-white text-[24px] font-bold">PoolSave</Text>
        </View>
        <TouchableOpacity 
          className="bg-secondary rounded-xl px-4 py-2"
          onPress={getPools}
          disabled={isLoading}
        >
          <Text className="text-primary font-bold">
            {isLoading ? 'Loading...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toggle Tabs */}
      <View className='flex flex-row p-[8px] bg-black rounded-xl h-[64px] w-full gap-x-2 shadow-custom'>
        <TouchableOpacity className='bg-secondary w-1/2 rounded-xl justify-center items-center'>
          <Text className='text-[16px] font-bold'>MY POOLS</Text>
        </TouchableOpacity>

        <TouchableOpacity className='bg-highlight w-1/2 rounded-xl justify-center items-center'>
          <Text className='text-[16px] font-bold text-white'>PUBLIC POOLS</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">Loading pools...</Text>
        </View>
      ) : pools.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">No pools found</Text>
          <TouchableOpacity 
            className="bg-secondary rounded-xl px-6 py-3 mt-4"
            onPress={() => router.push('/create-pool/info')}
          >
            <Text className="text-primary font-bold">Create Pool</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={pools}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <PoolCard pool={item} />}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}

    </View>
    {/* </ScrollView> */}
    </SafeAreaView>
  )
}

export default pools