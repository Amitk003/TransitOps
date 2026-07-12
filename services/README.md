# services/

API / data-access layer. Each domain gets one file that talks to Supabase
(e.g. `vehicles.service.ts`, `trips.service.ts`) so components never call
`supabase.from(...)` directly. Wired up starting Phase 3 (Database & Business Rules).
