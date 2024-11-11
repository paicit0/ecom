import { useNavigation } from 'expo-router';
import { StyleSheet, View, Text, Pressable, FlatList } from 'react-native';

// mock item data 1 to 100 items.
const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Item${i + 1}`,
  price: (i + 1) * 0.99,
}));

export function HomeScreen() {
  const navigation = useNavigation<any>();

  const eachItem = ({ item }: { item: typeof items[number] }) => (
    <Pressable
      key={item.id}
      style={styles.itemContainer}
      onPress={() => navigation.navigate('ItemScreen', { item })}
    >
      <Text style={styles.textItemName}>{item.name}</Text>
      <Text style={styles.textItemPrice}>${item.price.toFixed(2)}</Text>
    </Pressable>
  );


  return (
    <FlatList
      data={items}
      renderItem={eachItem}
      // keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.container}
      numColumns={2}
    />
  );

}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'red',
  },
  itemContainer: {
    flex: 1,
    marginVertical: 5,
    marginHorizontal: 5,
    padding: 0,
    paddingBottom: 5,
    backgroundColor: 'gray',
  },
  textItemName: {
    paddingTop: 2,
    paddingBottom: 20,
    paddingLeft: 10,
    textAlign: 'left',
  },
  textItemPrice: {
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 10,
    textAlign: 'left',
  },
});

