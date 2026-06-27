/**
 * src/pages/Dashboard.jsx
 *
 * Re-imagined Mobile-First Dashboard — acts as a personal command center.
 * Features:
 *  - Welcoming Header with localized date
 *  - Habit Completion Circles (closes loops when logs are entered)
 *  - Horizontal Quick Log Actions (opens forms in modal drawers)
 *  - Compact Streaks Summary Row
 *  - 2-Column Grid: Today's Timeline Feed + Quick Vault Credentials
 *  - Swipeable Consistency Heatmap (at the bottom)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import useAuth from '../hooks/useAuth';
import { useDashboard } from '../hooks/usePillarData';
import { getProfile } from '../api/profile';
import TodayFeed from '../components/dashboard/TodayFeed';
import ConsistencyHeatmap from '../components/dashboard/ConsistencyHeatmap';
import LogForm from '../components/dashboard/LogForm';
import WeatherChip from '../components/dashboard/WeatherChip';
import QuoteCard from '../components/dashboard/QuoteCard';
import CalendarSnapshot from '../components/dashboard/CalendarSnapshot';
import { useTheme } from '../context/ThemeContext';

// Greeting helper
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeLogPillar, setActiveLogPillar] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);

  // Load aggregated dashboard data
  const { data: dashData, refetch: refetchDash } = useDashboard();

  // Load locker profile details for quick dashboard cards
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => getProfile().then((r) => r.data),
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const hasPerf = dashData?.performance?.length > 0;
  const { theme, toggleTheme } = useTheme();

  const hasTech = dashData?.tech?.length > 0;
  const hasJournal = dashData?.journal_written === true;

  const totalHabits = 3;
  const completedCount = [hasPerf, hasTech, hasJournal].filter(Boolean).length;
  const completionPercent = Math.round((completedCount / totalHabits) * 100);

  // Copy handler
  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const modalClose = () => {
    setActiveLogPillar(null);
    refetchDash(); // Refresh checks and timeline
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl mx-auto space-y-6">
      
      {/* 1. Welcome Hero Banner (Mesh Gradient Glassmorphism) */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-900/30 via-slate-900/60 to-purple-950/30 p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-3 z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.04] border border-white/[0.08] text-indigo-300">
            ⚡ COMMAND CENTER
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight">
            {getGreeting()},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
              {user?.username}
            </span> 👋
          </h1>
          <p className="text-secondary text-sm font-medium">Track your habits. Secure your data. Close your daily circles.</p>
          
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Active Clock + Weather */}
            <div className="flex items-center gap-2 max-w-full overflow-hidden">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/[0.03] dark:bg-black/30 border border-border shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-mono font-bold tracking-wider text-emerald-450 dark:text-emerald-400">
                  {timeString}
                </span>
              </div>
              <WeatherChip />
            </div>
            {/* Date */}
            <div className="text-[10px] tracking-wider uppercase text-muted font-bold px-3 py-2 rounded-xl bg-white/[0.02] border border-border">
              {new Date().toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </div>
          </div>
        </div>

        {/* Right: SVG Apple Ring */}
        <div className="flex items-center gap-5 bg-white/[0.02] border border-white/[0.04] p-4 rounded-2xl md:self-stretch justify-center md:justify-start z-10 backdrop-blur-md">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Background track circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                className="stroke-white/[0.04]"
                strokeWidth="6"
                fill="transparent"
              />
              {/* Glowing progress circle */}
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="url(#progressGradient)"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray="213.6"
                strokeDashoffset={213.6 - (213.6 * completionPercent) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            {completionPercent === 100 && (
              <span className="absolute -top-1 -right-1 text-base animate-bounce">✨</span>
            )}
            <div className="absolute text-center">
              <span className="text-sm font-extrabold text-primary font-sans">{completionPercent}%</span>
            </div>
          </div>
          
          <div>
            <p className="text-[11px] font-bold text-muted uppercase tracking-wider">Daily Loop</p>
            <p className="text-lg font-black text-primary tracking-tight mt-0.5">{completedCount}/{totalHabits} Done</p>
            <p className="text-[10px] text-secondary mt-1">
              {completionPercent === 100 ? '🎉 All circles closed!' : 'Keep going! Close all loops.'}
            </p>
          </div>
        </div>
      </div>
      {/* Motivational Quote */}
      <QuoteCard />

      {/* 2. Interactive Unified Habit & Streak Cards (Grid layout) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Fitness Card */}
        <div
          onClick={() => setActiveLogPillar('performance')}
          className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px]
            ${hasPerf 
              ? 'bg-perf/10 border-perf/40 shadow-[0_0_20px_rgba(249,115,22,0.12)] hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]' 
              : 'border-dashed border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
            }`}
        >
          {hasPerf && (
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-perf/10 rounded-full blur-xl pointer-events-none" />
          )}
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏋️‍♂️</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${hasPerf ? 'text-primary' : 'text-muted'}`}>
                Fitness
              </span>
            </div>
            {hasPerf ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                ✓
              </span>
            ) : (
              <span className="text-[10px] text-muted font-bold group-hover:text-primary transition-colors">
                + Log
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black tracking-tight font-sans ${hasPerf ? 'text-perf' : 'text-muted'}`}>
                {dashData?.streaks?.performance?.current || 0}
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">day streak</span>
            </div>
            
            <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-perf rounded-full transition-all duration-700"
                style={{
                  width: (dashData?.streaks?.performance?.longest || 0) > 0
                    ? `${Math.round(((dashData?.streaks?.performance?.current || 0) / (dashData?.streaks?.performance?.longest || 0)) * 100)}%`
                    : '0%',
                }}
              />
            </div>
            
            <p className="text-[9px] text-muted mt-1.5 uppercase font-bold tracking-wider">
              Best: {dashData?.streaks?.performance?.longest || 0} days
            </p>
          </div>
        </div>

        {/* Tech Card (Coding) */}
        <div
          onClick={() => setActiveLogPillar('tech')}
          className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px]
            ${hasTech 
              ? 'bg-tech/10 border-tech/40 shadow-[0_0_20px_rgba(59,130,246,0.12)] hover:shadow-[0_0_25px_rgba(59,130,246,0.2)]' 
              : 'border-dashed border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
            }`}
        >
          {hasTech && (
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-tech/10 rounded-full blur-xl pointer-events-none" />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">💻</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${hasTech ? 'text-primary' : 'text-muted'}`}>
                Coding
              </span>
            </div>
            {hasTech ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                ✓
              </span>
            ) : (
              <span className="text-[10px] text-muted font-bold group-hover:text-primary transition-colors">
                + Log
              </span>
            )}
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-black tracking-tight font-sans ${hasTech ? 'text-tech' : 'text-muted'}`}>
                {dashData?.streaks?.tech?.current || 0}
              </span>
              <span className="text-[10px] text-muted font-bold uppercase tracking-wider">day streak</span>
            </div>

            <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
              <div
                className="h-full bg-tech rounded-full transition-all duration-700"
                style={{
                  width: (dashData?.streaks?.tech?.longest || 0) > 0
                    ? `${Math.round(((dashData?.streaks?.tech?.current || 0) / (dashData?.streaks?.tech?.longest || 0)) * 100)}%`
                    : '0%',
                }}
              />
            </div>

            <p className="text-[9px] text-muted mt-1.5 uppercase font-bold tracking-wider">
              Best: {dashData?.streaks?.tech?.longest || 0} days
            </p>
          </div>
        </div>

        {/* Diary Card */}
        <div
          onClick={() => navigate('/journal')}
          className={`group cursor-pointer rounded-2xl border p-5 transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[155px]
            ${hasJournal 
              ? 'bg-purple-500/10 border-purple-500/40 shadow-[0_0_20px_rgba(168,85,247,0.12)] hover:shadow-[0_0_25px_rgba(168,85,247,0.25)]' 
              : 'border-dashed border-white/10 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.02]'
            }`}
        >
          {hasJournal && (
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none" />
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📓</span>
              <span className={`text-xs font-bold uppercase tracking-wider ${hasJournal ? 'text-primary' : 'text-muted'}`}>
                Diary
              </span>
            </div>
            {hasJournal ? (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                ✓
              </span>
            ) : (
              <span className="text-[10px] text-muted font-bold group-hover:text-primary transition-colors">
                + Write
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col justify-end h-full pb-1">
            <p className={`text-sm font-bold ${hasJournal ? 'text-purple-400' : 'text-muted'}`}>
              {hasJournal ? 'Completed today' : 'No entry today'}
            </p>
            <p className="text-[9px] text-muted mt-1 uppercase font-bold tracking-wider">
              {hasJournal ? 'Reflections saved' : 'Tap to write thoughts'}
            </p>
          </div>
        </div>
      </div>

      {/* 3. Simplified Quick Actions (for Notes and quick navigations) */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Quick Access:</span>
        <button
          onClick={() => navigate('/notes')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-pink-500/25 bg-pink-500/5 text-pink-400 hover:bg-pink-500/10 text-xs font-semibold transition-all active:scale-95 cursor-pointer"
        >
          🗒️ Add Note
        </button>
      </div>

      {/* 4. Split Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Span: Timeline Feed */}
        <div className="md:col-span-2">
          <TodayFeed />
        </div>

        {/* Right Span: Quick Locker Credentials (Cyber Bank Card style) */}
        <div>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-2xl flex flex-col justify-between min-h-[320px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              {/* Card Header: Chip & Secure Indicator */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-10 h-7 bg-amber-500/25 border border-amber-500/30 rounded-md relative overflow-hidden">
                  <div className="absolute inset-x-2 inset-y-1 border-r border-amber-500/20" />
                  <div className="absolute inset-y-2 inset-x-1 border-b border-amber-500/20" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] tracking-widest text-indigo-300 font-black uppercase">SECURE VAULT</span>
                  <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                </div>
              </div>
              
              {profile ? (
                <div className="space-y-3.5">
                  {/* Aadhaar */}
                  {profile.aadhaar_number && (
                    <div 
                      onClick={() => handleCopy(profile.aadhaar_number, 'aadhaar')}
                      className="group relative cursor-pointer p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[9px] text-muted font-bold tracking-widest uppercase">Aadhaar Card</p>
                        <p className="text-xs font-mono tracking-widest text-primary mt-0.5">•••• •••• {profile.aadhaar_number.slice(-4)}</p>
                      </div>
                      <span className="text-xs text-secondary group-hover:text-primary transition-colors">
                        {copiedKey === 'aadhaar' ? '✓ Copied' : '📋'}
                      </span>
                    </div>
                  )}

                  {/* PAN */}
                  {profile.pan_number && (
                    <div 
                      onClick={() => handleCopy(profile.pan_number, 'pan')}
                      className="group relative cursor-pointer p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[9px] text-muted font-bold tracking-widest uppercase">PAN Card</p>
                        <p className="text-xs font-mono tracking-widest text-primary uppercase mt-0.5">{profile.pan_number}</p>
                      </div>
                      <span className="text-xs text-secondary group-hover:text-primary transition-colors">
                        {copiedKey === 'pan' ? '✓ Copied' : '📋'}
                      </span>
                    </div>
                  )}

                  {/* Bank Account */}
                  {profile.account_no && (
                    <div 
                      onClick={() => handleCopy(profile.account_no, 'acct')}
                      className="group relative cursor-pointer p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[9px] text-muted font-bold tracking-widest uppercase">{profile.bank_name || 'Bank'} Account</p>
                        <p className="text-xs font-mono tracking-widest text-primary mt-0.5">•••• {profile.account_no.slice(-4)}</p>
                      </div>
                      <span className="text-xs text-secondary group-hover:text-primary transition-colors">
                        {copiedKey === 'acct' ? '✓ Copied' : '📋'}
                      </span>
                    </div>
                  )}

                  {/* UPI ID */}
                  {profile.upi_id && (
                    <div 
                      onClick={() => handleCopy(profile.upi_id, 'upi')}
                      className="group relative cursor-pointer p-3 rounded-xl border border-white/[0.03] bg-white/[0.01] hover:bg-white/[0.04] transition-all duration-300 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[9px] text-muted font-bold tracking-widest uppercase">UPI ID / VPA</p>
                        <p className="text-xs font-mono tracking-wide text-primary mt-0.5">{profile.upi_id}</p>
                      </div>
                      <span className="text-xs text-secondary group-hover:text-primary transition-colors">
                        {copiedKey === 'upi' ? '✓ Copied' : '📋'}
                      </span>
                    </div>
                  )}

                  {!profile.aadhaar_number && !profile.pan_number && !profile.account_no && !profile.upi_id && (
                    <p className="text-xs text-muted text-center py-6">No credentials saved. Go to Profile to add details.</p>
                  )}
                </div>
              ) : (
                <div className="h-48 bg-white/[0.02] rounded-xl animate-pulse" />
              )}
            </div>

            <button
              onClick={() => navigate('/profile')}
              className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold text-center text-indigo-300 border border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all duration-300 active:scale-95"
            >
              Go to Vault Locker
            </button>
          </div>
        </div>

      </div>

      {/* 5. Swipeable Heatmap (at the bottom) */}
      <ConsistencyHeatmap />

      {/* Quick Log Modal Overlay */}
      {activeLogPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div className="relative max-w-md w-full z-10">
            <LogForm
              defaultPillar={activeLogPillar}
              lockPillar={true}
              onSuccess={modalClose}
              onClose={modalClose}
            />
          </div>
        </div>
      )}

    </div>
  );
}
