"use client";

export const revalidate = 0; // Disable static generation

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const r = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="card max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      {err && <div className="text-red-300">{err}</div>}

      <input
        className="input"
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <input
        className="input"
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <button
        className="btn btn-primary w-full"
        onClick={async () => {
          setErr(null);
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });
          const d = await res.json();
          if (!res.ok) {
            setErr(d.error || "Failed");
            return;
          }
          r.push("/dashboard");
        }}
      >
        Login
      </button>
    </div>
  );
}
