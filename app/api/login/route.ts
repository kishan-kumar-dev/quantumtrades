import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { comparePassword, createJWT } from "../../../lib/auth";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: "Invalid input" },
        { status: 400 }
      );

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (!user)
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const ok = await comparePassword(parsed.data.password, user.password);
    if (!ok)
      return NextResponse.json(
        { ok: false, error: "Invalid credentials" },
        { status: 401 }
      );

    const token = await createJWT({
      sub: String(user.id),
      email: user.email,
      role: user.role as "trader" | "admin",
    });

    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err) {
    console.error("❌ Login API error", err);
    return NextResponse.json(
      { ok: false, error: "Server error" },
      { status: 500 }
    );
  }
}
