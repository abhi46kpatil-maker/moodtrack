import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Users,
  ShieldAlert,
  CheckCircle2,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function MentorDashboard({ onNavigateToAlerts, onNavigateToHeatmap, onNavigateToStudents }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/mentor/dashboard');
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
    return <div className="p-8 max-w-7xl mx-auto h-64 bg-slate-200 rounded-3xl animate-pulse" />;
  }

  const { metrics, students = [], recentAlerts = [] } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Mentor Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white border border-white/15 dark:border-white/10 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute right-0 top-0 w-96 h-full bg-radial from-indigo-500/20 via-purple-500/10 to-transparent pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-xs text-indigo-200 mb-3 backdrop-blur-md shadow-xs">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Mentor Privacy Scope: Showing Only Your Assigned Students</span>
            <span className="opacity-40">•</span>
            <span className="text-emerald-400 font-mono text-[11px]">Strict Confidentiality</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">Mentor Pastoral Care Console</h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-xl leading-relaxed">
            Identify sustained high-stress patterns early (3-day consecutive stress ≥ 4) to provide timely, compassionate academic guidance.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToAlerts}
            className="px-5 py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer shimmer-sweep"
          >
            <ShieldAlert className="w-4 h-4 animate-pulse" />
            <span>Review Active Alerts ({metrics?.activeAlerts || 0})</span>
          </button>
          <button
            onClick={onNavigateToHeatmap}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 text-slate-200 border border-white/20 rounded-2xl text-xs font-semibold backdrop-blur-md transition-all cursor-pointer hover:scale-105"
          >
            Open Campus Heatmap
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 md:gap-4">
        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Assigned Students
            </span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.totalAssigned || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Cohort Size</span>
            <span className="font-semibold text-indigo-500">Active</span>
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
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{metrics?.activeAlerts || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-rose-200/40 dark:border-rose-900/30 flex items-center justify-between text-[10px] text-rose-500">
            <span>Requires Outreach</span>
            <span className="font-semibold text-rose-600 dark:text-rose-400">Action Required</span>
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
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.reviewedAlerts || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Addressed Cases</span>
            <span className="font-semibold text-emerald-500">✓ Resolved</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-bl-full pointer-events-none group-hover:bg-teal-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Weekly Logs
            </span>
            <CalendarCheck className="w-4 h-4 text-teal-500" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{metrics?.weeklyCheckins || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Student telemetry</span>
            <span className="font-semibold text-teal-500">84% Participation</span>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl p-4 border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/15 rounded-bl-full pointer-events-none group-hover:bg-amber-500/25 transition-all" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
              Needing Attention
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{metrics?.needingAttention || 0}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/30 flex items-center justify-between text-[10px] text-amber-500">
            <span>High stress detected</span>
            <span className="font-semibold text-amber-600 dark:text-amber-400">Check-in Suggested</span>
          </div>
        </div>
      </div>

      {/* Prioritized Assigned Students List */}
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Assigned Students (Prioritized by Stress Severity)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Students with active high-stress patterns automatically float to the top of your list.
            </p>
          </div>
          {onNavigateToStudents && (
            <button
              onClick={onNavigateToStudents}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:opacity-80 flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/50 px-3.5 py-2 rounded-xl transition-colors border border-indigo-200/60 dark:border-indigo-800/40"
            >
              <span>+ Add & Manage Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-1" />
            <p className="text-sm">No students are currently assigned to you.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 dark:bg-slate-800/60 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Current Stress</th>
                  <th className="py-3.5 px-6">Latest Mood</th>
                  <th className="py-3.5 px-6">Last Logged</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-white/5">
                {students.map(s => {
                  const isPattern = s.status === 'pattern';
                  return (
                    <tr
                      key={s.id}
                      className={`transition-colors ${
                        isPattern
                          ? 'bg-rose-500/10 hover:bg-rose-500/15 font-medium'
                          : 'hover:bg-slate-100/50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200">
                            {s.name.charAt(0)}
                          </div>
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-mono">{s.roll_number}</td>
                      <td className="py-4 px-6"><StatusBadge status={s.status} /></td>
                      <td className="py-4 px-6"><StressBadge level={s.current_stress} size="sm" /></td>
                      <td className="py-4 px-6"><MoodBadge mood={s.latest_mood} size="sm" /></td>
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{s.last_logged}</td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={onNavigateToAlerts}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
