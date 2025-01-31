import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";
import "firebase/compat/database";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./auth/firebaseAuth";
import axios from "axios";

function RegisterScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [dataMessage, setDataMessage] = useState<string>("");
  const [error, setError] = useState("");
  const handleRegister = async () => {
    const registerUsers =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_registerUsers_emulator
        : process.env.EXPO_PUBLIC_registerUsers;

    if (!registerUsers) {
      console.log("url not bussing!");
      return;
    }
    try {
      if (password !== confirmPassword) {
        console.log("Passwords do not match");
        return;
      } else if (password.length < 6) {
        console.log("Password must be at least 6 characters");
        return;
      } else if (email.length < 5) {
        console.log("Email must be at least 5 characters");
        return;
      } else {
        console.log(
          "Registering with payload: " + JSON.stringify({ email, password })
        );

        const registerFirebaseAuth = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
          .then((userCredential) => {
            const user = userCredential.user;
            console.log("Registered on Firebase Authentication!");
            return true;
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.log(errorMessage);
            return false;
          });

        if (registerFirebaseAuth) {
          const registerUser = await axios.post(
            registerUsers,
            { email: email },
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (registerUser.status === 200) {
            const data = await registerUser.data;
            setDataMessage(data.message);
            console.log(data.message);
            if (data.error) {
              console.log(data.error);
            }
          }
        }
      }
    } catch (error: any) {
      setError(error);
      console.log(error);
    }
  };

  return (
    <View style={styles.container}>
      <Link href="../(tabs)/HomeScreen">
        <Ionicons name="arrow-back-outline" size={20}></Ionicons>
      </Link>
      <Text style={styles.title}>Register</Text>
      <Text>{dataMessage}</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={(text) => setEmail(text)}
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
