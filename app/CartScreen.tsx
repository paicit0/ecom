// CartScreen.tsx
import { memo, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Dimensions } from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
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

export type CheckoutProducts = {
  productPrice: number;
  productName: string;
  productQuantity: number;
  productId: string;
  productImg: string;
  productOwner: string;
  total?: number;
};

export const CartScreen = memo(() => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [openConfirmationModal, setOpenConfirmationModal] =
    useState<boolean>(false);
  const [selectAllCheckBoxTicked, setSelectAllCheckBoxTicked] =
    useState<boolean>(false);
  const [selectedProductsId, setSelectedProductsId] = useState<string[]>([]);
  const [selectedProductsObj, setSelectedProductsObj] = useState<
    CheckoutProducts[]
  >([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const auth = getAuth();
  const userAuth = auth.currentUser;

  const getCartQuery = useGetCart({ userEmail: userAuth?.email as string });
  const addCartMutation = useAddCart();
  const deleteCartMutation = useDeleteCart();

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

  useEffect(() => {
    if (getCartQuery.data) {
      console.log("CartScreen: getCartQuery.data[0]:", getCartQuery.data[0]);
    }
  }, [getCartQuery.data]);

  useEffect(() => {
    console.log(
      "CartScreen: getCartQuery.data.length:",
      getCartQuery.data?.length
    );
    console.log("CartScreen: selectedProductsObj:", selectedProductsObj);
    console.log("CartScreen: selectedProductsId:", selectedProductsId);
    if (getCartQuery.data?.length === selectedProductsId.length) {
      setSelectAllCheckBoxTicked(true);
    } else {
      setSelectAllCheckBoxTicked(false);
    }
  }, [getCartQuery.data, selectedProductsId]);

  useEffect(() => {
    if (!selectedProductsObj) {
      return;
    } else {
      const calculateAmount = totalCalculator(selectedProductsObj);
      setTotalCost(calculateAmount);
      console.log("CartScreen: Current price amount:", calculateAmount);
    }
  }, [selectedProductsId, selectedProductsObj, getCartQuery.data]);

  if (getCartQuery.isLoading) {
    return (
      <SafeAreaView style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={getCartQuery.isLoading} />
      </SafeAreaView>
    );
  }

  if (getCartQuery.isError) {
    console.error("CartScreen: getCartQuery.error", getCartQuery.error.message);
    if (getCartQuery.error?.message === "401") {
      return;
    }

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

  const totalCalculator = (selectedProductsObj: CheckoutProducts[]) => {
    let currentTotal = 0;
    for (let i = 0; i < selectedProductsObj.length; i++) {
      let itemQuantity = selectedProductsObj[i].productQuantity;
      let itemPrice = selectedProductsObj[i].productPrice;
      let itemTotal = itemQuantity * itemPrice;
      currentTotal = currentTotal + itemTotal;
    }
    return currentTotal;
  };

  function CartHeader() {
    return (
      <View style={styles.headerContainer}>
        <Link href="../(tabs)/HomeScreen" asChild>
          <Pressable style={styles.arrowBackStyle}>
            <Ionicons name="arrow-back-outline" size={20} />
          </Pressable>
        </Link>
        <View style={styles.cartHeaderTextStyle}>
          <Text style={{ fontSize: 18 }}>Cart </Text>
          <Text style={{ alignSelf: "center", top: -2 }}>
            ({getCartQuery.data?.length})
          </Text>
        </View>
        <Pressable style={styles.chatBubbleStyle}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color={"orange"}
          />
        </Pressable>
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
                setSelectedProductsId([]);
                setSelectedProductsObj([]);
              }}
            >
              <Ionicons name="checkbox" size={24} color={"orange"} />
              <Text>Select All</Text>
            </Pressable>
          ) : (
            <Pressable
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              onPress={() => {
                if (!getCartQuery.data) return;
                setSelectAllCheckBoxTicked(true);
                setSelectedProductsId(
                  getCartQuery.data?.map((product) => product.productId) ?? []
                );
                setSelectedProductsObj(
                  getCartQuery.data?.map((product) => ({
                    productId: product.productId,
                    productPrice: product.productPrice,
                    productImg: product.productThumbnailUrl[0],
                    productName: product.productName,
                    productQuantity: product.productCartQuantity,
                    productOwner: product.productOwner,
                  })) ?? []
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
            {
              <Text style={{ color: "orange", fontSize: 18 }}>
                ฿{(totalCost / 100).toLocaleString()}
              </Text>
            }
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
            {selectedProductsId.length > 0 ? (
              <Link
                href={{
                  pathname: "/CheckoutScreen",
                  params: {
                    products: JSON.stringify([
                      ...selectedProductsObj,
                      { total: totalCost },
                    ]),
                  },
                }}
                asChild
              >
                <Pressable
                  onPress={() => {
                    console.log(
                      "CartScreen: to checkout payload:",
                      JSON.stringify([
                        ...selectedProductsObj,
                        { total: totalCost },
                      ])
                    );
                  }}
                >
                  <Text style={{ color: "white" }}>
                    Checkout ({selectedProductsId.length})
                  </Text>
                </Pressable>
              </Link>
            ) : (
              <Pressable
                onPress={() => {
                  console.error("CartScreen: checkout no payload!");
                }}
              >
                <Text style={{ color: "black" }}>
                  Checkout ({selectedProductsId.length})
                </Text>
              </Pressable>
            )}
          </Pressable>
        </View>
      </View>
    );
  }

  const render = ({ item }: { item: Product }) => {
    const productPriceToSatang = item.productPrice * 100;
    return (
      <>
        <View style={styles.itemContainerRender}>
          <View style={{ flexDirection: "row", marginLeft: 16, gap: 5 }}>
            <Pressable
              onPress={() => {
                if (selectedProductsId.includes(item.productId)) {
                  setSelectedProductsId(
                    selectedProductsId.filter(
                      (productId) => productId !== item.productId
                    )
                  );
                  setSelectedProductsObj(
                    selectedProductsObj.filter(
                      (productObj) => productObj.productId !== item.productId
                    )
                  );
                  console.log(
                    "CartScreen: Product found... removing from array"
                  );
                } else {
                  setSelectedProductsId((prev) => [...prev, item.productId]);
                  setSelectedProductsObj((prev) => [
                    ...prev,
                    {
                      productPrice: productPriceToSatang,
                      productName: item.productName,
                      productQuantity: item.productCartQuantity ?? 1,
                      productId: item.productId,
                      productImg: item.productThumbnailUrl[0],
                      productOwner: item.productOwner,
                    },
                  ]);
                  console.log(
                    "CartScreen: Product not found... adding to array"
                  );
                }
              }}
            >
              {selectedProductsId.includes(item.productId) ? (
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
                              userEmail: userAuth.email as string,
                              productId: item.productId,
                            },
                            {
                              onSuccess: () => {
                                console.log(
                                  "ItemScreen/[id]/: deleteCartMutation success"
                                );
                                setSelectedProductsObj((prev) => {
                                  const index = prev.findIndex(
                                    (p) => p.productId === item.productId
                                  );
                                  if (index !== -1) {
                                    return prev.map((p, i) =>
                                      i === index
                                        ? {
                                            ...p,
                                            productQuantity:
                                              p.productQuantity - 1,
                                          }
                                        : p
                                    );
                                  }
                                  return [
                                    ...prev,
                                    {
                                      productQuantity: 1,
                                      productPrice: item.productPrice,
                                      productName: item.productName,
                                      productId: item.productId,
                                      productImg: item.productThumbnailUrl[0],
                                      productOwner: item.productOwner,
                                    },
                                  ];
                                });
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
                            userEmail: userAuth.email as string,
                            productId: item.productId,
                          },
                          {
                            onSuccess: () => {
                              console.log(
                                "ItemScreen/[id]/: addCartMutation success"
                              );
                              setSelectedProductsObj((prev) => {
                                const index = prev.findIndex(
                                  (p) => p.productId === item.productId
                                );
                                if (index !== -1) {
                                  return prev.map((p, i) =>
                                    i === index
                                      ? {
                                          ...p,
                                          productQuantity:
                                            p.productQuantity + 1,
                                        }
                                      : p
                                  );
                                }
                                return [
                                  ...prev,
                                  {
                                    productQuantity: 1,
                                    productPrice: item.productPrice,
                                    productName: item.productName,
                                    productId: item.productId,
                                    productImg: item.productThumbnailUrl[0],
                                    productOwner: item.productOwner,
                                  },
                                ];
                              });
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
        </View>
      </>
    );
  };

  return (
    <>
      <CartHeader />
      <View style={styles.mainContainer}>
        <View style={styles.flashListContainer}>
          <FlashList
            data={getCartQuery?.data ?? []}
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
  mainContainer: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 24,
    marginBottom: 8,
    backgroundColor: "white",
  },
  cartHeaderTextStyle: {
    flexDirection: "row",
    // alignSelf: "center",
  },
  arrowBackStyle: {
    // position: "absolute",
    // left: 10,
    // top: 10,
  },
  changeButtonStyle: {
    // position:'absolute',
  },
  chatBubbleStyle: {
    // position: "absolute",
    // right: 10,
    // top: 10,
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
