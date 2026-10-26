# Kickoff audit and setup plan

Run on 2026-10-25 against `main` at `db3b270`, following [AGENTS.md](../AGENTS.md) Sections 14, 16 and 17. Repeat the evidence sections at each release.

## 1. What existed before this change

| Area              | Found                                                                                                                                                                                                                                         |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branches          | `main` plus 21 old `site/*` and `claude/*` task branches. **No `dev`.** No branch protection or rulesets (`main` reports `protected: false`).                                                                                                 |
| Open PRs          | #22 (`site/contact-email` into `main`).                                                                                                                                                                                                       |
| CI                | **None.** No `.github/` directory; GitHub reports 0 workflows.                                                                                                                                                                                |
| Deployment        | Cloudflare Pages Git integration, set up by the owner on 2026-10-21. Production from `main`, previews for other branches. Custom domain burke.systems pending. Not visible from the repository: build settings, Preview bindings and secrets. |
| Stack             | Astro 7.4, React 19 islands, Tailwind 4, shadcn/ui (vendored), TypeScript 6 strict, Node 26 (strict `engines`), pnpm 10.34.1 with a committed lockfile and supply-chain settings in `pnpm-workspace.yaml`.                                    |
| Server code       | `functions/_middleware.ts` (pages.dev redirect), `functions/api/intake.ts` (form to D1, Resend and ntfy alerts).                                                                                                                              |
| Scripts           | `dev`, `build`, `preview`, `lint`, `format`, `format:check`, `typecheck`, `test`.                                                                                                                                                             |
| Tests             | 17 Vitest unit tests in 4 files, all passing. No coverage tool, no integration or E2E tests.                                                                                                                                                  |
| Baseline checks   | `format:check` **FAIL** (9 files: 5 sources, `package.json`, the lockfile and 2 vendored skill files). `lint`, `typecheck`, `test`, `build` PASS.                                                                                             |
| Baseline coverage | 58.1% lines / 78.6% branches over all of `src` and `functions` (no thresholds). Over the testable logic only (`src/lib`, `functions`): measured after adding tests, see below.                                                                |
| Docs              | `README.md`, `AGENTS.md` (from the agent-scaffold, with `CLAUDE.md` symlinked to it), `LICENSE` (BSD 3-Clause, copyright freeCodeCamp, inherited from the scaffold).                                                                          |

## 2. Gaps against AGENTS.md

| Requirement                                                                                                   | Status before         | Status after this change                                                      |
| ------------------------------------------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- |
| `main` and `dev` protected, PR-only                                                                           | Not implemented       | `dev` created from `main`; protection still needs the owner (Section 6)       |
| Branch-flow check                                                                                             | Missing               | `.github/workflows/branch-flow.yml`                                           |
| Stack-specific CI (lint, format, types, unit, integration, E2E, coverage, audit, build)                       | Missing               | `.github/workflows/ci.yml`, four jobs                                         |
| Required status checks                                                                                        | Missing               | Names defined; owner must require them                                        |
| Unit / integration / E2E layers                                                                               | Unit only             | All three                                                                     |
| Coverage measured with thresholds                                                                             | No                    | v8, enforced in `pnpm test:coverage`                                          |
| README badges for `dev` and `main`                                                                            | No                    | Prepared as a comment; added only after the workflow has run on both branches |
| `.env.example`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, PR/issue templates, architecture docs, ADRs | Missing               | Added (SECURITY.md as a draft)                                                |
| Privacy notice                                                                                                | Missing               | Still missing; data inventory written, notice needs the owner (Section 7)     |
| License decision                                                                                              | Scaffold license only | Owner decision needed (Section 7)                                             |
| Deployment documented with rollback                                                                           | No                    | `docs/ci-cd.md`, ADR 0001                                                     |
| Rate limiting on the public endpoint                                                                          | No                    | Still no; Cloudflare WAF rule recommended                                     |

## 3. How the two AGENTS.md files were merged

The starter kit's `AGENTS.md` is now the file, unchanged except for Prettier whitespace. Everything from the old project `AGENTS.md` (rules, layout, shadcn notes, commands, skills) moved into its **Project-specific context** section, updated for the new test commands. Additions there, all narrower than or equal to the kit's rules:

