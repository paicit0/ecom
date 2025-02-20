// HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  ScrollView,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import axios from "axios";
import { useGetProducts } from "../../hooks/fetch/useGetProducts";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

export const HomeScreen = memo(function HomeScreen() {
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [currentProductNumber, setCurrentProductNumber] = useState<number>(0);
  const numberOfItems = 50;
  const loadMoreProductNumber = 20;

  const getProductsQuery = useGetProducts({
    numberOfItems,
    currentProductNumber,
  });

  const getProductsUrl =
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
      ? process.env.EXPO_PUBLIC_getProducts_emulator
      : process.env.EXPO_PUBLIC_getProducts_prod;

  if (!getProductsUrl) {
    console.log("HomeScreen: url not bussin");
    return;
  }

  useEffect(() => {
    console.log("HomeScreen: getProductsQuery.data:", getProductsQuery.data);
  }, []);

  const loadMore = async () => {
    console.log("HomeScreen: loadMore triggered.");
    setIsLoadingMore(true);
    try {
      console.log("HomeScreen.loadMore: getProductsUrl:", getProductsUrl);
      const loadMoreProducts = await axios.get(getProductsUrl, {
        params: {
          numberOfItems: loadMoreProductNumber,
          currentProductNumber: currentProductNumber + loadMoreProductNumber,
        },

        headers: {
          "Content-Type": "application/json",
        },
      });
      if (loadMoreProducts.status === 200) {
        const loadMoreProductsData = await loadMoreProducts.data;
        setCurrentProductNumber((prev) => prev + loadMoreProductNumber);
        // setProducts([...products, ...loadMoreProductsData.productsData]);
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.log("HomeScreen: loadMore Error:", error);
      setIsLoadingMore(false);
      return;
    }
  };

  if (getProductsQuery.isLoading) {
    console.log(
      "HomeScreen: getProductsQuery.isLoading",
      getProductsQuery.isLoading
    );
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (getProductsQuery.isError) {
    console.log(
      "HomeScreen: getProductsQuery.isError",
      getProductsQuery.isError
    );
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text>Failed to get products.</Text>
        <Pressable onPress={() => getProductsQuery.refetch()}>
          <Text>Try to Reload</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const render = ({ item }: { item: Product }) => {
    return (
      <View style={{}}>
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
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{ marginLeft: 16 }}
            >
              {item.productName}
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={{}}>${item.productPrice}</Text>
              <Text style={{}}>Stock: {item.productStock}</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ flex: 1, backgroundColor: "white" }}>
        <EmptySearchBar
          placeholderArray={[
            "Electric Drill",
            "Meat",
            "shovel",
            "Jars",
            "Batteries",
          ]}
          intervalMs={5000}
        />
        <View style={styles.categoryContainer}>
          <View style={styles.categoryContainerItem}>
            <Ionicons
              style={{ alignSelf: "center" }}
              name="pizza-outline"
              size={30}
            />
            <Text style={{ alignSelf: "center" }}>Food</Text>
          </View>
          <View style={styles.categoryContainerItem}>
            <Ionicons
              style={{ alignSelf: "center" }}
              name="hammer-outline"
              size={30}
            />
            <Text style={{ alignSelf: "center" }}>Tools</Text>
          </View>
          <View style={styles.categoryContainerItem}>
            <Ionicons
              style={{ alignSelf: "center" }}
              name="power-outline"
              size={30}
            />
            <Text style={{ alignSelf: "center" }}>Electronics</Text>
          </View>
        </View>
        <FlashList
          data={getProductsQuery.data}
          renderItem={render}
          keyExtractor={(item) => item.productId}
          // contentContainerStyle={styles.verticalListContainer}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={250}
          horizontal={false}
          ListEmptyComponent={() => (
            <Pressable onPress={() => getProductsQuery.refetch()}>
              <Text>Press to refresh (Placeholder)</Text>
            </Pressable>
          )}
          extraData={[getProductsQuery.isLoading, getProductsQuery.data]} // re renders if isLoading/data change
          onEndReachedThreshold={0.5}
          // onEndReached={loadMore}
        />

        {isLoadingMore && (
          <Text style={{ textAlign: "center", height: 30 }}>Loading...</Text>
        )}
        {process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev" && (
          <>
            <Pressable
              onPress={() => {
                console.log("HomeScreen: refresh");

                setCurrentProductNumber(0);
                getProductsQuery.refetch();
                console.log(
                  "HomeScreen: getProductsQuery.data",
                  getProductsQuery.data
                );
              }}
            >
              <Text>devtool refresh all</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
});
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "orange",
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    gap: 5,
  },
  categoryContainerItem: {
    flexDirection: "row",
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 20,
    padding: 5,
  },

  itemContainer: {
    backgroundColor: "white",
    width: deviceWidth / 2,
    // marginHorizontal: 6,
  },
  imageItem: {
    marginHorizontal: 16,

    minHeight: 125,
    maxWidth: deviceWidth / 2 - 12,
    // backgroundColor: "green",
  },
  priceStockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginRight: 16,
    marginLeft: 16,
    marginTop: 8,
  },
  badge: {},
});

export default HomeScreen;
