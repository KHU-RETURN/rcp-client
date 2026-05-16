import { rcpConfig } from '../../config';
import { AuthLayout } from '../layout/AuthLayout';

const contactUrl = 'https://www.instagram.com/khu_return/';

export function LoginPage() {
  function handleGoogleLogin() {
    window.location.href = `${rcpConfig.apiBaseUrl}/api/v1/auth/oauth/google`;
  }

  return (
    <AuthLayout headerTitle="Sign in" headerSubtitle="">
      <div className="auth-login-box">
        <main className="auth-login-main">
          <div className="auth-copy">
            <h2>로그인</h2>
            <p className="muted">경희대 Google 계정으로 계속하세요.</p>
          </div>

          <div className="auth-note">
            <strong>@khu.ac.kr</strong>
            <span>경희대 계정으로만 접근할 수 있습니다.</span>
          </div>

          <button className="oauth-button" onClick={handleGoogleLogin} data-ui="google-login">
            <span className="oauth-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z" fill="#4285F4" />
                <path d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z" fill="#34A853" />
                <path d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z" fill="#FBBC05" />
                <path d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z" fill="#EA4335" />
              </svg>
            </span>
            <span>Google로 계속하기</span>
          </button>

          <p className="auth-help-line">
            도움이 필요하신가요?{' '}
            <a href={contactUrl} target="_blank" rel="noreferrer">
              문의하기
            </a>
          </p>
        </main>

        <footer className="auth-footer">
          <span>© 2025 Return</span>

          <nav className="auth-legal-links" aria-label="Legal links">
            <a href="/privacy">개인정보처리방침</a>
            <span aria-hidden="true">·</span>
            <a href="/terms">이용약관</a>
          </nav>
        </footer>
      </div>
    </AuthLayout>
  );
}