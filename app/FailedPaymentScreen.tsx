import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";

function FailedPaymentScreen() {
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons
        name="close-circle-outline"
        size={40}
        style={{ color: "red" }}
      />
      <View>
        <Text>The payment was not successful!</Text>
      </View>
      <Pressable
        style={{
          backgroundColor: "#fff",
          padding: 10,
          borderRadius: 5,
          marginTop: 10,
        }}
        onPress={() => router.replace("/(tabs)/HomeScreen")}
      >
        <Text>Go back</Text>
      </Pressable>
    </View>
  );
}

export default FailedPaymentScreen;
