import { useEffect } from 'react';
import { AuthLayout } from '../layout/AuthLayout';

export function SshCompletePage() {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.close();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <AuthLayout headerTitle="로그인 완료" headerSubtitle="">
      <div className="auth-login-box">
        <div className="auth-copy">
          <h2>로그인 완료</h2>
          <p className="muted">SSH 터미널로 돌아가세요. 인증이 자동으로 이어집니다.</p>
        </div>

        <p className="auth-caption">
          이 창은 잠시 후 자동으로 닫힐 수 있습니다. 닫히지 않으면 직접 닫아주세요.
        </p>
      </div>
    </AuthLayout>
  );
}
