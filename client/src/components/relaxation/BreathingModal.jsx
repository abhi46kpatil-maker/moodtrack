import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, Sparkles, Heart } from 'lucide-react';

export function BreathingModal({ isOpen, onClose }) {
  const [isActive, setIsActive] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [phase, setPhase] = useState('Inhale'); // Inhale (4s), Hold (4s), Exhale (4s), Hold (4s)
  const [phaseSeconds, setPhaseSeconds] = useState(4);
  const [cycleCount, setCycleCount] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            setIsActive(false);
            return 0;
          }
          return prev - 1;
        });

        setPhaseSeconds(prev => {
          if (prev <= 1) {
            // Transition phase
            setPhase(curr => {
              if (curr === 'Inhale') return 'Hold (Full)';
              if (curr === 'Hold (Full)') return 'Exhale';
              if (curr === 'Exhale') return 'Hold (Empty)';
              setCycleCount(c => c + 1);
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsRemaining === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining]);

  const handleStart = () => {
    setIsActive(true);
  };

  const handlePause = () => {
    setIsActive(false);
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(60);
    setPhase('Inhale');
    setPhaseSeconds(4);
    setCycleCount(0);
  };

  if (!isOpen) return null;

  // Visual scale based on phase
  let circleScale = 'scale-100';
  let circleColor = 'bg-teal-500/20 border-teal-400 text-teal-700';
  let instruction = 'Breathe in slowly through your nose';

  if (phase === 'Inhale') {
    circleScale = 'scale-125';
    circleColor = 'bg-indigo-500/20 border-indigo-400 text-indigo-700';
    instruction = 'Breathe in slowly and deeply...';
  } else if (phase === 'Hold (Full)') {
    circleScale = 'scale-125';
    circleColor = 'bg-emerald-500/20 border-emerald-400 text-emerald-700';
    instruction = 'Hold gently with lungs comfortably full';
  } else if (phase === 'Exhale') {
    circleScale = 'scale-90';
    circleColor = 'bg-amber-500/20 border-amber-400 text-amber-700';
    instruction = 'Release slowly through your mouth...';
  } else if (phase === 'Hold (Empty)') {
    circleScale = 'scale-90';
    circleColor = 'bg-slate-500/20 border-slate-400 text-slate-700';
    instruction = 'Rest in stillness before the next breath';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-100 relative overflow-hidden">
        {/* Background ambient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-indigo-100 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-teal-100 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold text-slate-800 text-base">60-Second Mindful Breathing</h3>
          </div>
          <button
            onClick={() => { handleReset(); onClose(); }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-500 mb-6 relative z-10">
          Box breathing helps settle the autonomic nervous system and lower physiological tension.
        </p>

        {/* Interactive Breathing Visual Circle */}
        <div className="relative h-64 flex items-center justify-center my-4">
          <div
            className={`w-44 h-44 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${circleScale} ${circleColor}`}
          >
            {secondsRemaining > 0 ? (
              <>
                <span className="text-xs uppercase tracking-wider font-bold opacity-75">
                  {phase}
                </span>
                <span className="text-4xl font-extrabold my-1 font-mono">
                  {phaseSeconds}s
                </span>
                <span className="text-[11px] font-medium opacity-80">
                  {secondsRemaining}s left
                </span>
              </>
            ) : (
              <div className="flex flex-col items-center p-4 text-emerald-600">
                <Heart className="w-8 h-8 fill-emerald-500 stroke-emerald-600 mb-1 animate-bounce" />
                <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Phase Guidance Instruction */}
        <div className="h-10 mb-6 flex items-center justify-center">
          {secondsRemaining > 0 ? (
            <p className="text-sm font-medium text-slate-700 transition-opacity duration-300">
              {isActive ? instruction : 'Click Start to begin your 60-second breathing reset.'}
            </p>
          ) : (
            <p className="text-sm font-semibold text-emerald-600">
              Wonderful job. Notice how your mind and body feel right now.
            </p>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 relative z-10">
          {secondsRemaining > 0 ? (
            <>
              {!isActive ? (
                <button
                  onClick={handleStart}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-md shadow-indigo-200 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Start Reset</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium shadow-md shadow-amber-200 transition-all"
                >
                  <Pause className="w-4 h-4 fill-current" />
                  <span>Pause</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors"
                title="Reset session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => { handleReset(); onClose(); }}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium shadow-md transition-all"
            >
              Close Experience
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
