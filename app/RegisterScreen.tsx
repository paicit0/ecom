import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import "firebase/compat/database";
import { Link, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, useUserSession } from "./auth/firebaseAuth";
import axios from "axios";

function RegisterScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataMessage, setDataMessage] = useState<string>("");
  const [error, setError] = useState("");

  const login = useUserSession((state) => state.login);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    const registerUsersUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_registerUsers_emulator
        : process.env.EXPO_PUBLIC_registerUsers_prod;

    if (!registerUsersUrl) {
      console.error("RegisterScreen.handleRegister url not bussing!");
      return;
    }
    try {
      if (password !== confirmPassword) {
        console.error("Passwords do not match");
        return;
      } else if (password.length < 6) {
        console.error("Password must be at least 6 characters");
        return;
      } else if (email.length < 5) {
        console.error("Email must be at least 5 characters");
        return;
      } else {
        console.log(
          "Registering with payload: " + JSON.stringify({ email, password })
        );
        let uid;
        const registerFirebaseAuth = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        )
          .then((userCredential) => {
            uid = userCredential.user.uid;
            console.log("createUserWithEmailAndPassword successful.");
            return true;
          })
          .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error(errorMessage);
            return false;
          });
        console.log("RegisterScreen: payload:", uid, email);
        if (registerFirebaseAuth) {
          const registerUser = await axios.post(
            registerUsersUrl,
            { uid: uid, email: email },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          console.log(
            "RegisterScreen: registerUser.status:",
            registerUser.status
          );
          if (registerUser.status === 201) {
            const data = await registerUser.data;
            console.log("RegisterScreen: registerUser.data", data);
            setDataMessage(data.message);
            console.log("RegisterScreen: Logging in with:", email, password);
            const tryLogin = await login(email, password);
            console.log("RegisterScreen: tryLogin returns:", tryLogin);
            if (tryLogin.success) {
              console.log(
                "RegisterScreen: tryLogin.success, redirecting to:../(tabs)/HomeScreen"
              );
              router.replace("../(tabs)/HomeScreen");
              return;
            } else {
              console.error("RegisterScreen: Login failed");
            }
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text>Registering your account! ...</Text>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

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
