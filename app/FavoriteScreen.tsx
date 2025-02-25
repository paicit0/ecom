// FavoriteScreen.tsx
import { useEffect, useState } from "react";
import {
  Pressable,
  Text,
  StyleSheet,
  View,
  ScrollView,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import { Link } from "expo-router";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { FlashList } from "@shopify/flash-list";
import { useGetFavorite } from "../hooks/fetch/useGetFavorite";
import { useDeleteFavorite } from "../hooks/fetch/useDeleteFavorite";
import { SafeAreaView } from "react-native-safe-area-context";

function FavoriteScreen() {
  const [isLoading, setLoading] = useState<boolean>(false);
  const auth = getAuth();
  const userAuth = auth.currentUser;
  if (!userAuth) {
    console.error("FavoriteScreen: no auth.currentUser");
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Please </Text>
        <Link href="/LoginScreen" asChild>
          <Pressable>
            <Text style={{ color: "blue" }}>Login</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const userEmail = userAuth.email;
  if (!userEmail || !userAuth.email) {
    console.error("No user email found");
  }

  const getFavoriteQuery = useGetFavorite({ userEmail: userEmail as string });
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

  if (getFavoriteQuery.isLoading) {
    setTimeout(() => {
      return (
        <SafeAreaView style={{ marginTop: 60 }}>
          <AnimatedLoadingIndicator loading={getFavoriteQuery.isLoading} />
        </SafeAreaView>
      );
    }, 250);
  }

  if (getFavoriteQuery.isError) {
    return (
      <SafeAreaView>
        <Text>Error getting favorite.</Text>
      </SafeAreaView>
    );
  }

  if (!getFavoriteQuery.data) {
    return (
      <SafeAreaView>
        <Text>No getFavoriteQuery.data</Text>
      </SafeAreaView>
    );
  }

  if (getFavoriteQuery.data.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text>No Favorites yet...</Text>
      </SafeAreaView>
    );
  }

  const render = ({ item }: { item: Product }) => {
    return (
      <View style={styles.renderStyle}>
        <Link
          href={{
            pathname: "/ItemScreen/[id]",
            params: { id: item.productId },
          }}
          asChild
        >
          <Pressable style={styles.itemContainer}>
            <Image
              style={styles.imageItem}
              source={{ uri: item.productThumbnailUrl[0] }}
              contentFit="cover"
              transition={200}
            />
            <Text numberOfLines={2} ellipsizeMode="tail" style={{}}>
              {item.productName}
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={{}}>฿{item.productPrice}</Text>
              <Text style={{}}>Stock: {item.productStock}</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/ProfileScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Favorite</Text>
        </View>
        <FlashList
          data={getFavoriteQuery.data}
          renderItem={render}
          keyExtractor={(item) => item.productId}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={190}
          horizontal={false}
          ListEmptyComponent={() => (
            <Pressable onPress={() => getFavoriteQuery.refetch()}>
              <Text>Press to refresh (Placeholder)</Text>
            </Pressable>
          )}
          extraData={[isLoading, getFavoriteQuery.data]} // re renders if isLoading/products change
          onEndReachedThreshold={0.5}
          // onEndReached={loadMore}
        />

        <View style={styles.favoriteItemsArrayContainer}></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

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
  renderStyle: { height: "100%", width: "100%" },
  itemContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
    width: deviceWidth / 2,
  },
  imageItem: {
    minHeight: 125,
    minWidth: 125,
    // backgroundColor: "green",
  },
  priceStockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: (Dimensions.get("window").width / 2) - 15,
  },
});

export default FavoriteScreen;
