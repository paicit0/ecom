import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import HomeScreen from '../app/HomeScreen';
import CartScreen from '../app/CartScreen';

const mockPokemons = [
  { id: 1, name: 'bulbasaur' },
  { id: 2, name: 'ivysaur' },
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