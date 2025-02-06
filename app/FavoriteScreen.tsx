import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useFavorite } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { getAuth } from "firebase/auth";
import * as SecureStore from "expo-secure-store";
import { Link } from "expo-router";

function FavoriteScreen() {
  const [loading, setLoading] = useState<boolean>(false);

  const favoriteItemsArray = useFavorite((state) => state.favoriteItemsArray);
  const deleteFromFavorite = useFavorite((state) => state.deleteFromFavorite);
  const deleteAllFavorite = useFavorite((state) => state.deleteAllFavorite);

  const auth = getAuth();
  const userAuth = auth.currentUser;

  if (!userAuth) {
    console.log("FavoriteScreen: no userAuth");
    return;
  }
  console.log("FavoriteScreen: userAuth.uid: ", userAuth.uid);
  const updateFavorite = async () => {
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
      const update = await axios.post(
        updateFavoriteUrl,
        { email: userAuth.email, favoriteItemsArray: favoriteItemsArray },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("FavoriteScreen:update.status", update.status);
    } catch (error) {
      console.error("FavoriteScreen:update failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    updateFavorite();
  }, []);

  if (!favoriteItemsArray.length) {
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

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <ActivityIndicator size="large" color="green" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Favorite</Text>
        </View>
        <View style={styles.favoriteItemsArrayContainer}>
          {favoriteItemsArray.map((item, index) => (
            <View key={index} style={{}}>
              <Text>{item}</Text>
              {/* <Text>{item.productName}</Text> */}
              <Pressable onPress={() => deleteFromFavorite(index.toString())}>
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
