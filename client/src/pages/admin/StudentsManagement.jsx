import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Users, UserPlus, Search, Edit2, X, Check, Power } from 'lucide-react';

export function StudentsManagement() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    roll_number: '',
    department: 'Computer Science & Engineering',
    year_of_study: 1,
    assigned_mentor_id: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [sRes, mRes] = await Promise.all([
        api.get('/admin/students'),
        api.get('/admin/mentors')
      ]);
      setStudents(sRes.students || []);
      setMentors(mRes.mentors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/admin/students', formData);
      setIsAddOpen(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        roll_number: '',
        department: 'Computer Science & Engineering',
        year_of_study: 1,
        assigned_mentor_id: ''
      });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create student.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/students/${editStudent.id}`, editStudent);
      setEditStudent(null);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update student.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (student) => {
    try {
      await api.put(`/admin/students/${student.id}`, { is_active: student.is_active ? 0 : 1 });
      fetchData();
    } catch (e) {
      alert(e.message || 'Failed to toggle status.');
    }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            <span>Student Management</span>
          </h2>
          <p className="text-xs text-slate-500">
            Enrolled student registry, enrollment status, and faculty advisors.
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Student</span>
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
            placeholder="Search students by name or roll number..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filtered.length} of {students.length}
        </span>
      </div>

      {/* Students Table */}
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
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Roll Number</th>
                  <th className="py-3.5 px-6">Department</th>
                  <th className="py-3.5 px-6">Year</th>
                  <th className="py-3.5 px-6">Assigned Mentor</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      <div>
                        <span>{s.name}</span>
                        <span className="block text-[10px] text-slate-400">{s.email}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-slate-600">{s.roll_number}</td>
                    <td className="py-4 px-6 text-slate-600">{s.department}</td>
                    <td className="py-4 px-6 text-slate-600">Year {s.year_of_study}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                        {s.assigned_mentor_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        s.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <span>{s.is_active ? 'Active' : 'Disabled'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditStudent({ ...s })}
                          className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit Student"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleStatus(s)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            s.is_active ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={s.is_active ? 'Disable Account' : 'Activate Account'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Add New Student</h3>
              <button onClick={() => setIsAddOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rachel Adams"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="student@moodtrack.edu"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  value={formData.roll_number}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  placeholder="e.g. CS2024-099"
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electrical & Electronics">EEE</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year of Study</label>
                  <select
                    value={formData.year_of_study}
                    onChange={(e) => setFormData({ ...formData, year_of_study: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assign Mentor</label>
                <select
                  value={formData.assigned_mentor_id}
                  onChange={(e) => setFormData({ ...formData, assigned_mentor_id: e.target.value })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
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
                  {submitting ? 'Creating...' : 'Create Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Edit Student</h3>
              <button onClick={() => setEditStudent(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="py-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editStudent.name}
                  onChange={(e) => setEditStudent({ ...editStudent, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Department</label>
                  <select
                    value={editStudent.department}
                    onChange={(e) => setEditStudent({ ...editStudent, department: e.target.value })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="Computer Science & Engineering">CSE</option>
                    <option value="Information Technology">IT</option>
                    <option value="Electrical & Electronics">EEE</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Year of Study</label>
                  <select
                    value={editStudent.year_of_study}
                    onChange={(e) => setEditStudent({ ...editStudent, year_of_study: parseInt(e.target.value) })}
                    className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Mentor</label>
                <select
                  value={editStudent.assigned_mentor_id || ''}
                  onChange={(e) => setEditStudent({ ...editStudent, assigned_mentor_id: e.target.value || null })}
                  className="w-full p-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="">-- Unassigned --</option>
                  {mentors.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
