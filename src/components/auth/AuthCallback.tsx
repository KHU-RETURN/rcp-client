// src/components/auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 1. URL에서 token 쿼리 스트링 추출
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      // 2. localStorage에 저장 (기존 api.ts가 읽는 형식 유지)
      const storageKey = 'rcp-storage';
      const authData = {
        state: {
          session: {
            accessToken: token,
          }
        }
      };
      
      localStorage.setItem(storageKey, JSON.stringify(authData));
      
      // 3. 인스턴스 목록 페이지로 리다이렉트
      navigate('/compute/instances', { replace: true });
    } else {
      console.error('Token not found in URL');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white' }}>
      <p>인증 정보를 처리 중입니다...</p>
    </div>
  );
}