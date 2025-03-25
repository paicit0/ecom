// CartScreen.tsx
import { memo, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCart } from "../hooks/fetch/useGetCart";
import { useAddCart } from "../hooks/fetch/useAddCart";
import { useDeleteCart } from "../hooks/fetch/useDeleteCart";
import { Product } from "../store/store";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";
import { Modal } from "react-native";
import { getCart } from "../firebase/functions/src";

export const CartScreen = memo(() => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);
  const [selectAllCheckBoxTicked, setSelectAllCheckBoxTicked] =
    useState<boolean>(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const auth = getAuth();
  const userAuth = auth.currentUser;
  const router = useRouter();

  if (!userAuth) {
    console.error("CartScreen: no userAuth");
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
  const userEmail = userAuth.email;

  const getCartQuery = useGetCart({ userEmail: userEmail as string });
  const addCartMutation = useAddCart();
  const deleteCartMutation = useDeleteCart();

  useEffect(() => {
    console.log("CartScreen: Cart array Length:", getCartQuery.data?.length);
  }, []);

  useEffect(() => {
    console.log("CartScreen: selectedProducts useEffect: ", selectedProducts);
  }, [selectedProducts]);

  // fix later
  useEffect(() => {
    if (getCartQuery.data?.length === selectedProducts.length) {
      setSelectAllCheckBoxTicked(true);
    } else {
      setSelectAllCheckBoxTicked(false);
    }
    console.log("CartScreen: selectedProducts useEffect: ", selectedProducts);
    console.log("getCartQuery.data", getCartQuery.data);
  }, [selectedProducts, getCartQuery.data]);

  if (getCartQuery.isLoading) {
    return (
      <SafeAreaView style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={getCartQuery.isLoading} />
      </SafeAreaView>
    );
  }

  if (getCartQuery.isError) {
    console.error("CartScreen: useGetCartQuery.isError", getCartQuery.error);
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignSelf: "center" }}
      >
        <Text>Failed to get cart items.</Text>
        <Pressable onPress={() => getCartQuery.refetch()}>
          <Text>Try to Reload</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!getCartQuery.data || !getCartQuery.data.length) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text>There's no item in your cart...</Text>
        <Pressable onPress={() => getCartQuery.refetch()}>
          <Text>Reload</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  function CartHeader() {
    return (
      <View style={styles.headerContainer}>
        <Link href="../(tabs)/HomeScreen" asChild>
          <Pressable
            style={{ marginLeft: 8, position: "absolute", paddingTop: 10 }}
          >
            <Ionicons name="arrow-back-outline" size={20} />
          </Pressable>
        </Link>
        <View style={styles.cartHeaderTextStyle}>
          <Text>Cart </Text>
          <Text style={{ top: -4 }}>({getCartQuery.data?.length})</Text>
        </View>
      </View>
    );
  }

  function CartFooter() {
    return (
      <View style={styles.footerContainer}>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginLeft: 10,
          }}
        >
          {selectAllCheckBoxTicked ? (
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              onPress={() => {
                setSelectAllCheckBoxTicked(false);
                setSelectedProducts([]);
              }}
            >
              <Ionicons name="checkbox" size={24} color={"orange"} />
              <Text>Select All</Text>
            </Pressable>
          ) : (
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              onPress={() => {
                setSelectAllCheckBoxTicked(true);
                setSelectedProducts(
                  getCartQuery.data?.map((product) => product.productId) ??[]
                );
              }}
            >
              <Ionicons name="square-outline" size={24} color={"orange"} />
              <Text>Select All</Text>
            </Pressable>
          )}
        </View>
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 10,
            marginRight: 20,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignSelf: "flex-start" }}>
            <Text style={{ alignSelf: "center", fontSize: 12 }}>Amount </Text>
            {<Text style={{ color: "orange", fontSize: 18 }}>฿9,999</Text>}
          </View>
          <Pressable
            style={{
              width: 120,
              height: 45,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              backgroundColor: "orange",
            }}
          >
            <Text style={{ color: "white" }}>
              Checkout ({selectedProducts.length})
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const render = ({ item }: { item: Product }) => {
    const productPriceToBaht = item.productPrice * 100;
    return (
      <>
        <View key={item.productId} style={styles.itemContainerRender}>
          <View style={{ flexDirection: "row", marginLeft: 16, gap: 5 }}>
            <Pressable
              onPress={() => {
                if (selectedProducts.includes(item.productId)) {
                  setSelectedProducts(
                    selectedProducts.filter(
                      (product) => product !== item.productId
                    )
                  );
                  console.log(
                    "CartScreen: Product found... removing from array"
                  );
                } else {
                  setSelectedProducts([...selectedProducts, item.productId]);
                  console.log(
                    "CartScreen: Product not found... adding to array"
                  );
                }
              }}
            >
              {selectedProducts.includes(item.productId) ? (
                <Ionicons name="checkbox" size={24} color={"orange"} />
              ) : (
                <Ionicons name="square-outline" size={24} color={"orange"} />
              )}
            </Pressable>
            <Ionicons
              name="storefront-outline"
              size={18}
              style={{ alignSelf: "center" }}
            />
            <Text style={{ fontWeight: "bold" }}>{item.productOwner}</Text>
          </View>

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
              <View style={styles.namePriceStockContainer}>
                <Text numberOfLines={2} ellipsizeMode="tail" style={{}}>
                  {item.productName}
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "red" }}>
                    ฿{item.productPrice.toLocaleString()}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 5 }}>
                    <Pressable
                      onPress={() => {
                        if (item.productCartQuantity === 1) {
                          console.log("CartScreen: item Quantity = 1");
                          return (
                            <>
                              <Modal
                                animationType="slide"
                                transparent={true}
                                visible={openConfirmationModal}
                                onRequestClose={() => {
                                  console.log(
                                    "CartScreen: Modal has been closed."
                                  );
                                  setOpenConfirmationModal(false);
                                }}
                              ></Modal>
                              <Text>
                                This will remove the product from your cart. Are
                                you sure?
                              </Text>
                              <Pressable
                                onPress={() => setOpenConfirmationModal(true)}
                              >
                                <Text>Yes</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => setOpenConfirmationModal(false)}
                              >
                                <Text>Cancel</Text>
                              </Pressable>
                            </>
                          );
                        } else {
                          deleteCartMutation.mutate(
                            {
                              userEmail: userEmail as string,
                              productId: item.productId,
                            },
                            {
                              onSuccess: () => {
                                console.log(
                                  "ItemScreen/[id]/: deleteCartMutation success"
                                );
                              },
                              onError: () => {
                                console.log(
                                  "ItemScreen/[id]/: deleteCartMutation error"
                                );
                              },
                            }
                          );
                        }
                      }}
                    >
                      <Ionicons
                        name="remove-outline"
                        size={16}
                        style={{ borderWidth: 0.5, alignSelf: "center" }}
                      />
                    </Pressable>
                    <Text style={{}}>{item.productCartQuantity}</Text>
                    <Pressable
                      onPress={() => {
                        addCartMutation.mutate(
                          {
                            userEmail: userEmail as string,
                            productId: item.productId,
                          },
                          {
                            onSuccess: () => {
                              console.log(
                                "ItemScreen/[id]/: addCartMutation success"
                              );
                            },
                            onError: () => {
                              console.log(
                                "ItemScreen/[id]/: addCartMutation error"
                              );
                            },
                          }
                        );
                      }}
                    >
                      <Ionicons
                        name="add-outline"
                        size={16}
                        style={{ borderWidth: 0.5, alignSelf: "center" }}
                      />
                    </Pressable>
                  </View>
                </View>
              </View>
            </Pressable>
          </Link>
          <Link
            href={{
              pathname: "/CheckoutScreen",
              params: {
                amount: productPriceToBaht.toString().toLocaleString(),
                name: item.productName,
                quantity: item.productCartQuantity,
              },
            }}
            asChild
          >
            <Pressable style={{ alignSelf: "flex-end", marginRight: 16 }}>
              <Text>Checkout</Text>
            </Pressable>
          </Link>
        </View>
      </>
    );
  };

  return (
    <>
      <SafeAreaView style={{ backgroundColor: "white" }}></SafeAreaView>
      <CartHeader />
      <View style={styles.mainContainer}>
        <View style={styles.flashListContainer}>
          <FlashList
            data={getCartQuery.data}
            renderItem={render}
            keyExtractor={(item) => item.productId}
            numColumns={1}
            showsVerticalScrollIndicator={false}
            estimatedItemSize={200}
            horizontal={false}
            ListEmptyComponent={() => (
              <Pressable onPress={() => getCartQuery.refetch()}>
                <Text>Press to refresh (Placeholder)</Text>
              </Pressable>
            )}
            extraData={[getCartQuery.data]}
            onEndReachedThreshold={0.5}
            refreshing={isRefreshing}
            onRefresh={() => {
              setIsRefreshing(true);
              getCartQuery.refetch().then(() => setIsRefreshing(false));
            }}
            // onEndReached={loadMore}
          />
        </View>
      </View>
      <CartFooter />
    </>
  );
});

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 32,
    marginBottom: 8,
    backgroundColor: "white",
  },
  cartHeaderTextStyle: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  mainContainer: {
    flex: 1,
  },
  flashListContainer: {
    flex: 1,
  },
  itemContainerRender: {
    marginBottom: 8,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 16,
    backgroundColor: "white",
  },
  itemContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  imageItem: {
    height: 100,
    width: 100,
    borderRadius: 8,
  },
  namePriceStockContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    marginLeft: 16,
  },
  footerContainer: {
    width: "100%",
    flexDirection: "row",
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: "white",
  },
});
export default CartScreen;
