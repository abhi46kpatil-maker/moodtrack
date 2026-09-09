import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { ShieldAlert, CheckCircle2, Clock, Calendar, Lock, X, Check } from 'lucide-react';

export function MentorAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Needs Review');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAlerts = async () => {
    try {
      const res = await api.get(`/mentor/alerts?status=${filterStatus === 'all' ? '' : filterStatus}`);
      setAlerts(res.alerts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus]);

  const handleReviewSubmit = async () => {
    if (!selectedAlert) return;
    setSubmitting(true);
    try {
      await api.post(`/mentor/alerts/${selectedAlert.id}/review`, { reviewNotes });
      setSelectedAlert(null);
      setReviewNotes('');
      fetchAlerts();
    } catch (e) {
      alert(e.message || 'Failed to review alert.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-600" />
            <span>Students Needing Attention</span>
          </h2>
          <p className="text-xs text-slate-500">
            Automatically generated when an assigned student records stress ≥ 4 for 3 consecutive days.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs">
          <button
            onClick={() => setFilterStatus('Needs Review')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'Needs Review'
                ? 'bg-rose-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setFilterStatus('Reviewed')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'Reviewed'
                ? 'bg-emerald-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Reviewed
          </button>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Alerts
          </button>
        </div>
      </div>

      {/* Alerts Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <div className="h-44 bg-slate-200 rounded-3xl" />
          <div className="h-44 bg-slate-200 rounded-3xl" />
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 border border-slate-200 text-center text-slate-400">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-500 opacity-80" />
          <h3 className="font-bold text-slate-700 text-base mb-1">
            ✓ No high-stress patterns detected among your assigned students
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Your students are currently maintaining manageable stress levels or taking adequate recovery days.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {alerts.map(alert => {
            const isPending = alert.status === 'Needs Review';
            return (
              <div
                key={alert.id}
                className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                  isPending
                    ? 'bg-rose-50/40 border-rose-200 shadow-md ring-1 ring-rose-300'
                    : 'bg-white border-slate-200 shadow-2xs opacity-90'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${isPending ? 'bg-rose-600 animate-pulse' : 'bg-emerald-500'}`} />
                        <h3 className="font-bold text-slate-900 text-base">{alert.student_name}</h3>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{alert.roll_number}</span>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      isPending ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    }`}>
                      {alert.status}
                    </span>
                  </div>

                  {/* High Stress Details Box */}
                  <div className="bg-white/80 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Period:</span>
                      <span className="font-bold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{alert.start_date} → {alert.end_date}</span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Stress Trajectory:</span>
                      <span className="font-mono font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        {alert.stress_pattern}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Consecutive Days:</span>
                      <span className="font-semibold text-slate-800">{alert.streak_length} days</span>
                    </div>
                  </div>

                  {/* Reviewed details if reviewed */}
                  {!isPending && (
                    <div className="mt-3 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs space-y-1">
                      <p className="font-semibold text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reviewed by: {alert.reviewed_by_name || 'Assigned Mentor'}</span>
                      </p>
                      {alert.review_notes && (
                        <p className="text-slate-600 italic">"{alert.review_notes}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Review Action Button */}
                {isPending && (
                  <div className="mt-5 pt-3 border-t border-rose-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Non-intrusive support recommended</span>
                    <button
                      onClick={() => setSelectedAlert(alert)}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark as Reviewed</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Dialog Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Record Mentor Review</h3>
                <p className="text-xs text-slate-500">{selectedAlert.student_name} ({selectedAlert.roll_number})</p>
              </div>
              <button
                onClick={() => setSelectedAlert(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">
                <span className="font-bold block mb-0.5">High Stress Pattern: {selectedAlert.stress_pattern}</span>
                <span>{selectedAlert.streak_length} consecutive calendar days ({selectedAlert.start_date} to {selectedAlert.end_date})</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Mentor Action / Wellness Notes (Optional):
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g., Scheduled brief check-in during office hours, discussed exam prep schedule, offered resource guide..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none text-xs resize-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-[11px] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Mentors cannot see student private diary notes per strict privacy protocol.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={submitting}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50"
              >
                {submitting ? 'Saving...' : 'Confirm Reviewed'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
