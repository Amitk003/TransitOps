# API Services

TransitOps does not have a separate API server. All data access happens through service functions in the `lib/services/` folder. Each service file handles one part of the application.

## How Services Work

Every service function:

1. Creates a Supabase client
2. Runs a database query
3. Returns the data or throws an error

Services are called from page components. They run in the browser (client-side).

## List of Services

### vehicle.service.ts

Handles all vehicle operations.

| Function | What it does |
|---|---|
| getVehicles(filters) | Returns a paginated list with search, type filter, status filter |
| getVehicle(id) | Returns a single vehicle by ID |
| createVehicle(data) | Creates a new vehicle |
| updateVehicle(id, data) | Updates a vehicle |
| deleteVehicle(id) | Deletes a vehicle |
| getVehicleCountsByStatus() | Returns counts of vehicles in each status |
| getFleetUtilizationByType() | Returns utilization percentage by vehicle type |

### driver.service.ts

Handles all driver operations.

| Function | What it does |
|---|---|
| getDrivers(filters) | Returns a paginated list with search and status filter |
| getDriver(id) | Returns a single driver by ID |
| createDriver(data) | Creates a new driver |
| updateDriver(id, data) | Updates a driver |
| updateDriverStatus(id, status) | Changes a driver's status |
| deleteDriver(id) | Deletes a driver |
| getActiveDriversCount() | Returns count of available and on_trip drivers |

### trip.service.ts

Handles all trip operations.

| Function | What it does |
|---|---|
| getTrips(filters) | Returns a paginated list with search and status filter. Includes vehicle and driver names. |
| getTrip(id) | Returns a single trip with vehicle and driver details |
| validateTrip(data) | Checks that vehicle and driver are available and cargo fits |
| createTrip(data) | Creates a new trip with status "draft" |
| dispatchTrip(id) | Changes trip status to "dispatched" and sets start_time |
| completeTrip(id) | Changes trip status to "completed" and sets end_time |
| cancelTrip(id) | Changes trip status to "cancelled" |
| deleteTrip(id) | Deletes a trip |
| getTripCountsByStatus() | Returns counts of trips in each status |
| getTripStatsByDay(days) | Returns daily trip counts for the last N days |

### maintenance.service.ts

Handles all maintenance operations.

| Function | What it does |
|---|---|
| getMaintenanceLogs(filters) | Returns a paginated list with search, type filter, status filter |
| getMaintenanceLog(id) | Returns a single maintenance record by ID |
| createMaintenanceLog(data) | Creates a new maintenance record |
| updateMaintenanceLog(id, data) | Updates a maintenance record |
| deleteMaintenanceLog(id) | Deletes a maintenance record |
| getMaintenanceCostByMonth(months) | Returns monthly maintenance costs for the last N months |

### fuel.service.ts

Handles fuel log operations.

| Function | What it does |
|---|---|
| getFuelLogs(filters) | Returns a paginated list with search |
| getFuelLog(id) | Returns a single fuel log by ID |
| createFuelLog(data) | Creates a new fuel log |
| updateFuelLog(id, data) | Updates a fuel log |
| deleteFuelLog(id) | Deletes a fuel log |
| getFuelSpendTotal() | Returns total fuel cost across all records |

### expenses.service.ts

Handles expense operations.

| Function | What it does |
|---|---|
| getExpenses(filters) | Returns a paginated list with search and type filter |
| getExpense(id) | Returns a single expense by ID |
| createExpense(data) | Creates a new expense |
| updateExpense(id, data) | Updates an expense |
| deleteExpense(id) | Deletes an expense |
| getExpenseBreakdown() | Returns total cost by category (fuel, maintenance, toll, parking, other) |

### dashboard.service.ts

Handles dashboard data.

| Function | What it does |
|---|---|
| getDashboardKpis() | Returns counts for active vehicles, available vehicles, vehicles in maintenance, active trips, pending trips, active drivers, and fleet utilization percentage |

### fleet.service.ts

Handles fleet tracking data.

| Function | What it does |
|---|---|
| getFleetVehicles() | Returns all vehicles with coordinates for the map |
| getActiveTripRoutes() | Returns all dispatched trips with coordinates for route polylines |

### reports.service.ts

Handles report data with date range filtering.

| Function | What it does |
|---|---|
| getReportKpis(range) | Returns totals for trips, distance, and costs within a date range |
| getTripTrends(range) | Returns daily trip counts (completed, cancelled, dispatched) for each day in the range |
| getDriverStats(range) | Returns trip count and total distance per driver in the range |
| getVehicleCosts(range) | Returns fuel cost, maintenance cost, and total cost per vehicle in the range |

### voice.service.ts

Handles voice dispatch logic.

| Function | What it does |
|---|---|
| isSpeechSupported() | Checks if the browser supports the Web Speech API |
| createSpeechRecognition() | Creates a speech recognition instance |
| parseEntities(transcript) | Takes speech text and finds driver, vehicle, source, destination |
| validateEntities(entities) | Checks if required fields were found |

### ocr.service.ts

Handles receipt OCR logic.

| Function | What it does |
|---|---|
| extractText(imageFile) | Runs Tesseract.js on the image and returns extracted text |
| parseReceiptText(text) | Extracts amount, liters, date, and fuel station from receipt text |

## Service Patterns

All list functions follow the same pattern:

1. Accept a filters object with optional search, type, status, page, pageSize
2. Build a Supabase query with those filters
3. Add range for pagination
4. Order by date or creation time (newest first)
5. Return a PaginatedResult with data, count, page, pageSize, pageCount

All create and update functions:

1. Take a form data object matching the table columns
2. Insert or update in Supabase
3. Return the created or updated record

All delete functions:

1. Take an ID
2. Delete the matching row
3. Return nothing (void)
