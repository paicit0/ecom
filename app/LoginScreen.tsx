import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";

function LoginScreen() {
  const handleLogin = () => {
    console.log("Login");
  };

  return (
    <View>
      <Text>LoginScreen</Text>
      <TextInput style={styles.input} placeholder="Username"></TextInput>
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
