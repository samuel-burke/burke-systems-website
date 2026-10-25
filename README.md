# burke.systems

<!--
CI badges go here once .github/workflows/ci.yml has run on both branches and each
URL below has been opened and checked (AGENTS.md Section 17). Not added yet: the
workflow has not run on GitHub, and the dev branch does not exist yet.

[![CI · dev](https://github.com/samuel-burke/burke-systems-website/actions/workflows/ci.yml/badge.svg?branch=dev)](https://github.com/samuel-burke/burke-systems-website/actions/workflows/ci.yml?query=branch%3Adev)
[![CI · main](https://github.com/samuel-burke/burke-systems-website/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/samuel-burke/burke-systems-website/actions/workflows/ci.yml?query=branch%3Amain)

No coverage or deployment badge: no coverage service or deployment status provider is configured.
-->

The Burke Systems marketing site: what the business offers, plans and pricing, recent work, and a contact form that sends project requests to the owner. It is live as a pre-launch site that takes early-access requests.

Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com), scaffolded with [agent-scaffold](https://github.com/freeCodeCamp/agent-scaffold), and hosted on [Cloudflare Pages](https://pages.cloudflare.com).

## Features and scope

- One static homepage (services, process, guarantee, work, pricing, about, contact) plus thanks, contact-error and 404 pages. Pages ship no framework JavaScript, only a few small scripts (mobile menu, logo carve, busywork demo).
- Contact form posted to a Pages Function, `POST /api/intake`, which validates it, stores it in Cloudflare D1, and optionally alerts the owner by email (Resend) and push (ntfy).
- Middleware that 301-redirects the production `pages.dev` address to burke.systems.
- Known limits: no rate limiting on the form beyond a honeypot field; no privacy notice published yet. See [docs/repository-audit.md](docs/repository-audit.md).

## Technology

- Runtime: Node 26 (required, `engines` is strict), pnpm 10.34.1
- Framework: Astro 7 with React 19 islands, Tailwind CSS 4, shadcn/ui (in `src/components/ui/`)
- Server code: Cloudflare Pages Functions in `functions/`
- Database: Cloudflare D1 (SQLite), schema in `migrations/`
- Hosting and deployment: Cloudflare Pages Git integration ([docs/ci-cd.md](docs/ci-cd.md))

## Getting started

```sh
pnpm install
pnpm dev        # http://localhost:4321
```

`pnpm dev` serves the pages only. To run the contact form end to end on your machine, build and serve with Wrangler, which runs the Pages Functions on a local D1 database:

```sh
pnpm build
pnpm exec wrangler d1 execute intake-test --local --config tests/wrangler.jsonc --file migrations/0001_intake.sql --persist-to .wrangler/state
pnpm exec wrangler pages dev dist --d1 DB=intake-test --persist-to .wrangler/state
```

Alerts are off unless you set their variables. For local runs put them in a gitignored `.dev.vars` file; [.env.example](.env.example) lists the names. In Cloudflare they are Pages secrets.

Or in Docker: `docker compose up --watch` (dev server only).

## Validation and tests

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test:coverage      # unit tests with enforced coverage thresholds
pnpm build
pnpm exec playwright install chromium   # once
pnpm test:integration   # Pages Functions + local D1, over HTTP
pnpm test:e2e           # Chromium, desktop and mobile, including axe accessibility checks
pnpm audit --audit-level high
```

Integration and E2E tests need `pnpm build` first. They start the site in `wrangler pages dev` with a throwaway database in `.wrangler/test-state` and never contact Cloudflare. All of these commands were run on 2026-10-25; results are in [docs/repository-audit.md](docs/repository-audit.md).

## Architecture

Static HTML from Astro, served by Cloudflare Pages, with one form endpoint that writes to D1. Details, trust boundaries and failure modes: [docs/architecture.md](docs/architecture.md). Decisions: [docs/adr/](docs/adr/).

## Development and releases

Follow [AGENTS.md](AGENTS.md) and [CONTRIBUTING.md](CONTRIBUTING.md). Task branches open PRs into `dev`; releases are a reviewed PR from `dev` into `main` with a changelog. Nothing is merged or deployed without the owner's approval.

Deployment environments: every branch gets a Cloudflare Pages preview; `dev` is the staging preview at `dev.burke-systems-website.pages.dev`; `main` is production. **A merge into `main` deploys to production.** See [docs/ci-cd.md](docs/ci-cd.md).

## Add a shadcn component

```sh
pnpm dlx shadcn@latest add dialog
```

Components land in `src/components/ui/` and pick up the brand colors from `src/styles/globals.css`.

## Before launch

Placeholders are marked with `[brackets]` and `TODO` comments:

- Contact email and phone in `src/site.ts`.
- Set `site.earlyAccess` to `false` in `src/site.ts` once the business name is filed.
- A privacy notice for the contact form ([docs/data-inventory.md](docs/data-inventory.md)).

## Security, privacy and accessibility

- Security: [SECURITY.md](SECURITY.md) (draft; the private reporting channel is not set up yet).
- Privacy: no notice is published yet. The data the site collects is mapped in [docs/data-inventory.md](docs/data-inventory.md).
- Accessibility: [ACCESSIBILITY.md](ACCESSIBILITY.md).

## License

The `LICENSE` file is the BSD 3-Clause license that came with the agent-scaffold template (copyright freeCodeCamp). The owner has not yet decided how the Burke Systems code and content are licensed; until then, do not read that file as permission to reuse the site's own content or branding.
