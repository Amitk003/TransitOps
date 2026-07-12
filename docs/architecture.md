# Architecture

This document explains how TransitOps is built. It is meant for developers who want to understand the code structure.

## Overall Design

TransitOps uses Next.js 14 with the App Router. The frontend and backend are in the same project. There is no separate API server. The app talks directly to Supabase from the browser using the Supabase JavaScript client.

All database queries go through service files in `lib/services/`. Components do not make database calls directly. This keeps the code clean and makes it easy to change how data is fetched.

## Folder Layout

```
app/            Pages and routes
components/     Reusable UI parts
lib/            Shared code (services, auth, utils)
hooks/          Custom React hooks
types/          TypeScript type definitions
supabase/       Database migrations
```

## How Data Flows

1. A page component loads and calls a service function (like `getVehicles()`)
2. The service function creates a Supabase client and runs a query
3. The data comes back and the component renders it

Example:

```
Page -> service function -> Supabase query -> database -> response -> render
```

For the dashboard, the data also uses Supabase Realtime. When the database changes, the dashboard updates automatically without refreshing the page.

## Authentication Flow

1. User logs in with email and password at `/login`
2. Supabase returns a session token stored in cookies
3. Middleware checks the session on every request. If there is no session, it redirects to `/login`
4. The browser-side auth context keeps track of the user and their role
5. The sidebar only shows items the user is allowed to see
6. RouteGuard checks the role before showing a page

## Role System

There are four roles:

- fleet_manager: full access
- driver: trips and fuel only
- safety_officer: vehicles, drivers, maintenance
- financial_analyst: read-only access to reports

Permissions are defined in `lib/auth/roles.ts`. Each route has a required permission. If the user does not have that permission, they cannot access that page.

## Database Triggers

The database has triggers that update vehicle and driver status automatically:

- When a trip is dispatched, the vehicle and driver status changes to "on_trip"
- When a trip is completed or cancelled, the vehicle and driver status changes back to "available"

This logic lives in the database so it cannot be bypassed by the application.

## Key Libraries

| Library | What it does |
|---|---|
| Next.js 14 | Framework for the whole app |
| Tailwind CSS | Styles the pages |
| Supabase | Authentication and database |
| React Leaflet | Shows the fleet map |
| Recharts | Draws charts on the dashboard and reports |
| Tesseract.js | Reads text from receipt photos |
| Sonner | Shows toast notifications |
