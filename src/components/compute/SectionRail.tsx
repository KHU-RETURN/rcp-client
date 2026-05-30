import type { SectionStates, SectionKey } from '../../types';
import { SECTION_ORDER } from '../../constants';

interface SectionRailProps {
  sections: SectionStates;
}

export function SectionRail({ sections }: SectionRailProps) {
  function handleJump(key: SectionKey) {
    document.getElementById(key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <aside className="workspace-rail">
      <div className="rail-intro">
        <p className="eyebrow">Compute</p>
        <h2>Create VM</h2>
        <p className="muted">필수 설정만 확인하고 바로 생성합니다.</p>
      </div>
      <nav className="section-rail" aria-label="Section navigation">
        {SECTION_ORDER.map((key, index) => {
          const section = sections[key];
          const tone = section.error ? 'error' : section.valid ? 'valid' : 'pending';
          return (
            <button key={key} className={`rail-link ${tone}`} onClick={() => handleJump(key)}>
              <span className="rail-num">0{index + 1}</span>
              <span className="rail-copy">
                <strong>{section.title}</strong>
                <small>
                  {section.error ? 'Needs attention' : section.valid ? 'Ready' : 'Incomplete'}
                </small>
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
