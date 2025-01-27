import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../auth/firebaseAuth";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
function ProfileScreen() {
  const [error, setError] = useState("");
  const userIsSignedIn = useUserSession((state) => state.userIsSignedIn);
  const logout = useUserSession((state) => state.logout);
  const userInfoFromStore = useUserSession((state) => state.userInfo);
  const { getUserInfo } = useUserSession();

  useEffect(() => {
    console.log(userInfoFromStore.role);
  }, []);

  useEffect(() => {
    if (userIsSignedIn) {
      setError("");
    }
  }, [userIsSignedIn]);

  const handleSellerRegister = async () => {
    const auth = getAuth();
    const userAuth = auth.currentUser;
    console.log("userAuth: ", userAuth);
    if (!userAuth) {
      console.log("not logged in");
      return;
    }
    const idToken = await userAuth.getIdToken();
    if (!userIsSignedIn) {
      setError("Please sign in first!");
      return;
    }
    const emulatorRegisterSellersURL =
      "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/registerSellers";
    try {
      console.log("Trying to register with: ", userInfoFromStore.email);
      const req = await fetch(emulatorRegisterSellersURL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userInfoFromStore.email }),
      });
      console.log(req.status);
      if (req.status === 200) {
        getUserInfo(userInfoFromStore.email);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={profileStyles.profilesContainer}>
      {<Text>{error}</Text>}
      {userIsSignedIn ? (
        <>
          <Text>User: {userInfoFromStore.email}</Text>
          <Text>Current Role: {userInfoFromStore.role}</Text>
          <Pressable onPress={() => logout()}>
            <Text>Logout!</Text>
          </Pressable>
          {userInfoFromStore.role !== "seller" && (
            <Pressable onPress={handleSellerRegister}>
              <Text>Become a seller!</Text>
            </Pressable>
          )}
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
      <Pressable onPress={() => console.log(userInfoFromStore)}>
        <Text>Get user status</Text>
      </Pressable>
    </View>
  );
}

const profileStyles = StyleSheet.create({
  profilesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    justifyContent: "center",
    padding: 16,
    backgroundColor: "yellow",
  },
});

export default ProfileScreen;
