import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Grid, Lock, Info, X, ShieldAlert, Sparkles } from 'lucide-react';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function MentorHeatmap() {
  const [heatmapData, setHeatmapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inspectCell, setInspectCell] = useState(null);

  useEffect(() => {
    api.get('/mentor/heatmap?days=14')
      .then(res => setHeatmapData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-7xl mx-auto h-64 bg-slate-200 rounded-3xl animate-pulse" />;
  }

  const { dates = [], rows = [], academicPeriods = [] } = heatmapData || {};

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Grid className="w-6 h-6 text-indigo-600" />
            <span>Mentor Stress Heatmap (Assigned Students)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Multi-student stress intensity matrix across the past 14 calendar dates.
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

      {/* Strict Privacy Reminder */}
      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 font-medium">
        <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          Strict Privacy Enforced: You see daily stress ratings and moods of your assigned students. Student private notes are excluded and inaccessible.
        </span>
      </div>

      {/* Heatmap Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6">
        {rows.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-sm">No students assigned to you yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-bold text-slate-600 uppercase tracking-wider min-w-[180px] bg-white sticky left-0 z-10">
                    Assigned Student
                  </th>
                  {dates.map(date => {
                    const d = new Date(date);
                    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
                    const dayNum = d.getDate();
                    const month = d.toLocaleString('default', { month: 'short' });

                    // Period match
                    const period = academicPeriods.find(p => date >= p.start_date && date <= p.end_date);

                    return (
                      <th key={date} className="py-2 px-1 text-[11px] text-slate-500 font-medium min-w-[48px]">
                        {period && (
                          <div className="h-1.5 w-full bg-indigo-500 rounded-full mb-1" title={period.title} />
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
                        <span className="block text-[10px] font-mono text-slate-400">{row.roll_number}</span>
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

      {/* Inspect Cell Dialog */}
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
                <span>Student private note is kept strictly confidential to the student per privacy policy.</span>
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
