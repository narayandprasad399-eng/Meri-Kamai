// CourseArea - adapted from original
// Changes: our supabase/auth, ₹199 price, payment modal instead of /checkout link
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayCircle, CheckCircle, Lock, BookOpen, Mic, Gamepad2, Star, ArrowRight, Volume2, RotateCcw, Flame, Zap, Clock, ChevronRight, Sparkles, Gift, X, AlertCircle, CheckCircle2, RefreshCw, ChevronLeft, Award, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';
import { usePayment } from '../../hooks/usePayment';

const TABS = [
  { id: 'learn', label: 'Learn', icon: '▶' },
  { id: 'practice', label: 'Practice', icon: '🎙' },
  { id: 'games', label: 'Games', icon: '🎮' },
];

const PLACEHOLDER_MODULES = [
  { id: 'p1', title: 'Module 1: Hum English Kyun Nahi Bol Pate?', duration: '10 mins', isFree: true, isCompleted: false, isLocked: false, sort_order: 1 },
  { id: 'p2', title: 'Module 2: The Thinking Switch', duration: '15 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 2 },
  { id: 'p3', title: 'Module 3: 50 Power Sentences', duration: '18 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 3 },
  { id: 'p4', title: 'Module 4: Pronunciation Secrets', duration: '20 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 4 },
  { id: 'p5', title: 'Module 5: Office & Client English', duration: '22 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 5 },
  { id: 'p6', title: 'Module 6: Telephonic Conversations', duration: '16 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 6 },
  { id: 'p7', title: 'Module 7: Body Language + English', duration: '14 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 7 },
  { id: 'p8', title: 'Module 8: Interview English', duration: '25 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 8 },
  { id: 'p9', title: 'Module 9: Social English', duration: '17 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 9 },
  { id: 'p10', title: 'Module 10: Final Review + Action Plan', duration: '20 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 10 },
];

const PRONUNCIATION_WORDS = [
  { word: "Comfortable", phonetic: "KUM-fur-tuh-bul", tip: "Middle 'r' ko skip karo" },
  { word: "Entrepreneur", phonetic: "ahn-truh-pruh-NUR", tip: "Last syllable stress" },
  { word: "Especially", phonetic: "ih-SPESH-uh-lee", tip: "Soft 'ih' sound pehle" },
  { word: "Necessary", phonetic: "NES-uh-ser-ee", tip: "1 C, 2 S — yaad rakho" },
];

const PRACTICE_SENTENCES = [
  { en: "I can speak English confidently.", hi: "Main angrezi confidently bol sakta hun." },
  { en: "Please give me a moment to think.", hi: "Mujhe sochne ke liye ek pal do." },
  { en: "Could you please repeat that?", hi: "Kya aap woh phir se bol sakte hain?" },
  { en: "I appreciate your help.", hi: "Main aapki madad ki kadar karta hun." },
];

const WORD_MATCH_DATA = [
  { word: "Accomplish", meaning: "Kuch hasil karna" },
  { word: "Efficient", meaning: "Kam mehnat, zyada kaam" },
  { word: "Perspective", meaning: "Dekhne ka nazar / viewpoint" },
  { word: "Collaborate", meaning: "Milkar kaam karna" },
];

const FILL_BLANKS_DATA = [
  { sentence: "I need to _____ this project by Friday.", answer: "complete", options: ["complete", "finishing", "did", "completes"] },
  { sentence: "She is very _____ at solving problems.", answer: "efficient", options: ["efficiency", "efficient", "efficiented", "efficients"] },
  { sentence: "We should _____ on this project together.", answer: "collaborate", options: ["collaborating", "collaborated", "collaborate", "collaboration"] },
];

function PaymentModal({ show, onClose, user }) {
  const { initiatePayment, loading } = usePayment();
  if (!show) return null;
  const handlePay = () => {
    if (!user) { alert('Pehle sign in karo!'); onClose(); return; }
    initiatePayment({
      productId: 'english_course', userId: user.id, userEmail: user.email,
      userName: user.user_metadata?.full_name,
      onSuccess: () => { onClose(); window.location.reload(); },
      onFailure: (msg) => alert('Payment failed: ' + msg),
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.2)]" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
          <div className="text-4xl text-center mb-3">🗣️</div>
          <h3 className="text-xl font-black text-white text-center mb-1">Sirf ₹199 Mein!</h3>
          <p className="text-gray-400 text-sm text-center mb-5">10 modules · Lifetime access · No expiry</p>
          {['10 HD Video Modules', 'Speaking + Practice Tools', 'Interactive Word Games', 'Completion Certificate'].map(f => (
            <div key={f} className="flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-[#00ff88]" /><span className="text-gray-300 text-sm">{f}</span></div>
          ))}
          <div className="text-center my-4"><span className="text-4xl font-black text-[#ff6b00]" style={{ fontFamily: 'Teko' }}>₹199</span><span className="text-gray-500 text-sm ml-2">one-time</span></div>
          <button onClick={handlePay} disabled={loading}
            className="flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl text-base mb-3"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            <Gift className="w-4 h-4" />{loading ? 'Processing...' : 'Abhi Unlock Karo! ₹199'}<ArrowRight className="w-4 h-4" />
          </button>
          <div className="flex justify-center gap-4 text-xs text-gray-600">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Razorpay Secure</span>
            <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant Access</span>
          </div>
          <button onClick={onClose} className="w-full text-gray-700 text-xs mt-3 hover:text-gray-500 transition-colors">Nahi, baad mein</button>
        </div>
      </div>
    </div>
  );
}

export default function CourseArea() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('learn');
  const [modules, setModules] = useState(PLACEHOLDER_MODULES);
  const [activeModule, setActiveModule] = useState(PLACEHOLDER_MODULES[0]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pronIdx, setPronIdx] = useState(0);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speakResult, setSpeakResult] = useState(null);
  const [wmSelected, setWmSelected] = useState({ word: null, meaning: null });
  const [wmCorrect, setWmCorrect] = useState([]);
  const [wmWrong, setWmWrong] = useState(null);
  const [wmScore, setWmScore] = useState(0);
  const [fbIdx, setFbIdx] = useState(0);
  const [fbSelected, setFbSelected] = useState(null);
  const [fbScore, setFbScore] = useState(0);
  const [fbDone, setFbDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        if (user) {
          const { data } = await supabase.from('user_access').select('english_course').eq('user_id', user.id).single();
          if (data?.english_course) setHasPurchased(true);
        }
        const { data: mods } = await supabase.from('course_modules').select('*').eq('is_active', true).order('sort_order');
        if (mods?.length > 0) {
          const p = mods.map(m => ({ ...m, isFree: m.is_free, isLocked: !hasPurchased && !m.is_free, isCompleted: false }));
          setModules(p); setActiveModule(p[0]);
        }
      } catch(e) {}
    };
    load();
  }, [user, hasPurchased]);

  useEffect(() => {
    if (hasPurchased) return;
    const t = setTimeout(() => setShowPayment(true), 45000);
    return () => clearTimeout(t);
  }, [hasPurchased]);

  useEffect(() => {
    const fn = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN'; u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Chrome use karo'); return; }
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript.toLowerCase();
      const words = PRACTICE_SENTENCES[speakIdx].en.toLowerCase().split(' ');
      const match = words.filter(w => said.includes(w.replace(/[^a-z]/g, ''))).length / words.length;
      setSpeakResult(match > 0.6 ? 'good' : 'try');
    };
    rec.start();
  };

  const handleWMSelect = (type, value) => {
    if (wmCorrect.includes(value)) return;
    const next = { ...wmSelected, [type]: value };
    setWmSelected(next);
    if (next.word && next.meaning) {
      const pair = WORD_MATCH_DATA.find(d => d.word === next.word && d.meaning === next.meaning);
      if (pair) { setWmCorrect(p => [...p, next.word, next.meaning]); setWmScore(s => s + 10); setWmSelected({ word: null, meaning: null }); }
      else { setWmWrong(next.word); setTimeout(() => { setWmWrong(null); setWmSelected({ word: null, meaning: null }); }, 800); }
    }
  };

  const handleFB = (opt) => {
    setFbSelected(opt);
    if (opt === FILL_BLANKS_DATA[fbIdx].answer) setFbScore(s => s + 10);
    setTimeout(() => {
      if (fbIdx < FILL_BLANKS_DATA.length - 1) { setFbIdx(p => p + 1); setFbSelected(null); }
      else setFbDone(true);
    }, 900);
  };

  const pron = PRONUNCIATION_WORDS[pronIdx];
  const speak = PRACTICE_SENTENCES[speakIdx];

  return (
    <div className="min-h-screen bg-[#060809] text-[#e5e5e5] pb-24" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <PaymentModal show={showPayment} onClose={() => setShowPayment(false)} user={user} />

      {!hasPurchased && showStickyBar && (
        <div className="fixed bottom-16 left-0 right-0 z-40 p-3" style={{ background: 'linear-gradient(to top, #060809 80%, transparent)' }}>
          <button onClick={() => setShowPayment(true)} className="flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl text-base max-w-sm mx-auto" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
            <Gift className="w-4 h-4" /> Unlock Full Course @ ₹199 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="border-b border-white/5 px-4 py-5" style={{ background: 'linear-gradient(to bottom, #0a0f0b, #060809)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white">Spoken English Mastery</h1>
              <p className="text-gray-600 text-xs">10 Modules · Lifetime Access · Certificate</p>
            </div>
          </div>
          {!hasPurchased && (
            <div className="mt-3 flex items-center gap-3 bg-blue-900/15 border border-blue-500/20 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-xs flex-1">Sirf <strong>Module 1 free</strong> hai.</p>
              <button onClick={() => setShowPayment(true)} className="shrink-0 bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg text-xs flex items-center gap-1" style={{ border: 'none', cursor: 'pointer' }}>
                ₹199 <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-5">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-1 bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-1">
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'learn' && (
              <div className="space-y-4">
                {/* Video Player */}
                {activeModule?.isLocked ? (
                  <div className="aspect-video rounded-2xl overflow-hidden relative border border-gray-800 flex flex-col items-center justify-center gap-4 px-6 text-center" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                    <div className="w-16 h-16 rounded-2xl border border-gray-700 bg-gray-900/50 flex items-center justify-center"><Lock className="w-7 h-7 text-gray-600" /></div>
                    <div>
                      <p className="text-white font-black text-lg mb-1">Yeh Module Locked Hai 🔒</p>
                      <p className="text-gray-500 text-sm mb-4">Unlock karo aur 10 modules dekho</p>
                    </div>
                    <button onClick={() => setShowPayment(true)} className="flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <Zap className="w-4 h-4" /> Unlock All 10 Modules @ ₹199
                    </button>
                  </div>
                ) : activeModule?.video_url ? (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-black">
                    <video src={activeModule.video_url} className="w-full h-full object-cover" controls preload="metadata"
                      onEnded={() => { if (user) supabase.from('user_progress').upsert({ user_id: user.id, module_id: activeModule.id, completed: true }).catch(() => {}); setModules(p => p.map(m => m.id === activeModule.id ? { ...m, isCompleted: true } : m)); }} />
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl overflow-hidden border border-gray-800 bg-gradient-to-br from-gray-950 to-blue-950/20 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 rounded-full border-2 border-blue-400/40 bg-blue-900/20 flex items-center justify-center"><PlayCircle className="w-10 h-10 text-blue-400" /></div>
                    <p className="mt-4 text-white font-bold text-sm px-4 text-center">{activeModule?.title}</p>
                    {activeModule?.isFree && <span className="mt-2 text-[10px] text-[#00ff88] font-black bg-[#00ff88]/10 border border-[#00ff88]/25 px-3 py-1 rounded-full">✨ FREE PREVIEW</span>}
                  </div>
                )}

                <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-5">
                  <h2 className="text-base font-black text-white mb-3">{activeModule?.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">{activeModule?.description || 'Is module mein aap seekhenge ki daily life mein English kaise use karein.'}</p>
                  {!hasPurchased && (
                    <button onClick={() => setShowPayment(true)} className="flex items-center gap-2 font-black px-5 py-3 rounded-xl text-sm mt-2" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <Gift className="w-4 h-4" /> Unlock Full Course @ ₹199
                    </button>
                  )}
                </div>

                <div className="lg:hidden">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">All Modules</p>
                  <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl overflow-hidden">
                    {modules.map((mod, i) => {
                      const locked = !hasPurchased && !mod.isFree;
                      const isActive = mod.id === activeModule?.id;
                      return (
                        <button key={mod.id} onClick={() => locked ? setShowPayment(true) : (setActiveModule(mod), window.scrollTo({ top: 0, behavior: 'smooth' }))}
                          className={`w-full text-left flex items-start gap-3 px-4 py-3 border-b border-gray-800/40 last:border-0 ${isActive ? 'bg-blue-900/20 border-l-2 border-l-blue-400' : ''} ${locked ? 'opacity-50' : 'hover:bg-white/5'}`}>
                          <div className="mt-0.5 shrink-0">{mod.isCompleted ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : locked ? <Lock className="w-4 h-4 text-gray-600" /> : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${isActive ? 'border-blue-400 text-blue-400' : 'border-gray-600 text-gray-600'}`}>{i+1}</div>}</div>
                          <div>
                            <p className={`font-semibold text-xs ${isActive ? 'text-blue-300' : locked ? 'text-gray-600' : 'text-gray-300'}`}>{mod.title}</p>
                            <div className="flex gap-2 mt-1">
                              <span className="text-[10px] text-gray-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {mod.duration}</span>
                              {mod.isFree && <span className="text-[9px] text-[#00ff88] font-black">FREE</span>}
                              {locked && <span className="text-[9px] text-blue-400 font-black">UNLOCK</span>}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                    {!hasPurchased && (
                      <div className="p-3 border-t border-gray-800/60" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                        <button onClick={() => setShowPayment(true)} className="flex items-center justify-center gap-2 w-full font-black py-3 rounded-xl text-xs" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                          <Zap className="w-3.5 h-3.5" /> Unlock All 10 — ₹199
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'practice' && (
              <div className="space-y-4">
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {['pronunciation', 'speaking', 'reading'].map(s => (
                    <button key={s} onClick={() => !hasPurchased && s !== 'pronunciation' ? setShowPayment(true) : null}
                      className={`px-4 py-2 rounded-xl font-bold text-xs shrink-0 capitalize transition-all bg-gray-900 ${!hasPurchased && s !== 'pronunciation' ? 'text-gray-700' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                      {s === 'pronunciation' ? '🗣️' : s === 'speaking' ? '🎙️' : '📖'} {s} {!hasPurchased && s !== 'pronunciation' && <Lock className="w-3 h-3 inline" />}
                    </button>
                  ))}
                </div>
                <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-800" style={{ background: 'linear-gradient(135deg, #0d1a20, #0a0f0b)' }}>
                    <p className="text-blue-400 font-black text-sm">Pronunciation Practice</p>
                    <p className="text-gray-600 text-xs">Word suno, phir khud bolo</p>
                  </div>
                  <div className="p-5">
                    <div className="text-center py-6 px-4 rounded-2xl mb-4 border border-blue-500/15" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                      <p className="text-4xl font-black text-white mb-2">{pron.word}</p>
                      <p className="text-blue-400 font-mono text-lg mb-3">/{pron.phonetic}/</p>
                      <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 mb-4"><p className="text-amber-400 text-xs font-semibold">💡 {pron.tip}</p></div>
                      <div className="flex justify-center gap-3">
                        <button onClick={() => speakWord(pron.word)} className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-4 py-2.5 rounded-xl text-sm"><Volume2 className="w-4 h-4" /> Suno</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <button onClick={() => setPronIdx(p => (p - 1 + PRONUNCIATION_WORDS.length) % PRONUNCIATION_WORDS.length)} className="text-gray-500 hover:text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Prev</button>
                      <span className="text-gray-600 text-xs">{pronIdx + 1}/{PRONUNCIATION_WORDS.length}</span>
                      <button onClick={() => setPronIdx(p => (p + 1) % PRONUNCIATION_WORDS.length)} className="text-gray-500 hover:text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 flex items-center gap-1">Next <ChevronRight className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
                {!hasPurchased && (
                  <div className="rounded-2xl p-5 text-center border border-blue-500/20" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                    <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-black mb-1">Speaking + Reading Unlock Karo</p>
                    <p className="text-gray-500 text-xs mb-4">Sirf paid users ke liye</p>
                    <button onClick={() => setShowPayment(true)} className="inline-flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <Zap className="w-4 h-4" /> Get Full Access @ ₹199
                    </button>
                  </div>
                )}
                {hasPurchased && (
                  <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl p-5">
                    <p className="text-amber-400 font-black text-sm mb-4">Speaking Practice</p>
                    <div className="rounded-2xl p-4 mb-4 border border-amber-500/15 text-center" style={{ background: 'linear-gradient(135deg, #1a1000, #0d0a00)' }}>
                      <p className="text-white font-black text-lg mb-1">"{speak.en}"</p>
                      <p className="text-gray-600 text-sm italic">{speak.hi}</p>
                      <button onClick={() => speakWord(speak.en)} className="mt-2 text-amber-400"><Volume2 className="w-5 h-5 mx-auto" /></button>
                    </div>
                    <div className="text-center mb-4">
                      <button onClick={startListening} className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto transition-all ${isListening ? 'border-red-400 bg-red-500/20 animate-pulse' : 'border-amber-400/40 bg-amber-500/10'}`}>
                        <Mic className={`w-7 h-7 ${isListening ? 'text-red-400' : 'text-amber-400'}`} />
                      </button>
                      <p className="text-gray-600 text-xs mt-2">{isListening ? '🎙️ Sun raha hun...' : 'Tap karo aur bolo'}</p>
                    </div>
                    {speakResult && <div className={`rounded-xl p-4 text-center border mb-4 ${speakResult === 'good' ? 'bg-[#00ff88]/8 border-[#00ff88]/25' : 'bg-amber-500/8 border-amber-500/25'}`}><p className={`font-black text-sm ${speakResult === 'good' ? 'text-[#00ff88]' : 'text-amber-400'}`}>{speakResult === 'good' ? '🎉 Bahut badhiya!' : '💪 Thoda aur practice karo!'}</p></div>}
                    <div className="flex gap-2">
                      <button onClick={() => { setSpeakResult(null); setSpeakIdx(p => (p - 1 + PRACTICE_SENTENCES.length) % PRACTICE_SENTENCES.length); }} className="flex-1 bg-gray-800 text-gray-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"><ChevronLeft className="w-3.5 h-3.5" /> Prev</button>
                      <button onClick={() => { setSpeakResult(null); setSpeakIdx(p => (p + 1) % PRACTICE_SENTENCES.length); }} className="flex-1 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1">Next <ChevronRight className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'games' && (
              <div className="space-y-4">
                <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                    <div><p className="text-[#00ff88] font-black text-sm">Word Match</p><p className="text-gray-600 text-xs">Word aur meaning match karo</p></div>
                    <div className="flex items-center gap-3"><span className="text-[#00ff88] font-black text-sm">Score: {wmScore}</span><button onClick={() => { setWmScore(0); setWmCorrect([]); setWmSelected({ word: null, meaning: null }); setWmWrong(null); }}><RotateCcw className="w-4 h-4 text-gray-600" /></button></div>
                  </div>
                  <div className="p-4">
                    {wmCorrect.length === WORD_MATCH_DATA.length * 2 ? (
                      <div className="text-center py-8">
                        <div className="text-5xl mb-3">🏆</div>
                        <p className="text-white font-black text-xl mb-4">Sab Match! Score: {wmScore}</p>
                        <button onClick={() => { setWmScore(0); setWmCorrect([]); setWmSelected({ word: null, meaning: null }); }} className="bg-[#00ff88] text-black font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto"><RefreshCw className="w-4 h-4" /> Phir Khelo</button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-600 font-bold uppercase text-center mb-2">Words</p>
                          {WORD_MATCH_DATA.map(d => (
                            <button key={d.word} onClick={() => handleWMSelect('word', d.word)} disabled={wmCorrect.includes(d.word)}
                              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${wmCorrect.includes(d.word) ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : wmWrong === d.word ? 'bg-red-500/15 border-red-500/30 text-red-400' : wmSelected.word === d.word ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}>
                              {d.word}
                            </button>
                          ))}
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] text-gray-600 font-bold uppercase text-center mb-2">Meanings</p>
                          {WORD_MATCH_DATA.map(d => (
                            <button key={d.meaning} onClick={() => handleWMSelect('meaning', d.meaning)} disabled={wmCorrect.includes(d.meaning)}
                              className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left leading-snug transition-all border ${wmCorrect.includes(d.meaning) ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : wmSelected.meaning === d.meaning ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}>
                              {d.meaning}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {hasPurchased && (
                  <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
                      <p className="text-purple-400 font-black text-sm">Fill in the Blanks</p>
                      <span className="text-purple-400 font-black text-sm">Score: {fbScore}</span>
                    </div>
                    <div className="p-5">
                      {fbDone ? (
                        <div className="text-center py-8">
                          <div className="text-5xl mb-3">{fbScore >= 20 ? '🏆' : '💪'}</div>
                          <p className="text-white font-black text-xl mb-4">Score: {fbScore}/{FILL_BLANKS_DATA.length * 10}</p>
                          <button onClick={() => { setFbIdx(0); setFbSelected(null); setFbScore(0); setFbDone(false); }} className="bg-purple-600 text-white font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto"><RefreshCw className="w-4 h-4" /> Phir Khelo</button>
                        </div>
                      ) : (
                        <>
                          <div className="h-1 bg-gray-800 rounded-full mb-5 overflow-hidden"><div className="h-full bg-purple-600 rounded-full" style={{ width: `${(fbIdx / FILL_BLANKS_DATA.length) * 100}%` }} /></div>
                          <div className="bg-purple-900/10 border border-purple-500/15 rounded-xl p-4 mb-4 text-center"><p className="text-white font-bold text-base">{FILL_BLANKS_DATA[fbIdx].sentence}</p></div>
                          <div className="grid grid-cols-2 gap-2">
                            {FILL_BLANKS_DATA[fbIdx].options.map(opt => {
                              const isCorrect = opt === FILL_BLANKS_DATA[fbIdx].answer;
                              const isSelected = fbSelected === opt;
                              return (
                                <button key={opt} onClick={() => !fbSelected && handleFB(opt)} disabled={!!fbSelected}
                                  className={`px-3 py-3 rounded-xl text-sm font-bold transition-all border ${isSelected && isCorrect ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]' : isSelected && !isCorrect ? 'bg-red-500/15 border-red-500/30 text-red-400' : fbSelected && isCorrect ? 'bg-[#00ff88]/10 border-[#00ff88]/25 text-[#00ff88]' : 'bg-gray-900 border-gray-800 text-gray-300 hover:border-purple-500/30'}`}>
                                  {opt}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
                {!hasPurchased && (
                  <div className="rounded-2xl p-5 text-center border border-blue-500/20" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                    <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-white font-black mb-1">Fill Blanks Unlock Karo</p>
                    <button onClick={() => setShowPayment(true)} className="inline-flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm mt-3" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                      <Zap className="w-4 h-4" /> Unlock @ ₹199
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl overflow-hidden" style={{ maxHeight: '75vh' }}>
              <div className="px-4 py-3 border-b border-gray-800/60" style={{ background: 'linear-gradient(135deg, #0d1a11, #0a0f0b)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-black text-white text-sm">Course Modules</p>
                  <span className="text-[10px] text-[#00ff88] font-bold">{modules.filter(m=>m.isCompleted).length}/{modules.length} done</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc66] rounded-full" style={{ width: `${(modules.filter(m=>m.isCompleted).length/modules.length)*100}%` }} />
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: '50vh' }}>
                {modules.map((mod, i) => {
                  const locked = !hasPurchased && !mod.isFree;
                  const isActive = mod.id === activeModule?.id;
                  return (
                    <button key={mod.id} onClick={() => locked ? setShowPayment(true) : (setActiveModule(mod), setActiveTab('learn'))}
                      className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-all border-b border-gray-800/30 last:border-0 ${isActive ? 'bg-blue-900/20 border-l-2 border-l-blue-400' : ''} ${locked ? 'opacity-50' : 'hover:bg-white/5'}`}>
                      <div className="mt-0.5 shrink-0">{mod.isCompleted ? <CheckCircle className="w-4 h-4 text-[#00ff88]" /> : locked ? <Lock className="w-4 h-4 text-gray-600" /> : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black ${isActive ? 'border-blue-400 text-blue-400' : 'border-gray-600 text-gray-600'}`}>{i+1}</div>}</div>
                      <div>
                        <p className={`font-semibold text-xs ${isActive ? 'text-blue-300' : locked ? 'text-gray-600' : 'text-gray-300'}`}>{mod.title}</p>
                        <div className="flex gap-2 mt-1"><span className="text-[10px] text-gray-600 flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" /> {mod.duration}</span>{mod.isFree && <span className="text-[9px] text-[#00ff88] font-black">FREE</span>}{locked && <span className="text-[9px] text-blue-400 font-black">UNLOCK</span>}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
              {!hasPurchased && (
                <div className="p-3 border-t border-gray-800/60" style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
                  <button onClick={() => setShowPayment(true)} className="flex items-center justify-center gap-2 w-full font-black py-3 rounded-xl text-xs" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}>
                    <Zap className="w-3.5 h-3.5" /> Unlock All 10 — ₹199
                  </button>
                </div>
              )}
            </div>
            <div className="bg-[#0a0f0b] border border-[#00ff88]/12 rounded-2xl p-4">
              <p className="text-[#00ff88] font-black text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Course Mein Kya Milega</p>
              {[['🎬','10 HD Video Modules'],['🎙️','Speaking Practice'],['🎮','Interactive Games'],['📜','Certificate'],['♾️','Lifetime Access']].map(([icon,text],i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400 mb-2">{icon} {text}</div>
              ))}
              {!hasPurchased && <button onClick={() => setShowPayment(true)} className="mt-4 flex items-center justify-center gap-2 w-full font-black py-3 rounded-xl text-xs" style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#fff', border: 'none', cursor: 'pointer' }}><Zap className="w-3.5 h-3.5" /> Get Full Access @ ₹199</button>}
            </div>
            <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-4">
              <p className="text-white font-black text-xs mb-3 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Student Reviews</p>
              {[{text:'"Interview mein confident ho gaya. Game changer!"',name:'Ramesh T., Pune'},{text:'"₹199 mein itna kuch? Best investment tha."',name:'Divya S., Delhi'}].map((r,i) => (
                <div key={i} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-0 border-gray-800/50">
                  <p className="text-gray-400 text-[11px] italic leading-relaxed mb-1">{r.text}</p>
                  <p className="text-gray-700 text-[10px] font-semibold">— {r.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
