//HomeScreen.tsx
import React, { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "../type/types";
import { Link } from "expo-router";
import { useCart, useProductStore } from "../store/store";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import EmptySearchBar from "../../components/EmptySearchBar";
import { ErrorBoundary } from "expo-router";

export const HomeScreen = memo(function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<string>("");
  const cart = useCart((state) => state.cartItems);

  const fetchProductData = async (): Promise<Product[]> => {
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    useProductStore.getState().setProducts(data.products);
    return data.products;
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProductData();
        const imagesToPreload = data.map((product) => product.images[0]);
        await Image.prefetch(imagesToPreload);
        setProducts(data);

        // console.log("Filtered Products: " + JSON.stringify(filteredProducts));
      } catch (error) {
        console.error("Error fetching Products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    console.log("Getting Products: " + getProducts);
    getProducts();
  }, []);

  const render = ({ item }: { item: Product }) => {
    if (isLoading) {
      return (
        <>
          <ActivityIndicator size="large" color="#0000ff" />
        </>
      );
    }

    return (
      <Link
        href={{
          pathname: "/ItemScreen/[id]",
          params: { id: item.id },
        }}
        style={styles.linkStyle}
      >
        <View style={styles.itemContainer}>
          <Image
            style={styles.imageItem}
            source={{ uri: item.images[0] }}
            contentFit="cover"
            transition={200}
          />
          <Text numberOfLines={2} ellipsizeMode="tail" style={styles.itemTitle}>
            {item.title}
          </Text>
          <View style={styles.priceStockContainer}>
            <Text style={styles.itemPrice}>${item.price}</Text>
            <Text style={styles.itemStock}>Stock: {item.stock}</Text>
          </View>
        </View>
      </Link>
    );
  };

  return (
    <>
      <View style={styles.header}>
        <View style={{ height: 45 }}></View>
        <EmptySearchBar />
      </View>
      <FlashList
        data={products}
        renderItem={render}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.verticalListContainer}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        estimatedItemSize={150}
        horizontal={false}
      />
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
    // flexDirection: "column",
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
    flex: 1,
    flexDirection: "row",
    alignContent: "space-between",
  },
  itemPrice: {},
  itemStock: {},
  itemTitle: {},
  icon: {},
  input: {
    color: "#333",
  },
  badge: {},
  linkStyle: {
    flex: 1,
    flexDirection: "row",
  },
});

export default HomeScreen;
