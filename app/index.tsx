import { Button, Text, View } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ProfileScreen } from "@/components/ProfileScreen";
import { HomeScreen } from "@/components/HomeScreen";


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Index() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}


export default Index;