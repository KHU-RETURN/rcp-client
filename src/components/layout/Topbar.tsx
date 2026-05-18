import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
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

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="topbar">
      <div className="brand">
        <img className="brand-logo" src={BRAND_ASSETS.light} alt="RETURN logo" />
        <div>
          <strong>Return Cloud Platform</strong>
          <span>{active === ROUTE_NAMES.storage ? 'Storage' : 'Compute'}</span>
        </div>
      </div>
      <nav className="topbar-nav" aria-label="Primary">
        <button
          className={`nav-button ${computeActive ? 'active' : ''}`}
          onClick={() => navigate('/compute')}
        >
          Compute
        </button>
        <button
          className={`nav-button ${active === ROUTE_NAMES.storage ? 'active' : ''}`}
          onClick={() => navigate('/storage')}
        >
          Storage
        </button>
      </nav>
      <div className="topbar-tools">
        <span className="operator-label">{session?.name ?? ''}</span>
        <button className="ghost-button" onClick={handleLogout}>
          Sign out
        </button>
      </div>
    </header>
  );
}
