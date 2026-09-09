import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart3, PieChart as PieIcon, Activity, Users, ShieldAlert, CheckCircle2 } from 'lucide-react';
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

export function AdminAnalytics() {
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

  const { stats, moodDistribution = [], stressDistribution = [], mentorWorkloads = [] } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-purple-600" />
          <span>Institutional Analytics & Trends</span>
        </h2>
        <p className="text-xs text-slate-500">
          Holistic college-wide mood and stress metrics across students and departments.
        </p>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Check-ins Logged
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{stats?.totalCheckins || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            College Average Stress
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-extrabold text-slate-800">{stats?.avgStress || '—'}</span>
            <span className="text-xs text-slate-400">/ 5</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Active High-Stress Alerts
          </span>
          <span className="text-3xl font-extrabold text-rose-700">{stats?.activeAlerts || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Reviewed Alerts
          </span>
          <span className="text-3xl font-extrabold text-emerald-700">{stats?.reviewedAlerts || 0}</span>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Stress Intensity Distribution</h3>
            <p className="text-xs text-slate-400">Aggregated check-in counts per rating level</p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stressDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Overall Mood Breakdown</h3>
            <p className="text-xs text-slate-400">Anonymous emotional distribution</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={85}
                  innerRadius={50}
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
    </div>
  );
}
