import { Button, Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from "@/components/SettingsScreen";
import { HomeScreen } from "@/components/HomeScreen";


const Tab = createBottomTabNavigator();

export default function Index() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
    
  );
}
