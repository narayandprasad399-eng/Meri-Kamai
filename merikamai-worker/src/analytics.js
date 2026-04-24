// analytics.js — Clicks & Traffic Tracker
export async function handleTrackClick(request, env) {
  const { portalSlug, type } = await request.json(); // type: 'game' or 'course'

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseKey = env.SUPABASE_SERVICE_KEY;

  const column = type === 'game' ? 'game_clicks' : 'course_clicks';

  // Supabase me counter +1 karo
  const res = await fetch(`${supabaseUrl}/rest/v1/portals?slug=eq.${portalSlug}`, {
    method: 'PATCH',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ [column]: 'increment' }) // Note: Requires Supabase RPC or simple PATCH logic
  });

  return new Response(JSON.stringify({ success: res.ok }), { headers: { 'Content-Type': 'application/json' } });
}