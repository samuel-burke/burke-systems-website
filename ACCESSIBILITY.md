# Accessibility

The goal is that every visitor can read the site and send a project request with a keyboard, a screen reader, zoom, or a phone. The target is WCAG 2.2 level AA. **No full conformance audit has been done**, so the site makes no conformance claim.

## Current verification

- **Automated checks:** axe-core (via `@axe-core/playwright` 4.14) with the WCAG 2.0, 2.1 and 2.2 A/AA rule tags runs on `/`, `/thanks` and `/contact-error` in Chromium, in `pnpm test:e2e` and in CI. First run on 2026-10-25 found one issue: the header logo link's accessible name ("Burke Systems home") did not contain its visible text, because the two words rendered as "BURKESYSTEMS" in the text content (SC 2.5.3). Fixed in the same change; all three pages now pass. Automated tools catch only part of WCAG.
- **Form:** E2E tests fill and send the contact form by its visible labels, and check that the browser blocks an empty form. Desktop Chrome and a Pixel 7 viewport.
- **Reflow:** an E2E test checks that the homepage has no horizontal scroll on desktop and the Pixel 7 viewport.
- **Keyboard navigation and focus order:** NOT RUN as a dedicated test.
- **Screen readers:** NOT RUN.
- **Contrast:** checked by axe on the pages above; not checked by hand.
- **Reduced motion:** NOT RUN as a test.

## Known barriers

None confirmed at the moment. The unchecked areas above may hide some.

## Report an accessibility barrier

A reporting channel is not set up yet. Until it is, use the contact form on burke.systems and say it is about accessibility. **Owner to confirm** a dedicated address (for example once hello@burke.systems receives mail) before this file is linked from the site.
