# SSH Auth / Complete 페이지 추가 설계

작성일: 2026-05-11
대상 레포: `rcp-front` (주), `rcp-server` (보조 변경)
관련 브랜치: rcp-server `fix/chae-ssh-access`

## 배경

`rcp-server`의 `fix/chae-ssh-access` 브랜치는 OAuth keyboard-interactive 방식의 SSH 베스천(`cmd/ssh-gateway`)을 도입합니다. 베스천은 SSH 접속 시 사용자 터미널에 아래 URL을 출력합니다.

```
{AuthURLBase}/ssh-auth?s={nonce}
```

(`cmd/ssh-gateway/auth.go:23-26`)

`AuthURLBase`는 프런트엔드 origin(예: `https://rcp.return.dev`)을 가리키지만, 현재 프런트엔드(`rcp-front`)에는 `/ssh-auth` 라우트가 존재하지 않습니다. 사용자가 URL을 열면 404. 또한 OAuth 콜백 성공 시 `rcp-server`가 인라인 HTML로 "로그인 완료" 페이지를 반환(`internal/domain/auth/handler.go:69-73`)하여 디자인 일관성이 깨집니다.

## 목표

1. `/ssh-auth?s=<nonce>` 공개 라우트 추가 → Google OAuth 시작
2. `/ssh/complete` 공개 라우트 추가 → SSH OAuth 완료 안내
3. 백엔드 콜백 응답을 인라인 HTML → 프런트 라우트로 302 리다이렉트
4. 브랜드 일관성(`AuthLayout`) 유지

## 비목표

- SSH 베스천 자체 동작 변경 (`fix/chae-ssh-access`의 기존 동작 유지)
- 일반 웹 로그인 콜백 흐름 변경 (JSON 응답 그대로)
- nonce 유효성 검증을 프런트에서 수행 (백엔드 nonce store가 담당)
- `window.close()`의 100% 보장 (브라우저 정책상 불가, 보조 안내로 충분)

## 변경 사항

### 프런트엔드 (`rcp-front`, 새 브랜치 `feat/ssh-auth-pages`)

#### 신규 파일

**`src/components/auth/SshAuthPage.tsx`**

책임: nonce 표시 + 명시적 OAuth 시작.

- `useSearchParams()`로 `s` 파라미터 읽기
- `AuthLayout headerTitle="SSH 세션 인증"` 래퍼
- `s` 유효성:
  - 빈 값 / `undefined` → "잘못된 접근입니다. SSH 터미널에서 표시된 링크로 다시 시도해주세요." 에러 카드, 로그인 페이지 링크
  - 정상 값 → 본 내용 렌더링
- 본 내용:
  - 안내문: "이 디바이스에서 시작된 SSH 세션을 인증합니다."
  - 세션 식별자: `s`의 처음 8자만 표시 + "5분 후 만료" 부가 안내 (TTL은 단순 표시값, 실제 만료는 백엔드)
  - 큰 버튼: "Google로 로그인" → `window.location.href = \`${apiBase}/auth/oauth/google?state=ssh:${encodeURIComponent(s)}\``
  - 경고문: "본인이 시작하지 않은 요청이면 이 페이지를 닫으세요."

**`src/components/auth/SshCompletePage.tsx`**

책임: OAuth 완료 후 정적 안내.

- `AuthLayout headerTitle="로그인 완료"` 래퍼
- "SSH 터미널로 돌아가세요." 메시지
- 보조: "이 창은 자동으로 닫히지 않을 수 있습니다. 닫고 터미널로 이동해주세요."
- 페이지 마운트 시 `setTimeout(() => window.close(), 3000)` 시도 (실패해도 무해)

#### 수정 파일

**`src/App.tsx`**

`AuthGuard` 바깥의 공개 라우트 그룹에 두 라우트 추가. 위치: 기존 `/login`, `/signup`, `/changes` 다음.

```tsx
<Route path="/ssh-auth" element={<SshAuthPage />} />
<Route path="/ssh/complete" element={<SshCompletePage />} />
```

import 두 줄 추가.

**`src/constants/routes.ts`**

`ROUTE_NAMES`에 `sshAuth: 'ssh-auth'`, `sshComplete: 'ssh-complete'` 추가. 일관성용 (실제 컴포넌트에서는 string literal로 path 사용).

### 백엔드 (`rcp-server`, 기존 `fix/chae-ssh-access` 브랜치에 추가 커밋)

#### 수정 파일

**`internal/domain/auth/handler.go`**

`Callback` 핸들러의 SSH 분기(69-73줄)에서 인라인 HTML 제거 → 프런트엔드 리다이렉트로 교체.

```go
c.Redirect(http.StatusFound, h.frontendBaseURL + "/ssh/complete")
```

