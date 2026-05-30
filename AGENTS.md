# AGENTS.md

Single source of truth for AI coding agents (Codex, Claude Code, Cursor, Gemini CLI, ...). When in doubt, read the file before reading the code.

## Project

**Return Cloud Platform (RCP)** — VM provisioning console for 경희대학교 Return. `@khu.ac.kr` 로그인 → 플레이버 + OS 이미지 선택 → OpenStack VM + 브라우저 터미널.

- React SPA, GitHub Pages 정적 배포 + `server.mjs` SPA fallback.
- Backend는 별도 저장소. `VITE_API_BASE_URL` 환경변수가 백엔드 주소.
- 설명 카피는 한국어, UI 컨트롤은 영어. 이 분배는 뒤집지 말 것.

## Stack

| 영역 | 사용 |
|---|---|
| Framework | React 18.3 + TypeScript 5.6 (strict) |
| Build | Vite 6 |
| Router | `react-router-dom` v6 |
| State | `zustand` v5 (slice 분리: `src/store/slices/`) |
| Terminal | `@xterm/xterm` v6 + `@xterm/addon-fit` |
| Styling | 단일 `src/styles/main.css`, CSS 변수 토큰 (`:root`) |
| Formatter / linter | Biome 2 (`biome.json`) — 자세한 사용법 [LINTING.md](./LINTING.md) |
| Server (prod) | `server.mjs` (Node, frameworkless) |
| Package manager | `npm` (`package-lock.json` 동봉) |

CSS 프레임워크 / preprocessor / CSS-in-JS / 새 폰트 / 컬러 브랜드 도입 금지.

## Commands

```bash
npm install
npm run dev              # vite :5173
npm run typecheck        # tsc --noEmit
npm run check            # biome lint + format check (read-only)
npm run check:fix        # biome auto-fix (커밋 직전 권장)
npm run build            # dist/ + postbuild SPA fallback
npm run preview          # vite preview
npm run serve            # node server.mjs
```

## Environment

- `.env` (gitignored) 에 `VITE_API_BASE_URL=...` 필수. 없으면 API 가 404.
- Deploy: GitHub Pages. SPA fallback 은 `scripts/create-spa-fallback.mjs` 가 postbuild 로 생성.

## Project layout

```
src/
  App.tsx                router root
  main.tsx               React mount + global CSS
  config.ts              reads VITE_API_BASE_URL
  components/
    auth/                LoginPage, AuthCallback, ChangesPage
    layout/              AuthLayout, AuthGuard, Topbar
    landing/             LandingPage
    compute/             CreatePage, InstancesPage, InstanceDetailPage, FlavorTable, InstanceTable, SectionRail
    storage/             StoragePage, StorageContainerPage
    terminal/            TerminalPage, TerminalHost
    shared/              EmptyBlock, InlineBadge
  constants/             brand, routes, templates, terminal-theme, storage-keys
  hooks/                 useFullscreen, useTerminal
  services/              api, auth, compute, storage
  store/                 index.ts + slices/(auth, compute, draft, storage, terminal)
  types/                 api, auth, compute, config, release, storage, templates, terminal
  utils/                 format, helpers, validation
  styles/main.css        all tokens + all component styles
```

**새 코드 배치**:
- 페이지 → `src/components/<domain>/<PageName>.tsx`, 라우트는 `App.tsx`.
- 상태 → `src/store/slices/<name>.ts` + `store/index.ts` 조립.
- API → `src/services/<domain>.ts` + 타입은 `src/types/`.
- 유틸 / 상수 / 공용 컴포넌트 → 해당 폴더 + barrel (`index.ts`) re-export.

## Code style

Biome 가 포맷 강제, 아래는 **의미적** 컨벤션.

- **TypeScript strict**. `any` 금지 — `unknown` 후 narrowing, 또는 `src/types/` 에 정의.
- **ES modules** 만. CommonJS 금지.
- **포맷** (Biome 자동): 2-space indent, single quote (JSX double), semicolon ON, trailing comma all, line width 100.
- **Naming**:
  - Component / type / type alias → `PascalCase`
  - Function / variable / hook / store action → `camelCase`
  - 진짜 상수 (`constants/`) → `SCREAMING_SNAKE_CASE`, 데이터 테이블은 `camelCase`
  - CSS class → kebab-case, 느슨한 BEM (`.auth-card-head`)
- **React**: 함수형 컴포넌트만. Props 는 인라인 또는 named `interface`.
- **State**: 컴포넌트 로컬 → `useState`, 라우트 공유/영속 → zustand store.
- **Async**: `async`/`await`. 에러는 store slice 또는 로컬 state 로 표면화.
- **Imports**: (1) react/외부, (2) store/services/hooks, (3) components, (4) types/constants/utils. 그룹 간 공백은 가독성에 도움이 될 때만.

