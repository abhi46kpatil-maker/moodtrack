import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Lightbulb, Sparkles, Heart, Shield, CheckCircle, Wind } from 'lucide-react';

export function PersonalInsights({ onOpenBreathing }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-4xl mx-auto h-64 bg-slate-200 rounded-2xl animate-pulse" />;
  }

  const { insights, weeklySummary, streaks } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-amber-500" />
          <span>Personal Insights & Wellness Suggestions</span>
        </h2>
        <p className="text-xs text-slate-500">
          Transparent data summaries generated from your daily check-ins. Strictly non-diagnostic and private.
        </p>
      </div>

      {/* Non-Diagnostic Disclaimer Banner */}
      <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Shield className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">Supportive Wellness Reflection</p>
          <p className="mt-0.5 leading-relaxed">
            MoodTrack does not provide clinical diagnoses. These insights simply highlight behavioral patterns in your own check-in numbers to help you make informed daily lifestyle decisions.
          </p>
        </div>
      </div>

      {/* Generated Insights Cards */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Your Data Patterns This Week</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {insights && insights.length > 0 ? (
            insights.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{item}</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 italic">Complete daily check-ins to generate personalized trends.</p>
          )}
        </div>
      </div>

      {/* Calming Suggestions & Breathing Exercise */}
      <div className="bg-gradient-to-r from-teal-500/10 to-indigo-500/10 rounded-3xl p-6 border border-teal-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-teal-800 font-bold text-sm">
            <Heart className="w-5 h-5 text-teal-600" />
            <span>Recommended Wellness Habits</span>
          </div>
          <button
            onClick={onOpenBreathing}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            <Wind className="w-4 h-4" />
            <span>Launch 60s Breathing</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs">
            <span className="font-bold text-slate-800 block mb-1">Micro-Breaks</span>
            <p className="text-slate-600 leading-relaxed">
              Step away from your desk for 5 minutes after every 45 minutes of studying.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs">
            <span className="font-bold text-slate-800 block mb-1">Hydration & Movement</span>
            <p className="text-slate-600 leading-relaxed">
              Drink a full glass of water and stretch your shoulders and neck muscles.
            </p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-teal-100 shadow-2xs">
            <span className="font-bold text-slate-800 block mb-1">Task Chunking</span>
            <p className="text-slate-600 leading-relaxed">
              Deconstruct complex assignments into single actionable 15-minute milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
