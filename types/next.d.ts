import { WebSocketServer } from "ws";
import { NextApiResponse } from "next";

export type NextApiResponseServerIO = NextApiResponse & {
  socket: any & { server: { wss?: boolean | WebSocketServer } };
};
