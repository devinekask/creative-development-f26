import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { coffees } from '@/data/coffees';

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const coffee = coffees.find((coffee) => coffee.id === Number(id));

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{ title: coffee?.name }}
      />
      <Image source={coffee?.image} style={{ width: '100%', height: 300 }} />
      <ThemedView style={{ padding: 16 }}>
        <ThemedText>{coffee?.description}</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
