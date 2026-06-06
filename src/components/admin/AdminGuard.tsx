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
  const checkedRef = useRef(false);
  const [isChecking, setIsChecking] = useState(Boolean(session && !isAdminRole(session.role)));

  useEffect(() => {
    if (!session || isAdminRole(session.role) || checkedRef.current) {
      setIsChecking(false);
      return;
    }

    checkedRef.current = true;

    async function refreshRole() {
      try {
        const restoredSession = await fetchAuthSession();
        login(restoredSession, location.pathname);
      } finally {
        setIsChecking(false);
      }
    }

    void refreshRole();
  }, [session, login, location.pathname]);

  if (session && isAdminRole(session.role)) return <Outlet />;
  if (isChecking) return null;

  return <Navigate to="/compute" replace />;
}
