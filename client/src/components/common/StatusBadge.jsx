import React from 'react';
import { ShieldAlert, AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

export function StatusBadge({ status, label }) {
  switch (status) {
    case 'pattern':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-rose-600" />
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{label || 'High-Stress Pattern'}</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{label || 'High Stress'}</span>
        </span>
      );
    case 'warning':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{label || 'Moderate / Warning'}</span>
        </span>
      );
    case 'normal':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{label || 'Normal'}</span>
        </span>
      );
  }
}
