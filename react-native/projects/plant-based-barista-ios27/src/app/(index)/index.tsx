import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import { Link, Stack } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { coffees } from '@/data/coffees';
import { useOrderStore } from '@/hooks/use-order-store';
import { useTheme } from '@/hooks/use-theme';

const MyList = () => {

  const orderCoffee = useOrderStore(state => state.orderCoffee);
  const theme = useTheme();

  return (
    <FlashList
      data={coffees}
      renderItem={({ item }) => (
      <Link href={`/(index)/${item.id}`}>
        <ThemedView style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
          <Image source={item.image} style={{ width: 50, height: 50 }} />
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type='smallBold'>{item.name}</ThemedText>
            <ThemedText themeColor='textSecondary'>{item.price.toLocaleString("be-NL", { style: "currency", currency: "EUR" })}</ThemedText>
          </ThemedView>
          <Pressable
            onPress={() => orderCoffee(item)}
            style={({pressed}) => [
              {
                opacity: pressed ? 0.5 : 1.0,
                padding: 8,
              },
            ]}>
            <SymbolView
              name={{ ios: 'plus.circle.fill', android: 'add_circle', web: 'add_circle' }}
              tintColor={theme.text}
              size={24}
            />
          </Pressable>
        </ThemedView>
      </Link>)}
    />
  );
};

export default function HomeScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{ title: "Coffees" }}
      />
      <MyList />
    </ThemedView>
  );
}
