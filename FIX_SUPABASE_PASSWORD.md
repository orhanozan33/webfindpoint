# Supabase Password Authentication Fix

## Problem
Seed script Supabase'e bağlanırken "password authentication failed" hatası veriyor.

## Solution

### Option 1: Get New Connection String from Supabase Dashboard

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Copy the **URI** connection string (not the individual parameters)
6. Update `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
   DB_SSL=true
   ```

### Option 2: Reset Password in Supabase

1. Go to Supabase Dashboard → Settings → Database
2. Click **Reset database password**
3. Copy the new password
4. Update `.env.local` with the new connection string

### Option 3: URL Encode Password

If your password contains special characters, URL encode them:
- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`

Example:
```
Original: password@123
Encoded: password%40123
```

### Verify Connection

After updating `.env.local`, test the connection:
```bash
npm run seed
```

If successful, you should see:
```
✅ Seed completed successfully!
```

## Current Status

- ✅ Tables created in Supabase (13 tables)
- ✅ Super Admin created via `/api/setup` endpoint
- ❌ Seed script cannot connect (password authentication failed)

## Next Steps

1. Get correct connection string from Supabase dashboard
2. Update `.env.local` with correct `DATABASE_URL`
3. Run `npm run seed` again
4. Verify data in Supabase dashboard
