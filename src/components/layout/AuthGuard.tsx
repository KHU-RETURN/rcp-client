import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../../store';

export function AuthGuard() {
  const { session, setPendingRoutePath } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!session) {
      setPendingRoutePath(location.pathname);
      navigate('/login', { replace: true });
    }
  }, [session, navigate, location.pathname, setPendingRoutePath]);

  if (!session) return null;

  return <Outlet />;
}
