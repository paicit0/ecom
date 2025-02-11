import { useEffect, useState } from "react";
import { Pressable, Text, StyleSheet, View, ScrollView } from "react-native";
import { Product, useFavorite } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getAuth } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import { Link } from "expo-router";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { FlashList } from "@shopify/flash-list";
import { useGetFavorite } from "../hooks/fetch/useGetFavorite";
import { useUpdateFavorite } from "../hooks/fetch/useUpdateFavorite";

function FavoriteScreen() {
  const [loading, setLoading] = useState<boolean>(false);

  const favoriteItemsArray = useFavorite((state) => state.favoriteItemsArray);
  const deleteFromFavorite = useFavorite((state) => state.deleteFromFavorite);
  const deleteAllFavorite = useFavorite((state) => state.deleteAllFavorite);

  const auth = getAuth();
  const userAuth = auth.currentUser;

  const {
    data: favorites,
    isPending,
    isError,
    error,
    refetch,
  } = useGetFavorite(userAuth?.email as string);

  const handleUpdateFavorite = async () => {
    if (!userAuth) {
      console.log("FavoriteScreen: no userAuth");
      return;
    }
    console.log("FavoriteScreen: userAuth.uid: ", userAuth.uid);

    setLoading(true);
    try {
      if (!userAuth.email || !favoriteItemsArray.length) {
        return;
      }

      const idToken = await SecureStore.getItemAsync("authToken");
      console.log("idToken:", idToken);
      const updateFavoriteUrl =
        process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
          ? process.env.EXPO_PUBLIC_updateFavorite_emulator
          : process.env.EXPO_PUBLIC_updateFavorite_prod;
      if (!updateFavoriteUrl) {
        console.error("FavoriteScreen:not bussin urls");
        return;
      }
      console.log("FavoriteScreen: updateFavoriteUrl:", updateFavoriteUrl);
      console.log(
        `FavoriteScreen: Payload to updateFavorite:Email:${userAuth.email} Array:`,
        favoriteItemsArray
      );
      const updateFavoriteFromItemsArray = await axios.post(
        updateFavoriteUrl,
        { email: userAuth.email, favoriteItemsArray: favoriteItemsArray },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(
        "FavoriteScreen: update.status",
        updateFavoriteFromItemsArray.status
      );
      if (updateFavoriteFromItemsArray.status === 201) {
        return true;
      }
    } catch (error) {
      console.error("FavoriteScreen: updateFavorite internal errors:", error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();

    console.log("HEY", favorites);
    // handleUpdateFavorite();
  }, [favoriteItemsArray]);

  const render = () => {
    return <></>
  }

  if (!favorites) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text>No Favorites yet...</Text>
      </View>
    );
  }
  if (isPending) {
    setTimeout(() => {
      return (
        <View style={{ marginTop: 60 }}>
          <AnimatedLoadingIndicator loading={loading} />
        </View>
      );
    }, 250);
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/ProfileScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Favorite</Text>
        </View>

        <View style={styles.favoriteItemsArrayContainer}>
          {favorites.favoriteProducts.map((product: Product, index: number) => (
            <View key={index} style={{}}>
              <Text>{product.productName}</Text>
              <Text>{product.productDescription}</Text>
              <Text>{product.productImageUrl[0]}</Text>
              <Pressable onPress={() => deleteFromFavorite(product.toString())}>
                <Ionicons name="close-sharp" size={20} color="#666" />
              </Pressable>
            </View>
          ))}
        </View>
        {favoriteItemsArray.length > 0 && (
          <Pressable onPress={deleteAllFavorite}>
            <Text>Delete All</Text>
          </Pressable>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  favoriteItemsArrayContainer: {
    flex: 1,
  },
});

export default FavoriteScreen;
