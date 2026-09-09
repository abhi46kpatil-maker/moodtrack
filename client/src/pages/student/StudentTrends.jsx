import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { TrendingUp, BarChart2, Activity, Sparkles, Calendar } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

export function StudentTrends() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/dashboard')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto h-64 bg-slate-200 rounded-2xl animate-pulse" />;
  }

  const chartData = (data?.trends?.stressTrend || []).map((t, idx) => ({
    day: t.day,
    date: t.date,
    stress: t.stress,
    mood: data?.trends?.moodTrend?.[idx]?.mood || null
  }));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          <span>My Wellbeing Trends</span>
        </h2>
        <p className="text-xs text-slate-500">
          Visualize your recent stress fluctuations and identify positive routines.
        </p>
      </div>

      {/* Stress Trend Line Chart */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">7-Day Stress Trajectory</h3>
            <p className="text-xs text-slate-400">Scale from 1 (Very Low) to 5 (Very High)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
            Avg: {data?.weeklySummary?.avgStress || '—'} / 5
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-lg space-y-1">
                        <p className="font-bold text-indigo-300">{item.date} ({item.day})</p>
                        <p>Stress Level: <span className="font-extrabold text-white">{item.stress ?? 'No entry'}</span></p>
                        <p>Mood: <span className="capitalize">{item.mood || 'None'}</span></p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="stress"
                stroke="#6366f1"
                strokeWidth={3}
                dot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 8 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
