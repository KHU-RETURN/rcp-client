import { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { describeSession, fetchAuthSession } from '../../services/auth';
import { useStore } from '../../store';

export function AuthGuard() {
  const { session, login, setPendingRoutePath } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const checkedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(!session);

  useEffect(() => {
    const logPrefix = '[AuthGuard]';

    console.info(`${logPrefix} checking protected route`, {
      path: location.pathname,
      hasStoreSession: Boolean(session),
      isChecking,
    });

    if (session) {
      console.info(`${logPrefix} store session present; allowing route`, describeSession(session));
      setIsChecking(false);
      return;
    }

    if (checkedRef.current) {
      console.info(`${logPrefix} cookie session check already attempted for this mount`);
      return;
    }

    checkedRef.current = true;

    async function restoreProtectedRouteSession() {
      try {
        console.info(`${logPrefix} no store session; trying to restore from backend cookie before redirect`);
        const restoredSession = await fetchAuthSession(logPrefix);
        login(restoredSession);
        console.info(`${logPrefix} restored session from cookie; allowing protected route`, describeSession(restoredSession));
        setIsChecking(false);
      } catch (error) {
        console.error(`${logPrefix} could not restore cookie session; redirecting to /login`, {
          path: location.pathname,
          error,
        });
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
