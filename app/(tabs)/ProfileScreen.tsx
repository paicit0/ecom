import { Link } from "expo-router";
import { View, Text, Pressable } from "react-native";
import { StyleSheet } from "react-native";
// @ts-ignore
import { useUserSession } from "../auth/firebaseAuth";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import * as SecureStore from "expo-secure-store";

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
    const idToken = await SecureStore.getItemAsync("authToken");
    console.log("idToken:", idToken);
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
    <View style={styles.profilesContainer}>
      {error && <Text style={styles.errorText}>{error}</Text>}
      {userIsSignedIn ? (
        <>
          <Text style={styles.text}>Welcome, {userInfoFromStore.email}</Text>
          <Link href={"/FavoriteScreen"} style={styles.link}>
            <Text style={styles.link}>Favorites</Text>
          </Link>
          {/* <Text style={styles.text}>Current Role: {userInfoFromStore.role}</Text> */}
          <Pressable onPress={() => logout()} style={styles.button}>
            <Text style={styles.buttonText}>Logout!</Text>
          </Pressable>
          {userInfoFromStore.role !== "seller" && (
            <Pressable onPress={handleSellerRegister} style={styles.button}>
              <Text style={styles.buttonText}>Become a seller!</Text>
            </Pressable>
          )}
        </>
      ) : (
        <>
          <Link href="/LoginScreen" style={styles.title}>
            <Text style={styles.title}>Login</Text>
          </Link>
          <Link href="/RegisterScreen" style={styles.title}>
            <Text style={styles.title}>Register</Text>
          </Link>
        </>
      )}
      {/* <Pressable onPress={() => console.log(userInfoFromStore)} style={styles.button}>
        <Text style={styles.buttonText}>Get user status</Text>
      </Pressable> */}
    </View>
  );
}

const styles = StyleSheet.create({
  profilesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f4f8",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#ffffff",
    backgroundColor: "#646ff0",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    shadowColor: "#646ff0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    marginVertical: 10,
    transform: [{ scale: 1 }],
  },
  text: {
    fontSize: 16,
    color: "#333",
    marginVertical: 8,
  },
  link: {
    fontSize: 16,
    color: "#646ff0",
    textDecorationLine: "underline",
    marginVertical: 8,
  },
  button: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    color: "#ff6b81",
    fontSize: 14,
    marginBottom: 10,
  },
});

export default ProfileScreen;
