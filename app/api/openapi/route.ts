export const runtime = "nodejs";

import { NextResponse } from 'next/server'

// Basic OpenAPI spec for our APIs
export async function GET() {
  const spec = {
    openapi: '3.0.0',
    info: {
      title: 'QuantumTrades API',
      version: '1.0.0',
      description: 'OpenAPI docs for QuantumTrades trading platform.'
    },
    paths: {
      '/api/register': {
        post: { summary: 'Register user', requestBody: {}, responses: { '200': { description: 'User registered' } } }
      },
      '/api/login': {
        post: { summary: 'Login user', requestBody: {}, responses: { '200': { description: 'Logged in' } } }
      },
      '/api/logout': { post: { summary: 'Logout user', responses: { '200': { description: 'Logged out' } } } },
      '/api/me': { get: { summary: 'Current user', responses: { '200': { description: 'User info' } } } },
      '/api/orders': {
        get: { summary: 'List orders', responses: { '200': { description: 'Orders list' } } },
        post: { summary: 'Place order', responses: { '200': { description: 'Order placed' } } },
        delete: { summary: 'Cancel order', responses: { '200': { description: 'Order cancelled' } } }
      },
      '/api/trades': { get: { summary: 'Trade history', responses: { '200': { description: 'Trade list' } } } },
      '/api/stream': { get: { summary: 'SSE stream for live updates' } }
    }
  }
  return NextResponse.json(spec)
}
