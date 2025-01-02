import { Link } from "expo-router";
import { View, Text } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore

function ProfileScreen() {
  return (
    <View style={profileStyles.profilesContainer}>
      <Text>Profiles!</Text>
      <Link href="/LoginScreen" style={profileStyles.title}>
        <Text>Login</Text>
      </Link>
      <Link href="/RegisterScreen" style={profileStyles.title}>
        <Text>Register</Text>
      </Link>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  profilesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor: "red",
  },
  title: {
    justifyContent: "center",
    padding: 16,
    backgroundColor: "yellow",
  }
});

export default ProfileScreen;
