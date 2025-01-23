// SubmitProductScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useUserSession } from "../auth/firebaseAuth";
global.Buffer = require("buffer").Buffer;

function SubmitProductScreen() {
  const user = useUserSession((state) => state.userInfo.email);
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string>("");
  const [imageIsSelected, setImageIsSelected] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string>("");
  const [imageBase64, setImageBase64] = useState<string>("");
  const [contentType, setContentType] = useState<string>("");

  const handleFilePicking = async () => {
    console.log("handleFilePicking");
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });
      console.log(docRes);
      if (docRes.assets) {
        const fileContent = await FileSystem.readAsStringAsync(
          docRes.assets[0].uri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        setImageBase64(fileContent);
        setContentType(docRes.assets[0].mimeType ?? "");
        setImageIsSelected(true);
        setImageName(docRes.assets[0].name);
      }
    } catch (error) {
      console.log("File selecting error: ", error);
    }
  };

  /**
   * Handles the submission of product data and image upload.
   *
   * This function first uploads the selected image to AWS S3 via a Cloud Function,
   * obtaining URLs for the original image and its thumbnail. It then sets these URLs
   * in the state and sends a request to create a new product in a Firestore collection.
   *
   * @throws Will log an error message if the submission process fails at any point.
   */

  const handleSubmit = async () => {
    try {
      const uploadawsS3URL =
        "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/uploadawsS3";
      const createProductURL =
        "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/createProduct";
      const getImagesURL = await fetch(uploadawsS3URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          contentType: contentType,
        }),
      });
      const response = await getImagesURL.json();
      console.log(response);
      const { imageUrl, thumbnailUrl } = response;
      console.log("getImagesURL Status:", getImagesURL.status);

      if (getImagesURL.ok) {
        console.log("Got image URLs:", {
          imageUrl,
          thumbnailUrl,
        });
        const createProductOnFirestore = await fetch(createProductURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: productName,
            productPrice: productPrice,
            imageUrl: imageUrl,
            thumbnailUrl: thumbnailUrl,
            owner: user,
          }),
        });
        console.log(
          "createProductOnFirestore Status: ",
          createProductOnFirestore.status
        );
      }
    } catch (error) {
      console.log("Submitting error: ", error);
    }
  };

  const handleOnPriceInputChange = (text: any) => {
    if (!isNaN(text)) {
      setProductPrice(text);
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
        keyboardType="numeric"
        placeholder="Price..."
        value={productPrice}
        onChangeText={handleOnPriceInputChange}
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
