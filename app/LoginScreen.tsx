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

function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async () => {
    try {
      const loginUsersURL = "https://loginusers-g42pohnrxa-uc.a.run.app";
      const loginUser = await fetch(loginUsersURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      console.log(
        "Logging in with payload: " + JSON.stringify({ email, password })
      );
      const response = await loginUser.json();
      console.log(response);
      console.log("loginUsers Status: " + loginUser.status);
      if (loginUser.status === 200) {
        console.log("Login successful!");
      } else {
        console.log("Login failed!");
      }
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
