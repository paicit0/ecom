import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import HomeScreen from '../app/HomeScreen';

jest.mock('expo-router', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

global.fetch = jest.fn();

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading indicator while fetching data', () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ results: [] }),
    });

    const { getByTestId } = render(<HomeScreen />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('renders FlatList with Pokémon items', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
      }),
    });

    fetch.mockResolvedValueOnce({
      json: async () => ({
        name: 'bulbasaur',
        id: 1,
        sprites: { front_default: 'https://example.com/image.png' },
      }),
    });

    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      expect(getByText('Bulbasaur')).toBeTruthy();
    });
  });

  it('filters Pokémon list based on search query', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'charmander', url: 'https://pokeapi.co/api/v2/pokemon/4/' },
        ],
      }),
    });

    fetch.mockResolvedValueOnce({
      json: async () => ({
        name: 'bulbasaur',
        id: 1,
        sprites: { front_default: 'https://example.com/image.png' },
      }),
    });

    fetch.mockResolvedValueOnce({
      json: async () => ({
        name: 'charmander',
        id: 4,
        sprites: { front_default: 'https://example.com/image.png' },
      }),
    });

    const { getByPlaceholderText, queryByText } = render(<HomeScreen />);
    const searchBar = getByPlaceholderText('Search Pokémon...');
    
    fireEvent.changeText(searchBar, 'bulb');
    
    await waitFor(() => {
      expect(queryByText('Bulbasaur')).toBeTruthy();
      expect(queryByText('Charmander')).toBeFalsy();
    });
  });

  it('navigates to ItemScreen on item press', async () => {
    const mockNavigate = jest.fn();
    jest.mock('expo-router', () => ({
      useNavigation: () => ({
        navigate: mockNavigate,
      }),
    }));

    fetch.mockResolvedValueOnce({
      json: async () => ({
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
        ],
      }),
    });

    fetch.mockResolvedValueOnce({
      json: async () => ({
        name: 'bulbasaur',
        id: 1,
        sprites: { front_default: 'https://example.com/image.png' },
      }),
    });

    const { getByText } = render(<HomeScreen />);
    await waitFor(() => {
      fireEvent.press(getByText('Bulbasaur'));
      expect(mockNavigate).toHaveBeenCalledWith('ItemScreen', { item: expect.any(Object) });
    });
  });
});
