# Test Accounts

These accounts are already in the database. Use them to log in and test different roles.

All accounts use the same password: `Test123!`

| Email | Role | What They Can See |
|---|---|---|
| manager@transitops.com | Fleet Manager | Everything |
| driver@transitops.com | Driver | Trips, Fuel and Expenses |
| safety@transitops.com | Safety Officer | Vehicles, Drivers, Maintenance |
| finance@transitops.com | Financial Analyst | Vehicles, Drivers, Maintenance, Fuel and Expenses, Reports |

To create additional users, use the Supabase dashboard:

1. Go to Authentication > Users
2. Click "Add User" and enter email/password
3. Then insert a row into user_profiles:

```sql
INSERT INTO user_profiles (id, email, full_name, role)
VALUES ('auth-user-uuid', 'email@example.com', 'Full Name', 'fleet_manager');
```
