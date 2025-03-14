// ItemScreen/[id].tsx
import { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useLocalSearchParams } from "expo-router";
import { Image } from "expo-image";
import axios, { AxiosError } from "axios";
import { Product } from "../store/store";
import AnimatedLoadingIndicator from "../../components/AnimatedLoadingIndicator";
import { useAddFavorite } from "../../hooks/fetch/useAddFavorite";
import { useDeleteFavorite } from "../../hooks/fetch/useDeleteFavorite";
import { useAddCart } from "../../hooks/fetch/useAddCart";
import { getAuth } from "firebase/auth";
import { SafeAreaView } from "react-native-safe-area-context";
import EmptySearchBar from "../../components/EmptySearchBar";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

const ItemScreen = memo(function ItemScreen() {
  const [product, setProduct] = useState<Product>();
  const [loading, setLoading] = useState<boolean>(false);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [productImageNo, setProductImageNo] = useState<number>(0);

  const { id: productId }: { id: string } = useLocalSearchParams();
  const auth = getAuth();

  if (!auth.currentUser) {
    console.error("ItemScreen/[id]: no auth.currentUser");
    return (
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>Please </Text>
        <Link href="/LoginScreen" asChild>
          <Pressable style={{}}>
            <Text style={{ color: "blue" }}>Login</Text>
          </Pressable>
        </Link>
      </View>
    );
  }

  const userEmail = auth.currentUser.email;

  if (!userEmail) {
    console.error("ItemScreen/[id]: no userEmail");
    return;
  }

  const addFavoriteMutation = useAddFavorite();
  const deleteFavoriteMutation = useDeleteFavorite();

  const addCartMutation = useAddCart();

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

  const handleImageSwitch = () => {
    if (true) {
      setProductImageNo((prev) => prev + 1);
    } else {
      setProductImageNo((prev) => prev - 1);
    }
  };

  const handlePrevImage = () => {};
  const opacitySearchBar = useSharedValue<number>(1);
  const buttonCircleColor = useSharedValue<string>("red");

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event, ctx: { prevY: number | undefined }) => {
      const currentY = event.contentOffset.y;
      if (ctx.prevY !== undefined) {
        opacitySearchBar.value = withTiming(currentY > ctx.prevY ? 0 : 1, {
          duration: 200,
        });
        buttonCircleColor.value = currentY > ctx.prevY ? "orange" : "red";
      }
      ctx.prevY = currentY;
    },
  });
  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: opacitySearchBar.value,
  }));

  const buttonCircleStyle = useAnimatedStyle(() => ({
    backgroundColor: buttonCircleColor.value,
  }));

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
    <SafeAreaView style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={{ alignSelf: "center", marginRight: 8 }}>
          <Link href="../(tabs)/HomeScreen" asChild>
            <Pressable style={[styles.headerButtonCircle, buttonCircleStyle]}>
              <Ionicons
                name="arrow-back-outline"
                size={28}
                color={"white"}
              ></Ionicons>
            </Pressable>
          </Link>
        </View>

        <EmptySearchBar
          placeholderArray={["Wrench", "Drill"]}
          style={animatedHeaderStyle}
        />
        <View
          style={{
            flexDirection: "row",
            alignSelf: "center",
            gap: 10,
            marginLeft: 8,
            // opacity:0.5
          }}
        >
          <Pressable style={styles.headerButtonCircle}>
            <Ionicons name="share-outline" size={28} color={"white"}></Ionicons>
          </Pressable>
          <Link href="/CartScreen" asChild>
            <Pressable style={styles.headerButtonCircle}>
              <Ionicons name="cart-outline" size={28} color="white" />
            </Pressable>
          </Link>
          <Pressable style={styles.headerButtonCircle}>
            <Ionicons
              name="ellipsis-vertical-outline"
              size={28}
              color={"white"}
            ></Ionicons>
          </Pressable>
        </View>
      </View>
      <Animated.ScrollView onScroll={scrollHandler} scrollEventThrottle={16}>
        <View style={styles.imageItem}>
          {product.productImageUrl.map((item, index) => (
            <Image
              style={{ flex: 1, width: "100%" }}
              key={index}
              source={{ uri: item }}
              contentFit="cover"
              transition={200}
            />
          ))}
        </View>

        <View style={styles.mainDescription}>
          <View style={styles.itemHeader}>
            <View style={styles.productPriceContainer}>
              <Text style={styles.productPriceText}>
                {"฿" + product.productPrice.toLocaleString()}
              </Text>
            </View>
            <View style={styles.productStockFavoriteContainer}>
              <Text>Stock: {product.productStock}</Text>
              <View style={styles.favoriteContainer}>
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
                              "ItemScreen/[id]/: addFavoriteMutation success"
                            ),
                              setIsFavorited(true);
                          },
                          onError: () => {
                            console.log(
                              "ItemScreen/[id]/: addFavoriteMutation error"
                            ),
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
            </View>
          </View>

          <View style={styles.productNameContainer}>
            <Text style={styles.productNameText}>{product.productName}</Text>
          </View>
          <View style={styles.productDescriptionContainer}>
            <Text style={styles.productDescriptionText}>
              {product.productDescription}
            </Text>
          </View>
          <View style={styles.deliveryOptionContainer}>
            <Text>Delivery Options:</Text>
          </View>
          <View style={{ height: 600 }}></View>
        </View>
      </Animated.ScrollView>

      <View style={styles.ItemFooter}>
        <Pressable
          onPress={() => {
            addCartMutation.mutate(
              { userEmail: userEmail, productId: productId },
              {
                onSuccess: () => {
                  console.log("ItemScreen/[id]/: addCartMutation success");
                },
                onError: () => {
                  console.log("ItemScreen/[id]/: addCartMutation error");
                },
              }
            );
          }}
          style={styles.addToCartFooter}
        >
          {/* {cart.length > 0 && (
            <Text style={styles.badge}>
              {cart.length > 99 ? "99+" : cart.length}
            </Text>
          )} */}
          <Ionicons
            name="cart-outline"
            size={20}
            color="white"
            style={{ alignSelf: "center" }}
          />
          <Text style={{ color: "white" }}>Add to Cart</Text>
        </Pressable>

        <Link
          href={{
            pathname: "/CheckoutScreen",
            params: {
              amount: product.productPrice * 100,
              name: product.productName,
              quantity: 1,
            },
          }}
          asChild
        >
          <Pressable style={styles.buyFooter}>
            <Text style={{ color: "white", alignSelf: "center" }}>Buy Now</Text>
            <Text style={{ color: "white", alignSelf: "center", fontSize: 22 }}>
              ฿{product.productPrice.toLocaleString()}
            </Text>
          </Pressable>
        </Link>
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
  header: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "orange",
    // marginBottom:-50,
    // zIndex:1
  },
  headerButtonCircle: { borderRadius: 20 },
  imageItem: {
    flexDirection: "row",
    aspectRatio: 3 / 2,
    height: undefined,
    width: deviceWidth,
  },
  itemHeader: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    borderBottomColor: "grey",
    borderBottomWidth: 0.5,
  },
  mainDescription: {
    backgroundColor: "white",
    // padding: 20
  },
  productNameContainer: {
    marginLeft: 8,
    marginTop: 12,
  },
  productNameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  productDescriptionContainer: { marginLeft: 8, marginBottom: 8 },
  productDescriptionText: {},
  productPriceContainer: {
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  productPriceText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "green",
  },
  productStockFavoriteContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  favoriteContainer: { marginRight: 8 },
  favoriteButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryOptionContainer: {
    flexDirection: "row",
    alignContent: "flex-start",
    alignItems: "center",
    paddingLeft: 15,
    paddingTop: 15,
    paddingBottom: 15,
    gap: 8,
    borderColor: "grey",
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5,
    backgroundColor: "white",
  },
  ItemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 20,
    backgroundColor: "orange",
  },
  addToCartFooter: {
    flexDirection: "column",
    margin: 8,
  },
  buyFooter: {
    flexDirection: "column",
    margin: 8,
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

export default ItemScreen;
