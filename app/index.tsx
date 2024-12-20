import { Button, Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from "@/app/ProfileScreen";
import { HomeScreen } from "@/app/HomeScreen";

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


