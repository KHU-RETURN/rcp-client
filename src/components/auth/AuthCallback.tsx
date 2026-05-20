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
    if (handledRef.current) {
      return;
    }

    handledRef.current = true;

    async function completeOAuthCallback() {
      try {
        const restoredSession = await fetchAuthSession();
        const nextPath = login(restoredSession, '/compute');
        navigate(nextPath, { replace: true });
      } catch (error) {
        navigate('/login', { replace: true });
      }
    }

    void completeOAuthCallback();
  }, [login, navigate, session]);

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        color: 'white',
      }}
    >
      <p>인증 정보를 처리 중입니다...</p>
    </div>
  );
}
