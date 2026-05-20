# CLAUDE.md

`AGENTS.md` 가 모든 에이전트의 단일 가이드. 먼저 읽는다.

@AGENTS.md

---

여기서부터는 Claude Code 한정 가이드.

## User interaction

- 응답 기본 한국어. 코드·식별자·커밋 메시지는 영어. AGENTS.md "Communication" 참고.
- 짧고 직설적으로. 결정 사유를 길게 설명하지 말 것.
- 두 접근법이 합리적이면 둘 다 짧게 제시하고 사용자가 고르게 한다. 단, 파일을 읽기 전 명확화 질문은 금지.
- 자동 커밋 금지. 명시 요청 ("커밋해줘" 등) 후에만 `git commit`.

## Plan mode

다음일 때 plan mode (`/plan` 또는 Ctrl+G):
- 2~3 파일 초과 변경.
- 접근법이 불확실 ("어떻게 할까", "방법 제안").
- 리팩토링 / 레이아웃 변경 등 diff 가 자명하지 않을 때.

생략: 오타, 한 줄 CSS 수정, 카피 변경, 사용자가 이미 상세히 묘사한 단일 파일 fix.

## Skills

`superpowers`, `gstack` 플러그인이 로드되어 있음. **자문일 뿐**, AGENTS.md / 이 파일과 충돌하면 후자 우선.

사용 권장:
- `frontend-design` — 새 컴포넌트 디자인.
- `superpowers:brainstorming` — 신규 기능 작업 전.
- `superpowers:systematic-debugging` — 버그 조사 전.
- `superpowers:verification-before-completion` — 완료 선언 전. `npm run typecheck && npm run check` 와 브라우저 검증 실행.

사용 금지: `superpowers:test-driven-development` (테스트 인프라 없음).

이전 사용: `design-consultation` → `DESIGN.md` 생성.

## Verification floor

AGENTS.md "Verification" 절을 따른다. 요약:

1. `npm run typecheck` — clean.
2. `npm run check` — 0 errors. 자세한 룰은 [LINTING.md](./LINTING.md).
3. UI 변경이면 브라우저로 직접 확인 + 본 breakpoint 명시 (desktop ≥1180px / tablet <1180px / mobile <760px).
4. 빌드 영향이 있으면 `npm run build`.

수행 불가 항목은 "확인 못함" 으로 **명시**. 추정으로 "이상 없음" 선언 금지.

## Tone

- 도구 호출 사이는 한 문장 업데이트. 침묵 금지.
- 턴 종료: 1~2문장. 변경 사항 + 다음. 헤더/불릿은 사용자가 구조화된 답을 요청했을 때만.
- 옵션 비교 / 파일 간 변경 정리 / 검색 결과 요약은 표나 불릿 사용.
- prose 에 em-dash 금지. "Let me...", "I'll go ahead..." 같은 filler 금지.

## CLAUDE.md vs AGENTS.md

- **AGENTS.md** — 모든 에이전트가 알아야 할 것: 프로젝트 사실, 컨벤션, 구조, 스타일.
- **CLAUDE.md** (이 파일) — Claude Code UX: plan mode 기준, skill 선택, 이 사용자와의 대화 방식.

같은 규칙이면 AGENTS.md 에만 적고 `@AGENTS.md` 로 참조. 중복 금지.

## Personal overrides

개인 설정은 `CLAUDE.local.md` 에 (gitignored). 현재 저장소에는 없음.
