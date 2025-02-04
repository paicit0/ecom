import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import HomeScreen from '../app/HomeScreen';
import CartScreen from '../app/CartScreen';

const mockProduct = [
  { id: 1, name: 'cocoa' },
  { id: 2, name: 'wrench' },
];

describe('<HomeScreen />', () => {
  it('renders FlatList correctly on HomeScreen', () => {
    const { getByText } = render(<HomeScreen />);
  })
});

describe('<CartScreen />', () => {
  it('renders FlatList correctly on CartScreen', () => {

  })
})

