import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Lock, Calendar, X, Info, Sparkles } from 'lucide-react';
import { StressBadge, getStressConfig } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function PersonalHeatmap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    api.get('/student/heatmap?days=45')
      .then(res => setData(res))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-8 max-w-5xl mx-auto h-64 bg-slate-200 rounded-2xl animate-pulse" />;
  }

  const checkins = data?.checkins || [];
  const academicPeriods = data?.academicPeriods || [];

  const checkinMap = {};
  checkins.forEach(c => { checkinMap[c.date] = c; });

  // Generate 35 days calendar grid
  const daysList = [];
  const today = new Date();
  for (let i = 34; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Check if within any academic period
    const activePeriod = academicPeriods.find(p => dateStr >= p.start_date && dateStr <= p.end_date);

    daysList.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()],
      monthName: d.toLocaleString('default', { month: 'short' }),
      checkin: checkinMap[dateStr] || null,
      academicPeriod: activePeriod || null
    });
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            <span>Personal Stress Heatmap</span>
          </h2>
          <p className="text-xs text-slate-500">
            Interactive visual history of your daily stress intensity over the past 35 days.
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

      {/* Academic Periods Context Alert */}
      {academicPeriods.length > 0 && (
        <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            Contextual Academic Periods shown on timeline (e.g. Midterms). Used only as situational context.
          </span>
        </div>
      )}

      {/* Calendar Heatmap Grid */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
        <div className="grid grid-cols-7 gap-2.5">
          {daysList.map((day, idx) => {
            const checkin = day.checkin;
            const stress = checkin ? checkin.stress_level : null;

            let cellBg = 'bg-slate-100 border-slate-200 text-slate-400';
            if (stress === 1 || stress === 2) cellBg = 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:ring-2 hover:ring-emerald-400';
            else if (stress === 3) cellBg = 'bg-amber-100 border-amber-300 text-amber-800 hover:ring-2 hover:ring-amber-400';
            else if (stress === 4) cellBg = 'bg-orange-200 border-orange-400 text-orange-900 hover:ring-2 hover:ring-orange-500';
            else if (stress === 5) cellBg = 'bg-rose-200 border-rose-400 text-rose-900 hover:ring-2 hover:ring-rose-500';

            return (
              <button
                key={idx}
                onClick={() => checkin && setSelectedDay(checkin)}
                disabled={!checkin}
                className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between h-24 ${cellBg} ${
                  checkin ? 'cursor-pointer shadow-2xs hover:scale-102' : 'cursor-default opacity-60'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-bold">
                    {day.monthName} {day.dayNum}
                  </span>
                  {checkin?.mood && (
                    <span className="text-sm">
                      {checkin.mood === 'happy' ? '😊' : checkin.mood === 'neutral' ? '😐' : '😔'}
                    </span>
                  )}
                </div>

                {day.academicPeriod && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-600 text-white rounded-md truncate w-full">
                    {day.academicPeriod.title}
                  </span>
                )}

                <div className="flex items-center justify-between w-full mt-1">
                  <span className="text-[10px] text-slate-500">{day.dayName}</span>
                  {stress ? (
                    <span className="text-xs font-extrabold px-1.5 py-0.5 rounded-full bg-white/70">
                      {stress}/5
                    </span>
                  ) : (
                    <span className="text-[10px] italic text-slate-400">No log</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                Check-in Details: {selectedDay.date}
              </h3>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Recorded Mood:</span>
                <MoodBadge mood={selectedDay.mood} size="md" />
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                <span className="font-semibold text-slate-600">Recorded Stress Level:</span>
                <StressBadge level={selectedDay.stress_level} size="md" />
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Private Note (Visible ONLY to you):</span>
                </div>
                {selectedDay.private_note ? (
                  <p className="p-3 bg-emerald-50/50 border border-emerald-200 rounded-xl text-slate-700 italic leading-relaxed">
                    "{selectedDay.private_note}"
                  </p>
                ) : (
                  <p className="text-slate-400 italic">No private note written for this day.</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedDay(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-medium text-xs hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
