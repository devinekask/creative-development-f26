import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { useOrderStore } from '@/hooks/use-order-store';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  const orders = useOrderStore(state => state.orders);
  const coffeeCount = orders.reduce((acc, order) => acc + order.amount, 0);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <NativeTabs.Trigger name="(index)">
        <NativeTabs.Trigger.Label>Coffees</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cup.and.saucer.fill" md="local_cafe" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="order">
        <NativeTabs.Trigger.Label>Order</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="cart.fill" md="shopping_cart" />
        {coffeeCount > 0 && (
          <NativeTabs.Trigger.Badge>{`${coffeeCount}`}</NativeTabs.Trigger.Badge>
        )}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
