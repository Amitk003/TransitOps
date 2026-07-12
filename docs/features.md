# Features

This document explains every feature in TransitOps.

---

## Dashboard

The dashboard is the first page you see after logging in. It shows:

- 7 KPI cards: active trips, pending trips, active vehicles, available vehicles, vehicles in maintenance, active drivers, fleet utilization percentage
- 4 charts: fleet utilization by type, expense breakdown, maintenance cost trend, trip statistics
- A "Live" badge that turns red if there is a connection problem

The dashboard auto-refreshes. When someone adds a trip or updates a vehicle, the dashboard updates without you doing anything.

## Live Fleet Tracking

The fleet tracking page shows an interactive map with:

- Vehicle markers (blue dots) at their current GPS coordinates
- Trip routes drawn as lines between source and destination
- Popups with vehicle name, registration number, status
- Popups with trip details: source, destination, driver name
- A sidebar with counts for active vehicles, available vehicles, and active trips

This page also auto-refreshes when data changes.

## Voice Dispatch

The voice dispatch page lets you create trips by speaking.

How to use it:

1. Go to the Voice Dispatch page
2. Click the microphone button
3. Say something like "Dispatch Ahmed in truck 42 from the main warehouse to depot 5"
4. The system records your speech and shows you the transcript
5. It tries to find the driver name and vehicle in the database
6. It extracts the source and destination from your sentence
7. A confirmation dialog shows what it understood
8. You click "Dispatch Trip" to create the trip

The system uses the Web Speech API, which only works in Chrome and Edge browsers.

## OCR Fuel Scanning

The OCR fuel scanning page lets you add fuel entries by taking a photo of a receipt.

How to use it:

1. Go to Fuel and Expenses > Fuel Logs tab
2. Click "Scan Receipt"
3. Click the upload area to select a photo from your computer or phone
4. The system uses Tesseract.js to read the text from the image
5. It tries to find the total amount, liters, date, and fuel station name
6. A confirmation form shows with the extracted information filled in
7. You select the vehicle and click "Save Fuel Entry"

You can also edit any of the extracted values before saving.

## Vehicle Management

The Vehicle Registry page lets you manage your fleet of vehicles.

Features:
- List all vehicles with registration number, name, type, load capacity, odometer, and status
- Search by registration number or vehicle name
- Filter by type (van, truck, bus, mini truck, pickup, other)
- Filter by status (available, on trip, in shop, retired)
- Add a new vehicle
- Edit an existing vehicle
- Delete a vehicle (with confirmation dialog)
- Pagination when you have many vehicles

## Driver Management

The Drivers page lets you manage your drivers.

Features:
- List all drivers with name, license number, category, expiry date, contact number, safety score, and status
- Search by name or license number
- Filter by status (available, on trip, off duty, suspended)
- Add a new driver
- Edit an existing driver
- Delete a driver (with confirmation dialog)
- Changes driver status inline

## Trip Management

The Trips page lets you manage trips from start to finish.

Features:
- List all trips with source, destination, vehicle, driver, cargo weight, planned distance, and status
- Search by source or destination name
- Filter by status (draft, dispatched, completed, cancelled)
- Create a new trip with validation:
  - Checks that the selected vehicle is available
  - Checks that the cargo weight does not exceed vehicle capacity
  - Checks that the selected driver is available
- Dispatch a draft trip
- Complete a dispatched trip
- Cancel a dispatched or draft trip
- View trip details
- Delete a trip
- Pagination

When a trip is dispatched, the database automatically changes the vehicle and driver status to "on_trip". When a trip is completed or cancelled, it changes them back to "available".

## Maintenance Management

The Maintenance page lets you track vehicle maintenance.

Features:
- List all maintenance records with vehicle, type, description, date, cost, and status
- Search by maintenance type or description
- Filter by type (engine, transmission, brakes, tires, electrical, body, inspection, other)
- Filter by status (open, closed)
- Add a new maintenance record
- Edit an existing record
- Close or reopen a record
- Delete a record
- Pagination

## Fuel and Expenses

The Fuel and Expenses page has two tabs.

### Fuel Logs Tab

- List all fuel entries with vehicle, date, liters, cost, odometer reading, and fuel station
- Search by station name or remarks
- Add a new fuel entry manually
- Scan a receipt using the OCR feature
- Edit a fuel entry
- Delete a fuel entry
- Pagination

### Other Expenses Tab

- List all non-fuel expenses with vehicle, type, amount, date, and notes
- Search by expense type or notes
- Filter by expense type (toll, parking, other)
- Add a new expense
- Edit an expense
- Delete an expense
- Pagination

## Reports and Analytics

The Reports page shows detailed analytics for a date range you choose.

Features:
- Pick a start date and end date, click Apply
- 8 KPI cards: total trips, completed, cancelled, total distance, fuel cost, maintenance cost, other cost, total cost
- Trip trends line chart (completed, in progress, cancelled by day)
- Cost breakdown bar chart (fuel vs maintenance vs other)
- Vehicle cost analysis table (each vehicle with fuel cost, maintenance cost, total cost, sorted highest first)
- Driver performance table (each driver with trip count and total distance, sorted by trip count)

## Role-Based Access

Different users see different parts of the app based on their role.

| Role | What they can see and do |
|---|---|
| Fleet Manager | Everything. Full access to all pages. |
| Driver | Trips (view and manage), Fuel and Expenses (add fuel). |
| Safety Officer | Vehicles (view), Drivers (view and manage), Maintenance (view and manage). |
| Financial Analyst | Vehicles (view), Drivers (view), Maintenance (view), Fuel and Expenses (view), Reports (view). Read-only. |

The sidebar only shows links the user is allowed to access. If a user tries to visit a page they do not have permission for, the RouteGuard component blocks them.

## Database Intelligence

The database has built-in logic that runs automatically:

- When a trip status changes to "dispatched", the vehicle and driver are set to "on_trip"
- When a trip status changes to "completed" or "cancelled", the vehicle and driver are set to "available"
- Three views provide pre-aggregated data:
  - vw_fleet_stats: vehicle counts by type and status
  - vw_trip_analytics: monthly trip summaries
  - vw_cost_analytics: monthly cost totals by category
