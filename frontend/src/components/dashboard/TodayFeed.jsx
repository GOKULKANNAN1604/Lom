/**
 * src/components/dashboard/TodayFeed.jsx
 *
 * Activity feed for today's logs across all three pillars.
 * Shows a timeline of what was logged today with delete capability.
 */

import { useDashboard, useDeletePerformanceLog, useDeleteStudyLog, useDeleteTechLog } from '../../hooks/usePillarData';
import { formatLong, today } from '../../utils/dateHelpers';

const PILLAR_META = {
  performance: { icon: '🔥', borderCls: 'border-l-perf',   labelFn: (log) => log.activity_type_display },
  study:       { icon: '📚', borderCls: 'border-l-study',  labelFn: (log) => `${log.activity_type_display}: ${log.topic}` },
  tech:        { icon: '💻', borderCls: 'border-l-tech',   labelFn: (log) => log.topic                 },
};

function FeedItem({ log, pillar, onDelete, isDeleting }) {
  const meta = PILLAR_META[pillar];

  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border-l-2 ${meta.borderCls}
        bg-white/[0.03] hover:bg-white/[0.05] transition-colors group`}
    >
      <span className="text-lg mt-0.5">{meta.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{meta.labelFn(log)}</p>
        {log.notes && (
          <p className="text-xs text-muted mt-0.5 line-clamp-2">{log.notes}</p>
        )}
        <div className="flex gap-3 mt-1">
          {log.duration_mins && (
            <span className="text-[10px] text-muted">⏱ {log.duration_mins}m</span>
          )}
          {log.current_streak > 0 && (
            <span className="text-[10px] text-muted">🔥 {log.current_streak} streak</span>
          )}
          {log.github_committed && (
            <span className="text-[10px] text-muted">⬡ committed</span>
          )}
          {log.pages_read && (
            <span className="text-[10px] text-muted">📖 {log.pages_read} pgs</span>
          )}
        </div>
      </div>
      <button
        onClick={() => onDelete(log.id)}
        disabled={isDeleting}
        className="btn-danger p-1.5 text-[10px] rounded-lg transition-all active:scale-95 flex items-center justify-center self-center"
        aria-label="Delete log"
      >
        🗑️
      </button>
    </div>
  );
}

export default function TodayFeed() {
  const { data, isLoading, refetch } = useDashboard();
  const deletePerf   = useDeletePerformanceLog();
  const deleteStudy  = useDeleteStudyLog();
  const deleteTech   = useDeleteTechLog();

  const deleteFns = { performance: deletePerf, study: deleteStudy, tech: deleteTech };

  const allLogs = data
    ? [
        ...data.performance.map((l) => ({ ...l, _pillar: 'performance' })),
        ...data.study.map((l)       => ({ ...l, _pillar: 'study'       })),
        ...data.tech.map((l)        => ({ ...l, _pillar: 'tech'        })),
      ]
    : [];

  const handleDelete = async (pillar, id) => {
    await deleteFns[pillar].mutateAsync(id);
    refetch();
  };

  return (
    <div className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-primary">Today's Activity</h2>
          <p className="text-xs text-muted mt-0.5">{formatLong(today())}</p>
        </div>
        <span className="streak-badge">
          {allLogs.length} {allLogs.length === 1 ? 'log' : 'logs'}
        </span>
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-white/[0.04] rounded-xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && allLogs.length === 0 && (
        <div className="text-center py-10">
          <p className="text-3xl mb-3">🌅</p>
          <p className="text-secondary text-sm">No activity logged today yet.</p>
          <p className="text-muted text-xs mt-1">Use the form to record your first entry!</p>
        </div>
      )}

      {!isLoading && allLogs.length > 0 && (
        <div className="space-y-2">
          {allLogs.map((log) => (
            <FeedItem
              key={`${log._pillar}-${log.id}`}
              log={log}
              pillar={log._pillar}
              onDelete={(id) => handleDelete(log._pillar, id)}
              isDeleting={deleteFns[log._pillar].isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
