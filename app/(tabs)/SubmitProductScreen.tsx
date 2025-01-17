import { useState } from "react";
import { View, Text } from "react-native";

function SubmitProductScreen() {
  const [product, setProduct] = useState({});
  return (
    <View>
      <Text>SubmitProductScreen</Text>
    </View>
  );
}

export default SubmitProductScreen;
