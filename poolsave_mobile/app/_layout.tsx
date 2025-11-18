import { Stack } from "expo-router";
import "../global.css";
import { StatusBar } from "react-native";
import { AccountProvider } from "@/context/UserContext";
import { AegisProvider } from '@cavos/aegis'



export default function RootLayout() {
  return (
    <>
    {/* <AccountProvider>  */}
      <AegisProvider
         config={{
          network: 'SN_SEPOLIA', // or 'mainnet'
          appId: 'app-d5004c209e9d323af9f182758363ef94', // Required: Get from https://aegis.cavos.xyz
          appName: 'SaveQuest',
          // paymasterApiKey: 'your-key', // Optional: For gasless transactions
          enableLogging: true // Optional: For debugging
        }}
      >
      <StatusBar  />

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#1A1A1A' },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      </AegisProvider>
      {/* </AccountProvider> */}
    </>
  );
}