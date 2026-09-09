import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { CalendarRange, Plus, Trash2, Calendar, Info, X } from 'lucide-react';

export function AcademicPeriods() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    period_type: 'exam',
    start_date: '',
    end_date: '',
    description: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPeriods = async () => {
    try {
      const res = await api.get('/admin/academic-periods');
      setPeriods(res.periods || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/academic-periods', formData);
      setIsAddOpen(false);
      setFormData({
        title: '',
        period_type: 'exam',
        start_date: '',
        end_date: '',
        description: ''
      });
      fetchPeriods();
    } catch (err) {
      alert(err.message || 'Failed to create academic period.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this academic period?')) return;
    try {
      await api.delete(`/admin/academic-periods/${id}`);
      fetchPeriods();
    } catch (e) {
      alert(e.message || 'Failed to delete period.');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <CalendarRange className="w-6 h-6 text-purple-600" />
            <span>Academic Periods & Stress Context</span>
          </h2>
          <p className="text-xs text-slate-500">
            Schedule exams, internal assessments, and project deadlines to provide situational timeline context.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Period</span>
        </button>
      </div>

      {/* Contextual Notice */}
      <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-slate-800">Contextual Interpretation Principle</p>
          <p className="mt-0.5 leading-relaxed text-slate-600">
            Academic periods provide visual benchmarks on heatmaps and stress charts. They must be treated as context only and not assumed to be the sole causal factor behind student stress fluctuations.
          </p>
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
        ) : periods.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 border border-slate-200 text-center text-slate-400">
            <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30 stroke-1" />
            <p className="text-sm">No academic periods scheduled.</p>
          </div>
        ) : (
          periods.map(p => {
            const typeLabels = {
              exam: { label: 'Examination Week', color: 'bg-rose-50 text-rose-700 border-rose-200' },
              internal_assessment: { label: 'Internal Assessment', color: 'bg-amber-50 text-amber-700 border-amber-200' },
              assignment_deadline: { label: 'Project / Assignment Deadline', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
              event: { label: 'College Event', color: 'bg-teal-50 text-teal-700 border-teal-200' }
            };
            const config = typeLabels[p.period_type] || typeLabels.event;

            return (
              <div key={p.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.color}`}>
                      {config.label}
                    </span>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete period"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1">{p.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{p.description || 'No additional description provided.'}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{p.start_date} → {p.end_date}</span>
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Schedule Academic Period</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Period Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Final Semester Examinations"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Period Type</label>
                <select
                  value={formData.period_type}
                  onChange={(e) => setFormData({ ...formData, period_type: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="exam">Examination Week</option>
                  <option value="internal_assessment">Internal Assessment</option>
                  <option value="assignment_deadline">Assignment / Capstone Deadline</option>
                  <option value="event">Major College Event</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Contextual Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Short note about the evaluation format or departmental scope..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Scheduling...' : 'Schedule Period'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
