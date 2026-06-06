import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../../store';

function isAdminRole(role: string | undefined): boolean {
  return role?.toLowerCase() === 'admin';
}

export function AdminGuard() {
  const { session } = useStore();

  if (session && isAdminRole(session.role)) return <Outlet />;

  return <Navigate to="/compute" replace />;
}
