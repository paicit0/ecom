//HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import { StyleSheet, View, Text, Dimensions } from "react-native";
import { Image } from "expo-image";
import { Product } from "../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import { useProductStore } from "../store/store";
import Animated, { useAnimatedScrollHandler } from "react-native-reanimated";

export const HomeScreen = memo(function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [currentProductNumber, setCurrentProductNumber] = useState<number>(0);
  const initialProductLoadNumber = 50;
  const LoadMoreProductNumber = 20;
  const storeProducts = useProductStore((state) => state.setProducts);
  const products = useProductStore((state) => state.products);

  const getProducts =
    process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
      ? process.env.EXPO_PUBLIC_getProducts_emulator
      : process.env.EXPO_PUBLIC_getProducts_prod;

  if (!getProducts) {
    console.log("url not bussin");
    return;
  }

  const fetchProductData = async (): Promise<void> => {
    try {
      console.log(
        "fetchProductData with: Load:",
        initialProductLoadNumber,
        "Skip:",
        currentProductNumber
      );
      const response = await fetch(getProducts, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfItems: initialProductLoadNumber,
          currentProductNumber: currentProductNumber,
        }),
      });
      console.log("fetchProductData Status:", response.status);
      if (response.ok) {
        const data = await response.json();
        storeProducts(data.productsData);
        const imagesToPreload = data.productsData.map(
          (product: Product) => product.productThumbnailUrl
        );
        await Promise.all(
          imagesToPreload.map((image: string) => Image.prefetch(image))
        );
        setIsRefreshing(false);
      }
    } catch (error) {
      console.log("fetchProductData Error:", error);
      return;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  const loadMore = async () => {
    if (isLoading || isRefreshing) return;
    setIsLoadingMore(true);
    try {
      console.log("LoadMore!");
      const response = await fetch(getProducts, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfItems: LoadMoreProductNumber,
          currentProductNumber: currentProductNumber + LoadMoreProductNumber,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentProductNumber((prev) => prev + LoadMoreProductNumber);
        storeProducts([...products, ...data.productsData]);
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.log("loadMore Error:", error);
      setIsLoadingMore(false);
      return;
    }
  };

  useEffect(() => {
    // products.forEach(product => {
    //   console.log("product id:", product.id);
    // });
    console.log(
      "how many products in useProductStore.products:",
      products.length
    );
  }, [products]);

  // useEffect(() => {
  //   console.log("isLoading: ", isLoading);
  // }, [isLoading]);

  const render = ({ item }: { item: Product }) => {
    if (isLoading) {
      return (
        <View style={styles.renderStyle}>
          <View style={styles.itemContainer}>
            <View style={styles.imageItem}></View>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.itemTitle}
            >
              .....
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={styles.itemPrice}>$...</Text>
              <Text style={styles.itemStock}>Stock: ...</Text>
            </View>
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.renderStyle}>
          <Link
            href={{
              pathname: "/ItemScreen/[id]",
              params: { id: item.id },
            }}
          >
            <View style={styles.itemContainer}>
              <Image
                style={styles.imageItem}
                source={{ uri: item.productThumbnailUrl }}
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
            </View>
          </Link>
        </View>
      );
    }
  };

  return (
    <>
      <View style={styles.header}>
        <EmptySearchBar />
      </View>
      <FlashList
        data={products}
        renderItem={render}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        contentContainerStyle={styles.verticalListContainer}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={190}
        horizontal={false}
        ListEmptyComponent={() => (
          <Text style={{ color: "red" }}>No Products to Display</Text>
        )}
        extraData={[isLoading, products]} // re renders if isLoading/ products change
        onEndReachedThreshold={0.5}
        onEndReached={loadMore}
      />
      {isLoadingMore && (
        <Text style={{ textAlign: "center", height: 30 }}>Loading...</Text>
      )}
    </>
  );
});
// console.log(Dimensions.get("window").width)

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  loadingContainer: {},
  header: {},
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
    backgroundColor: "black",
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
  renderStyle: { flex: 1 },
  loadingImagePlaceholder: {
    backgroundColor: "#E0E0E0",
  },
});

export default HomeScreen;
