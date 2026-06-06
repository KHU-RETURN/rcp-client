import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { fetchAuthSession } from '../../services/auth';
import { useStore } from '../../store';

export function AuthGuard() {
  const { session, login, logout, setPendingRoutePath } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const checkedSessionKeyRef = useRef<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const sessionKey = session ? (session.email ?? session.id) : null;
    if (sessionKey && checkedSessionKeyRef.current === sessionKey) {
      setIsChecking(false);
      return;
    }

    checkedSessionKeyRef.current = sessionKey;
    setIsChecking(true);
    let cancelled = false;

    async function restoreProtectedRouteSession() {
      try {
        const restoredSession = await fetchAuthSession();
        if (cancelled) return;
        checkedSessionKeyRef.current = restoredSession.email ?? restoredSession.id;
        login(restoredSession, location.pathname);
        setIsChecking(false);
      } catch {
        if (cancelled) return;
        checkedSessionKeyRef.current = null;
        logout();
        setPendingRoutePath(location.pathname);
        navigate('/login', { replace: true });
      }
    }

    void restoreProtectedRouteSession();

    return () => {
      cancelled = true;
    };
  }, [session, login, logout, navigate, location.pathname, setPendingRoutePath]);

  if (isChecking) return null;
  if (!session) return null;

  return <Outlet />;
}
