import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View, Text } from "react-native";

function SucceededPaymentScreen() {
  const router = useRouter();
  return (
    <View style={{         flex: 1,
      justifyContent: "center",
      alignItems: "center",}}>
      <Ionicons
        name="checkmark-circle-outline"
        size={40}
        style={{ color: "green" }}
      ></Ionicons>
      <View>
        <Text>฿500 Paid!</Text>
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
