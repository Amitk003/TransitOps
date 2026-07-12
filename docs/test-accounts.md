# Test Accounts

All accounts use password: `Test123!`

| Email | Role | Sidebar Access |
|---|---|---|
| manager@transitops.com | fleet_manager | All items |
| driver@transitops.com | driver | Trips, Fuel & Expenses |
| safety@transitops.com | safety_officer | Vehicles, Drivers, Maintenance |
| finance@transitops.com | financial_analyst | Vehicles, Drivers, Maintenance, Fuel & Expenses, Reports |

## Creating New Users

```bash
# Using Supabase CLI with service_role key
supabase db query "SELECT * FROM auth.users;"

# Insert directly into user_profiles (must reference existing auth.users id)
INSERT INTO user_profiles (id, email, full_name, role)
VALUES ('<auth-user-id>', 'new@example.com', 'Name', 'fleet_manager');
```
