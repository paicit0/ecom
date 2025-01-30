import { useEffect } from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { useUserSession } from "./auth/firebaseAuth";
import { useFavorite } from "./store/store";
import { Ionicons } from "@expo/vector-icons";

function FavoriteScreen() {
  const favoriteItems = useFavorite((state) => state.favoriteItems);
  const userEmail = useUserSession((state) => state.userInfo.email);
  const deleteFavorite = useFavorite((state) => state.deleteFavorite);
  const deleteAllFavorite = useFavorite((state) => state.deleteAllFavorite);
  useEffect(() => {
    const updateFavorite = async () => {
      try {
        const updateUser_emu = process.env.EXPO_PUBLIC_updateUser_emulator;
        const updateUser_prod = process.env.EXPO_PUBLIC_updateUser_prod;
        if (!updateUser_emu || !updateUser_prod) {
          console.log("not bussin urls");
          return;
        }
        const update = await fetch(updateUser_emu, {
          body: JSON.stringify({
            email: userEmail,
            favorite: favoriteItems,
          }),
        });
        console.log(update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
  }, [favoriteItems]);
  return (
    <View style={styles.mainContainer}>
      {favoriteItems?.map((item, index) => (
        <>
          <Text>{item.productName}</Text>
          <Pressable onPress={() => deleteFavorite(index)}>
            <Ionicons name="close-sharp" size={20} color="#666" />
          </Pressable>
        </>
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
  },
});

export default FavoriteScreen;
