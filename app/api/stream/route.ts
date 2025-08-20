import { addClient } from '@/lib/events'

export async function GET() {
  const stream = new ReadableStream({
    start(controller) {
      const remove = addClient(controller)
      const enc = new TextEncoder()
      controller.enqueue(enc.encode('event: hello\ndata: "connected"\n\n'))
      return () => remove()
    }
  })
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  })
}
