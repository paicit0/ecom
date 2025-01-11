import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./auth/firebaseAuth";
import { useUserSession } from "./store/storeSession";
import { loginSaveSecureStore } from "./auth/firebaseAuth";

function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { userIsSignedIn, login, logout, storeEmail } = useUserSession();

  const handleLogin = async () => {
    try {
      loginSaveSecureStore(email, password);
      login();
      storeEmail(email);
      console.log("Trying to login... ", email);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Link href="../(tabs)/HomeScreen">
        <Ionicons name="arrow-back-outline"></Ionicons>
      </Link>
      <Text>LoginScreen</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
      ></TextInput>
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      ></TextInput>
      <Pressable onPress={() => handleLogin()}>
        <Text>Login!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: 300,
  },
});

export default LoginScreen;
