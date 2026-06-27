/**
 * src/App.jsx
 * Root application component — sets up routing, React Query, and auth guard.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages (create these as you build out each section)
import LoginPage       from './pages/Login';
import DashboardPage   from './pages/Dashboard';
import PerformancePage from './pages/pillars/Performance';
import StudyPage       from './pages/pillars/Study';
import TechPage        from './pages/pillars/Tech';
import JournalPage     from './pages/Journal';
import NotesPage       from './pages/Notes';
import FinancePage     from './pages/Finance';
import ProfilePage     from './pages/Profile';

// ── React Query client setup ──────────────────────────────────
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:          1000 * 60 * 5,   // 5 minutes
      gcTime:             1000 * 60 * 10,  // 10 minutes
      retry:              1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes — require JWT auth */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/performance" element={<PerformancePage />} />
            <Route path="/study"       element={<StudyPage />} />
            <Route path="/tech"        element={<TechPage />} />
            <Route path="/journal"     element={<JournalPage />} />
            <Route path="/notes"       element={<NotesPage />} />
            <Route path="/finance"     element={<FinancePage />} />
            <Route path="/profile"     element={<ProfilePage />} />
          </Route>

          {/* Redirect root → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
