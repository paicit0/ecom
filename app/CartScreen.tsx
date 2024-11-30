import React, { useState, memo} from 'react';
import { View } from 'react-native';
import { RootStackParamList } from './type/types';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Text } from 'react-native';



const CartScreen = memo(() => {
  const route = useRoute<RouteProp<RootStackParamList, 'CartScreen'>>();
  
  return (
    <>
      <Text>CartScreen</Text>
    </>
    
  )
})

export default CartScreen;
