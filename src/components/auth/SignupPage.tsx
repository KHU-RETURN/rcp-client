import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { AuthLayout } from '../layout/AuthLayout';
import { normalizeHandle } from '../../utils';
import type { MockUser } from '../../types';

export function SignupPage() {
  const navigate = useNavigate();
  const { googleLogin, signupForm, updateSignupForm, authMessage, setAuthMessage, createMockUser, getAllUsers } = useStore();

  function handleGoogleLogin() {
    const nextPath = googleLogin();
    navigate(nextPath, { replace: true });
  }

  function getRolePresetMeta() {
    return { role: 'User', subtitle: 'return platform user' };
  }

  function handleCreateMockUser() {
    const name = signupForm.name.trim();
    const handle = normalizeHandle(signupForm.handle || signupForm.name);
    const preset = getRolePresetMeta();

    if (name.length < 2) {
      setAuthMessage({ type: 'error', text: '이름은 2자 이상 입력해 주세요.' });
      return;
    }

    if (!/^[a-z0-9-]{2,24}$/.test(handle)) {
      setAuthMessage({ type: 'error', text: 'handle은 영문 소문자, 숫자, 하이픈 기준 2~24자여야 합니다.' });
      return;
    }

    if (getAllUsers().some((u) => u.id === handle)) {
      setAuthMessage({ type: 'error', text: '같은 handle의 계정이 이미 있습니다.' });
      return;
    }

    const newUser: MockUser = {
      id: handle,
      name,
      role: preset.role,
      subtitle: signupForm.subtitle.trim() || preset.subtitle,
      source: 'custom-mock',
    };

    createMockUser(newUser);
    const nextPath = '/compute';
    navigate(nextPath, { replace: true });
  }

  const headerActions = (
    <>
      <button className="ghost-button ghost-button-small" onClick={() => navigate('/login')}>
        로그인
      </button>
      <button className="ghost-button ghost-button-small" onClick={() => navigate('/changes')}>
        What changed
      </button>
    </>
  );

  return (
    <AuthLayout headerTitle="Create account" headerSubtitle="" headerActions={headerActions} pageClass="page-signup">
      <div className="auth-login-box">
        <div className="auth-copy">
          <h2>회원가입</h2>
          <p className="muted">경희대 Google 계정으로 가입을 시작하세요.</p>
        </div>

        <div className="auth-note">
          <strong>@khu.ac.kr</strong>
          <span>경희대 Google 계정 인증이 끝나면 바로 서비스에 연결됩니다.</span>
        </div>

        <button className="oauth-button" onClick={handleGoogleLogin} data-ui="google-signup">
          <span className="oauth-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M21.8 12.23c0-.79-.07-1.55-.2-2.27H12v4.3h5.49a4.7 4.7 0 0 1-2.04 3.08v2.56h3.3c1.93-1.78 3.05-4.4 3.05-7.67Z" fill="#4285F4"/>
              <path d="M12 22c2.76 0 5.08-.91 6.78-2.46l-3.3-2.56c-.91.61-2.08.97-3.48.97-2.67 0-4.94-1.8-5.75-4.22H2.84v2.64A10 10 0 0 0 12 22Z" fill="#34A853"/>
              <path d="M6.25 13.73A5.99 5.99 0 0 1 6 12c0-.6.09-1.18.25-1.73V7.63H2.84A10 10 0 0 0 2 12c0 1.61.39 3.13 1.09 4.37l3.16-2.64Z" fill="#FBBC05"/>
              <path d="M12 6.05c1.5 0 2.84.52 3.9 1.53l2.93-2.93C17.07 2.98 14.75 2 12 2A10 10 0 0 0 2.84 7.63l3.41 2.64c.81-2.42 3.08-4.22 5.75-4.22Z" fill="#EA4335"/>
            </svg>
          </span>
          <span>Google로 가입하기</span>
        </button>

        <p className="auth-caption">가입 후 바로 로그인됩니다.</p>

        <div className="signup-grid signup-grid-compact">
          <label className="field">
            <span>이름</span>
            <input
              name="signupName"
              type="text"
              placeholder="Kim Return"
              value={signupForm.name}
              onChange={(e) => updateSignupForm({ name: e.target.value })}
            />
          </label>
          <label className="field">
            <span>아이디</span>
            <input
              name="signupHandle"
              type="text"
              placeholder="kim-return"
              value={signupForm.handle}
              onChange={(e) => updateSignupForm({ handle: e.target.value })}
            />
          </label>
          <label className="field">
            <span>계정 유형</span>
            <select
              name="signupRolePreset"
              value={signupForm.rolePreset}
              onChange={(e) => updateSignupForm({ rolePreset: e.target.value as 'student' | 'admin' })}
            >
              <option value="student">Default</option>
              <option value="admin">Alternate</option>
            </select>
          </label>
          <label className="field field-wide">
            <span>메모</span>
            <textarea
              name="signupSubtitle"
              rows={3}
              placeholder="예: 과제 실습용 인스턴스를 자주 생성하는 사용자"
              value={signupForm.subtitle}
              onChange={(e) => updateSignupForm({ subtitle: e.target.value })}
            />
          </label>
        </div>

        <div className="action-row auth-actions">
          <button className="primary-button auth-submit" onClick={handleCreateMockUser}>
            계정 만들기
          </button>
          {authMessage && (
            <p className={`inline-status ${authMessage.type}`}>{authMessage.text}</p>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}
