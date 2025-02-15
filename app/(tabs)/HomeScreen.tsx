//HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions, Pressable } from "react-native";
import { Image } from "expo-image";
import { Product } from "../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import axios from "axios";
import { useGetProducts } from "../../hooks/fetch/useGetProducts";

export const HomeScreen = memo(function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
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
    console.log(getProductsQuery.data);
  }, []);

  const loadMore = async () => {
    console.log("HomeScreen: loadMore triggered.");
    if (isLoading || isRefreshing) return;
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
    return (
      <View style={styles.renderStyle}>
        <View style={styles.itemContainer}>
          <View style={styles.imageItem}></View>
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.itemTitle}>
            Loading...
          </Text>
          <View style={styles.priceStockContainer}>
            <Text style={styles.itemPrice}>$...</Text>
            <Text style={styles.itemStock}>Stock: ...</Text>
          </View>
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
              source={{ uri: item.productThumbnailUrl[0] }}
              contentFit="cover"
              transition={200}
            />
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.itemTitle}
            >
              {item.productName}
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={styles.itemPrice}>${item.productPrice}</Text>
              <Text style={styles.itemStock}>Stock: {item.productStock}</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 45 }} />
      <EmptySearchBar placeholder="Search..." />
      <FlashList
        data={getProductsQuery.data}
        renderItem={render}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.verticalListContainer}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={190}
        horizontal={false}
        ListEmptyComponent={() => (
          <Pressable onPress={() => getProductsQuery.refetch()}>
            <Text>Press to refresh (Placeholder)</Text>
          </Pressable>
        )}
        extraData={[isLoading, getProductsQuery.data]} // re renders if isLoading/products change
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
              console.log(
                "HomeScreen: getProductsQuery.data",
                getProductsQuery.data
              );
              setCurrentProductNumber(0);
              () => getProductsQuery.refetch();
            }}
          >
            <Text>devtool refresh all</Text>
          </Pressable>
        </>
      )}
    </View>
  );
});
// console.log(Dimensions.get("window").width)

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loadingContainer: {},
  header: { width: "100%" },
  renderStyle: { width: "100%" },
  flashListStyle: {
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width,
    padding: 10,
  },
  title: {
    fontSize: 18,
    color: "#333",
  },
  verticalListContainer: {
    // backgroundColor: "black",
  },
  horizontalListContainer: {
    backgroundColor: "cyan",
  },
  itemContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
    width: Dimensions.get("window").width / 2,
  },
  cardContent: {
    backgroundColor: "blue",
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
  itemPrice: {},
  itemStock: {},
  itemTitle: {},
  icon: {},
  input: {
    color: "#333",
  },
  badge: {},
  loadingImagePlaceholder: {
    backgroundColor: "#E0E0E0",
  },
});

export default HomeScreen;
