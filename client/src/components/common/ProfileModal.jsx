import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, ShieldCheck, User, GraduationCap, Building2, Mail, Hash } from 'lucide-react';

export function ProfileModal({ isOpen, onClose }) {
  const { user, student, mentor } = useAuth();
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">Account Profile</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-5 space-y-4 text-xs">
          {/* Header avatar & role */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
            <img
              src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
              alt={user.name}
              className="w-12 h-12 rounded-full border border-slate-200 object-cover bg-white"
            />
            <div>
              <h4 className="font-bold text-slate-900 text-sm">{user.name}</h4>
              <p className="text-slate-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                {user.role}
              </span>
            </div>
          </div>

          {/* Student-specific details */}
          {user.role === 'student' && student && (
            <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Roll Number:</span>
                <span className="font-mono font-bold text-slate-800">{student.roll_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> Department:</span>
                <span className="font-semibold text-slate-800">{student.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Year of Study:</span>
                <span className="font-semibold text-slate-800">Year {student.year_of_study}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Assigned Faculty Mentor:</span>
                <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-lg border border-purple-200">
                  {student.mentor_name || 'Unassigned'}
                </span>
              </div>
            </div>
          )}

          {/* Mentor-specific details */}
          {user.role === 'mentor' && mentor && (
            <div className="space-y-2 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Department:</span>
                <span className="font-semibold text-slate-800">{mentor.department}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Academic Title:</span>
                <span className="font-semibold text-slate-800">{mentor.title}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Assigned Students:</span>
                <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-200">
                  {mentor.student_count || 0} mentees
                </span>
              </div>
            </div>
          )}

          {/* Privacy Box */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] flex items-start gap-2">
            <Lock className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-600" />
            <div>
              <span className="font-bold block">Privacy-First Guarantee</span>
              <p className="text-emerald-700 mt-0.5">
                {user.role === 'student'
                  ? 'Your private notes are encrypted and only accessible by you. Mentors and administrators cannot view them.'
                  : 'You only have authorized access to non-confidential student stress metrics. Private student notes are never exposed.'}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
        >
          Close Profile
        </button>
      </div>
    </div>
  );
}
