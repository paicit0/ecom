import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../storeSession";

function ProfileScreen() {
  const { userIsSignedIn, logout } = useUserSession();
  return (
    <View style={profileStyles.profilesContainer}>
      {userIsSignedIn ? (
        <Pressable onPress={()=> logout()}><Text>Logout!</Text></Pressable>
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

      <Text>Profiles!</Text>

      <Pressable onPress={() => console.log(userIsSignedIn)}>
        <Text>check user signed in</Text>
      </Pressable>
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
