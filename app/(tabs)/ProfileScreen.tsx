import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../auth/firebaseAuth";
function ProfileScreen() {
  const { userIsSignedIn, logout } = useUserSession();
  const userInfoFromStore = useUserSession((state) => state.userInfo);
  return (
    <View style={profileStyles.profilesContainer}>
      {userIsSignedIn ? (
        <>
          <Text>User: {userInfoFromStore.email}</Text>
          <Text>Current Role: {userInfoFromStore.role}</Text>
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
