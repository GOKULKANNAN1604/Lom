/**
 * src/components/dashboard/LogForm.jsx
 *
 * Daily Activity Log Form — smart multi-pillar form component.
 * Supports Performance / Study / Tech pillars.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  useCreatePerformanceLog,
  useCreateStudyLog,
  useCreateTechLog,
} from '../../hooks/usePillarData';
import { today } from '../../utils/dateHelpers';

// ── Pillar metadata ──────────────────────────────────────────
const PILLARS = {
  performance: {
    label:    '🔥 Performance',
    accent:   'perf',
    borderCls:'border-l-perf',
    ringCls:  'focus:ring-perf/60 focus:border-perf/60',
    choices: [
      { value: 'GYM',    label: 'Gym / Weight Training' },
      { value: 'CARDIO', label: 'Cardio / Running'      },
      { value: 'YOGA',   label: 'Yoga / Flexibility'    },
      { value: 'SPORTS', label: 'Sports / Recreation'   },
      { value: 'REST',   label: 'Active Rest'           },
    ],
  },
  study: {
    label:    '📚 Study',
    accent:   'study',
    borderCls:'border-l-study',
    ringCls:  'focus:ring-study/60 focus:border-study/60',
    choices: [
      { value: 'BOOK',     label: 'Book Reading'          },
      { value: 'COURSE',   label: 'Online Course / Video' },
      { value: 'REVISION', label: 'Revision / Review'     },
      { value: 'PRACTICE', label: 'Practice / Labs'       },
    ],
  },
  tech: {
    label:    '💻 Tech',
    accent:   'tech',
    borderCls:'border-l-tech',
    ringCls:  'focus:ring-tech/60 focus:border-tech/60',
    choices: [
      { value: 'CODE',    label: 'Coding / Development'    },
      { value: 'COURSE',  label: 'Online Course'           },
      { value: 'PROJECT', label: 'Side Project'            },
      { value: 'READ',    label: 'Technical Reading'       },
      { value: 'DSA',     label: 'DSA / Interview Prep'    },
      { value: 'OSS',     label: 'Open Source'             },
    ],
  },
};

// ── Prefilled Exercise List for Gym Workout ──────────────────
const EXERCISE_LIST = {
  'Chest': [
    'Flat Barbell Bench Press',
    'Incline Barbell Bench Press',
    'Decline Barbell Bench Press',
    'Flat Dumbbell Bench Press',
    'Incline Dumbbell Bench Press',
    'Decline Dumbbell Bench Press',
    'Dumbbell Chest Flyes',
    'Incline Dumbbell Flyes',
    'Cable Crossovers (Upper Chest)',
    'Cable Crossovers (Lower Chest)',
    'Push-ups (Standard)',
    'Decline Push-ups',
    'Incline Push-ups',
    'Chest Press Machine',
    'Incline Chest Press Machine',
    'Pec Deck Flyes',
    'Chest Dips',
    'Dumbbell Pull-overs'
  ],
  'Back & Lats': [
    'Conventional Deadlift',
    'Sumo Deadlift',
    'Bent-over Barbell Row (Overhand)',
    'Bent-over Barbell Row (Underhand)',
    'Lat Pulldown (Wide Grip)',
    'Lat Pulldown (Close Grip)',
    'Seated Cable Row (V-Bar)',
    'Seated Cable Row (Wide Grip)',
    'Pull-ups (Wide Grip)',
    'Chin-ups',
    'One-Arm Dumbbell Row',
    'T-Bar Row',
    'Face Pulls',
    'Rack Pulls',
    'Straight-Arm Cable Pull-downs',
    'Hyperextensions (Back)',
    'Chest-Supported Dumbbell Row',
    'Single-Arm Lat Pulldown',
    'Barbell Shrugs',
    'Dumbbell Shrugs'
  ],
  'Shoulders': [
    'Overhead Barbell Press (OHP)',
    'Seated Dumbbell Shoulder Press',
    'Dumbbell Lateral Raise (Standing)',
    'Dumbbell Lateral Raise (Seated)',
    'Cable Lateral Raise (Behind Back)',
    'Front Dumbbell Raise',
    'Front Barbell Raise',
    'Reverse Dumbbell Flyes (Rear Delt)',
    'Reverse Cable Flyes (Rear Delt)',
    'Pec Deck Rear Delt Flyes',
    'Arnold Press',
    'Barbell Upright Rows',
    'Dumbbell Upright Rows',
    'Smith Machine Overhead Press'
  ],
  'Biceps': [
    'Barbell Bicep Curl',
    'EZ-Bar Bicep Curl',
    'Dumbbell Alternate Bicep Curl',
    'Incline Dumbbell Curl',
    'Hammer Curl (Dumbbell)',
    'Rope Hammer Curl (Cable)',
    'Preacher EZ Bar Curl',
    'Dumbbell Preacher Curl',
    'Cable Bicep Curl (Straight Bar)',
    'Concentration Curls',
    'Spider Curls (Dumbbell)',
    '21s Bicep Curl',
    'Behind-the-Back Cable Curl'
  ],
  'Triceps': [
    'Overhead Dumbbell Tricep Extension',
    'Overhead Cable Tricep Extension',
    'Tricep Rope Pushdown',
    'Tricep Straight Bar Pushdown',
    'EZ Bar Skull Crushers',
    'Dumbbell Skull Crushers',
    'Weighted Bench Dips',
    'Parallel Bar Dips (Triceps Focus)',
    'Close-Grip Bench Press',
    'Cable Overhead Tricep Extension',
    'Dumbbell Tricep Kickbacks',
    'Single-Arm Cable Tricep Pushdown'
  ],
  'Legs': [
    'Barbell Back Squat',
    'Barbell Front Squat',
    'Smith Machine Squat',
    'Romanian Deadlift (RDL) - Barbell',
    'Romanian Deadlift (RDL) - Dumbbell',
    'Leg Press (Horizontal)',
    'Leg Press (Incline)',
    'Bulgarian Split Squat (Dumbbell)',
    'Bulgarian Split Squat (Barbell)',
    'Dumbbell Walking Lunges',
    'Barbell Reverse Lunges',
    'Lying Leg Curl (Machine)',
    'Seated Leg Curl (Machine)',
    'Leg Extensions (Machine)',
    'Standing Calf Raise (Machine)',
    'Seated Calf Raise (Machine)',
    'Donkey Calf Raises',
    'Hip Thrusts (Barbell)',
    'Goblet Squat (Dumbbell)',
    'Hack Squats (Machine)'
  ],
  'Core': [
    'Hanging Leg Raise',
    'Hanging Knee Raise',
    'Cable Crunches (Kneeling)',
    'Weighted Russian Twists',
    'Forearm Planks (Standard)',
    'Side Planks (Left/Right)',
    'Ab Wheel Rollouts',
    'Decline Bench Crunches',
    'Hollow Body Holds',
    'Captain\'s Chair Leg Raises',
    'Woodchoppers (Cable)',
    'Bicycle Crunches',
    'Toe Touches'
  ]
};

// ── Default form state per pillar ────────────────────────────
const defaultState = {
  performance: {
    date_logged: today(), activity_type: 'GYM',
    duration_mins: '', calories_burned: '', is_rest_day: false, notes: '',
  },
  study: {
    date_logged: today(), activity_type: 'BOOK', topic: '',
    duration_mins: '', pages_read: '', notes: '',
  },
  tech: {
    date_logged: today(), category: 'CODE', topic: '',
    duration_mins: '', github_committed: false, notes: '', resources_url: '',
  },
};

// ── Sub-component: Labelled input ────────────────────────────
function Field({ id, label, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Sub-component: Success Toast ─────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div className="absolute top-4 right-4 z-10 animate-fade-in">
      <div className="glass-card px-4 py-3 text-sm text-green-400 border-green-500/20 flex items-center gap-2">
        <span>✅</span> {message}
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function LogForm({ defaultPillar = 'tech', lockPillar = false, initialData = null, onSuccess, onClose }) {
  const [pillar,  setPillar]  = useState(defaultPillar === 'wealth' ? 'study' : defaultPillar);
  const [form,    setForm]    = useState(defaultState[pillar]);
  const [errors,  setErrors]  = useState({});
  const [success, setSuccess] = useState('');

  // Gym Workout dynamic sets list state & Modal visibility
  const [exercises, setExercises] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync initialData if provided
  useEffect(() => {
    if (initialData) {
      setForm((f) => ({ ...f, ...initialData }));
      setExercises([]);
    }
  }, [initialData]);

  const createPerf   = useCreatePerformanceLog();
  const createStudy  = useCreateStudyLog();
  const createTech   = useCreateTechLog();

  const mutation = { performance: createPerf, study: createStudy, tech: createTech }[pillar];
  const meta     = PILLARS[pillar];

  // ── Switch pillar — reset form ───────────────────────────
  const switchPillar = (p) => {
    setPillar(p);
    setForm(defaultState[p]);
    setErrors({});
    setExercises([]);
  };

  // ── Field change handler ─────────────────────────────────
  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  // Exercise and sets handlers
  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        id: Date.now(),
        category: 'Chest',
        name: EXERCISE_LIST['Chest'][0],
        customName: '',
        sets: [{ id: Date.now() + 1, weight: '', reps: '' }]
      }
    ]);
  };

  const removeExercise = (exId) => {
    setExercises(exercises.filter(e => e.id !== exId));
  };

  const updateExercise = (exId, field, value) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        const updated = { ...e, [field]: value };
        if (field === 'category') {
          updated.name = value === 'Custom' ? '' : EXERCISE_LIST[value][0];
        }
        return updated;
      }
      return e;
    }));
  };

  const addSet = (exId) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        return {
          ...e,
          sets: [...e.sets, { id: Date.now(), weight: '', reps: '' }]
        };
      }
      return e;
    }));
  };

  const removeSet = (exId, setId) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        return {
          ...e,
          sets: e.sets.filter(s => s.id !== setId)
        };
      }
      return e;
    }));
  };

  const updateSet = (exId, setId, field, value) => {
    setExercises(exercises.map(e => {
      if (e.id === exId) {
        return {
          ...e,
          sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        };
      }
      return e;
    }));
  };

  // ── Client-side validation ───────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.date_logged) errs.date_logged = 'Date is required.';

    if (pillar === 'performance') {
      if (!form.is_rest_day && form.duration_mins === '')
        errs.duration_mins = 'Duration is required for active sessions.';
    }
    if (pillar === 'study') {
      if (!form.topic.trim())
        errs.topic = 'Topic/Subject is required.';
      if (form.duration_mins === '')
        errs.duration_mins = 'Duration is required.';
    }
    if (pillar === 'tech') {
      if (!form.topic.trim() || form.topic.trim().length < 3)
        errs.topic = 'Topic must be at least 3 characters.';
    }

    return errs;
  };

  // ── Submit handler ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    // Clean up empty strings → null for optional numeric fields
    const payload = { ...form };
    ['duration_mins', 'calories_burned', 'pages_read'].forEach((k) => {
      if (payload[k] === '') payload[k] = null;
    });

    // If Gym builder exercises are logged, compile into notes
    if (pillar === 'performance' && form.activity_type === 'GYM' && !form.is_rest_day && exercises.length > 0) {
      const lines = [];
      exercises.forEach((ex) => {
        const finalName = ex.category === 'Custom' ? ex.customName : ex.name;
        if (!finalName.trim()) return;
        const validSets = ex.sets.filter(s => s.weight !== '' || s.reps !== '');
        if (validSets.length === 0) return;

        lines.push(`- ${finalName} (${ex.category}):`);
        validSets.forEach((s, sIdx) => {
          const wt = s.weight ? `${s.weight}kg` : '';
          const rp = s.reps ? `${s.reps} reps` : '';
          const details = [wt, rp].filter(Boolean).join(' x ');
          lines.push(`  * Set ${sIdx + 1}: ${details}`);
        });
      });

      if (lines.length > 0) {
        const breakdownText = `🏋️‍♂️ Workout Sets:\n${lines.join('\n')}`;
        payload.notes = form.notes.trim()
          ? `${breakdownText}\n\nAdditional Notes: ${form.notes}`
          : breakdownText;
      }
    }

    try {
      await mutation.mutateAsync(payload);
      setSuccess(`${meta.label.split(' ')[1]} log saved!`);
      setForm(defaultState[pillar]);
      setExercises([]);
      setErrors({});
      if (onSuccess) {
        setTimeout(onSuccess, 800);
      }
    } catch (err) {
      const serverErrors = err.response?.data || {};
      const mapped = {};
      Object.entries(serverErrors).forEach(([k, v]) => {
        mapped[k] = Array.isArray(v) ? v[0] : v;
      });
      setErrors(mapped);
    }
  };

  const inp = `input ${meta.ringCls}`;

  return (
    <div className={`glass-card border-l-4 ${meta.borderCls} p-6 relative overflow-hidden animate-fade-in`}>
      {success && <Toast message={success} onDismiss={() => setSuccess('')} />}

      {onClose && (
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 text-muted hover:text-primary transition-colors text-sm px-2 py-1.5 hover:bg-white/5 rounded-xl border border-white/[0.05] z-10 cursor-pointer"
        >
          ✕
        </button>
      )}

      {/* Header */}
      <h2 className="text-lg font-semibold text-primary mb-1">
        {lockPillar ? `Log ${meta.label.split(' ')[1]}` : "Log Today's Activity"}
      </h2>
      <p className="text-xs text-muted mb-5">
        {lockPillar ? `Add a new entry for your ${pillar} tracker` : "Track your daily progress across all pillars"}
      </p>

      {/* Pillar selector tabs */}
      {!lockPillar && (
        <div className="flex gap-1 bg-white/[0.04] rounded-xl p-1 mb-6">
          {Object.entries(PILLARS).map(([key, { label }]) => (
            <button
              key={key}
              id={`log-tab-${key}`}
              type="button"
              onClick={() => switchPillar(key)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200
                ${pillar === key
                  ? 'bg-white/[0.10] text-primary shadow'
                  : 'text-muted hover:text-secondary'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Date */}
        <Field id="date_logged" label="Date" error={errors.date_logged}>
          <input
            id="date_logged" name="date_logged" type="date"
            className={inp} value={form.date_logged} onChange={handle}
            max={today()} required
          />
        </Field>

        {/* ── PERFORMANCE fields ── */}
        {pillar === 'performance' && (
          <>
            <Field id="activity_type" label="Activity type" error={errors.activity_type}>
              <select id="activity_type" name="activity_type" className={inp} value={form.activity_type} onChange={handle}>
                {meta.choices.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            {/* Rest day toggle */}
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input
                  id="is_rest_day" name="is_rest_day" type="checkbox"
                  className="sr-only peer" checked={form.is_rest_day} onChange={handle}
                />
                <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:bg-perf/70 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="text-sm text-secondary">Mark as rest day</span>
            </label>

            {!form.is_rest_day && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <Field id="duration_mins" label="Duration (mins)" error={errors.duration_mins}>
                    <input id="duration_mins" name="duration_mins" type="number"
                      className={inp} placeholder="60" min="1" max="480"
                      value={form.duration_mins} onChange={handle} />
                  </Field>
                  <Field id="calories_burned" label="Calories burned" error={errors.calories_burned}>
                    <input id="calories_burned" name="calories_burned" type="number"
                      className={inp} placeholder="400" min="1"
                      value={form.calories_burned} onChange={handle} />
                  </Field>
                </div>

                {/* Workout Sets Summary & Modal Trigger */}
                {form.activity_type === 'GYM' && (
                  <div className="space-y-3 border-t border-white/[0.05] pt-3 mt-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                        <span>🏋️‍♂️</span> Workout Sets
                      </h3>
                      {exercises.length > 0 && (
                        <span className="text-[10px] text-perf font-extrabold uppercase bg-perf/15 px-2 py-0.5 rounded-md border border-perf/10">
                          {exercises.length} Exercises
                        </span>
                      )}
                    </div>

                    {exercises.length > 0 ? (
                      <div className="bg-white/[0.01] border border-white/[0.03] p-2.5 rounded-xl space-y-1.5">
                        {exercises.map((ex, idx) => {
                          const finalName = ex.category === 'Custom' ? ex.customName : ex.name;
                          return (
                            <div key={ex.id} className="text-[10px] text-secondary flex justify-between">
                              <span className="truncate font-semibold max-w-[70%] text-left">
                                {idx + 1}. {finalName || 'Unnamed'}
                              </span>
                              <span className="text-muted shrink-0">
                                {ex.sets.length} sets ({ex.sets.filter(s => s.weight || s.reps).length} logged)
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-[10px] text-muted italic">No exercises added yet.</p>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="w-full text-center py-2 border border-dashed border-white/20 hover:border-perf hover:text-perf text-xs text-secondary rounded-xl transition-all cursor-pointer bg-white/[0.01] hover:bg-perf/[0.02]"
                    >
                      {exercises.length > 0 ? '📋 Edit Workout Sets & Reps' : '🏋️‍♂️ Add Workout Sets & Reps'}
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── STUDY fields ── */}
        {pillar === 'study' && (
          <>
            <Field id="activity_type" label="Activity type" error={errors.activity_type}>
              <select id="activity_type" name="activity_type" className={inp} value={form.activity_type} onChange={handle}>
                {meta.choices.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field id="topic" label="Topic / Subject" error={errors.topic}>
              <input id="topic" name="topic" type="text"
                className={inp} placeholder="e.g. Django ORM, React Hooks"
                value={form.topic} onChange={handle} required />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field id="duration_mins" label="Duration (mins)" error={errors.duration_mins}>
                <input id="duration_mins" name="duration_mins" type="number"
                  className={inp} placeholder="45" min="1"
                  value={form.duration_mins} onChange={handle} required />
              </Field>
              <Field id="pages_read" label="Pages read (optional)" error={errors.pages_read}>
                <input id="pages_read" name="pages_read" type="number"
                  className={inp} placeholder="10" min="1"
                  value={form.pages_read} onChange={handle} />
              </Field>
            </div>
          </>
        )}

        {/* ── TECH fields ── */}
        {pillar === 'tech' && (
          <>
            <Field id="category" label="Category" error={errors.category}>
              <select id="category" name="category" className={inp} value={form.category} onChange={handle}>
                {meta.choices.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </Field>

            <Field id="topic" label="Topic / Task" error={errors.topic}>
              <input id="topic" name="topic" type="text"
                className={inp} placeholder="e.g. Django REST Framework, LeetCode #234"
                value={form.topic} onChange={handle} required />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field id="duration_mins" label="Duration (mins)" error={errors.duration_mins}>
                <input id="duration_mins" name="duration_mins" type="number"
                  className={inp} placeholder="90" min="1"
                  value={form.duration_mins} onChange={handle} />
              </Field>
              <div className="flex flex-col justify-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input id="github_committed" name="github_committed" type="checkbox"
                    className="w-4 h-4 rounded accent-tech"
                    checked={form.github_committed} onChange={handle} />
                  <span className="text-sm text-secondary">GitHub commit today</span>
                </label>
              </div>
            </div>

            <Field id="resources_url" label="Resource URL (optional)" error={errors.resources_url}>
              <input id="resources_url" name="resources_url" type="url"
                className={inp} placeholder="https://docs.djangoproject.com/..."
                value={form.resources_url} onChange={handle} />
            </Field>
          </>
        )}

        {/* Notes — shared across all pillars */}
        <Field id="notes" label="Notes (optional)" error={errors.notes}>
          <textarea
            id="notes" name="notes" rows={3}
            className={`${inp} resize-none`}
            placeholder={
              pillar === 'performance' ? 'How did it feel? Any PRs?' :
              pillar === 'study'       ? 'Key takeaways, notes, or solutions…' :
                                         'Key takeaways, blockers, or resources…'
            }
            value={form.notes} onChange={handle}
          />
        </Field>

        {/* Server-level error */}
        {errors.non_field_errors && (
          <p className="text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">
            {errors.non_field_errors}
          </p>
        )}

        {/* Submit */}
        <button
          id="log-submit"
          type="submit"
          disabled={mutation.isPending}
          className={`btn-primary w-full mt-2 ${
            pillar === 'performance' ? 'bg-perf hover:bg-perf-dark shadow-glow-perf' :
            pillar === 'study'       ? 'bg-study hover:bg-study-dark shadow-glow-study' :
                                       ''
          }`}
        >
          {mutation.isPending ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Saving…
            </span>
          ) : (
            `Save ${meta.label} Log`
          )}
        </button>
      </form>

      {/* Spacious Workout Sets Modal Dialog Box Overlay */}
      {isModalOpen && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-white/[0.08] rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col p-6 shadow-2xl animate-modal-zoom relative text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div>
                <h3 className="text-lg font-black text-primary flex items-center gap-2">
                  <span>🏋️‍♂️</span> Workout Sets Builder
                </h3>
                <p className="text-xs text-muted">Log your exercises, weights, and reps comfortably</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-muted hover:text-primary transition-colors text-sm px-2.5 py-1.5 hover:bg-white/5 rounded-xl border border-white/[0.05]"
              >
                ✕
              </button>
            </div>

            {/* Modal Body (Scrollable list) */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 my-4">
              {exercises.length === 0 ? (
                <div className="text-center py-12 text-muted">
                  <span className="text-4xl">🏋️‍♂️</span>
                  <p className="text-sm mt-2 font-medium">Your exercise log is empty.</p>
                  <p className="text-xs text-muted mt-1">Click "+ Add Exercise" below to start logging sets.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {exercises.map((ex, exIdx) => (
                    <div 
                      key={ex.id} 
                      className="p-5 bg-white/[0.02] border border-white/[0.05] rounded-2xl space-y-4 relative"
                    >
                      <button
                        type="button"
                        onClick={() => removeExercise(ex.id)}
                        className="absolute top-4 right-4 text-xs font-bold text-muted hover:text-rose-400 transition-colors p-1.5 hover:bg-rose-500/10 rounded-lg"
                        title="Remove exercise"
                      >
                        ✕ Remove
                      </button>

                      {/* Select Dropdowns */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pr-16 sm:pr-0">
                        <div>
                          <label className="text-[10px] font-black uppercase text-muted tracking-wider">Muscle Group</label>
                          <select
                            value={ex.category}
                            onChange={(e) => updateExercise(ex.id, 'category', e.target.value)}
                            className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-2 mt-1"
                          >
                            {Object.keys(EXERCISE_LIST).map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                            <option value="Custom">Custom Exercise</option>
                          </select>
                        </div>

                        {ex.category !== 'Custom' ? (
                          <div>
                            <label className="text-[10px] font-black uppercase text-muted tracking-wider">Exercise Name</label>
                            <select
                              value={ex.name}
                              onChange={(e) => updateExercise(ex.id, 'name', e.target.value)}
                              className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-2 mt-1"
                            >
                              {EXERCISE_LIST[ex.category].map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div>
                            <label className="text-[10px] font-black uppercase text-muted tracking-wider">Custom Exercise Name</label>
                            <input
                              type="text"
                              placeholder="e.g. Pec Deck Flyes"
                              value={ex.customName}
                              onChange={(e) => updateExercise(ex.id, 'customName', e.target.value)}
                              className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-2 mt-1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Sets list */}
                      <div className="space-y-3 pt-3 border-t border-white/[0.04]">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-secondary tracking-wider">Logged Sets</span>
                          <button
                            type="button"
                            onClick={() => addSet(ex.id)}
                            className="text-[10px] text-perf hover:text-white font-extrabold uppercase border border-perf/30 hover:border-perf px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                          >
                            + Add Set
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          {ex.sets.map((set, setIdx) => (
                            <div key={set.id} className="flex items-center gap-3">
                              <span className="text-xs text-muted w-12 font-bold">Set {setIdx + 1}</span>
                              <div className="grid grid-cols-2 gap-3 flex-1">
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Weight"
                                    value={set.weight}
                                    onChange={(e) => updateSet(ex.id, set.id, 'weight', e.target.value)}
                                    className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-2 pr-8"
                                    min="0"
                                  />
                                  <span className="absolute right-3 top-2.5 text-[9px] text-muted font-bold">kg</span>
                                </div>
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Reps"
                                    value={set.reps}
                                    onChange={(e) => updateSet(ex.id, set.id, 'reps', e.target.value)}
                                    className="input focus:ring-perf/60 focus:border-perf/60 text-xs py-2 pr-10"
                                    min="0"
                                  />
                                  <span className="absolute right-3 top-2.5 text-[9px] text-muted font-bold">reps</span>
                                </div>
                              </div>
                              {ex.sets.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeSet(ex.id, set.id)}
                                  className="p-2 text-muted hover:text-rose-400 cursor-pointer hover:bg-rose-500/10 rounded-lg transition-all"
                                  title="Remove set"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06] mt-auto">
              <button
                type="button"
                onClick={() => setExercises([])}
                className="px-4 py-2 border border-white/[0.08] hover:border-rose-500/20 text-muted hover:text-rose-400 text-xs rounded-xl transition-all cursor-pointer hover:bg-rose-500/5 font-semibold"
              >
                Clear All
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addExercise}
                  className="px-4 py-2 border border-white/[0.08] hover:border-perf/30 text-secondary hover:text-perf text-xs rounded-xl transition-all cursor-pointer hover:bg-perf/5 font-bold"
                >
                  + Add Exercise
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 bg-perf hover:bg-perf-dark text-white text-xs rounded-xl font-bold transition-all shadow-glow-perf cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
