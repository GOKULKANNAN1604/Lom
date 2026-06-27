/**
 * src/utils/dateHelpers.js
 * Lightweight date utilities — no external library needed.
 */

/** Format a Date to 'YYYY-MM-DD' */
export const format = (date) => {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/** Subtract N days from a date, returns a new Date */
export const subDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() - n);
  return d;
};

/** Add N days to a date, returns a new Date */
export const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
};

/** Returns every Date in [start, end] inclusive */
export const eachDayOfInterval = (start, end) => {
  const days = [];
  const cur  = new Date(start);
  cur.setHours(0, 0, 0, 0);
  const fin  = new Date(end);
  fin.setHours(0, 0, 0, 0);
  while (cur <= fin) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
};

/** Get the day-of-week index (0=Sun … 6=Sat) */
export const getDayOfWeek = (date) => new Date(date).getDay();

/** Get short month label — 'Jan', 'Feb' … */
export const getMonthLabel = (date) =>
  new Date(date).toLocaleDateString('en-US', { month: 'short' });

/** Human-readable: 'June 23, 2026' */
export const formatLong = (dateStr) =>
  new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

/** Returns today as 'YYYY-MM-DD' */
export const today = () => format(new Date());
