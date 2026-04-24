// ================================================
// MERI KAMAI — Cloudflare Worker
// Routes:
//   GET  /youtube?category=comedy&pageToken=xxx  → YouTube shorts fetch
//   POST /payment/create                          → Razorpay order create
//   POST /payment/verify                          → Razorpay payment verify
//   POST /subscription/create                     → Website subscription
//   GET  /health                                  → Health check
// ================================================

import { handleYouTube } from './youtube'
import { handlePaymentCreate, handlePaymentVerify } from './payment'
import { handleSubscription } from './subscription'
import { handleWannadsPostback } from './postback'
import { handleTrackClick } from './analytics'

export default {
  async fetch(request, env, ctx) {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*', // Production mein apna domain lagao
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const path = url.pathname

    try {
      let response

      // Route karo
      if (path === '/youtube' && request.method === 'GET') {
        response = await handleYouTube(request, env)
      }
      else if (path === '/payment/create' && request.method === 'POST') {
        response = await handlePaymentCreate(request, env)
      }
      else if (path === '/payment/verify' && request.method === 'POST') {
        response = await handlePaymentVerify(request, env)
      }
      else if (path === '/subscription/create' && request.method === 'POST') {
        response = await handleSubscription(request, env)
      }
      else if (path === '/postback/wannads') {
  response = await handleWannadsPostback(request, env)
}
else if (path === '/track/click' && request.method === 'POST') {
  response = await handleTrackClick(request, env)
}
      else if (path === '/health') {
        response = new Response(JSON.stringify({ status: 'ok', time: new Date().toISOString() }), {
          headers: { 'Content-Type': 'application/json' }
        })
      }
      else {
        response = new Response(JSON.stringify({ error: 'Route not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // CORS headers add karo response mein
      const newHeaders = new Headers(response.headers)
      Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v))

      return new Response(response.body, {
        status: response.status,
        headers: newHeaders,
      })

    } catch (err) {
      console.error('Worker error:', err)
      return new Response(JSON.stringify({ error: 'Internal server error', message: err.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}
