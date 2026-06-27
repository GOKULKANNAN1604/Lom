/**
 * src/pages/Journal.jsx
 *
 * Redesigned Premium Daily Journal — split timeline view with client search,
 * mood filters, detailed read view, and sectioned form tabs.
 */

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { today, formatLong, subDays, format } from '../utils/dateHelpers';
import {
  getJournalEntries,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry
} from '../api/journal';

const MOODS = [
  { value: 'GREAT',    emoji: '😄', label: 'Great'    },
  { value: 'GOOD',     emoji: '🙂', label: 'Good'     },
  { value: 'OKAY',     emoji: '😐', label: 'Okay'     },
  { value: 'LOW',      emoji: '😔', label: 'Low'      },
  { value: 'STRESSED', emoji: '😤', label: 'Stressed' },
];

const MOOD_METADATA = {
  GREAT:    { emoji: '😄', label: 'Great',    colorCls: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
  GOOD:     { emoji: '🙂', label: 'Good',     colorCls: 'text-sky-400 border-sky-500/20 bg-sky-500/5 shadow-[0_0_15px_rgba(14,165,233,0.15)]' },
  OKAY:     { emoji: '😐', label: 'Okay',     colorCls: 'text-amber-400 border-amber-500/20 bg-amber-500/5 shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
  LOW:      { emoji: '😔', label: 'Low',      colorCls: 'text-blue-400 border-blue-500/20 bg-blue-500/5 shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
  STRESSED: { emoji: '😤', label: 'Stressed', colorCls: 'text-rose-400 border-rose-500/20 bg-rose-500/5 shadow-[0_0_15px_rgba(244,63,94,0.15)]' },
};

const BLANK = {
  mood: 'GOOD', energy_level: 7, sleep_hours: '',
  highlights: '', learnings: '', challenges: '',
  gratitude: '', tomorrow_goals: '', notes: '',
};

const formatShortDate = (dateStr) => {
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDate();
    const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return { day, weekday, month, year };
  } catch (e) {
    return { day: '', weekday: '', month: '', year: '' };
  }
};

export default function JournalPage() {
  const qc = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(today());
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMood, setFilterMood] = useState('ALL');
  const [formTab, setFormTab] = useState('reflections'); // 'reflections' | 'outlook'
  const [mobileView, setMobileView] = useState('timeline'); // 'timeline' | 'detail'

  // Form states
  const [form, setForm] = useState(BLANK);
  const [saved, setSaved] = useState(false);
  const [entryId, setEntryId] = useState(null);

  // Fetch past journals list (page_size: 500)
  const { data: listData, isLoading: isListLoading } = useQuery({
    queryKey: ['journals-list'],
    queryFn: () => getJournalEntries({ page_size: 500, ordering: '-date' }).then((r) => {
      return r.data?.results ?? r.data ?? [];
    }),
  });

  const currentEntry = listData?.find((j) => j.date === selectedDate);

  // Sync selectedEntry with form state
  useEffect(() => {
    if (!isEditing) {
      if (currentEntry) {
        const { id, mood, energy_level, sleep_hours, highlights, learnings,
                challenges, gratitude, tomorrow_goals, notes } = currentEntry;
        setEntryId(id);
        setForm({ mood, energy_level, sleep_hours: sleep_hours ?? '',
                  highlights, learnings, challenges, gratitude, tomorrow_goals, notes });
      } else {
        setEntryId(null);
        setForm({ ...BLANK });
      }
    }
  }, [currentEntry, selectedDate, isEditing]);

  // Mutations
  const save = useMutation({
    mutationFn: (data) =>
      entryId
        ? updateJournalEntry(entryId, { ...data, date: selectedDate })
        : createJournalEntry({ ...data, date: selectedDate }),
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      setIsEditing(false);
      qc.invalidateQueries({ queryKey: ['journals-list'] });
    },
  });

  const remove = useMutation({
    mutationFn: (id) => deleteJournalEntry(id),
    onSuccess: () => {
      setIsEditing(false);
      setEntryId(null);
      setForm({ ...BLANK });
      qc.invalidateQueries({ queryKey: ['journals-list'] });
      setMobileView('timeline');
    },
  });

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Client side search and mood filter
  const filteredList = (listData || []).filter((entry) => {
    const matchesSearch = searchQuery.trim() === '' ||
      [entry.highlights, entry.learnings, entry.challenges, entry.gratitude, entry.tomorrow_goals, entry.notes]
        .some((text) => text?.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesMood = filterMood === 'ALL' || entry.mood === filterMood;
    return matchesSearch && matchesMood;
  });

  const startNewJournal = () => {
    const todayStr = today();
    setSelectedDate(todayStr);
    
    const todayEntry = listData?.find((j) => j.date === todayStr);
    if (todayEntry) {
      setEntryId(todayEntry.id);
      const { mood, energy_level, sleep_hours, highlights, learnings,
              challenges, gratitude, tomorrow_goals, notes } = todayEntry;
      setForm({ mood, energy_level, sleep_hours: sleep_hours ?? '',
                highlights, learnings, challenges, gratitude, tomorrow_goals, notes });
    } else {
      setEntryId(null);
      setForm({ ...BLANK });
    }
    
    setIsEditing(true);
    setMobileView('detail');
  };

  const handleTimelineClick = (entryDate) => {
    setSelectedDate(entryDate);
    setIsEditing(false);
    setMobileView('detail');
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary flex items-center gap-2">
            <span>📓</span> Daily Journal
          </h1>
          <p className="text-secondary text-sm mt-1">Reflect on your days. Chart your growth. Secure your memories.</p>
        </div>
        <button
          onClick={startNewJournal}
          className="btn-primary flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold self-start sm:self-center transition-transform active:scale-95 cursor-pointer"
        >
          ✍️ Write Today's Entry
        </button>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* LEFT COLUMN: Archive Timeline Sidebar */}
        <div className={`${mobileView === 'timeline' ? 'block' : 'hidden md:block'} w-full md:w-[35%] space-y-4`}>
          <div className="glass-card p-4 space-y-4">
            
            {/* View/Log Past Days Date Picker */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Go to Specific Date / Log Past Day</label>
              <input
                type="date"
                value={selectedDate}
                max={today()}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setIsEditing(false);
                  setMobileView('detail');
                }}
                className="input w-full text-xs py-2 bg-black/25 cursor-pointer"
              />
            </div>

            {/* Search Input */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Search Logs</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reflections, learnings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input w-full pl-8 text-xs py-2 bg-black/25"
                />
                <span className="absolute left-2.5 top-2 text-xs text-muted">🔍</span>
              </div>
            </div>

            {/* Mood Filters */}
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Filter by Mood</label>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterMood('ALL')}
                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 cursor-pointer
                    ${filterMood === 'ALL'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/[0.02] border border-white/[0.04] text-muted hover:text-primary'
                    }`}
                >
                  All
                </button>
                {MOODS.map(({ value, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setFilterMood(value)}
                    title={value}
                    className={`p-1.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-center cursor-pointer
                      ${filterMood === value
                        ? 'bg-white/10 border border-white/20 scale-105'
                        : 'bg-white/[0.02] border border-white/[0.04] opacity-50 hover:opacity-100'
                      }`}
                  >
                    <span>{emoji}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Timeline Feed Container */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
            <p className="text-[10px] font-bold text-muted uppercase tracking-wider px-1">Past Entries ({filteredList.length})</p>
            
            {isListLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-20 bg-white/[0.02] border border-white/[0.04] rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : filteredList.length === 0 ? (
              <div className="glass-card p-6 text-center text-xs text-muted">
                No past journal entries match your search or filters.
              </div>
            ) : (
              filteredList.map((entry) => {
                const { day, weekday, month } = formatShortDate(entry.date);
                const isSelected = entry.date === selectedDate;
                const moodMeta = MOOD_METADATA[entry.mood] || { emoji: '😐', label: entry.mood };
                
                return (
                  <div
                    key={entry.date}
                    onClick={() => handleTimelineClick(entry.date)}
                    className={`group cursor-pointer p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-3
                      ${isSelected
                        ? 'bg-white/5 border-white/20 shadow-lg scale-[1.01]'
                        : 'border-white/[0.04] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/10'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Stylized Date Badge */}
                      <div className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center shrink-0">
                        <span className="text-[8px] text-muted font-bold uppercase tracking-wider">{weekday}</span>
                        <span className="text-sm font-black text-primary -mt-0.5">{day}</span>
                        <span className="text-[8px] text-muted font-bold uppercase tracking-wider -mt-0.5">{month}</span>
                      </div>

                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm">{moodMeta.emoji}</span>
                          <span className="text-[10px] text-secondary font-bold uppercase tracking-wide">
                            {moodMeta.label}
                          </span>
                          <span className="text-[9px] text-muted font-bold">
                            • ⚡ {entry.energy_level}/10
                          </span>
                        </div>
                        <p className="text-[11px] text-muted truncate max-w-[160px]">
                          {entry.highlights || entry.notes || 'No reflections written yet.'}
                        </p>
                      </div>
                    </div>

                    <span className="text-xs text-muted group-hover:text-primary transition-colors pr-1">›</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Reader / Writer Panel */}
        <div className={`${mobileView === 'detail' ? 'block' : 'hidden md:block'} w-full md:w-[65%] z-10`}>
          
          {/* Back button for mobile */}
          <button
            onClick={() => setMobileView('timeline')}
            className="md:hidden mb-4 flex items-center gap-1 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            ← Back to Archive
          </button>

          {/* WRITE / EDIT MODE PANEL */}
          {isEditing ? (
            <form
              onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}
              className="glass-card p-6 space-y-6 relative overflow-hidden animate-fade-in"
            >
              {saved && (
                <div className="absolute top-4 right-4 z-10 animate-fade-in bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold">
                  ✅ Reflections Saved!
                </div>
              )}

              {/* Form Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.04] pb-4">
                <div>
                  <h2 className="text-lg font-bold text-primary">
                    {entryId ? '✏️ Edit Reflections' : '✍️ Write Reflections'}
                  </h2>
                  <p className="text-xs text-muted mt-0.5">{formatLong(selectedDate)}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* Mood Selector Grid */}
                <div>
                  <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-2">How is your overall mood?</label>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {MOODS.map(({ value, emoji, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, mood: value }))}
                        className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border transition-all duration-300 cursor-pointer
                          ${form.mood === value
                            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300 scale-105 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                            : 'border-white/[0.04] bg-white/[0.01] hover:border-white/10 hover:bg-white/[0.02] text-muted'
                          }`}
                      >
                        <span className="text-2xl">{emoji}</span>
                        <span className="text-[9px] uppercase font-bold tracking-wider">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sliders Block */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white/[0.01] border border-white/[0.03] p-4 rounded-2xl">
                  {/* Energy Level Slider */}
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">
                      Energy Level: <span className="text-indigo-400 font-black">{form.energy_level}/10</span>
                    </label>
                    <input
                      type="range"
                      name="energy_level"
                      min="1"
                      max="10"
                      value={form.energy_level}
                      onChange={handleFieldChange}
                      className="w-full accent-indigo-500 mt-2"
                    />
                    <div className="flex justify-between text-[9px] text-muted font-bold mt-1 px-0.5">
                      <span>Low 🥱</span>
                      <span>Mid ⚡</span>
                      <span>High 🔥</span>
                    </div>
                  </div>

                  {/* Sleep Hours Input */}
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Sleep duration (hours)</label>
                    <input
                      type="number"
                      name="sleep_hours"
                      min="0"
                      max="24"
                      step="0.5"
                      placeholder="e.g. 7.5"
                      value={form.sleep_hours}
                      onChange={handleFieldChange}
                      className="input w-full mt-1.5 bg-black/25"
                    />
                  </div>
                </div>

                {/* Text Areas */}
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">✨ What went good today? (Highlights)</label>
                    <textarea
                      name="highlights"
                      rows={4}
                      value={form.highlights}
                      onChange={handleFieldChange}
                      placeholder="Reflect on key successes, small wins, or pleasant moments..."
                      className="input w-full resize-none mt-1 bg-black/25"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">💪 What went bad today? (Challenges)</label>
                    <textarea
                      name="challenges"
                      rows={4}
                      value={form.challenges}
                      onChange={handleFieldChange}
                      placeholder="Blockers, mistakes, friction, or details you struggled with..."
                      className="input w-full resize-none mt-1 bg-black/25"
                    />
                  </div>
                </div>
              </div>

              {/* Error Box */}
              {save.isError && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                  <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="space-y-1">
                    <p className="font-extrabold uppercase tracking-wider text-[9px] text-rose-400">Save Error</p>
                    <p className="text-rose-200/90 font-medium">
                      {save.error?.response?.data?.date?.[0] || 
                       save.error?.response?.data?.detail || 
                       Object.values(save.error?.response?.data || {})[0]?.[0] ||
                       'Failed to save reflections. An entry for this date might already exist.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center gap-3 border-t border-white/[0.04] pt-4 mt-2">
                <button
                  type="submit"
                  disabled={save.isPending}
                  className="btn-primary flex-1 py-3 text-sm font-bold uppercase tracking-wider shadow-lg active:scale-[0.98] transition-transform cursor-pointer"
                >
                  {save.isPending ? 'Saving reflections...' : 'Save reflections'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs font-bold uppercase text-secondary hover:text-primary transition-all active:scale-[0.98] cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            
            /* READ MODE: PREMIUM DIARY LAYOUT */
            <div className="space-y-6">
              {currentEntry ? (
                <div className="space-y-6 animate-fade-in">
                  
                  {/* Diary Header */}
                  <div className="glass-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block">PERSONAL LOG</span>
                      <h2 className="text-xl sm:text-2xl font-black text-primary tracking-tight">
                        {formatLong(currentEntry.date)}
                      </h2>
                    </div>

                    {/* Vitals Summary row */}
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Mood Badge */}
                      {(() => {
                        const meta = MOOD_METADATA[currentEntry.mood] || { emoji: '😐', label: currentEntry.mood, colorCls: 'bg-white/5 border-white/10' };
                        return (
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold ${meta.colorCls}`}>
                            <span>{meta.emoji}</span>
                            <span className="uppercase tracking-wider text-[10px]">{meta.label}</span>
                          </div>
                        );
                      })()}
                      
                      {/* Energy */}
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.05] bg-white/[0.01] text-[10px] font-bold text-secondary uppercase tracking-wider">
                        <span>⚡</span>
                        <span>Energy: {currentEntry.energy_level}/10</span>
                      </div>

                      {/* Sleep */}
                      {currentEntry.sleep_hours && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.05] bg-white/[0.01] text-[10px] font-bold text-secondary uppercase tracking-wider">
                          <span>🛌</span>
                          <span>Sleep: {currentEntry.sleep_hours} hrs</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reflections Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Highlights */}
                    <div className="glass-card p-5 space-y-2 border-t-2 border-t-emerald-500/40">
                      <h3 className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <span>✨</span> What Went Good
                      </h3>
                      <p className="text-secondary text-xs leading-relaxed whitespace-pre-wrap">
                        {currentEntry.highlights || 'No positive highlights logged for this date.'}
                      </p>
                    </div>

                    {/* Challenges */}
                    <div className="glass-card p-5 space-y-2 border-t-2 border-t-rose-500/40">
                      <h3 className="text-xs font-extrabold text-primary flex items-center gap-1.5 uppercase tracking-wider">
                        <span>💪</span> What Went Bad
                      </h3>
                      <p className="text-secondary text-xs leading-relaxed whitespace-pre-wrap">
                        {currentEntry.challenges || 'No challenges faced logged for this date.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-ghost flex-1 py-3 text-xs font-bold uppercase tracking-wider border border-white/[0.08] cursor-pointer"
                    >
                      ✏️ Edit reflections
                    </button>
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this diary entry?')) {
                          remove.mutate(currentEntry.id);
                        }
                      }}
                      className="px-4 py-3 rounded-xl border border-rose-500/20 bg-rose-500/5 text-xs font-bold uppercase text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      🗑️ Delete
                    </button>
                  </div>

                </div>
              ) : (
                
                /* EMPTY WELCOME STATE */
                <div className="glass-card p-12 text-center space-y-4 animate-fade-in flex flex-col items-center justify-center min-h-[350px]">
                  <span className="text-4xl animate-bounce">✍️</span>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">No journal entry for this date</h3>
                    <p className="text-xs text-muted max-w-sm">
                      Reflections clear your mind. Save today's events, learnings, and small victories.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary py-2.5 px-6 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Write reflections for {formatLong(selectedDate)}
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
