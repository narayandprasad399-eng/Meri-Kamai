// postback.js — Wannads Secure Postback Handler
export async function handleWannadsPostback(request, env) {
  // 🔴 1. IP WHITELISTING (Sirf Wannads ke server ko allow karo)
  const clientIp = request.headers.get('CF-Connecting-IP');
  if (clientIp !== '3.22.177.178') {
    return new Response('Unauthorized IP', { status: 403 });
  }

  const url = new URL(request.url);
  const params = url.searchParams;

  // Wannads Macros
  const userId = params.get('user_id');
  const rewardStr = params.get('reward');
  const transactionId = params.get('transaction_id');
  const status = params.get('status');
  const signature = params.get('signature');

  if (!userId || !rewardStr || !transactionId || !signature) {
    return new Response('Missing parameters', { status: 400 });
  }

  // 🔴 2. SIGNATURE VALIDATION (MD5 Hash Check)
  // Apni Wannads app ka 'Secret Key' Cloudflare Dashboard > Settings > Variables me 'WANNADS_SECRET' ke naam se save karna
  const secret = env.WANNADS_SECRET || 'TERA_SECRET_KEY_YAHAN_DAAL_DE'; 
  
  const message = `${userId}${transactionId}${rewardStr}${secret}`;
  // Cloudflare worker MD5 support karta hai
  const hashBuffer = await crypto.subtle.digest('MD5', new TextEncoder().encode(message));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const expectedSignature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  if (expectedSignature !== signature) {
    return new Response("ERROR: Signature doesn't match", { status: 403 });
  }

  const reward = parseFloat(rewardStr);
  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;
  const headers = { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}`, 'Content-Type': 'application/json' };

  try {
    // 🔴 3. DEDUPLICATION (Ek transaction ke 2 baar paise na milen)
    const txDesc = `Wannads_${transactionId}`;
    const checkTx = await fetch(`${supabaseUrl}/rest/v1/wallet_transactions?description=eq.${txDesc}`, { headers });
    const existingTx = await checkTx.json();
    
    if (existingTx && existingTx.length > 0) {
      return new Response('OK', { status: 200 }); // Pehle hi paise de chuke hain
    }

    // 🔴 4. REWARD CALCULATION (Agar reject hua to minus karo)
    let finalReward = reward;
    if (status === 'rejected' || status === '2') {
      finalReward = -Math.abs(reward); // Deduct coins
    }

    // 5. Bachche ko paise do
    await fetch(`${supabaseUrl}/rest/v1/rpc/add_coins`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        p_user_id: userId,
        p_amount: finalReward,
        p_type: finalReward > 0 ? 'task_completion' : 'task_rejection',
        p_desc: txDesc // Ye transaction table me save hoga
      })
    });

    // 6. Creator ko 25% Commission do (Sirf successful task par)
    if (finalReward > 0) {
      const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?user_id=eq.${userId}&select=referred_by`, { headers });
      const profileData = await profileRes.json();
      const referredBySlug = profileData[0]?.referred_by;

      if (referredBySlug) {
        const portalRes = await fetch(`${supabaseUrl}/rest/v1/portals?slug=eq.${referredBySlug}&select=user_id`, { headers });
        const portalData = await portalRes.json();
        const creatorId = portalData[0]?.user_id;

        if (creatorId) {
          const commission = Math.round(finalReward * 0.25);
          await fetch(`${supabaseUrl}/rest/v1/rpc/add_coins`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              p_user_id: creatorId,
              p_amount: commission,
              p_type: 'referral_commission',
              p_desc: `Commission_${txDesc}`
            })
          });
        }
      }
    }

    // Wannads ko response bhejo ki kaam ho gaya
    return new Response('OK', { status: 200 });

  } catch (err) {
    console.error('Postback error:', err);
    return new Response('Server Error', { status: 500 });
  }
}