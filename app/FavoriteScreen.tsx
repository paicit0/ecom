import { useEffect } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import { useFavorite } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

function FavoriteScreen() {
  const favoriteItems = useFavorite((state) => state.favoriteItems);
  const userEmail = useUserSession((state) => state.userInfo.email);
  const deleteFavorite = useFavorite((state) => state.deleteFromFavorite);
  const deleteAllFavorite = useFavorite((state) => state.deleteAllFavorite);
  useEffect(() => {
    const updateFavorite = async () => {
      try {
        const updateUser =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_updateUser_emulator
            : process.env.EXPO_PUBLIC_updateUser_prod;
        if (!updateUser) {
          console.log("not bussin urls");
          return;
        }
        const update = await axios.post(
          updateUser,
          { email: userEmail, favorite: favoriteItems },
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        console.log("update", update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
  }, [favoriteItems]);
  return (
    <View style={styles.mainContainer}>
      {favoriteItems?.map((item, index) => (
        <View key={index} style={{ flex: 1 }}>
          <Text>{item}</Text>
          {/* <Text>{item.productName}</Text> */}
          <Pressable onPress={() => deleteFavorite(index.toString())}>
            <Ionicons name="close-sharp" size={20} color="#666" />
          </Pressable>
        </View>
      ))}
      <Pressable onPress={() => deleteAllFavorite()}>
        <Text>Delete All</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
  },
});

export default FavoriteScreen;
