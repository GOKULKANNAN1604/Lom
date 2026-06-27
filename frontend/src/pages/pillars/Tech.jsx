// src/pages/pillars/Tech.jsx
import { useQueryClient } from '@tanstack/react-query';
import { useTechLogs, useDeleteTechLog, useStreaks } from '../../hooks/usePillarData';
import LogForm from '../../components/dashboard/LogForm';

export default function TechPage() {
  const qc = useQueryClient();
  const { data: logsData, isLoading } = useTechLogs({ ordering: '-date_logged' });
  const { data: streaksData, isLoading: streaksLoading } = useStreaks();
  const deleteLog = useDeleteTechLog();

  const results = logsData?.results ?? logsData ?? [];
  const streak = streaksData?.tech;

  const totalSessions = results.length;
  const totalDuration = results.reduce((acc, curr) => acc + (Number(curr.duration_mins) || 0), 0);
  const totalCommits = results.filter(r => r.github_committed).length;

  const getBadgeCls = (type) => {
    switch (type) {
      case 'CODE': return 'bg-tech/15 text-tech border-tech/30';
      case 'COURSE': return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
      case 'PROJECT': return 'bg-pink-500/15 text-pink-400 border-pink-500/30';
      case 'READ': return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
      case 'DSA': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      case 'OSS': return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      default: return 'bg-white/5 text-muted border-white/5';
    }
  };

  const getEmoji = (type) => {
    switch (type) {
      case 'CODE': return '💻';
      case 'COURSE': return '🎓';
      case 'PROJECT': return '🚀';
      case 'READ': return '📖';
      case 'DSA': return '🧠';
      case 'OSS': return '🌐';
      default: return '⚙️';
    }
  };

  const getLabel = (type) => {
    switch (type) {
      case 'CODE': return 'Coding / Development';
      case 'COURSE': return 'Online Course';
      case 'PROJECT': return 'Side Project';
      case 'READ': return 'Technical Reading';
      case 'DSA': return 'DSA Practice';
      case 'OSS': return 'Open Source';
      default: return type;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-primary flex items-center gap-3">
          <span>💻</span> Tech Log
        </h1>
        <p className="text-secondary text-sm mt-1">Track your coding, study topics, Github commits, and DSA practices.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="glass-card p-5 border-l-4 border-l-tech">
          <p className="label">Current Streak</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold gradient-tech">
              {streaksLoading ? '...' : (streak?.current ?? 0)}
            </span>
            <span className="text-xs text-muted">days</span>
          </div>
          <p className="text-[10px] text-muted mt-2">
            Best streak: <span className="text-secondary font-medium">{streak?.longest ?? 0} days</span>
          </p>
        </div>

        {/* Total Sessions */}
        <div className="glass-card p-5 border-l-4 border-l-tech">
          <p className="label">Total Sessions</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {totalSessions}
            </span>
            <span className="text-xs text-muted">logs</span>
          </div>
          <p className="text-[10px] text-muted mt-2">
            Study and coding entries completed
          </p>
        </div>

        {/* Total Duration */}
        <div className="glass-card p-5 border-l-4 border-l-tech">
          <p className="label">Coding Time</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {totalDuration}
            </span>
            <span className="text-xs text-muted">mins</span>
          </div>
          <p className="text-[10px] text-muted mt-2">
            Avg: {results.length ? Math.round(totalDuration / results.length) : 0} mins / log
          </p>
        </div>

        {/* Total GitHub Commits */}
        <div className="glass-card p-5 border-l-4 border-l-tech">
          <p className="label">GitHub Commits</p>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-extrabold text-primary">
              {totalCommits}
            </span>
            <span className="text-xs text-muted">days committed</span>
          </div>
          <p className="text-[10px] text-muted mt-2">
            Green box contributions tracked
          </p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs Feed (Left Column) */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-primary">Coding & Learning History</h2>

          {isLoading && (
            <div className="space-y-4">
              <div className="h-28 glass-card animate-pulse" />
              <div className="h-28 glass-card animate-pulse" />
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="glass-card p-12 text-center text-muted">
              <span className="text-4xl">💻</span>
              <p className="mt-2 text-sm">No tech activities logged yet.</p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <div className="space-y-3">
              {results.map((log) => (
                <div key={log.id} className="glass-card p-5 flex items-start justify-between gap-4 border-l-2 hover:border-l-tech transition-all duration-200">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeCls(log.category)}`}>
                        <span>{getEmoji(log.category)}</span>
                        <span>{getLabel(log.category)}</span>
                      </span>
                      {log.github_committed && (
                        <span className="inline-flex items-center text-[10px] bg-tech/10 text-tech border border-tech/20 px-2 py-0.5 rounded-full font-medium">
                          ✓ GitHub Commit
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        {new Date(log.date_logged).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </span>
                    </div>

                    <div className="text-sm text-secondary">
                      <div className="font-semibold text-primary mb-1">
                        {log.topic}
                      </div>
                      {log.duration_mins && (
                        <span>Duration: <b>{log.duration_mins}</b> mins</span>
                      )}
                      {log.resources_url && (
                        <div className="mt-1">
                          <a
                            href={log.resources_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-tech hover:underline break-all inline-flex items-center gap-1"
                          >
                            🔗 Resource Link
                          </a>
                        </div>
                      )}
                    </div>

                    {log.notes && (
                      <p className="text-sm text-secondary bg-white/[0.02] p-3 rounded-lg border border-white/[0.04]">
                        {log.notes}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Delete this entry?')) {
                        deleteLog.mutate(log.id);
                      }
                    }}
                    disabled={deleteLog.isPending}
                    className="p-1 text-muted hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors self-start"
                    title="Delete entry"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Entry Form (Right Column) */}
        <div className="space-y-4">
          <LogForm defaultPillar="tech" lockPillar={true} />
        </div>
      </div>
    </div>
  );
}
