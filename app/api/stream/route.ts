export const runtime = "nodejs";
export const dynamic = "force-dynamic"; // ensures Next.js treats it as server-only

import { addClient } from "@/lib/events";

export async function GET() {
  // Create a readable stream for SSE
  const stream = new ReadableStream({
    start(controller) {
      const enc = new TextEncoder();

      // Add this client to your event manager
      const removeClient = addClient(controller);

      // Immediately send a hello message
      controller.enqueue(enc.encode(`event: hello\ndata: "connected"\n\n`));

      // Cleanup when the stream closes
      return () => removeClient();
    },
    cancel() {
      // Called if client disconnects
      // Optional: cleanup logic if not handled in addClient
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
