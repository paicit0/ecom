// ItemScreen/[id].tsx
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
import axios, { AxiosError } from "axios";
import { Product } from "../store/store";
import { FlashList } from "@shopify/flash-list";
import AnimatedLoadingIndicator from "../../components/AnimatedLoadingIndicator";
import { useAddFavorite } from "../../hooks/fetch/useAddFavorite";
import { useDeleteFavorite } from "../../hooks/fetch/useDeleteFavorite";
import { getAuth } from "firebase/auth";
import { useGetFavorite } from "../../hooks/fetch/useGetFavorite";

const ItemScreen = memo(function ItemScreen() {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);

  const { id: productId }: { id: string } = useLocalSearchParams();

  const cart = useCart((state) => state.cartItemsArray);
  const addToCart = useCart((state) => state.addToCart);

  const auth = getAuth();

  if (!auth.currentUser) {
    console.error("ItemScreen/[id]: no auth.currentUser");
    return;
  }

  const userEmail = auth.currentUser.email;

  if (!userEmail) {
    console.error("ItemScreen/[id]: no userEmail");
    return;
  }

  const addFavoriteMutation = useAddFavorite();
  const deleteFavoriteMutation = useDeleteFavorite();
  const getFavoriteQuery = useGetFavorite({ userEmail });

  useEffect(() => {
    const getTheProduct = async () => {
      try {
        setLoading(true);
        const getTheProductUrl =
          process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
            ? process.env.EXPO_PUBLIC_getTheProduct_emulator
            : process.env.EXPO_PUBLIC_getTheProduct_prod;
        if (!getTheProductUrl) {
          console.error("ItemScreen/[id]: url not bussing!");
          return;
        }
        console.log("ItemScreen/[id]: getTheProductUrl:", getTheProductUrl);
        const getTheProduct = await axios.get(getTheProductUrl, {
          params: { userEmail: userEmail, productId: productId },
          headers: {
            "Content-Type": "application/json",
          },
        });

        const getTheProductData = await getTheProduct.data;
        console.log("getTheProduct:", getTheProductData);
        console.log("getTheProduct isFavorite:", getTheProductData.isFavorite);

        if (getTheProductData.isFavorite === true) {
          setIsFavorited(true);
        } else {
          setIsFavorited(false);
        }

        if (getTheProductData) {
          setProduct(getTheProductData);
        }
      } catch (error) {
        console.error("ItemScreen/[id].getTheProduct:", error);
      } finally {
        setLoading(false);
      }
    };

    getTheProduct();
  }, []);

  const render = ({ item }: { item: Product }) => {
    return (
      <View>
        <Image
          style={styles.imageItem}
          source={{ uri: item.productThumbnailUrl[0] }}
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
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
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
              data={[product]}
              renderItem={render}
              keyExtractor={(item) => item.productId}
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
              {isFavorited ? (
                <Pressable
                  onPress={() => {
                    deleteFavoriteMutation.mutate(
                      { userEmail: userEmail, productId: productId },
                      {
                        onSuccess: () => {
                          console.log(
                            "ItemScreen/[id]/: deleteFavorite success"
                          ),
                            setIsFavorited(false);
                        },
                        onError: () => {
                          console.log("ItemScreen/[id]/: error"),
                            setIsFavorited(true);
                        },
                      }
                    );
                  }}
                >
                  <View style={styles.favoriteButton}>
                    <Ionicons name="heart" size={24} color="black" />
                  </View>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => {
                    addFavoriteMutation.mutate(
                      { userEmail: userEmail, productId: productId },
                      {
                        onSuccess: () => {
                          console.log(
                            "ItemScreen/[id]/: addFavorite success"
                          ),
                            setIsFavorited(true);
                        },
                        onError: () => {
                          console.log("ItemScreen/[id]/: error"),
                            setIsFavorited(false);
                        },
                      }
                    );
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
            addToCart(productId);
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
