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
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [imageBase64s, setImageBase64s] = useState<string[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string>("");

  const handleFilePicking = async () => {
    console.log("handleFilePicking");
    try {
      const docRes = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });
      // console.log(docRes);
      if (docRes.assets) {
        const fileContent = await FileSystem.readAsStringAsync(
          docRes.assets[0].uri,
          {
            encoding: FileSystem.EncodingType.Base64,
          }
        );
        setImageNames([...imageNames, docRes.assets[0].name]);
        setImageBase64s([...imageBase64s, fileContent]);
        setImageUris([...imageUris, docRes.assets[0].uri]);
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
    console.log("auth.currentUser: ", auth.currentUser);
    if (!userAuth) {
      console.log("not logged in");
      return;
    }
    const idToken = await SecureStore.getItemAsync("authToken");
    console.log("idToken:", idToken);

    const uploadawsS3 =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_uploadawsS3_emulator
        : process.env.EXPO_PUBLIC_uploadawsS3_prod;

    const createProduct =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_createProduct_emulator
        : process.env.EXPO_PUBLIC_createProduct_prod;
    if (!uploadawsS3 || !createProduct) {
      console.log("SubmitProductScreen: urls not bussing!");
      return;
    }
    try {
      console.log("try block reached");
      console.log("uploadawsS3 url:", uploadawsS3);
      const getImagesURLs = await axios.post(
        uploadawsS3,
        { imageBase64: imageBase64s, contentType: contentType },
        {
          headers: {
            authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(getImagesURLs.status);
      console.log("payload:", imageBase64s.length, contentType);
      const response = await getImagesURLs.data;
      console.log("getImagesURL Status:", getImagesURLs.status);

      if (getImagesURLs.status === 200) {
        console.log("Got image URLs:", {
          imageUrl: response.resImageUrlArray,
          thumbnailUrl: response.resThumbnailUrlArray,
        });
        try {
          console.log(`SubmitProductScreen Sendings: Token: ${idToken}`);
          console.log("createProduct url:", createProduct);
          const createProductOnFirestore = await axios.post(
            createProduct,
            {
              productName: productName,
              productPrice: productPrice,
              productDescription: productDescription,
              productCategory: productCategory,
              productImageUrl: response.resImageUrlArray,
              productThumbnailUrl: response.resThumbnailUrlArray,
              productStock: productStock,
              productOwner: user.email,
            },
            {
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
        } catch (error) {
          if (axios.isAxiosError(error)) {
            if (error.response) {
              console.log(
                "SubmitProductScreen.createProductOnFirestore response:",
                error.response.data.error
              );
            } else {
              console.log(
                "SubmitProductScreen.createProductOnFirestore:",
                error
              );
            }
          }
        }
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.log(
            "SubmitProductScreen.getImagesURL response:",
            error.response.data.error
          );
        }
      } else {
        console.log("SubmitProductScreen.getImagesURL:", error);
      }
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
            {imageUris.map((uri, index) => (
              <View key={index} style={{ flexDirection: "column" }}>
                <Text>Image No. {index + 1}</Text>
                <Image
                  style={{ height: 200, width: 200 }}
                  source={{ uri: uri }}
                />
                <Pressable
                  onPress={() => {
                    if (imageUris.length === 0) {
                      setImageIsSelected(false);
                    }
                    setImageUris(imageUris.filter((img) => img !== uri));
                  }}
                >
                  <Ionicons name="close-sharp" size={20} color="red" />
                </Pressable>
              </View>
            ))}
            {imageNames.length < 3 && imageNames ? (
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

      {/* {imageName.length > 0 && <></>} */}

      {/* <Text style={{ flexDirection: "row", alignItems: "center" }}>
        {imageName.map((image, index) => (
          <View key={index}>
            <Text key={index}>{imageName[index]}</Text>
          </View>
        ))}
      </Text> */}
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
