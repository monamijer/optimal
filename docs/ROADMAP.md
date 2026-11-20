# Optimal — Product and architecture roadmap

## Vision
Move from "a reader of course documents" to a **local-first learning companion** built around one loop:
**Learn → Practise → Explain → Measure.** Everything runs in the browser (frontend only); data stays in the learner's hands.

## Inspirations (what we borrow)
- **MDN, Stripe Docs:** reading experience, table of contents, search, code presentation.
- **Khan Academy, Coursera:** course → chapter structure, objectives, prerequisites, checkpoints.
- **Anki, Duolingo:** short practice sessions and spaced repetition. Streaks and badges come last.
- **freeCodeCamp, Exercism, LeetCode:** in-browser code exercises with tests and instant feedback.
- **Notion, Obsidian:** personal notes in Markdown, free export, data portability.

## Architecture principles
1. **Storage behind an interface** (`LearningStore`). First implementation: IndexedDB. A server or Drive adapter can be added later without touching features.
2. **Content is data.** Each course is a folder of Markdown files with front matter (objectives, level, prerequisites, exercises). A build script generates the catalogue; no hard-coded course list in code.
3. **Learner data is separate from public course content** (notes, progress, answers never mix with course files).
4. **Angular:** standalone components, signals, `inject()`, `OnPush`, lazy routes (`loadComponent`), strict typing, one folder per feature, no NgRx until the state genuinely needs it.
5. **Quality:** unit tests for services and logic, Playwright end-to-end tests, an accessibility audit (axe) in CI, bundle budgets.
6. **Security:** keep DOMPurify; treat Markdown and learner input as untrusted; run learner code only in an isolated Web Worker or sandboxed iframe.

## Roadmap
| Phase | Scope | Effort |
|---|---|---|
| **0. Foundations** | Merge pending PRs, add `ng test` to CI, generate the catalogue from content, `LearningStore` layer (progress goes through it), fix content accents | M |
| **1. Learn** | Front matter (objectives, duration, prerequisites), previous/next chapter, chapter "completed" state, global content search, bookmarks | M |
| **2. Practise** | Multiple-choice quizzes written in Markdown, flashcards with spaced repetition, JavaScript exercises with tests | L |
| **3. Explain** | "Explain in your own words" prompts, personal notes per section, difficulties list with a review queue | M |
| **4. Measure and protect data** | Mastery dashboard (from exercise and review results, not time spent), weekly review, **backup (see below)** | M |
| **5. Create** | In-app course editor with Markdown preview, import/export of course packs, professor role | L |
| **6. Platform** | Offline PWA, translations, printable certificate, optional server adapter behind `LearningStore` | varies |

## Backup and portability (Phase 4, designed early)
Local data is lost if the browser storage is cleared, and some browsers (notably Safari) evict storage of rarely visited sites. A change of browser or computer must not mean starting over.

1. **Export / import file** (first, no account needed): one versioned JSON file (`schemaVersion`, `exportedAt`, checksum) with progress, notes, difficulties, flashcards and settings. Import validates the schema, migrates older versions, and lets the user choose **replace** or **merge** (newest `updatedAt` wins per item).
2. **Backup reminder** (non-intrusive): a dismissible banner when the last backup is older than a threshold (for example 14 days) **and** there are unsaved changes; "remind me later" snoozes it. Never a blocking dialog.
3. **Reduce eviction risk:** request `navigator.storage.persist()`; suggest installing the PWA.
4. **Optional Google Drive backup** (after step 1 works): Google Identity Services with the `drive.appdata` scope (a hidden app folder, no access to the user's other files). Requires a Google Cloud OAuth client ID and a consent screen; opt-in only, same export format, so it is just another adapter.

## Decisions and honest limits
- **"Premium" is cosmetic** without a server (course files are public). Rename to "members' courses" or accept it as organisation only.
- **Data is per browser** until the backup/Drive feature exists; there is no real-time sync across devices.
- **Mastery comes from practice** (quizzes, exercises, reviews), not from time spent or text written.
- **Gamification is last**, after the Learn → Practise → Explain loop works.

## First pull requests
1. Catalogue generation from content + `LearningStore` (Phase 0).
2. Chapter "completed" state + previous/next navigation (Phase 1).
3. Global content search (Phase 1).
