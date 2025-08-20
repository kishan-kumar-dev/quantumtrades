type Client = { id: number; controller: ReadableStreamDefaultController }
let clients: Client[] = []
let _id = 1

export function addClient(controller: ReadableStreamDefaultController) {
  const id = _id++
  clients.push({ id, controller })
  return () => {
    clients = clients.filter(c => c.id !== id)
  }
}

export function broadcast(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
  for (const c of clients) {
    try { c.controller.enqueue(new TextEncoder().encode(payload)) } catch {}
  }
}
