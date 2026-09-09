import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { GraduationCap, UserPlus, Search, Edit2, X, Power, Users } from 'lucide-react';

export function MentorsManagement() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    department: 'Computer Science & Engineering',
    title: 'Assistant Professor'
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchMentors = async () => {
    try {
      const res = await api.get('/admin/mentors');
      setMentors(res.mentors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/mentors', formData);
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        department: 'Computer Science & Engineering',
        title: 'Assistant Professor'
      });
      fetchMentors();
    } catch (err) {
      alert(err.message || 'Failed to add mentor.');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = mentors.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-purple-600" />
            <span>Faculty Mentor Directory</span>
          </h2>
          <p className="text-xs text-slate-500">
            Certified mentors providing pastoral care and academic stress intervention.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Mentor</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mentors by name or department..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filtered.length} of {mentors.length} mentors
        </span>
      </div>

      {/* Mentors Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Mentor Name</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Academic Title</th>
                  <th className="py-3.5 px-6">Assigned Mentees</th>
                  <th className="py-3.5 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      <div>
                        <span>{m.name}</span>
                        <span className="block text-[10px] text-slate-400">{m.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-600">{m.department}</td>
                    <td className="py-4 px-6 text-slate-600">{m.title}</td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        <Users className="w-3.5 h-3.5" />
                        <span>{m.student_count || 0} students</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        m.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{m.is_active ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Mentor Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Faculty Mentor</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name & Honorific</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Nathan Cross"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="faculty@moodtrack.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Electrical & Electronics">Electrical & Electronics</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Associate Professor & Student Advisor"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
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
                  {submitting ? 'Creating...' : 'Create Mentor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
