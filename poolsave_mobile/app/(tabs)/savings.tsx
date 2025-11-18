import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Contract, RpcProvider } from "starknet";
import savequestAbi from '@/app/Abis/savequestAbi.json'
import { useAegis } from "@cavos/aegis";
import { CONTRACTS, NETWORK } from "../config/config";

export default function Savings() {
  const { aegisAccount } = useAegis();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  const getUserSavingBalance = async () => {
   
    const provider = new RpcProvider({ nodeUrl: NETWORK.rpcUrl });

    if (!aegisAccount?.isWalletConnected()) return;
    
    setIsLoading(true);
    try {

      const savequestInstance = new Contract(savequestAbi, CONTRACTS.saveQuest, provider);

      let response = await savequestInstance.get_user_savings(aegisAccount.address);

      setBalance(response);
      // console.log(parsedPools)
    } catch (error) {
      console.error('Error fetching pools:', error);
      alert('Failed to fetch pools. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getUserSavingBalance();
  }, [setBalance]);

  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView className="p-[24px]" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex flex-row items-center justify-between mb-4">
          <View className="w-[44px]" />
          <Text className="text-white text-[22px] font-extrabold">MY SAVINGS</Text>
          <View className="w-[44px]" />
        </View>

        {/* Total Savings */}
        <View className="bg-bg rounded-2xl p-[16px] shadow-custom">
          <Text className="text-white font-extrabold text-[14px]">TOTAL SAVINGS</Text>
          <Text className="text-white font-extrabold text-[28px] mt-1">${balance}</Text>
          <Text className="text-text">Personal vault balance</Text>
        </View>

        {/* Actions */}
        <View className="flex-row gap-x-3 mt-4">
          <TouchableOpacity className="flex-1 bg-bg rounded-2xl h-[96px] items-center justify-center">
            <Text className="text-accent font-extrabold text-[16px]">ADD FUNDS</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-bg rounded-2xl h-[96px] items-center justify-center">
            <Text className="text-secondary font-extrabold text-[16px]">WITHDRAW</Text>
          </TouchableOpacity>
        </View>

        {/* Breakdown */}
        <View className="mt-6 gap-y-3">
          <Text className="text-white text-[18px] font-extrabold">SAVINGS BREAKDOWN</Text>

          <View className="flex flex-row items-center gap-x-3 p-[14px] bg-[#FFFFFF1A] rounded-[12px] border-l-[8px] border-secondary">
            <View className="w-[38px] h-[38px] bg-secondary rounded-lg" />
            <View className="flex-1">
              <Text className="text-white font-extrabold text-[16px]">USDC Savings</Text>
              <Text className="text-text text-[12px]">Stablecoin vault</Text>
              <View className="h-[8px] bg-[#5A5A5A] rounded-full mt-2 overflow-hidden"><View className="h-full w-[62%] bg-[#AAAAAA]" /></View>
            </View>
            <View className="items-end">
              <Text className="text-white font-extrabold text-[18px]">$2,500.00</Text>
              <Text className="text-secondary text-[12px]">62.5%</Text>
            </View>
          </View>

          <View className="flex flex-row items-center gap-x-3 p-[14px] bg-[#FFFFFF1A] rounded-[12px] border-l-[8px] border-accent">
            <View className="w-[38px] h-[38px] bg-accent rounded-lg" />
            <View className="flex-1">
              <Text className="text-white font-extrabold text-[16px]">BTC Savings</Text>
              <Text className="text-text text-[12px]">Bitcoin vault</Text>
              <View className="h-[8px] bg-[#5A5A5A] rounded-full mt-2 overflow-hidden"><View className="h-full w-[38%] bg-[#AAAAAA]" /></View>
            </View>
            <View className="items-end">
              <Text className="text-white font-extrabold text-[18px]">$1,500.00</Text>
              <Text className="text-accent text-[12px]">37.5%</Text>
            </View>
          </View>
        </View>

        {/* Goals */}
        <View className="mt-6 gap-y-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-white text-[18px] font-extrabold">SAVINGS GOALS</Text>
            <TouchableOpacity className="bg-secondary px-[15px] py-[10px] rounded-[10px]"><Text className="text-black font-extrabold">+ NEW GOAL</Text></TouchableOpacity>
          </View>

          <View className="bg-cardbg rounded-2xl p-[16px] border border-highlight">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-[16px] font-extrabold">Emergency Fund</Text>
                <Text className="text-text">Target: $10,000</Text>
              </View>
              <Text className="text-white text-[20px] font-extrabold">40%</Text>
            </View>
            <View className="h-[10px] bg-[#3a3a3a] rounded-full mt-3 overflow-hidden"><View className="h-full w-[40%] bg-[#777]" /></View>
            <Text className="text-text mt-2">$4,000 of $10,000</Text>
          </View>

          <View className="bg-cardbg rounded-2xl p-[16px] border border-secondary/40">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-white text-[16px] font-extrabold">Vacation Fund</Text>
                <Text className="text-text">Target: $5,000</Text>
              </View>
              <Text className="text-white text-[20px] font-extrabold">0%</Text>
            </View>
            <View className="h-[10px] bg-[#3a3a3a] rounded-full mt-3 overflow-hidden" />
            <Text className="text-text mt-2">$0 of $5,000</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="mt-6 gap-y-3">
          <Text className="text-white text-[18px] font-extrabold">RECENT ACTIVITY</Text>

          <View className="p-[16px] flex flex-row justify-between items-center h-[76px] bg-bg rounded-[12px]">
            <View className="flex flex-col">
              <Text className="text-white text-[16px] font-extrabold">Deposit</Text>
              <Text className="text-text text-[14px]">Dec 15, 2024</Text>
            </View>
            <Text className="text-secondary text-[16px] font-extrabold">+$500.00</Text>
          </View>

          <View className="p-[16px] flex flex-row justify-between items-center h-[76px] bg-bg rounded-[12px]">
            <View className="flex flex-col">
              <Text className="text-white text-[16px] font-extrabold">Deposit</Text>
              <Text className="text-text text-[14px]">Dec 10, 2024</Text>
            </View>
            <Text className="text-accent text-[16px] font-extrabold">+$1,000.00</Text>
          </View>

          <View className="p-[16px] flex flex-row justify-between items-center h-[76px] bg-bg rounded-[12px]">
            <View className="flex flex-col">
              <Text className="text-white text-[16px] font-extrabold">Goal Created</Text>
              <Text className="text-text text-[14px]">Dec 5, 2024</Text>
            </View>
            <Text className="text-accent text-[16px] font-extrabold">Emergency Fund</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
