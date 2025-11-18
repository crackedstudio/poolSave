import React, {useEffect, useState} from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, router, useRouter } from 'expo-router'
import { useAegis } from "@cavos/aegis";
import { cairo, Contract, RpcProvider } from 'starknet';
import savequestAbi from '@/app/Abis/savequestAbi.json'
import useFetch from '@/hooks/useFetch';
import { API, CONTRACTS } from '../config/config';

// Mock dataset for details
const mockPools: Record<string, {
  title: string;
  subtitle: string;
  color: 'secondary' | 'accent';
  total: string;
  members: number;
  yieldAccrued: string;
  nextRecipient: string;
  daysRemaining: number;
  contributions: string;
  apy: string;
  memberList: Array<{ name: string; }>;
  activity: Array<{ id: string; type: 'deposit' | 'yield' | 'payout'; amount: string; date: string; accent: 'secondary' | 'accent'; }>;
}> = {
  'stablecoin-squad': {
    title: 'Stablecoin Squad',
    subtitle: 'USDC Pool',
    color: 'secondary',
    total: '$2,500',
    members: 8,
    yieldAccrued: '+$187.50',
    nextRecipient: 'Sarah M.',
    daysRemaining: 18,
    contributions: '$2,312.50',
    apy: '4.2% APY',
    memberList: [
      { name: 'Sarah M.' },
      { name: 'Ayo B.' },
      { name: 'Ken I.' },
      { name: 'You' },
    ],
    activity: [
      { id: 'a1', type: 'deposit', amount: '+$200.00', date: 'Dec 15, 2024', accent: 'secondary' },
      { id: 'a2', type: 'yield', amount: '+$28.75', date: 'Dec 12, 2024', accent: 'secondary' },
      { id: 'a3', type: 'payout', amount: 'Paid to Alex', date: 'Dec 01, 2024', accent: 'accent' },
    ],
  },
  'bitcoin-builders': {
    title: 'Bitcoin Builders',
    subtitle: 'BTC Pool',
    color: 'accent',
    total: '$1,800',
    members: 6,
    yieldAccrued: '+$234.67',
    nextRecipient: 'You!',
    daysRemaining: 4,
    contributions: '$1,565.33',
    apy: '3.6% APY',
    memberList: [
      { name: 'You' },
      { name: 'Ada L.' },
      { name: 'Mike T.' },
    ],
    activity: [
      { id: 'b1', type: 'deposit', amount: '+$150.00', date: 'Dec 10, 2024', accent: 'accent' },
      { id: 'b2', type: 'yield', amount: '+$18.20', date: 'Dec 08, 2024', accent: 'secondary' },
    ],
  },
};

