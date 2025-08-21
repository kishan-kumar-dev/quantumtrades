import { EventEmitter } from "events";

// Extend global to allow __pubsub
declare global {
  // eslint-disable-next-line no-var
  var __pubsub: PubSub | undefined;
}

class PubSub extends EventEmitter {}

export const pubsub = (global as any).__pubsub || new PubSub();

// Save to global for singleton
if (!(global as any).__pubsub) {
  (global as any).__pubsub = pubsub;
}
