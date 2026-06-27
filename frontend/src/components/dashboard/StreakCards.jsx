/**
 * src/components/dashboard/StreakCards.jsx
 *
 * Three streak summary cards — one per pillar.
 * Shows current streak, all-time best, and a live active indicator when active.
 */

import { useStreaks } from '../../hooks/usePillarData';

const PILLARS = [
  {
    key:        'performance',
    label:      'Performance',
    icon:       '🔥',
    borderCls:  'card-perf',
    gradientCls:'gradient-perf',
    glowCls:    'shadow-glow-perf',
    ringCls:    'ring-perf/30',
  },
  {
    key:        'study',
    label:      'Study',
    icon:       '📚',
    borderCls:  'card-study',
    gradientCls:'gradient-study',
    glowCls:    'shadow-glow-study',
    ringCls:    'ring-study/30',
  },
  {
    key:        'tech',
    label:      'Tech',
    icon:       '💻',
    borderCls:  'card-tech',
    gradientCls:'gradient-tech',
    glowCls:    'shadow-glow-tech',
    ringCls:    'ring-tech/30',
  },
];

function StreakCard({ pillar, data, isLoading }) {
  const current = data?.current ?? 0;
  const longest = data?.longest ?? 0;
  const isActive = current > 0;

  return (
    <div
      className={`glass-card ${pillar.borderCls} p-5 animate-fade-in
        transition-all duration-300 hover:-translate-y-0.5
        ${isActive ? `hover:${pillar.glowCls}` : ''}`}
    >
      {/* Icon + label */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{pillar.icon}</span>
        {isActive && (
          <span className="streak-badge text-[10px] animate-pulse-glow">
            🔴 Active
          </span>
        )}
      </div>

      <p className="label">{pillar.label}</p>

      {/* Current streak number */}
      {isLoading ? (
        <div className="h-10 w-20 bg-white/[0.06] rounded-lg animate-pulse mt-1" />
      ) : (
        <div className="flex items-baseline gap-1 mt-1">
          <span className={`text-4xl font-extrabold tracking-tight ${pillar.gradientCls}`}>
            {current}
          </span>
          <span className="text-sm text-muted">day{current !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Mini progress bar — % of longest streak */}
      <div className="mt-3 h-1 bg-white/[0.06] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700
            ${pillar.borderCls.replace('card-', 'bg-')}`}
          style={{
            width: longest > 0 ? `${Math.round((current / longest) * 100)}%` : '0%',
          }}
        />
      </div>

      <p className="text-[11px] text-muted mt-2">
        Best: <span className="text-secondary font-medium">{longest} days</span>
      </p>
    </div>
  );
}

export default function StreakCards() {
  const { data, isLoading } = useStreaks();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {PILLARS.map((p) => (
        <StreakCard
          key={p.key}
          pillar={p}
          data={data?.[p.key]}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
