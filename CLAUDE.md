# CLAUDE.md

This project uses `AGENTS.md` as the canonical agent guide for the whole team (Codex + Claude Code + others). Read it first.

@AGENTS.md

---

The rest of this file is Claude Code-specific guidance that doesn't belong in AGENTS.md.

## Working with this user

- Default to Korean responses. The user prefers concise Korean for chat output and English for code / identifiers / commit messages.
- Be direct and short. The user has interrupted long-winded answers before — don't over-explain decisions.
- When unsure between two reasonable approaches, briefly propose both and let the user pick. Do not ask clarifying questions before reading the file in question.
- Don't auto-commit. Wait for an explicit "커밋해줘" (or English equivalent) before running `git commit`.

## Plan mode

Use plan mode (`/plan` or Ctrl+G) when:
- A change touches more than 2-3 files.
- The user is unsure about the approach ("어떻게 할까", "방법 제안").
- Refactoring or layout changes where the diff isn't obvious.

Skip plan mode for: typos, one-liner CSS tweaks, copy changes, single-file fixes the user already described in detail.

## Skills available in this session

The `superpowers` and `gstack` plugins are loaded. Treat their guidance as advisory, not mandatory — Anthropic's official guidance (this file + AGENTS.md) takes precedence when they conflict.

**Skills already used on this project:**
- `design-consultation` → produced `DESIGN.md` (Stitch / getdesign.md format).

**Skills worth invoking when relevant:**
- `frontend-design` — for new component design that needs to feel polished.
- `superpowers:brainstorming` — before any new feature work (per the skill's "use before creative work" rule).
- `superpowers:systematic-debugging` — for any bug investigation, before proposing fixes.
- `superpowers:verification-before-completion` — before declaring work done. Run `npm run typecheck` and exercise the change in a browser.

Do not invoke `superpowers:test-driven-development` against this codebase — there is no test infrastructure (see AGENTS.md "Verification"). Propose adding tests as a separate piece of work if warranted.

## Verification expectations

Because the repo has no test runner and no linter, the verification floor is:

1. `npm run typecheck` — must be clean.
2. For UI work: `npm run dev` + open the changed page in a browser. State the breakpoints you checked (desktop ≥1180px, tablet <1180px, mobile <760px).
3. For build-affecting changes: `npm run build` — must succeed including the postbuild SPA fallback.

If you cannot perform any of the above in the current environment, say so explicitly. Do not claim "이상 없음" / "verified" without evidence.

## Tone and length

- One-sentence updates between tool calls. Brief, not silent.
- End-of-turn: 1-2 sentences. What changed, what's next. No headers, no bullets unless the user asked for a structured answer.
- Use bullets and tables when comparing options, listing changes across files, or summarizing search results.
- No em-dashes in prose. No filler phrases ("Let me...", "I'll go ahead and...").

## What goes in CLAUDE.md vs AGENTS.md

- **AGENTS.md**: anything every coding agent (Codex, Cursor, Gemini, Claude) should know — project facts, commands, conventions, structure, style.
- **CLAUDE.md** (this file): Claude Code-specific UX — when to use plan mode, which skills to invoke, how to talk to this specific user, Anthropic-only features.

If a rule applies to all agents, put it in AGENTS.md and rely on `@AGENTS.md` above. Don't duplicate.

## Personal overrides

If a teammate wants Claude Code preferences that should not be committed (e.g., personal terseness settings, individual dev environment quirks), put them in `CLAUDE.local.md` and add it to `.gitignore`. That file is not present in this repo today.
