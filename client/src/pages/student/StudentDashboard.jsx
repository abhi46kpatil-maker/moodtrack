import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';
import {
  Sparkles,
  Flame,
  CalendarCheck,
  TrendingUp,
  Activity,
  Heart,
  Wind,
  ShieldCheck,
  ArrowRight,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';

export function StudentDashboard({ onNavigateToCheckin, onOpenBreathing }) {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/student/dashboard');
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-36 bg-slate-200/60 dark:bg-slate-800/50 rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-200/60 dark:bg-slate-800/50 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-slate-200/60 dark:bg-slate-800/50 rounded-3xl" />
          <div className="h-80 bg-slate-200/60 dark:bg-slate-800/50 rounded-3xl" />
        </div>
      </div>
    );
  }

  const { student, todayCompleted, todayCheckin, currentStress, weeklySummary, streaks, trends, insights } = data || {};

  const chartData = (trends?.stressTrend || []).map((t, idx) => ({
    day: t.day,
    date: t.date,
    stress: t.stress,
    mood: trends?.moodTrend?.[idx]?.mood || null
  }));

  const isHighStress = currentStress && currentStress >= 4;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. Glassmorphic Aurora Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-xl">
        {/* Ambient radial lighting inside the banner */}
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-teal-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-xs text-indigo-200 mb-3 backdrop-blur-md shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Roll No: {student?.roll_number} • {student?.department}</span>
              <span className="opacity-40">•</span>
              <span className="text-teal-300 font-mono text-[11px]">256-Bit Encrypted</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
              Welcome back, {student?.name}! 👋
            </h2>
            <p className="text-indigo-200/90 dark:text-slate-300 text-xs md:text-sm mt-1.5 max-w-xl leading-relaxed">
              Take 30 seconds to track your wellbeing today. All your reflections and notes are strictly private and end-to-end encrypted.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {todayCompleted ? (
              <div className="bg-emerald-500/20 border border-emerald-400/40 rounded-2xl p-4 flex items-center gap-3.5 backdrop-blur-md shadow-lg shadow-emerald-950/30">
                <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/40">
                  <CalendarCheck className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="text-xs font-black text-emerald-300 block">✓ Today's Check-in Completed</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-white/90">Mood: <MoodBadge mood={todayCheckin?.mood} size="sm" /></span>
                    <span className="text-xs text-white/90">Stress: <StressBadge level={todayCheckin?.stress_level} size="sm" /></span>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onNavigateToCheckin}
                className="px-6 py-3.5 bg-gradient-to-r from-teal-500 via-indigo-600 to-purple-600 hover:from-teal-400 hover:to-purple-500 text-white rounded-2xl font-bold text-xs md:text-sm shadow-xl shadow-teal-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer shimmer-sweep"
              >
                <CalendarCheck className="w-4 h-4" />
                <span>Log Today's Mood & Stress</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onOpenBreathing}
              className="px-4 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-teal-300 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 backdrop-blur-md transition-all cursor-pointer shadow-xs hover:scale-105"
            >
              <Wind className="w-4 h-4 text-teal-400 animate-pulse" />
              <span>60s Breathing</span>
            </button>
          </div>
        </div>

        {/* Interactive Instant Mood Pulse Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping shrink-0" />
            <span className="text-xs font-bold text-teal-300 uppercase tracking-wider">Instant Emotional Pulse:</span>
            <span className="text-xs text-slate-300">Tap your vibe right now</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              { mood: 'happy', emoji: '🌟', label: 'Thriving', stress: 1, color: 'from-amber-500 to-emerald-500' },
              { mood: 'happy', emoji: '😊', label: 'Good', stress: 2, color: 'from-emerald-500 to-teal-500' },
              { mood: 'neutral', emoji: '😐', label: 'Okay', stress: 3, color: 'from-teal-500 to-blue-500' },
              { mood: 'sad', emoji: '😓', label: 'Stressed', stress: 4, color: 'from-blue-500 to-rose-500' },
              { mood: 'sad', emoji: '🆘', label: 'Overwhelmed', stress: 5, color: 'from-rose-500 to-purple-600' },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={onNavigateToCheckin}
                title={`${item.label} (Click to record)`}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/25 border border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md shadow-xs text-white"
              >
                <span className="text-base leading-none">{item.emoji}</span>
                <span className="text-[11px] font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. KPI Metric Cards Row (Vibrant Glass System) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 md:gap-4">
        {/* Current Stress */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Current Stress
            </span>
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          </div>
          <div className="mt-2.5">
            <StressBadge level={currentStress} size="md" />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Scale 1 to 5</span>
            <span className="font-semibold text-indigo-500">Live Status</span>
          </div>
        </div>

        {/* Weekly Avg Stress */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Weekly Avg
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-600 dark:text-teal-400 text-[9.5px] font-bold">
              7-Day
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {weeklySummary?.avgStress ? `${weeklySummary.avgStress}` : '—'}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">/ 5</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Target: &lt; 3.0</span>
            <span className="font-semibold text-teal-500">✓ Healthy</span>
          </div>
        </div>

        {/* Highest Stress This Week */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Peak Stress
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[9.5px] font-bold">
              Max
            </span>
          </div>
          <div className="mt-2.5">
            <StressBadge level={weeklySummary?.highestStress} size="sm" />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Weekly ceiling</span>
            <span className="font-semibold text-amber-500">Monitored</span>
          </div>
        </div>

        {/* Most Common Mood */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Top Mood
            </span>
            <span className="px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[9.5px] font-bold">
              Dominant
            </span>
          </div>
          <div className="mt-2.5">
            <MoodBadge mood={weeklySummary?.mostCommonMood} size="sm" />
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Overall trend</span>
            <span className="font-semibold text-purple-500">Equilibrium</span>
          </div>
        </div>

        {/* Check-in Streak */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Check-in Streak
            </span>
            <Flame className="w-4 h-4 fill-emerald-500 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-emerald-600 dark:text-emerald-400 font-black text-2xl">
            <span>{streaks?.checkinStreak || 0}</span>
            <span className="text-xs font-semibold text-slate-400">{streaks?.checkinStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Keep it up!</span>
            <span className="font-semibold text-emerald-500">🔥 Active</span>
          </div>
        </div>

        {/* High-Stress Streak */}
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Sustained Alert
            </span>
            <Activity className={`w-4 h-4 ${
              (streaks?.highStressStreak || 0) >= 3 ? 'text-rose-500 animate-pulse' : 'text-slate-400'
            }`} />
          </div>
          <div className={`flex items-baseline gap-1 mt-2 font-black text-2xl ${
            (streaks?.highStressStreak || 0) >= 3
              ? 'text-rose-600 dark:text-rose-400'
              : 'text-slate-700 dark:text-slate-200'
          }`}>
            <span>{streaks?.highStressStreak || 0}</span>
            <span className="text-xs font-semibold text-slate-400">{streaks?.highStressStreak === 1 ? 'day' : 'days'}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Threshold: 3 days</span>
            <span className={`font-semibold ${(streaks?.highStressStreak || 0) >= 3 ? 'text-rose-500' : 'text-emerald-500'}`}>
              {(streaks?.highStressStreak || 0) >= 3 ? 'Alert Trigger' : 'All Clear'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Charts & Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Stress & Mood Trend Chart */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span>7-Day Stress & Mood Trend</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Your daily logged stress intensity (1 = Very Low to 5 = Very High)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span>Stress Index</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  tick={{ fontSize: 12, fill: isDark ? '#94a3b8' : '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-white/20 text-white p-3 rounded-2xl shadow-xl space-y-1 text-xs backdrop-blur-xl">
                          <p className="font-bold text-slate-300">{item.date} ({item.day})</p>
                          <p className="flex items-center gap-1.5">
                            <span>Stress Level:</span>
                            <span className="font-extrabold text-teal-300">{item.stress || 'No check-in'}</span>
                          </p>
                          {item.mood && (
                            <p className="flex items-center gap-1.5">
                              <span>Mood:</span>
                              <span className="capitalize text-indigo-300 font-semibold">{item.mood}</span>
                            </p>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="stress"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Emojis aligned under days */}
          <div className="grid grid-cols-7 pt-4 border-t border-slate-200/80 dark:border-white/10 text-center gap-1">
            {chartData.map((d, i) => (
              <div key={i} className="flex flex-col items-center p-2 rounded-xl bg-slate-100/60 dark:bg-slate-800/40 border border-slate-200/40 dark:border-white/5 transition-all hover:scale-105">
                <span className="text-xl leading-none">
                  {d.mood === 'happy' ? '😊' : d.mood === 'neutral' ? '😐' : d.mood === 'sad' ? '😔' : '—'}
                </span>
                <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mt-1">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Wellness Summary & Insights */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-2 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base md:text-lg">Personal Insights</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Gentle, private telemetry patterns to support your daily balance.
            </p>

            <div className="space-y-3">
              {insights && insights.length > 0 ? (
                insights.map((ins, i) => (
                  <div key={i} className="p-3.5 glass-panel-subtle rounded-2xl text-xs text-slate-700 dark:text-slate-200 leading-relaxed flex items-start gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-teal-400 mt-1.5 shrink-0" />
                    <span>{ins}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic p-3">
                  Log daily check-ins to generate personal telemetry insights.
                </p>
              )}
            </div>
          </div>

          {/* Gentle Wellness Care Box */}
          <div className="p-4.5 rounded-2xl bg-teal-500/10 dark:bg-teal-950/40 border border-teal-500/20">
            <div className="flex items-center gap-2 text-teal-800 dark:text-teal-300 font-bold text-xs mb-2.5">
              <Heart className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>{isHighStress ? 'High-Stress Gentle Wellness Care' : 'Daily Wellness Recommendations'}</span>
            </div>
            <ul className="text-xs text-teal-900/80 dark:text-teal-200/80 space-y-1.5 leading-relaxed">
              <li>• Take a 5-minute pause away from screens</li>
              <li>• Practice the 60-second breathing exercise</li>
              <li>• Drink a glass of fresh water & take a slow walk</li>
              <li>• Break complex coursework into small 20-minute sprints</li>
              <li>• Reach out to your assigned faculty mentor or peers</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. Interactive Bottom Feature Row (Breathing Studio & Mentor Support) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mindful 60s Breathing Studio Teaser */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 font-bold text-xs">
                <Wind className="w-4 h-4 animate-spin-slow" />
                <span>MINDFUL PROTOCOL</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 text-[10px] font-bold">
                Box Breathing (4-4-4-4)
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              60-Second Vagus Nerve Reset
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Physiological sigh and box breathing clinically stimulates the parasympathetic nervous system to reduce heart rate variability and acute stress in under one minute.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-500 animate-pulse">
                <Wind className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Guided Visual Audio</span>
                <span className="text-[10px] text-slate-400">4 Cycles • Inhale / Hold / Exhale</span>
              </div>
            </div>
            <button
              onClick={onOpenBreathing}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-105 cursor-pointer"
            >
              Begin Session
            </button>
          </div>
        </div>

        {/* Faculty Mentor Pastoral Connection */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>CONFIDENTIAL FACULTY CARE</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Advisory Active</span>
              </span>
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Faculty Mentor Connection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
              Your assigned faculty mentor is trained to provide gentle, non-judgmental guidance. Student reflection notes remain private; mentors only receive trend alerts to offer timely support.
            </p>
          </div>

          <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-500 font-black text-sm">
                👨‍🏫
              </div>
              <div className="text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">Dr. Aris Thorne</span>
                <span className="text-[10px] text-slate-400">Department of Computer Science</span>
              </div>
            </div>
            <span className="text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
              Office Hours: Mon/Wed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
