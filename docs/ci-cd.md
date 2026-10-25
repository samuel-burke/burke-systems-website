# CI/CD and release delivery

Adapted from the starter kit's provider-neutral template on 2026-10-25. Rows marked NOT RUN or NOT CONFIGURED are not working safeguards yet.

## Scope and decisions

- Application: burke.systems marketing site
- Stack and artifact: Astro static site (`dist/`) plus Cloudflare Pages Functions (`functions/`), Node 26, pnpm 10.34.1
- CI system: GitHub Actions (`.github/workflows/ci.yml`, `.github/workflows/branch-flow.yml`)
- Deployment provider: Cloudflare Pages, project `burke-systems-website` ([ADR 0001](adr/0001-cloudflare-pages.md))
- Why: already set up by the owner, free at this size, preview URLs for every branch, and the form endpoint and database (Functions + D1) live on the same platform.
- **Single release controller:** Cloudflare Pages Git integration. GitHub Actions never deploys and has no Cloudflare credentials. Do not add `wrangler pages deploy` to a workflow, and do not add a root `wrangler.toml`/`wrangler.jsonc` (Pages would start reading bindings from it instead of the dashboard). The test-only config lives in `tests/wrangler.jsonc`.

## Source and environment mapping

| Source                                            | Quality checks                                            | Target                                                                             | Secrets / data                   | Approval to promote                                        |
| ------------------------------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------- | ---------------------------------------------------------- |
| Task PR into `dev`                                | `CI` (4 jobs) + `Branch flow`                             | Pages preview `<branch>.burke-systems-website.pages.dev`                           | Pages **Preview** environment    | Owner review, then merge into `dev`                        |
| `dev`                                             | `CI` on push                                              | Pages preview `dev.burke-systems-website.pages.dev` (staging)                      | Pages **Preview** environment    | Owner opens a release PR                                   |
| Release PR `dev` into `main`                      | All required checks; staging smoke run recorded in the PR | None until merged                                                                  | No production access for PR code | Owner approval on the PR                                   |
| `main` after merge                                | `CI` on push (after the fact)                             | **Production**, burke.systems (and the pages.dev production host, which redirects) | Pages **Production** environment | The merge itself. **Merging deploys.**                     |
| `hotfix/*` into `main` (label `emergency-hotfix`) | Same checks                                               | Production after merge                                                             | Production                       | Owner's explicit approval; reconcile into `dev` afterwards |

Pages builds and deploys a branch as soon as it is pushed, whether or not GitHub CI has passed. Previews are therefore deployed even for failing commits, and production is protected only by the merge rules on `main`.

## Required GitHub checks

The job names in the workflows are the status checks to require:

| Check name                   | Workflow    | Runs                                                   |
| ---------------------------- | ----------- | ------------------------------------------------------ |
| `Lint, format and types`     | CI          | `pnpm format:check`, `pnpm lint`, `pnpm typecheck`     |
| `Unit tests and coverage`    | CI          | `pnpm test:coverage` (fails below thresholds)          |
| `Build, integration and E2E` | CI          | `pnpm build`, `pnpm test:integration`, `pnpm test:e2e` |
| `Dependency audit`           | CI          | `pnpm audit --audit-level high`                        |
| `Validate branch flow`       | Branch flow | Source/target branch rules                             |

## Owner settings (not possible from the repository)

GitHub (Settings > Rules > Rulesets, or Branches):

1. Ruleset for `main` and `dev`: require a pull request; require the five checks above to pass and branches to be up to date; require conversation resolution; block force pushes and deletion; no bypass list.
2. Approvals: as the only maintainer you cannot approve your own PRs, so a "required approvals: 1" rule would block every PR you open yourself. Either set required approvals to 0 and treat your merge as the approval, or keep 1 and only merge PRs opened by an agent or collaborator.
3. Default branch: keep `main` (Dependabot reads its config from the default branch). Change the base of open PRs, such as #22, to `dev`.
4. Optional: enable private vulnerability reporting (for `SECURITY.md`) and Dependabot alerts.

Cloudflare Pages (dashboard > Workers & Pages > burke-systems-website):

1. Settings > Builds: confirm the production branch is `main` and preview deployments are on for all non-production branches. Confirm the build command is `pnpm build` (or `pnpm run build`) and the output directory is `dist`.
2. Settings > Bindings: give **Preview** its own D1 database (for example `burke-intake-preview`, with `migrations/0001_intake.sql` applied), not the production one. Otherwise every preview and `dev` submission lands in the production table.
3. Settings > Variables and Secrets: keep production alert secrets in **Production** only, or use a separate ntfy topic for **Preview**.
4. Optional: Settings > General > Access policy to put previews behind Cloudflare Access.
5. Security > WAF: a rate-limiting rule for `POST /api/intake`.

## Smoke tests

- Read-only checks that change nothing (homepage, 404, axe scans): `PLAYWRIGHT_BASE_URL=<url> pnpm test:smoke`. Safe against previews and production.
- The form journey writes a row, so it runs only against the local test server in CI. To check a preview's form by hand, submit with an obviously fake name and delete the row afterwards from the Preview database.

## Release steps

1. On a task branch into `dev`: move `CHANGELOG.md` entries from Unreleased to `## [x.y.z] - YYYY-MM-DD`.
2. After that merges, run the smoke tests against `https://dev.burke-systems-website.pages.dev` and record the result.
3. Open the release PR `dev` into `main` from the template's release section: version, changelog, included PRs, migrations, CI and staging evidence, rollback plan.
4. Apply any new D1 migration to production **before** merging if the new code needs it (owner approval; migrations must stay compatible with the code currently in production).
5. Owner approves and merges. Pages deploys `main`.
6. Check the deployment in the Pages dashboard (commit SHA matches the merge commit), then run `PLAYWRIGHT_BASE_URL=https://burke.systems pnpm test:smoke` and watch the Functions logs for `intake:` errors.
7. Tag the merge commit `vx.y.z`.

## Rollback

Pages dashboard > Deployments > pick the last good production deployment > Rollback. Then open a revert PR so `main` matches what is live. D1 schema changes are not rolled back by this; use D1 Time Travel only with the owner's approval.

## Verification record (2026-10-25)

| Check                                      | Result                 | Evidence                                                                                                                 |
| ------------------------------------------ | ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| CI jobs' commands on final commit, locally | PASS                   | See [repository-audit.md](repository-audit.md)                                                                           |
| CI workflow on GitHub                      | NOT RUN                | Runs once the branch is pushed and the PR into `dev` is open                                                             |
| Merge protections for `dev` and `main`     | NOT CONFIGURED         | No rulesets; `main` reports `protected: false`; `dev` did not exist                                                      |
| README CI badges                           | NOT RUN                | Left as a comment in the README until the workflow has run on both branches                                              |
| Preview/staging isolation                  | NOT RUN                | Preview bindings are not visible from the repository                                                                     |
| Production deploy trigger and approval     | Documented, not tested | Merging `main` deploys; branch protection not configured yet                                                             |
| Released commit identity                   | NOT RUN                | No release made                                                                                                          |
| Release smoke tests and monitoring         | NOT RUN                | `pnpm test:smoke` exists; not run against a deployed URL (the cloud environment cannot reach pages.dev or burke.systems) |
| Rollback                                   | NOT RUN                | Not rehearsed                                                                                                            |
