import React, { memo, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pokemon, RootStackParamList } from './type/types';
import { useCart } from './store';




export const ItemScreen = memo(function ItemScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ItemScreen'>>();
  const { item } = route.params;
  const addItem = useCart((state) => state.addItem);
  const cart = useCart((state) => state.cartItems);

  console.log('ItemScreen: ' + item.name);
  console.log('Current Cart: ' + cart);
  console.log('Current Cart: ' + cart.length);
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Image
            style={styles.image}
            source={{ uri: item.sprites.front_default }}
          />
          <Text style={styles.name}>{item.name.toUpperCase()}</Text>
          <View style={styles.idContainer}>
            <Text style={styles.idText}>#{item.id.toString().padStart(3, '0')}</Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {item.stats?.map((stat, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statLabel}>{stat.stat.name.toUpperCase()}:</Text>
              <View style={styles.statBarContainer}>
                <View 
                  style={[
                    styles.statBar, 
                    { width: `${(stat.base_stat / 255) * 100}%` }
                  ]} 
                />
                <Text style={styles.statValue}>{stat.base_stat}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.typesContainer}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.typesList}>
            {item.types?.map((type, index) => (
              <View key={index} style={[styles.typeTag, { backgroundColor: getTypeColor(type.type.name) }]}>
                <Text style={styles.typeText}>{type.type.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.abilitiesContainer}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          {item.abilities?.map((ability, index) => (
            <Text key={index} style={styles.abilityText}>
              {ability.ability.name.replace('-', ' ')}
              {ability.is_hidden && ' (Hidden)'}
            </Text>
          ))}
        </View>
      </ScrollView>
      
      <View style={[styles.ItemFooter, { backgroundColor: getTypeColor(item.types?.[0].type.name || 'normal') }]}>
        <Pressable style={styles.FooterCart}>
          <Ionicons name="cart-outline"  size={20} color="white" style={{alignSelf: 'center'}} />
          <Text style={{color: 'white'}} onPress={() => addItem(item.name)}>Add to Cart</Text>
        </Pressable>
        <Pressable style={styles.FooterBuy}>
          <Text style={{color: 'white', alignSelf: 'center'}}>Buy Now</Text>
        </Pressable>
      </View>

    </SafeAreaView>
    
  );
});

const getTypeColor = (type: string): string => {
  const colors: { [key: string]: string } = {
    normal: '#A8A878',
    fire: '#F08030',
    water: '#6890F0',
    electric: '#F8D030',
    grass: '#78C850',
    ice: '#98D8D8',
    fighting: '#C03028',
    poison: '#A040A0',
    ground: '#E0C068',
    flying: '#A890F0',
    psychic: '#F85888',
    bug: '#A8B820',
    rock: '#B8A038',
    ghost: '#705898',
    dragon: '#7038F8',
    dark: '#705848',
    steel: '#B8B8D0',
    fairy: '#EE99AC',
  };
  return colors[type] || '#777777';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#333',
  },
  idContainer: {
    marginTop: 8,
  },
  idText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  statsContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    width: 150,
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  statBarContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBar: {
    height: 8,
    backgroundColor: '#6890F0',
    borderRadius: 4,
    
  },
  statValue: {
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  typesContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeTag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
  },
  typeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  abilitiesContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
  },
  abilityText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  ItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: 'black',
  },
  FooterCart: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 8,
  },
  FooterBuy: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 8,
  }
});

export default ItemScreen;