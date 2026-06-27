import React from 'react';

/**
 * CalendarSnapshot
 * Renders a compact 5×7 grid representing the past 30 days.
 * Highlights the days that appear in `dashData?.logDates` (array of ISO date strings).
 */
const CalendarSnapshot = ({ logDates = [] }) => {
  // Build an array of Date objects for the last 30 days (including today)
  const today = new Date();
  const days = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.unshift(d); // earliest first
  }

  // Convert logDates to a Set of YYYY-MM-DD strings for fast lookup
  const loggedSet = new Set(logDates.map((d) => new Date(d).toISOString().split('T')[0]));

  return (
    <div className="mt-4">
      <div className="grid grid-cols-7 gap-1">
        {days.map((date) => {
          const iso = date.toISOString().split('T')[0];
          const isLogged = loggedSet.has(iso);
          return (
            <div
              key={iso}
              className={`w-5 h-5 rounded-sm border border-white/10 ${isLogged ? 'bg-primary/30' : 'bg-transparent'}`}
              title={iso}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CalendarSnapshot;
