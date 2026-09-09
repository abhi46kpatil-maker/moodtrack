import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { UserCheck, Users, Search, Check, AlertCircle } from 'lucide-react';

export function MentorAssignments() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [savingId, setSavingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleAssign = async (studentId, mentorId) => {
    setSavingId(studentId);
    setSuccessMsg('');
    try {
      await api.post('/admin/assign-mentor', { studentId, mentorId: mentorId || null });
      setSuccessMsg('Mentor assignment updated successfully.');
      fetchData();
    } catch (e) {
      alert(e.message || 'Failed to update assignment.');
    } finally {
      setSavingId(null);
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.roll_number.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-purple-600" />
          <span>Mentor Assignment Center</span>
        </h2>
        <p className="text-xs text-slate-500">
          Assign or reassign students to departmental faculty mentors. Changes take effect instantly.
        </p>
      </div>

      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student by name, roll number, or dept..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
          />
        </div>
        <span className="text-xs text-slate-400">
          Showing {filteredStudents.length} of {students.length} students
        </span>
      </div>

      {/* Assignments Table */}
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
                  <th className="py-3.5 px-6">Current Assigned Mentor</th>
                  <th className="py-3.5 px-6">Assign / Reassign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {s.name}
                    </td>
                    <td className="py-4 px-6 text-slate-600 font-mono">{s.roll_number}</td>
                    <td className="py-4 px-6 text-slate-600">{s.department}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        s.assigned_mentor_id
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {s.assigned_mentor_name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <select
                        value={s.assigned_mentor_id || ''}
                        onChange={(e) => handleAssign(s.id, e.target.value)}
                        disabled={savingId === s.id}
                        className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none"
                      >
                        <option value="">-- None (Unassigned) --</option>
                        {mentors.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name} ({m.department})
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
