// ================================================
// Razorpay Payment Handler (3-Tier SaaS Model)
// ================================================

const RAZORPAY_API = 'https://api.razorpay.com/v1'

// 🟢 NAYE PRODUCTS LIST
const PRODUCTS = {
  english_course: {
    amount: 19900,        // ₹199 in paise
    currency: 'INR',
    name: 'English Speaking Course',
    description: 'Karmi Minds — 30 Din mein Fluent English',
  },
  plan_basic_299: {
    amount: 29900,        // ₹299 in paise
    currency: 'INR',
    name: 'BASIC Plan',
    description: 'MeriKamai Basic Subscription (Monthly)',
  },
  plan_pro_499: {
    amount: 49900,        // ₹499 in paise
    currency: 'INR',
    name: 'PRO Plan',
    description: 'MeriKamai Pro Subscription (Monthly)',
  },
  plan_premium_799: {
    amount: 79900,        // ₹799 in paise
    currency: 'INR',
    name: 'PREMIUM Plan',
    description: 'MeriKamai Premium Subscription (Monthly)',
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
      notes: { userId, userEmail: userEmail || '', productId },
    }),
  })

  const order = await orderRes.json()

  if (!orderRes.ok) {
    return jsonResponse({ error: 'Order create failed', details: order.error?.description }, 500)
  }

  return jsonResponse({
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: env.RAZORPAY_KEY_ID, 
    product: { name: product.name, description: product.description },
  })
}

// ---- PAYMENT VERIFY ----
export async function handlePaymentVerify(request, env) {
  const body = await request.json()
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, productId } = body

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return jsonResponse({ error: 'Payment details missing' }, 400)
  }

  const message = `${razorpay_order_id}|${razorpay_payment_id}`
  const isValid = await verifySignature(message, razorpay_signature, env.RAZORPAY_KEY_SECRET)

  if (!isValid) {
    return jsonResponse({ error: 'Invalid payment signature — possible fraud!' }, 400)
  }

  const updated = await updateUserAccess(userId, productId, razorpay_payment_id, env)

  if (!updated.success) {
    return jsonResponse({ error: 'Access update failed', details: updated.error }, 500)
  }

  return jsonResponse({ success: true, message: 'Payment verified! Access granted.', data: updated.data })
}

// ---- HMAC Signature Verify ----
async function verifySignature(message, signature, secret) {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'])
  const signatureBytes = hexToBytes(signature)
  const messageBytes = encoder.encode(message)
  return crypto.subtle.verify('HMAC', key, signatureBytes, messageBytes)
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return bytes
}

// ---- Supabase Access Update ----
async function updateUserAccess(userId, productId, paymentId, env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_KEY

  let updateData = {}
  let table = ''
  let newPlan = 'free'

  if (productId === 'english_course') {
    table = 'user_access'
    updateData = {
      user_id: userId,
      english_course: true,
      english_payment_id: paymentId,
      english_purchased_at: new Date().toISOString(),
    }
  } else if (productId.startsWith('plan_')) {
    // 🟢 DYNAMIC PLAN SELECTOR
    if (productId === 'plan_basic_299') newPlan = 'basic'
    if (productId === 'plan_pro_499') newPlan = 'pro'
    if (productId === 'plan_premium_799') newPlan = 'premium'

    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30) // Har plan 30 din (1 month) ka hai

    table = 'portals'
    updateData = {
      plan: newPlan,
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
  const amountPaid = PRODUCTS[productId] ? (PRODUCTS[productId].amount / 100) : 0;
  
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
      amount: amountPaid,
      status: 'success',
      created_at: new Date().toISOString(),
    }),
  })

  return { success: true, data: { productId, plan: newPlan, days: 30 } }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}