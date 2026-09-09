import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, Lock, Wind, LogOut, Menu, ShieldCheck, UserCheck, GraduationCap, Sun, Moon } from 'lucide-react';

export function Header({ onToggleSidebar, onOpenBreathing, onOpenProfile }) {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { unreadCount, setIsOpen } = useNotifications();

  const role = user?.role;

  const roleMeta = {
    student: {
      badge: 'Student Wellness Portal',
      badgeClass: 'bg-teal-50 dark:bg-teal-950/40 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800/50',
      icon: ShieldCheck,
      privacyLabel: 'Privacy Enforced: Your notes are strictly confidential to you.'
    },
    mentor: {
      badge: 'Mentor Advisory Console',
      badgeClass: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/50',
      icon: UserCheck,
      privacyLabel: 'Authorized View: Showing assigned mentees without private notes.'
    },
    admin: {
      badge: 'Institutional Administration',
      badgeClass: 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800/50',
      icon: GraduationCap,
      privacyLabel: 'College-Wide Oversight: System aggregates with strict privacy protections.'
    }
  }[role] || {
    badge: 'MoodTrack',
    badgeClass: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: ShieldCheck,
    privacyLabel: 'Privacy-First Architecture'
  };

  const RoleIcon = roleMeta.icon;

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${roleMeta.badgeClass}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleMeta.badge}</span>
          </div>
        </div>
      </div>

      {/* Center Privacy Notice */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-medium">
        <Lock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        <span>{roleMeta.privacyLabel}</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* 60s Breathing Button */}
        <button
          onClick={onOpenBreathing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 rounded-xl text-xs font-semibold border border-teal-200/80 dark:border-teal-800/60 transition-colors shadow-2xs"
          title="Start 60-Second Mindful Breathing"
        >
          <Wind className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 animate-pulse" />
          <span className="hidden sm:inline">60s Breathing</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User profile & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            title="View Profile"
          >
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800"
            />
            <div className="hidden xl:block text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">{user?.role}</p>
            </div>
          </button>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
