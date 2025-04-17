// HomeScreen.tsx
import { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  StatusBar,
} from "react-native";
import { Image } from "expo-image";
import { Product } from "../../store/store";
import { Link } from "expo-router";
import { FlashList } from "@shopify/flash-list";
import EmptySearchBar from "../../components/EmptySearchBar";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useGetProducts } from "../../hooks/fetch/useGetProducts";
import { useGetCart } from "../../hooks/fetch/useGetCart";
import { getAuth } from "firebase/auth";

export const HomeScreen = function HomeScreen() {
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [currentProductNumber, setCurrentProductNumber] = useState<number>(0);
  const [filteredProduct, setFilteredProduct] = useState<Product[]>([]);

  const auth = getAuth();
  const userEmail = auth.currentUser?.email;

  if (!userEmail) {
    console.log("HomeScreen: no userEmail");
    // return;
  }

  const numberOfItems = 50;
  const loadMoreProductNumber = 20;
  const getProductsQuery = useGetProducts({
    numberOfItems,
    currentProductNumber,
  });

  const getCartQuery = useGetCart({ userEmail: userEmail as string });

  useEffect(() => {
    if (getProductsQuery.data) {
      console.log(
        "HomeScreen: getProductsQuery.data[0]:",
        getProductsQuery.data[0]
      );
    }

    console.log("HomeScreen: filteredProduct:", filteredProduct);
    console.log(
      "HomeScreen: filteredProduct is empty:",
      filteredProduct.length
    );
  }, [getProductsQuery.data]);

  useEffect(() => {
    getProductsQuery.refetch();
    if (!getProductsQuery.data) {
      return;
    }
    const filterProductByCategoryArray = getProductsQuery.data.filter(
      (item: Product) => item.productCategory === selectedCategory
    );
    setCurrentProductNumber(0);
    setFilteredProduct(filterProductByCategoryArray);
  }, [selectedCategory]);

  if (getProductsQuery.isLoading || !getProductsQuery.data) {
    console.log(
      "HomeScreen: getProductsQuery is loading:",
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

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

  const loadMore = async () => {
    const getProductsUrl =
      process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
        ? process.env.EXPO_PUBLIC_getProducts_emulator
        : process.env.EXPO_PUBLIC_getProducts_prod;

    if (!getProductsUrl) {
      console.log("HomeScreen: url not bussin");
      return;
    }
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
        // setFilteredProduct([filteredProduct, ...loadMoreProductsData.productsData]);
        setIsLoadingMore(false);
      }
    } catch (error) {
      console.log("HomeScreen: loadMore Error:", error);
      setIsLoadingMore(false);
      return;
    }
  };

  if (!filteredProduct) {
    console.log("HomeScreen: filteredProduct is undefined/empty");
  }

  const header = () => {
    return (
      <>
        <View style={{ backgroundColor: "orange", height: 30 }}></View>
        <View style={styles.scannerContainer}>
          <View
            style={{
              justifyContent: "center",
              borderColor: "grey",
              borderRightWidth: 0.5,
              paddingRight: 6,
            }}
          >
            <Ionicons name="barcode-outline" size={30} color={"gray"} />
          </View>
          <View style={{ flexDirection: "row", gap: 30 }}>
            <View
              style={{
                borderColor: "grey",
                borderRightWidth: 0.5,
                justifyContent: "center",
                paddingRight: 6,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Ionicons name="card-outline" size={24} color={"red"} />
                <Text style={{ alignSelf: "center", marginLeft: 2 }}>
                  ฿0.00
                </Text>
              </View>
              <Text style={{ alignSelf: "flex-start" }}>Card</Text>
            </View>
            <View
              style={{
                borderColor: "grey",
                borderRightWidth: 0.5,
                justifyContent: "center",
                paddingRight: 6,
              }}
            >
              <View style={{ flexDirection: "row" }}>
                <Ionicons
                  name="heart-circle-outline"
                  size={24}
                  color={"orange"}
                />
                <Text style={{ alignSelf: "center", marginLeft: 2 }}>0.00</Text>
              </View>
              <Text style={{ alignSelf: "flex-start" }}>Coin</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Ionicons name="gift-outline" size={24} color={"blue"} />
                <Text style={{ alignSelf: "center", marginLeft: 2 }}>0.00</Text>
              </View>
              <Text style={{ alignSelf: "flex-start" }}>Coupons</Text>
            </View>
          </View>
          <View
            style={{
              justifyContent: "center",
              borderColor: "grey",
              borderLeftWidth: 0.5,
              paddingLeft: 6,
            }}
          >
            <Ionicons name="logo-bitcoin" size={30} color={"orange"} />
          </View>
        </View>
        <View style={styles.categoryContainer}>
          <Pressable onPress={() => setSelectedCategory("")}>
            <View style={styles.categoryContainerItem}>
              <Ionicons
                style={styles.categoryItemIcon}
                name="apps"
                color={"black"}
                size={30}
              />
              <Text style={{ alignSelf: "center" }}>All</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleCategorySelect("food")}>
            <View style={styles.categoryContainerItem}>
              <Ionicons
                style={styles.categoryItemIcon}
                name="pizza"
                color={"orange"}
                size={30}
              />
              <Text style={{ alignSelf: "center" }}>Food</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleCategorySelect("tool")}>
            <View style={styles.categoryContainerItem}>
              <Ionicons
                style={styles.categoryItemIcon}
                name="hammer"
                color={"grey"}
                size={30}
              />
              <Text style={{ alignSelf: "center" }}>Tools</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => handleCategorySelect("electronic")}>
            <View style={styles.categoryContainerItem}>
              <Ionicons
                style={styles.categoryItemIcon}
                name="power-outline"
                color={"blue"}
                size={30}
              />
              <Text style={{ alignSelf: "center" }}>Electronics</Text>
            </View>
          </Pressable>
        </View>
      </>
    );
  };

  const render = ({ item }: { item: Product }) => {
    return (
      <View style={styles.productItemsContainer}>
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
            <View style={{ padding: 10 }}>
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{ fontSize: 16, fontWeight: "bold", color: "#333" }}
              >
                {item.productName}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginTop: 5,
                }}
              >
                <Text style={{ fontSize: 14, color: "#333" }}>
                  ฿{item.productPrice.toLocaleString()}
                </Text>
                <Text style={{ fontSize: 14, color: "#888" }}>
                  Stock: {item.productStock}
                </Text>
              </View>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <>
      <StatusBar backgroundColor="orange" barStyle="light-content" />
      <View style={styles.mainContainer}>
        <View style={styles.header}>
          <EmptySearchBar
            placeholderArray={[
              "Electric Drill",
              "Meat",
              "shovel",
              "Jars",
              "Batteries",
            ]}
            intervalMs={5000}
            borderWidth={0}
            borderColor={"black"}
          />
          <View style={styles.cartContainer}>
            <Link href="/CartScreen" asChild>
              <Pressable style={{ marginLeft: 10 }}>
                {(getCartQuery.data?.length as number) > 0 && (
                  <Text style={styles.cartBadge}>
                    {(getCartQuery.data?.length as number) > 99
                      ? "99+"
                      : getCartQuery.data?.length}
                  </Text>
                )}
                <Ionicons name="cart-outline" size={28} color="white" />
              </Pressable>
            </Link>

            <Ionicons
              name="chatbubble-ellipses-outline"
              size={28}
              color="white"
            />
          </View>
        </View>
        <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
          <FlashList
            data={getProductsQuery?.data ?? []}
            renderItem={render}
            keyExtractor={(item) => item.productId}
            // contentContainerStyle={styles.verticalListContainer}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={250}
            horizontal={false}
            ListHeaderComponent={header}
            ListEmptyComponent={() => (
              <Pressable onPress={() => getProductsQuery.refetch()}>
                <Text>Press to refresh (Placeholder)</Text>
              </Pressable>
            )}
            extraData={[getProductsQuery.isLoading, getProductsQuery.data]} // re renders if isLoading/data change
            // onEndReachedThreshold={0.5}
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
                <Text>devmode: refresh all</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </>
  );
};
const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  header: {
    backgroundColor: "orange",
    flexDirection: "row",
    padding: 10,
  },
  cartContainer: {
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "orange",
  },
  scannerContainer: {
    marginHorizontal: 8,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    gap: 5,
    marginTop: -30,
    marginBottom: 10,
  },
  categoryContainer: {
    marginHorizontal: 8,
    marginBottom: 10,
    backgroundColor: "white",
    borderWidth: 0.5,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "flex-start",
    padding: 10,
    gap: 10,
  },
  categoryContainerItem: {
    borderColor: "black",
    borderRadius: 20,
  },
  categoryItemIcon: {
    alignSelf: "center",
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 5,
  },
  productItemsContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    elevation: 3,
    overflow: "hidden",
  },
  itemContainer: {
    backgroundColor: "white",
    width: deviceWidth / 2,
    // marginHorizontal: 6,
  },
  imageItem: {
    marginHorizontal: 16,
    marginTop: 16,
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
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    zIndex: 1,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 5,
    fontSize: 12,
  },
});

export default HomeScreen;
