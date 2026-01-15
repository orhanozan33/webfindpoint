# Vercel Environment Variables Kurulum Rehberi

## 📋 Adım Adım Kurulum

Vercel Dashboard → Projeniz → **Settings** → **Environment Variables** bölümüne gidin.

Her bir environment variable'ı aşağıdaki sırayla ekleyin:

---

## 1. Database Connection String

**Key:** `DATABASE_URL`  
**Value:** `postgresql://postgres.wyoslbcqqdwtryqcxeni:orhanozan33@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 2. Database SSL

**Key:** `DB_SSL`  
**Value:** `true`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 3. Database Synchronization (İlk Kurulum İçin)

**Key:** `DB_SYNC`  
**Value:** `true`  
**Environment:** Production, Preview, Development (hepsini seçin)

**⚠️ UYARI:** Tablolar oluştuktan sonra bu değeri `false` yapın veya silin!

---

## 4. Supabase URL

**Key:** `NEXT_PUBLIC_SUPABASE_URL`  
**Value:** `https://wyoslbcqqdwtryqcxeni.supabase.co`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 5. Supabase Anon Key

**Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5b3NsYmNxcWR3dHJ5cWN4ZW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg0MzQ4NDAsImV4cCI6MjA4NDAxMDg0MH0.YjnYSRX2gSyTXLA5mpJwB2zjj-_nQdAjaNFqHcuhv5o`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 6. Supabase Service Role Key

**Key:** `SUPABASE_SERVICE_ROLE_KEY`  
**Value:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5b3NsYmNxcWR3dHJ5cWN4ZW5pIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODQzNDg0MCwiZXhwIjoyMDg0MDEwODQwfQ.U1RYScG3HtvLle95F2zvgs3so1mfUPlOHJrLDh7fHYA`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 7. JWT Secret

**Key:** `JWT_SECRET`  
**Value:** `7NY5X5Orz6pueeWrsdwQzmWjf4kInL0Dz6/MWXZvJkiBeaOlnx/paxGJVoh7wmGNXaLWDyO9BsLaQcQGTYxUjg==`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 8. Super Admin Secret

**Key:** `SUPER_ADMIN_SECRET`  
**Value:** `setup-secret-change-in-production`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## 9. Site URL

**Key:** `NEXT_PUBLIC_SITE_URL`  
**Value:** `https://webfindpoint.vercel.app`  
**Environment:** Production, Preview, Development (hepsini seçin)

---

## ✅ Kurulum Sonrası

1. **Tüm değişkenleri ekledikten sonra:**
   - "Save" butonuna tıklayın
   - Vercel otomatik olarak yeni bir deployment başlatacak

2. **Deploy tamamlandıktan sonra:**
   - Database tablolarını oluşturmak için:
     ```
     POST https://webfindpoint.vercel.app/api/admin/init-database
     ```
   
   - Super admin kullanıcısı oluşturmak için:
     ```
     POST https://webfindpoint.vercel.app/api/admin/create-super-admin
     Authorization: Bearer setup-secret-change-in-production
     Body: {
       "email": "orhanozan33@gmail.com",
       "password": "33333333",
       "name": "Super Admin"
     }
     ```

3. **Admin paneline giriş:**
   - URL: `https://webfindpoint.vercel.app/admin`
   - Email: `orhanozan33@gmail.com`
   - Password: `33333333`

---

## 🔒 Güvenlik Notları

- `DB_SYNC=true` sadece ilk kurulum için kullanın, sonra `false` yapın
- `SUPER_ADMIN_SECRET` değerini production'da değiştirin
- `JWT_SECRET` değerini production'da güçlü bir değerle değiştirin
