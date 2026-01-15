# Supabase Hızlı Kurulum - Örnek Veriler

## 🚀 En Hızlı Yöntem: Seed Script ile Örnek Veriler

Şifre sorunları nedeniyle migration yerine, seed script'i ile Supabase'de örnek veriler oluşturabilirsiniz.

---

## Adım 1: Supabase Connection String'i Kontrol Edin

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **Database** → **Connection string**
4. **Direct connection** seçin
5. **URI** formatını seçin
6. Connection string'i kopyalayın

**ÖNEMLİ:** Connection string'de `[YOUR-PASSWORD]` yerine gerçek şifreniz olmalı!

---

## Adım 2: .env Dosyasını Güncelleyin

`.env` dosyasında `DATABASE_URL`'i Supabase connection string yapın:

```env
DATABASE_URL=postgresql://postgres.wyoslbcqqdwtryqcxeni:[GERÇEK-SIFRE]@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
DB_SSL=true
```

**Not:** `[GERÇEK-SIFRE]` yerine Supabase'den aldığınız gerçek şifreyi yazın.

---

## Adım 3: Seed Script'ini Çalıştırın

```bash
npm run seed
```

Bu script şunları oluşturur:

✅ **Super Admin:**
- Email: `orhanozan33@gmail.com`
- Password: `33333333`
- Role: `super_admin`

✅ **Admin:**
- Email: `admin@findpoint.ca`
- Password: `admin123`
- Role: `admin`

✅ **Örnek Veriler:**
- 1 Agency (FindPoint Agency)
- 1 Client (John Doe - Acme Corporation)
- 1 Project (Acme Website Redesign)
- 1 Payment ($5,000 CAD)
- 1 Hosting Service (Vercel)
- 1 Reminder (Hosting expiration)
- 1 Portfolio Item

---

## Adım 4: Admin Paneline Giriş Yapın

**URL:** `https://webfindpoint.vercel.app/admin/login`

**Super Admin:**
- Email: `orhanozan33@gmail.com`
- Password: `33333333`

**Admin:**
- Email: `admin@findpoint.ca`
- Password: `admin123`

---

## ⚠️ Önemli Notlar

1. **Şifre doğru olmalı:** Connection string'de şifre `:` ve `@` arasında olmalı
2. **Direct connection kullanın:** Pooling değil
3. **Tablolar oluşturulmuş olmalı:** Eğer tablolar yoksa, önce `supabase_create_tables.sql` script'ini Supabase SQL Editor'da çalıştırın

---

## 🔧 Tablolar Yoksa

Eğer Supabase'de tablolar yoksa:

1. Supabase Dashboard → **SQL Editor**
2. `supabase_create_tables.sql` dosyasını açın
3. Tüm içeriği kopyalayın
4. SQL Editor'a yapıştırın
5. **Run** butonuna tıklayın

---

## ✅ Başarılı Olursa

Seed script'i başarılı olursa şu mesajı göreceksiniz:

```
✅ Seed completed successfully!

Login credentials:
Super Admin:
  Email: orhanozan33@gmail.com
  Password: 33333333

Admin:
  Email: admin@findpoint.ca
  Password: admin123
```
