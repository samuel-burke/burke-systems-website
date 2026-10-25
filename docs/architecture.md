# Architecture

Written from the code on 2026-10-25. Items marked **unverified** depend on Cloudflare dashboard settings that cannot be seen from the repository.

## System context

- **Product:** the marketing site for Burke Systems, a custom software service for small and mid-size businesses in the Raleigh-Durham area.
- **Users:** prospective clients (anonymous visitors) and the owner, who reads incoming requests.
- **Critical journey:** a visitor reads the offer and sends a project request through the contact form; the owner gets an alert and replies by email.
- **External services:** Cloudflare Pages (hosting, builds, Functions), Cloudflare D1 (request storage), Resend (email alerts, optional), ntfy (push alerts, optional).

## Components and boundaries

| Component                                              | Role                                                                                                                                              | Trust / data boundary                                                                                                | Failure behavior                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Static pages (`src/pages`, built to `dist/`)           | Everything the visitor reads. No accounts, no cookies; `sessionStorage` key `bs-carve` only remembers that the logo animation played.             | Public. No personal data.                                                                                            | Served from Cloudflare's edge; nothing dynamic to fail.                                                                                                                                                                                                                                         |
| Contact form (`src/components/sections/Contact.astro`) | Plain HTML `POST` to `/api/intake`, with a hidden honeypot field. Browser checks required fields and lengths.                                     | Untrusted input from the internet. Browser checks are a convenience only.                                            | Without JavaScript it still works (no JS involved).                                                                                                                                                                                                                                             |
| `functions/_middleware.ts`                             | 301 from `burke-systems-website.pages.dev` to `burke.systems`. Runs on every request.                                                             | Reads only the request URL.                                                                                          | Other hosts pass through untouched.                                                                                                                                                                                                                                                             |
| `functions/api/intake.ts`                              | Parses the form with `src/lib/intake.ts` (trim, length caps, email shape, honeypot), inserts a row with a parameterized query, then sends alerts. | **The trust boundary.** All validation that matters happens here. Secrets are read from Pages environment variables. | Bad or non-form input: 303 to `/contact-error`. Honeypot: 303 to `/thanks`, nothing stored. Missing `DB` binding or insert failure: logged, 303 to `/contact-error`. Alert failures: logged; the visitor still sees `/thanks` because the request is already stored. Alerts run in `waitUntil`. |
| D1 database, binding `DB`                              | Table `intake` (`migrations/0001_intake.sql`): name, email, business, message, status, created_at.                                                | Holds personal data. Readable only through the Cloudflare dashboard/API by the account owner.                        | If unavailable, the visitor is told the message didn't send.                                                                                                                                                                                                                                    |
| Resend                                                 | Emails the owner a plain-text summary, `reply_to` set to the visitor. Needs `RESEND_API_KEY` and `INTAKE_NOTIFY_TO`.                              | Personal data leaves Cloudflare to Resend.                                                                           | Best effort; failures only logged.                                                                                                                                                                                                                                                              |
| ntfy                                                   | Push notification with the same summary. Needs `NTFY_TOPIC_URL` (and `NTFY_TOKEN` for a protected topic).                                         | Personal data goes to the ntfy server. A public ntfy.sh topic is readable by anyone who knows its name.              | Best effort; failures only logged.                                                                                                                                                                                                                                                              |

## Data flow

1. Browser `POST /api/intake` (form-encoded).
2. Middleware passes it through (the host is not the pages.dev production host).
3. `onRequestPost` parses and validates; rejects or stores one row.
4. Alerts are queued with `waitUntil`; the visitor is redirected (303) to `/thanks`.

There is no authentication or authorization anywhere: the only write path is the public form, and there is no read path on the site. Reading requests happens in the Cloudflare D1 console.

## Operational design

- **Environments:** Cloudflare Pages Production (from `main`) and Preview (every other branch, including `dev`). See [ci-cd.md](ci-cd.md).
- **Bindings and secrets:** set per environment in the Pages project. Whether Preview uses a separate D1 database and separate alert settings is **unverified**.
- **Migrations:** applied by hand with `wrangler d1 execute <database> --remote --file <file>`, with owner approval. No migration tracking table yet.
- **Backups:** D1 Time Travel (point-in-time restore) is a Cloudflare feature; its retention for this database is **unverified**. Restore has not been rehearsed.
- **Monitoring:** Cloudflare Pages deployment status and Functions logs (`console.error` lines prefixed `intake:`). No alerting on errors.

## Known risks

- No rate limiting on `/api/intake` beyond the honeypot. A Cloudflare WAF rate-limiting rule is the simplest fix (dashboard setting).
- No security headers (`public/_headers` does not exist): no CSP, `X-Content-Type-Options`, `Referrer-Policy` or frame protection.
- No privacy notice although the form collects personal data ([data-inventory.md](data-inventory.md)).

## Decisions

- [ADR 0001: Cloudflare Pages for hosting and deployment](adr/0001-cloudflare-pages.md)
- [ADR 0002: Test layers and tools](adr/0002-test-layers.md)
