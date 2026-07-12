# Setup Guide

This guide walks you through setting up TransitOps on your computer.

## Requirements

- Node.js 18 or newer
- npm
- A Supabase account (free tier works)

## Step 1: Clone and Install

```
git clone <repository-url>
cd TransitOps
npm install
```

## Step 2: Set Up Environment Variables

Copy the example environment file:

```
cp .env.example .env.local
```

Open `.env.local` and fill in your Supabase details:

- `NEXT_PUBLIC_SUPABASE_URL` -- your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- your Supabase anon key

You can find these values in your Supabase dashboard under Project Settings > API.

## Step 3: Set Up the Database

TransitOps uses Supabase for the database. All table definitions and setup scripts are in the `supabase/migrations/` folder.

To apply the migrations to your Supabase project:

1. Install the Supabase CLI: https://supabase.com/docs/guides/cli
2. Link your project:

```
supabase link --project-ref <your-project-ref>
```

3. Push the migrations:

```
supabase db push
```

This creates all the tables, enums, indexes, and security policies.

## Step 4: Create Test Accounts

The migration scripts include seed data for vehicles, drivers, trips, and other records. But you need auth users to log in.

You can create users through the Supabase dashboard:

1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. After creating the user, insert a row into `user_profiles` with:

```
INSERT INTO user_profiles (id, email, full_name, role)
VALUES ('<the-user-uuid>', 'email@example.com', 'Full Name', 'fleet_manager');
```

Or use the pre-made seed accounts from the test accounts doc.

## Step 5: Run the App

```
npm run dev
```

Open http://localhost:3000 in your browser.

## Enabling Live Dashboard Updates

The dashboard auto-refreshes when data changes. To enable this:

1. Go to Supabase Dashboard > Database > Replication
2. Enable replication for these tables:
   - vehicles
   - drivers
   - trips
   - maintenance_logs
   - fuel_logs
   - expenses

Without this step, the dashboard still works but you need to refresh the page to see new data.

## Building for Production

```
npm run build
npm start
```

This creates an optimized production build.

## Common Issues

**"Supabase client error"** -- Make sure your .env.local file has the correct URL and anon key.

**"Table does not exist"** -- Run the migrations with `supabase db push`.

**Voice dispatch does not work** -- Use Chrome or Edge. Firefox does not support the Web Speech API.

**OCR does not work** -- Tesseract.js runs in the browser. It needs a good quality photo of a receipt to work well.
