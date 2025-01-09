import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../storeSession";

function ProfileScreen() {
  const { userIsSignedIn, logout } = useUserSession();
  const sessionEmail = useUserSession((state) => state.email);
  return (
    <View style={profileStyles.profilesContainer}>
      {userIsSignedIn ? (
        <>
          <Text>User: {sessionEmail}</Text>
          <Pressable onPress={() => logout()}>
            <Text>Logout!</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Link href="/LoginScreen" style={profileStyles.title}>
            <Text>Login</Text>
          </Link>
          <Link href="/RegisterScreen" style={profileStyles.title}>
            <Text>Register</Text>
          </Link>
        </>
      )}
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
  },
});

export default ProfileScreen;
