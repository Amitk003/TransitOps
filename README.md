# TransitOps

A complete transport operations platform for managing your fleet. Track vehicles, drivers, trips, maintenance, fuel, and expenses all in one place.

## What TransitOps does

TransitOps helps transport companies run their daily operations more smoothly. Instead of using spreadsheets or paper logs, you get a unified system where you can:

- See the live status of your entire fleet on a map
- Track every trip from dispatch to completion
- Manage vehicle maintenance schedules
- Log fuel purchases and other expenses
- View reports and analytics to understand costs
- Use voice commands to create trips hands-free
- Scan fuel receipts with your phone camera

The system works on desktop and mobile, so you can use it in the office or on the go.

## Quick Start

```
git clone <repo-url>
cd TransitOps
npm install
cp .env.example .env.local
```

Fill in your Supabase project URL and anon key in .env.local, then:

```
npm run dev
```

Open http://localhost:3000

## Test Accounts

These accounts are already set up in the database:

| Email | Password | Role |
|---|---|---|
| manager@transitops.com | Test123! | Fleet Manager (full access) |
| driver@transitops.com | Test123! | Driver (trips and fuel) |
| safety@transitops.com | Test123! | Safety Officer (vehicles, drivers, maintenance) |
| finance@transitops.com | Test123! | Financial Analyst (read-only reports) |

## Features at a Glance

**Dashboard** -- Live KPIs and charts showing fleet utilization, trip stats, expense breakdown, and maintenance costs. Auto-refreshes with realtime data.

**Live Fleet Tracking** -- Interactive map showing vehicle locations and active trip routes. Updates in real time as vehicles move.

**Voice Dispatch** -- Click the mic button and say something like "Dispatch Ahmed in truck 42 from the main warehouse to depot 5." The system understands the command and creates the trip automatically.

**OCR Fuel Scanning** -- Take a photo of a fuel receipt. The system reads the text, pulls out the amount, liters, and date, and fills in the fuel log form for you.

**Vehicle Management** -- Add, edit, and search vehicles. Filter by type or status. See vehicle utilization reports.

**Driver Management** -- Manage driver records, license information, and safety scores. Filter by availability status.

**Trip Management** -- Create trips, track them through draft, dispatched, completed, and cancelled stages. The system validates that vehicles and drivers are available before dispatching.

**Maintenance Management** -- Log maintenance work, track costs, and switch records between open and closed status.

**Fuel and Expenses** -- Separate tabs for fuel logs and other expenses. Each with search, filter, and pagination.

**Reports and Analytics** -- Date-range filtered reports with KPI summaries, trip trend charts, cost breakdowns, vehicle cost analysis, and driver performance tables.

**Role-Based Access** -- Four roles with different permissions. Fleet managers see everything. Drivers only see their trips and fuel. The sidebar adjusts automatically based on your role.

## Tech Stack

- Next.js 14 (App Router) with TypeScript
- Tailwind CSS with dark theme
- Supabase for authentication and database
- PostgreSQL with Row Level Security
- React Leaflet for maps
- Recharts for charts
- Web Speech API for voice commands
- Tesseract.js for receipt OCR
- Sonner for toast notifications

## Database

All database migrations are in the `supabase/migrations/` folder. Each migration is idempotent (safe to run multiple times).

To apply migrations:

```
supabase link --project-ref <your-project-ref>
supabase db push
```

For the live dashboard to auto-refresh, go to Supabase Dashboard > Database > Replication and enable replication for vehicles, drivers, trips, maintenance_logs, fuel_logs, and expenses.

## Project Structure

```
app/
  (auth)/login/       Login page
  (dashboard)/        Main app pages (dashboard, fleet, dispatch, vehicles, drivers, trips, maintenance, fuel-expenses, reports)
components/
  ui/                 Reusable UI components (Button, Card, Table, Input, Dialog, Badge, Skeleton, ErrorBoundary, EmptyState)
  layout/             Sidebar, Navbar, AppShell, RouteGuard, NavItems, MobileSidebar
  dashboard/          Dashboard KPI cards and charts
  fleet/              Fleet map component
  voice/              Voice dispatch component
  fuel/               Fuel forms (manual and OCR)
  maintenance/        Maintenance form
  expenses/           Expense form
lib/
  supabase/           Supabase client setup
  auth/               Auth context, role-based access control
  services/           Data access layer (one service per entity)
  utils.ts            Helper functions
hooks/                Custom React hooks
types/                TypeScript type definitions
supabase/migrations/  Database migrations (017 total)
```

## Performance

- All pages use client-side data fetching with proper loading states
- Tables support search, filter, and pagination
- Static pages are pre-rendered where possible
- Bundle size is optimized with dynamic imports for heavy libraries (Leaflet, Tesseract)

## Support

For issues or feature requests, please open an issue on the repository.
