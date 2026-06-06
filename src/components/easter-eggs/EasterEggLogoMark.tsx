import { useState } from 'react';

import { useActiveEasterEgg } from './EasterEggProvider';

interface EasterEggLogoMarkProps {
  className: string;
  src: string;
  alt: string;
}

export function EasterEggLogoMark({ className, src, alt }: EasterEggLogoMarkProps) {
  const activeEgg = useActiveEasterEgg();
  const developerEgg = activeEgg?.id === 'developer-profile' ? activeEgg : null;
  const [loadedUsername, setLoadedUsername] = useState<string | null>(null);
  const isAvatarReady = developerEgg !== null && loadedUsername === developerEgg.githubUsername;
  const classNames = `easter-egg-logo-mark ${className}${isAvatarReady ? ' is-swapped' : ''}`;

  return (
    <span className={classNames} aria-live="off">
      <img className="easter-egg-logo-base" src={src} alt={alt} />
      {developerEgg && (
        <>
          <span
            className={`easter-egg-logo-avatar-shell${isAvatarReady ? ' is-loaded' : ''}`}
            key={developerEgg.githubUsername}
          >
            <img
              className="easter-egg-logo-avatar"
              src={developerEgg.githubAvatarUrl}
              alt=""
              onLoad={() => setLoadedUsername(developerEgg.githubUsername)}
            />
          </span>
          {isAvatarReady && (
            <span className="easter-egg-logo-signature">@{developerEgg.githubUsername}</span>
          )}
        </>
      )}
    </span>
  );
}
