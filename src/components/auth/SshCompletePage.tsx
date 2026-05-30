import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';

export function SshCompletePage() {
  const [searchParams] = useSearchParams();
  const failed = searchParams.get('status') === 'failed';

  useEffect(() => {
    if (failed) return;
    const timer = window.setTimeout(() => {
      window.close();
    }, 3000);
    return () => window.clearTimeout(timer);
  }, [failed]);

  return (
    <AuthLayout headerTitle={failed ? 'Sign-in Failed' : 'Sign-in Complete'} headerSubtitle="">
      <div className="auth-login-box">
        <main className="auth-login-main">
          <div className="auth-copy">
            <h2>{failed ? 'Sign-in Failed' : 'Sign-in Complete'}</h2>
            <p className="muted">
              {failed
                ? 'SSH 세션이 만료되었거나 코드가 일치하지 않습니다. 터미널에서 인증을 다시 시도하세요.'
                : 'SSH 터미널로 돌아가세요. 인증이 자동으로 이어집니다.'}
            </p>
          </div>

          {!failed && (
            <p className="auth-caption">
              이 창은 잠시 후 자동으로 닫힐 수 있습니다. 닫히지 않으면 직접 닫아주세요.
            </p>
          )}
        </main>
      </div>
    </AuthLayout>
  );
}
