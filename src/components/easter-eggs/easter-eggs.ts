export interface EasterEgg {
  id: 'platform';
  animation: 'return-unfold';
  title: string;
  message: string;
  code: string;
  lines: string[];
}

interface EasterEggTrigger {
  id: EasterEgg['id'];
  animation: EasterEgg['animation'];
  keys: string[];
  title: string;
  message: string;
  code: string;
  lines: string[];
}

const MAX_BUFFER_LENGTH = 24;

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

  return {
    buffer,
    egg: {
      id: trigger.id,
      animation: trigger.animation,
      title: trigger.title,
      message: trigger.message,
      code: trigger.code,
      lines: trigger.lines,
    },
  };
}

function isSearchableKey(key: string) {
  return key.length === 1;
}
