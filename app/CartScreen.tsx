// CartScreen.tsx
import { memo, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { getAuth } from "firebase/auth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCart } from "../hooks/fetch/useGetCart";
import { useDeleteCart } from "../hooks/fetch/useDeleteCart";
import { Product } from "./store/store";
import { Image } from "expo-image";
import { FlashList } from "@shopify/flash-list";

export const CartScreen = memo(() => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
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
  const deleteCartMutation = useDeleteCart();

  useEffect(() => {
    console.log("CartScreen: Cart array Length:", getCartQuery.data?.length);
  }, []);

  const handleCartSubmit = () => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

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

  const render = ({ item }: { item: Product }) => {
    const productPriceToBaht = item.productPrice * 100;
    return (
      <View style={styles.renderStyle}>
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
            <Text numberOfLines={2} ellipsizeMode="tail" style={{}}>
              {item.productName}
            </Text>
            <View style={styles.priceStockContainer}>
              <Text style={{}}>฿{item.productPrice}</Text>
              <View style={{ flexDirection: "row", gap: 5 }}>
                <Ionicons
                  name="remove-outline"
                  size={16}
                  style={{ borderWidth: 0.5, alignSelf: "center" }}
                ></Ionicons>
                <Text style={{}}>{item.productCartQuantity}</Text>
                <Ionicons
                  name="add-outline"
                  size={16}
                  style={{ borderWidth: 0.5, alignSelf: "center" }}
                ></Ionicons>
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
          <Pressable
            style={{ alignSelf: "center" }}
            onPress={() => handleCartSubmit()}
          >
            <Text>Checkout</Text>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <View>
        <Link href="../(tabs)/HomeScreen">
          <Ionicons name="arrow-back-outline" size={20}></Ionicons>
        </Link>
      </View>
      <View
        style={{
          width: deviceWidth,
          height: 500,
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
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
          extraData={[getCartQuery.data]} // re renders if isLoading/products change
          onEndReachedThreshold={0.5}
          refreshing={isRefreshing}
          onRefresh={() => {
            setIsRefreshing(true);
            getCartQuery.refetch();
            setIsRefreshing(false);
          }}
          // onEndReached={loadMore}
        />
      </View>
    </SafeAreaView>
  );
});

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: "center",
  },
  renderStyle: {},
  itemContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
    width: deviceWidth / 2,
    alignSelf: "center",
  },
  imageItem: {
    minHeight: 125,
    minWidth: 125,
    // backgroundColor: "green",
  },
  priceStockContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    // width: (Dimensions.get("window").width / 2) - 15,
  },
});

export default CartScreen;
