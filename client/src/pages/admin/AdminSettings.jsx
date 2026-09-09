import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Settings, Database, ShieldCheck, Globe, Key, CheckCircle2, Zap, Lock } from 'lucide-react';

export function AdminSettings() {
  const [config, setConfig] = useState({
    databaseURL: '',
    apiKey: '',
    projectId: ''
  });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Platform preference states
  const [institutionName, setInstitutionName] = useState('Metro Institute of Technology');
  const [stressThresholdDays, setStressThresholdDays] = useState(3);
  const [stressLevelTrigger, setStressLevelTrigger] = useState(4);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/admin/firebase-config');
      if (res.config) setConfig(res.config);
      setIsLive(Boolean(res.isLive));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleSaveFirebase = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/admin/firebase-config', config);
      setIsLive(Boolean(res.config?.databaseURL));
      setSuccessMsg('Firebase Realtime Database connection settings updated successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600" />
          <span>Platform Settings & Database Configuration</span>
        </h2>
        <p className="text-xs text-slate-500">
          Manage system thresholds, privacy enforcement, and Firebase Realtime Database integration.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Section 1: Firebase Realtime Database Integration */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Firebase Realtime Database Integration</h3>
              <p className="text-xs text-slate-400">Zero SQLite. Seamless cloud or local JSON sync.</p>
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            isLive ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-indigo-100 text-indigo-800 border border-indigo-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
            <span>{isLive ? 'Live Firebase Connected' : 'Firebase Ready Adapter Active'}</span>
          </span>
        </div>

        <form onSubmit={handleSaveFirebase} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Firebase Database URL (e.g. https://your-project-default-rtdb.firebaseio.com)</span>
            </label>
            <input
              type="url"
              value={config.databaseURL || ''}
              onChange={(e) => setConfig({ ...config, databaseURL: e.target.value })}
              placeholder="https://moodtrack-college-default-rtdb.firebaseio.com"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Key className="w-4 h-4 text-slate-400" />
                <span>Web API Key</span>
              </label>
              <input
                type="text"
                value={config.apiKey || ''}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Project ID</span>
              </label>
              <input
                type="text"
                value={config.projectId || ''}
                onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                placeholder="stress-f5bf3"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-slate-400" />
                <span>Auth Domain</span>
              </label>
              <input
                type="text"
                value={config.authDomain || ''}
                onChange={(e) => setConfig({ ...config, authDomain: e.target.value })}
                placeholder="stress-f5bf3.firebaseapp.com"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-slate-400" />
                <span>Storage Bucket</span>
              </label>
              <input
                type="text"
                value={config.storageBucket || ''}
                onChange={(e) => setConfig({ ...config, storageBucket: e.target.value })}
                placeholder="stress-f5bf3.firebasestorage.app"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-slate-400" />
                <span>App ID</span>
              </label>
              <input
                type="text"
                value={config.appId || ''}
                onChange={(e) => setConfig({ ...config, appId: e.target.value })}
                placeholder="1:609097876784:web:e30a0a9be6d27b65f634f5"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-slate-400" />
                <span>Measurement ID (Analytics)</span>
              </label>
              <input
                type="text"
                value={config.measurementId || ''}
                onChange={(e) => setConfig({ ...config, measurementId: e.target.value })}
                placeholder="G-QSTEQP5ZKB"
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-100">
            <span className="text-[11px] text-slate-400">
              When provided, data reads & writes automatically sync with your Firebase Realtime Database.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-xs disabled:opacity-50"
            >
              {saving ? 'Connecting...' : 'Save Firebase Credentials'}
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Platform & Early Stress Detection Rules */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">High-Stress Detection Engine Parameters</h3>
            <p className="text-xs text-slate-400">Core algorithm specification required by college policy</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Consecutive Calendar Days Threshold</span>
            <p className="text-slate-500 mb-2">Number of uninterrupted days required to flag pattern.</p>
            <span className="text-lg font-bold text-indigo-600">3 Consecutive Days</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <span className="font-bold text-slate-800 block mb-1">Minimum Stress Rating</span>
            <p className="text-slate-500 mb-2">Threshold for high-stress classification.</p>
            <span className="text-lg font-bold text-indigo-600">Stress ≥ 4 (High or Very High)</span>
          </div>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2.5 mt-2">
          <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5">Strict Privacy Architecture Active</span>
            <p className="text-emerald-700 leading-relaxed">
              Student private notes are restricted at the query and adapter layer. Private notes are only returned when the authenticated student requests their own record. Mentors and administrators cannot access private text notes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
