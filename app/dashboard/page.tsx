"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: number;
  side: "buy" | "sell";
  type: "limit" | "market";
  price?: number | null;
  quantity: number;
  status: string;
  createdAt: string;
};

type Trade = {
  id: number;
  price: number;
  quantity: number;
  createdAt: string;
};

export default function Dashboard() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [form, setForm] = useState({
    side: "buy",
    type: "limit",
    price: 100,
    quantity: 1,
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch all orders & trades
  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders);
      setMyOrders(data.myOrders);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTrades = async () => {
    try {
      const res = await fetch("/api/trades");
      const data = await res.json();
      setTrades(data.trades);
    } catch (err) {
      console.error(err);
    }
  };

  // SSE for live updates
  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.addEventListener("book", fetchOrders);
    es.addEventListener("trades", fetchTrades);
    es.addEventListener("userOrders", fetchOrders);
    return () => es.close();
  }, []);

  // Place order
  const submitOrder = async () => {
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      setForm({ ...form, quantity: 1 });
      fetchOrders();
      fetchTrades();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Cancel order
  const cancelOrderHandler = async (id: number) => {
    try {
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      fetchOrders();
    } catch (err) {
      console.error(err);
    }
  };

  const bids = useMemo(
    () =>
      orders
        .filter((o) => o.side === "buy")
        .sort((a, b) => (b.price ?? 0) - (a.price ?? 0)),
    [orders]
  );
  const asks = useMemo(
    () =>
      orders
        .filter((o) => o.side === "sell")
        .sort((a, b) => (a.price ?? 0) - (b.price ?? 0)),
    [orders]
  );

  return (
    <div className="grid md:grid-cols-2 gap-4 p-4">
      {/* Place Order Form */}
      <div className="card p-4 space-y-2">
        <h2 className="text-xl font-bold">Place Order</h2>
        {error && <div className="text-red-500">{error}</div>}

        <select
          className="input"
          value={form.side}
          onChange={(e) =>
            setForm({ ...form, side: e.target.value as "buy" | "sell" })
          }
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>

        <select
          className="input"
          value={form.type}
          onChange={(e) =>
            setForm({ ...form, type: e.target.value as "limit" | "market" })
          }
        >
          <option value="limit">Limit</option>
          <option value="market">Market</option>
        </select>

        {form.type === "limit" && (
          <input
            type="number"
            className="input"
            value={form.price}
            placeholder="Price"
            onChange={(e) =>
              setForm({ ...form, price: Number(e.target.value) })
            }
          />
        )}

        <input
          type="number"
          className="input"
          value={form.quantity}
          placeholder="Quantity"
          onChange={(e) =>
            setForm({ ...form, quantity: Number(e.target.value) })
          }
        />

        <button className="btn btn-primary w-full" onClick={submitOrder}>
          Submit Order
        </button>
      </div>

      {/* Order Book */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-2">Order Book</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <h3>Bids</h3>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {bids.map((o) => (
                  <tr key={o.id}>
                    <td>{o.price}</td>
                    <td>{o.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex-1">
            <h3>Asks</h3>
            <table className="table-auto w-full">
              <thead>
                <tr>
                  <th>Price</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {asks.map((o) => (
                  <tr key={o.id}>
                    <td>{o.price}</td>
                    <td>{o.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Orders */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-2">My Orders</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Side</th>
              <th>Type</th>
              <th>Price</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Cancel</th>
            </tr>
          </thead>
          <tbody>
            {myOrders.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                <td>{o.side}</td>
                <td>{o.type}</td>
                <td>{o.price ?? "-"}</td>
                <td>{o.quantity}</td>
                <td>{o.status}</td>
                <td>
                  {o.status === "open" && (
                    <button
                      className="btn btn-danger"
                      onClick={() => cancelOrderHandler(o.id)}
                    >
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Trades */}
      <div className="card p-4">
        <h2 className="text-xl font-bold mb-2">Live Trades</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th>Time</th>
              <th>Price</th>
              <th>Qty</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => (
              <tr key={t.id}>
                <td>{new Date(t.createdAt).toLocaleTimeString()}</td>
                <td>{t.price}</td>
                <td>{t.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
