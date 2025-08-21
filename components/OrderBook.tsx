"use client";

import { useEffect, useState } from "react";

type Order = {
  id: number;
  userId: number;
  type: "buy" | "sell";
  price: number;
  quantity: number;
};

type Trade = {
  buyId: number;
  sellId: number;
  price: number;
  quantity: number;
};

export default function OrderBook() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const es = new EventSource("/api/stream");

    es.addEventListener("order_book", (e: any) => {
      const data = JSON.parse(e.data);
      setOrders(data);
    });

    es.addEventListener("trade", (e: any) => {
      const data = JSON.parse(e.data);
      setTrades((prev) => [data, ...prev]);
    });

    return () => es.close();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Order Book</h2>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Type</th>
            <th>Price</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>{o.type}</td>
              <td>{o.price}</td>
              <td>{o.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="text-xl font-bold mt-4">Recent Trades</h2>
      <ul>
        {trades.map((t, i) => (
          <li key={i}>
            {t.quantity} @ {t.price}
          </li>
        ))}
      </ul>
    </div>
  );
}
