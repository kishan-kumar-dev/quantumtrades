// lib/api.ts
export async function fetchOrders() {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export async function placeOrder(data: {
  side: "buy" | "sell";
  type: "limit" | "market";
  price?: number;
  quantity: number;
}) {
  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to place order");
  }
  return res.json();
}

export async function cancelOrder(id: number) {
  const res = await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to cancel order");
  }
  return res.json();
}
