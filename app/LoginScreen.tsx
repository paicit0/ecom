import { Ionicons } from "@expo/vector-icons";
import { Link, Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const login = useUserSession((state) => state.login);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    try {
      console.log("LoginScreen: Trying to login... ", email);
      const tryLogin = await login(email, password);
      console.log("LoginScreen: tryLogin returns:", tryLogin);
      if (tryLogin.success) {
        console.log(
          "LoginScreen: tryLogin.success redirecting to:../(tabs)/HomeScreen"
        );
        router.replace("../(tabs)/HomeScreen");
        return;
      } else {
        console.error("LoginScreen: Login failed");
      }
    } catch (error) {
      console.error("LoginScreen: Error during login:", error);
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
        <Text>Trying to get you signed in...</Text>
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Link href="../(tabs)/HomeScreen">
        <Ionicons name="arrow-back-outline" size={20}></Ionicons>
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
        secureTextEntry
        value={password}
        onChangeText={(text) => setPassword(text)}
      ></TextInput>
      <Pressable onPress={handleLogin}>
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
