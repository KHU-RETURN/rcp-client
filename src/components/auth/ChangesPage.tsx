import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import { releaseNotes } from '../../constants';

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

        <div className="release-list">
          {releaseNotes.map((note) => (
            <article key={note.version} className="release-item">
              <div className="release-head">
                <span className="release-version">{note.version}</span>
                <strong>{note.title}</strong>
              </div>
              <p>{note.body}</p>
            </article>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}
