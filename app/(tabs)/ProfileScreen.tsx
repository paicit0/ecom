import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../auth/firebaseAuth";
function ProfileScreen() {
  const { userIsSignedIn, logout } = useUserSession();
  const userInfoFromStore = useUserSession((state) => state.userInfo);

  const handleSellerRegister = async () => {
    const emulatorRegisterSellersURL =
      "http://127.0.0.1:5001/ecom-firestore-11867/us-central1/registerSellers";
    try {
      console.log("Trying to fetch!");
      const req = await fetch(emulatorRegisterSellersURL, {
        method: "POST",
        body: JSON.stringify({ email: userInfoFromStore.email }),
      });
      const res = await req.json();
      console.log(res.status);
    } catch (error) {
      console.error(error);
    }
  };

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
      {userInfoFromStore.role !== "seller" && (
        <Pressable onPress={handleSellerRegister}>
          <Text>Become a seller!</Text>
        </Pressable>
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