export default function PoolDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = mockPools[id ?? ''] ?? mockPools['stablecoin-squad'];

  const [pool, setPool] = useState<any>()
  const [participants, setParticipants] = useState<any>([])
  const [depositToken, setDepositToken] = useState<any>()
  const [poolData, setPoolData] = useState<any>()
  const router = useRouter();

  const {data: positionData, loading, error} = useFetch(API.positonInfo+CONTRACTS.saveQuest)

  // Format the number since it's stored as an integer with decimals
  // const formattedValue = Number(value) / 10 ** poolData.collateral.decimals;
  // Aegis SDK hooks - provides access to wallet and transaction functions
  const { aegisAccount, currentAddress } = useAegis();
  const provider = new RpcProvider({ nodeUrl: 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_8/-lEzc_71TeeTviJ9dEf6nKclkiYnQet8' });
  const savequestInstance = new Contract(savequestAbi, CONTRACTS.saveQuest, provider);
    // State for transaction execution
    const [isExecuting, setIsExecuting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [lastTransactionHash, setLastTransactionHash] = useState<string | null>(
      null
    ); 

  const getPool = async () => {
    if (!aegisAccount?.isWalletConnected()) return;
    setIsLoading(true);
    try {

      let response = await savequestInstance.get_pool(id);

      setPool(response);

      // Safely handle different cases
    const token = response.deposit_token;
    let tokenAddress;

    if (typeof token === "string") {
      tokenAddress = token;
    } else if (typeof token === "bigint") {
      tokenAddress = `0x${token.toString(16)}`;
     } else {
      tokenAddress = "Unknown format";
    }

    setDepositToken(tokenAddress);

    } catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const getPoolParticipants = async () => {
    if (!aegisAccount?.isWalletConnected()) return;
    setIsLoading(true);
    try {

      let response = await savequestInstance.get_all_participants(id);

      setParticipants(response);
      // alert(pool)
      console.log("participants:",participants)
    } catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    } 
  }

  useEffect(() => {
    getPool();
    getPoolParticipants();
  }, [setPool, setParticipants]);


  // Join pool call

  const handleExecuteApproveAndJoinPool = async () => {

    if (!aegisAccount) {
      Alert.alert("Error", "Aegis SDK not initialized");
      return;
    }

    setIsExecuting(true);
    try {
      // STRK token address on Sepolia testnet

        const approveAmount = Number(pool?.contribution_amount);

      console.log("Executing approve transaction:", {
        contract: depositToken,
        spender: CONTRACTS.saveQuest,
        amount: approveAmount,
        currentAddress: currentAddress,
      });

      // Execute approve transaction using SDK executeBatch method
      // This allows for future expansion to multiple calls in one transaction
      const result = await aegisAccount.executeBatch([
        {
          contractAddress: depositToken,
          entrypoint: 'approve',
          calldata: [CONTRACTS.saveQuest, cairo.uint256(approveAmount)],
        },
        {
          contractAddress: CONTRACTS.saveQuest,
          entrypoint: 'join_pool',
          calldata: [id]
        }
      ]);

      // Store transaction hash for tracking and display
      setLastTransactionHash(result.transactionHash);

      Alert.alert(
        "Transaction Successful!",
        `Approve transaction executed successfully.\n\nTransaction Hash: ${result.transactionHash}\n}`,
        [{ text: "OK" }]
      );

      console.log("Approve transaction result:", result);
    } catch (error) {
      console.error("Failed to execute approve transaction:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(  
        `Failed to execute approve transaction: ${errorMessage}`
      );
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="p-[24px] gap-y-6">
        <View className="flex flex-row items-center justify-between">
          <TouchableOpacity className="w-[44px] h-[44px] rounded-lg bg-bg items-center justify-center" onPress={() => router.back()}>
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-[22px] font-bold">Pool Details</Text>
          <View className="w-[44px]" />
        </View>

        <View className={`bg-bg rounded-2xl p-[20px] border-l-[8px] ${data.color === 'secondary' ? 'border-secondary' : 'border-accent'}`}>
          <Text className="text-white text-[24px] font-bold">{data.title}</Text>
          <Text className="text-text text-[14px]">{data.subtitle}</Text>
          <View className="flex flex-row justify-between items-end mt-4">
            <View>
              <Text className="text-text text-[14px]">Total Value</Text>
              <Text className={`text-[28px] font-extrabold ${data.color === 'secondary' ? 'text-secondary' : 'text-accent'}`}>{Number(pool?.contribution_amount) * Number(pool?.participants_count)}</Text>
            </View>
            <Text className="text-text text-[16px]">{pool?.participants_count} members</Text>
          </View>

          <View className="mt-6">
            <Text className="text-white text-[18px] font-bold mb-2">Next Yield Recipient</Text>
            <View className="flex flex-row justify-between items-center">
            {participants && participants.length > 0 ? <Text className={`text-[18px] font-extrabold ${data.color === 'secondary' ? 'text-secondary' : 'text-accent'}`}> {`0x${participants[0]?.addr.toString(16).slice(0, 4)}..${participants[0]?.addr.toString(16).slice(-4)}`}</Text> : <Text className={`text-[18px] font-extrabold ${data.color === 'secondary' ? 'text-secondary' : 'text-accent'}`}> Yet to join</Text>}
              <Text className="text-text text-[16px]">{data.daysRemaining} days remaining</Text>
            </View>
            <View className="w-full h-[14px] bg-[#5A5A5A] rounded-full overflow-hidden mt-3">
              <View className={`h-full w-[60%] ${data.color === 'secondary' ? 'bg-secondary' : 'bg-accent'}`} />
            </View>
            <Text className="text-text mt-2">Next distribution in {data.daysRemaining} days</Text>
          </View>
        </View>

        <TouchableOpacity 
          onPress={handleExecuteApproveAndJoinPool}
          disabled={isExecuting}
          className="bg-secondary rounded-xl py-[14px] items-center"
        >
          {isExecuting ? (
            <View>
              {/* <ActivityIndicator color="#FFFFFF" size="small" /> */}
              <Text className="text-black text-[18px] font-extrabold">Joining...</Text>
            </View>
          ) : (
            <Text className="text-black text-[18px] font-extrabold">Join Pool</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => {}}
          disabled={isExecuting}
          className="bg-secondary rounded-xl py-[14px] items-center"
        >
          {<Text className="text-black text-[18px] font-extrabold">claim rewards</Text>}
        </TouchableOpacity>


        {/* Stats */}
        <View className="flex flex-row gap-x-3">
          <View className="flex-1 bg-bg rounded-xl p-[16px]">
            <Text className="text-text text-[12px] text-center">Contributions</Text>
            <Text className="text-white text-[18px] font-bold">{pool?.contribution_amount * pool?.participants_count}</Text>
          </View>
          <View className="flex-1 bg-bg rounded-xl p-[16px]">
            <Text className="text-text text-[12px]">Yield Accrued</Text>
            <Text className={`${data.color === 'secondary' ? 'text-secondary' : 'text-accent'} text-[18px] font-bold`}>{pool?.total_yield_distributed}</Text>
          </View>
          <View className="flex-1 bg-bg rounded-xl p-[16px]">
            <Text className="text-text text-[12px]">contribution amount</Text>
            <Text className="text-white text-[18px] font-bold">{pool?.contribution_amount}</Text>
          </View>
        </View>

        {/* Members */}
        <View className="bg-bg rounded-2xl p-[20px] gap-y-3">
          <Text className="text-white text-[18px] font-bold">Members</Text>
          <View className="flex flex-row flex-wrap gap-2">
            {participants && participants.length > 0 ? participants.map((m : any, index: number) => (
              <View key={index} className={`${data.color === 'secondary' ? 'bg-[#184242]' : 'bg-[#4B3425]'} px-[12px] py-[10px] rounded-xl`}>
                <Text className="text-white text-[14px] font-bold">0x{m.addr.toString(16).slice(0, 4)}..{m.addr.toString(16).slice(-4)} </Text>
              </View>
            )) : <Text className='text-white'>No one has joined yet ...</Text>}
          </View>
        </View>

        <View className="bg-bg rounded-2xl p-[20px] gap-y-3">
          <Text className="text-white text-[18px] font-bold">Position Info</Text>
          <View className="flex flex-row flex-wrap gap-2">
          {loading ? (
              <Text className="text-text">Loading position...</Text>
            ) : error ? (
              <Text className="text-accent">Failed to load position</Text>
            ) : positionData.data.length >= id ? (
              <View className='flex w-full items-center gap-y-4 justify-center'>
              <View className='grid grid-col-2'>
                <Text className='font-bold text-gray-500 text-center'>Name</Text>  
                <Text className='text-white text-center text-[14px] font-bold'>{positionData.data[Number(id) - 1].pool.name}</Text>
              </View>

              <View className='grid grid-col-2'>
                <Text className='font-bold text-gray-500 text-center'>collateral(Vtoken)</Text>  
                <Text className='text-white text-center text-[14px] font-bold'>{positionData.data[Number(id) - 1].collateralShares.name}</Text>
              </View>

              <View className='grid grid-col-2'>
                <Text className='font-bold text-gray-500 text-center'>collateral(Vtoken)</Text>  
                <Text className='text-white text-center text-[14px] font-bold'>{positionData.data[Number(id) - 1].collateral.value}</Text>
              </View>
              </View>
            ) : <Text className='text-red-500'>No position yet</Text>
          }
          </View>
        </View>

        {/* Activity */}
        <View className="gap-y-3">
          <Text className="text-white text-[18px] font-bold">More Info</Text>
          {data.activity.map((a) => (
            <View key={a.id} className="p-[16px] flex flex-row justify-between items-center h-[76px] bg-bg rounded-[12px]">
              <View className="flex flex-col">
                <Text className="text-white text-[16px] font-extrabold">{a.type === 'deposit' ? 'Deposit' : a.type === 'yield' ? 'Yield' : 'Payout'}</Text>
                <Text className="text-text text-[14px]">{a.date}</Text>
              </View>
              <Text className={`${a.accent === 'secondary' ? 'text-secondary' : 'text-accent'} text-[12px] font-extrabold`}>0x{pool?.yeild_contract.toString(16).slice(0, 4)}..{pool?.yeild_contract.toString(16).slice(-4)}</Text>
            </View>
          ))}
        </View>

      </View>
      </ScrollView>
    </SafeAreaView>
  )
}


