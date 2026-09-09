import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  TrendingUp,
  Calendar,
  History,
  Lightbulb,
  Users,
  Grid,
  AlertTriangle,
  UserCheck,
  GraduationCap,
  CalendarRange,
  Settings,
  Wind,
  BarChart3,
  User,
  LogOut,
  X,
  ShieldAlert,
  Sparkles,
  Shield
} from 'lucide-react';

export function Sidebar({ currentView, setCurrentView, isOpen, onClose, onOpenBreathing, onOpenProfile }) {
  const { user, logout } = useAuth();
  if (!user) return null;

  const role = user.role;

  // Visual theme configs per role
  const portalTheme = {
    student: {
      name: 'Student Portal',
      subtitle: 'Daily Wellness & Tracking',
      badgeClass: 'bg-teal-500/10 text-teal-700 border-teal-200',
      activeBg: 'bg-teal-600 text-white shadow-md shadow-teal-500/20',
      activeIcon: 'text-white',
      hoverBg: 'hover:bg-teal-50/70 hover:text-teal-900',
      logoGradient: 'from-teal-500 to-indigo-600',
      tag: 'Student'
    },
    mentor: {
      name: 'Faculty Mentor Portal',
      subtitle: 'Cohort Monitoring & Alerts',
      badgeClass: 'bg-indigo-500/10 text-indigo-700 border-indigo-200',
      activeBg: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20',
      activeIcon: 'text-white',
      hoverBg: 'hover:bg-indigo-50/70 hover:text-indigo-900',
      logoGradient: 'from-indigo-600 to-blue-700',
      tag: 'Faculty Advisor'
    },
    admin: {
      name: 'College Administration',
      subtitle: 'Institutional Oversight',
      badgeClass: 'bg-purple-500/10 text-purple-700 border-purple-200',
      activeBg: 'bg-purple-600 text-white shadow-md shadow-purple-500/20',
      activeIcon: 'text-white',
      hoverBg: 'hover:bg-purple-50/70 hover:text-purple-900',
      logoGradient: 'from-purple-600 to-slate-900',
      tag: 'Dean / Administrator'
    }
  }[role] || {
    name: 'MoodTrack',
    subtitle: 'Wellness Platform',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    activeBg: 'bg-slate-800 text-white',
    activeIcon: 'text-white',
    hoverBg: 'hover:bg-slate-100 hover:text-slate-900',
    logoGradient: 'from-indigo-600 to-teal-500',
    tag: role
  };

  // Nav sections per role
  const navSections = {
    student: [
      {
        title: 'MY WELLBEING',
        items: [
          { id: 'student_dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'student_checkin', label: 'Daily Check-in', icon: CalendarCheck, isAccent: true },
          { id: 'student_trends', label: 'My Trends', icon: TrendingUp },
          { id: 'student_heatmap', label: 'Stress Calendar', icon: Calendar }
        ]
      },
      {
        title: 'RESOURCES & HISTORY',
        items: [
          { id: 'student_history', label: 'Check-in History', icon: History },
          { id: 'student_insights', label: 'Wellness Insights', icon: Lightbulb },
          { id: 'breathing_tool', label: '60s Relaxation Tool', icon: Wind, isSpecial: true }
        ]
      }
    ],
    mentor: [
      {
        title: 'MENTORSHIP CONSOLE',
        items: [
          { id: 'mentor_dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'mentor_students', label: 'Assigned Students', icon: Users },
          { id: 'mentor_heatmap', label: 'Cohort Stress Heatmap', icon: Grid }
        ]
      },
      {
        title: 'EARLY INTERVENTION',
        items: [
          { id: 'mentor_alerts', label: 'High-Stress Alerts', icon: AlertTriangle, hasAlertBadge: true },
          { id: 'mentor_analytics', label: 'Cohort Analytics', icon: BarChart3 }
        ]
      }
    ],
    admin: [
      {
        title: 'COLLEGE OVERVIEW',
        items: [
          { id: 'admin_dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
          { id: 'admin_heatmap', label: 'College-Wide Heatmap', icon: Grid },
          { id: 'admin_alerts', label: 'Institutional Alerts', icon: AlertTriangle },
          { id: 'admin_analytics', label: 'College Analytics', icon: BarChart3 }
        ]
      },
      {
        title: 'PEOPLE & ASSIGNMENTS',
        items: [
          { id: 'admin_students', label: 'Student Directory', icon: Users },
          { id: 'admin_mentors', label: 'Mentor Directory', icon: GraduationCap },
          { id: 'admin_assignments', label: 'Mentor Allocation', icon: UserCheck }
        ]
      },
      {
        title: 'SYSTEM & CONTEXT',
        items: [
          { id: 'admin_academic', label: 'Academic Periods', icon: CalendarRange },
          { id: 'admin_settings', label: 'Platform Settings', icon: Settings }
        ]
      }
    ]
  }[role] || [];

  const handleItemClick = (item) => {
    if (item.id === 'breathing_tool') {
      onOpenBreathing();
    } else {
      setCurrentView(item.id);
    }
    if (window.innerWidth < 1024) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800 flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static shadow-sm ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Portal-Differentiated Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${portalTheme.logoGradient} flex items-center justify-center text-white font-black text-sm shadow-md`}>
              MT
            </div>
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight block leading-snug">
                {portalTheme.name}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block leading-none">
                {portalTheme.subtitle}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Portal Role Badge Banner */}
        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider flex items-center justify-between ${portalTheme.badgeClass}`}>
            <span>{portalTheme.tag} Workspace</span>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
          </div>
        </div>

        {/* Navigation List Organized by Sections */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.title}
              </div>

              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                if (item.isSpecial) {
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300 bg-teal-50/80 dark:bg-teal-950/40 hover:bg-teal-100 dark:hover:bg-teal-900/50 border border-teal-200/80 dark:border-teal-800/60 shadow-2xs transition-all"
                    >
                      <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? portalTheme.activeBg
                        : `text-slate-600 dark:text-slate-300 ${portalTheme.hoverBg} hover:text-slate-900 dark:hover:text-white`
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? portalTheme.activeIcon : 'text-slate-400 dark:text-slate-500'}`} />
                    <span className="truncate flex-1 text-left">{item.label}</span>
                    {item.isAccent && !isActive && (
                      <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-1.5">
          <button
            onClick={onOpenProfile}
            className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-2xs transition-all text-left group"
          >
            <img
              src={user?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt={user?.name}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover bg-slate-100 dark:bg-slate-800 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize truncate">{portalTheme.tag}</p>
            </div>
            <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
