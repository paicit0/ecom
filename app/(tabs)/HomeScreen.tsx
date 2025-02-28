// HomeScreen.tsx
import { memo, useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Pressable,
  ScrollView,
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
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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

  useEffect(() => {
    setCurrentProductNumber(0);
    getProductsQuery.refetch();
  }, [selectedCategory]);

  const handleCategorySelect = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory("");
    } else {
      setSelectedCategory(category);
    }
  };

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

  const belowSearchBar = () => {
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
            <Ionicons
              name="barcode-outline"
              size={30}
              color={"gray"}
            ></Ionicons>
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
                <Ionicons
                  name="card-outline"
                  size={24}
                  color={"red"}
                ></Ionicons>
                <Text style={{ alignSelf: "center", marginLeft: 2 }}>
                  ฿0.00
                </Text>
              </View>
              <Text style={{ alignSelf: "flex-start" }}>abcd</Text>
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
                ></Ionicons>
                <Text style={{ alignSelf: "center", marginLeft: 2 }}>0.00</Text>
              </View>
              <Text style={{ alignSelf: "flex-start" }}>Coin</Text>
            </View>
            <View>
              <View style={{ flexDirection: "row", justifyContent: "center" }}>
                <Ionicons
                  name="gift-outline"
                  size={24}
                  color={"blue"}
                ></Ionicons>
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
            <Ionicons name="logo-bitcoin" size={30} color={"orange"}></Ionicons>
          </View>
        </View>
        <View style={styles.categoryContainer}>
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
                color={"black"}
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
                  ฿{item.productPrice}
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
    <SafeAreaView style={styles.mainContainer}>
      <View style={{ flex: 1, backgroundColor: "#F5F5F5" }}>
        <View style={{ backgroundColor: "transparent" }}>
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
          ListHeaderComponent={belowSearchBar}
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
    justifyContent: "center",
    padding: 10,
    gap: 40,
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
    marginTop:16,
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
