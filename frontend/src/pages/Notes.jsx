/**
 * src/pages/Notes.jsx
 * Notes — Premium visual card grid with templates, interactive checklist toggling, category tabs, and overlays for reading and writing notes.
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, createNote, updateNote, deleteNote, patchNote } from '../api/notes';

const CATEGORIES = [
  'ALL', 'PERSONAL', 'WORK', 'IDEAS', 'LEARNING', 'HEALTH', 'FINANCE', 'OTHER'
];

const CAT_COLORS = {
  PERSONAL: 'text-tech bg-tech/10 border-tech/20',
  WORK: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  IDEAS: 'text-perf bg-perf/10 border-perf/20',
  LEARNING: 'text-wealth bg-wealth/10 border-wealth/20',
  HEALTH: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
  FINANCE: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  OTHER: 'text-muted bg-white/5 border-white/10',
};

const BLANK = { title: '', content: '', category: 'PERSONAL', tags: '', is_pinned: false };

// ── Note Creator / Editor Modal ───────────────────────────────────────
function NoteModal({ note, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(note || BLANK);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const templates = [
    {
      name: '📝 Standard',
      text: ''
    },
    {
      name: '⚠️ Important',
      text: `### 📌 CRITICAL DETAILS\n- Purpose: \n- Key Info: \n- Important Dates: \n- Action Items: \n`
    },
    {
      name: '✅ To-Do List',
      text: `### 📋 TASKS\n- [ ] Task 1\n- [ ] Task 2\n- [ ] Task 3\n`
    },
    {
      name: '💡 Idea Spark',
      text: `### 💡 THE BIG IDEA\n- Context: \n- Core Concept: \n- How to Execute: \n`
    },
    {
      name: '💰 Finance Jot',
      text: `### 💰 TRANSACTION / BUDGET\n- Item/Source: \n- Amount: \n- Date: \n- Notes: \n`
    }
  ];

  const applyTemplate = (text) => {
    if (!form.content.trim() || confirm('Overwrite current content with this template?')) {
      setForm(prev => ({ ...prev, content: text }));
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-lg p-6 border border-white/10 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-tech via-perf to-wealth" />

        <h2 className="text-xl font-extrabold text-primary mb-5 mt-2 flex items-center gap-2">
          {note ? '✏️ Edit Note' : '🗒️ Create Note'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              name="title"
              placeholder="Give your note a title..."
              value={form.title}
              onChange={handleChange}
              className="input w-full"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="label mb-0">Content</label>
            </div>
            
            {/* Quick Templates Row */}
            <div className="flex flex-wrap gap-1.5 mb-2 p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <span className="text-[10px] text-muted font-semibold tracking-wider block w-full mb-1">💡 QUICK FORMAT TEMPLATES</span>
              {templates.map(t => (
                <button
                  key={t.name}
                  type="button"
                  onClick={() => applyTemplate(t.text)}
                  className="px-2 py-1 bg-white/5 hover:bg-white/10 rounded-lg text-[11px] text-secondary hover:text-primary transition-all duration-150 border border-white/[0.04]"
                >
                  {t.name}
                </button>
              ))}
            </div>

            <textarea
              name="content"
              placeholder="Start writing anything here... Use - [ ] for checklists or - for bullets."
              rows={8}
              value={form.content}
              onChange={handleChange}
              className="input w-full resize-none font-sans"
            />
          </div>

          <div>
            <label className="label">Category</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {CATEGORIES.filter(c => c !== 'ALL').map(c => {
                const isActive = form.category === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, category: c }))}
                    className={`py-1.5 px-1 rounded-xl text-center text-xs font-semibold border transition-all duration-200 truncate
                      ${isActive 
                        ? `${CAT_COLORS[c]} ring-1 ring-tech/50 border-transparent shadow-md` 
                        : 'border-white/[0.05] bg-white/[0.02] text-secondary hover:text-primary hover:bg-white/[0.05]'}`}
                  >
                    {c.charAt(0) + c.slice(1).toLowerCase()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Styled Switch for Pinning */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-xs font-semibold text-secondary flex items-center gap-2">
              📌 Pin this note to the top board
            </span>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, is_pinned: !f.is_pinned }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none
                ${form.is_pinned ? 'bg-tech shadow-glow-tech' : 'bg-white/10'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200
                  ${form.is_pinned ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button
            onClick={() => onSave(form)}
            disabled={isSaving || !form.title.trim()}
            className="btn-primary flex-1"
          >
            {isSaving ? 'Saving…' : 'Save Note'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Note Reader Modal ──────────────────────────────────────────
function NoteReaderModal({ note, onClose, onEdit, onDelete, onPatch }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(note.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleTask = (lineIndex) => {
    const lines = (note.content || '').split('\n');
    const line = lines[lineIndex];
    let newLine = line;
    if (line.match(/^-\s*\[\s*\]/)) {
      newLine = line.replace(/^-\s*\[\s*\]/, '- [x]');
    } else if (line.match(/^-\s*\[x\]/i)) {
      newLine = line.replace(/^-\s*\[x\]/i, '- [ ]');
    }
    lines[lineIndex] = newLine;
    onPatch(note.id, { content: lines.join('\n') });
  };

  const formattedDate = new Date(note.updated_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const wordCount = note.content ? note.content.trim().split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const renderContentLines = () => {
    const lines = (note.content || '').split('\n');
    return lines.map((line, idx) => {
      // Check if it's a task item
      const isUnchecked = line.match(/^-\s*\[\s*\]\s*(.*)/);
      const isChecked = line.match(/^-\s*\[x\]\s*(.*)/i);
      
      if (isUnchecked) {
        return (
          <div key={idx} className="flex items-start gap-3 my-1.5 text-secondary">
            <input
              type="checkbox"
              checked={false}
              onChange={() => handleToggleTask(idx)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-tech cursor-pointer"
            />
            <span className="cursor-pointer select-none" onClick={() => handleToggleTask(idx)}>
              {isUnchecked[1]}
            </span>
          </div>
        );
      } else if (isChecked) {
        return (
          <div key={idx} className="flex items-start gap-3 my-1.5 text-muted line-through">
            <input
              type="checkbox"
              checked={true}
              onChange={() => handleToggleTask(idx)}
              className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 accent-tech cursor-pointer"
            />
            <span className="cursor-pointer select-none" onClick={() => handleToggleTask(idx)}>
              {isChecked[1]}
            </span>
          </div>
        );
      }
      
      // Check for headers (e.g. ### Header or ## Header)
      const isHeader = line.match(/^(#{1,6})\s+(.*)/);
      if (isHeader) {
        const level = isHeader[1].length;
        const text = isHeader[2];
        const sizeClass = 
          level === 1 ? 'text-xl font-black mt-5 mb-2.5' :
          level === 2 ? 'text-lg font-bold mt-4 mb-2' :
          'text-sm font-extrabold mt-3.5 mb-1.5';
        return <div key={idx} className={`${sizeClass} text-primary`}>{text}</div>;
      }

      // Check for bullet items
      const isBullet = line.match(/^-\s+(.*)/);
      if (isBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-2 text-secondary">
            <span className="text-tech select-none">•</span>
            <span>{isBullet[1]}</span>
          </div>
        );
      }

      // Regular line
      return (
        <div key={idx} className="min-h-[1.25rem] leading-relaxed my-0.5">
          {line}
        </div>
      );
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="glass-card w-full max-w-xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-tech via-perf to-wealth" />

        {/* Header */}
        <div className="p-6 border-b border-white/[0.06] flex justify-between items-start gap-4 bg-white/[0.01]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${CAT_COLORS[note.category] || 'text-muted'}`}>
                {note.category_display || note.category}
              </span>
              <span className="text-[10px] text-muted">{formattedDate}</span>
              <span className="text-[10px] text-muted">· ⏱️ {readTime} min read</span>
            </div>
            <h2 className="text-xl font-extrabold text-primary mt-2">{note.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-primary transition-colors p-2 hover:bg-white/5 rounded-xl border border-white/[0.05]"
          >
            ✕
          </button>
        </div>

        {/* Note Content Body */}
        <div className="flex-1 overflow-y-auto p-6 text-sm text-secondary whitespace-pre-wrap leading-relaxed">
          {note.content ? (
            <div className="space-y-0.5">{renderContentLines()}</div>
          ) : (
            <p className="text-muted italic">This note has no text content.</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2 bg-white/[0.01]">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!note.content}
              className="btn-ghost text-xs py-1.5 px-3"
              title="Copy note text"
            >
              {copied ? '✓ Copied' : '📋 Copy Text'}
            </button>
            <button
              onClick={() => onPatch(note.id, { is_pinned: !note.is_pinned })}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              {note.is_pinned ? '📌 Unpin' : '📌 Pin'}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(note);
              }}
              className="btn-ghost text-xs py-1.5 px-3"
            >
              ✏️ Edit
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this note?')) {
                  onDelete(note.id);
                  onClose();
                }
              }}
              className="btn-danger text-xs py-1.5 px-3"
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────
export default function NotesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCat] = useState('ALL');
  const [modal, setModal] = useState(null); // null | 'new' | noteObj
  const [selectedNote, setSelectedNote] = useState(null); // null | noteObj for reading

  const params = {
    ...(search ? { search } : {}),
    ...(category !== 'ALL' ? { category } : {}),
    is_archived: false,
  };

  const { data, isLoading } = useQuery({
    queryKey: ['notes', params],
    queryFn: () => getNotes(params).then((r) => r.data?.results ?? r.data ?? []),
  });

  const inv = () => qc.invalidateQueries({ queryKey: ['notes'] });

  const create = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      inv();
      setModal(null);
    }
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => updateNote(id, data),
    onSuccess: (updatedData) => {
      inv();
      setModal(null);
      // Update reading modal note details if open
      if (selectedNote && selectedNote.id === updatedData.data?.id) {
        setSelectedNote(updatedData.data);
      }
    }
  });

  const remove = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      inv();
      setSelectedNote(null);
    }
  });

  const handleSave = (form) => {
    const payload = { ...form, tags: '' };
    if (modal === 'new') {
      create.mutate(payload);
    } else {
      update.mutate({ id: modal.id, data: payload });
    }
  };

  const handlePatch = async (noteId, fields) => {
    const res = await patchNote(noteId, fields);
    inv();
    // Update local state if reading modal is open
    if (selectedNote && selectedNote.id === noteId) {
      setSelectedNote(prev => ({ ...prev, ...res.data }));
    }
  };

  const notes = Array.isArray(data) ? data : [];
  const pinned = notes.filter(n => n.is_pinned);
  const rest = notes.filter(n => !n.is_pinned);

  // Individual Pinned / General Note Card
  const Card = ({ note }) => {
    const catColorClass = 
      note.category === 'PERSONAL' ? 'from-tech to-tech/50' :
      note.category === 'WORK' ? 'from-yellow-400 to-yellow-500/50' :
      note.category === 'IDEAS' ? 'from-perf to-perf/50' :
      note.category === 'LEARNING' ? 'from-wealth to-wealth/50' :
      note.category === 'HEALTH' ? 'from-rose-400 to-rose-500/50' :
      note.category === 'FINANCE' ? 'from-emerald-400 to-emerald-500/50' :
      'from-white/20 to-white/10';

    const formattedDate = new Date(note.updated_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short'
    });

    const totalTasks = (note.content || '').match(/^-\s*\[[ x]\]/gim)?.length || 0;
    const completedTasks = (note.content || '').match(/^-\s*\[x\]/gim)?.length || 0;

    return (
      <div
        onClick={() => setSelectedNote(note)}
        className={`glass-card overflow-hidden hover:bg-white/[0.06] transition-all cursor-pointer group flex flex-col justify-between min-h-[170px] relative hover:-translate-y-0.5 border border-white/[0.05] hover:border-white/[0.12]
          ${note.is_pinned ? 'ring-1 ring-tech/20 bg-tech/[0.02]' : ''}`}
      >
        {/* Top category gradient bar */}
        <div className={`h-[3px] w-full bg-gradient-to-r ${catColorClass}`} />
        
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2.5 mb-2.5">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${CAT_COLORS[note.category] || 'text-muted'}`}>
                {note.category_display || note.category}
              </span>
              <div className="flex items-center gap-1.5">
                {totalTasks > 0 && (
                  <span className="text-[9px] text-secondary bg-white/5 px-1.5 py-0.5 rounded border border-white/[0.05] font-semibold">
                    ✅ {completedTasks}/{totalTasks}
                  </span>
                )}
                {note.is_pinned && <span className="text-xs" title="Pinned Note">📌</span>}
              </div>
            </div>
            
            <h3 className="font-extrabold text-primary text-sm leading-snug line-clamp-2">
              {note.title}
            </h3>
            
            {note.content && (
              <div className="text-secondary text-xs mt-3.5 line-clamp-4 leading-normal whitespace-pre-wrap relative overflow-hidden max-h-[72px]">
                {note.content}
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[hsl(220,17%,9%)] to-transparent pointer-events-none" />
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-white/[0.04] pt-3 text-[10px] text-muted">
            <span>{formattedDate}</span>
            
            {/* Quick action buttons */}
            <div className="flex gap-2.5 bg-white/5 border border-white/[0.05] px-2 py-0.5 rounded-lg">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModal(note);
                }}
                className="hover:text-primary text-secondary transition-colors text-[10px]"
                title="Edit"
              >
                ✏️
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePatch(note.id, { is_pinned: !note.is_pinned });
                }}
                className="hover:text-primary text-secondary transition-colors text-[10px]"
                title={note.is_pinned ? 'Unpin' : 'Pin'}
              >
                📌
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Delete this note?')) remove.mutate(note.id);
                }}
                className="hover:text-red-400 text-secondary transition-colors text-[10px]"
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* Editor Modal */}
      {modal !== null && (
        <NoteModal
          note={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={create.isPending || update.isPending}
        />
      )}

      {/* Reader Modal */}
      {selectedNote !== null && (
        <NoteReaderModal
          note={selectedNote}
          onClose={() => setSelectedNote(null)}
          onEdit={(n) => setModal(n)}
          onDelete={(id) => remove.mutate(id)}
          onPatch={handlePatch}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            <span>🗒️</span> Personal Notes
          </h1>
          <p className="text-secondary text-sm mt-1">Write your daily logs, pin board cards, and remember everything that matters.</p>
        </div>
        <button id="new-note-btn" onClick={() => setModal('new')} className="btn-primary w-full sm:w-auto">
          + New Note
        </button>
      </div>

      {/* Search + category filtering tabs */}
      <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
        <input
          placeholder="🔍 Search notes by title or content…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 max-w-lg"
        />
        
        {/* Category list scroll tabs */}
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 overflow-x-auto scrollbar-none self-start md:self-center">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150
                ${category === c ? 'bg-white/10 text-primary shadow-sm' : 'text-muted hover:text-secondary'}`}
            >
              {c === 'ALL' ? 'All' : c.charAt(0) + c.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="h-40 glass-card animate-pulse" />)}
        </div>
      )}

      {!isLoading && notes.length === 0 && (
        <div className="glass-card text-center py-16 space-y-4">
          <p className="text-4xl block">🗒️</p>
          <p className="text-secondary text-sm">No notes found matching your filters.</p>
          <button onClick={() => setModal('new')} className="btn-primary">Create a Note</button>
        </div>
      )}

      {/* Pinned grid */}
      {pinned.length > 0 && (
        <div className="space-y-3">
          <p className="label">📌 Pinned Notes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pinned.map(n => <Card key={n.id} note={n} />)}
          </div>
        </div>
      )}

      {/* General grid */}
      {rest.length > 0 && (
        <div className="space-y-3">
          {pinned.length > 0 && <p className="label">Other Notes</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rest.map(n => <Card key={n.id} note={n} />)}
          </div>
        </div>
      )}
    </div>
  );
}
