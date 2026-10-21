# burke.systems

The Burke Systems marketing site. Built with [Astro](https://astro.build), [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com), scaffolded with [agent-scaffold](https://github.com/freeCodeCamp/agent-scaffold).

## Run it

Node 26 and pnpm are required.

```sh
pnpm install
pnpm dev        # http://localhost:4321
pnpm build      # static site in dist/
```

Or in Docker: `docker compose up --watch`.

## Add a shadcn component

```sh
pnpm dlx shadcn@latest add dialog
```

Components land in `src/components/ui/` and pick up the brand colors from `src/styles/globals.css`.

## Before launch

Placeholders are marked with `[brackets]` and `TODO` comments:

- Contact email and phone in `src/site.ts`.
- Headshot in `src/components/sections/About.astro`.
- Project screenshots in `src/components/sections/Work.astro`.
