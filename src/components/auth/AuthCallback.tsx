// src/components/auth/AuthCallback.tsx
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuthSession } from '../../services/auth';
import { useStore } from '../../store';

export function AuthCallback() {
  const navigate = useNavigate();
  const login = useStore((state) => state.login);
  const session = useStore((state) => state.session);
  const handledRef = useRef(false);

  useEffect(() => {
    const logPrefix = '[AuthCallback]';

    console.info(`${logPrefix} mounted on OAuth callback route`, {
      path: window.location.pathname,
      search: window.location.search,
      hasStoreSession: Boolean(session),
    });

    if (handledRef.current) {
      console.info(`${logPrefix} ignored duplicate effect run`);
      return;
    }

    handledRef.current = true;

    async function completeOAuthCallback() {
      try {
        console.info(`${logPrefix} validating backend cookie session after OAuth redirect`, {
          replacingExistingStoreSession: Boolean(session),
        });
        const restoredSession = await fetchAuthSession(logPrefix);
        const nextPath = login(restoredSession, '/compute');
        console.info(`${logPrefix} session stored; navigating`, { nextPath });
        navigate(nextPath, { replace: true });
      } catch (error) {
        console.error(`${logPrefix} OAuth callback verification failed; redirecting to /login`, error);
        navigate('/login', { replace: true });
      }
    }

    void completeOAuthCallback();
  }, [login, navigate, session]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
      <p>인증 정보를 처리 중입니다...</p>
    </div>
  );
}
