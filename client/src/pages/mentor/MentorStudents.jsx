import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import {
  Users,
  Search,
  Filter,
  Lock,
  CheckCircle2,
  ShieldAlert,
  UserPlus,
  X,
  AlertCircle,
  Sparkles,
  BookOpen,
  Calendar,
  Key
} from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function MentorStudents({ onNavigateToHeatmap }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Add Student Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roll_number: '',
    department: 'Computer Science & Engineering',
    year_of_study: 1,
    password: 'password123'
  });

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter) params.append('statusFilter', statusFilter);

      const res = await api.get(`/mentor/students?${params.toString()}`);
      setStudents(res.students || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents();
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    setModalError('');
    setSubmitting(true);

    try {
      const res = await api.post('/mentor/students', formData);
      setSuccessBanner(res.message || `Student ${formData.name} added to your mentee roster!`);
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        roll_number: '',
        department: 'Computer Science & Engineering',
        year_of_study: 1,
        password: 'password123'
      });
      fetchStudents();
      setTimeout(() => setSuccessBanner(''), 6000);
    } catch (err) {
      setModalError(err.message || 'Failed to add student.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>My Assigned Students</span>
          </h2>
          <p className="text-xs text-slate-500">
            Confidential directory of your mentee cohort.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student</span>
          </button>

          <button
            onClick={onNavigateToHeatmap}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
          >
            View Cohort Heatmap
          </button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{successBanner}</span>
          </div>
          <button onClick={() => setSuccessBanner('')} className="text-emerald-600 hover:text-emerald-800 text-sm">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={handleSearch} className="flex-1 min-w-[240px] flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name or roll number..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-semibold">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pattern">🔴 High-Stress Pattern</option>
            <option value="high">🟠 High Stress</option>
            <option value="warning">🟡 Moderate / Warning</option>
            <option value="normal">🟢 Normal</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-30 stroke-1" />
            <p className="text-sm">No students match your query.</p>
            <button
              onClick={() => setIsAddOpen(true)}
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-semibold transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add your first mentee student</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Year</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Current Stress</th>
                  <th className="py-3.5 px-6">Latest Mood</th>
                  <th className="py-3.5 px-6">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">{s.roll_number}</td>
                    <td className="py-4 px-6 text-slate-600">{s.department}</td>
                    <td className="py-4 px-6 text-slate-600">Year {s.year_of_study}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={s.status} label={s.statusLabel} />
                    </td>
                    <td className="py-4 px-6">
                      <StressBadge level={s.currentStress} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <MoodBadge mood={s.latestMood} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-500">{s.latestDate || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Enroll New Mentee Student</h3>
                  <p className="text-[11px] text-slate-500">Student will be automatically assigned to your mentee roster.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Chen"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Institutional Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@college.edu"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Roll / Student ID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    placeholder="e.g. 2024-CS-088"
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  >
                    <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Biotechnology">Biotechnology</option>
                    <option value="Business Administration">Business Administration</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year of Study</label>
                  <select
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({ ...formData, year_of_study: parseInt(e.target.value, 10) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Senior)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Initial Password</span>
                  <span className="text-[10px] text-slate-400 font-normal">Student can change upon login</span>
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="password123"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                <Lock className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  This student's daily mood & stress ratings will be visible in your cohort dashboard. Private text notes remain strictly confidential to the student.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {submitting ? 'Enrolling Student...' : 'Enroll & Assign Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
