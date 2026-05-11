import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { rcpConfig } from '../../config';

export function SshAuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nonce = (searchParams.get('s') ?? '').trim();

  const headerActions = (
    <button className="ghost-button ghost-button-small" onClick={() => navigate('/login')}>
      로그인
    </button>
  );

  if (!nonce) {
    return (
      <AuthLayout headerTitle="SSH 세션 인증" headerSubtitle="" headerActions={headerActions}>
        <div className="auth-login-box">
          <div className="auth-copy">
            <h2>잘못된 접근입니다</h2>
            <p className="muted">
              SSH 터미널에 표시된 링크로 다시 시도해주세요. 세션 식별자가 누락되었습니다.
            </p>
          </div>
          <button className="primary-button auth-submit" onClick={() => navigate('/login')}>
            로그인 페이지로
          </button>
        </div>
      </AuthLayout>
    );
  }

  function handleGoogleLogin() {
    const state = `ssh:${encodeURIComponent(nonce)}`;
    window.location.href = `${rcpConfig.apiBaseUrl}/auth/oauth/google?state=${state}`;
  }

  const sessionPreview = nonce.slice(0, 8);

  return (
    <AuthLayout headerTitle="SSH 세션 인증" headerSubtitle="" headerActions={headerActions}>
      <div className="auth-login-box">
        <div className="auth-copy">
          <h2>SSH 세션 인증</h2>
          <p className="muted">이 디바이스에서 시작된 SSH 세션을 인증합니다.</p>
        </div>

        <div className="auth-note">
          <strong>session {sessionPreview}…</strong>
          <span>약 5분 후 만료됩니다. 그 안에 인증을 완료해주세요.</span>
        </div>

        <button className="oauth-button" onClick={handleGoogleLogin} data-ui="ssh-google-login">
          <span className="oauth-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z" fill="#4285F4"/>
              <path d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z" fill="#34A853"/>
              <path d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z" fill="#FBBC05"/>
              <path d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z" fill="#EA4335"/>
            </svg>
          </span>
          <span>Google로 로그인</span>
        </button>

        <p className="auth-caption">
          본인이 시작하지 않은 요청이면 이 페이지를 닫으세요.
        </p>
      </div>
    </AuthLayout>
  );
}
