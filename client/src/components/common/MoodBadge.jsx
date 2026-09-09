import React from 'react';

export function getMoodConfig(mood) {
  switch (mood) {
    case 'happy':
      return {
        emoji: '😊',
        label: 'Happy',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
      };
    case 'neutral':
      return {
        emoji: '😐',
        label: 'Neutral',
        bg: 'bg-amber-50 text-amber-700 border-amber-200'
      };
    case 'sad':
      return {
        emoji: '😔',
        label: 'Sad',
        bg: 'bg-rose-50 text-rose-700 border-rose-200'
      };
    default:
      return {
        emoji: '—',
        label: 'No Data',
        bg: 'bg-slate-50 text-slate-500 border-slate-200'
      };
  }
}

export function MoodBadge({ mood, showEmojiOnly = false, size = 'md' }) {
  if (!mood) return <span className="text-slate-400 text-xs">—</span>;

  const config = getMoodConfig(mood);

  if (showEmojiOnly) {
    return <span className="text-lg" title={config.label}>{config.emoji}</span>;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold'
  }[size] || 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${sizeClasses}`}>
      <span className="text-sm">{config.emoji}</span>
      <span>{config.label}</span>
    </span>
  );
}
