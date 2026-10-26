# ADR 0002: Test layers and tools

- Date: 2026-10-25
- Status: Proposed (in the PR that adds it; accepted when the owner merges it)
- Owners: Samuel Burke

## Context

The repository had 17 Vitest unit tests (form parsing, the intake function with a fake database, the redirect middleware, a class-name helper) and no integration, E2E, coverage or CI. The risky parts are the public form endpoint and its database write; the rest is static pages.

## Alternatives considered

- **Integration tests in Vitest with `@cloudflare/vitest-pool-workers`:** runs inside workerd, but needs a Worker-style config and does not exercise the Pages routing and static assets together.
- **Integration tests against Miniflare's API directly:** more code than calling the real `wrangler pages dev`.
- **Cypress for E2E:** Playwright handles browser and API-only tests in one runner, and its browsers come preinstalled in the cloud environment the agents use, so one tool covers integration and E2E.

## Decision

- **Unit:** Vitest, next to the code, with v8 coverage thresholds (90% lines/statements/functions, 85% branches) on `src/lib/**` and `functions/**`.
- **Integration:** Playwright's `request` API against `wrangler pages dev dist` with a throwaway local D1 database created from `migrations/`, and a local HTTP receiver standing in for ntfy. Covers storage, validation, honeypot, length caps, SQL/HTML input, malformed bodies, GET, alerts and the redirect middleware.
- **E2E:** Playwright with Chromium (desktop and Pixel 7) against the same server: homepage, 404, the contact form journey, empty-form blocking, and axe WCAG A/AA scans. Tests tagged `@readonly` can also run against a deployed URL.
- **Not applicable:** authorization and tenant-isolation tests (no accounts or tenants); contract tests for Resend (its request shape is covered by unit tests; a live call would send real email).

## Consequences

- `wrangler`, `@playwright/test` (pinned to 1.63.0, matching the browsers preinstalled in the cloud agent environment), `@axe-core/playwright` and `@vitest/coverage-v8` are new dev dependencies.
- Integration and E2E need a build first and take about a minute locally.
- `.astro` templates are not in unit coverage; the E2E suite covers them.
