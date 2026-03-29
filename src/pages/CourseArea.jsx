import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayCircle, CheckCircle, Lock, BookOpen, Mic, Type, Headphones,
  Gamepad2, Star, ArrowRight, Volume2, RotateCcw, Trophy,
  Flame, Zap, Clock, ChevronRight, ChevronDown, ShieldCheck,
  Sparkles, Gift, X, AlertCircle, CheckCircle2, RefreshCw,
  MessageSquare, ChevronLeft, Award, Target, Brain
} from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

/* ══════════════════════════════════════════
   CONSTANTS & CONFIG
══════════════════════════════════════════ */

// Tabs
const TABS = [
  { id: 'learn', label: 'Learn', icon: <PlayCircle className="w-4 h-4" /> },
  { id: 'practice', label: 'Practice', icon: <Mic className="w-4 h-4" /> },
  { id: 'games', label: 'Games', icon: <Gamepad2 className="w-4 h-4" /> },
];

// Fallback modules shown before Supabase loads (titles only — no hardcoding of URLs)
const PLACEHOLDER_MODULES = [
  { id: 'p1', title: 'Module 1: Hum English Kyun Nahi Bol Pate?', duration: '10 mins', isFree: true, isCompleted: false, isLocked: false, sort_order: 1 },
  { id: 'p2', title: 'Module 2: The Thinking Switch — Angrezi Sochna Kaise Shuru Karein', duration: '15 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 2 },
  { id: 'p3', title: 'Module 3: 50 Power Sentences — Roz Ki Zindagi Mein', duration: '18 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 3 },
  { id: 'p4', title: 'Module 4: Pronunciation Secrets — Accent mat ro, clarity lao', duration: '20 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 4 },
  { id: 'p5', title: 'Module 5: Office & Client English — Professional Ban Jao', duration: '22 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 5 },
  { id: 'p6', title: 'Module 6: Telephonic Conversations Mastery', duration: '16 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 6 },
  { id: 'p7', title: 'Module 7: Body Language + English = Confidence', duration: '14 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 7 },
  { id: 'p8', title: 'Module 8: Interview English — Job Pakki Karo', duration: '25 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 8 },
  { id: 'p9', title: 'Module 9: Social English — Friends, Parties, Travel', duration: '17 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 9 },
  { id: 'p10', title: 'Module 10: Final Review + Your English Action Plan', duration: '20 mins', isFree: false, isCompleted: false, isLocked: true, sort_order: 10 },
];

// Practice sentences for speaking/reading
const PRACTICE_SENTENCES = [
  { en: "I can speak English confidently.", hi: "Main angrezi confidently bol sakta/sakti hun." },
  { en: "Please give me a moment to think.", hi: "Mujhe sochne ke liye ek pal do." },
  { en: "I would like to schedule a meeting.", hi: "Main ek meeting schedule karna chahta/chahti hun." },
  { en: "Could you please repeat that?", hi: "Kya aap woh phir se bol sakte hain?" },
  { en: "I completely understand your point.", hi: "Main aapki baat poori tarah samajhta/samajhti hun." },
  { en: "Let me explain this clearly.", hi: "Mujhe yeh clearly explain karne do." },
  { en: "That's an excellent suggestion.", hi: "Yeh ek behtareen suggestion hai." },
  { en: "I appreciate your help.", hi: "Main aapki madad ki kadar karta/karti hun." },
];

// Pronunciation challenges
const PRONUNCIATION_WORDS = [
  { word: "Comfortable", phonetic: "KUM-fur-tuh-bul", tip: "Middle 'r' ko skip karo" },
  { word: "Entrepreneur", phonetic: "ahn-truh-pruh-NUR", tip: "French word hai, last syllable stress" },
  { word: "Especially", phonetic: "ih-SPESH-uh-lee", tip: "Pehle E silent nahi, soft 'ih' sound" },
  { word: "Literally", phonetic: "LIT-er-uh-lee", tip: "4 syllables, 't' clearly bolo" },
  { word: "Necessary", phonetic: "NES-uh-ser-ee", tip: "1 C, 2 S — NEC-es-SA-ry" },
  { word: "Particularly", phonetic: "par-TIK-yoo-ler-lee", tip: "6 syllables, don't rush" },
  { word: "Vocabulary", phonetic: "voh-KAB-yoo-ler-ee", tip: "Stress on 2nd syllable" },
  { word: "Thoroughly", phonetic: "THUR-oh-lee", tip: "'ough' = 'oh' sound yahan" },
];

// Word games data
const WORD_MATCH_DATA = [
  { word: "Accomplish", meaning: "Kuch hasil karna / achieve karna" },
  { word: "Efficient", meaning: "Kam mehnat mein zyada kaam karna" },
  { word: "Perspective", meaning: "Kisi cheez ko dekhne ka nazar / viewpoint" },
  { word: "Collaborate", meaning: "Milkar kaam karna / team mein kaam" },
  { word: "Authentic", meaning: "Asli / original, nakli nahi" },
  { word: "Resilient", meaning: "Musibat ke baad wapas uthna" },
];

const FILL_BLANKS_DATA = [
  { sentence: "I need to _____ this project by Friday.", answer: "complete", options: ["complete", "finishing", "did", "completes"] },
  { sentence: "She is very _____ at solving problems.", answer: "efficient", options: ["efficiency", "efficient", "efficiented", "efficients"] },
  { sentence: "We should _____ on this project together.", answer: "collaborate", options: ["collaborating", "collaborated", "collaborate", "collaboration"] },
  { sentence: "His _____ helped him recover quickly.", answer: "resilience", options: ["resilient", "resilience", "resiliently", "resiliences"] },
  { sentence: "Please give me your _____ on this matter.", answer: "perspective", options: ["perspect", "perspective", "perspectively", "perspectives"] },
];

/* ══════════════════════════════════════════
   SMALL REUSABLE COMPONENTS
══════════════════════════════════════════ */

function Badge({ children, color = 'green' }) {
  const styles = {
    green: 'bg-[#00ff88]/15 text-[#00ff88] border-[#00ff88]/25',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    red: 'bg-red-500/15 text-red-400 border-red-500/25',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-full border ${styles[color]}`}>
      {children}
    </span>
  );
}

// Sticky conversion bar — appears on scroll
function StickyConversionBar({ show, referCode }) {
  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden"
      style={{ background: 'linear-gradient(to top, #060809 80%, transparent)' }}>
      <Link to={`/checkout?product=course${referCode ? `&ref=${referCode}` : ''}`}
        className="flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl text-base shadow-[0_0_30px_rgba(59,130,246,0.4)]"
        style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
        <Gift className="w-4 h-4" />
        Unlock Full Course @ ₹499
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

/* ══════════════════════════════════════════
   VIDEO PLAYER
══════════════════════════════════════════ */
function VideoPlayer({ module: mod, onComplete }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const isR2Url = mod?.video_url && mod.video_url.startsWith('http');

  if (mod?.isLocked) {
    return (
      <div className="aspect-video rounded-2xl overflow-hidden relative border border-gray-800"
        style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-2xl border border-gray-700 bg-gray-900/50 flex items-center justify-center">
            <Lock className="w-7 h-7 text-gray-600" />
          </div>
          <div>
            <p className="text-white font-black text-lg mb-1">Yeh Module Locked Hai 🔒</p>
            <p className="text-gray-500 text-sm mb-4">Full course unlock karo aur yeh + 9 aur modules dekho</p>
          </div>
          <Link to="/checkout?product=course"
            className="flex items-center gap-2 font-black px-6 py-3 rounded-xl text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Zap className="w-4 h-4" /> Unlock All 10 Modules @ ₹499
          </Link>
          <p className="text-gray-700 text-[10px]">One-time payment · Lifetime access · No expiry</p>
        </div>
        {/* Blurred preview bg */}
        <div className="absolute inset-0 opacity-10"
          style={{ background: 'radial-gradient(circle at center, #3b82f6, transparent 60%)' }} />
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-2xl overflow-hidden relative border border-gray-800 bg-black group">
      {isR2Url ? (
        <video
          ref={videoRef}
          src={mod.video_url}
          className="w-full h-full object-cover"
          controls
          onEnded={() => onComplete && onComplete(mod.id)}
          preload="metadata"
        />
      ) : (
        /* Placeholder player UI */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-blue-950/20 cursor-pointer"
          onClick={() => setPlaying(p => !p)}>
          <div className="w-20 h-20 rounded-full border-2 border-blue-400/40 bg-blue-900/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-[0_0_40px_rgba(59,130,246,0.2)]">
            <PlayCircle className="w-10 h-10 text-blue-400" />
          </div>
          <p className="absolute bottom-4 left-4 text-white font-bold text-sm">{mod.title}</p>
          {mod.isFree && (
            <div className="absolute top-3 left-3">
              <Badge color="green"><Sparkles className="w-2.5 h-2.5" /> FREE PREVIEW</Badge>
            </div>
          )}
          <p className="absolute top-3 right-3 text-[10px] text-gray-500 bg-black/50 px-2 py-1 rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" /> {mod.duration}
          </p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MODULE SIDEBAR
══════════════════════════════════════════ */
function ModuleList({ modules, activeId, onSelect, hasPurchased }) {
  const completed = modules.filter(m => m.isCompleted).length;
  const progress = modules.length > 0 ? Math.round((completed / modules.length) * 100) : 0;

  return (
    <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl overflow-hidden flex flex-col"
      style={{ maxHeight: '75vh' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800/60"
        style={{ background: 'linear-gradient(135deg, #0d1a11, #0a0f0b)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="font-black text-white text-sm">Course Modules</p>
          <span className="text-[10px] text-[#00ff88] font-bold">{completed}/{modules.length} done</span>
        </div>
        {/* Progress */}
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#00ff88] to-[#00cc66] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1 py-2">
        {modules.map((mod, i) => {
          const isActive = mod.id === activeId;
          const locked = !hasPurchased && !mod.isFree;
          return (
            <button key={mod.id}
              onClick={() => !locked && onSelect(mod)}
              className={`w-full text-left flex items-start gap-3 px-4 py-3 transition-all duration-150
                ${isActive ? 'bg-blue-900/20 border-l-2 border-blue-400' : ''}
                ${locked ? 'opacity-45 cursor-not-allowed' : 'hover:bg-white/3 cursor-pointer'}
              `}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {mod.isCompleted
                  ? <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                  : locked
                    ? <Lock className="w-4 h-4 text-gray-600" />
                    : <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center text-[8px] font-black
                        ${isActive ? 'border-blue-400 text-blue-400' : 'border-gray-600 text-gray-600'}`}>
                        {i + 1}
                      </div>
                }
              </div>
              {/* Text */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold text-xs leading-snug ${isActive ? 'text-blue-300' : locked ? 'text-gray-600' : 'text-gray-300'}`}>
                  {mod.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" /> {mod.duration}
                  </span>
                  {mod.isFree && <Badge color="green">FREE</Badge>}
                  {locked && !mod.isFree && <Badge color="blue">UNLOCK</Badge>}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom CTA if not purchased */}
      {!hasPurchased && (
        <div className="p-3 border-t border-gray-800/60"
          style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
          <Link to="/checkout?product=course"
            className="flex items-center justify-center gap-2 w-full font-black py-3 rounded-xl text-xs shadow-[0_0_15px_rgba(59,130,246,0.25)]"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Zap className="w-3.5 h-3.5" /> Unlock All 10 — ₹499
          </Link>
          <p className="text-gray-700 text-[9px] text-center mt-1.5">One-time · Lifetime access</p>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   PRACTICE TAB
══════════════════════════════════════════ */
function PracticeTab({ hasPurchased }) {
  const [activeSection, setActiveSection] = useState('pronunciation');
  const [pronIdx, setPronIdx] = useState(0);
  const [speakIdx, setSpeakIdx] = useState(0);
  const [speakResult, setSpeakResult] = useState(null); // 'good' | 'try'
  const [isListening, setIsListening] = useState(false);
  const [readingIdx, setReadingIdx] = useState(0);
  const [readScore, setReadScore] = useState(null);

  const pron = PRONUNCIATION_WORDS[pronIdx];
  const speak = PRACTICE_SENTENCES[speakIdx];

  const speakWord = (text) => {
    if ('speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-IN';
      u.rate = 0.85;
      window.speechSynthesis.speak(u);
    }
  };

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Browser speech recognition supported nahi hai. Chrome use karo.');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = 'en-IN';
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (e) => {
      const said = e.results[0][0].transcript.toLowerCase().trim();
      const target = speak.en.toLowerCase();
      const words = target.split(' ');
      const matchCount = words.filter(w => said.includes(w.replace(/[^a-z]/g, ''))).length;
      const score = matchCount / words.length;
      setSpeakResult(score > 0.6 ? 'good' : 'try');
    };
    rec.start();
  };

  const sections = [
    { id: 'pronunciation', label: '🗣️ Pronunciation', locked: false },
    { id: 'speaking', label: '🎙️ Speaking', locked: !hasPurchased },
    { id: 'reading', label: '📖 Reading', locked: !hasPurchased },
  ];

  return (
    <div className="space-y-4">
      {/* Section tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {sections.map(s => (
          <button key={s.id}
            onClick={() => !s.locked && setActiveSection(s.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all
              ${activeSection === s.id ? 'bg-blue-600 text-white' : s.locked ? 'bg-gray-900 text-gray-700 cursor-not-allowed' : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {s.label}
            {s.locked && <Lock className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* PRONUNCIATION */}
      {activeSection === 'pronunciation' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800"
            style={{ background: 'linear-gradient(135deg, #0d1a20, #0a0f0b)' }}>
            <p className="text-blue-400 font-black text-sm">Pronunciation Practice</p>
            <p className="text-gray-600 text-xs mt-0.5">Word suno, phir khud bolo — accent improve karo</p>
          </div>
          <div className="p-5">
            {/* Word card */}
            <div className="text-center py-6 px-4 rounded-2xl mb-4 border border-blue-500/15"
              style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
              <p className="text-4xl font-black text-white mb-2">{pron.word}</p>
              <p className="text-blue-400 font-mono text-lg mb-3">/{pron.phonetic}/</p>
              <div className="inline-block bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-1.5 mb-4">
                <p className="text-amber-400 text-xs font-semibold">💡 {pron.tip}</p>
              </div>
              <div className="flex justify-center gap-3">
                <button onClick={() => speakWord(pron.word)}
                  className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 text-blue-400 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-blue-600/30 transition-all">
                  <Volume2 className="w-4 h-4" /> Suno
                </button>
                <button onClick={() => speakWord(pron.word.split('').join(' '))}
                  className="flex items-center gap-2 bg-gray-800 border border-gray-700 text-gray-400 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-gray-700 transition-all">
                  <Volume2 className="w-4 h-4" /> Slowly
                </button>
              </div>
            </div>
            {/* Nav */}
            <div className="flex items-center justify-between">
              <button onClick={() => setPronIdx(p => (p - 1 + PRONUNCIATION_WORDS.length) % PRONUNCIATION_WORDS.length)}
                className="flex items-center gap-1 text-gray-500 hover:text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>
              <span className="text-gray-600 text-xs">{pronIdx + 1} / {PRONUNCIATION_WORDS.length}</span>
              <button onClick={() => setPronIdx(p => (p + 1) % PRONUNCIATION_WORDS.length)}
                className="flex items-center gap-1 text-gray-500 hover:text-white text-xs font-bold px-3 py-2 rounded-lg hover:bg-gray-800 transition-all">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SPEAKING */}
      {activeSection === 'speaking' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800"
            style={{ background: 'linear-gradient(135deg, #14100d, #0a0f0b)' }}>
            <p className="text-amber-400 font-black text-sm">Speaking Practice</p>
            <p className="text-gray-600 text-xs mt-0.5">Sentence padho, phir mic pe bolo — AI score karega</p>
          </div>
          <div className="p-5">
            <div className="rounded-2xl p-5 mb-4 border border-amber-500/15 text-center"
              style={{ background: 'linear-gradient(135deg, #1a1000, #0d0a00)' }}>
              <p className="text-gray-500 text-xs mb-2 uppercase tracking-wider font-bold">Yeh sentence bolo:</p>
              <p className="text-white font-black text-xl mb-1 leading-snug">"{speak.en}"</p>
              <p className="text-gray-600 text-sm italic">{speak.hi}</p>
              <button onClick={() => speakWord(speak.en)} className="mt-3 text-amber-400 hover:text-amber-300 transition-colors">
                <Volume2 className="w-5 h-5 mx-auto" />
              </button>
            </div>

            {/* Mic button */}
            <div className="text-center mb-4">
              <button onClick={startListening}
                className={`w-16 h-16 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-200 ${isListening ? 'border-red-400 bg-red-500/20 animate-pulse scale-110' : 'border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 hover:scale-105'}`}>
                <Mic className={`w-7 h-7 ${isListening ? 'text-red-400' : 'text-amber-400'}`} />
              </button>
              <p className="text-gray-600 text-xs mt-2">{isListening ? '🎙️ Sun raha hun...' : 'Mic tap karo aur bolo'}</p>
            </div>

            {/* Result */}
            {speakResult && (
              <div className={`rounded-xl p-4 text-center border mb-4 ${speakResult === 'good' ? 'bg-[#00ff88]/8 border-[#00ff88]/25' : 'bg-amber-500/8 border-amber-500/25'}`}>
                <p className="text-2xl mb-1">{speakResult === 'good' ? '🎉' : '💪'}</p>
                <p className={`font-black text-sm ${speakResult === 'good' ? 'text-[#00ff88]' : 'text-amber-400'}`}>
                  {speakResult === 'good' ? 'Wah! Bahut badhiya bola!' : 'Thoda aur practice karo!'}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => { setSpeakResult(null); setSpeakIdx(p => (p - 1 + PRACTICE_SENTENCES.length) % PRACTICE_SENTENCES.length); }}
                className="flex-1 bg-gray-800 text-gray-400 font-bold py-2.5 rounded-xl text-xs hover:bg-gray-700 transition-all flex items-center justify-center gap-1">
                <ChevronLeft className="w-3.5 h-3.5" /> Prev
              </button>
              <button onClick={() => { setSpeakResult(null); setSpeakIdx(p => (p + 1) % PRACTICE_SENTENCES.length); }}
                className="flex-1 bg-amber-600/20 border border-amber-500/30 text-amber-400 font-bold py-2.5 rounded-xl text-xs hover:bg-amber-600/30 transition-all flex items-center justify-center gap-1">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* READING */}
      {activeSection === 'reading' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800">
            <p className="text-purple-400 font-black text-sm">Reading Practice</p>
            <p className="text-gray-600 text-xs mt-0.5">Loud padhne se pronunciation + fluency dono badhti hai</p>
          </div>
          <div className="p-5">
            {[
              "Every morning, I wake up and remind myself that I can speak English fluently.",
              "Practice makes perfect. Even five minutes of daily speaking makes a huge difference.",
              "Confidence is not about speaking perfectly. It is about speaking without fear.",
            ].map((para, i) => (
              <div key={i} className="border border-gray-800 rounded-xl p-4 mb-3 last:mb-0 hover:border-purple-500/25 transition-colors">
                <p className="text-gray-300 text-sm leading-relaxed mb-3">{para}</p>
                <div className="flex gap-2">
                  <button onClick={() => speakWord(para)}
                    className="flex items-center gap-1.5 text-xs text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-500/20 transition-all">
                    <Volume2 className="w-3 h-3" /> Listen
                  </button>
                  <button onClick={() => speakWord(para.split('.')[0])}
                    className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-800 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-700 transition-all">
                    <Volume2 className="w-3 h-3" /> Slow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upsell if locked */}
      {!hasPurchased && activeSection !== 'pronunciation' && (
        <div className="rounded-2xl p-5 text-center border border-blue-500/20"
          style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
          <Lock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-white font-black mb-1">Full Practice Unlock Karo</p>
          <p className="text-gray-500 text-xs mb-4">Speaking + Reading practice sirf paid users ke liye</p>
          <Link to="/checkout?product=course"
            className="inline-flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Zap className="w-4 h-4" /> Get Full Access @ ₹499
          </Link>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   GAMES TAB
══════════════════════════════════════════ */
function GamesTab({ hasPurchased }) {
  const [activeGame, setActiveGame] = useState('wordmatch');
  const [wmScore, setWmScore] = useState(0);
  const [wmUsed, setWmUsed] = useState([]);
  const [wmSelected, setWmSelected] = useState({ word: null, meaning: null });
  const [wmCorrect, setWmCorrect] = useState([]);
  const [wmWrong, setWmWrong] = useState(null);

  const [fbIdx, setFbIdx] = useState(0);
  const [fbSelected, setFbSelected] = useState(null);
  const [fbScore, setFbScore] = useState(0);
  const [fbDone, setFbDone] = useState(false);

  const [typerText, setTyperText] = useState('');
  const [typerSentences] = useState(() => PRACTICE_SENTENCES.slice(0, 5));
  const [typerIdx, setTyperIdx] = useState(0);
  const [typerDone, setTyperDone] = useState(false);
  const [typerScore, setTyperScore] = useState(0);

  const games = [
    { id: 'wordmatch', label: '🎯 Word Match', locked: false },
    { id: 'fillblanks', label: '✏️ Fill Blanks', locked: !hasPurchased },
    { id: 'typerace', label: '⌨️ Type Race', locked: !hasPurchased },
  ];

  // Word Match Logic
  const handleWMSelect = (type, value) => {
    if (wmCorrect.includes(value) || wmUsed.includes(value)) return;
    const next = { ...wmSelected, [type]: value };
    setWmSelected(next);
    if (next.word && next.meaning) {
      const pair = WORD_MATCH_DATA.find(d => d.word === next.word && d.meaning === next.meaning);
      if (pair) {
        setWmCorrect(p => [...p, next.word, next.meaning]);
        setWmScore(s => s + 10);
        setWmSelected({ word: null, meaning: null });
      } else {
        setWmWrong(next.word);
        setTimeout(() => { setWmWrong(null); setWmSelected({ word: null, meaning: null }); }, 800);
      }
    }
  };

  const resetWM = () => { setWmScore(0); setWmCorrect([]); setWmSelected({ word: null, meaning: null }); setWmWrong(null); };

  // Fill Blanks Logic
  const handleFB = (opt) => {
    setFbSelected(opt);
    if (opt === FILL_BLANKS_DATA[fbIdx].answer) setFbScore(s => s + 10);
    setTimeout(() => {
      if (fbIdx < FILL_BLANKS_DATA.length - 1) { setFbIdx(p => p + 1); setFbSelected(null); }
      else setFbDone(true);
    }, 900);
  };

  const resetFB = () => { setFbIdx(0); setFbSelected(null); setFbScore(0); setFbDone(false); };

  // Type Race Logic
  const currentSentence = typerSentences[typerIdx]?.en || '';
  const handleType = (e) => {
    setTyperText(e.target.value);
    if (e.target.value.toLowerCase().trim() === currentSentence.toLowerCase().trim()) {
      setTyperScore(s => s + 15);
      setTyperText('');
      if (typerIdx < typerSentences.length - 1) setTyperIdx(p => p + 1);
      else setTyperDone(true);
    }
  };

  const getTypedChars = () => {
    return currentSentence.split('').map((char, i) => {
      const typedChar = typerText[i];
      if (!typedChar) return <span key={i} className="text-gray-500">{char}</span>;
      return <span key={i} className={typedChar === char ? 'text-[#00ff88]' : 'text-red-400'}>{char}</span>;
    });
  };

  return (
    <div className="space-y-4">
      {/* Game selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {games.map(g => (
          <button key={g.id}
            onClick={() => !g.locked && setActiveGame(g.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs shrink-0 transition-all
              ${activeGame === g.id ? 'bg-[#00ff88] text-black' : g.locked ? 'bg-gray-900 text-gray-700 cursor-not-allowed' : 'bg-gray-900 text-gray-400 hover:text-white hover:bg-gray-800'}`}
          >
            {g.label}
            {g.locked && <Lock className="w-3 h-3" />}
          </button>
        ))}
      </div>

      {/* WORD MATCH */}
      {activeGame === 'wordmatch' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-[#00ff88] font-black text-sm">Word Match</p>
              <p className="text-gray-600 text-xs">Word aur uska meaning match karo</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#00ff88] font-black text-sm">Score: {wmScore}</span>
              <button onClick={resetWM} className="text-gray-600 hover:text-white transition-colors">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="p-4">
            {wmCorrect.length === WORD_MATCH_DATA.length * 2 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">🏆</div>
                <p className="text-white font-black text-xl mb-1">Sab Match!</p>
                <p className="text-[#00ff88] font-bold mb-4">Score: {wmScore}/60</p>
                <button onClick={resetWM} className="bg-[#00ff88] text-black font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
                  <RefreshCw className="w-4 h-4" /> Phir Khelo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {/* Words column */}
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider text-center mb-2">Words</p>
                  {WORD_MATCH_DATA.map(d => (
                    <button key={d.word}
                      onClick={() => handleWMSelect('word', d.word)}
                      disabled={wmCorrect.includes(d.word)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-all border
                        ${wmCorrect.includes(d.word) ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] cursor-default' :
                          wmWrong === d.word ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                          wmSelected.word === d.word ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' :
                          'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}
                    >
                      {wmCorrect.includes(d.word) ? '✓ ' : ''}{d.word}
                    </button>
                  ))}
                </div>
                {/* Meanings column */}
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wider text-center mb-2">Meanings</p>
                  {[...WORD_MATCH_DATA].sort(() => Math.random() > 0.5 ? 1 : -1).map(d => (
                    <button key={d.meaning}
                      onClick={() => handleWMSelect('meaning', d.meaning)}
                      disabled={wmCorrect.includes(d.meaning)}
                      className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold text-left leading-snug transition-all border
                        ${wmCorrect.includes(d.meaning) ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] cursor-default' :
                          wmSelected.meaning === d.meaning ? 'bg-blue-500/20 border-blue-400/40 text-blue-300' :
                          'bg-gray-900 border-gray-800 text-gray-300 hover:border-gray-600'}`}
                    >
                      {d.meaning}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FILL BLANKS */}
      {activeGame === 'fillblanks' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-purple-400 font-black text-sm">Fill in the Blanks</p>
              <p className="text-gray-600 text-xs">Sahi word choose karo</p>
            </div>
            <span className="text-purple-400 font-black text-sm">Score: {fbScore}</span>
          </div>
          <div className="p-5">
            {fbDone ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">{fbScore >= 40 ? '🏆' : '💪'}</div>
                <p className="text-white font-black text-xl mb-1">{fbScore >= 40 ? 'Excellent!' : 'Good Try!'}</p>
                <p className="text-purple-400 font-bold mb-4">Score: {fbScore}/{FILL_BLANKS_DATA.length * 10}</p>
                <button onClick={resetFB} className="bg-purple-600 text-white font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
                  <RefreshCw className="w-4 h-4" /> Phir Khelo
                </button>
              </div>
            ) : (
              <>
                <div className="mb-2 flex justify-between text-xs text-gray-600">
                  <span>Question {fbIdx + 1}/{FILL_BLANKS_DATA.length}</span>
                  <span>{fbIdx + 1} of {FILL_BLANKS_DATA.length}</span>
                </div>
                <div className="h-1 bg-gray-800 rounded-full mb-5 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full transition-all"
                    style={{ width: `${((fbIdx) / FILL_BLANKS_DATA.length) * 100}%` }} />
                </div>
                <div className="bg-purple-900/10 border border-purple-500/15 rounded-xl p-4 mb-4 text-center">
                  <p className="text-white font-bold text-base leading-relaxed">
                    {FILL_BLANKS_DATA[fbIdx].sentence.replace('_____', '_____ ')}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {FILL_BLANKS_DATA[fbIdx].options.map(opt => {
                    const isCorrect = opt === FILL_BLANKS_DATA[fbIdx].answer;
                    const isSelected = fbSelected === opt;
                    return (
                      <button key={opt}
                        onClick={() => !fbSelected && handleFB(opt)}
                        disabled={!!fbSelected}
                        className={`px-3 py-3 rounded-xl text-sm font-bold transition-all border
                          ${isSelected && isCorrect ? 'bg-[#00ff88]/15 border-[#00ff88]/40 text-[#00ff88]' :
                            isSelected && !isCorrect ? 'bg-red-500/15 border-red-500/30 text-red-400' :
                            fbSelected && isCorrect ? 'bg-[#00ff88]/10 border-[#00ff88]/25 text-[#00ff88]' :
                            'bg-gray-900 border-gray-800 text-gray-300 hover:border-purple-500/30'}`}
                      >
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

      {/* TYPE RACE */}
      {activeGame === 'typerace' && (
        <div className="bg-[#0a0f0b] border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
            <div>
              <p className="text-amber-400 font-black text-sm">Type Race</p>
              <p className="text-gray-600 text-xs">Sentence type karo — speed + accuracy</p>
            </div>
            <span className="text-amber-400 font-black text-sm">Score: {typerScore}</span>
          </div>
          <div className="p-5">
            {typerDone ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3">⌨️</div>
                <p className="text-white font-black text-xl mb-1">Type Race Complete!</p>
                <p className="text-amber-400 font-bold mb-4">Score: {typerScore}/{typerSentences.length * 15}</p>
                <button onClick={() => { setTyperIdx(0); setTyperText(''); setTyperScore(0); setTyperDone(false); }}
                  className="bg-amber-600 text-white font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
                  <RefreshCw className="w-4 h-4" /> Race Again
                </button>
              </div>
            ) : (
              <>
                <div className="h-1 bg-gray-800 rounded-full mb-4 overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(typerIdx / typerSentences.length) * 100}%` }} />
                </div>
                <div className="bg-amber-900/10 border border-amber-500/15 rounded-xl p-4 mb-4 font-mono text-base leading-relaxed text-center">
                  {getTypedChars()}
                </div>
                <textarea
                  value={typerText}
                  onChange={handleType}
                  placeholder="Yahan type karo..."
                  rows={2}
                  autoFocus
                  className="w-full bg-[#060809] border border-gray-700 rounded-xl px-4 py-3 text-white text-sm resize-none focus:border-amber-500/50 focus:outline-none transition-colors"
                />
                <p className="text-gray-700 text-[10px] mt-2 text-center">{typerIdx + 1}/{typerSentences.length} sentences</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Locked upsell */}
      {!hasPurchased && activeGame !== 'wordmatch' && (
        <div className="rounded-2xl p-5 text-center border border-blue-500/20"
          style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
          <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-white font-black mb-1">Full Games Unlock Karo</p>
          <p className="text-gray-500 text-xs mb-4">Fill Blanks + Type Race sirf paid users ke liye</p>
          <Link to="/checkout?product=course"
            className="inline-flex items-center gap-2 font-black px-5 py-2.5 rounded-xl text-sm"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
            <Zap className="w-4 h-4" /> Unlock All @ ₹499
          </Link>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN COURSEAREA COMPONENT
══════════════════════════════════════════ */
export default function CourseArea() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('learn');
  const [modules, setModules] = useState(PLACEHOLDER_MODULES);
  const [activeModule, setActiveModule] = useState(PLACEHOLDER_MODULES[0]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loadingModules, setLoadingModules] = useState(true);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [referCode, setReferCode] = useState('');
  const [showUpsell, setShowUpsell] = useState(false);
  const mainRef = useRef(null);

  // Fetch modules from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check purchase
        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('has_course, refer_code')
            .eq('id', user.id)
            .single();
          if (userData?.has_course) setHasPurchased(true);
          if (userData?.refer_code) setReferCode(userData.refer_code);
        }

        // Fetch modules
        const { data: mods } = await supabase
          .from('course_modules')
          .select('id, title, duration, is_free, video_url, sort_order, description')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (mods && mods.length > 0) {
          const processed = mods.map(m => ({
            ...m,
            isFree: m.is_free,
            isLocked: !hasPurchased && !m.is_free,
            isCompleted: false,
          }));
          setModules(processed);
          setActiveModule(processed[0]);
        }
      } catch (err) {
        console.error('CourseArea fetch error:', err);
      } finally {
        setLoadingModules(false);
      }
    };
    fetchData();
  }, [user, hasPurchased]);

  // Sticky bar on scroll
  useEffect(() => {
    const handleScroll = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Show upsell popup after 45s if not purchased
  useEffect(() => {
    if (hasPurchased) return;
    const t = setTimeout(() => setShowUpsell(true), 45000);
    return () => clearTimeout(t);
  }, [hasPurchased]);

  const handleModuleComplete = useCallback((modId) => {
    setModules(prev => prev.map(m => m.id === modId ? { ...m, isCompleted: true } : m));
    if (user) {
      supabase.from('user_progress').upsert({ user_id: user.id, module_id: modId, completed: true }).catch(() => {});
    }
  }, [user]);

  const handleModuleSelect = (mod) => {
    if (!hasPurchased && !mod.isFree) {
      setShowUpsell(true);
      return;
    }
    setActiveModule(mod);
    setActiveTab('learn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#060809] text-[#e5e5e5] pb-24"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>

      {/* ── Sticky Conversion Bar (mobile) ── */}
      {!hasPurchased && <StickyConversionBar show={showStickyBar} referCode={referCode} />}

      {/* ── Upsell Popup ── */}
      {showUpsell && !hasPurchased && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-blue-500/30 shadow-[0_0_60px_rgba(59,130,246,0.2)]"
            style={{ background: 'linear-gradient(135deg, #060d1f, #0a0d1a)' }}>
            <div className="p-6 text-center">
              <button onClick={() => setShowUpsell(false)} className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
              <div className="text-4xl mb-3">🎓</div>
              <div className="flex justify-center gap-2 mb-3">
                <Badge color="red"><Flame className="w-2.5 h-2.5" /> LIMITED OFFER</Badge>
                <Badge color="green"><Sparkles className="w-2.5 h-2.5" /> 50% OFF</Badge>
              </div>
              <h3 className="text-xl font-black text-white mb-2">Sirf ₹499 Mein</h3>
              <p className="text-gray-400 text-sm mb-1">Puri course unlock karo — 10 modules, lifetime access</p>
              <p className="text-gray-600 text-xs mb-5">Tum already interested ho — ek kadam aur!</p>
              <Link to={`/checkout?product=course${referCode ? `&ref=${referCode}` : ''}`}
                onClick={() => setShowUpsell(false)}
                className="flex items-center justify-center gap-2 w-full font-black py-4 rounded-2xl text-base mb-3 shadow-[0_0_25px_rgba(59,130,246,0.3)]"
                style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                <Gift className="w-4 h-4" /> Haan, Abhi Unlock Karo!
              </Link>
              <button onClick={() => setShowUpsell(false)} className="text-gray-700 text-xs hover:text-gray-500 transition-colors">
                Nahi, baad mein dekhta hun
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="border-b border-white/5 px-4 py-5"
        style={{ background: 'linear-gradient(to bottom, #0a0f0b, #060809)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-white leading-tight">Spoken English Mastery</h1>
              <p className="text-gray-600 text-xs">10 Modules · Lifetime Access · Certificate</p>
            </div>
          </div>
          {!hasPurchased && (
            <div className="mt-3 flex items-center gap-3 bg-blue-900/15 border border-blue-500/20 rounded-xl px-4 py-2.5">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0" />
              <p className="text-blue-300 text-xs flex-1">
                Sirf <strong>Module 1 free</strong> hai. Poori course ke liye:
              </p>
              <Link to={`/checkout?product=course${referCode ? `&ref=${referCode}` : ''}`}
                className="shrink-0 bg-blue-600 text-white font-black px-3 py-1.5 rounded-lg text-xs hover:bg-blue-500 transition-colors flex items-center gap-1">
                ₹499 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-6xl mx-auto px-4 pt-5">
        <div className="grid lg:grid-cols-3 gap-5">

          {/* ── Left: Tabs + Content ── */}
          <div className="lg:col-span-2 space-y-4" ref={mainRef}>

            {/* Tab Nav */}
            <div className="flex gap-1 bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-1">
              {TABS.map(tab => (
                <button key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-all duration-200
                    ${activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-[0_2px_12px_rgba(37,99,235,0.3)]'
                      : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* LEARN TAB */}
            {activeTab === 'learn' && (
              <div className="space-y-4">
                {/* Video Player */}
                <VideoPlayer module={activeModule} onComplete={handleModuleComplete} />

                {/* Module info */}
                <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h2 className="text-base font-black text-white leading-snug">{activeModule?.title}</h2>
                    {activeModule?.isFree && <Badge color="green"><Sparkles className="w-2.5 h-2.5" /> FREE</Badge>}
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    {activeModule?.description || 'Is module mein aap seekhenge ki daily life mein English kaise use karein — bina grammar ke darr ke.'}
                  </p>

                  {/* What you'll learn */}
                  <div className="space-y-2 mb-4">
                    {['Clear pronunciation techniques', 'Confident sentence formation', 'Real-life usage examples'].map((point, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00ff88] shrink-0" />
                        <p className="text-gray-400 text-xs">{point}</p>
                      </div>
                    ))}
                  </div>

                  {/* Feedback form link */}
                  <a href="https://forms.gle/YOUR_FORM_ID"
                    target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#00ff88] transition-colors border border-gray-800 hover:border-[#00ff88]/30 rounded-xl px-4 py-2.5">
                    <MessageSquare className="w-4 h-4" />
                    Is module ke baare mein sawaal hai? Yahan pucho →
                  </a>
                </div>

                {/* Mid-page upsell banner */}
                {!hasPurchased && (
                  <div className="rounded-2xl p-5 border border-blue-500/25 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, #060d1f 0%, #0a0d1a 100%)' }}>
                    <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px]"
                      style={{ background: 'rgba(59,130,246,0.12)' }} />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Flame className="w-4 h-4 text-red-400 animate-pulse" />
                        <p className="text-white font-black text-sm">Baki 9 Modules Kab Dekhoge?</p>
                      </div>
                      <p className="text-gray-500 text-xs mb-4">
                        Sirf ₹499 mein puri journey — pronunciation se leke interview tak. Lifetime access.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Link to={`/checkout?product=course${referCode ? `&ref=${referCode}` : ''}`}
                          className="flex items-center justify-center gap-2 font-black px-5 py-3 rounded-xl text-sm shadow-[0_0_15px_rgba(59,130,246,0.25)]"
                          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                          <Gift className="w-4 h-4" /> Unlock Full Course @ ₹499
                        </Link>
                        <div className="flex items-center justify-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure</span>
                          <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Instant</span>
                          <span className="flex items-center gap-1"><Star className="w-3 h-3" /> Lifetime</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile: module list inline */}
                <div className="lg:hidden">
                  <p className="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">All Modules</p>
                  <ModuleList modules={modules} activeId={activeModule?.id} onSelect={handleModuleSelect} hasPurchased={hasPurchased} />
                </div>
              </div>
            )}

            {/* PRACTICE TAB */}
            {activeTab === 'practice' && <PracticeTab hasPurchased={hasPurchased} />}

            {/* GAMES TAB */}
            {activeTab === 'games' && <GamesTab hasPurchased={hasPurchased} />}
          </div>

          {/* ── Right: Module Sidebar (desktop only) ── */}
          <div className="hidden lg:block space-y-4">
            <ModuleList modules={modules} activeId={activeModule?.id} onSelect={handleModuleSelect} hasPurchased={hasPurchased} />

            {/* Course benefits card */}
            <div className="bg-[#0a0f0b] border border-[#00ff88]/12 rounded-2xl p-4">
              <p className="text-[#00ff88] font-black text-xs uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" /> Course Mein Kya Milega
              </p>
              <div className="space-y-2.5">
                {[
                  { icon: '🎬', text: '10 HD Video Modules' },
                  { icon: '🎙️', text: 'Speaking Practice Tools' },
                  { icon: '🎮', text: '3 Interactive Games' },
                  { icon: '📜', text: 'Completion Certificate' },
                  { icon: '♾️', text: 'Lifetime Access' },
                  { icon: '💬', text: 'Doubt Form Support' },
                ].map((b, i) => (
                  <div key={i} className="flex items-center gap-2.5 text-xs text-gray-400">
                    <span>{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
              {!hasPurchased && (
                <Link to={`/checkout?product=course${referCode ? `&ref=${referCode}` : ''}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full font-black py-3 rounded-xl text-xs shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}>
                  <Zap className="w-3.5 h-3.5" /> Get Full Access @ ₹499
                </Link>
              )}
            </div>

            {/* Social proof */}
            <div className="bg-[#0a0f0b] border border-gray-800/60 rounded-2xl p-4">
              <p className="text-white font-black text-xs mb-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Student Reviews
              </p>
              {[
                { text: '"Interview mein itna confident kabhi nahi tha. Yeh course game changer hai!"', name: 'Ramesh T., Pune' },
                { text: '"3 mahine mein fluent ho gaya. ₹499 best investment tha."', name: 'Divya S., Delhi' },
              ].map((r, i) => (
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