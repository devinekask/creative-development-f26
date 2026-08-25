import { FlashList } from '@shopify/flash-list';
import { router, Stack } from 'expo-router';
import { Button } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset } from '@/constants/theme';
import { useOrderStore } from '@/hooks/use-order-store';

const OrderList = () => {

  const orders = useOrderStore(state => state.orders);

  return (
    <FlashList
      data={orders}
      renderItem={({ item }) => <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
        <ThemedText>{item.coffee.name} x {item.amount}</ThemedText>
        <ThemedText>{(item.coffee.price * item.amount).toLocaleString("be-NL", { style: "currency", currency: "EUR" })}</ThemedText>
      </ThemedView>}
    />
  );

};

export default function OrderScreen() {

  const insets = useSafeAreaInsets();
  const orders = useOrderStore(state => state.orders);
  const resetOrders = useOrderStore(state => state.resetOrders);
  const total = orders.reduce((sum, order) => sum + order.coffee.price * order.amount, 0);

  const handleConfirmOrder = () => {
    resetOrders();
    router.push('/order/confirmation');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Order' }} />
      <OrderList />
      <ThemedView style={{ paddingBottom: insets.bottom + BottomTabInset }}>
        <ThemedView style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 10 }}>
          <ThemedText type="smallBold">Total</ThemedText>
          <ThemedText type="smallBold">{total.toLocaleString("be-NL", { style: "currency", currency: "EUR" })}</ThemedText>
        </ThemedView>
        <Button title='Confirm Order' onPress={handleConfirmOrder} />
      </ThemedView>
    </ThemedView>
  );
}
