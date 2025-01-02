import React from "react";
import { Pressable, StyleSheet, TextInput, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import { Link, useNavigation } from "expo-router";
import { useCart } from "@/app/store";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
}: SearchBarProps) {
  const cart = useCart((state) => state.cartItems);
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#666" style={styles.icon} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#999"
        clearButtonMode="while-editing"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText("")}>
          <Ionicons
            name="close-sharp"
            size={20}
            color="#666"
            style={styles.icon}
          />
        </Pressable>
      )}
      <Link href="/CartScreen">
        {cart.length > 0 && (
          <Text style={styles.badge}>
            {cart.length > 99 ? '99+' : cart.length}
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
    position: 'absolute',
    top: -12,             
    right: -6,          
    backgroundColor: 'red', 
    color: 'white',      
    borderRadius: 10,     
    width: 18,            
    height: 18,         
    textAlign: 'center',  
    fontSize: 12,         
    fontWeight: 'bold',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchBar;