- Extra branch prefixes into `dev`: `site/*` (the owner's convention) and `dependabot/*`. Agents use the standard prefixes.
- The coverage threshold scope (`src/lib/**`, `functions/**`) and why.
- Cloudflare Pages as the single deploy mechanism, and that merging `main` deploys.
- The rule against private business details in the repo.

`CLAUDE.md` still points at `AGENTS.md`.

## 4. Plan

**Acceptance criteria for this setup**

1. AC1: Every PR into `dev` or `main` runs format, lint, type check, unit tests with coverage thresholds, build, integration tests, E2E tests and a dependency audit, and fails when any of them fails.
2. AC2: PRs into `main` are only accepted from `dev` (or a labeled `hotfix/*`); PRs into `dev` only from task branches.
3. AC3: A valid contact request is stored in D1 and the visitor sees the thanks page; invalid, spam, oversized, malformed and wrong-method requests are handled without storing bad data or showing a server error.
4. AC4: The owner alert is sent with the request's content when configured, and a failed alert never loses the request.
5. AC5: The production pages.dev host redirects to burke.systems; previews are untouched.
6. AC6: Key pages load in desktop and mobile browsers with no detectable WCAG A/AA issues and no horizontal scroll.
7. AC7: Docs describe the real commands, environments, deploy path, rollback and data handling, and claim nothing unverified.

**Architecture** (unchanged by this work): static Astro pages on Cloudflare Pages, one Pages Function writing to D1, optional Resend and ntfy alerts. See [architecture.md](architecture.md).

**Test layers** ([ADR 0002](adr/0002-test-layers.md))

| Layer            | Tool                                                   | Scope                                                                                                                                                           |
| ---------------- | ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unit             | Vitest + v8 coverage                                   | `src/lib/intake.ts`, `src/lib/utils.ts`, both Pages Functions with fakes for D1 and fetch                                                                       |
| Integration      | Playwright `request` + `wrangler pages dev` + local D1 | `/api/intake` over HTTP with the real schema, local alert receiver, middleware                                                                                  |
| E2E              | Playwright + Chromium (desktop, Pixel 7) + axe-core    | Homepage, 404, thanks/error pages, contact journey, empty-form blocking                                                                                         |
| Smoke (deployed) | `pnpm test:smoke`                                      | The `@readonly` E2E tests against a preview or production URL                                                                                                   |
| Not applicable   |                                                        | Authorization and tenant isolation (no accounts or tenants). Contract tests against Resend (would send real email; request shape is unit-tested). Load testing. |

Coverage targets: 90% lines, statements and functions, 85% branches on `src/lib/**` and `functions/**`, enforced. New code in those paths should stay at or above 90%.

**Security boundaries**: the only untrusted input is `POST /api/intake`; all validation happens in the function; SQL is parameterized; secrets live only in Pages environment variables; CI has read-only `contents` permission, no secrets, no `pull_request_target`, and checks out without persisting credentials.

**CI quality gates**: the five check names in [ci-cd.md](ci-cd.md#required-github-checks).

## 5. Findings fixed along the way

- **Server error on a non-form body.** `POST /api/intake` with a JSON body threw in `request.formData()` and returned HTTP 500. Reproduced with curl against `wrangler pages dev` and with a new unit test that failed first (`TypeError: Content-Type was not one of "multipart/form-data"...`). The function now sends the visitor to `/contact-error`. Covered by a unit and an integration test.
- **Logo link label (WCAG 2.5.3).** axe reported `label-content-name-mismatch` on the header logo link on every page: its text content read "BURKESYSTEMS". A space between the two words, which flex layout does not render, fixes it. Checked in Chromium: same bounding box (117.4 x 43.5 px) and pixel-identical screenshots with and without the space.
- **High-severity advisory in test tooling.** `wrangler` brought `undici` < 7.30.1 (GHSA-xjj6-f33q-929c). Pinned to `>=7.30.1 <8` in `pnpm-workspace.yaml`. Production dependencies had no advisories. Remaining: 2 moderate and 2 low advisories, all in `fast-uri` via `@astrojs/check` (dev only), below the CI threshold.
- **Format check failing on main.** Formatted the 5 source files; the lockfile and vendored skills are now in `.prettierignore`.
- **Type check picked up generated reports.** `coverage/`, `playwright-report/`, `test-results/` and `.wrangler/` are excluded from `tsconfig.json` and ESLint.

## 6. Settings the owner must configure

None of these can be done from the repository, and none are active until done. Steps are in [ci-cd.md](ci-cd.md#owner-settings-not-possible-from-the-repository).

- GitHub: rulesets for `main` and `dev` with the five required checks; decide the approvals rule (a sole maintainer cannot approve their own PRs); retarget PR #22 to `dev`; optionally enable private vulnerability reporting and Dependabot alerts.
- Cloudflare Pages: confirm production branch `main` and build settings; give Preview its own D1 database and alert settings; optionally protect previews with Access; add a WAF rate-limit rule for `/api/intake`.

## 7. Policy and governance decisions

| File                                                 | Applies?                                                                                 | Decision                                                                                                                                                                                                                                                                              |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `README.md`                                          | Yes                                                                                      | Rewritten from the real commands; every listed command was run (Section 8).                                                                                                                                                                                                           |
| `AGENTS.md`                                          | Yes                                                                                      | Kit policy plus project context (Section 3).                                                                                                                                                                                                                                          |
| `.gitignore`, `.env.example`                         | Yes                                                                                      | Added Wrangler state, `.dev.vars`, test output. `.env.example` lists the five variable names, no values.                                                                                                                                                                              |
| `CHANGELOG.md`                                       | Yes                                                                                      | Started with an Unreleased section.                                                                                                                                                                                                                                                   |
| `CONTRIBUTING.md`                                    | Yes                                                                                      | Added.                                                                                                                                                                                                                                                                                |
| `SECURITY.md`                                        | Yes                                                                                      | **DRAFT.** No private reporting channel exists; must be set before the repo is made public.                                                                                                                                                                                           |
| Privacy notice                                       | **Yes**: the form collects names, emails and free text and sends them to Resend and ntfy | **Not written.** Inventory in [data-inventory.md](data-inventory.md). The owner needs to decide retention and a deletion contact, and review the wording (with legal advice if wanted) before a notice goes on the site.                                                              |
| `LICENSE`                                            | Owner decision                                                                           | **Unresolved.** The file is the scaffold's BSD 3-Clause license with freeCodeCamp's copyright. Left untouched. The owner should decide whether the Burke Systems code and content are proprietary (keeping the BSD notice for the scaffold-derived parts) or licensed some other way. |
| `ACCESSIBILITY.md`                                   | Yes (public site)                                                                        | Added with the tested scope only; no conformance claim; reporting channel pending.                                                                                                                                                                                                    |
| `SUPPORT.md`, `CODE_OF_CONDUCT.md`                   | No                                                                                       | Private, single-maintainer repository with no community. Revisit if it goes public with outside contributors.                                                                                                                                                                         |
| `.github/CODEOWNERS`                                 | No                                                                                       | One maintainer; it would add nothing, and "require code owner review" would block the owner's own PRs.                                                                                                                                                                                |
| `.github/dependabot.yml`                             | Yes                                                                                      | Added for npm and GitHub Actions, weekly, into `dev`, with a 3-day cooldown matching `minimumReleaseAge`. Starts working once it is on the default branch (`main`).                                                                                                                   |
| PR / issue templates                                 | Yes                                                                                      | Added; release section adapted to Cloudflare Pages. Blank issues disabled.                                                                                                                                                                                                            |
| `docs/architecture.md`, `docs/adr/`, `docs/ci-cd.md` | Yes                                                                                      | Added. ADR 0001 records the owner's 2026-10-21 hosting choice; ADR 0002 is proposed with this PR.                                                                                                                                                                                     |

## 8. Verification evidence (local)

Environment: Linux cloud container, Node v26.12.1, pnpm 10.34.1, Chromium from Playwright 1.63.0, Wrangler 4.152.0. Clean run (`dist`, `coverage`, test output and `.wrangler` deleted first) on the final code.

| Check               | Command                                                        | Result                                                                                                                                                                                                                                                             |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Install             | `pnpm install --frozen-lockfile`                               | PASS                                                                                                                                                                                                                                                               |
| Format              | `pnpm format:check`                                            | PASS                                                                                                                                                                                                                                                               |
| Lint                | `pnpm lint`                                                    | PASS (also with coverage/report folders present)                                                                                                                                                                                                                   |
| Types               | `pnpm typecheck`                                               | PASS, 0 errors, 0 warnings, 0 hints (47 files)                                                                                                                                                                                                                     |
| Unit + coverage     | `pnpm test:coverage`                                           | PASS, 20/20 tests. Statements 98.18%, branches 94.73%, functions 100%, lines 98.03%                                                                                                                                                                                |
| Coverage gate works | `vitest --run --coverage --coverage.thresholds.lines=99`       | Exits 1, as expected                                                                                                                                                                                                                                               |
| Build               | `pnpm build`                                                   | PASS, 4 pages                                                                                                                                                                                                                                                      |
| Integration         | `pnpm test:integration`                                        | PASS, 12/12                                                                                                                                                                                                                                                        |
| E2E                 | `pnpm test:e2e`                                                | PASS, 9/9 (7 desktop, 2 Pixel 7)                                                                                                                                                                                                                                   |
| Dependency audit    | `pnpm audit --audit-level high`                                | PASS (0 high/critical; 2 moderate, 2 low)                                                                                                                                                                                                                          |
| Branch-flow logic   | The workflow's script run locally for 12 base/head/label cases | PASS: accepts `dev`->`main`, labeled `hotfix/*`->`main`, task (`chore/`, `feature/`, ...), `site/` and Dependabot branches into `dev`; rejects feature->`main`, unlabeled hotfix, uppercase names, unprefixed and `claude/` branches, `main`->`dev`, unknown bases |
| README local run    | The two Wrangler commands in the README, then a form POST      | PASS: 303 to `/thanks`. (A first version without `--persist-to` failed with "no such table: intake"; fixed.)                                                                                                                                                       |
| Logo change visual  | Chromium bounding box and screenshot comparison                | PASS: identical                                                                                                                                                                                                                                                    |

Not verified here:

| Check                                  | Result                     | Why / next step                                                                                      |
| -------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| GitHub Actions run                     | NOT RUN at time of writing | Runs on the PR into `dev`; the PR records the result                                                 |
| Branch protection                      | NOT CONFIGURED             | Owner setting                                                                                        |
| Cloudflare preview / staging smoke     | NOT RUN                    | This environment cannot reach `*.pages.dev`; run `PLAYWRIGHT_BASE_URL=<preview URL> pnpm test:smoke` |
| Production                             | N/A                        | Nothing is merged or deployed                                                                        |
| Keyboard-only and screen-reader checks | NOT RUN                    | Manual checks; listed in `ACCESSIBILITY.md`                                                          |
