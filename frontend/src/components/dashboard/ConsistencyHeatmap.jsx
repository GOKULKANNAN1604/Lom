/**
 * src/components/dashboard/ConsistencyHeatmap.jsx
 *
 * GitHub-style contribution heatmap for Life OS activity consistency.
 *
 * Features:
 *  - 52 weeks × 7 days grid (364 days + partial current week)
 *  - Per-pillar colour theming (Performance=orange, Study=purple, Tech=indigo)
 *  - Intensity levels 0–4 based on activity count per day
 *  - Month label row at the top
 *  - Hover tooltip showing date + activity breakdown
 *  - Pillar filter tabs (All / Performance / Study / Tech)
 *  - Summary stats below the grid
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useHeatmapData } from '../../hooks/usePillarData';
import { subDays, format, eachDayOfInterval, getMonthLabel, formatLong } from '../../utils/dateHelpers';
import { getPerformanceByDate } from '../../api/performance';
import { getStudyByDate } from '../../api/study';
import { getTechByDate } from '../../api/tech';
import { getJournalByDate } from '../../api/journal';

// ── Config ───────────────────────────────────────────────────
const PILLARS = [
  { key: 'all',         label: 'All',            gradient: 'from-perf via-study to-tech' },
  { key: 'performance', label: '🔥 Performance',  gradient: 'from-perf to-perf-light'    },
  { key: 'study',       label: '📚 Study',       gradient: 'from-study to-study-light'  },
  { key: 'tech',        label: '💻 Tech',        gradient: 'from-tech to-tech-light'    },
];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Returns a CSS class for a given activity count and pillar.
 * Level 0 = no activity, 1–4 = increasing intensity.
 */
const getIntensityClass = (count, pillar) => {
  if (count === 0) return 'bg-white/[0.04] border-white/[0.04]';
  const level = count >= 4 ? 4 : count;
  const map = {
    all: [
      '', 'bg-tech/30 border-tech/20', 'bg-tech/50 border-tech/30',
      'bg-tech/70 border-tech/50', 'bg-tech border-tech/80',
    ],
    performance: [
      '', 'bg-perf/30 border-perf/20', 'bg-perf/50 border-perf/30',
      'bg-perf/70 border-perf/50', 'bg-perf border-perf/80',
    ],
    study: [
      '', 'bg-study/30 border-study/20', 'bg-study/50 border-study/30',
      'bg-study/70 border-study/50', 'bg-study border-study/80',
    ],
    tech: [
      '', 'bg-tech/30 border-tech/20', 'bg-tech/50 border-tech/30',
      'bg-tech/70 border-tech/50', 'bg-tech border-tech/80',
    ],
  };
  return map[pillar][level];
};

