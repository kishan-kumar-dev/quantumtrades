import WebSocket, { WebSocketServer } from 'ws';

type Client = { id: number; ws: WebSocket }
let clients: Client[] = []
let _id = 1

// Create WebSocket server (singleton)
export const wss = new WebSocketServer({ noServer: true })

export function initWebSocketServer(server: any) {
  server.on('upgrade', (request: any, socket: any, head: any) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request)
    })
  })

  wss.on('connection', (ws) => {
    const id = _id++
    clients.push({ id, ws })
    console.log(`Client connected: ${id}`)

    ws.send(JSON.stringify({ event: 'hello', data: 'connected' }))

    ws.on('close', () => {
      clients = clients.filter(c => c.id !== id)
      console.log(`Client disconnected: ${id}`)
    })
  })
}

// Broadcast function
export function broadcast(event: string, data: any) {
  const payload = JSON.stringify({ event, data })
  for (const client of clients) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload)
    }
  }
}
