"use client";
import { useEffect, useState } from "react";

type Order = {
  id: number;
  side: "buy" | "sell";
  price: number | null;
  quantity: number;
  status: string;
};

export default function OrderBook() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Initial fetch
  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data.orders || []));
  }, []);

  // Live updates via SSE
  useEffect(() => {
    const ev = new EventSource("/api/events");
    ev.addEventListener("book", (msg: MessageEvent) => {
      const data = JSON.parse(msg.data);
      if (data?.orders) {
        setOrders(data.orders);
      }
    });
    return () => ev.close();
  }, []);

  const bids = orders.filter((o) => o.side === "buy");
  const asks = orders.filter((o) => o.side === "sell");

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-lg font-bold mb-2">Order Book</h2>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <h3 className="font-semibold text-green-400">Bids</h3>
          <div className="h-64 overflow-y-auto">
            {bids.map((b) => (
              <div
                key={b.id}
                className="flex justify-between border-b border-gray-700 py-1"
              >
                <span>{b.price?.toFixed(2) ?? "MKT"}</span>
                <span>{b.quantity.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-red-400">Asks</h3>
          <div className="h-64 overflow-y-auto">
            {asks.map((a) => (
              <div
                key={a.id}
                className="flex justify-between border-b border-gray-700 py-1"
              >
                <span>{a.price?.toFixed(2) ?? "MKT"}</span>
                <span>{a.quantity.toFixed(4)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
