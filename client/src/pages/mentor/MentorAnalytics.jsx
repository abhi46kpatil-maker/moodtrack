import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { BarChart3, Users, CalendarCheck, ShieldAlert, CheckCircle2, Lock } from 'lucide-react';
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

export function MentorAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/mentor/dashboard')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-6xl mx-auto h-64 bg-slate-200 rounded-3xl animate-pulse" />;
  }

  const { metrics, students = [] } = data || {};

  // Compute mood & stress distribution for assigned students
  const stressCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const moodCounts = { happy: 0, neutral: 0, sad: 0 };

  students.forEach(s => {
    if (s.currentStress && stressCounts[s.currentStress] !== undefined) {
      stressCounts[s.currentStress]++;
    }
    if (s.latestMood && moodCounts[s.latestMood] !== undefined) {
      moodCounts[s.latestMood]++;
    }
  });

  const stressChartData = [
    { level: '1 - Very Low', count: stressCounts[1], fill: '#10B981' },
    { level: '2 - Low', count: stressCounts[2], fill: '#14B8A6' },
    { level: '3 - Moderate', count: stressCounts[3], fill: '#F59E0B' },
    { level: '4 - High', count: stressCounts[4], fill: '#F97316' },
    { level: '5 - Very High', count: stressCounts[5], fill: '#EF4444' }
  ];

  const moodChartData = [
    { name: 'Happy 😊', value: moodCounts.happy, color: '#10B981' },
    { name: 'Neutral 😐', value: moodCounts.neutral, color: '#F59E0B' },
    { name: 'Sad 😔', value: moodCounts.sad, color: '#EF4444' }
  ];

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-indigo-600" />
            <span>Assigned Cohort Analytics</span>
          </h2>
          <p className="text-xs text-slate-500">
            Wellness and check-in trends across your assigned student mentees.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Strict Privacy: Cohort aggregates without private notes</span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Total Mentees
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{metrics?.totalAssigned || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Weekly Check-ins
          </span>
          <span className="text-3xl font-extrabold text-slate-800">{metrics?.weeklyCheckins || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block mb-1">
            Active Alerts
          </span>
          <span className="text-3xl font-extrabold text-rose-700">{metrics?.activeAlerts || 0}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Reviewed Alerts
          </span>
          <span className="text-3xl font-extrabold text-emerald-700">{metrics?.reviewedAlerts || 0}</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Mentee Stress Level Breakdown</h3>
            <p className="text-xs text-slate-400">Current stress distribution among assigned students</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stressChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {stressChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Mentee Mood Sentiment</h3>
            <p className="text-xs text-slate-400">Latest recorded feelings in cohort</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={moodChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={45}
                  paddingAngle={5}
                >
                  {moodChartData.map((entry, index) => (
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
