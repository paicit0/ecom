//HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import { useProductStore } from "../store/store";

export const HomeScreen = memo(function HomeScreen() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [category, setCategory] = useState<string>("");
  const [currentProductNumber, setCurrentProductNumber] = useState<number>(0);
  const getProductsUrl =
    "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/getProducts";
  const initialProductLoadNumber = 50;
  const LoadMoreProductNumber = 20;
  const storeProducts = useProductStore((state) => state.setProducts);
  const products = useProductStore((state) => state.products);

  const fetchProductData = async (): Promise<void> => {
    try {
      console.log(
        "fetchProductData with: Load:",
        initialProductLoadNumber, "Skip:",
        currentProductNumber
      );
      const response = await fetch(getProductsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfItems: initialProductLoadNumber,
          currentProductNumber: currentProductNumber,
        }),
      });
      console.log("fetchProductdata status: ", response.status);
      if (response.ok) {
        const data = await response.json();
        storeProducts(data.productsData);
        const imagesToPreload = data.productsData.map(
          (product: Product) => product.productThumbnailUrl
        );
        await Promise.all(
          imagesToPreload.map((image: string) => Image.prefetch(image))
        );
        console.log("response is ok!");
        setIsRefreshing(false);
      }
    } catch (error) {
      console.log("fetchProductData Error: ", error);
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
    try {
      const response = await fetch(getProductsUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numberOfItems: initialProductLoadNumber,
          currentProductNumber: currentProductNumber,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setCurrentProductNumber((prev) => prev + LoadMoreProductNumber);
        storeProducts([...products, ...data.productsData]);
      }
    } catch (error) {
      console.log("loadMore Error: ", error);
      return;
    }
  };

  // useEffect(() => {
  //   products.forEach(product => {
  //     console.log(product.id);
  //   });
  // }, [products]);

  useEffect(() => {
    console.log("isLoading: ", isLoading);
  }, [isLoading]);

  const render = ({ item }: { item: Product }) => {
    if (isLoading) {
      return (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      );
    }

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
  };

  return (
    <ScrollView
      style={styles.mainContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={fetchProductData}
        />
      }
    >
      <View style={styles.header}>
        <EmptySearchBar />
      </View>
      <View style={styles.flashListStyle}>
        <FlashList
          data={products}
          renderItem={render}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.verticalListContainer}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          horizontal={false}
          ListEmptyComponent={() => (
            <Text style={{ color: "red" }}>No Products to Display</Text>
          )}
          onEndReachedThreshold={1}
          onEndReached={loadMore}
        />
      </View>
    </ScrollView>
  );
});

const testColor = "green";

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
    backgroundColor: "white",
  },
  cardContent: {
    backgroundColor: "blue",
  },
  imageItem: {
    minHeight: 150,
    minWidth: 150,
    backgroundColor: "green",
  },
  priceStockContainer: {
    flexDirection: "row",
    alignContent: "space-between",
    width: Dimensions.get("window").width / 2,
  },
  itemPrice: {},
  itemStock: {},
  itemTitle: {},
  icon: {},
  input: {
    color: "#333",
  },
  badge: {},
  renderStyle: {},
});

export default HomeScreen;
