//SubmitProductScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { doc } from "firebase/firestore";

function SubmitProductScreen() {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageIsSelected, setImageIsSelected] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string>("");

  const handleFilePicking = async () => {
    console.log("handleFilePicking");
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });
      console.log(docRes);
      if (docRes.assets) {
        setImageIsSelected(true);
        setImageName(docRes.assets[0].name);
      }
    } catch (error) {
      console.log("File selecting error: ", error);
    }
  };

  const handleSubmit = (req: any) => {
    try {
      const {productName, productPrice, imageUrl} = req.body
      // fetch awsS3 api to create a url for image
      // setImageURL
      // fetch createProduct api
      console.log("handleSubmitt");
    } catch (error) {
      console.log("Submitting error: ", error);
    }
  };
  useEffect(() => {}, []);

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
      {imageIsSelected ? (
        <>
          <Text>{imageName}</Text>
          <Pressable onPress={() => setImageIsSelected(false)}>
            <Text>Clear</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            onPress={handleFilePicking}
            style={{ borderWidth: 1, margin: 10, padding: 10 }}
          >
            <Text>Pick a picture</Text>
          </Pressable>
        </>
      )}
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
