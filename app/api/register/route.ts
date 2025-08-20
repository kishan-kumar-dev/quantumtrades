import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, createJWT } from '@/lib/auth'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(6),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid input' }, { status: 400 })

  const exists = await prisma.user.findUnique({ where: { email: parsed.data.email } })
  if (exists) return NextResponse.json({ error: 'Email already registered' }, { status: 400 })

  const hashed = await hashPassword(parsed.data.password)
  const user = await prisma.user.create({
    data: { email: parsed.data.email, name: parsed.data.name, password: hashed, role: 'trader' }
  })

  const token = await createJWT({ sub: String(user.id), email: user.email, role: 'trader' })
  const res = NextResponse.json({ ok: true, user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set('token', token, { httpOnly: true, sameSite: 'lax', secure: false, path: '/' })
  return res
}
