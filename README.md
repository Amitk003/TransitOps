# TransitOps — Phase 1: Project Foundation

Production-ready Next.js + TypeScript foundation for the TransitOps fleet
operations platform, built ahead of feature work (Phases 2–11).

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with a semantic HSL design-token system (light/dark)
- **ESLint + Prettier** (incl. `prettier-plugin-tailwindcss` for class sorting)
- **Supabase** browser + server clients (`@supabase/ssr`)
- **next-themes** for dark mode

## Folder architecture

```
app/            # routes, layouts, pages (App Router)
components/
  ui/           # reusable primitives: Button, Card, Table, Input, Dialog, Badge
  layout/       # Sidebar, Navbar, AppShell
lib/
  supabase/     # browser + server Supabase clients
  utils.ts      # cn(), formatCurrency(), formatDate()
hooks/          # shared React hooks (Phase 2+)
services/       # Supabase data-access layer, one file per domain (Phase 3+)
types/          # shared domain types (Vehicle, Driver, Trip, ...)
utils/          # framework-agnostic helpers / business-rule checks
styles/         # anything beyond app/globals.css
```

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase project URL + anon key
npm run dev
```

Open http://localhost:3000 — you should see the dashboard shell with sidebar,
navbar, dark-mode toggle, and placeholder KPI cards/table.

## Conventions for the team

- Import shared UI from `@/components/ui/*` — don't re-style raw `<button>`/`<table>` elements.
- All colors are semantic Tailwind tokens (`bg-primary`, `text-muted-foreground`, etc.),
  not raw hex values — this is what makes dark mode work for free.
- Put Supabase queries in `services/`, not directly inside components.
- Run `npm run lint` and `npm run format` before committing.

## Commit plan for this phase

1. Initialize Next.js project with TypeScript
2. Configure Tailwind CSS and global styles
3. Setup ESLint Prettier and formatting rules
4. Create scalable folder architecture
5. Configure Supabase client
6. Create application layout navigation and sidebar
7. Create reusable UI component library
8. Setup theme provider and dark mode
