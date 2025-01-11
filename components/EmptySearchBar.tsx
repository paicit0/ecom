import React from "react";
import { Pressable, StyleSheet, TextInput, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Link } from "expo-router";
import { useCart } from "@/app/store/store";

const EmptySearchBar = memo(function SearchBar() {
  const cart = useCart((state) => state.cartItems);
  return (
    <View style={styles.container}>
      <Link href={"/SearchScreen"} style={styles.input}>
        <Ionicons name="search" size={20} color="#666" style={styles.icon} />
        <Text>Search items...</Text>
      </Link>
      <Link href="/CartScreen">
        {cart.length > 0 && (
          <Text style={styles.badge}>
            {cart.length > 99 ? "99+" : cart.length}
          </Text>
        )}
        <Ionicons
          name="cart-outline"
          size={20}
          color="#666"
          style={styles.icon}
        />
      </Link>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginVertical: 8,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
  },
  badge: {
    position: "absolute",
    top: -12,
    right: -6,
    backgroundColor: "red",
    color: "white",
    borderRadius: 10,
    width: 18,
    height: 18,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default EmptySearchBar;
