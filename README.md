# Return Cloud Platform — Frontend (rcp-front)

경희대학교 Return 연구실 내부 사용자가 OpenStack 기반 VM을 셀프서비스로 만들고 관리하는 콘솔의 프론트엔드입니다.
`@khu.ac.kr` Google 계정으로 로그인하면 플레이버 + OS 이미지를 골라 VM을 생성하고, 브라우저 터미널로 접속할 수 있습니다.

> 백엔드는 별도 저장소에서 관리됩니다. 이 저장소는 React SPA 빌드 결과만 담고 있고, 런타임에 `VITE_API_BASE_URL` 환경변수로 백엔드 API를 가리킵니다.

## Stack

| 영역 | 사용 |
|---|---|
| Framework | React 18.3 + TypeScript 5.6 (strict) |
| Build | Vite 6 |
| Router | `react-router-dom` v6 |
| State | `zustand` v5 (slice 단위 분리) |
| Terminal | `@xterm/xterm` + `@xterm/addon-fit` |
| Styling | 단일 `src/styles/main.css` (~2500줄), CSS 변수 기반 토큰 |
| Formatter / Linter | Biome 2 (`biome.json`) |
| Server (prod) | `server.mjs` — Node, SPA fallback 포함 |

CSS 프레임워크 / CSS-in-JS / 프리프로세서는 사용하지 않습니다. 디자인 결정은 `DESIGN.md` 의 토큰을 따릅니다.

## Setup

```bash
npm install
cp .env.example .env       # 파일이 없으면 팀 리드에게 문의
npm run dev                # http://localhost:5173
```

`.env` 에 최소한 다음 키가 필요합니다.

```env
VITE_API_BASE_URL=https://<backend-host>
```

`.env` 는 `.gitignore` 에 포함되어 있고, 절대 커밋하지 않습니다.

## Scripts

| 명령 | 설명 |
|---|---|
| `npm run dev` | Vite 개발 서버 (기본 :5173) |
| `npm run build` | 프로덕션 빌드 → `dist/` + postbuild SPA fallback 생성 |
| `npm run preview` | 빌드 산출물을 Vite로 미리보기 |
| `npm run serve` | `server.mjs` 로 production-style 서빙 (SPA fallback 포함) |
| `npm run typecheck` | `tsc --noEmit` (strict 모드 통과 필수) |
| `npm run lint` | Biome 린트 |
| `npm run format` | Biome 포매터 적용 (`--write`) |
| `npm run format:check` | 포매터 결과 검사만 (변경 없음) |
| `npm run check` | 린트 + 포매터 통합 검사 |
| `npm run check:fix` | 안전한 자동 수정 적용 |

테스트 러너는 아직 없습니다. 자세한 검증 절차는 [AGENTS.md](./AGENTS.md#verification) 의 *Verification* 절을 참고합니다.

## Project layout

```
src/
  App.tsx                # router root
  main.tsx               # React mount + global CSS
  config.ts              # runtime config (reads VITE_API_BASE_URL)
  components/
    auth/                # LoginPage, AuthCallback, ChangesPage
    layout/              # AuthLayout, AuthGuard, Topbar
    landing/             # LandingPage (marketing, scroll-driven)
    compute/             # CreatePage, InstancesPage, InstanceDetailPage, FlavorTable, InstanceTable, SectionRail
    storage/             # StoragePage, StorageContainerPage
    terminal/            # TerminalPage, TerminalHost
    shared/              # EmptyBlock, InlineBadge
  constants/             # brand, routes, templates, terminal-theme, storage-keys
  hooks/                 # useFullscreen, useTerminal
  services/              # api, auth, compute, storage (HTTP layer)
  store/                 # zustand store + slices/
  types/                 # api, auth, compute, config, release, storage, templates, terminal
  utils/                 # format, helpers, validation
  styles/main.css        # 모든 토큰과 컴포넌트 스타일
public/                  # 정적 자산 (logos)
scripts/                 # 빌드 후처리 (create-spa-fallback.mjs)
server.mjs               # 프로덕션 정적 서버
DESIGN.md                # 디자인 시스템 (Stitch / getdesign.md 포맷)
AGENTS.md                # 모든 코딩 에이전트의 단일 가이드
```

## Conventions

- 코드 스타일, 네이밍, 커밋 메시지, 브랜치 전략은 [AGENTS.md](./AGENTS.md) 를 따릅니다.
- 시각/UX 결정은 [DESIGN.md](./DESIGN.md) 를 따릅니다.
- 포맷팅 / 린트 (Biome) 사용법은 [LINTING.md](./LINTING.md) — 커밋 직전 `npm run check:fix` 권장.
- 코드/식별자/커밋 메시지는 영어, 설명·UI 한국어 카피는 한국어.

## Deployment

GitHub Pages 정적 호스팅 (저장소 루트 `CNAME` 사용). 빌드 후 `scripts/create-spa-fallback.mjs` 가 SPA fallback 페이지를 생성합니다.
자체 서버에서 띄울 경우 `npm run serve` 로 `server.mjs` 를 실행합니다.

## Troubleshooting

- **`VITE_API_BASE_URL` 미설정** — 로그인/조회 API가 dev 서버 자체에 404 로 떨어집니다. `.env` 를 먼저 확인하세요.
- **빌드 후 새로고침 시 404** — postbuild SPA fallback 이 실패한 경우입니다. `npm run build` 의 마지막 단계 로그를 확인합니다.
- **터미널 연결 끊김** — VM 상태가 `ACTIVE` 가 된 직후 30초 grace 동안은 연결을 허용하지 않습니다 (`src/utils/helpers.ts` 의 `getTerminalAvailability` 참조).

## License

내부 프로젝트 — 별도 라이선스 명시 전까지는 외부 공개 금지.
