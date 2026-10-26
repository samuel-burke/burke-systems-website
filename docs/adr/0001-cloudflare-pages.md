# ADR 0001: Cloudflare Pages for hosting and deployment

- Date: 2026-10-25 (records a choice made and set up by the owner on 2026-10-21)
- Status: Accepted
- Owners: Samuel Burke

## Context

The site is static HTML from Astro plus one form endpoint that must store submissions. It needs HTTPS on a custom domain (burke.systems), preview links for PRs, low or no cost, and little to operate. The owner connected the repository to Cloudflare Pages on 2026-10-21, and the form endpoint was then built on Pages Functions and D1.

## Alternatives considered

- **GitHub Actions deploying with `wrangler pages deploy`:** gives CI-gated deploys but needs a Cloudflare API token in GitHub secrets, and would compete with the existing Git integration unless that is switched off.
- **Other static hosts (Netlify, Vercel, GitHub Pages):** would mean rebuilding the form endpoint and storage for another platform. GitHub Pages has no server code at all.
- **A container on a VPS:** more to run and patch than this site needs.

## Decision

Keep Cloudflare Pages, with its **Git integration as the only deploy mechanism**. `main` is the production branch; every other branch, including `dev`, gets a preview deployment. GitHub Actions runs quality checks only and holds no Cloudflare credentials.

## Consequences

- Merging into `main` deploys to production immediately. Pages does not wait for GitHub checks, so the gate is GitHub branch protection on `main` (checks plus owner approval before merge).
- `dev` acts as staging at `dev.burke-systems-website.pages.dev`, using the Preview environment's bindings and secrets. Isolation depends on Preview having its own D1 database and alert settings.
- Rollback is a one-click redeploy of an earlier deployment in the Pages dashboard.
- Revisit if deploys need a hard CI gate (switch to Actions-driven `wrangler pages deploy` and turn off automatic Git deploys) or if the site outgrows Pages.
