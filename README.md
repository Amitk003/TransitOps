# TransitOps — Fleet Operations Platform

Smart transport operations platform with vehicle, driver, trip, maintenance, fuel, and expense management.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** with semantic HSL design tokens (dark theme)
- **Supabase** Auth + PostgreSQL
- **@supabase/ssr** for server/browser clients
- **next-themes** for dark mode
- **Recharts** for dashboard charts

## Project Structure

```
app/
  (auth)/login/     # Login page
  (dashboard)/      # Dashboard, Vehicles, Drivers, Trips
components/
  ui/               # Button, Card, Table, Input, Dialog, Badge
  layout/           # Sidebar, Navbar, AppShell, RouteGuard
  dashboard/        # KPI cards, charts (Phase 6)
lib/
  supabase/         # Browser + server Supabase clients
  auth/             # AuthContext, roles/permissions
  services/         # All data-access services
  utils.ts          # cn(), formatDate(), formatCurrency()
hooks/              # use-dashboard-data (Phase 6)
types/              # Domain types (snake_case matching DB)
supabase/
  migrations/       # 001-014: schema, enums, tables, RLS, grants
```

## Getting Started

```bash
npm install
cp .env.example .env.local   # Fill in Supabase project URL + anon key
npm run dev
```

Open http://localhost:3000

## Test Accounts

| Email | Password | Role |
|---|---|---|
| manager@transitops.com | Test123! | fleet_manager |
| driver@transitops.com | Test123! | driver |
| safety@transitops.com | Test123! | safety_officer |
| finance@transitops.com | Test123! | financial_analyst |

## Features Built

### Phase 1 — Foundation
Next.js project, Tailwind, ESLint/Prettier, folder architecture, Supabase clients, layout (sidebar + navbar), UI components (Button, Card, Table, Input, Dialog, Badge), dark mode.

### Phase 2 — Authentication
Supabase Auth with email/password, login page, protected middleware, session persistence, user_profiles table with role enum, role-based sidebar filtering, RouteGuard.

### Phase 3 — Database Schema
14 migrations covering: enums (vehicle_status, driver_status, trip_status, maintenance_status, expense_type, vehicle_type), tables (vehicles, drivers, trips, maintenance_logs, fuel_logs, expenses, user_profiles), foreign keys, indexes, seed data, RLS policies, role grants.

### Phase 4 — CRUD Pages
Vehicle and Driver management with create/edit/list/delete, search/filter/pagination, inline status changes, license expiry indicators.

### Phase 5 — Trips
Trip management with create/list/detail pages, status workflow (draft/ dispatched/ completed/ cancelled), vehicle/driver validation, action buttons.

### Phase 6 — Dashboard & Analytics
Live dashboard with 7 KPI cards and 4 charts (fleet utilization, expense breakdown, maintenance cost, trip stats). Realtime updates via Supabase subscriptions. All data fetched live from the database.

### UI Theme
Dark navy enterprise theme (#0B1220 bg, #111827 cards, #263042 borders, #94A3B8 secondary text, white headings). Sidebar with yellow accent logo, role-filtered navigation, active state (white bg + black text).

## Database

All migrations are in `supabase/migrations/` and are idempotent. Apply via:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

## Supabase Realtime (for live dashboard)

1. Go to **Supabase Dashboard → Database → Replication**
2. Enable replication for: `vehicles`, `drivers`, `trips`, `maintenance_logs`, `fuel_logs`, `expenses`
3. Without this, the dashboard still loads fine but won't auto-refresh

## Key Conventions

- Import shared UI from `@/components/ui/*`
- All colors use semantic Tailwind tokens, not raw hex
- Database queries go in `lib/services/`, not components
- Types use snake_case to match DB column names
- Run `npm run lint` before committing
