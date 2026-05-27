import { type CSSProperties, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const platformFeatures = [
  {
    name: 'Compute',
    body: 'VM 생성과 터미널 접속.',
    status: 'available',
  },
  {
    name: 'Storage',
    body: '파일과 볼륨 관리.',
    status: 'pending',
  },
  {
    name: 'Network',
    body: '포트와 보안 규칙.',
    status: 'pending',
  },
  {
    name: 'Cloud Database',
    body: '배포용 데이터베이스.',
    status: 'pending',
  },
];

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
          className="landing-brand"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src="/assets/return-black.svg" alt="" />
          <span>Return Cloud Platform</span>
        </button>
        <nav aria-label="Landing navigation">
          <button onClick={scrollToStory}>Features</button>
          <button
            onClick={() =>
              document.getElementById('landing-flavors')?.scrollIntoView({ behavior: 'smooth' })
            }
          >
            Options
          </button>
          <button onClick={() => navigate('/login')}>Login</button>
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
            {platformFeatures.map((feature) => (
              <article
                key={feature.name}
                className={`landing-platform-card landing-reveal ${
                  feature.status === 'pending' ? 'is-pending' : 'is-available'
                }`}
              >
                <div className="landing-card-title">
                  <span>{feature.name}</span>
                  {feature.status === 'pending' && <small>구현중</small>}
                </div>
                <p>{feature.body}</p>
              </article>
            ))}
          </div>
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
          <button className="primary-button" onClick={() => navigate('/login')}>
            Login to RCP
          </button>
        </section>
      </main>
    </div>
  );
}
