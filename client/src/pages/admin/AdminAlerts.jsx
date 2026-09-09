import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ShieldAlert, CheckCircle2, Calendar, Users, Filter, Search } from 'lucide-react';

export function AdminAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [mentorFilter, setMentorFilter] = useState('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (mentorFilter) params.append('mentorId', mentorFilter);

      const [aRes, mRes] = await Promise.all([
        api.get(`/admin/alerts?${params.toString()}`),
        api.get('/admin/mentors')
      ]);

      setAlerts(aRes.alerts || []);
      setMentors(mRes.mentors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [statusFilter, mentorFilter]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>College-Wide High-Stress Alerts</span>
          </h2>
          <p className="text-xs text-slate-500">
            Monitor all automatic 3-day consecutive high-stress detections across departments and faculty mentors.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Alert Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="Needs Review">Needs Review</option>
              <option value="Reviewed">Reviewed</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Filter by Mentor:</span>
            <select
              value={mentorFilter}
              onChange={(e) => setMentorFilter(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
            >
              <option value="">All Mentors</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
              ))}
            </select>
          </div>
        </div>

        <span className="text-xs text-slate-400">
          Showing {alerts.length} total alerts
        </span>
      </div>

      {/* Alerts Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="h-40 bg-slate-200 rounded-3xl animate-pulse col-span-2" />
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center text-slate-400 col-span-2">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-80" />
            <h3 className="font-bold text-slate-700 text-base mb-1">
              ✓ No high-stress patterns found
            </h3>
            <p className="text-xs text-slate-500">No student alerts match the selected criteria.</p>
          </div>
        ) : (
          alerts.map(a => {
            const isPending = a.status === 'Needs Review';
            return (
              <div
                key={a.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isPending
                    ? 'bg-rose-50/40 border-rose-200 shadow-sm ring-1 ring-rose-300'
                    : 'bg-white border-slate-200 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isPending ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'}`} />
                        <h3 className="font-bold text-slate-900 text-base">{a.student_name}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{a.roll_number} • {a.department}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isPending ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {a.status}
                    </span>
                  </div>

                  <div className="bg-white/90 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Assigned Mentor:</span>
                      <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200">
                        {a.mentor_name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Detection Period:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.start_date} → {a.end_date}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Stress Trajectory:</span>
                      <span className="font-mono font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {a.stress_pattern}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Consecutive Days:</span>
                      <span className="font-semibold text-slate-800">{a.streak_length} days</span>
                    </div>
                  </div>

                  {!isPending && (
                    <div className="mt-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 text-xs space-y-1">
                      <p className="font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reviewed: {a.reviewed_at ? new Date(a.reviewed_at).toLocaleDateString() : 'Yes'}</span>
                      </p>
                      {a.review_notes && (
                        <p className="text-slate-600 italic">"{a.review_notes}"</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
