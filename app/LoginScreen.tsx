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
      const loginUser = await fetch(loginUsersURL);
      const response = await loginUser.json();
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View>
      <Text>LoginScreen</Text>
      <TextInput style={styles.input} placeholder="Email"></TextInput>
      <TextInput style={styles.input} placeholder="Password"></TextInput>
      <Pressable onPress={() => handleLogin()}>
        <Text>Login!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
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
