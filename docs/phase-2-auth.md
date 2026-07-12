# Phase 2 - Authentication and Role Based Access

## How it works

### 1. User Login
- Users sign in with email and password at `/login`
- After login, they go to the dashboard page
- If already logged in and you visit `/login`, it sends you to dashboard
- If not logged in and you try to visit any page, middleware redirects to `/login`

### 2. User Roles

| Role | Permissions |
|------|-------------|
| fleet_manager | Full access to everything |
| driver | View/manage trips, add fuel expenses |
| safety_officer | View vehicles/drivers, manage maintenance |
| financial_analyst | View reports, expenses, fuel data (read only) |

### 3. Sidebar
Sidebar items are filtered by role. Unauthorized routes are hidden.

### 4. Route Protection
- **Middleware** (server): Checks authenticated session, redirects to `/login`
- **RouteGuard** (client): Verifies role permission for current route

## Key Files

| File | Purpose |
|---|---|
| `lib/auth/auth-context.tsx` | Auth state management (user, session, login, logout) |
| `lib/auth/roles.ts` | Role-to-permission mapping, route access check |
| `app/(auth)/login/page.tsx` | Login form |
| `middleware.ts` | Session-based route protection |
| `components/layout/route-guard.tsx` | Client-side role check |
