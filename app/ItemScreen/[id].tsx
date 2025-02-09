import { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCart, useFavorite } from "../store/store";
import { Link, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import axios from "axios";
import { Product } from "../store/store";
import { FlashList } from "@shopify/flash-list";
import AnimatedLoadingIndicator from "../../components/AnimatedLoadingIndicator";

const ItemScreen = memo(function ItemScreen() {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState<boolean>(true);

  const { id }: { id: string } = useLocalSearchParams();

  const cart = useCart((state) => state.cartItemsArray);
  const addToCart = useCart((state) => state.addToCart);

  const addToFavorite = useFavorite((state) => state.addToFavorite);
  const deleteFromFavorite = useFavorite((state) => state.deleteFromFavorite);
  const favoriteItemsArray = useFavorite((state) => state.favoriteItemsArray);

  const itemIsFavorited = (id: string) => favoriteItemsArray.includes(id);

  useEffect(() => {
    const getTheProduct = async () => {
      try {
        const getTheProductUrl =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_getTheProduct_emulator
            : process.env.EXPO_PUBLIC_getTheProduct_prod;
        if (!getTheProductUrl) {
          console.log("ItemScreen/[id]: url not bussing!");
          return;
        }
        console.log("ItemScreen/[id]: getTheProductUrl:", getTheProductUrl);
        const getTheProduct = await axios.get(getTheProductUrl, {
          params: { productId: id },
          headers: {
            "Content-Type": "application/json",
          },
        });

        const getTheProductData = await getTheProduct.data;
        console.log("getTheProduct", getTheProductData);

        if (getTheProductData) {
          setProduct(getTheProductData);
        }
      } catch (error) {
        console.log("ItemScreen/[id].getTheProduct:", error);
      } finally {
        setLoading(false);
      }
    };
    
    getTheProduct();
    console.log("getTheProduct: Product State:", product);
  }, []);

  // useEffect(() => {
  //   const updateCart = async () => {
  //     try {
  //       const updateUserUrl =
  //         process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
  //           ? process.env.EXPO_PUBLIC_updateUser_emulator
  //           : process.env.EXPO_PUBLIC_updateUser_prod;
  //       if (!updateUserUrl) {
  //         console.log("ItemScreen/[id]: url not bussing!");
  //         return;
  //       }
  //       console.log("ItemScreen/[id]: updateUserUrl:", updateUserUrl);
  //       const update = await axios.post(
  //         updateUserUrl,
  //         { email: userEmail, cart: cartItems },
  //         {
  //           headers: {
  //             "Content-Type": "application/json",
  //           },
  //         }
  //       );
  //       console.log(update.status);
  //     } catch (error) {
  //       console.log("ItemScreen/[id].updateCart: update failed: ", error);
  //     }
  //   };
  //   updateCart();
  // }, [cartItems]);

  // useEffect(() => {
  //   console.log("Going to Screen itemId :", id);
  // }, []);

  const render = ({ item }: { item: string }) => {
    return (
      <View>
        <Image
          style={styles.imageItem}
          source={{ uri: item }}
          contentFit="cover"
          transition={200}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={loading} />
      </View>
    );
  }

  if (!product) {
    return (
      <View
        style={{ flex: 1, alignContent: "center", justifyContent: "center" }}
      >
        <Text>No Product Found... It may have been deleted.</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView accessible={false}>
        <View style={{ flex: 1 }}>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <View style={styles.FlashListStyle}>
            <FlashList
              data={product.productThumbnailUrl}
              renderItem={render}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              estimatedItemSize={200}
              snapToAlignment="start"
              horizontal={true}
              pagingEnabled={true}
              disableIntervalMomentum={true}
              ListEmptyComponent={() => (
                <Text style={{ color: "red" }}>No Images to Display</Text>
              )}
            />
          </View>

          <View style={styles.mainDescription}>
            <View style={styles.itemHeader}>
              <View style={styles.productPrice}>
                <Text style={styles.productPriceText}>
                  {"$" + product.productPrice}
                </Text>
              </View>
              <View style={styles.productStock}>
                <Text>Stock: {product.productStock}</Text>
              </View>
              {itemIsFavorited(id) ? (
                <Pressable
                  onPress={() => {
                    deleteFromFavorite(id);
                  }}
                >
                  <View style={styles.favoriteButton}>
                    <Ionicons name="heart" size={24} color="black" />
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    addToFavorite(id);
                  }}
                >
                  <View style={styles.favoriteButton}>
                    <Ionicons name="heart-outline" size={24} color="black" />
                  </View>
                </Pressable>
              )}
            </View>

            <View style={styles.productName}>
              <Text style={styles.productNameText}>{product.productName}</Text>
            </View>
            <View style={styles.productDescription}>
              <Text style={styles.productDescriptionText}>
                {product.productDescription}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.ItemFooter}>
        <Pressable
          onPress={() => {
            addToCart(id);
          }}
          style={styles.FooterCart}
        >
          {cart.length > 0 && (
            <Text style={styles.badge}>
              {cart.length > 99 ? "99+" : cart.length}
            </Text>
          )}
          <Ionicons
            name="cart-outline"
            size={20}
            color="white"
            style={{ alignSelf: "center" }}
          />
          <Text style={{ color: "white" }}>Add to Cart</Text>
        </Pressable>
        <Pressable style={styles.FooterBuy}>
          <Text style={{ color: "white", alignSelf: "center" }}>Buy Now</Text>
        </Pressable>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  imageItem: {
    minHeight: 150,
    minWidth: 150,
  },
  FlashListStyle: {
    flex: 1,
    height: (Dimensions.get("window").height / 2) * 0.8,
    width: Dimensions.get("window").width,
    marginTop: 35,
    borderBottomColor: "black",
    borderWidth: 1,
  },
  itemHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomColor: "black",
    borderWidth: 1,
  },
  mainDescription: {
    // padding: 20
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },
  productName: {
    marginTop: 12,
  },
  productNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  productDescription: {},
  productDescriptionText: {},
  productPrice: {
    alignItems: "center",
    justifyContent: "center",
  },
  productPriceText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
  },
  productStock: {
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  idContainer: {
    marginTop: 8,
  },
  idText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  ItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 12,
    backgroundColor: "black",
  },
  FooterCart: {
    flexDirection: "column",
    justifyContent: "space-between",
    padding: 8,
  },
  FooterBuy: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 8,
  },
  badge: {
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

export default ItemScreen;
