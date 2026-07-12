# Phase 6 — Dashboard & Analytics

## Files in this package

```
services/
  vehicles.service.ts       (updated — adds getFleetUtilizationByType)
  drivers.service.ts
  trips.service.ts          (adds getTripStatsByDay)
  maintenance.service.ts    (adds getMaintenanceCostByMonth)
  fuel.service.ts
  expenses.service.ts       (adds getExpenseBreakdown)
  dashboard.service.ts      (new — aggregates the KPI row)
hooks/
  use-dashboard-data.ts     (new — fetch + realtime subscription for the whole dashboard)
components/dashboard/
  kpi-cards.tsx
  fleet-utilization-chart.tsx
  expense-chart.tsx
  maintenance-chart.tsx
  trip-stats-chart.tsx
app/
  page.tsx                  (replaces the Phase 1 placeholder dashboard)
```

## Before you copy these in

1. **`git pull origin main` first** — get your teammates' Phase 3/4/5 work.
2. Check whether `services/vehicles.service.ts`, `trips.service.ts`, etc. already
   exist with different content (from Phase 3/4/5 work). If so, don't blindly
   overwrite — merge the new functions in (`getFleetUtilizationByType`,
   `getTripStatsByDay`, etc.) alongside whatever's already there.
3. **Table/column name assumption**: this code assumes snake_case tables
   matching the PRD — `vehicles`, `drivers`, `trips`, `maintenance_logs`,
   `fuel_logs`, `expenses` — with columns like `registration_number`,
   `max_load_capacity_kg`, `cargo_weight_kg`, etc. (see `types/index.ts` from
   Phase 1 for the exact field list). **If your teammate's actual schema uses
   different names, tell me and I'll adjust every query.**

## New dependency

```bash
npm install recharts
```

## Supabase Realtime — one-time setup (not code, a dashboard setting)

For the live updates to work, Realtime has to be turned on for these tables:

1. Go to your Supabase project → **Database → Replication**.
2. Enable replication for: `vehicles`, `drivers`, `trips`, `maintenance_logs`,
   `fuel_logs`, `expenses`.

Without this, the dashboard still loads fine, it just won't auto-refresh when
someone else dispatches a trip or logs fuel elsewhere — you'd need to reload.

## Commit plan for this phase

```
git add components/dashboard/kpi-cards.tsx app/page.tsx
git commit -m "Create KPI cards"

# (Active trips / available vehicles / active drivers all live inside kpi-cards.tsx
#  and dashboard.service.ts — commit the KPI plumbing here)
git add services/dashboard.service.ts services/trips.service.ts
git commit -m "Display active trips"

git add services/vehicles.service.ts
git commit -m "Display available vehicles"

git add services/drivers.service.ts
git commit -m "Display active drivers"

git add components/dashboard/fleet-utilization-chart.tsx package.json package-lock.json
git commit -m "Build fleet utilization charts"

git add components/dashboard/expense-chart.tsx services/expenses.service.ts services/fuel.service.ts
git commit -m "Build expense charts"

git add components/dashboard/maintenance-chart.tsx services/maintenance.service.ts
git commit -m "Build maintenance charts"

git add components/dashboard/trip-stats-chart.tsx
git commit -m "Build trip statistics"

git add hooks/use-dashboard-data.ts
git commit -m "Implement realtime dashboard updates"
```

Note: some files (like `dashboard.service.ts` or `trips.service.ts`) get
touched by more than one commit above since KPIs, trip counts, and trip
stats all live in the same file — that's normal, just re-`add` and commit
each time you touch it further.
