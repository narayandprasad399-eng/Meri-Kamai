// ================================================
// Razorpay Payment Handler
// 
// Flow:
// 1. Frontend → Worker: order create karo
// 2. Worker → Razorpay: order banao
// 3. Frontend: Razorpay checkout open karo
// 4. User: payment kare
// 5. Frontend → Worker: payment verify karo
// 6. Worker: signature check karo
// 7. Worker → Supabase: access grant karo
// ================================================

const RAZORPAY_API = 'https://api.razorpay.com/v1'

// Products list
const PRODUCTS = {
  english_course: {
    amount: 19900,        // ₹199 in paise
    currency: 'INR',
    name: 'English Speaking Course',
    description: 'Karmi Minds — 30 Din mein Fluent English',
  },
  website_subscription_30: {
    amount: 29900,        // ₹299 in paise
    currency: 'INR',
    name: 'Website Subscription — 30 Days',
    description: 'MeriKamai Pro Portal — 30 Days',
  },
  website_subscription_90: {
    amount: 79900,        // ₹799 for 3 months (discount)
    currency: 'INR',
    name: 'Website Subscription — 90 Days',
    description: 'MeriKamai Pro Portal — 90 Days (Save ₹98!)',
  },
}

// ---- ORDER CREATE ----
export async function handlePaymentCreate(request, env) {
  const body = await request.json()
  const { productId, userId, userEmail } = body

  if (!productId || !userId) {
    return jsonResponse({ error: 'productId aur userId required hai' }, 400)
  }

  const product = PRODUCTS[productId]
  if (!product) {
    return jsonResponse({ error: 'Invalid product' }, 400)
  }

  // Razorpay order create
  const auth = btoa(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`)

  const orderRes = await fetch(`${RAZORPAY_API}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: product.amount,
      currency: product.currency,
      receipt: `mk_${userId}_${Date.now()}`,
      notes: {
        userId,
        userEmail: userEmail || '',
        productId,
      },
    }),
  })

  const order = await orderRes.json()

  if (!orderRes.ok) {
    console.error('Razorpay order error:', order)
    return jsonResponse({ error: 'Order create failed', details: order.error?.description }, 500)
  }

  return jsonResponse({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID,  // Frontend ko chahiye
    product: {
      name: product.name,
      description: product.description,
    },
  })
}

// ---- PAYMENT VERIFY ----
export async function handlePaymentVerify(request, env) {
  const body = await request.json()
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    productId,
  } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return jsonResponse({ error: 'Payment details missing' }, 400)
  }

  // Signature verify karo (HMAC SHA256)
  const message = `${razorpay_order_id}|${razorpay_payment_id}`
  const isValid = await verifySignature(message, razorpay_signature, env.RAZORPAY_KEY_SECRET)

  if (!isValid) {
    return jsonResponse({ error: 'Invalid payment signature — possible fraud!' }, 400)
  }

  // Payment valid hai — Supabase mein update karo
  const updated = await updateUserAccess(userId, productId, razorpay_payment_id, env)

  if (!updated.success) {
    return jsonResponse({ error: 'Access update failed', details: updated.error }, 500)
  }

  return jsonResponse({
    success: true,
    message: 'Payment verified! Access granted.',
    data: updated.data,
  })
}

// ---- HMAC Signature Verify ----
async function verifySignature(message, signature, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const signatureBytes = hexToBytes(signature)
  const messageBytes = encoder.encode(message)

  return crypto.subtle.verify('HMAC', key, signatureBytes, messageBytes)
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

// ---- Supabase Access Update ----
async function updateUserAccess(userId, productId, paymentId, env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_KEY

  let updateData = {}
  let table = ''

  if (productId === 'english_course') {
    // English course access
    table = 'user_access'
    updateData = {
      user_id: userId,
      english_course: true,
      english_payment_id: paymentId,
      english_purchased_at: new Date().toISOString(),
    }
  } else if (productId.startsWith('website_subscription')) {
    // Website subscription — days add karo
    const days = productId.includes('90') ? 90 : 30
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + days)

    table = 'portals'
    updateData = {
      plan: 'pro',
      subscription_expires_at: expiresAt.toISOString(),
      last_payment_id: paymentId,
    }
  }

  // Upsert karo
  const res = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ ...updateData, user_id: userId }),
  })

  if (!res.ok) {
    const err = await res.text()
    return { success: false, error: err }
  }

  // Payment log karo
  await fetch(`${supabaseUrl}/rest/v1/payments`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      product_id: productId,
      payment_id: paymentId,
      amount: productId === 'english_course' ? 199 : productId.includes('90') ? 799 : 299,
      status: 'success',
      created_at: new Date().toISOString(),
    }),
  })

  return { success: true, data: { productId, days: productId.includes('90') ? 90 : 30 } }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
