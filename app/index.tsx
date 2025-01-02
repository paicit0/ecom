import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from "@/app/ProfileScreen";
import { HomeScreen } from "@/app/HomeScreen";
import { Stack } from "expo-router";

const Tab = createBottomTabNavigator();

function Index() {
  return (
    <Tab.Navigator screenOptions={{ headerShown : false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


export default Index;


