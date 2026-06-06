import type { CSSProperties } from 'react';

import { useActiveEasterEgg } from './EasterEggProvider';

const RETURN_UNFOLD_UPPER_PATH =
  'M 160 130 H 238 C 280 130 292 98 292 70 C 292 34 260 10 226 10 C 190 10 160 38 160 74 V 840';
const RETURN_UNFOLD_LOWER_PATH =
  'M 160 130 H 82 C 40 130 28 162 28 190 C 28 226 60 250 94 250 C 130 250 160 222 160 186 V -580';

const returnUnfoldStyle = {
  '--easter-egg-return-upper-path': `path('${RETURN_UNFOLD_UPPER_PATH}')`,
  '--easter-egg-return-lower-path': `path('${RETURN_UNFOLD_LOWER_PATH}')`,
} as CSSProperties;

export function EasterEggLayer() {
  const egg = useActiveEasterEgg();

  if (!egg || egg.animation !== 'return-unfold') {
    return null;
  }

  return (
    <div className={`easter-egg-stage is-${egg.animation}`} aria-hidden="true">
      <div className="easter-egg-return-unfold">
        <svg className="easter-egg-return-mark" viewBox="0 0 320 260" style={returnUnfoldStyle}>
          <circle className="easter-egg-return-origin" cx="160" cy="130" r="7" />
          <g className="easter-egg-return-branch is-upper">
            <path
              className="easter-egg-return-path is-upper"
              pathLength="1"
              d={RETURN_UNFOLD_UPPER_PATH}
            />
            <path className="easter-egg-return-arrowhead is-upper" d="M -15 -10 L 4 0 L -15 10 Z" />
          </g>
          <g className="easter-egg-return-branch is-lower">
            <path
              className="easter-egg-return-path is-lower"
              pathLength="1"
              d={RETURN_UNFOLD_LOWER_PATH}
            />
            <path className="easter-egg-return-arrowhead is-lower" d="M -15 -10 L 4 0 L -15 10 Z" />
          </g>
        </svg>
      </div>
    </div>
  );
}