`Handler` 구조체에 `frontendBaseURL string` 필드 추가. `NewHandler` 시그니처에 매개변수 추가.

**`internal/domain/auth/init.go`** (또는 와이어링 위치)

`NewHandler` 호출부에 frontend base URL 전달. 출처는 새 env var `RCP_FRONTEND_BASE_URL`. 환경별 의미:
- prod: `https://rcp.return.dev`
- dev (server.mjs): `http://127.0.0.1:4173`

env var 누락 시 동작: 기본값 빈 문자열로 두고, 빈 문자열인 경우 종전처럼 인라인 HTML 폴백 — 운영 점진 도입을 위한 안전망. 또는 필수로 두고 누락 시 fail-fast. **결정: 필수로 둔다.** SSH 흐름은 이 변수 없으면 깨지는 게 명확히 드러나는 게 낫다.

**`cmd/api/main.go` (또는 config 로더)**

`RCP_FRONTEND_BASE_URL` 읽어서 의존성 주입.

**테스트**

기존 auth 콜백 테스트가 있다면 SSH 분기에 대해 redirect 응답을 검증하도록 갱신. 없다면 신규 작성은 생략.

## 데이터 흐름

```
[사용자 SSH 터미널]
  ssh rcp-gw → keyboard-interactive 프롬프트
  "Open: https://rcp.return.dev/ssh-auth?s=abc123"

[브라우저, 사용자가 URL 열기]
  GET https://rcp.return.dev/ssh-auth?s=abc123
    → SPA: SshAuthPage 렌더
    → 사용자가 "Google로 로그인" 클릭
    → window.location = .../auth/oauth/google?state=ssh:abc123

[Google OAuth]
  사용자 동의 → Google이 RCP 콜백으로 redirect (code, state=ssh:abc123)

[RCP API]
  GET /auth/oauth/google/callback?code=...&state=ssh:abc123
    → state prefix 'ssh:' 감지
    → code 교환 → 이메일 추출
    → ssh-gateway notify socket으로 (nonce=abc123, email) HMAC 전송
    → c.Redirect(302, "https://rcp.return.dev/ssh/complete")

[브라우저]
  GET /ssh/complete → SshCompletePage 렌더
  ("로그인 완료. SSH 터미널로 돌아가세요.")

[SSH 터미널]
  ssh-gateway가 인증 결과 수신 → VM 메뉴 표시
```

## 보안

- `s` 파라미터는 React가 JSX 본문에 escape하여 렌더 → XSS 위험 없음
- 리다이렉트 URL 구성 시 `encodeURIComponent(s)` 강제
- `<a href>`에 `s`를 직접 삽입하지 않음 (open-redirect/스킴 인젝션 회피)
- `RCP_FRONTEND_BASE_URL`은 운영자가 신뢰하는 정적 값 → open-redirect 표면 아님
- nonce 자체 검증/만료는 백엔드 책임 (프런트에서 형식 검증 안 함)

## 테스트 전략

- `npm run typecheck` 통과
- 수동 테스트:
  1. `/ssh-auth` (s 없음) → 에러 카드 표시
  2. `/ssh-auth?s=abcdef0123456789` → 본 페이지 렌더, 8자만 표시 확인
  3. 버튼 클릭 → `.../auth/oauth/google?state=ssh:abcdef0123456789` 로 이동 확인
  4. `/ssh/complete` → 완료 페이지 렌더
- 백엔드: 기존 SSH 콜백 통합 테스트가 있다면 redirect Location 헤더 검증

## 마이그레이션 / 배포 순서

1. 프런트 PR 머지 → 배포 (라우트 추가는 backward-compat, 영향 없음)
2. 백엔드: `RCP_FRONTEND_BASE_URL` env 설정 → handler 변경 머지 → 배포
3. ssh-gateway가 출력하는 `RCP_SSH_GW_AUTH_URL_BASE`가 프런트 origin과 일치하는지 확인
4. 실제 SSH 접속 e2e 확인

## 작업 분할

| # | 작업 | 레포 | 비고 |
|---|------|------|------|
| 1 | spec 작성 + 커밋 | rcp-front | 이 문서 |
| 2 | `feat/ssh-auth-pages` 브랜치 생성 | rcp-front | |
| 3 | SshAuthPage 구현 | rcp-front | |
| 4 | SshCompletePage 구현 | rcp-front | |
| 5 | 라우트 등록 | rcp-front | App.tsx |
| 6 | typecheck | rcp-front | `npm run typecheck` |
| 7 | 백엔드 handler.go redirect 전환 | rcp-server | `fix/chae-ssh-access` |
| 8 | `RCP_FRONTEND_BASE_URL` 와이어링 | rcp-server | config + main + init |
| 9 | 백엔드 테스트 갱신 | rcp-server | 있다면 |
