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
import { Product } from "../store/store";
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
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
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

  function FavoriteHeader() {
    return (
      <View style={styles.headerContainer}>
        <Link href="../(tabs)/HomeScreen" asChild>
          <Pressable style={{ marginLeft: 8 }}>
            <Ionicons name="arrow-back-outline" size={20}/>
          </Pressable>
        </Link>
        <View
          style={{
            flex: 1,
            marginLeft: -32,
            alignItems: "center",
          }}
        >
          <Text>Favorite</Text>
        </View>
      </View>
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
              source={{ uri: item.productThumbnailUrlArray[0] }}
              contentFit="cover"
              transition={200}
            />
            <View>
              <Text numberOfLines={2} ellipsizeMode="tail" style={{}}>
                {item.productName}
              </Text>
              <View style={styles.priceStockContainer}>
                <Text style={{}}>฿{item.productPrice.toLocaleString()}</Text>
                <Text style={{}}>Stock: {item.productStock}</Text>
              </View>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={{ backgroundColor: "white" }}></SafeAreaView>
      <FavoriteHeader />
      <View style={styles.mainContainer}>
        <FlashList
          data={getFavoriteQuery.data}
          renderItem={render}
          keyExtractor={(item) => item.productId}
          numColumns={1}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={400}
          horizontal={false}
          ListEmptyComponent={() => (
            <Pressable onPress={() => getFavoriteQuery.refetch()}>
              <Text>Press to refresh (Placeholder)</Text>
            </Pressable>
          )}
          extraData={[isLoading, getFavoriteQuery.data]} // re renders if isLoading/products change
          onEndReachedThreshold={0.5}
          // onEndReached={loadMore}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            getFavoriteQuery.refetch().then(() => setIsRefreshing(false));
          }}
        />
      </View>
    </>
  );
}

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingBottom: 16,
    marginBottom: 8,
    backgroundColor: "white",
  },
  mainContainer: {
    flex: 1,
    width: deviceWidth,
  },

  renderStyle: { height: "100%", width: "100%" },
  itemContainer: {
    flex: 1,
    flexDirection: "row",
    padding: 5,
    backgroundColor: "white",
    width: deviceWidth,
  },
  imageItem: {
    height: 125,
    width: 125,
    // backgroundColor: "green",
  },
  priceStockContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    // width: (Dimensions.get("window").width / 2) - 15,
  },
});

export default FavoriteScreen;
