import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';

export function ChangesPage() {
  const navigate = useNavigate();

  const headerActions = (
    <>
      <button className="ghost-button ghost-button-small" onClick={() => navigate('/login')}>
        로그인
      </button>
      <button className="ghost-button ghost-button-small" onClick={() => navigate('/signup')}>
        회원가입
      </button>
    </>
  );

  return (
    <AuthLayout headerTitle="What changed" headerSubtitle="" headerActions={headerActions}>
      <div className="auth-panel auth-panel-compact">
        <div className="auth-copy">
          <h2>What changed</h2>
          <p className="muted">최근 반영된 변경 사항입니다.</p>
        </div>

        <div className="auth-empty-inline">
          <span>표시할 변경 내역이 없습니다.</span>
        </div>
      </div>
    </AuthLayout>
  );
}
