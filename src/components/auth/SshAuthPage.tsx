import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { rcpConfig } from '../../config';

export function SshAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [authCode, setAuthCode] = useState('');
  const nonce = (searchParams.get('s') ?? '').trim();
  const canSubmit = authCode.length === 6;

  useEffect(() => {
    if (nonce) {
      setAuthCode('');
    }
  }, [nonce]);

  const headerActions = (
    <button
      type="button"
      className="ghost-button ghost-button-small"
      onClick={() => navigate('/login')}
    >
      Sign in
    </button>
  );

  if (!nonce) {
    return (
      <AuthLayout headerTitle="SSH Session Auth" headerSubtitle="" headerActions={headerActions}>
        <div className="auth-login-box">
          <main className="auth-login-main">
            <div className="auth-copy">
              <h2>Invalid Request</h2>
              <p className="muted">
                SSH 터미널에 표시된 링크로 다시 시도해주세요. 세션 식별자가 누락되었습니다.
              </p>
            </div>
            <button
              type="button"
              className="primary-button auth-submit"
              onClick={() => navigate('/login')}
            >
              Go to sign in
            </button>
          </main>
        </div>
      </AuthLayout>
    );
  }

  function handleGoogleLogin() {
    if (!canSubmit) return;
    const loginUrl = new URL(
      `${rcpConfig.apiBaseUrl}/api/v1/auth/oauth/google`,
      window.location.origin,
    );
    loginUrl.searchParams.set('state', `ssh:${nonce}:${authCode}`);
    window.location.href = loginUrl.toString();
  }

  function handleAuthCodeChange(value: string) {
    setAuthCode(value.replace(/\D/g, '').slice(0, 6));
  }

  const sessionPreview = nonce.slice(0, 8);

  return (
    <AuthLayout headerTitle="SSH Session Auth" headerSubtitle="" headerActions={headerActions}>
      <div className="auth-login-box">
        <main className="auth-login-main">
          <div className="auth-copy">
            <h2>SSH Session Auth</h2>
            <p className="muted">이 디바이스에서 시작된 SSH 세션을 인증합니다.</p>
          </div>

          <div className="auth-note">
            <strong>session {sessionPreview}…</strong>
            <span>SSH 터미널에 표시된 6자리 코드와 일치할 때만 인증을 계속하세요.</span>
          </div>

          <label className="field">
            <span>Verification code</span>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="000000"
              value={authCode}
              onChange={(event) => handleAuthCodeChange(event.target.value)}
              data-ui="ssh-auth-code"
            />
            <small>약 5분 후 만료됩니다. 본인이 시작하지 않은 요청이면 이 페이지를 닫으세요.</small>
          </label>

          <button
            type="button"
            className="oauth-button"
            onClick={handleGoogleLogin}
            disabled={!canSubmit}
            data-ui="ssh-google-login"
          >
            <span className="oauth-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z"
                  fill="#34A853"
                />
                <path
                  d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z"
                  fill="#EA4335"
                />
              </svg>
            </span>
            <span>Sign in with Google</span>
          </button>
        </main>
      </div>
    </AuthLayout>
  );
}
