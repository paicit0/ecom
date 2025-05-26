import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";

function SucceededPaymentScreen() {
  const router = useRouter();
  const { total } = useLocalSearchParams();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Ionicons
        name="checkmark-circle-outline"
        size={40}
        style={{ color: "green" }}
      />
      <View>
        <Text>฿{parseInt(total as string).toLocaleString()} Paid!</Text>
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

export default SucceededPaymentScreen;
