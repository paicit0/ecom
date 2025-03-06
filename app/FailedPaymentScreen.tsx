import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";

function FailedPaymentScreen() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignContent: "center" }}>
      <Ionicons name="close-circle-outline" size={40}></Ionicons>
      <View>
        <Text>The payment was not successful!</Text>
      </View>
      <Pressable onPress={() => router.replace("/(tabs)/HomeScreen")}>
        <Text>Go back?</Text>
      </Pressable>
    </View>
  );
}

export default FailedPaymentScreen;
