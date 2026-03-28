import React, { useState } from 'react';
import { PlayCircle, CheckCircle, Lock, BookOpen } from 'lucide-react';

export default function CourseArea() {
  // Dummy Course Modules (Baad mein Supabase se aayenge)
  const [modules] = useState([
    { id: 1, title: 'Module 1: The Mindset of English', duration: '12 mins', isCompleted: true, isLocked: false, videoUrl: 'r2-link-here' },
    { id: 2, title: 'Module 2: Daily Life Sentences (Hack)', duration: '18 mins', isCompleted: false, isLocked: false, videoUrl: 'r2-link-here' },
    { id: 3, title: 'Module 3: Business & Client Talk', duration: '25 mins', isCompleted: false, isLocked: true, videoUrl: null },
    { id: 4, title: 'Module 4: Confidence Building', duration: '15 mins', isCompleted: false, isLocked: true, videoUrl: null },
  ]);

  const [activeVideo, setActiveVideo] = useState(modules[1]); // By default 2nd video khuli hai

  return (
    <div className="min-h-screen bg-brandDark text-brandText pt-4 pb-20">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="text-blue-400 w-8 h-8" />
          <h1 className="text-2xl md:text-3xl font-bold text-white">Spoken English Mastery</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Main Video Player Area (Takes 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-black aspect-video rounded-xl border border-gray-800 overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              {/* Yahan tumhara custom React Video Player aayega jo R2 se chalega */}
              {activeVideo.isLocked ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-brandDark/90">
                  <Lock className="w-12 h-12 text-gray-500 mb-2" />
                  <p className="text-gray-400">Complete previous modules to unlock</p>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 group cursor-pointer hover:bg-gray-800 transition-colors">
                  <PlayCircle className="w-16 h-16 text-blue-400 group-hover:scale-110 transition-transform" />
                  <p className="absolute bottom-4 left-4 text-white font-bold">{activeVideo.title}</p>
                </div>
              )}
            </div>
            
            <div className="bg-brandCard border border-gray-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-2">{activeVideo.title}</h2>
              <p className="text-gray-400 text-sm">
                Is video mein hum basic sentence formation ke hacks seekhenge bina boring grammar rules yaad kiye.
              </p>
            </div>
          </div>

          {/* Sidebar: Course Playlist (Takes 1 Column) */}
          <div className="bg-brandCard border border-gray-800 rounded-xl p-4 h-fit max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-white mb-4 border-b border-gray-800 pb-2">Course Modules</h3>
            
            <div className="space-y-2">
              {modules.map((mod) => (
                <button 
                  key={mod.id}
                  onClick={() => !mod.isLocked && setActiveVideo(mod)}
                  className={`w-full text-left flex items-start gap-3 p-3 rounded-lg transition-colors ${
                    activeVideo.id === mod.id ? 'bg-blue-900/20 border border-blue-500/30' : 
                    mod.isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 border border-transparent'
                  }`}
                >
                  <div className="mt-1">
                    {mod.isCompleted ? <CheckCircle className="w-5 h-5 text-brandGreen" /> : 
                     mod.isLocked ? <Lock className="w-5 h-5 text-gray-500" /> : 
                     <PlayCircle className={`w-5 h-5 ${activeVideo.id === mod.id ? 'text-blue-400' : 'text-gray-400'}`} />}
                  </div>
                  <div>
                    <h4 className={`font-semibold text-sm ${activeVideo.id === mod.id ? 'text-blue-400' : 'text-gray-200'}`}>
                      {mod.title}
                    </h4>
                    <span className="text-xs text-gray-500">{mod.duration}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}