// ── Tooltip ──────────────────────────────────────────────────
function Tooltip({ cell, position }) {
  if (!cell) return null;
  const { dateStr, data, pillar } = cell;
  const total = pillar === 'all' ? data.total : (data[pillar] ?? 0);

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{ left: position.x + 12, top: position.y - 8 }}
    >
      <div className="glass-card px-3 py-2 text-xs shadow-2xl min-w-[160px]">
        <p className="font-semibold text-primary mb-1">{formatLong(dateStr)}</p>
        {pillar === 'all' ? (
          <>
            <p className="text-muted">{total} total {total === 1 ? 'activity' : 'activities'}</p>
            {data.performance > 0 && <p className="text-perf">🔥 {data.performance} performance</p>}
            {data.study       > 0 && <p className="text-study">📚 {data.study} study</p>}
            {data.tech        > 0 && <p className="text-tech">💻 {data.tech} tech</p>}
            {total === 0           && <p className="text-muted">No activity</p>}
          </>
        ) : (
          <p className={total > 0 ? 'text-primary' : 'text-muted'}>
            {total > 0 ? `${total} ${pillar} ${total === 1 ? 'log' : 'logs'}` : 'No activity'}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function ConsistencyHeatmap() {
  const [activePillar, setActivePillar] = useState('all');
  const [tooltip, setTooltip]           = useState(null);
  const [tooltipPos, setTooltipPos]     = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState(null);

  const { data: heatmapData, isLoading } = useHeatmapData(activePillar);

  // Build the 52-column grid
  const today     = new Date();
  const startDate = subDays(today, 364);
  const allDays   = eachDayOfInterval(startDate, today);

  // Pad start so column 0 begins on Sunday
  const startDow  = startDate.getDay();  // 0=Sun
  const padded    = Array(startDow).fill(null).concat(allDays);

  // Slice into 7-row columns (each column = one week)
  const weeks = [];
  for (let i = 0; i < padded.length; i += 7) {
    weeks.push(padded.slice(i, i + 7));
  }

  // Month label positions
  const monthLabels = [];
  let lastMonth     = -1;
  weeks.forEach((week, wi) => {
    const firstRealDay = week.find((d) => d !== null);
    if (!firstRealDay) return;
    const m = firstRealDay.getMonth();
    if (m !== lastMonth) {
      monthLabels.push({ wi, label: getMonthLabel(firstRealDay) });
      lastMonth = m;
    }
  });

  // Summary stats
  const totalActive  = heatmapData
    ? Object.values(heatmapData.map).filter((d) =>
        activePillar === 'all' ? d.total > 0 : d[activePillar] > 0
      ).length
    : 0;
  const totalLogs = heatmapData
    ? Object.values(heatmapData.map).reduce((acc, d) =>
        acc + (activePillar === 'all' ? d.total : (d[activePillar] ?? 0)), 0
      )
    : 0;

  const handleMouseEnter = (e, dateStr, data) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({ x: rect.left, y: rect.top });
    setTooltip({ dateStr, data, pillar: activePillar });
  };

  const CELL = 'w-3 h-3 rounded-[3px] border transition-all duration-150 hover:scale-125 cursor-pointer';

  return (
    <div className="glass-card p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-primary">Consistency Heatmap</h2>
          <p className="text-xs text-muted mt-0.5">365-day activity grid</p>
        </div>

        {/* Pillar filter tabs */}
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1">
          {PILLARS.map(({ key, label }) => (
            <button
              key={key}
              id={`heatmap-tab-${key}`}
              onClick={() => setActivePillar(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                ${activePillar === key
                  ? 'bg-white/[0.10] text-primary shadow'
                  : 'text-muted hover:text-secondary'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="h-28 rounded-xl bg-white/[0.04] animate-pulse" />
      )}

      {!isLoading && heatmapData && (
        <>
          {/* Grid */}
          <div className="overflow-x-auto pb-2">
            <div className="inline-flex flex-col gap-1 min-w-max">

              {/* Month labels row */}
              <div className="flex gap-1 mb-1 pl-8">
                {weeks.map((_, wi) => {
                  const lbl = monthLabels.find((m) => m.wi === wi);
                  return (
                    <div key={wi} className="w-3 text-[9px] text-muted leading-none">
                      {lbl ? lbl.label : ''}
                    </div>
                  );
                })}
              </div>

              {/* Day rows (Sun–Sat) */}
              {[0, 1, 2, 3, 4, 5, 6].map((dow) => (
                <div key={dow} className="flex items-center gap-1">
                  {/* Day-of-week label */}
                  <span className="w-7 text-[9px] text-muted text-right pr-1 select-none">
                    {dow % 2 === 1 ? DAY_LABELS[dow] : ''}
                  </span>

                  {/* Cells */}
                  {weeks.map((week, wi) => {
                    const day = week[dow];
                    if (!day) return <div key={wi} className="w-3 h-3" />;

                    const dateStr = format(day);
                    const data    = heatmapData.map[dateStr] ?? { performance: 0, study: 0, tech: 0, total: 0 };
                    const count   = activePillar === 'all' ? data.total : (data[activePillar] ?? 0);
                    const isToday = dateStr === format(today);

                    return (
                      <div
                        key={wi}
                        className={`${CELL} ${getIntensityClass(count, activePillar)}
                          ${isToday ? 'ring-1 ring-white/40' : ''}`}
                        onMouseEnter={(e) => handleMouseEnter(e, dateStr, data)}
                        onMouseLeave={() => setTooltip(null)}
                        onClick={() => setSelectedDate(dateStr)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-muted">Less</span>
              {[0, 1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-3 h-3 rounded-[3px] border
                    ${getIntensityClass(lvl, activePillar === 'all' ? 'tech' : activePillar)}`}
                />
              ))}
              <span className="text-[10px] text-muted">More</span>
            </div>

            {/* Summary */}
            <div className="flex gap-4 text-xs text-muted">
              <span>
                <span className="text-primary font-semibold">{totalActive}</span> active days
              </span>
              <span>
                <span className="text-primary font-semibold">{totalLogs}</span> total logs
              </span>
            </div>
          </div>
        </>
      )}

      {/* Floating tooltip */}
      {tooltip && <Tooltip cell={tooltip} position={tooltipPos} />}

      {/* Daily Inspector Modal */}
      {selectedDate && (
        <DayInspectorModal date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  );
}

// ── Day Inspector Modal Component ──────────────────────────────────
function DayInspectorModal({ date, onClose }) {
  const { data: perfData, isLoading: perfLoading } = useQuery({
    queryKey: ['day-detail-perf', date],
    queryFn: () => getPerformanceByDate(date).then(r => r.data),
  });

  const { data: studyData, isLoading: studyLoading } = useQuery({
    queryKey: ['day-detail-study', date],
    queryFn: () => getStudyByDate(date).then(r => r.data),
  });

  const { data: techData, isLoading: techLoading } = useQuery({
    queryKey: ['day-detail-tech', date],
    queryFn: () => getTechByDate(date).then(r => r.data),
  });

  const { data: journalData, isLoading: journalLoading } = useQuery({
    queryKey: ['day-detail-journal', date],
    queryFn: () => getJournalByDate(date).then((r) => {
      const results = r.data?.results ?? r.data ?? [];
      return Array.isArray(results) ? results[0] : results;
    }),
  });

  const isLoading = perfLoading || studyLoading || techLoading || journalLoading;

  const perfLogs = perfData?.results ?? [];
  const studyLogs = studyData?.results ?? [];
  const techLogs = techData?.results ?? [];
  const journal = journalData;

  const hasData = perfLogs.length > 0 || studyLogs.length > 0 || techLogs.length > 0 || !!journal;

  const formatModalDate = (dStr) => {
    return new Date(dStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const MOOD_EMOJIS = {
    GREAT: '😄 Great',
    GOOD: '🙂 Good',
    OKAY: '😐 Okay',
    LOW: '😔 Low',
    STRESSED: '😤 Stressed'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="glass-card max-w-2xl w-full max-h-[85vh] overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted">Daily Inspector</p>
            <h2 className="text-xl font-extrabold text-primary mt-1">
              📅 {formatModalDate(date)}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors text-lg px-2.5 py-1.5 hover:bg-white/5 rounded-xl border border-white/[0.05]"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3">
              <div className="w-7 h-7 rounded-full border-2 border-tech border-t-transparent animate-spin" />
              <p className="text-xs text-muted">Loading logged details...</p>
            </div>
          ) : !hasData ? (
            <div className="py-16 text-center text-muted space-y-2">
              <span className="text-4xl block">📭</span>
              <p className="text-sm">No activity logs or diary entries recorded for this date.</p>
            </div>
          ) : (
            <>
              {/* Journal reflection card */}
              {journal && (
                <div className="glass-card bg-white/[0.02] border border-white/[0.05] p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-white/[0.04] pb-2 flex-wrap gap-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                      <span>📓</span> Journal Entry
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-muted">
                      {journal.mood && (
                        <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.05]">
                          Mood: <b>{MOOD_EMOJIS[journal.mood] || journal.mood}</b>
                        </span>
                      )}
                      {journal.energy_level && (
                        <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.05]">
                          Energy: <b>{journal.energy_level}/10</b>
                        </span>
                      )}
                      {journal.sleep_hours && (
                        <span className="bg-white/5 px-2 py-0.5 rounded-full border border-white/[0.05]">
                          Sleep: <b>{journal.sleep_hours}h</b>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {journal.highlights && (
                      <div className="bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">✨ What went well</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.highlights}</p>
                      </div>
                    )}
                    {journal.learnings && (
                      <div className="bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">🧠 What I learned</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.learnings}</p>
                      </div>
                    )}
                    {journal.challenges && (
                      <div className="bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">💪 What was hard</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.challenges}</p>
                      </div>
                    )}
                    {journal.gratitude && (
                      <div className="bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">🙏 Gratitude list</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.gratitude}</p>
                      </div>
                    )}
                    {journal.tomorrow_goals && (
                      <div className="md:col-span-2 bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">🎯 Goals for Tomorrow</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.tomorrow_goals}</p>
                      </div>
                    )}
                    {journal.notes && (
                      <div className="md:col-span-2 bg-white/[0.01] p-2.5 rounded-lg border border-white/[0.03]">
                        <p className="text-[10px] text-muted font-bold tracking-wider uppercase mb-1">📝 Notes & Thoughts</p>
                        <p className="text-secondary whitespace-pre-wrap">{journal.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Performance activity details */}
              {perfLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-perf flex items-center gap-1">
                    <span>🔥</span> Performance Activities
                  </h4>
                  <div className="space-y-2">
                    {perfLogs.map((log) => (
                      <div key={log.id} className="bg-white/[0.02] border border-white/[0.04] border-l-2 border-l-perf p-4 rounded-r-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-primary">{log.activity_type}</span>
                          {!log.is_rest_day ? (
                            <span className="text-secondary bg-white/5 px-2 py-0.5 rounded border border-white/[0.05] text-[10px]">
                              ⏱️ {log.duration_mins || 0} mins | {log.calories_burned || 0} kcal
                            </span>
                          ) : (
                            <span className="text-muted italic text-[10px]">Recovery Session</span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="text-secondary text-[11px] bg-white/[0.01] p-2 rounded border border-white/[0.02] whitespace-pre-wrap">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Study activity details */}
              {studyLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-study flex items-center gap-1">
                    <span>📚</span> Study Sessions
                  </h4>
                  <div className="space-y-2">
                    {studyLogs.map((log) => (
                      <div key={log.id} className="bg-white/[0.02] border border-white/[0.04] border-l-2 border-l-study p-4 rounded-r-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-primary">{log.activity_type} — {log.topic}</span>
                          {log.duration_mins && (
                            <span className="text-secondary bg-white/5 px-2 py-0.5 rounded border border-white/[0.05] text-[10px]">
                              ⏱️ {log.duration_mins || 0} mins {log.pages_read ? `| 📖 ${log.pages_read} pgs` : ''}
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <p className="text-secondary text-[11px] bg-white/[0.01] p-2 rounded border border-white/[0.02] whitespace-pre-wrap">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech activity details */}
              {techLogs.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-tech flex items-center gap-1">
                    <span>💻</span> Tech & Learning Logs
                  </h4>
                  <div className="space-y-2">
                    {techLogs.map((log) => (
                      <div key={log.id} className="bg-white/[0.02] border border-white/[0.04] border-l-2 border-l-tech p-4 rounded-r-xl text-xs space-y-1.5">
                        <div className="flex items-center justify-between font-medium">
                          <span className="text-primary">{log.category} — {log.topic}</span>
                          <span className="text-secondary bg-white/5 px-2 py-0.5 rounded border border-white/[0.05] text-[10px]">
                            ⏱️ {log.duration_mins || 0} mins {log.github_committed ? ' | ✓ Commit' : ''}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-secondary text-[11px] bg-white/[0.01] p-2 rounded border border-white/[0.02] whitespace-pre-wrap">{log.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/[0.06] flex justify-end">
          <button onClick={onClose} className="btn-ghost py-1.5 px-4 text-xs">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
