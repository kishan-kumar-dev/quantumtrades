"use client";
import { useEffect, useState } from "react";

type Trade = {
  id: number;
  price: number;
  quantity: number;
  createdAt: string;
};

export default function TradesTape() {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Fetch initial trades
  useEffect(() => {
    fetch("/api/trades")
      .then((res) => res.json())
      .then((data) => setTrades(data.trades || []));
  }, []);

  // Subscribe to SSE for live trades
  useEffect(() => {
    const ev = new EventSource("/api/events");
    ev.addEventListener("trades", (msg: MessageEvent) => {
      const data = JSON.parse(msg.data);
      if (data?.trades?.length) {
        setTrades((prev) => {
          const merged = [...data.trades, ...prev];
          return merged.slice(0, 100); // keep only last 100
        });
      }
    });
    return () => ev.close();
  }, []);

  return (
    <div className="p-4 bg-gray-900 text-white rounded-xl shadow-lg">
      <h2 className="text-lg font-bold mb-2">Recent Trades</h2>
      <div className="h-64 overflow-y-auto text-sm">
        {trades.map((tr) => (
          <div
            key={tr.id}
            className="flex justify-between border-b border-gray-700 py-1"
          >
            <span className="w-24 text-left">{tr.price.toFixed(2)}</span>
            <span className="w-24 text-right">{tr.quantity.toFixed(4)}</span>
            <span className="w-40 text-right text-gray-400">
              {new Date(tr.createdAt).toLocaleTimeString()}
            </span>
          </div>
        ))}
        {trades.length === 0 && (
          <div className="text-gray-400">No trades yet</div>
        )}
      </div>
    </div>
  );
}
