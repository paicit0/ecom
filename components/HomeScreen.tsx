import { StyleSheet, View, Text, ScrollView, Pressable, Image } from 'react-native';

const items = Array.from({ length: 100 }, (_, i) => ({ 
  id: i + 1, 
  name: `Item${i + 1}`, 
  price: (i + 1) * 0.99 
}));

export function HomeScreen() {
  return (
    <ScrollView style={styles.scrollView}>
      <Pressable>
        <View style={styles.container}>
          {items.map((item) => (
            <View key={item.id} style={styles.itemContainer}>
              <Image
                style={styles.image}
                source="https://picsum.photos/seed/696/3000/2000"
                contentFit="cover"
                transition={1000}
              />
              <Text style={styles.textItemName}>{item.name}</Text>
              <Text style={styles.textItemPrice}>${item.price.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
  },
  itemContainer: {
    width: '45%', 
    marginVertical: 2,
    padding: 0,
    paddingBottom: 5,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 2,
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