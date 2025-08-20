"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Nav() {
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user));
  }, []);

  return (
    <nav className="container flex items-center justify-between py-4">
      <Link href="/" className="font-bold text-xl">
        QuantumTrades
      </Link>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <span className="opacity-70 hidden sm:inline">
              Hi, {user.email}
            </span>
            <button
              className="btn btn-danger"
              onClick={async () => {
                await fetch("/api/logout", { method: "POST" });
                location.href = "/login";
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link className="btn btn-primary" href="/login">
              Login
            </Link>
            <Link className="btn" href="/register">
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
