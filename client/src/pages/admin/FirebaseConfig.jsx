import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Database, CheckCircle2, ShieldCheck, Zap, Key, Globe, AlertCircle } from 'lucide-react';

export function FirebaseConfig() {
  const [config, setConfig] = useState({
    databaseURL: '',
    apiKey: '',
    projectId: ''
  });
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await api.post('/admin/firebase-config', config);
      setIsLive(Boolean(res.config?.databaseURL));
      setSuccessMsg('Firebase Realtime Database configuration saved successfully!');
    } catch (err) {
      alert(err.message || 'Failed to save configuration.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Database className="w-6 h-6 text-purple-600" />
          <span>Firebase Realtime Database Settings</span>
        </h2>
        <p className="text-xs text-slate-500">
          Connect your Google Cloud / Firebase Realtime Database instance. Zero SQLite is involved.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Connection Status Card */}
      <div className={`rounded-3xl p-6 border shadow-sm flex items-start gap-4 ${
        isLive ? 'bg-emerald-50/70 border-emerald-200' : 'bg-indigo-50/70 border-indigo-200'
      }`}>
        <div className={`p-3 rounded-2xl ${isLive ? 'bg-emerald-500 text-white' : 'bg-indigo-600 text-white'}`}>
          <Zap className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900 text-sm">
            {isLive ? 'Live Firebase Realtime Database Connected' : 'Firebase Ready Store Active (Zero SQLite)'}
          </h3>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            {isLive
              ? `Connected to remote Firebase endpoint: ${config.databaseURL}. Writes and reads are synced to Firebase.`
              : 'The application is running with the native Firebase Realtime Database adapter and zero SQLite. You can provide your Firebase credentials below at any time to sync live.'}
          </p>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-md space-y-6">
        <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">
          Firebase API Connection Details
        </h3>

        <div>
          <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 mb-1.5">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Firebase Database URL (e.g., https://your-app-default-rtdb.firebaseio.com)</span>
          </label>
          <input
            type="url"
            value={config.databaseURL || ''}
            onChange={(e) => setConfig({ ...config, databaseURL: e.target.value })}
            placeholder="https://moodtrack-default-rtdb.firebaseio.com"
            className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 mb-1.5">
              <Key className="w-4 h-4 text-slate-400" />
              <span>Firebase Web API Key (Optional / Auth Token)</span>
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
            <label className="font-semibold text-slate-700 text-xs flex items-center gap-1.5 mb-1.5">
              <Database className="w-4 h-4 text-slate-400" />
              <span>Project ID (Optional)</span>
            </label>
            <input
              type="text"
              value={config.projectId || ''}
              onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
              placeholder="moodtrack-college-prod"
              className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 outline-none font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <span className="text-[11px] text-slate-400">
            Changes will take effect across the server immediately.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-xs disabled:opacity-50 transition-colors"
          >
            {saving ? 'Connecting...' : 'Save & Connect Firebase'}
          </button>
        </div>
      </form>
    </div>
  );
}
