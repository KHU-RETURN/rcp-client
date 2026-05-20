# Linting & Formatting

이 프로젝트는 **Biome 2** 하나로 포매팅 + 린트를 처리합니다. 설정 파일은 [`biome.json`](./biome.json), 베이스라인은 **0 errors**.

## Commands

```bash
npm run check          # 검사만 — lint + format check (CI와 동일)
npm run check:fix      # 안전한 자동 수정 (포맷 + 안전한 lint fix)
npm run lint           # 린트만
npm run format         # 포매터 적용 (--write)
npm run format:check   # 포맷 검사만
```

**커밋 직전 권장**: `npm run check:fix && npm run typecheck`.

특정 파일/디렉토리만 보고 싶을 때:

```bash
npx biome check src/components/compute/   # 디렉토리
npx biome check src/utils/helpers.ts      # 단일 파일
npx biome check src/ --diagnostic-level=error   # 에러만
npx biome check src/ --reporter=summary         # 룰별 집계
```

## Config 요점

- **Indent / quotes / semicolons**: 2칸 스페이스, single quote (JSX는 double), 세미콜론 ON, trailing comma `all`, line width 100.
- **Lint baseline**: `recommended` 룰 셋에서 시작.
- **Tech debt 룰은 warn**: 코드베이스 광범위 정리가 필요한 a11y/correctness 룰은 우선 `warn`. CI 통과를 막지 않지만 새 코드에서 추가되지 않도록 유지.
- **`useSemanticElements`**: 커스텀 스타일된 div에 `role` 부여한 케이스가 많아 `warn`.
- **`noSvgWithoutTitle`**: 장식용 아이콘이 많아 `off`.

## 현재 warning 카테고리

`npm run check` 가 60개 안팎의 warning 을 띄웁니다. 새 작업 중 이 카테고리에서 *증가* 시키지 않는 게 목표.

| 룰 | 갯수 | 해결 방향 |
|---|---:|---|
| `lint/a11y/useButtonType` | ~42 | `<button>` 에 `type="button"` 명시 (form 안이면 `type="submit"`). |
| `lint/correctness/useExhaustiveDependencies` | ~7 | `useEffect`/`useMemo` 의존성 배열 보충. 의도된 누락이라면 아래 ignore 문법으로 명시. |
| `lint/correctness/noUnusedVariables` | ~3 | 미사용 변수 제거, 또는 `_` 접두사. |
| `lint/correctness/noUnusedImports` | ~1 | 미사용 import 제거. |
| `lint/a11y/useSemanticElements` | ~3 | div 에 role 대신 의미적 태그(`<section>`, `<fieldset>` 등) 사용 — 단, CSS 영향이 있으니 변환 시 시각 검증 필요. |
| `lint/style/useImportType` | ~1 | 타입 전용 import 는 `import type { ... }`. |
| `lint/a11y/noAutofocus` | ~1 | `autoFocus` 는 접근성 이슈 — 로그인처럼 정당한 케이스면 `biome-ignore` + 사유. |

## 자동 수정이 안 되는 경우

대부분의 a11y warning 은 자동 수정 불가. 다음과 같이 처리:

### 의도된 패턴이면 inline ignore

```tsx
// biome-ignore lint/a11y/useSemanticElements: custom radio card with role+aria-checked already provided
<button role="radio" aria-checked={selected}>...</button>
```

규칙:
- **반드시 사유 포함** — `:` 다음에 짧은 설명. 빈 사유는 금지.
- 한 줄 위, 해당 토큰 바로 위. `// biome-ignore-start` / `-end` 블록은 사용 자제 (스코프가 넓어짐).
- 디자인 결정/도메인 사유면 그대로, 단순 귀찮음이면 ignore 대신 코드를 고친다.

### 의존성 배열 의도된 누락

```tsx
// biome-ignore lint/correctness/useExhaustiveDependencies: only run on mount
useEffect(() => { void ensureFlavorData(); }, []);
```

### `biome.json` 을 수정하는 경우

- 전역 룰 끄기/낮추기 변경은 한 줄짜리 시도가 아니라 **팀 합의** 가 있어야 합니다. PR description 에 사유 명시.
- 단일 파일/라인을 위해 전역 룰을 끄지 말 것 — inline ignore 가 우선.

## AI agent 들을 위한 가이드

> 코딩 에이전트(Codex / Claude Code / Cursor / Gemini CLI 등) 가 이 저장소에서 작업할 때 따라야 할 규칙.

1. **작업 종료 전 `npm run check:fix && npm run typecheck` 를 반드시 실행**. 결과에서 새 error 가 0 인지 확인하고, 새 warning 이 늘었는지 비교한다. 늘었다면 의도된 변경인지 PR/응답에 적는다.
2. **포매터에 맡긴다**. 들여쓰기/줄바꿈/세미콜론을 손으로 수정하지 말 것. `npm run format` 으로 일괄 처리.
3. **Biome 룰과 충돌하는 자체 판단을 하지 말 것**. 룰이 "이건 잘못됐다" 고 말하는데 이유가 명확하지 않으면 먼저 룰 설명 (`https://biomejs.dev/linter/rules/<rule-name>`) 을 확인한다.
4. **`biome-ignore` 는 마지막 수단**. 코드를 고칠 수 있으면 고친다. ignore 를 새로 추가할 때는 반드시 사유를 적고, 응답에서 그 사유를 사용자에게 알린다.
5. **새 warning 카테고리가 등장하면 알린다**. 위 표에 없는 새 룰이 warning 으로 잡히면 코드 수정과 함께 `LINTING.md` 표 업데이트를 제안한다.
6. **포맷 변경과 의미 변경을 같은 커밋에 섞지 말 것**. 자동 포맷팅은 `style:` 커밋으로 분리한다.
7. **CI 가 막혔다면 `npm run check` 의 결과를 그대로 인용**한 뒤 수정. 임의 추측 금지.

## CI

PR 워크플로 [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) 는 모든 PR 에서 다음을 실행합니다.

1. `npm ci`
2. `npm run typecheck`
3. `npm run check` (Biome)
4. `npm run build`

이 중 하나라도 실패하면 머지 차단.

## 자주 보는 메시지

- `Formatter would have printed the following content` — 포매터 미적용 파일. `npm run format` 실행.
- `Some errors were emitted while running checks` — error 가 있다는 의미. 출력 위쪽에서 `× ...` 라인을 찾는다.
- `Found N warnings` 만 보이고 끝났으면 **CI 는 통과**. error 가 0 이면 빌드는 막히지 않음.

## 추가 자료

- Biome 공식 문서: https://biomejs.dev/
- 룰 카탈로그: https://biomejs.dev/linter/rules/
- AGENTS.md — 코드 스타일과 프로젝트 컨벤션
- DESIGN.md — UI/UX 결정
