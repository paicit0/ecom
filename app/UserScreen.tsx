// UserScreen.tsx
import { View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function UserScreen() {
    const handleGetUsers = () => {
        
    }

  return (
    <SafeAreaView>
      <Text>User</Text>
      <Pressable onPress={handleGetUsers}>
        <Text>Press to get Users Infos</Text>
      </Pressable>
    </SafeAreaView>
  );
}

export default UserScreen;
