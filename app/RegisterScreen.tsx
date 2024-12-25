import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { RootStackParamList } from "./type/types";
import { useRoute, RouteProp } from "@react-navigation/native";

function RegisterScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "RegisterScreen">>();
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dataMessage, setDataMessage] = useState<string>("");

  const handleRegister = async () => {
    const registerUsersURL = "https://registerusers-g42pohnrxa-uc.a.run.app";

    try {
      if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return;
      } else if (password.length < 6) {
        console.log("Password must be at least 6 characters");
        return;
      } else if (userName.length < 5) {
        console.log("Username must be at least 5 characters");
        return;
      } else {
        console.log(
          "Registering with payload: " + JSON.stringify({ userName, password })
        );
        const response = await fetch(registerUsersURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName,
            password,
          }),
        });
        console.log(await response.text());
        const dataMessage = await response.json();
        setDataMessage(dataMessage.message);

        if (dataMessage.userName) {
          console.log("Username from backend" + dataMessage.username);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <Text>{dataMessage}</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={userName}
        onChangeText={(text) => setUserName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={(text) => setConfirmPassword(text)}
      />
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: 300,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
    width: 300,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default RegisterScreen;
