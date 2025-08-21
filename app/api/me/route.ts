export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyJWT } from "../../../lib/auth"; 

type JwtPayload = {
  sub: string;
  email: string;
  role: "trader" | "admin";
};

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const payload = (await verifyJWT(token)) as JwtPayload; 
    if (!payload) return NextResponse.json({ user: null }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) return NextResponse.json({ user: null }, { status: 404 });

    return NextResponse.json({ user });
  } catch (err) {
    console.error("❌ Invalid token in /api/me:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
