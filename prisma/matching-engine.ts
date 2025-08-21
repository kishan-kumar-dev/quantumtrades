import { broadcast } from "../lib/events";

export type Order = {
  id: number;
  userId: number;
  type: "buy" | "sell";
  price: number;
  quantity: number;
};

let orders: Order[] = [];
let _id = 1;

export function placeOrder(
  userId: number,
  type: "buy" | "sell",
  price: number,
  quantity: number
) {
  const order: Order = { id: _id++, userId, type, price, quantity };
  orders.push(order);
  matchOrders();
  broadcast("order_book", orders);
  return order;
}

export function cancelOrder(orderId: number) {
  orders = orders.filter((o) => o.id !== orderId);
  broadcast("order_book", orders);
}

function matchOrders() {
  const buys = orders
    .filter((o) => o.type === "buy")
    .sort((a, b) => b.price - a.price);
  const sells = orders
    .filter((o) => o.type === "sell")
    .sort((a, b) => a.price - b.price);

  for (const buy of buys) {
    for (const sell of sells) {
      if (buy.price >= sell.price) {
        const tradedQuantity = Math.min(buy.quantity, sell.quantity);

        buy.quantity -= tradedQuantity;
        sell.quantity -= tradedQuantity;

        broadcast("trade", {
          buyId: buy.id,
          sellId: sell.id,
          price: sell.price,
          quantity: tradedQuantity,
        });

        if (buy.quantity === 0) break;
      }
    }
  }

  orders = orders.filter((o) => o.quantity > 0);
}