## Lint & format

Biome 2 가 단일 도구. 자세한 룰 / `biome-ignore` 사용법 / warning 카테고리 → [**LINTING.md**](./LINTING.md).

핵심:
- 커밋 직전 `npm run check:fix && npm run typecheck`.
- Lint baseline = **0 errors**. Warning 은 추적 중인 tech debt — 새 코드에서 *증가* 시키지 말 것.
- 룰 우회는 `biome.json` 전역 변경이 아니라 `// biome-ignore <rule>: <reason>` (사유 필수).

## Styling

**`DESIGN.md` 먼저 읽기.** 이후:

- 모든 색 / 라운드 / 폰트는 `:root` 토큰 (`--bg`, `--ink`, `--accent`, `--success`, `--warning`, `--danger`, `--radius`, `--radius-small`, `--font-ui`, `--font-mono`) 사용.
- 폰트는 Inter (앱), Pretendard (랜딩만), 시스템 mono. 추가 금지.
- Accent 는 ink (`#111111`) — 크로마틱 브랜드 컬러 도입 금지.
- 버튼은 pill (`border-radius: 999px`). Primary = ink fill, ghost = white translucent, danger = outline.
- Hover lift = `translateY(-1px)`. Scale / rotate 금지.
- 신규 CSS 는 `src/styles/main.css` 한 파일에. 시각적 이웃 옆에 배치.
- 설명 카피·확인 다이얼로그는 한국어, UI 라벨·버튼·헤딩은 영어.

## Verification

테스트 러너 없음. 아래 순서로 검증:

1. `npm run typecheck` — clean.
2. `npm run check` — 0 errors. 새 warning 증가 없도록.
3. UI 변경이면 `npm run dev` 로 브라우저 확인. desktop (≥1180px), tablet (<1180px), mobile (<760px) 중 본 breakpoint 를 응답에 명시.
4. `npm run build` — postbuild 까지 통과.
5. 라우팅 변경이면 추가로 `npm run preview`/`npm run serve`.

브라우저 확인 불가 환경이면 그 사실을 **명시**. diff 만 보고 "이상 없음" 선언 금지.

## Commits, branches, PRs

- 커밋 메시지: `<type>: <subject>` 또는 `<type>(<scope>): <subject>` — `feat / fix / chore / style / docs / refactor`.
- 제목 ~72자, 명령형. 한국어/영어는 최근 브랜치 스타일을 따른다. Body 는 *why*.
- 브랜치: `<type>/<short-kebab>` (한 토픽 = 한 브랜치).
- PR target = `main`. 설명에 Summary (왜) + Test plan (어떻게 검증).
- PR 생성은 명시 요청 시에만.
- **금지**: `--no-verify`, 푸시된 commit `--amend`, `.env` 커밋, `dist/` 커밋.

## Things to avoid

- **새 의존성** 도입 전 합의. 현재 dep 목록은 의도적으로 작다.
- **CSS 프레임워크** (Tailwind 등) 도입 금지.
- **테스트 인프라** 를 무관한 PR 에 끼워넣지 말 것. 필요 시 별도 PR.
- **`main.css` 분할** 은 사전 조율 없이 금지 — cascade 순서가 깨진다.
- **`assert` / 에러 핸들러 / 미사용처럼 보이는 코드** 를 검증 없이 삭제 금지. 서버 응답이 데모 경로에서 발화하지 않는 케이스가 있음.
- **장식용 그라데이션 / 일러스트 / 이모지** 를 UI 에 추가 금지 (DESIGN.md 참고).

## Communication

- 응답 기본 한국어. 코드·식별자·경로·커맨드·커밋 메시지는 영어.
- 에러 메시지와 도구 출력은 원문 그대로 인용 — 번역 금지.

## Design system

`DESIGN.md` — Stitch (getdesign.md) 표준. YAML frontmatter 에 머신 가독 토큰, 본문에 11 섹션. 토큰은 `src/styles/main.css:1–22` 와 수동으로 동기화. UI/UX 작업 전 필독.

## References

- Linting & format: [`LINTING.md`](./LINTING.md), [`biome.json`](./biome.json)
- Design system: [`DESIGN.md`](./DESIGN.md)
- Routes: `src/constants/routes.ts`
- Brand assets: `src/constants/brand.ts`
- Terminal theme: `src/constants/terminal-theme.ts`
- Store assembly: `src/store/index.ts`
- API client: `src/services/api.ts`
- Auth layout: `src/components/layout/AuthLayout.tsx`
