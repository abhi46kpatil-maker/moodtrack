import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Zap, ShieldCheck, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';

export function DemoBar() {
  const { user, demoUsers, switchDemoUser } = useAuth();

  // Find key test personas
  const alexStudent = demoUsers.find(u => u.email.includes('alex.kim'));
  const mayaStudent = demoUsers.find(u => u.email.includes('maya.lin'));
  const arisMentor = demoUsers.find(u => u.email.includes('aris.thorne'));
  const adminUser = demoUsers.find(u => u.role === 'admin');

  return (
    <div className="bg-slate-900 text-slate-200 text-xs px-4 py-2 flex flex-wrap items-center justify-between border-b border-slate-800 gap-2">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-indigo-400">
          <Zap className="w-3.5 h-3.5 fill-indigo-400" />
          <span>Demo Role Switcher:</span>
        </span>
        <span className="text-slate-400 hidden sm:inline">
          Test any role with 1-click:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {alexStudent && (
          <button
            onClick={() => switchDemoUser(alexStudent.id)}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              user?.id === alexStudent.id
                ? 'bg-rose-600 text-white font-semibold ring-1 ring-rose-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3 h-3 text-rose-300" />
            <span>Alex Kim (Student 🔴 Alert Active)</span>
          </button>
        )}

        {mayaStudent && (
          <button
            onClick={() => switchDemoUser(mayaStudent.id)}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              user?.id === mayaStudent.id
                ? 'bg-emerald-600 text-white font-semibold ring-1 ring-emerald-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-emerald-300" />
            <span>Maya Lin (Student 🟢 Thriving)</span>
          </button>
        )}

        {arisMentor && (
          <button
            onClick={() => switchDemoUser(arisMentor.id)}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              user?.id === arisMentor.id
                ? 'bg-indigo-600 text-white font-semibold ring-1 ring-indigo-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <UserCheck className="w-3 h-3 text-indigo-300" />
            <span>Dr. Aris Thorne (Mentor)</span>
          </button>
        )}

        {adminUser && (
          <button
            onClick={() => switchDemoUser(adminUser.id)}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1.5 ${
              user?.id === adminUser.id
                ? 'bg-purple-600 text-white font-semibold ring-1 ring-purple-400'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-purple-300" />
            <span>Admin (Dean Miller)</span>
          </button>
        )}
      </div>
    </div>
  );
}
