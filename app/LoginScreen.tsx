// LoginScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Dimensions,
} from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { Image } from "expo-image";
import ApuSVG from "../assets/svgs/ApuSVG.svg";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

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
      const { success, message } = await login(email, password);
      console.log("LoginScreen: login:", success);
      if (success) {
        console.log("LoginScreen: redirecting to:../(tabs)/HomeScreen");
        router.replace("/(tabs)/HomeScreen");
      } else {
        console.error("LoginScreen: Login failed:", message);
      }
    } catch (error) {
      console.error("LoginScreen: Error during login:", error);
    } finally {
      setLoading(false);
    }
  };

  const eyePosition = useSharedValue(0);
  const textPosition = useSharedValue(0);
  const animatedLeftEyeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: eyePosition.value === 0 ? 1 : 0 }],
    };
  });

  const animatedRightEyeStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: eyePosition.value === 0 ? 1 : 0 }],
    };
  });

  const handleEyesPosition = () => {
    return (eyePosition.value = eyePosition.value + 50);
  };
  const handleTextPosition = () => {
    return (textPosition.value = textPosition.value + 1);
  };

  if (loading) {
    return (
      <View style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={loading} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ApuSVG width={200} height={200} />
      <Pressable onPress={handleEyesPosition}>
        <Text>Big eye</Text>
      </Pressable>

      <Link href="../(tabs)/ProfileScreen">
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
    </SafeAreaView>
  );
}

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
