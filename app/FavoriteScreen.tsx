import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ScrollView,
  Image,
} from "react-native";
import { Product } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { Link } from "expo-router";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { FlashList } from "@shopify/flash-list";
import { useGetFavorite } from "../hooks/fetch/useGetFavorite";
import { useDeleteFavorite } from "../hooks/fetch/useDeleteFavorite";

function FavoriteScreen() {
  const [loading, setLoading] = useState<boolean>(false);
  const auth = getAuth();
  const userAuth = auth.currentUser;
  if (!userAuth) {
    console.error("No user auth found");
    return;
  }
  const userEmail = userAuth.email;
  if (!userEmail || !userAuth) {
    console.error("No user email found");
    return;
  }

  const getFavoriteQuery = useGetFavorite({ userEmail });
  const deleteFavoriteMutation = useDeleteFavorite();

  useEffect(() => {
    try {
      getFavoriteQuery.refetch();
      console.log(
        "FavoriteScreen: getFavoriteQuery.data:",
        getFavoriteQuery.data
      );
    } catch (error) {
      console.error("FavoriteScreen: ", error);
    }
  }, []);

  const render = () => {
    return <></>;
  };

  if (getFavoriteQuery.isError) {
    return (
      <View>
        <Text>Error getting favorite.</Text>
      </View>
    );
  }

  if (!getFavoriteQuery.data) {
    return <></>;
  }

  if (getFavoriteQuery.data.favoriteProducts.length === 0) {
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

  if (getFavoriteQuery.isLoading) {
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
          {getFavoriteQuery.data.favoriteProducts.map(
            (product: Product, index: number) => (
              <View key={index} style={{}}>
                <Link
                  href={{
                    pathname: "/ItemScreen/[id]",
                    params: { id: product.productId },
                  }}
                  asChild
                >
                  <Pressable>
                    <Image
                      style={{ height: 150, width: 150 }}
                      source={{ uri: product.productThumbnailUrl[0] }}
                    />
                    <Text>{product.productName}</Text>
                    <Text>{product.productDescription}</Text>
                    <Text>{product.productThumbnailUrl[0]}</Text>
                  </Pressable>
                </Link>

                <Pressable
                  onPress={() => {
                    deleteFavoriteMutation.mutate({
                      userEmail: userEmail,
                      productId: product.productId,
                    });
                  }}
                >
                  <Ionicons name="close-sharp" size={20} color="#666" />
                </Pressable>
              </View>
            )
          )}
        </View>
        {getFavoriteQuery.data.favoriteProducts.length > 0 && (
          <Pressable onPress={() => console.log("delete all placeholder")}>
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
