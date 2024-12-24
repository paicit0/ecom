import React from "react";
import { View, Text, Pressable } from "react-native";

function UserScreen() {
    const handleGetUsers = () => {
        
    }

  return (
    <View>
      <Text>User</Text>
      <Pressable onPress={handleGetUsers}>
        <Text>Press to get Users Infos</Text>
      </Pressable>
    </View>
  );
}

export default UserScreen;
