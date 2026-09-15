import { Stack } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function ConfirmationScreen() {

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen
        options={{ title: "Order Confirmed" }}
      />
      <ThemedView style={{ padding: 16, flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText type='title'>Order confirmed!</ThemedText>
        <ThemedText type='default'>Thank you for your order!</ThemedText>
      </ThemedView>
    </ThemedView>
  );
}
