import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EasterEggLogoMark } from '../easter-eggs';

const platformFeatures = [
  {
    name: 'Compute',
    body: 'VM 생성, 웹 터미널, SSH, 도메인 연결.',
    status: 'available',
  },
  {
    name: 'Storage',
    body: '파일과 폴더 업로드.',
    status: 'available',
  },
  {
    name: 'Database',
    body: '배포용 데이터베이스.',
    status: 'pending',
  },
  {
    name: 'Network',
    body: '포트와 보안 규칙.',
    status: 'pending',
  },
];

const platformFeatureDetails = {
  Compute: {
    summary: 'VM 생성부터 접속, 배포 도메인 연결까지 한 흐름으로 관리합니다.',
    items: [
      ['인스턴스 생성', '이미지, 사양, 네트워크, SSH 키, 보안 그룹을 선택해 VM을 만듭니다.'],
      ['운영 관리', '상태, IP, 사양, 사용량을 확인하고 일시정지, 재개, 삭제를 처리합니다.'],
      ['접속', '웹 터미널과 Cloudflare SSH 게이트웨이로 VM 셸에 접속합니다.'],
      ['도메인 연결', '서브도메인을 등록해 VM의 웹 서비스를 연결합니다.'],
    ],
  },
  Storage: {
    summary: '컨테이너 안에 파일과 폴더를 올리고 필요한 형태로 내려받습니다.',
    items: [
      ['컨테이너 관리', '저장 공간을 만들고 목록을 확인하며 삭제할 수 있습니다.'],
      ['파일/폴더 업로드', '폴더 경로를 유지한 채 파일을 업로드합니다.'],
      ['파일 관리', '크기, 형식, 수정 시간을 확인하고 다운로드/삭제합니다.'],
      ['ZIP 다운로드', '폴더 prefix 또는 전체 파일을 zip으로 내려받습니다.'],
    ],
  },
};

const featureCards = [
  ['Free for KHU', '경희대 학생 무료 리소스.'],
  ['Built by RETURN', 'RETURN이 직접 운영.'],
  ['Browser Terminal', '브라우저에서 바로 접속.'],
  ['Project Ready', '수업과 배포 실습에 최적화.'],
];

