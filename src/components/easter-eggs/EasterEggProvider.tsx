import { createContext, type ReactNode, useContext, useEffect } from 'react';

import { DEVELOPER_EASTER_EGG_PROFILES, type EasterEgg } from './easter-eggs';
import { useEasterEggs } from './useEasterEggs';

const EasterEggContext = createContext<EasterEgg | null>(null);

interface EasterEggProviderProps {
  children: ReactNode;
}

export function EasterEggProvider({ children }: EasterEggProviderProps) {
  const activeEgg = useEasterEggs();

  useEffect(() => {
    for (const profile of DEVELOPER_EASTER_EGG_PROFILES) {
      const image = new Image();
      image.src = profile.githubAvatarUrl;
    }
  }, []);

  return <EasterEggContext.Provider value={activeEgg}>{children}</EasterEggContext.Provider>;
}

export function useActiveEasterEgg() {
  return useContext(EasterEggContext);
}
