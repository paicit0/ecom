// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSession } from "../auth/firebaseAuth";
import { View, StyleSheet, Dimensions } from "react-native";
import { getAuth } from "firebase/auth";
import { useEffect } from "react";

export default function TabsLayout() {
  const auth = getAuth();
  const userAuth = auth.currentUser;
  const userInfoFromStore = useUserSession((state) => state.userInfo);

  useEffect(() => {
    if (userInfoFromStore && userAuth) {
      console.log("app/(tabs)/_layout: mounted")
    }
  }, [userInfoFromStore, userAuth]);

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
            tabBarLabel: "Home",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={"orange"} />
            ),
          }}
        />
        <Tabs.Screen
          name="ProfileScreen"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={"orange"} />
            ),
          }}
        />
        <Tabs.Screen
          name="SubmitProductScreen"
          options={{
            tabBarLabel: "Submit",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle-outline" size={size} color={"orange"} />
            ),
            // to fix
            // the condition is not checked on app start, only when going to other Tabs.
            tabBarButton:
              userInfoFromStore.userRole === "seller" && userAuth
                ? undefined
                : () => null,
          }}
        />
        <Tabs.Screen
          name="MapScreen"
          options={{
            tabBarLabel: "Map",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
            ),
            href: null,
          }}
        />
        <Tabs.Screen
          name="test"
          options={{
            tabBarLabel: "test",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map" size={size} color={color} />
              
            ),
            href:null,
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
    height: deviceHeight * 0.0765,
    backgroundColor: "white",
  },
  tabBarItem: {
    paddingBottom: 20,
  },
  tabBarLabel: { fontSize: 12, fontWeight: "700" },
});
