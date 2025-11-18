import { Stack, Tabs } from "expo-router";
import { ImageBackground, Image, Text, View } from "react-native";
import { ICONS } from "@/constants/icons";

function TabIcon({ focused, icon, title }: any) {
  if (focused) {
    return (
        <Image source={icon} tintColor={"#00D4D4"} />  
    );
  }

  return (
    // <View className="size-full justify-center items-center mt-4 rounded-full">
      <Image source={icon}  />
    // </View>
  );
}

export default function TabsLayout() {
  return <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#00D4D4',
      tabBarStyle: { 
        backgroundColor: '#1A1A1A',
        borderColor: "#00D4D4",
        borderTopWidth: 4,
        height: 88,
      },
    }}
  >
    <Tabs.Screen
      name="index"
      options={{
        title: "HOME",
        headerShown: false,
        tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ICONS.home} />
          ),
      }}
    />
    <Tabs.Screen
      name="pools"
      options={{
        title: "POOLS",
        headerShown: false,
         tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ICONS.pools} />
          ),
      }}
    />

    <Tabs.Screen
      name="savings"
      options={{
        title: "SAVINGS",
        headerShown: false,
         tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ICONS.savings} />
          ),
      }}
    />

    <Tabs.Screen
      name="profile"
      options={{
        title: "PROFILE",
        headerShown: false,
         tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={ICONS.profile} />
          ),
      }}
    />
  </Tabs>
}
