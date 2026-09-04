import { Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function RouteGate({ children, admin = false }: { children: ReactNode; admin?: boolean }) {
  const { session, profile, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <main className="min-h-screen pt-24" aria-busy="true" />;
  
  if (!session) {
    return <Navigate to="/profile" replace state={{ from: location.pathname }} />;
  }

  // Vendors are strictly isolated to the Vendor Zone (/vendor)
  if (profile?.role === 'vendor') {
    return <Navigate to="/vendor" replace />;
  }

  if (admin && !isAdmin) return <Navigate to="/customer" replace />;
  if (!admin && isAdmin) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}
