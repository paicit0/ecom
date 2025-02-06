import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
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
      if (!email || !password) {
        console.error("LoginScreen: No email or password!");
        return;
      }
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
      <View style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={loading} />
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
