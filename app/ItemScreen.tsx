import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';

type RootStackParamList = {
  Item: { item: { name: string; url: string } };
};

function ItemScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'Item'>>();
  const { item } = route.params;
  const Stack = createStackNavigator();

  useEffect(() => {
    console.log(item);
  }, [])

  return (
    <View style={itemStyles.itemContainer}>
      <View>
        <Text>Name: {item.name}</Text>
        <Text>Sold: {item.name}</Text>
      </View>
      <View>
        <Text>Price: {item.url}</Text>
      </View>
      <View>
        <Text>Seller Info: </Text>
        {/* <Text>{user.name}</Text> */}
      </View>
      <View>
        <Text>Item Description: </Text>
        {/* <Text>{item.description} </Text> */}
      </View>
    </View>
  );
}

const itemStyles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    backgroundColor: 'red',
  }
});


export default ItemScreen;




