import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore


export function ProfileScreen() {
    return (
      <View style={profileStyles.profilesContainer}>
        <Text>Profiles!</Text>
      </View>
    );
  }

const profileStyles = StyleSheet.create({
  profilesContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    backgroundColor: 'red',
  }

});