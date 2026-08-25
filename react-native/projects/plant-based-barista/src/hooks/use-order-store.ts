import { Coffee } from '@/data/coffees'
import { create } from 'zustand'

type Order = {
  coffee: Coffee,
  amount: number,
}

interface OrderState {
  orders: Order[],
  orderCoffee: (coffee: Coffee) => void,
  resetOrders: () => void,
}

export const useOrderStore = create<OrderState>()((set) => ({
  orders: [],
  orderCoffee: (coffee) => set((state) => {
    const coffeeIndex = state.orders.findIndex((order) => order.coffee.id === coffee.id);
    const coffeeHasAlreadyBeenOrdered = coffeeIndex !== -1;
    if (coffeeHasAlreadyBeenOrdered) {
      return {
        orders: state.orders.map((order, index) => {
          if (index === coffeeIndex) {
            return {
              ...order,
              amount: order.amount + 1,
            }
          }
          return order;
        })
      };
    }
    // else: return orders array with an added order
    return {
      orders: [
        ...state.orders,
        {
          coffee,
          amount: 1,
        }
      ]
    }
  }),
  resetOrders: () => set((state) => ({
    orders: [],
  })),
}))