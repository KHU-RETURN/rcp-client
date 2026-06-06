import { useNavigate } from 'react-router-dom';
import { EasterEggLogoMark } from '../easter-eggs';
import { useStore } from '../../store';
import { logoutSession } from '../../services/auth';
import { BRAND_ASSETS, ROUTE_NAMES } from '../../constants';
import type { RouteName } from '../../constants';

interface TopbarProps {
  active: RouteName;
}

export function Topbar({ active }: TopbarProps) {
  const navigate = useNavigate();
  const { session, logout } = useStore();

  const computeActive =
    active === ROUTE_NAMES.instances ||
    active === ROUTE_NAMES.create ||
    active === ROUTE_NAMES.detail ||
    active === ROUTE_NAMES.terminal;
  const isAdmin = session?.role?.toLowerCase() === 'admin';

  async function handleLogout() {
    await logoutSession();
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">
      <div className="brand">
        <EasterEggLogoMark className="brand-logo" src={BRAND_ASSETS.light} alt="RETURN logo" />
        <div>
          <strong>Return Cloud Platform</strong>
          <span>
            {active === ROUTE_NAMES.admin
              ? 'admin'
              : active === ROUTE_NAMES.storage
                ? 'Storage'
                : 'Compute'}
          </span>
        </div>
      </div>
      <nav className="topbar-nav" aria-label="Primary">
        <button
          type="button"
          className={`nav-button ${computeActive ? 'active' : ''}`}
          onClick={() => navigate('/compute')}
        >
          Compute
        </button>
        <button
          type="button"
          className={`nav-button ${active === ROUTE_NAMES.storage ? 'active' : ''}`}
          onClick={() => navigate('/storage')}
        >
          Storage
        </button>
        {isAdmin && (
          <button
            type="button"
            className={`nav-button ${active === ROUTE_NAMES.admin ? 'active' : ''}`}
            onClick={() => navigate('/admin')}
          >
            admin
          </button>
        )}
      </nav>
      <div className="topbar-tools">
        <span className="operator-label">{session?.name ?? ''}</span>
        <button type="button" className="ghost-button" onClick={() => void handleLogout()}>
          Sign out
        </button>
      </div>
    </header>
  );
}
