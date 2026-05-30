import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from '../../services/auth';
import { useStore } from '../../store';

export function AuthGuard() {
  const { session, login, setPendingRoutePath } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const checkedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(!session);

  useEffect(() => {
    if (session) {
      setIsChecking(false);
      return;
    }

    if (checkedRef.current) {
      return;
    }

    checkedRef.current = true;

    async function restoreProtectedRouteSession() {
      try {
        const restoredSession = await fetchAuthSession();
        login(restoredSession);
        setIsChecking(false);
      } catch (error) {
        setPendingRoutePath(location.pathname);
        navigate('/login', { replace: true });
      }
    }

    void restoreProtectedRouteSession();
  }, [session, login, navigate, location.pathname, setPendingRoutePath, isChecking]);

  if (!session && isChecking) return null;
  if (!session) return null;

  return <Outlet />;
}
