'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Register() {
  const r = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [err, setErr] = useState<string | null>(null)
  return (
    <div className="card max-w-lg mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create account</h1>
      {err && <div className="text-red-300">{err}</div>}
      <input className="input" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name: e.target.value})}/>
      <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/>
      <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})}/>
      <button className="btn btn-primary w-full" onClick={async()=>{
        setErr(null)
        const res = await fetch('/api/register', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(form)})
        const d = await res.json()
        if (!res.ok) { setErr(d.error || 'Failed'); return }
        r.push('/dashboard')
      }}>Register</button>
    </div>
  )
}
