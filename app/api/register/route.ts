// Force Node.js runtime
export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createJWT } from "@/lib/auth";
import { z } from "zod";

// Validation schema
const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  // Check if user already exists
  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (exists)
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 400 }
    );

  // Hash the password
  const hashed = await hashPassword(parsed.data.password);

  // Create new user
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name,
      password: hashed,
      role: "trader",
    },
  });

  // Generate JWT token
  const token = await createJWT({
    sub: String(user.id),
    email: user.email,
    role: "trader",
  });

  // Return response with cookie
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, email: user.email, name: user.name },
  });

  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return res;
}
