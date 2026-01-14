# Super Admin Oluşturma

## Yöntem 1: API Endpoint (Server Çalışırken)

Server çalışırken:

```bash
curl -X POST http://localhost:3000/api/admin/create-super-admin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer setup-secret" \
  -d '{
    "email": "orhanozan33@gmail.com",
    "password": "33333333",
    "name": "Super Admin"
  }'
```

## Yöntem 2: Script (Doğrudan)

```bash
npm run create-super-admin
```

**Not:** Veritabanı önce oluşturulmalı:
```sql
CREATE DATABASE findpoint;
```

## Yöntem 3: Manuel (PostgreSQL)

```sql
-- PostgreSQL'de doğrudan çalıştır
INSERT INTO users (id, email, password, name, role, "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'orhanozan33@gmail.com',
  '$2a$10$...', -- bcrypt hash of '33333333'
  'Super Admin',
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

## Hızlı Kurulum

1. Veritabanını oluştur:
   ```sql
   CREATE DATABASE findpoint;
   ```

2. Server'ı başlat:
   ```bash
   npm run dev
   ```

3. Super admin oluştur:
   ```bash
   curl -X POST http://localhost:3000/api/admin/create-super-admin \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer setup-secret" \
     -d '{"email":"orhanozan33@gmail.com","password":"33333333","name":"Super Admin"}'
   ```

4. Giriş yap:
   - Email: `orhanozan33@gmail.com`
   - Password: `33333333`
   - URL: `http://localhost:3000/admin`