// ================================================
// Subscription / Days Management Handler
// 
// Days system:
// - User pay kare → Days add ho
// - Har visit pe check karo
// - Expired → Free plan pe wapas
// ================================================

export async function handleSubscription(request, env) {
  const body = await request.json()
  const { action, userId } = body

  if (!userId) {
    return jsonResponse({ error: 'userId required' }, 400)
  }

  switch (action) {
    case 'check':
      return checkSubscription(userId, env)
    case 'get_plans':
      return getPlans()
    default:
      return jsonResponse({ error: 'Invalid action' }, 400)
  }
}

// Subscription status check karo
async function checkSubscription(userId, env) {
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_KEY

  const res = await fetch(
    `${supabaseUrl}/rest/v1/portals?user_id=eq.${userId}&select=plan,subscription_expires_at`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      }
    }
  )

  const data = await res.json()
  const portal = data[0]

  if (!portal) {
    return jsonResponse({ plan: 'free', active: false, daysLeft: 0 })
  }

  const now = new Date()
  const expires = portal.subscription_expires_at ? new Date(portal.subscription_expires_at) : null

  let active = false
  let daysLeft = 0

  if (expires && expires > now) {
    active = true
    daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24))
  } else if (portal.plan === 'pro' && expires && expires <= now) {
    // Expired — free pe wapas
    await fetch(`${supabaseUrl}/rest/v1/portals?user_id=eq.${userId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: 'free' }),
    })
  }

  return jsonResponse({
    plan: active ? 'pro' : 'free',
    active,
    daysLeft,
    expiresAt: expires?.toISOString() || null,
  })
}

// Available plans
function getPlans() {
  return jsonResponse({
    plans: [
      {
        id: 'website_subscription_30',
        name: '30 Days',
        price: 299,
        days: 30,
        perDay: 9.97,
        popular: false,
      },
      {
        id: 'website_subscription_90',
        name: '90 Days',
        price: 799,
        days: 90,
        perDay: 8.88,
        popular: true,
        savings: 98,
      },
    ]
  })
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
}
