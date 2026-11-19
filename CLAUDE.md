# Optimal — Claude project guide

## Product
Hybrid learning platform: public course documentation plus personal learning, practice, explanations, knowledge gaps, and progress.

## Stack (verify before changing)
Known: Angular 19, TypeScript, standalone components, Signals, RxJS, Bootstrap 5, Bootstrap Icons, Marked, DOMPurify, Angular SSR. Course content: `public/courses/`.

## Working rules
- Read `.claude/skills/optimal-development/SKILL.md` for all Optimal work.
- Read `.claude/skills/token-efficiency/SKILL.md` to keep context lean without skipping quality checks.
- Use installed `frontend-design` skill for substantial UI work; use `github` for repository/PR operations.
- Inspect git status, branch, relevant files, and PR state before editing.
- Never overwrite user changes, merge a PR, deploy, or delete a branch without explicit approval.
- Prefer focused changes, existing dependencies, strict TypeScript, accessible semantic HTML, and responsive layouts.
- Preserve DOMPurify sanitization. Treat Markdown and learner content as untrusted.
- Run relevant tests/build/lint where possible; report exactly what ran and what failed.
- Keep public course source content separate from personal learner notes.
- Do not claim browser verification unless an actual browser check was performed.

## UI direction
Distinctive editorial learning product; explore a learning-notebook visual language (warm paper, ink-blue, restrained highlighter yellow) rather than generic dashboard styling. Desktop header with hamburger-controlled sidebar, readable content column, contextual navigation, and footer. Mobile sidebar must become an accessible drawer. Validate against existing brand and accessibility before implementation.
