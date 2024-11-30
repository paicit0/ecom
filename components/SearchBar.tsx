import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { memo } from 'react';
import { useNavigation } from "expo-router";
import { CartScreenNavigationProp } from '@/app/type/types';


interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar = memo(function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Search..." 
}: SearchBarProps) {

  const navigation = useNavigation<CartScreenNavigationProp>();
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
      {value !== '' && (
        <Pressable onPress={() => onChangeText('')}>
          <Ionicons name="close-sharp" size={20} color="#666" style={styles.icon}/>
        </Pressable>
      )}
      <Pressable onPress={() => navigation.navigate('CartScreen')}>
        <Ionicons name="cart-outline" size={20} color="#666" style={styles.icon}/>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
    color: '#333',
  },
});

export default SearchBar;

