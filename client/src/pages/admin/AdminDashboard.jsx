import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { useTheme } from '../../context/ThemeContext';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  ShieldAlert,
  CheckCircle2,
  Activity,
  CalendarRange,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export function AdminDashboard({ onNavigateToAssignments, onNavigateToHeatmap }) {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto h-64 bg-slate-200 rounded-3xl animate-pulse" />;
  }

  const { stats, moodDistribution = [], stressDistribution = [], mentorWorkloads = [], academicPeriods = [] } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* College Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-purple-950 to-slate-950 text-white border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-purple-500/20 via-indigo-500/10 to-transparent pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-xs text-purple-200 mb-3 backdrop-blur-md shadow-xs">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span>Institution-Wide Wellness Intelligence</span>
            <span className="opacity-40">•</span>
            <span className="text-teal-300 font-mono text-[11px]">Aggregated Anonymized</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Dean & Institutional Console</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            Monitor college-wide stress trends, oversee mentor support assignments, and schedule contextual academic periods.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToAssignments}
            className="px-5 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shimmer-sweep"
          >
            Manage Mentor Assignments
          </button>
          <button
            onClick={onNavigateToHeatmap}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          >
            Campus Stress Heatmap
          </button>
        </div>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5 md:gap-4">
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Students
            </span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalStudents || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Enrolled Total</span>
            <span className="font-semibold text-indigo-500">100% Monitored</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-bl-full pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Faculty Mentors
            </span>
            <GraduationCap className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalMentors || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Advisory Capacity</span>
            <span className="font-semibold text-purple-500">Full Staffing</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Total Check-ins
            </span>
            <CalendarCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.totalCheckins || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Aggregated Logs</span>
            <span className="font-semibold text-teal-500">Active</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 border-rose-500/30 bg-rose-500/5 dark:bg-rose-500/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/15 rounded-bl-full pointer-events-none group-hover:bg-rose-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block">
              Active Alerts (≥3d)
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats?.activeAlerts || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 flex items-center justify-between text-[10px] text-rose-500">
            <span>Sustained High-Stress</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">Intervention Pool</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Reviewed Alerts
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.reviewedAlerts || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Mentor Resolution</span>
            <span className="font-semibold text-emerald-500">✓ Addressed</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              College Avg Stress
            </span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats?.avgStress || '—'}</span>
            <span className="text-xs text-slate-400 font-medium">/ 5</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Equilibrium Index</span>
            <span className="font-semibold text-amber-500">Normal Range</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stress Distribution */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">College-Wide Stress Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Aggregate breakdown across all recorded check-ins</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'} />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900/95 dark:bg-slate-950/95 border border-white/20 text-white p-2.5 rounded-xl text-xs shadow-lg space-y-1 backdrop-blur-md">
                          <p className="font-bold text-slate-300">Stress Level {payload[0].payload.level}</p>
                          <p>Count: <span className="font-extrabold text-teal-400">{payload[0].value} check-ins</span></p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {stressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Mood Distribution */}
        <div className="glass-panel rounded-3xl p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Overall Mood Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Anonymous student emotional sentiment percentages</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mentor Workload Overview */}
      <div className="glass-panel rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Mentor Cohort Distribution</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Number of assigned students per mentor</p>
          </div>
          <button
            onClick={onNavigateToAssignments}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Reassign Students →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {mentorWorkloads.map(m => (
            <div key={m.id} className="p-4 rounded-2xl glass-panel-subtle flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-xs">{m.name}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.department}</p>
              </div>
              <span className="text-base font-extrabold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-2xs">
                {m.assignedCount} <span className="text-[10px] font-normal text-slate-400">students</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
