export type EasterEgg =
  | {
      id: 'platform';
      animation: 'return-unfold';
      title: string;
      message: string;
      code: string;
      lines: string[];
    }
  | {
      id: 'developer-profile';
      animation: 'github-logo-swap';
      githubUsername: string;
      githubAvatarUrl: string;
    };

type EasterEggTrigger =
  | {
      id: 'platform';
      animation: 'return-unfold';
      keys: string[];
      title: string;
      message: string;
      code: string;
      lines: string[];
    }
  | {
      id: 'developer-profile';
      animation: 'github-logo-swap';
      keys: string[];
      githubUsername: string;
    };

const MAX_BUFFER_LENGTH = 24;

export const DEVELOPER_EASTER_EGG_PROFILES = [
  { key: 'haramj', githubUsername: 'haramj' },
  { key: 'jisung-02', githubUsername: 'jisung-02' },
  { key: 'choi-eunseok', githubUsername: 'Choi-Eunseok' },
  { key: 'qixiangme', githubUsername: 'qixiangme' },
].map((profile) => ({
  ...profile,
  githubAvatarUrl: getGithubAvatarUrl(profile.githubUsername),
}));

const EASTER_EGG_TRIGGERS: EasterEggTrigger[] = [
  {
    id: 'platform',
    animation: 'return-unfold',
    keys: ['rcp', 'return'],
    title: 'RETURN MODE: ON',
    message: 'AWS 대신 RETURN을 고른 당신, 예산은 지켰고 낭만은 올렸습니다.',
    code: '$ rcp --not-aws',
    lines: ['billing: still 0 won', 'region: khu-return', 'boot: 커피 한 모금 뒤 완료'],
  },
  ...DEVELOPER_EASTER_EGG_PROFILES.map((profile) => ({
    id: 'developer-profile' as const,
    animation: 'github-logo-swap' as const,
    keys: [profile.key],
    githubUsername: profile.githubUsername,
  })),
];

export function resolveEasterEggInput(
  currentBuffer: string,
  key: string,
): { buffer: string; egg?: EasterEgg } {
  if (!isSearchableKey(key)) {
    return { buffer: currentBuffer };
  }

  const buffer = `${currentBuffer}${key}`.toLowerCase().slice(-MAX_BUFFER_LENGTH);
  const trigger = EASTER_EGG_TRIGGERS.find(({ keys }) =>
    keys.some((triggerKey) => buffer.endsWith(triggerKey)),
  );

  if (!trigger) {
    return { buffer };
  }

  return { buffer, egg: createEasterEgg(trigger) };
}

function createEasterEgg(trigger: EasterEggTrigger): EasterEgg {
  if (trigger.id === 'developer-profile') {
    return {
      id: trigger.id,
      animation: trigger.animation,
      githubUsername: trigger.githubUsername,
      githubAvatarUrl: getGithubAvatarUrl(trigger.githubUsername),
    };
  }

  return {
    id: trigger.id,
    animation: trigger.animation,
    title: trigger.title,
    message: trigger.message,
    code: trigger.code,
    lines: trigger.lines,
  };
}

function isSearchableKey(key: string) {
  return key.length === 1;
}

function getGithubAvatarUrl(username: string) {
  return `https://github.com/${username}.png?size=96`;
}
