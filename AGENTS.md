# burke-systems-website

Marketing site for Burke Systems (burke.systems). Astro, static output, with Tailwind CSS v4 and shadcn/ui.

## Rules

- Do not read or traverse `node_modules/`, `dist/`, or `.git/`.
- Prefer the simplest change that works. Follow the existing patterns.
- Pages and sections are `.astro` files and ship no JavaScript. Use a React island (`client:*`) only when a section truly needs interactivity.
- Copy follows the brand voice: plain, direct, practical. No buzzwords.

## Layout

- `src/pages/`: routes (`index.astro`, `404.astro`).
- `src/components/sections/`: homepage sections, in page order.
- `src/components/brand/`: the logo. `mark-path.ts` holds the final mark; never edit its geometry.
- `src/components/ui/`: shadcn/ui components. Treat them as vendored source.
- `src/styles/globals.css`: brand palette and the shadcn theme variables mapped onto it.
- `src/site.ts`: name, contact details, and nav links. Placeholders are in `[brackets]`.
- `functions/`: Cloudflare Pages Functions. `functions/api/intake.ts` stores contact form submissions in the D1 database bound as `DB` and emails an alert through Resend when the `RESEND_API_KEY` and `INTAKE_NOTIFY_TO` secrets are set. Keep the owner's address in that secret, never in the repo. Don't put tests in `functions/`; every file there becomes a route.
- `migrations/`: D1 schema. Apply new files with `wrangler d1 execute <database> --remote --file <file>`.

## shadcn/ui

- Add components with `pnpm dlx shadcn@latest add <name>`. `components.json` points at `src/styles/globals.css` and the `@/` alias.
- In `.astro` files, `asChild` does not work, because Astro passes children as static HTML. Style a link as a button with `class={cn(buttonVariants({ size: "lg" }), "extra classes")}`.
- Brand colors are Tailwind utilities: `bg-night`, `text-cloud`, `bg-paper`, `bg-mist`, `text-periwinkle`, `bg-burke-blue`. `src/lib/utils.ts` registers them with tailwind-merge; add new color names there too.

## Commands

- Use the package manager that the lockfile names (pnpm). Node 26 is required.
- `pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`.
- Run `docker compose up --watch` to start the project in a container.

## Skills

The skills for this project are in `.agents/skills/`. Load a skill before work in its area.

- UI and design work: load the `burke-brand` skill.
- Astro work: load the `astro` skill.
- Accessibility: load the `web-accessibility` skill.
