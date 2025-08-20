import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { verifyJWT, JWTPayload } from "../../../lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ user: null }, { status: 401 });

  try {
    const payload: JWTPayload = await verifyJWT(token);
    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
    });
    return NextResponse.json({ user });
  } catch (err) {
    console.error("❌ Invalid token in /api/me:", err);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
