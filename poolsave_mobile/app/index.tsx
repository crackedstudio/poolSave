import { View, Text, Image, TouchableOpacity, Alert } from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ICONS } from "@/constants/icons";
import { Button } from "@react-navigation/elements";
import { AegisProvider, SecureStorage, useAegis } from '@cavos/aegis';
import { openAuthSessionAsync } from 'expo-web-browser';
import * as SecureStore from "expo-secure-store";
// import {
//   CavosWallet,
//   SignInWithApple,
//   SignInWithGoogle,
// } from "cavos-service-native";
// import { useAccount } from "@/context/UserContext";

const onboarding = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { aegisAccount, signUp } = useAegis();
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDeploying, setIsDeploying] = useState(false);
  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [isAppleLoggingIn, setIsAppleLoggingIn] = useState(false);

    const loadExistingWallet = useCallback(async () => {
      try {
        // Retrieve the saved private key from secure storage
        const savedPrivateKey = await SecureStore.getItemAsync("wallet_private_key");
        const savedAccessToken = await SecureStore.getItemAsync("access_token");
        const savedAccountAddress = await SecureStore.getItemAsync("account_address");
  
        // If we have tokens and account info, restore the session
        if (savedPrivateKey && savedAccessToken && savedAccountAddress && aegisAccount) {
          await aegisAccount.connectAccount(savedPrivateKey);
          setWalletAddress(savedAccountAddress);
        }
      } catch (error) {
        console.log("No existing wallet found or error loading:", error);
      }
    }, [aegisAccount]);
  
    // Load existing wallet when component mounts
    useEffect(() => {
      loadExistingWallet();
    }, [loadExistingWallet]);


  // const {setAccount} = useAccount();

  // const handleLoginSuccess = (walletInstance: CavosWallet) => {
  //   console.log("Login successful, wallet created:", walletInstance.address);
  //   console.log("Wallet info:", walletInstance.getWalletInfo());
  //   setWallet(walletInstance);
  //   setAccount(walletInstance);
  // };

  // const handleLoginError = (error: any) => {
  //   console.error("Login failed:", error);
  //   setIsLoading(false);
  // };

  useEffect(() => {
    if (aegisAccount?.isWalletConnected()) {
      router.replace("/(tabs)");
    }
  }, [aegisAccount?.address])

  // Logout function to clear session
  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync("wallet_private_key");
      await SecureStore.deleteItemAsync("access_token");
      await SecureStore.deleteItemAsync("account_address");
      setWalletAddress(null);
      console.log('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

    if (aegisAccount?.isWalletConnected()) {
      return (
        <SafeAreaView className="bg-primary w-full h-full items-center justify-center">
          <View className="flex flex-col gap-y-6 items-center px-[25px]">
            <View className="flex flex-col border-r-[8px] border-b-[8px] rounded-[12px] justify-center gap-y-2 bg-primary p-[33px]">
              <Image source={ICONS.logo} />
            </View>
            
            <View className="flex flex-col items-center gap-y-4">
              <Text className="text-white text-[24px] font-bold text-center">
                Welcome Back!
              </Text>
              <Text className="text-text text-[14px] text-center">
                Wallet Address: {aegisAccount?.address?.slice(0, 6)}...{aegisAccount?.address?.slice(-4)}
              </Text>
            </View>

            <TouchableOpacity 
              className="w-full bg-secondary h-[60px] rounded-[16px] justify-center items-center"
              onPress={() => router.replace("/(tabs)")}
            >
              <Text className="text-primary font-bold text-[18px]">
                CONTINUE TO APP
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full bg-gray-600 h-[50px] rounded-[16px] justify-center items-center"
              onPress={logout}
            >
              <Text className="text-white font-semibold text-[16px]">
                LOGOUT
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      )
    }

    const deployAccount = async () => {
      try {
        const pk = await aegisAccount.deployAccount();  
        console.log(pk)
      } catch (error) {
        console.log(error)
      }
      
    }

  // Login with Apple
  const loginWithApple = async () => {
    if (isAppleLoggingIn) return;
    
    setIsAppleLoggingIn(true);
    try {
      const url = await aegisAccount.getAppleOAuthUrl('exp://192.168.1.16:8081');
      const result = await openAuthSessionAsync(url, 'exp://192.168.1.16:8081');
      await aegisAccount.handleOAuthCallback(result);
      
      // Save session data after successful OAuth
      const address = aegisAccount.address;
      
      if (address) {
        await SecureStore.setItemAsync("wallet_private_key", "oauth_private_key"); // Placeholder
        await SecureStore.setItemAsync("access_token", "oauth_token"); // Placeholder
        await SecureStore.setItemAsync("account_address", address);
        
        setWalletAddress(address);
        console.log('Apple login successful:', address);
      }
    } catch (error) {
      console.error('Apple login failed:', error);
      Alert.alert('Login Failed', 'Failed to sign in with Apple. Please try again.');
    } finally {
      setIsAppleLoggingIn(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isGoogleLoggingIn) return;
    
    setIsGoogleLoggingIn(true);
    try {
      const url = await aegisAccount.getGoogleOAuthUrl('exp://192.168.1.16:8081');
      const result = await openAuthSessionAsync(url, 'exp://192.168.1.16:8081');
      await aegisAccount.handleOAuthCallback(result);
      
      // Save session data after successful OAuth
      const address = aegisAccount.address;
      
      if (address) {
        await SecureStore.setItemAsync("wallet_private_key", "oauth_private_key"); // Placeholder
        await SecureStore.setItemAsync("access_token", "oauth_token"); // Placeholder
        await SecureStore.setItemAsync("account_address", address);
        
        setWalletAddress(address);
        console.log('Google login successful:', address);
      }
    } catch (error) {
      console.error('Google login failed:', error);
      Alert.alert('Login Failed', 'Failed to sign in with Google. Please try again.');
    } finally {
      setIsGoogleLoggingIn(false);
    }
  };



  return (
    <SafeAreaView className="bg-primary w-full h-full items-center">
      <View className="flex flex-col gap-y-8 w-full px-[25px]">
        <View className="flex flex-col gap-y-8 items-center">
          <View className="flex flex-col border-r-[8px] border-b-[8px] rounded-[12px] justify-center gap-y-2 bg-primary p-[33px]">
            <Image source={ICONS.logo} />
          </View>
          <View className="flex flex-col">
            <Text className="text-white text-[32px] font-[900px]">
              PoolSave:
            </Text>
            <Text className="text-white text-[32px] font-[900px]">
              Save. Rotate:
            </Text>
            <Text className="text-[32px] font-[900px] text-secondary text-center">
              Grow.
            </Text>
          </View>

          <View className="flex-col gap-y-2">
            <Text className="text-white text-[18px] font-bold text-center">
              ONCHAIN SAVINGS THAT
            </Text>
            <Text className="text-white text-[18px] font-bold text-center">
              ACTUALLY WORK
            </Text>
            <View className="flex flex-row justify-center w-[320px] h-[12px] gap-x-[8px]">
              <View className="bg-white rounded-full h-[12px] w-[12px]"></View>
              <View className="bg-secondary rounded-full h-[12px] w-[32px]"></View>
              <View className="bg-accent rounded-full h-[12px] w-[12px]"></View>
            </View>
          </View>
        </View>

       

        <View className="flex flex-col gap-y-4">
          {/* <TouchableOpacity className="w-full bg-secondary h-[60px] rounded-[16px] justify-center items-center">
            <Link className="text-primary font-bold text-[18px]" href="/(tabs)">
              GET STARTED
            </Link>
          </TouchableOpacity> */}

        <View className="flex flex-row gap-x-4 w-full  h-[117.516px] mt-[50px]">
          <View className="flex flex-col w-1/2 p-[16px] border-r-[8px] border-b-[8px] rounded-[12px] justify-center gap-y-2">
            <View className="w-[33.097px] h-[33.097px] bg-secondary rounded-lg"></View>
            <Text className="text-white font-bold text-[14px]">
              STABLE COINS
            </Text>
            <Text className="text-[12px] text-highlight">7.8% APY</Text>
          </View>

          <View className="flex flex-col w-1/2 p-[16px] border-r-[8px] border-b-[8px] rounded-[12px] justify-center gap-y-2">
            <View className="w-[33.097px] h-[33.097px] bg-accent rounded-lg"></View>
            <Text className="text-white font-bold text-[14px]">BTC VAULt</Text>
            <Text className="text-highlight text-[12px]">7.8% APY</Text>
          </View>
        </View>

          <View className="flex flex-col gap-y-3">
           
            
            <TouchableOpacity 
              className="w-full bg-black border border-gray-600 h-[56px] rounded-[16px] justify-center items-center flex-row"
              onPress={loginWithApple}
              disabled={isAppleLoggingIn}
            >
              {isAppleLoggingIn ? (
                <>
                  <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-white font-semibold text-[16px]">Signing in...</Text>
                </>
              ) : (
                <>
                  <Text className="text-white font-semibold text-[16px]">Continue with Apple</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              className="w-full bg-white border border-gray-200 h-[56px] rounded-[16px] justify-center items-center flex-row"
              onPress={loginWithGoogle}
              disabled={isGoogleLoggingIn}
            >
              {isGoogleLoggingIn ? (
                <>
                  <View className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-2" />
                  <Text className="text-gray-600 font-semibold text-[16px]">Signing in...</Text>
                </>
              ) : (
                <>
                  <Text className="text-gray-800 font-semibold text-[16px]">Continue with Google</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          
          <View>
            <Text className="text-text font-semibold text-center text-[12px]">
              POWERED BY BTCFI ON STARKNET
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default onboarding;
