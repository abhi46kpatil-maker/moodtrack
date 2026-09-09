import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Grid, Lock, Filter, Calendar, X, Sparkles, Info } from 'lucide-react';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function CollegeHeatmap() {
  const [data, setData] = useState(null);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedMentor, setSelectedMentor] = useState('');
  const [minStress, setMinStress] = useState('');
  const [inspectCell, setInspectCell] = useState(null);

  const fetchHeatmap = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('days', '14');
      if (selectedMentor) params.append('mentorId', selectedMentor);
      if (minStress) params.append('minStress', minStress);

      const [hRes, mRes] = await Promise.all([
        api.get(`/admin/heatmap?${params.toString()}`),
        api.get('/admin/mentors')
      ]);

      setData(hRes);
      setMentors(mRes.mentors || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmap();
  }, [selectedMentor, minStress]);

  const { dates = [], rows = [], academicPeriods = [] } = data || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-purple-600" />
            <span>College-Wide Stress Heatmap</span>
          </h2>
          <p className="text-xs text-slate-500">
            Institutional overview of daily student stress intensities across departments.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs bg-white p-2 rounded-xl border border-slate-200">
          <span className="text-[11px] text-slate-400 font-semibold uppercase mr-1">Intensity:</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-emerald-400" /> 1–2 Low</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-amber-400" /> 3 Moderate</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-orange-500" /> 4 High</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-md bg-rose-500" /> 5 Very High</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Filter by Mentor:</span>
            <select
              value={selectedMentor}
              onChange={(e) => setSelectedMentor(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
            >
              <option value="">All Mentors</option>
              {mentors.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.department})</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Min Stress:</span>
            <select
              value={minStress}
              onChange={(e) => setMinStress(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
            >
              <option value="">Any Stress</option>
              <option value="3">≥ 3 (Moderate & Above)</option>
              <option value="4">≥ 4 (High & Very High)</option>
              <option value="5">5 (Very High Only)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Student private notes remain confidential & excluded</span>
        </div>
      </div>

      {/* Academic Periods Context */}
      {academicPeriods.length > 0 && (
        <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-600 shrink-0" />
          <span>
            Active Context Periods: {academicPeriods.map(p => `${p.title} (${p.start_date} to ${p.end_date})`).join(' • ')}
          </span>
        </div>
      )}

      {/* Heatmap Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm">No student records match the selected filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[200px] bg-white sticky left-0 z-10">
                    Student / Mentor
                  </th>
                  {dates.map(date => {
                    const d = new Date(date);
                    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                    const dayNum = d.getDate();
                    const month = d.toLocaleString('default', { month: 'short' });
                    const period = academicPeriods.find(p => date >= p.start_date && date <= p.end_date);

                    return (
                      <th key={date} className="py-2 px-1 text-[11px] text-slate-500 font-medium min-w-[48px]">
                        {period && (
                          <div className="h-1.5 w-full bg-purple-600 rounded-full mb-1" title={period.title} />
                        )}
                        <span className="block font-bold text-slate-700">{month} {dayNum}</span>
                        <span className="text-[10px] text-slate-400 block">{dayName}</span>
                      </th>
                    );
                  })}
                  <th className="py-3 px-3 text-xs font-bold text-slate-600 uppercase min-w-[70px]">
                    Avg
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(row => (
                  <tr key={row.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="text-left py-3.5 px-4 font-semibold text-xs text-slate-800 bg-white sticky left-0 z-10 whitespace-nowrap shadow-xs">
                      <div>
                        <span>{row.name}</span>
                        <span className="block text-[10px] text-purple-600">Mentor: {row.assigned_mentor}</span>
                      </div>
                    </td>

                    {row.dailyData.map((cell, cIdx) => {
                      const stress = cell.stress;
                      let colorClass = 'bg-slate-100 text-slate-300';

                      if (stress === 1 || stress === 2) colorClass = 'bg-emerald-400 text-white font-bold';
                      else if (stress === 3) colorClass = 'bg-amber-400 text-slate-900 font-bold';
                      else if (stress === 4) colorClass = 'bg-orange-500 text-white font-bold ring-1 ring-orange-300';
                      else if (stress === 5) colorClass = 'bg-rose-500 text-white font-extrabold ring-2 ring-rose-400 animate-pulse';

                      return (
                        <td key={cIdx} className="p-1">
                          <button
                            onClick={() => stress !== null && setInspectCell({ ...cell, studentName: row.name, rollNumber: row.roll_number })}
                            disabled={stress === null}
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs transition-all mx-auto ${colorClass} ${
                              stress !== null ? 'cursor-pointer hover:scale-110 shadow-2xs' : 'cursor-default'
                            }`}
                            title={stress !== null ? `Stress: ${stress}/5, Mood: ${cell.mood}` : 'No check-in'}
                          >
                            {stress !== null ? stress : '·'}
                          </button>
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-xs font-bold text-slate-700">
                      {row.avgStress ? `${row.avgStress}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Cell Modal */}
      {inspectCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{inspectCell.studentName}</h3>
                <p className="text-[11px] text-slate-400">{inspectCell.rollNumber} • {inspectCell.date}</p>
              </div>
              <button
                onClick={() => setInspectCell(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="font-semibold text-slate-600">Recorded Mood:</span>
                <MoodBadge mood={inspectCell.mood} size="md" />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <span className="font-semibold text-slate-600">Stress Intensity:</span>
                <StressBadge level={inspectCell.stress} size="md" />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
                <span>Student private note is strictly private and never exposed to administrators.</span>
              </div>
            </div>

            <button
              onClick={() => setInspectCell(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
