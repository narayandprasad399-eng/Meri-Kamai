import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, ExternalLink, Loader2, ChevronDown } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORY_LABELS = {
  shopping: { label: '🛒 Shopping & Cashback', color: 'text-amber-400' },
  financial: { label: '💰 Financial Products', color: 'text-emerald-400' },
  payments: { label: '💳 UPI & Payments', color: 'text-violet-400' },
  earning_apps: { label: '🎮 Install & Earn', color: 'text-red-400' },
};

export default function AppLinksManager() {
  const { user } = useAuth();
  const [masterApps, setMasterApps] = useState([]);
  const [userApps, setUserApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // app_id being saved
  const [urlInputs, setUrlInputs] = useState({}); // {app_id: url}
  const [openCategory, setOpenCategory] = useState('shopping');

  useEffect(() => {
    const loadApps = async () => {
      const [{ data: master }, { data: mine }] = await Promise.all([
        supabase.from('apps').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('user_apps').select('*').eq('user_id', user.id),
      ]);
      setMasterApps(master || []);
      setUserApps(mine || []);
      // pre-fill url inputs
      const inputs = {};
      (mine || []).forEach(ua => { inputs[ua.app_id] = ua.referral_url; });
      setUrlInputs(inputs);
      setLoading(false);
    };
    if (user) loadApps();
  }, [user]);

  const isAdded = (appId) => userApps.some(ua => ua.app_id === appId && ua.is_active);

  const handleSave = async (app) => {
    const url = urlInputs[app.id]?.trim();
    if (!url) return alert('Pehle apna referral link paste karo!');
    if (!url.startsWith('http')) return alert('Valid URL daalo (http/https se start hona chahiye)');

    setSaving(app.id);
    try {
      const existing = userApps.find(ua => ua.app_id === app.id);
      if (existing) {
        await supabase.from('user_apps')
          .update({ referral_url: url, is_active: true })
          .eq('id', existing.id);
        setUserApps(prev => prev.map(ua => ua.app_id === app.id ? { ...ua, referral_url: url, is_active: true } : ua));
      } else {
        const { data } = await supabase.from('user_apps')
          .insert({ user_id: user.id, app_id: app.id, referral_url: url })
          .select().single();
        setUserApps(prev => [...prev, data]);
      }
    } catch (err) {
      alert('Error saving. Try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleRemove = async (appId) => {
    const existing = userApps.find(ua => ua.app_id === appId);
    if (!existing) return;
    await supabase.from('user_apps').update({ is_active: false }).eq('id', existing.id);
    setUserApps(prev => prev.map(ua => ua.app_id === appId ? { ...ua, is_active: false } : ua));
    setUrlInputs(prev => { const n = { ...prev }; delete n[appId]; return n; });
  };

  if (loading) return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className="w-5 h-5 text-[#00ff88] animate-spin" />
    </div>
  );

  const grouped = {};
  masterApps.forEach(app => {
    if (!grouped[app.category]) grouped[app.category] = [];
    grouped[app.category].push(app);
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Apps add karo → apna referral link daalo → customers ko dikhao</p>
        <span className="text-[10px] text-[#00ff88] bg-[#00ff88]/10 border border-[#00ff88]/20 px-2 py-0.5 rounded-full font-bold">
          {userApps.filter(ua => ua.is_active).length} Active
        </span>
      </div>

      {Object.entries(grouped).map(([cat, apps]) => {
        const meta = CATEGORY_LABELS[cat];
        const isOpen = openCategory === cat;
        return (
          <div key={cat} className="border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenCategory(isOpen ? null : cat)}
              className="w-full flex items-center justify-between px-4 py-3 bg-[#0a0f0a] hover:bg-[#0d1410] transition-colors"
            >
              <span className={`text-sm font-black ${meta.color}`}>{meta.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                  {apps.filter(a => isAdded(a.id)).length}/{apps.length} added
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isOpen && (
              <div className="divide-y divide-gray-800/50">
                {apps.map(app => {
                  const added = isAdded(app.id);
                  return (
                    <div key={app.id} className={`px-4 py-3 ${added ? 'bg-[#00ff88]/3' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{app.logo_emoji}</span>
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{app.name}</p>
                          <p className="text-gray-600 text-[10px]">{app.tagline}</p>
                        </div>
                        {added && (
                          <span className="flex items-center gap-1 text-[9px] text-[#00ff88] font-bold">
                            <CheckCircle className="w-3 h-3" /> Live
                          </span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder={`Paste your ${app.name} referral link...`}
                          value={urlInputs[app.id] || ''}
                          onChange={e => setUrlInputs(prev => ({ ...prev, [app.id]: e.target.value }))}
                          className="flex-1 bg-[#060809] border border-gray-800 rounded-lg px-3 py-2 text-[11px] text-white placeholder-gray-700 focus:border-[#00ff88]/40 focus:outline-none transition-colors"
                        />
                        <button
                          onClick={() => handleSave(app)}
                          disabled={saving === app.id}
                          className="bg-[#00ff88]/15 border border-[#00ff88]/30 text-[#00ff88] text-[11px] font-black px-3 py-2 rounded-lg hover:bg-[#00ff88]/25 transition-all disabled:opacity-50 flex items-center gap-1"
                        >
                          {saving === app.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          {added ? 'Update' : 'Add'}
                        </button>
                        {added && (
                          <button
                            onClick={() => handleRemove(app.id)}
                            className="text-gray-700 hover:text-red-400 transition-colors p-2"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {app.earn_min && (
                        <p className="text-[9px] text-gray-700 mt-1.5">
                          💡 Earn ₹{app.earn_min}–₹{app.earn_max || '?'} {app.earn_note}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}