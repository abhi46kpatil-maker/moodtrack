import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Lock, CheckCircle2, AlertCircle, Sparkles, Heart } from 'lucide-react';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function DailyCheckIn({ onComplete }) {
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [selectedMood, setSelectedMood] = useState('happy');
  const [selectedStress, setSelectedStress] = useState(2);
  const [privateNote, setPrivateNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);

  const checkToday = async () => {
    try {
      const res = await api.get('/student/today');
      setTodayStatus(res);
      if (res.completed && res.checkin) {
        setSuccessData(res.checkin);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkToday();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    try {
      const res = await api.post('/student/checkin', {
        mood: selectedMood,
        stress_level: selectedStress,
        private_note: privateNote
      });

      setSuccessData(res.checkin);
      setTodayStatus({ completed: true, checkin: res.checkin });
      if (onComplete) onComplete();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit check-in.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center animate-pulse">
        <div className="h-64 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  // If already completed today
  if (todayStatus?.completed && successData) {
    return (
      <div className="p-6 md:p-12 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-emerald-200 shadow-xl text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-teal-500" />
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-1">
            ✓ Today's check-in completed
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            You've logged your reflection for today ({successData.date}). Only one check-in is required per calendar day.
          </p>

          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 text-left space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Your Mood</span>
              <MoodBadge mood={successData.mood} size="md" />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-semibold text-slate-500">Stress Level</span>
              <StressBadge level={successData.stress_level} size="md" />
            </div>

            {successData.private_note && (
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>Your Private Note</span>
                </div>
                <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 italic">
                  "{successData.private_note}"
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-emerald-700 font-medium">
            <Lock className="w-3.5 h-3.5" />
            <span>🔒 Your note is private and visible only to you.</span>
          </div>
        </div>
      </div>
    );
  }

  const moods = [
    { key: 'happy', emoji: '😊', label: 'Happy', desc: 'Feeling upbeat, calm, or productive' },
    { key: 'neutral', emoji: '😐', label: 'Neutral', desc: 'Normal routine, neither high nor low' },
    { key: 'sad', emoji: '😔', label: 'Sad', desc: 'Feeling low, fatigued, or overwhelmed' }
  ];

  const stressLevels = [
    { level: 1, label: 'Very Low', color: 'emerald', bg: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
    { level: 2, label: 'Low', color: 'teal', bg: 'bg-teal-50 border-teal-200 text-teal-700' },
    { level: 3, label: 'Moderate', color: 'amber', bg: 'bg-amber-50 border-amber-200 text-amber-700' },
    { level: 4, label: 'High', color: 'orange', bg: 'bg-orange-50 border-orange-200 text-orange-700' },
    { level: 5, label: 'Very High', color: 'rose', bg: 'bg-rose-50 border-rose-200 text-rose-700' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          Daily Wellness Check-in
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Record how you feel today. Keep track of personal patterns over time.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-8">
        {/* Step 1: Mood */}
        <div>
          <label className="block text-sm font-bold text-slate-800 mb-3">
            1. How are you feeling today?
          </label>
          <div className="grid grid-cols-3 gap-3">
            {moods.map(m => (
              <button
                type="button"
                key={m.key}
                onClick={() => setSelectedMood(m.key)}
                className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                  selectedMood === m.key
                    ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <span className="text-3xl mb-1">{m.emoji}</span>
                <span className="text-xs font-bold text-slate-800">{m.label}</span>
                <span className="text-[10px] text-slate-400 hidden sm:block leading-tight">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Stress */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-bold text-slate-800">
              2. How stressed do you feel today?
            </label>
            <StressBadge level={selectedStress} size="md" />
          </div>

          <div className="grid grid-cols-5 gap-2">
            {stressLevels.map(s => (
              <button
                type="button"
                key={s.level}
                onClick={() => setSelectedStress(s.level)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center ${
                  selectedStress === s.level
                    ? `${s.bg} ring-2 ring-indigo-500/30 font-bold shadow-xs`
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <span className="text-lg font-bold">{s.level}</span>
                <span className="text-[10px] leading-tight mt-0.5">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Private Note */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-slate-800">
              3. Anything you'd like to note about today? (Optional)
            </label>
          </div>

          <div className="mb-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs font-semibold">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>🔒 Your note is private and visible only to you.</span>
          </div>

          <textarea
            value={privateNote}
            onChange={(e) => setPrivateNote(e.target.value)}
            rows={4}
            placeholder="Write down any thoughts, triggers, deadlines, or feelings. Mentors and administrators cannot see this note."
            className="w-full p-3.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xs text-slate-800 placeholder-slate-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {submitting ? (
            <span>Saving your check-in...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Today's Check-in</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
