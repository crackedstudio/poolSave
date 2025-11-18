import { View, Text, ScrollView, Image, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { IMAGES } from "@/constants/images";
import { Link } from "expo-router";

const profile = () => {
  return (
    <SafeAreaView className="w-full h-full bg-primary">
      <ScrollView>
        <View className="flex flex-col px-[24px] gap-y-4">
          <View className="w-full  bg-background rounded-[16px] flex flex-col justify-center items-center p-[24px] gap-y-4">
            <Image
              className="h-[80px] w-[80px] rounded-full"
              source={IMAGES.dp}
            />
            <Text className="text-white font-[900px] text-[24px]">
              Sarah Chen
            </Text>
            <Text className="text-[16px] font-[700px] text-text">
              PoolSave member since Jan 2024
            </Text>
            <View className="flex flex-row gap-x-4">
              <View className="flex flex-col gap-y-1 items-center">
                <Text className="text-white text-[20px] font-[900px]">3</Text>
                <Text className="text-text font-[700px] text-[14px]">
                  Pools
                </Text>
              </View>
              <View className="flex flex-col gap-y-1 items-center">
                <Text className="text-white text-[20px] font-[900px]">127</Text>
                <Text className="text-text font-[700px] text-[14px]">Days</Text>
              </View>
            </View>
          </View>

          <View className="flex flex-col gap-y-2">
            <Text className="text-white font-[900px] text-[18px]">
              CONNECTED WALLET
            </Text>

            <View className="flex flex-row justify-between p-[14px] w-full border-shadow-secondary bg-[#FFFFFF1A] rounded-[12px] border-l-[8px] items-center">
              <View className="flex flex-row gap-x-2">
                <View className="w-[38px] h-[38px] bg-secondary rounded-lg"></View>
                <View className="flex flex-col">
                  <Text className="text-white font-bold text-[16px]">
                    Starknet
                  </Text>
                  <Text className="text-text text-[12px]">ox1234...567890</Text>
                </View>
              </View>

              <TouchableOpacity className="bg-secondary px-[16px] py-[9px] rounded-[8px]">
                <Text className="font-[900px] text[14px]">Copy</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex flex-col gap-y-4">
            <View className="flex flex-col border border-secondary rounded-[8px] p-[24px] gap-y-2 bg-background">
              <Text className="text-white font-[900px] text-[18px]">
                TOTAL EARNED
              </Text>
              <Text className="text-white font-[900px] text-[24px]">
                $347.82
              </Text>
              <Text className="text-text font-[900px] text-[14px]">
                All time rewards
              </Text>
            </View>

            <View className="flex flex-col border border-accent rounded-[8px] p-[24px] gap-y-2 bg-background">
              <Text className="text-white font-[900px] text-[18px]">
                TOTAL EARNED
              </Text>
              <Text className="text-white font-[900px] text-[24px]">6.2%</Text>
              <Text className="text-text font-[900px] text-[14px]">
                Across all pools
              </Text>
            </View>
          </View>

          <View className="flex flex-col gap-y-4">
            <Text className="text-white text-[18px] font-[900px]">Account</Text>
            <View className="flex flex-col gap-y-2">
              <View className="bg-background justify-between p-[16px] rounded-[16px] justify-center">
                <View className="flex flex-row">
                  <Text className="text-white text-[18px] font-[900px]">
                    TRANSACTION HISTORY
                  </Text>
                </View>
                <Text></Text>
              </View>
            </View>

            <View className="flex flex-col gap-y-2">
              <View className="bg-background justify-between p-[16px] rounded-[16px] justify-center">
                <View className="flex flex-row">
                  <Text className="text-white text-[18px] font-[900px]">
                    Notifications
                  </Text>
                </View>
                <Text></Text>
              </View>
            </View>

            <View className="flex flex-col gap-y-2">
              <View className="bg-background justify-between p-[16px] rounded-[16px] justify-center">
                <View className="flex flex-row">
                  <Text className="text-white text-[18px] font-[900px]">
                    Security
                  </Text>
                </View>
                <Text></Text>
              </View>
            </View>

            <View className="flex flex-col gap-y-2">
              <View className="bg-background justify-between p-[16px] rounded-[16px] justify-center">
                <View className="flex flex-row">
                  <Text className="text-white text-[18px] font-[900px]">
                    Help & Support
                  </Text>
                </View>
                <Text></Text>
              </View>
            </View>
          </View>

          <TouchableOpacity className="w-full bg-secondary h-[60px] rounded-[12px] justify-center items-center">
            <Text className="text-primary font-[900px] text-[18px]">
              DISCONNECT WALLET
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default profile;
