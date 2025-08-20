export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await verifyJWT(token);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const trades = await prisma.trade.findMany({
    orderBy: [{ createdAt: "desc" }],
    take: 100,
    include: {
      user: { select: { id: true, email: true, name: true } }, // trader info
    },
  });

  return NextResponse.json({ trades });
}
