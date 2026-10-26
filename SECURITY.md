# Security Policy

> **DRAFT. Owner action required before this repository is made public:** there is no confirmed private reporting channel yet. Enable GitHub private vulnerability reporting (Settings > Security > Private vulnerability reporting) or name a monitored address, then replace the "Reporting" section below and remove this banner.

## Supported versions

Only the site currently deployed from `main` at burke.systems is supported. There are no versioned releases to maintain.

## Reporting a vulnerability

**Please do not report vulnerabilities in a public issue, PR or discussion.**

Private reporting channel: **not configured yet** (see the banner above).

Include what is affected (a URL or file), steps to reproduce, and the impact. Do not include real personal data or secrets; use made-up values.

## Handling reports

The owner reviews reports personally. No response time or fix deadline is promised. Fixes ship through the normal release process, or as an approved hotfix when urgent (see [AGENTS.md](AGENTS.md) Section 3).

## Scope

In scope: the burke.systems site, its Cloudflare Pages preview deployments, the Pages Functions in `functions/`, and this repository's CI configuration.

Out of scope: Cloudflare, Resend and ntfy themselves (report to those vendors), and denial-of-service or volume testing against the live site.
