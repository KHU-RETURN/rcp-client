import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layout/AuthLayout';
import type { ReleaseNote } from '../../types';

const releaseNotes: ReleaseNote[] = [
  {
    version: 'v0.1.0',
    title: '인스턴스 생성 · 웹 콘솔 · OAuth 인증',
    body: 'RCP 인스턴스 생성 흐름과 인스턴스 웹 콘솔(터미널) 기능이 추가되었고, 경희대 Google 계정 기반 OAuth 인증이 활성화되었습니다.',
  },
];

export function ChangesPage() {
  const navigate = useNavigate();

  const headerActions = (
    <button className="ghost-button ghost-button-small" onClick={() => navigate('/login')}>
      로그인
    </button>
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
