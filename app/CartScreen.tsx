// CartScreen.tsx
import { memo, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { getAuth } from "firebase/auth";
import AnimatedLoadingIndicator from "../components/AnimatedLoadingIndicator";

export const CartScreen = memo(() => {
  const [loading, setLoading] = useState<boolean>(true);

  const cartItemsArray = useCart((state) => state.cartItemsArray);
  const deleteFromCart = useCart((state) => state.deleteFromCart);
  const deleteAllCart = useCart((state) => state.deleteAllCart);

  const auth = getAuth();
  const userAuth = auth.currentUser;

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

  const updateCart = async () => {
    setLoading(true);
    if (!userAuth) {
      console.error("CartScreen: no userAuth found");
      return;
    }
    try {
      if (!userAuth.email || !cartItemsArray.length) {
        return;
      }
      const idToken = await SecureStore.getItemAsync("authToken");
      const updateCartUrl =
        process.env.EXPO_PUBLIC_CURRENT_APP_MODE === "dev"
          ? process.env.EXPO_PUBLIC_updateCart_emulator
          : process.env.EXPO_PUBLIC_updateCart_prod;
      if (!updateCartUrl) {
        console.error("CartScreen: cart not bussin urls");
        return;
      }
      console.log(
        "CartScreen: Payload to updateCart:",
        userAuth.email,
        cartItemsArray
      );
      const updateCart = await axios.post(
        updateCartUrl,
        {
          email: userAuth.email,
          cartItemsArray: cartItemsArray,
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("CartScreen: updateCart.status", updateCart.status);
    } catch (error) {
      console.error("CartScreen: update failed: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cartItemsArray.length > 0) {
      updateCart();
    }
  }, [cartItemsArray]);

  const handleCartSubmit = () => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

  if (loading) {
    return (
      <View style={{ marginTop: 60 }}>
        <AnimatedLoadingIndicator loading={loading} />
      </View>
    );
  }

  if (!cartItemsArray.length) {
    return (
      <View
        style={{
          flex: 1,
          alignContent: "center",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <Text>There's no item in your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline" size={20}></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Cart</Text>
        </View>

        {cartItemsArray.map((item, index) => (
          <View style={styles.cartContainer} key={index}>
            <Text>id {item.id}</Text>
            <Text>quantity {item.quantity}</Text>
            {/* <Text>${item.productPrice}</Text>
            <Image
              style={styles.imageItem}
              source={{ uri: item.productThumbnailUrl }}
            /> */}
            <Pressable onPress={() => deleteFromCart(item.id)}>
              <Ionicons
                name="close-sharp"
                size={20}
                color="#666"
                style={styles.icon}
              />
            </Pressable>
          </View>
        ))}
        {cartItemsArray.length > 0 && (
          <View>
            <Pressable onPress={deleteAllCart}>
              <Text>Delete All</Text>
            </Pressable>
          </View>
        )}
        <Pressable onPress={() => handleCartSubmit()}>
          <Text>Checkout</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
});

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
  imageItem: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  icon: {
    marginRight: 8,
  },
});

export default CartScreen;
