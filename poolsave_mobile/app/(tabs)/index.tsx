import { Button, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import "./pools";
import { Link } from "expo-router";
import {
  SafeAreaView,
} from "react-native-safe-area-context";
import { ICONS } from "@/constants/icons";
import { useAccount } from "@/context/UserContext";
import { useEffect, useState } from "react";
import { useAegis } from "@cavos/aegis";
import {cairo} from "starknet";
import { Contract, RpcProvider } from "starknet";
import savequestAbi from '@/app/Abis/savequestAbi.json'
import { CONTRACTS, NETWORK } from "../config/config";
import * as SecureStore from "expo-secure-store";

export default function Index() {

  const [isLoading, setIsLoading] = useState(false);
  const [savingBalance, setSavingBalance] = useState<number>(0);
  const [poolCount, setPoolCount] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoAddress, setDemoAddress] = useState<string | null>(null);

  const [balance, setBalance] = useState({
    usdc: '0',
    usdt: '0',
    pol: '0'
  });

  const {aegisAccount} = useAegis();

  // Check for demo mode on mount
  useEffect(() => {
    const checkDemoMode = async () => {
      const demoMode = await SecureStore.getItemAsync("demo_mode");
      if (demoMode === "true") {
        setIsDemoMode(true);
        const address = await SecureStore.getItemAsync("account_address");
        if (address) {
          setDemoAddress(address);
          // Set mock demo data
          setBalance({
            usdc: '5000',
            usdt: '3247.50',
            pol: '0.15'
          });
          setSavingBalance(12500);
          setPoolCount(2);
        }
      }
    };
    checkDemoMode();
  }, []);

  const get_token_balances = async () => {
    if (isDemoMode) {
      // Demo mode - use mock data
      return;
    }

    if(!aegisAccount) {
      return
    }

    let usdc_bal = await aegisAccount.getTokenBalance('0x0054bd06a78db79f274984edf6907148c57af42f06ffd9a764ffe40ed9e0129b', 6);
    let usdt_bal = await aegisAccount.getTokenBalance('0x008D4C6451c45ef46Eff81b13e1a3F2237642b97E528Ce1ae1d8B8eE2b267e8D', 6);
    let pol_bal = await aegisAccount.getTokenBalance('0x04861Ba938Aed21f2CD7740acD3765Ac4D2974783A3218367233dE0153490CB6', 8);

    console.log(usdc_bal, '\n', usdt_bal, '\n', pol_bal)
    setBalance({
      usdc: usdc_bal,
      usdt: usdt_bal,
      pol: pol_bal
    })
  }

  const provider = new RpcProvider({ nodeUrl: NETWORK.rpcUrl });

  const getUserSavingBalance = async () => {
    if (isDemoMode) {
      // Demo mode - use mock data
      return;
    }

    if (!aegisAccount?.isWalletConnected()) return;
    
    setIsLoading(true);
    try {

      const savequestInstance = new Contract(savequestAbi, CONTRACTS.saveQuest, provider);

      let response = await savequestInstance.get_user_savings(aegisAccount.address);

      setSavingBalance(response);
      // console.log(parsedPools)
    } catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  const getPoolCount = async () => {
    if (isDemoMode) {
      // Demo mode - use mock data
      return;
    }

    if (!aegisAccount?.isWalletConnected()) return;
    setIsLoading(true);
    try {

      const savequestInstance = new Contract(savequestAbi, CONTRACTS.saveQuest, provider);

      let response = await savequestInstance.get_pool_count();

      setPoolCount(response);
    }
    catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    get_token_balances()
    getPoolCount()
  }, [setBalance, setSavingBalance, setPoolCount])

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="w-full h-full p-[24px] ">
        <View className="gap-y-6 flex flex-col">
          {/* Header */}
          <View className="flex flex-row justify-between items-center">
            <View className="flex flex-row items-center gap-x-2">
              <Image className="h-[40px] w-[40px]" source={ICONS.logo} />
              <Text className="text-white text-[28px] font-bold">PoolSave</Text>
            </View>
            <View className="flex flex-row items-center gap-x-2">
              <Text className="text-white bg-bg px-3 py-2 rounded-xl">
                {isDemoMode 
                  ? `${demoAddress?.slice(0,4)}...${demoAddress?.slice(-4)}` 
                  : aegisAccount 
                    ? `${aegisAccount.address?.slice(0,4)}...${aegisAccount.address?.slice(-4)}` 
                    : '—'}
              </Text>
              {isDemoMode && (
                <Text className="text-yellow-400 text-[10px]">DEMO</Text>
              )}
              <Text className="text-secondary">◻︎</Text>
            </View>
          </View>

          {/* Balance Cards */}
          <View className="bg-bg rounded-2xl p-[16px] border border-highlight">
            <View className="flex-row justify-between items-center">
              <Text className="text-white font-extrabold text-[16px]">POOL BALANCE</Text>
              <Text className="text-secondary bg-black px-3 py-1 rounded-xl">sepolia</Text>
            </View>
            <Text className="text-white font-extrabold text-[28px] mt-2">${Number(balance?.usdc) + Number(balance?.usdt)}</Text>
            <Text className="text-text">Active in {poolCount} pools</Text>
          </View>

          <View className="bg-bg rounded-2xl p-[16px] border border-highlight">
            <Text className="text-white font-extrabold text-[16px]">MY SAVINGS</Text>
            <Text className="text-white font-extrabold text-[28px] mt-2">${savingBalance}</Text>
            <Text className="text-text">Personal vault</Text>
          </View>

          {/* Actions */}
          <View className="gap-y-4">
            {/* <TouchableOpacity className="w-full bg-secondary h-[64px] justify-center items-center rounded-[16px]">
              <Link className="text-black font-extrabold text-[18px]" href="/(tabs)/pools">+ DEPOSIT</Link>
            </TouchableOpacity>
            <TouchableOpacity className="w-full bg-bg h-[64px] justify-center items-center rounded-[16px]">
              <Link className="text-white font-extrabold text-[18px]" href="/(tabs)/pools">— WITHDRAW</Link>
            </TouchableOpacity> */}
            <TouchableOpacity className="w-full bg-bg h-[64px] justify-center items-center rounded-[16px]">
              <Link className="text-white font-extrabold text-[18px]" href="/create-pool/info">✚ CREATE POOL</Link>
            </TouchableOpacity>

            {/* <Button title="Create Poolss" onPress={createPool} /> */}

          </View>

          {/* Your Pools */}
          <View className="gap-y-3">
            <Text className="text-white text-[20px] font-extrabold">YOUR POOLS</Text>
            <View className="flex flex-row justify-between p-[16px] w-full bg-[#FFFFFF1A] rounded-[12px] border-l-[8px] border-secondary">
              <View className="w-[48px] h-[48px] bg-secondary rounded-lg" />
              <View className="flex-1 px-3">
                <Text className="text-white font-extrabold text-[18px]">Stablecoins</Text>
                <Text className="text-text">USDC + USDT</Text>
              </View>
              <View className="items-end">
                <Text className="text-white font-extrabold text-[18px]">$8,247.50</Text>
                <Text className="text-secondary">+4.2% APY</Text>
              </View>
            </View>

            <View className="flex flex-row justify-between p-[16px] w-full bg-[#FFFFFF1A] rounded-[12px] border-l-[8px] border-accent">
              <View className="w-[48px] h-[48px] bg-accent rounded-lg" />
              <View className="flex-1 px-3">
                <Text className="text-white font-extrabold text-[18px]">POL Vault</Text>
                <Text className="text-text">Polygon Savings</Text>
              </View>
              <View className="items-end">
                <Text className="text-white font-extrabold text-[18px]">$4,600.42</Text>
                <Text className="text-accent">+7.8% APY</Text>
              </View>
            </View>
          </View>

          {/* Powered by */}
          <View className="bg-bg rounded-2xl p-[16px]">
            <Text className="text-white text-[18px] font-extrabold">POWERED BY POLfi</Text>
            <Text className="text-text">Secured on Polygon</Text>
            <View className="flex-row gap-x-2 mt-3">
              <View className="w-[28px] h-[28px] rounded-full bg-[#666]" />
              <View className="w-[28px] h-[28px] rounded-full bg-[#777]" />
              <View className="w-[28px] h-[28px] rounded-full bg-[#888]" />
              <Text className="text-white">+12</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
