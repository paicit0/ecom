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
  const [hello, setHello] = useState<string>("");
  const handleLogin = () => {
    console.log("Login");
  };

  // const handleTest = async () => {
  //   try {
  //     const helloResponse = await fetch("https://helloworld-g42pohnrxa-uc.a.run.app");
  //     const helloResponseData = await helloResponse.text();
  //     setHello(helloResponseData);
  //     console.log(helloResponse);
  //     console.log(helloResponseData);

  //   } catch(error) {
  //     console.log(error);
  //   }
  // }

  return (
    <View>
      <Text>LoginScreen</Text>
      {/* <Text>{hello}</Text>
      <Pressable onPress={handleTest}><Text>TEST API HERE</Text></Pressable> */}
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
