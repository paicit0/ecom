// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSession } from "../auth/firebaseAuth";
import { View, StyleSheet, Dimensions, Text } from "react-native";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";

export default function TabsLayout() {
  const auth = getAuth();
  const userAuth = auth.currentUser;
  const userInfoFromStore = useUserSession((state) => state.userInfo);

  useEffect(() => {
    if (userInfoFromStore && userAuth) {
      console.log("app/(tabs)/_layout: mounted");
    }
  }, [userInfoFromStore, userAuth]);

  type styleType = {
    focused: boolean;
    size: number;
    color: string;
  };

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.tabBarLabel,
        }}
      >
        <Tabs.Screen
          name="HomeScreen"
          options={{
            tabBarLabel: ({ focused, color }: styleType) => (
              <Text style={{ color: focused ? "orange" : color }}>Home</Text>
            ),
            tabBarIcon: ({ color, size, focused }: styleType) => (
              <Ionicons
                name="home-outline"
                size={size}
                color={focused ? "orange" : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="ProfileScreen"
          options={{
            tabBarLabel: ({ color, focused }: styleType) => (
              <Text style={{ color: focused ? "orange" : color }}>Profile</Text>
            ),
            tabBarIcon: ({ color, size, focused }: styleType) => (
              <Ionicons
                name="person-outline"
                size={size}
                color={focused ? "orange" : color}
              />
            ),
            href: "ProfileScreen",
          }}
        />
        <Tabs.Screen
          name="SubmitProductScreen"
          options={{
            tabBarLabel: ({ color, focused }: styleType) => (
              <Text style={{ color: focused ? "orange" : color }}>Submit</Text>
            ),
            tabBarIcon: ({ color, size, focused }: styleType) => (
              <Ionicons
                name="add-circle-outline"
                size={size}
                color={focused ? "orange" : color}
              />
            ),
            href:
              userInfoFromStore.userRole === "seller" && userAuth
                ? "SubmitProductScreen"
                : null,
          }}
        />
        <Tabs.Screen
          name="MapScreen"
          options={{
            tabBarLabel: ({ color, focused }: styleType) => (
              <Text style={{ color: focused ? "orange" : color }}>Map</Text>
            ),
            tabBarIcon: ({ color, size, focused }: styleType) => (
              <Ionicons
                name="map"
                size={size}
                color={focused ? "orange" : color}
              />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="test"
          options={{
            tabBarLabel: "test",
            tabBarIcon: ({ color, size, focused }: styleType) => (
              <Ionicons
                name="map"
                size={size}
                color={focused ? "orange" : color}
              />
            ),
            href: null,
          }}
        />
      </Tabs>
    </View>
  );
}
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  tabBar: {
    height: deviceHeight * 0.088,
    backgroundColor: "white",
  },
  tabBarItem: {
    paddingBottom: 30,
  },
  tabBarLabel: { fontSize: 12, fontWeight: "700" },
});
