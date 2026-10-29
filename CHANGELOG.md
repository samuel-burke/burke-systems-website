# Changelog

Notable changes to the burke.systems site. Entries describe what was actually merged. Each release gets its version and planned date on a branch into `dev`, before the release PR from `dev` into `main`; a release is shipped only once that PR is merged.

## [Unreleased]

### Added

- The Work section shows Study Squad, a group study timer for Root communities, with a link to its code on GitHub.

## [0.1.0] - 2026-10-26

First tracked release. Everything before it shipped straight to `main` and has no changelog entries.

### Added

- The Contact section shows the email address hello@burke.systems with a button that copies it.
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
