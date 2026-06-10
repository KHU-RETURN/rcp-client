import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import { EasterEggProvider } from './components/easter-eggs';
import { LandingPage } from './components/landing/LandingPage';

// Build-time prerender entry for the public landing page (scripts/prerender.mjs).
// Effects never run here, so browser-only APIs in LandingPage are safe.
export function render(): string {
  return renderToString(
    <MemoryRouter initialEntries={['/']}>
      <EasterEggProvider>
        <LandingPage />
      </EasterEggProvider>
    </MemoryRouter>,
  );
}
