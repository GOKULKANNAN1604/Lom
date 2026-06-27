import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Sidebar from './Sidebar';
import MobileHeader from './MobileHeader';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-surface text-secondary flex flex-col md:flex-row">
      {/* Mobile Top Header (hidden on desktop) */}
      <MobileHeader onMenuClick={() => setIsDrawerOpen(true)} />

      {/* Sidebar Panel (static on desktop, slide-out drawer on mobile) */}
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
      
      {/* Page Content Container */}
      <div className="flex-1 md:pl-56 min-h-screen pt-14 md:pt-0 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default ProtectedRoute;
