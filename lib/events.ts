type Client = {
  controller: ReadableStreamDefaultController<Uint8Array>;
};

const clients: Client[] = [];

export function addClient(
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const client = { controller };
  clients.push(client);
  return () => {
    const index = clients.indexOf(client);
    if (index !== -1) clients.splice(index, 1);
  };
}

export function broadcast(event: string, data: any) {
  const enc = new TextEncoder();
  const msg = enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  clients.forEach((c) => c.controller.enqueue(msg));
}
