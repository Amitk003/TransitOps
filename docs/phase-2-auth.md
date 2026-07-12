# Phase 2 - Authentication and Role Based Access

## What we built

User login system with different access levels for different team members.

---

## How it works

### 1. User Login

- Users sign in with email and password at `/login`
- After login, they go to the dashboard page
- If already logged in and you visit `/login`, it sends you to dashboard
- If not logged in and you try to visit any page, it sends you to `/login`

### 2. User Roles

There are 4 types of users:

| Role | What they can do |
|------|------------------|
| Fleet Manager | Full access to everything |
| Driver | See and manage trips, add fuel expenses |
| Safety Officer | See vehicles and drivers, manage maintenance |
| Financial Analyst | View reports, expenses, fuel data (read only) |

### 3. Sidebar Changes

The sidebar menu changes based on your role. You only see pages you are allowed to visit.

### 4. Route Protection

Two layers of security:
- **Middleware** (server side): Checks if you are logged in. Blocks unauthenticated users.
- **RouteGuard** (client side): Checks if your role has permission for the page. Shows loading while checking.

---

## Files created or changed

### New files

| File | What it does |
|------|-------------|
| `supabase/migrations/001_create_user_profiles.sql` | Database setup for user profiles with roles |
| `lib/services/auth.service.ts` | Functions for sign in, sign out, get user |
| `lib/auth/auth-context.tsx` | Manages login state across the app |
| `lib/auth/roles.ts` | Defines what each role can access |
| `app/(auth)/login/page.tsx` | Login page with email/password form |
| `app/(dashboard)/layout.tsx` | Dashboard layout with sidebar and navbar |
| `app/(dashboard)/page.tsx` | Main dashboard page |
| `components/layout/route-guard.tsx` | Blocks users from pages they cannot access |
| `middleware.ts` | Redirects unauthenticated users to login |

### Changed files

| File | What changed |
|------|-------------|
| `app/layout.tsx` | Added AuthProvider, removed AppShell |
| `types/index.ts` | Updated AppUser fields to match database |
| `components/layout/navbar.tsx` | Shows logged-in user name, role, sign out button |
| `components/layout/sidebar.tsx` | Filters menu items based on user role |
| `lib/supabase/server.ts` | Fixed TypeScript type for cookies |

---

## Database setup (already done)

Run the SQL file `supabase/migrations/001_create_user_profiles.sql` in Supabase SQL Editor.

This creates:
- A `user_role` enum type (fleet_manager, driver, safety_officer, financial_analyst)
- A `user_profiles` table linked to Supabase auth
- A trigger that auto-creates a profile when a new user signs up

---

## How to create test users

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User"
3. Enter email and password
4. After creating, go to Table Editor > user_profiles
5. Set the `role` field for the new user

Or use Supabase SQL Editor to insert directly:

```sql
INSERT INTO auth.users (email, password_hash) VALUES ('test@example.com', '...');
-- Then update the role in user_profiles
UPDATE user_profiles SET role = 'fleet_manager' WHERE email = 'test@example.com';
```

---

## Commit history for Phase 2

1. Configure Supabase authentication
2. Implement login page
3. Implement logout functionality
4. Create protected route middleware
5. Create user profile model with permissions
6. Implement role-based navigation
7. Restrict frontend routes based on role
8. Fix type errors and build configuration
