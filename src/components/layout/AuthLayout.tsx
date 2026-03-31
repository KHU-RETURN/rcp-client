import type { ReactNode } from 'react';

interface AuthLayoutProps {
  headerTitle: string;
  headerSubtitle: string;
  headerActions?: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ headerTitle, headerSubtitle, headerActions, children }: AuthLayoutProps) {
  return (
    <div className="page page-login shell-enter">
      <main className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-copy">
            <span className="auth-brand-name">
              <span>Return</span>
              <span>Cloud</span>
              <span>Platform</span>
            </span>
          </div>
        </section>

        <section className="auth-card" aria-label="Auth entry">
          <div className="auth-card-head">
            <div className="auth-card-copy">
              <span className="auth-kicker">Return Cloud Platform</span>
              <strong>{headerTitle}</strong>
            </div>
            {headerActions && (
              <div className="auth-header-actions">{headerActions}</div>
            )}
          </div>

          <div className="auth-stage auth-stage-tight">
            {children}
          </div>
        </section>
      </main>
    </div>
  );
}
