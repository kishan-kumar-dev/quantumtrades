import { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from '../../types/next';
import { initWebSocketServer } from '@/lib/ws-server';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.wss) {
    console.log('Initializing WebSocket server...')
    initWebSocketServer(res.socket.server)
    res.socket.server.wss = true
  }
  res.end()
}
