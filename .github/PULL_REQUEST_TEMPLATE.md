## Purpose / issue

<!-- Why does this change exist? Link an issue if available. -->

## Summary of changes

<!-- User-visible behavior and key implementation changes. Keep scope clear. -->

## Type

- [ ] Task PR (`feature/`, `bugfix/`, `chore/`, `docs/`, `test/`, `refactor/`, `site/`, `claude/`) -> `dev`
- [ ] Release PR: `dev` -> `main` (**merging deploys to production**)
- [ ] Approved emergency hotfix: `hotfix/*` -> `main` (label `emergency-hotfix`)

## Acceptance criteria

- [ ] Requirements achieved (evidence below)

## Verification (MANDATORY; run against final changes)

<!-- Do not claim the change is complete or working without observed evidence. See AGENTS.md Section 12. -->

**Implementation verification status (choose one):**

- [ ] VERIFIED — all applicable required checks and acceptance criteria passed
- [ ] PARTIALLY VERIFIED — some passed, others NOT RUN/inconclusive (not complete)
- [ ] UNVERIFIED — no meaningful runtime verification (not complete)
- [ ] BLOCKED — required checks or acceptance criteria failed (not complete)

### Acceptance criteria and observed evidence

| Criterion | Actual verification performed | Result and evidence |
| --------- | ----------------------------- | ------------------- |
|           |                               |                     |

### Checks actually executed

<!-- Exact command and result on the final revision: PASS / FAIL / NOT RUN / N/A. Never invent output or coverage. -->

| Check                                 | Exact command / browser / CI run                    | Result | Evidence / limitation |
| ------------------------------------- | --------------------------------------------------- | ------ | --------------------- |
| Format / lint / typecheck             | `pnpm format:check && pnpm lint && pnpm typecheck`  |        |                       |
| Unit tests + coverage                 | `pnpm test:coverage`                                |        |                       |
| Build                                 | `pnpm build`                                        |        |                       |
| Integration tests                     | `pnpm test:integration`                             |        |                       |
| E2E tests (incl. axe)                 | `pnpm test:e2e`                                     |        |                       |
| Dependency audit                      | `pnpm audit --audit-level high`                     |        |                       |
| GitHub Actions CI (commit SHA)        |                                                     |        |                       |
| Cloudflare Pages preview + smoke      | `PLAYWRIGHT_BASE_URL=<preview URL> pnpm test:smoke` |        |                       |
| Real browser / manual / accessibility |                                                     |        |                       |

- **Last code change vs. last test run:**
- **Bug reproduction / regression proof (if bugfix):**
- **NOT RUN checks + next action:**

## Risk and compatibility

- Security / privacy (contact form data, secrets, new vendors):
- Database / API changes (`migrations/`, `/api/intake`):
- Performance / operational risks:
- Configuration / Pages secrets or bindings needed:
- Screenshots (if UI changes):

## Documentation

- [ ] README / architecture / CI-CD docs updated if needed
- [ ] `CHANGELOG.md` updated under Unreleased
- [ ] Reviewed whether `SECURITY.md`, `docs/data-inventory.md`, `ACCESSIBILITY.md` or `CONTRIBUTING.md` need changes
- [ ] No secrets, personal data, private business details, or unrelated changes

## Release details (REQUIRED for `dev` -> `main`; delete for task PRs)

- **Version / tag:**
- **Changelog for this release:**
- **Included task PRs:**
- **Breaking changes and migrations (D1 migrations to apply, in order):**
- **Staging evidence (`dev.burke-systems-website.pages.dev` smoke run and manual check):**
- **CI result for the release commit:**
- **Production deploy:** merging deploys `main` to burke.systems through Cloudflare Pages. Owner approval:
- **Post-deploy smoke:** `PLAYWRIGHT_BASE_URL=https://burke.systems pnpm test:smoke`
- **Monitoring plan:**
- **Rollback plan:** Cloudflare Pages > Deployments > previous production deployment > Rollback, then a revert PR
- **Known issues:**

## Review / approvals

- [ ] Diff self-reviewed
- [ ] All required checks green on the final revision
- [ ] Owner approval obtained before merge
- [ ] No merge or deployment performed without authorization
