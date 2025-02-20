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
import { Link } from "expo-router";
import { getAuth } from "firebase/auth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";
import { SafeAreaView } from "react-native-safe-area-context";
import { useGetCart } from "../hooks/fetch/useGetCart";
import { useDeleteCart } from "../hooks/fetch/useDeleteCart";
import { Product } from "./store/store";
import { Image } from "expo-image";

export const CartScreen = memo(() => {
  const auth = getAuth();
  const userAuth = auth.currentUser;

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

  const useGetCartQuery = useGetCart({ userEmail: userEmail as string });
  const useDeleteCartMutation = useDeleteCart();

  useEffect(() => {}, []);

  const handleCartSubmit = () => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

  if (useGetCartQuery.isLoading) {
    return (
      <SafeAreaView style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={useGetCartQuery.isLoading} />
      </SafeAreaView>
    );
  }

  if (useGetCartQuery.isError) {
    console.error("CartScreen: useGetCartQuery.isError", useGetCartQuery.error);
    return (
      <SafeAreaView style={{ marginTop: 60 }}>
        <Text>Failed to get cart items.</Text>
        <Pressable onPress={() => useGetCartQuery.refetch()}>
          <Text>Try to Reload</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (!useGetCartQuery.data || !useGetCartQuery.data.length) {
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
      </SafeAreaView>
    );
  }

  const render = ({ item }: { item: Product }) => {
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
              <Text style={{}}>${item.productPrice}</Text>
              <Text style={{}}>Stock: {item.productStock}</Text>
            </View>
          </Pressable>
        </Link>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.mainContainer}>
      <ScrollView>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Cart</Text>
        </View>

        <Pressable onPress={() => handleCartSubmit()}>
          <Text>Checkout</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
});

const deviceHeight = Dimensions.get("window").height;
const deviceWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    alignContent: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  cartContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 8,
  },
  renderStyle: { height: "100%", width: "100%" },
  itemContainer: {
    flex: 1,
    padding: 5,
    backgroundColor: "white",
    width: deviceWidth / 2,
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
