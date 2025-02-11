import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { View, Text, StyleSheet, TextInput, Pressable } from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { Image } from "expo-image";
import { Svg, G } from "react-native-svg";
import apuPNG from "../assets/images/apuPNG.png";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
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
    <View style={styles.container}>
      <Image source={apuPNG} style={{ height: 200, width: 200 }} />
      <Svg
        width={200}
        height={200}
        viewBox="0 0 200 200"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <G>
          <G>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 190,
                  top: 310,
                  width: 32,
                  height: 25,
                  borderRadius: 15,
                  backgroundColor: "black",
                },
                animatedLeftEyeStyle,
              ]}
            />
          </G>

          <G>
            <Animated.View
              style={[
                {
                  position: "absolute",
                  left: 260,
                  top: 315,
                  width: 30,
                  height: 25,
                  borderRadius: 12,
                  backgroundColor: "black",
                },
                animatedRightEyeStyle,
              ]}
            />
          </G>
        </G>
      </Svg>
      <Pressable onPress={handleEyesPosition}>
        <Text>Big eye</Text>
      </Pressable>

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
