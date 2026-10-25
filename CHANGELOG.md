# Changelog

Notable changes to the burke.systems site. Entries describe what was actually merged. Versions and dates are added only when a release PR from `dev` into `main` is merged.

## [Unreleased]

### Added

- Engineering workflow from the AI Engineering Starter Kit: `AGENTS.md` policy with project-specific context, `CONTRIBUTING.md`, PR and issue templates, architecture, CI/CD and data-inventory docs, ADRs, and a kickoff audit.
- GitHub Actions CI on PRs and pushes to `dev` and `main`: format, lint, type check, unit tests with coverage thresholds, build, integration and E2E tests, and a dependency audit.
- Branch-flow check: PRs into `main` must come from `dev` (or an approved `hotfix/*`), and PRs into `dev` from a task branch.
- Integration tests for the contact form endpoint against a local D1 database in Wrangler, and Playwright E2E tests (desktop and mobile) with axe accessibility checks.
- Dependabot configuration for npm and GitHub Actions, targeting `dev`.

### Fixed

- The contact form endpoint returned a server error when a request body wasn't form data. It now sends the visitor to the error page.
- The header logo link's accessible name now contains its visible text, "BURKE SYSTEMS" (WCAG 2.5.3).

### Security

- Pinned `undici` to a patched version for the test tooling (Wrangler), clearing a high-severity advisory in a development dependency.
