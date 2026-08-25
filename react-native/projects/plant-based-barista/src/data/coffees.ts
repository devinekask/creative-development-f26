export type Coffee = {
  id: number;
  name: string;
  plantbased: boolean;
  description: string;
  price: number;
  image: any;
}

const coffees:Coffee[] = [
  {
    "id":1,
    "name":"Oat Latte",
    "plantbased":true,
    "description":"Latte coffee with oat plant milk.",
    "price":3.5,
    "image": require('./coffees/1-oat-milk-latte.jpg')
  },
  {
    "id":2,
    "name":"Soy Latte",
    "plantbased":true,
    "description":"Latte coffee with soy plant milk.",
    "price":2,
    "image": require('./coffees/2-soy-latte.jpg')
  },
  {
    "id":3,
    "name":"Rice Latte",
    "plantbased":true,
    "description":"Latte coffee with rice plant milk.",
    "price":3.5,
    "image": require('./coffees/3-rice-latte.jpg')
  },
  {
    "id":4,
    "name":"Koko Latte",
    "plantbased":true,
    "description":"Latte coffee with coconut milk.",
    "price":2,
    "image": require('./coffees/4-koko-latte.jpg')
  },
  {
    "id":5,
    "name":"Pumpkin Spice Latte",
    "plantbased":false,
    "description":"Our signature espresso and milk are highlighted by flavor notes of pumpkin, cinnamon, nutmeg and clove to create this incredible beverage that's a fall favorite. Enjoy it topped with whipped cream and real pumpkin pie spices.",
    "price":4.95,
    "image": require('./coffees/5-pumpkin-spice-latte.jpg')
  },
  {
    "id":6,
    "name":"Salted Caramel Mocha",
    "plantbased":false,
    "description":"Mocha sauce and toffee nut syrup are combined with coffee and steamed milk, then topped with sweetened whipped cream, caramel drizzle and a blend of turbinado sugar and sea salt. Enjoy the flavors of fall in every sip.",
    "price":4.95,
    "image": require('./coffees/6-salted-caramel-latte.jpg')
  },
  {
    "id":7,
    "name":"Toasted Graham Latte",
    "plantbased":false,
    "description":"Graham and sweet cream meet steamed milk and our signature espresso, then are finished off with a sprinkling of cinnamon graham crumbles for a less sweet perfect treat.",
    "price":4.95,
    "image": require('./coffees/7-graham-latte.jpg')
  }
]

export { coffees }