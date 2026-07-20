'use client';

import { useCountdown } from '@/hooks/useCountdown';

interface CountdownTimerProps {
  targetDate?: string;
  isLive?: boolean;
  compact?: boolean;
}
export function CountdownTimer({ targetDate, isLive, compact }: CountdownTimerProps) {
  const { days, hours, minutes, seconds, expired } = useCountdown(targetDate || '');

  if (isLive || expired) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 text-red-400 px-3 py-1.5 rounded-full text-sm font-semibold">
          <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
          LIVE NOW
        </span>
      </div>
    );
  }

  const boxes = [
    { value: days, label: 'Days' },
    { value: hours, label: 'Hrs' },
    { value: minutes, label: 'Min' },
    { value: seconds, label: 'Sec' },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1 text-sm text-white/70 font-mono">
        <span>{days}d {hours}h {minutes}m</span>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {boxes.map(({ value, label }) => (
        <div key={label} className="glass rounded-xl px-3 py-2 text-center min-w-[56px]">
          <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-white">{String(value).padStart(2, '0')}</div>
          <div className="text-xs text-white/50 uppercase tracking-wide">{label}</div>
        </div>
      ))}
    </div>
  );
}
