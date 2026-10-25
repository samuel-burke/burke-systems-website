# Contributing

This is a single-maintainer repository owned by Samuel Burke. These are the working rules for the owner, collaborators and AI agents.

## Ground rules

Read [AGENTS.md](AGENTS.md) (the full engineering policy), the [README](README.md), and [SECURITY.md](SECURITY.md) first. Keep changes focused, reversible and covered by tests. Never put credentials, personal data from the contact form, or private business details in issues, fixtures, screenshots, commits or PRs. Report vulnerabilities privately, never in a public issue.

## Git and pull requests

1. Branch from the latest `dev`: `feature/short-name`, `bugfix/short-name`, `chore/`, `docs/`, `test/`, `refactor/`, or `site/` for content and design work.
2. Never commit or push to `dev` or `main` directly. Open a PR into `dev`.
3. Fill in the PR template: why, what, risk, the checks you actually ran and their results.
4. CI must pass. Do not merge without the owner's approval, and do not self-merge as an agent.
5. Releases are a detailed PR from `dev` into `main` with the changelog, test evidence, staging check and rollback plan. **Merging into `main` deploys to production** through Cloudflare Pages.
6. Hotfixes (`hotfix/*` into `main`, labeled `emergency-hotfix`) need the owner's explicit approval and a follow-up PR into `dev`.

## Development commands

All of these run on Node 26 with pnpm 10.34.1.

- Install: `pnpm install`
- Run: `pnpm dev` (pages only) or `pnpm build`, then the two Wrangler commands in the README (with the form endpoint)
- Format / lint / types: `pnpm format:check`, `pnpm lint`, `pnpm typecheck`
- Unit tests and coverage: `pnpm test:unit`, `pnpm test:coverage`
- Build: `pnpm build`
- Integration tests: `pnpm test:integration` (after `pnpm build`)
- E2E tests: `pnpm test:e2e` (after `pnpm build`; needs `pnpm exec playwright install chromium` once)
- Dependency audit: `pnpm audit --audit-level high`

See `AGENTS.md` Section 12 for the required completion statuses (VERIFIED, PARTIALLY VERIFIED, UNVERIFIED, BLOCKED) and per-check results (PASS, FAIL, NOT RUN, N/A). Writing tests is not the same as running them.

## Coding conventions

- Formatting: Prettier defaults (no config file). Linting: ESLint with TypeScript, Astro and jsx-a11y rules (`eslint.config.mjs`).
- TypeScript strict mode (`astro/tsconfigs/strict`).
- Unit tests sit next to the code (`src/**/*.test.ts`); integration and E2E tests live in `tests/`.
- UI follows the brand skill in `.agents/skills/burke-brand` and targets WCAG 2.2 AA (`.agents/skills/web-accessibility`).
- Copy is plain, direct and practical.

## Review and support

The owner reviews every PR. There is no promised review time.
