import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Search, Filter, Lock, History, FileText, Calendar, RotateCcw } from 'lucide-react';
import { StressBadge } from '../../components/common/StressBadge';
import { MoodBadge } from '../../components/common/MoodBadge';

export function StudentHistory() {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [preset, setPreset] = useState('30days');
  const [moodFilter, setMoodFilter] = useState('');
  const [stressFilter, setStressFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (preset !== 'custom') {
        params.append('preset', preset);
      } else if (startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      if (moodFilter) params.append('mood', moodFilter);
      if (stressFilter) params.append('stress', stressFilter);
      if (searchQuery) params.append('search', searchQuery);

      const res = await api.get(`/student/history?${params.toString()}`);
      setCheckins(res.checkins || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [preset, moodFilter, stressFilter, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleResetFilters = () => {
    setPreset('30days');
    setMoodFilter('');
    setStressFilter('');
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-indigo-600" />
          <span>My Check-in History</span>
        </h2>
        <p className="text-xs text-slate-500">
          Search and review your past reflections. All private notes remain confidential.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {['7days', '30days', 'month', 'custom'].map(p => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`px-3 py-1.5 rounded-lg capitalize font-medium transition-all ${
                  preset === p
                    ? 'bg-white text-indigo-600 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p === '7days' ? 'Last 7 Days' : p === '30days' ? 'Last 30 Days' : p === 'month' ? 'This Month' : 'Custom Dates'}
              </button>
            ))}
          </div>

          {/* Mood Filter */}
          <select
            value={moodFilter}
            onChange={(e) => setMoodFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
          >
            <option value="">All Moods</option>
            <option value="happy">😊 Happy</option>
            <option value="neutral">😐 Neutral</option>
            <option value="sad">😔 Sad</option>
          </select>

          {/* Stress Filter */}
          <select
            value={stressFilter}
            onChange={(e) => setStressFilter(e.target.value)}
            className="p-2 border border-slate-200 rounded-xl text-xs text-slate-700 bg-white"
          >
            <option value="">All Stress Levels</option>
            <option value="1">1 - Very Low</option>
            <option value="2">2 - Low</option>
            <option value="3">3 - Moderate</option>
            <option value="4">4 - High</option>
            <option value="5">5 - Very High</option>
          </select>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search private notes..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
            >
              Search
            </button>
          </form>

          {/* Reset */}
          <button
            onClick={handleResetFilters}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Reset Filters"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Date Inputs if preset is custom */}
        {preset === 'custom' && (
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100 text-xs">
            <span className="font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg"
            />
            <span className="font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="p-1.5 border border-slate-200 rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Check-ins Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>
        ) : checkins.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 stroke-1" />
            <h3 className="font-bold text-slate-700 text-base mb-1">No Check-in Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || moodFilter || stressFilter
                ? 'Try adjusting your filters or search terms to find matching entries.'
                : 'Start tracking your wellness. Complete your first check-in to see your trends.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6">Mood</th>
                  <th className="py-3.5 px-6">Stress Level</th>
                  <th className="py-3.5 px-6">
                    <div className="flex items-center gap-1">
                      <Lock className="w-3 h-3 text-emerald-600" />
                      <span>Private Note (Encrypted)</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {checkins.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 font-semibold text-slate-800 whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="py-4 px-6">
                      <MoodBadge mood={item.mood} size="sm" />
                    </td>
                    <td className="py-4 px-6">
                      <StressBadge level={item.stress_level} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-700 max-w-md">
                      {item.private_note ? (
                        <p className="italic bg-slate-50/80 p-2 rounded-lg border border-slate-100">
                          "{item.private_note}"
                        </p>
                      ) : (
                        <span className="text-slate-400 italic">No note added</span>
                      )}
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