const flavorCards = [
  {
    name: 'm1.tiny',
    spec: '1 vCPU / 512MB RAM',
    body: '가벼운 Linux 실습용.',
  },
  {
    name: 'm1.small',
    spec: '1 vCPU / 2GB RAM',
    body: 'API 서버 기본 옵션.',
  },
  {
    name: 'm1.medium',
    spec: '2 vCPU / 4GB RAM',
    body: '팀 프로젝트 확장 옵션.',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const [heroProgress, setHeroProgress] = useState(0);
  const [activeFeatureName, setActiveFeatureName] = useState<string | null>(null);
  const activeFeatureDetail = activeFeatureName
    ? platformFeatureDetails[activeFeatureName as keyof typeof platformFeatureDetails]
    : undefined;

  useEffect(() => {
    function updateHeroProgress() {
      const hero = heroRef.current;

      if (!hero) {
        return;
      }

      const navHeight = 76;
      const scrollRange = Math.max(hero.offsetHeight - (window.innerHeight - navHeight), 1);
      const progress = (navHeight - hero.getBoundingClientRect().top) / scrollRange;
      setHeroProgress(Math.min(Math.max(progress, 0), 1));
    }

    updateHeroProgress();
    window.addEventListener('scroll', updateHeroProgress, { passive: true });
    window.addEventListener('resize', updateHeroProgress);

    return () => {
      window.removeEventListener('scroll', updateHeroProgress);
      window.removeEventListener('resize', updateHeroProgress);
    };
  }, []);

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>('.landing-reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 },
    );

    targets.forEach((target) => {
      observer.observe(target);
    });
    return () => observer.disconnect();
  }, []);

  function scrollToStory() {
    document
      .getElementById('landing-story')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="page landing-page">
      <header className="landing-nav">
        <button
          type="button"
          className="landing-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <EasterEggLogoMark className="landing-brand-logo" src="/assets/return-black.svg" alt="" />
          <span>Return Cloud Platform</span>
        </button>
        <nav aria-label="Landing navigation">
          <button type="button" onClick={scrollToStory}>
            Features
          </button>
          <button
            type="button"
            onClick={() =>
              document.getElementById('landing-flavors')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Options
          </button>
          <button type="button" onClick={() => navigate('/login')}>
            Login
          </button>
        </nav>
      </header>

      <main>
        <section
          ref={heroRef}
          className="landing-hero"
          aria-label="Return Cloud Platform"
          style={{ '--landing-hero-progress': heroProgress } as CSSProperties}
        >
          <div className="landing-hero-inner">
            <div className="landing-hero-media" aria-hidden="true">
              <div className="landing-scanline" />
              <img className="landing-hero-logo-static" src="/assets/return-black.png" alt="" />
            </div>

            <div className="landing-hero-copy">
              <p>RETURN CLOUD PLATFORM</p>
              <h1>AWS 대신, RETURN.</h1>
            </div>

            <button
              type="button"
              className="landing-scroll"
              onClick={scrollToStory}
              aria-label="Scroll to features"
            >
              <span className="landing-scroll-track">
                <span className="landing-scroll-arrow" />
              </span>
            </button>
          </div>
        </section>

        <section id="landing-story" className="landing-platform">
          <div className="landing-section-head landing-reveal">
            <p>PLATFORM</p>
            <h2>프로젝트 배포에 필요한 핵심 기능.</h2>
          </div>

          <div className="landing-platform-grid">
            {platformFeatures.map((feature) => {
              const detail =
                platformFeatureDetails[feature.name as keyof typeof platformFeatureDetails];
              const isActive = activeFeatureName === feature.name;
              const className = `landing-platform-card landing-reveal is-visible ${
                feature.status === 'pending' ? 'is-pending' : 'is-available'
              }${detail ? ' is-interactive' : ''}${isActive ? ' is-active' : ''}`;
              const content = (
                <>
                  <div className="landing-card-title">
                    <span>{feature.name}</span>
                    {feature.status === 'pending' && <small>구현중</small>}
                  </div>
                  <p>{feature.body}</p>
                </>
              );

              if (detail) {
                return (
                  <button
                    key={feature.name}
                    type="button"
                    className={className}
                    onClick={() => setActiveFeatureName(feature.name)}
                    aria-controls="landing-platform-detail"
                    aria-expanded={isActive}
                  >
                    {content}
                  </button>
                );
              }

              return (
                <article key={feature.name} className={className}>
                  {content}
                </article>
              );
            })}
          </div>

          {activeFeatureName && activeFeatureDetail && (
            <section
              id="landing-platform-detail"
              className="landing-platform-detail"
              aria-label={`${activeFeatureName} details`}
            >
              <div className="landing-platform-detail-head">
                <span>{activeFeatureName}</span>
                <h3>{activeFeatureDetail.summary}</h3>
              </div>
              <ul className="landing-platform-detail-list">
                {activeFeatureDetail.items.map(([title, body]) => (
                  <li key={title}>
                    <strong>{title}</strong>
                    <p>{body}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </section>

        <section className="landing-story-grid">
          <article className="landing-big-statement landing-reveal">
            <p>ABOUT RCP</p>
            <h2>학생을 위한 클라우드.</h2>
            <span>VM 생성, 접속, 배포 실습을 한 화면에서 다룹니다.</span>
          </article>

          <div className="landing-feature-grid">
            {featureCards.map(([title, body]) => (
              <article key={title} className="landing-feature landing-reveal">
                <strong>{title}</strong>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="landing-flavors" className="landing-flavors">
          <div className="landing-section-head landing-reveal">
            <p>AVAILABLE OPTIONS</p>
            <h2>작게 시작하고 바로 확장.</h2>
          </div>
          <div className="landing-flavor-row">
            {flavorCards.map((flavor) => (
              <article key={flavor.name} className="landing-flavor-card landing-reveal">
                <span>{flavor.name}</span>
                <strong>{flavor.spec}</strong>
                <p>{flavor.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-final landing-reveal">
          <img src="/assets/return-black.svg" alt="" />
          <h2>RETURN Cloud Platform</h2>
          <p>필요한 리소스를 바로 준비하세요.</p>
          <button type="button" className="primary-button" onClick={() => navigate('/login')}>
            Login to RCP
          </button>
        </section>
      </main>
    </div>
  );
}
