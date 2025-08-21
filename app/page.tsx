 // Disable static generation

import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto p-6 card space-y-6 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight">
        🚀 Welcome to <span className="text-indigo-400">QuantumTrades</span>
      </h1>

      <p className="opacity-80 text-lg leading-relaxed">
        A simple, fully documented trading demo showcasing:
        <br />
        authentication, an order book, trade execution, real-time streaming via{" "}
        <span className="font-mono">SSE</span>, and a responsive UI.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link className="btn btn-primary px-6 py-2" href="/dashboard">
          Open Dashboard
        </Link>
        <Link className="btn px-6 py-2" href="/register">
          Create Account
        </Link>
      </div>

      <p className="text-sm opacity-70">
        💡 Tip: Register, then place <strong>BUY</strong>/<strong>SELL</strong>{" "}
        orders to see the order book and trade feed update live.
      </p>
    </div>
  );
}
