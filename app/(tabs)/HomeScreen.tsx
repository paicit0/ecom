//HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import { useProductStore } from "../store/store";

export const HomeScreen = memo(function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("");
  const getProductsUrl =
    "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/getProducts";

  const fetchProductData = async (): Promise<Product[]> => {
    try {
      const response = await fetch(getProductsUrl, {
        method: "POST",
        body: JSON.stringify({ numberOfItems: 50 }),
      });
      const data = await response.json();
      return data.products;
    } catch (error) {
      console.log("fetchProductData error: ", error);
      return [];
    }

    // fix this up
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProductData();
        const imagesToPreload = data.map((product) => product.images[0]);
        await Promise.all(
          imagesToPreload.map((image) => Image.prefetch(image))
        );
        setProducts(data);
        // console.log("Getting Products: " + data);
      } catch (error) {
        console.error("Error fetching Products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  const loadMore = async () => {
    try {
      const response = await fetch(getProductsUrl, {
        method: "POST",
        body: JSON.stringify({ numberOfItems: 20 }),
      });
    } catch (error) {
      console.log("loadMore Error: ", error);
      return;
    }
  };

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
          // asChild
        >
          <View style={styles.itemContainer}>
            <Image
              style={styles.imageItem}
              source={{ uri: item.images[0] }}
              contentFit="cover"
              transition={200}
            />
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={styles.itemTitle}
            >
              {item.title}
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <Text style={styles.itemStock}>Stock: {item.stock}</Text>
            </View>
          </View>
        </Link>
      </View>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <EmptySearchBar />
      </View>
      <View style={styles.flashListStyle}>
        <FlashList
          data={products}
          renderItem={render}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.verticalListContainer}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={200}
          horizontal={false}
          ListEmptyComponent={() => (
            <Text style={{ color: "red" }}>No Products to Display</Text>
          )}
          onEndReached={loadMore}
        />
      </View>
    </>
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
