import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';

type RootStackParamList = {
  Item: { item: { name: string; price: number } };
};

function ItemScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Item'>>();
  const { item } = route.params;

  return (
    <View>
      <Text>ItemScreen: {item.name}</Text>
      <Text>Price: ${item.price.toFixed(2)}</Text>
    </View>
  );
}

export default ItemScreen;

