// SubmitProductScreen.tsx
import { useState } from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { StyleSheet } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Dropdown } from "react-native-element-dropdown";
import { getAuth } from "firebase/auth";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { useUploadAwsS3 } from "../../hooks/fetch/useUploadAwsS3";
import { useCreateProduct } from "../../hooks/fetch/useCreateProduct";
import { SafeAreaView } from "react-native-safe-area-context";
global.Buffer = require("buffer").Buffer;

function SubmitProductScreen() {
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<number>(NaN);
  const [productDescription, setProductDescription] = useState<string>("");
  const [productCategory, setProductCategory] = useState<string | null>(null);
  const [productStock, setProductStock] = useState<number>(NaN);
  const [imageIsSelected, setImageIsSelected] = useState<boolean>(false);
  const [imageNames, setImageNames] = useState<string[]>([]);
  const [imageBase64Array, setImageBase64s] = useState<string[]>([]);
  const [imageUris, setImageUris] = useState<string[]>([]);
  const [contentType, setContentType] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const uploadAwsS3Mutation = useUploadAwsS3();
  const createProductMutation = useCreateProduct();

  const clearAllFields = () => {
    setProductName("");
    setProductPrice(NaN);
    setProductDescription("");
    setProductCategory(null);
    setProductStock(NaN);
    setImageIsSelected(false);
    setImageNames([]);
    setImageBase64s([]);
    setImageUris([]);
    setContentType("");
  };

  const handleFilePicking = async () => {
    console.log("SubmitProductScreen: handleFilePicking");
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
        setImageBase64s([...imageBase64Array, fileContent]);
        setImageUris([...imageUris, docRes.assets[0].uri]);
        setContentType(docRes.assets[0].mimeType ?? "");
        setImageIsSelected(true);
      }
    } catch (error) {
      console.log("SubmitProductScreen: File selecting error: ", error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    // uploadAwsS3Mutation.mutate({})
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      !productCategory
    ) {
      setLoading(false);
      console.log("SubmitProduct.handleSubmit: missing field(s).");
      return;
    }

    const auth = getAuth();
    const userAuth = auth.currentUser;

    console.log(
      "SubmitProduct.handleSubmit: auth.currentUser: ",
      auth.currentUser
    );
    // console.log("SubmitProduct.handleSubmit: refreshing firebase token");
    if (!userAuth) {
      console.log("SubmitProduct.handleSubmit: not logged in");
      setLoading(false);
      return;
    }

    let idToken;
    try {
      idToken = await userAuth.getIdToken(true);
      console.log("SubmitProduct.handleSubmit: new idToken:", idToken);
    } catch (error) {
      console.log("SubmitProduct.handleSubmit: error getting idToken:", error);
      setLoading(false);
      return;
    }

    const uploadAwsS3Url =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_uploadAwsS3_emulator
        : process.env.EXPO_PUBLIC_uploadAwsS3_prod;

    const createProductUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_createProduct_emulator
        : process.env.EXPO_PUBLIC_createProduct_prod;
    if (!uploadAwsS3Url || !createProductUrl) {
      console.log("SubmitProductScreen: urls not bussing!");
      return;
    }
    try {
      console.log("SubmitProductScreen: uploadawsS3 url:", uploadAwsS3Url);
      const getImagesURLs = await axios.post(
        uploadAwsS3Url,
        { imageBase64: imageBase64Array, contentType: contentType },
        {
          headers: {
            authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        "SubmitProductScreen: getImagesURLS.status:",
        getImagesURLs.status
      );
      console.log(
        "SubmitProductScreen: payload:",
        imageBase64Array.length,
        contentType
      );
      const response = await getImagesURLs.data;
      console.log(
        "SubmitProductScreen: getImagesURL Status:",
        getImagesURLs.status
      );

      if (getImagesURLs.status === 201) {
        console.log("SubmitProductScreen: Got image URLs:", {
          imageUrl: response.resImageUrlArray,
          thumbnailUrl: response.resThumbnailUrlArray,
        });
        try {
          console.log(`SubmitProductScreen: Sendings: Token: ${idToken}`);
          console.log(
            "SubmitProductScreen: createProduct url:",
            createProductUrl
          );
          const createProductOnFirestore = await axios.post(
            createProductUrl,
            {
              productName: productName,
              productPrice: productPrice,
              productDescription: productDescription,
              productCategory: productCategory,
              productImageUrl: response.resImageUrlArray,
              productThumbnailUrl: response.resThumbnailUrlArray,
              productStock: productStock,
              productOwner: userAuth.email,
            },
            {
              headers: {
                authorization: `Bearer ${idToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          console.log(
            "SubmitProductScreen: createProductOnFirestore.status:",
            createProductOnFirestore.status
          );
          if (createProductOnFirestore.status === 201) {
            setProductName("");
            setProductPrice(NaN);
            setProductDescription("");
            setProductCategory(null);
            setProductStock(NaN);
            setImageIsSelected(false);
            setImageNames([]);
            setImageBase64s([]);
            setImageUris([]);
            setContentType("");
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
    setLoading(false);
  };

  const DropdownCategories = [
    { label: "Food", value: "food" },
    { label: "Electronic", value: "electronic" },
    { label: "Tool", value: "tool" },
  ];

  return (
    <SafeAreaView style={styles.mainContainer}>
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
      <TextInput
        style={styles.input}
        placeholder="Name..."
        value={productName}
        onChangeText={setProductName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Description..."
        value={productDescription}
        onChangeText={setProductDescription}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Price..."
        value={isNaN(productPrice) ? "" : productPrice.toString()}
        onChangeText={(num) => {
          setProductPrice(parseInt(num));
        }}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Stock..."
        value={isNaN(productStock) ? "" : productStock.toString()}
        onChangeText={(num) => {
          setProductStock(parseInt(num));
        }}
        autoCapitalize="none"
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

      <Pressable onPress={handleSubmit} disabled={loading} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Submit a product!</Text>
      </Pressable>
      <Pressable onPress={clearAllFields}>
        <Text>Clear All</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    // justifyContent: "center",
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
