import React from 'react';
import { AlertTriangle, CheckCircle, Flame, ShieldAlert, Sparkles } from 'lucide-react';

export function getStressConfig(level) {
  switch (level) {
    case 1:
      return {
        label: 'Very Low',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: Sparkles,
        fillColor: '#10B981'
      };
    case 2:
      return {
        label: 'Low',
        bg: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-500',
        icon: CheckCircle,
        fillColor: '#14B8A6'
      };
    case 3:
      return {
        label: 'Moderate',
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        icon: AlertTriangle,
        fillColor: '#F59E0B'
      };
    case 4:
      return {
        label: 'High',
        bg: 'bg-orange-50 text-orange-700 border-orange-200',
        dot: 'bg-orange-500',
        icon: Flame,
        fillColor: '#F97316'
      };
    case 5:
      return {
        label: 'Very High',
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        icon: ShieldAlert,
        fillColor: '#EF4444'
      };
    default:
      return {
        label: 'No Data',
        bg: 'bg-slate-50 text-slate-500 border-slate-200',
        dot: 'bg-slate-400',
        icon: CheckCircle,
        fillColor: '#94A3B8'
      };
  }
}

export function StressBadge({ level, showNumber = true, size = 'md' }) {
  if (level === null || level === undefined) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 border border-slate-200">
        —
      </span>
    );
  }

  const config = getStressConfig(level);
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <Icon className="w-3.5 h-3.5" />
      <span>
        {showNumber && `${level} — `}
        {config.label}
      </span>
    </span>
  );
}
