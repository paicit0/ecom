//SubmitProductScreen.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from 'expo-document-picker';

function SubmitProductScreen() {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");

  const handleSubmit = () => {
    // fetch awsS3 api to create a url for image
    // setImageURL
    // fetch createProduct api
    console.log("handle it");
  };
  return (
    <View style={style.mainContainer}>
      <TextInput
        style={style.input}
        placeholder="Name..."
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={style.input}
        placeholder="Price..."
        value={productPrice}
        onChangeText={setProductPrice}
      />
      <Pressable
        onPress={handleSubmit}
        style={{ borderWidth: 1, margin: 10, padding: 10 }}
      >
        <Text>Submit</Text>
      </Pressable>
    </View>
  );
}

const style = StyleSheet.create({
  mainContainer: {
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

export default SubmitProductScreen;
