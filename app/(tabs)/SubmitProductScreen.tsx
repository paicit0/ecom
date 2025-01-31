// SubmitProductScreen.tsx
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { useUserSession } from "../auth/firebaseAuth";
import { Dropdown } from "react-native-element-dropdown";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
global.Buffer = require("buffer").Buffer;

function SubmitProductScreen() {
  const user = useUserSession((state) => state.userInfo);
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(NaN);
  const [productDescription, setProductDescription] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [productStock, setProductStock] = useState<number>(NaN);
  const [imageIsSelected, setImageIsSelected] = useState<boolean>(false);
  const [imageName, setImageName] = useState<string[]>([]);
  const [imageBase64, setImageBase64] = useState<string[]>([]);
  const [imageUri, setImageUri] = useState<string[]>([]);
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
        setImageName([...imageName, docRes.assets[0].name]);
        setImageBase64([...imageBase64, fileContent]);
        setImageUri([...imageUri, docRes.assets[0].uri]);
        setContentType(docRes.assets[0].mimeType ?? "");
        setImageIsSelected(true);
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
    const idToken = await SecureStore.getItemAsync("authToken");
    console.log("idToken:", idToken);
    try {
      const uploadawsS3 =
        process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
          ? process.env.EXPO_PUBLIC_uploadawsS3_emulator
          : process.env.EXPO_PUBLIC_uploadawsS3_prod;

      const createProduct =
        process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
          ? process.env.EXPO_PUBLIC_createProduct_prod
          : process.env.EXPO_PUBLIC_createProduct_emulator;
      if (!uploadawsS3 || !createProduct) {
        console.log("urls not bussing!");
        return;
      }
      const getImagesURL = await axios.post(
        uploadawsS3,
        { imageBase64: imageBase64, contentType: contentType },
        {
          method: "POST",
          headers: {
            authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("payload:", imageBase64, contentType);
      const response = await getImagesURL.data;
      console.log(response);
      const { imageUrl: productImageUrl, thumbnailUrl: productThumbnailUrl } =
        response;
      console.log("getImagesURL Status:", getImagesURL.status);

      if (getImagesURL.status === 200) {
        console.log("Got image URLs:", {
          imageUrl: productImageUrl,
          thumbnailUrl: productThumbnailUrl,
        });
        const createProductOnFirestore = await axios.post(
          createProduct,
          {
            productName: productName,
            productPrice: productPrice,
            productDescription: productDescription,
            productCategory: productCategory,
            productImageUrl: productImageUrl,
            productThumbnailUrl: productThumbnailUrl,
            productStock: productStock,
            productOwner: user.email,
          },
          {
            method: "POST",
            headers: {
              authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (createProductOnFirestore.status === 200) {
          console.log(
            "createProductOnFirestore",
            createProductOnFirestore.status
          );
        }
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
      <View style={styles.imageContainer}>
        {imageIsSelected ? (
          <>
            {imageUri.map((uri, index) => (
              <View key={index} style={{ flexDirection: "column" }}>
                <Text>Image No. {index + 1}</Text>
                <Image style={{ height: 200, width: 200 }} source={{ uri }} />
              </View>
            ))}
            {imageName.length < 3 && imageName ? (
              <>
                <Pressable onPress={handleFilePicking}>
                  <Ionicons name="add-outline" size={20} />
                </Pressable>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Pressable
              onPress={handleFilePicking}
              style={styles.imageInputButton}
            >
              <View style={{ height: 200, width: 200 }}></View>
              <Text style={styles.imageInputButtonText}>Browse</Text>
            </Pressable>
          </>
        )}
      </View>

      {imageName.length > 0 && (
        <>
          <Pressable
            onPress={() => {
              setImageIsSelected(false);
              setImageName([]);
              setImageBase64([]);
              setImageUri([]);
            }}
          >
            <Ionicons name="close-sharp" size={20} color="red" />
          </Pressable>
        </>
      )}

      <Text style={{ flexDirection: "row", alignItems: "center" }}>
        {imageName.map((image, index) => (
          <View key={index}>
            <Text key={index}>{imageName[index]}</Text>
          </View>
        ))}
      </Text>
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

      <Pressable onPress={handleSubmit} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit a product!</Text>
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
  imageContainer: {
    flexDirection: "row",
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
    backgroundColor: "grey",
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
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
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default SubmitProductScreen;
