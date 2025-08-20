"use client";

export const revalidate = 0; // Disable static generation

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: number; email: string; role: "trader" | "admin" };
type Order = {
  id: number;
  side: "buy" | "sell";
  type: "limit" | "market";
  price: number | null;
  quantity: number;
  status: string;
  createdAt: string;
};
type Trade = { id: number; price: number; quantity: number; createdAt: string };

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mine, setMine] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [form, setForm] = useState({
    side: "buy",
    type: "limit",
    price: 100,
    quantity: 1,
  });
  const [err, setErr] = useState<string | null>(null);

  // Fetch current user and setup EventSource
  useEffect(() => {
    let es: EventSource | null = null;

    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user);
        await refreshOrders();
        await refreshTrades();

        es = new EventSource("/api/stream");
        es.addEventListener("book", refreshOrders);
        es.addEventListener("trades", refreshTrades);
      } catch (e) {
        console.error("Failed to fetch user", e);
        router.push("/login");
      }
    };

    fetchUser();
    return () => es?.close();
  }, [router]);

  // Fetch orders
  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const data = await res.json();
      setOrders(data.orders);
      setMine(data.myOrders);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch trades
  const refreshTrades = async () => {
    try {
      const res = await fetch("/api/trades");
      if (!res.ok) throw new Error("Failed to fetch trades");
      const data = await res.json();
      setTrades(data.trades);
    } catch (e) {
      console.error(e);
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

  const submitOrder = async () => {
    setErr(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to place order");
      setForm({ ...form, quantity: 1 });
      await refreshOrders();
      await refreshTrades();
    } catch (e: any) {
      setErr(e.message);
    }
  };

  const cancelOrder = async (id: number) => {
    try {
      await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
      await refreshOrders();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Place Order */}
      <div className="card space-y-3">
        <h2 className="text-xl font-bold">Place Order</h2>
        {err && <div className="text-red-300">{err}</div>}
        <div className="grid grid-cols-2 gap-2">
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
              className="input"
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: Number(e.target.value) })
              }
            />
          )}
          <input
            className="input"
            type="number"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: Number(e.target.value) })
            }
          />
        </div>
        <button className="btn btn-primary w-full" onClick={submitOrder}>
          Submit
        </button>
      </div>

      {/* Live Trades */}
      <div className="card">
        <h2 className="text-xl font-bold mb-2">Live Trades</h2>
        <div className="max-h-72 overflow-auto">
          <table className="table">
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

      {/* Order Book */}
      <div className="card">
        <h2 className="text-xl font-bold mb-2">Order Book</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold mb-1">Bids</h3>
            <table className="table">
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
          <div>
            <h3 className="font-semibold mb-1">Asks</h3>
            <table className="table">
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

      {/* My Orders */}
      <div className="card">
        <h2 className="text-xl font-bold mb-2">My Orders</h2>
        <div className="max-h-64 overflow-auto">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Side</th>
                <th>Type</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {mine.map((o) => (
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
                        onClick={() => cancelOrder(o.id)}
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
      </div>
    </div>
  );
}
