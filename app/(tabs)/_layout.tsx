// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUserSession } from "../auth/firebaseAuth";
import { View, StyleSheet, Dimensions } from "react-native";
import { getAuth } from "firebase/auth";

export default function TabsLayout() {
  const auth = getAuth();
  const userAuth = auth.currentUser;
  console.log("(tabs)/_layout: userAuth.email:", userAuth?.email);
  const userInfoFromStore = useUserSession((state) => state.userInfo);

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
            tabBarLabel: "Submit",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="add-circle" size={size} color={color} />
            ),
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
      </Tabs>
    </View>
  );
}
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;
console.log(deviceHeight);

const styles = StyleSheet.create({
  tabBar: {
    // fix later. make the icon stay at the top of bar
    height: deviceHeight * 0.0765,
    backgroundColor: "white",
  },
  tabBarItem: {
    paddingBottom: 20,
  },
  tabBarLabel: { fontSize: 12, fontWeight: "700" },
});
