// SubmitProductScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useUserSession } from "../auth/firebaseAuth";
import { Dropdown } from "react-native-element-dropdown";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
global.Buffer = require("buffer").Buffer;

function SubmitProductScreen() {
  const user = useUserSession((state) => state.userInfo);
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(NaN);
  const [productDescription, setProductDescription] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [productStock, setProductStock] = useState<number>(NaN);
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

  const handleSubmit = async () => {
    const auth = getAuth();
    const userAuth = auth.currentUser;
    console.log("userAuth: ", userAuth);
    if (!userAuth) {
      console.log("not logged in");
      return;
    }
    const idToken = await SecureStore.getItemAsync('authToken');
    console.log("idToken:",idToken);
    try {
      const uploadawsS3URL =
        "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/uploadawsS3";
      const createProductURL =
        "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/createProduct";
      const getImagesURL = await fetch(uploadawsS3URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${idToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageBase64: imageBase64,
          contentType: contentType,
        }),
      });
      const response = await getImagesURL.json();
      console.log(response);
      const { imageUrl: productImageUrl, thumbnailUrl: productThumbnailUrl } =
        response;
      console.log("getImagesURL Status:", getImagesURL.status);

      if (getImagesURL.ok) {
        console.log("Got image URLs:", {
          imageUrl: productImageUrl,
          thumbnailUrl: productThumbnailUrl,
        });
        const createProductOnFirestore = await fetch(createProductURL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productName: productName,
            productPrice: productPrice,
            productDescription: productDescription,
            productCategory: productCategory,
            productImageUrl: productImageUrl,
            productThumbnailUrl: productThumbnailUrl,
            productStock: productStock,
            productOwner: user.email,
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

  const DropdownCategories = [
    { label: "Food", value: "food" },
    { label: "Electronic", value: "electronic" },
    { label: "Tool", value: "tool" },
  ];

  return (
    <View style={styles.mainContainer}>
      <TextInput
        style={styles.input}
        placeholder="Name..."
        value={productName}
        onChangeText={setProductName}
      />
      <TextInput
        style={styles.input}
        placeholder="Description..."
        value={productDescription}
        onChangeText={setProductDescription}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Price..."
        value={isNaN(productPrice) ? "" : productPrice.toString()}
        onChangeText={(num) => {
          setProductPrice(parseInt(num));
        }}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Stock..."
        value={isNaN(productStock) ? "" : productStock.toString()}
        onChangeText={(num) => {
          setProductStock(parseInt(num));
        }}
      />
      <Dropdown
        style={styles.dropdown}
        data={DropdownCategories}
        onChange={(item) => {
          setProductCategory(item.value);
        }}
        placeholder="Select Category"
        value={productCategory}
        labelField="label"
        valueField="value"
      />

      {imageIsSelected ? (
        <>
          <Text style={{ flexDirection: "row", alignItems: "center" }}>
            {imageName}
            <Pressable onPress={() => setImageIsSelected(false)}>
              <Ionicons name="close-sharp" size={20} color="red" />
            </Pressable>
          </Text>
        </>
      ) : (
        <>
          <Pressable
            onPress={handleFilePicking}
            style={styles.imageInputButton}
          >
            <Text style={styles.imageInputButtonText}>Pick an image!</Text>
          </Pressable>
        </>
      )}
      <Pressable onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>
          Submit a product!
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 0.8,
    borderRadius: 12.5,
    marginVertical: 10,
    paddingHorizontal: 10,
    width: 300,
  },
  dropdown: {
    margin: 16,
    height: 50,
    width: 300,
    borderWidth: 0.8,
    borderRadius: 12.5,
    alignItems: "center",
  },
  imageInputButton: {
    backgroundColor: "#ff4757",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  imageInputButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',

  },
  submitButton: {
    backgroundColor: "green",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    shadowColor: "#ff4757",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',

  },
});

export default SubmitProductScreen;
