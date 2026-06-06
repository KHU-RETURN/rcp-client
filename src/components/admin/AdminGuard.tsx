import { useEffect, useRef, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { fetchAuthSession } from '../../services/auth';
import { useStore } from '../../store';

function isAdminRole(role: string | undefined): boolean {
  return role?.toLowerCase() === 'admin';
}

export function AdminGuard() {
  const { session, login } = useStore();
  const location = useLocation();
  const checkedKeyRef = useRef('');
  const [verifiedRole, setVerifiedRole] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(Boolean(session));

  useEffect(() => {
    if (!session) {
      checkedKeyRef.current = '';
      setVerifiedRole(null);
      setIsChecking(false);
      return;
    }

    const sessionKey = session.email ?? session.id;
    if (checkedKeyRef.current === sessionKey) {
      setIsChecking(false);
      return;
    }

    checkedKeyRef.current = sessionKey;
    setVerifiedRole(null);
    setIsChecking(true);
    let cancelled = false;

    async function refreshRole() {
      try {
        const restoredSession = await fetchAuthSession();
        if (cancelled) return;
        setVerifiedRole(restoredSession.role);
        login(restoredSession, location.pathname);
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    }

    void refreshRole();

    return () => {
      cancelled = true;
    };
  }, [session, login, location.pathname]);

  if (isChecking) return null;
  if (session && isAdminRole(verifiedRole ?? undefined)) return <Outlet />;

  return <Navigate to="/compute" replace />;
}
