// CartScreen.tsx
import { memo, useEffect } from "react";
import { View, StyleSheet, Pressable, ScrollView } from "react-native";
import { Text, Image } from "react-native";
import { useCart } from "./store/store";
import { Ionicons } from "@expo/vector-icons";
import { CartItem } from "./store/store";
import { Link } from "expo-router";
import { useUserSession } from "./auth/firebaseAuth";

export const CartScreen = memo(() => {
  const cart = useCart((state) => state.cartItems);
  const deleteItem = useCart((state) => state.deleteCart);
  const deleteAll = useCart((state) => state.deleteAllCart);
  const userEmail = useUserSession((state) => state.userInfo.email);

  useEffect(() => {
    const updateCart = async () => {
      try {
        const updateUserUrlLocal = "http://10.0.2.2:5001/ecom-firestore-11867/us-central1/updateUser";
        const update = await fetch(updateUserUrlLocal, {
          body: JSON.stringify({
            email: userEmail,
            favorite: cart,
          }),
        });
        console.log(update.status);
      } catch (error) {
        console.log("update failed: ", error);
      }
    };
  }, [cart]);

  const handleCartSubmit = (cart: CartItem[]) => {
    try {
    } catch (error) {
      console.error("Error submitting cart: ", error);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    for (let i = 0; i < cart.length; i++) {
      total = total + cart[i].price;
    }
    return total;
  };

  return (
    <ScrollView>
      <View>
        <View style={{ height: 60 }}></View>
        <View>
          <Link href="../(tabs)/HomeScreen">
            <Ionicons name="arrow-back-outline"></Ionicons>
          </Link>
          <Text style={{ textAlign: "center" }}>Your Cart</Text>
        </View>

        {cart.map((item, index) => (
          <View style={styles.cartContainer} key={index}>
            <Text>{item.title}</Text>
            <Text>${item.price}</Text>
            <Image style={styles.imageItem} source={{ uri: item.images[0] }} />
            <Pressable onPress={() => deleteItem(index)}>
              <Ionicons
                name="close-sharp"
                size={20}
                color="#666"
                style={styles.icon}
              />
            </Pressable>
          </View>
        ))}

        {cart.length === 0 && (
          <Text style={{ textAlign: "center" }}>Your cart is empty!</Text>
        )}

        {cart.length > 0 && (
          <View>
            <Pressable onPress={deleteAll}>
              <Text>Delete All</Text>
            </Pressable>
            <Pressable onPress={() => handleCartSubmit(cart)}>
              <Text>Checkout</Text>
            </Pressable>
          </View>
        )}
      </View>
    </ScrollView>
  );
});

const styles = StyleSheet.create({
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
