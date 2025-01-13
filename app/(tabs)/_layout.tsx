// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSession } from "../auth/firebaseAuth";

export default function TabsLayout() {
  const userInfoFromStore = useUserSession((state) => state.userInfo);

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="HomeScreen"
        options={{
          tabBarLabel: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ProfileScreen"
        options={{
          tabBarLabel: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="SubmitProductScreen"
        options={{
          tabBarLabel: "Submit Product",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle" size={size} color={color} />
          ),
          tabBarButton: userInfoFromStore.role === "seller" ? undefined : () => null,
        }}
      />
    </Tabs>
  );
}
