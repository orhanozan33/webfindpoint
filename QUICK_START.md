# FindPoint - Hızlı Başlangıç

## 🚀 Hızlı Kurulum

### 1. Veritabanını Oluştur

PostgreSQL'de:
```sql
CREATE DATABASE findpoint;
```

### 2. Environment Variables

`.env.local` dosyası zaten mevcut. Gerekirse güncelleyin:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=333333
DB_NAME=findpoint
DB_SSL=false
JWT_SECRET=your-secret-key-change-in-production
```

### 3. Seed Database (Super Admin + Örnek Veriler)

```bash
npm run seed
```

Bu komut:
- ✅ Super admin oluşturur: `orhanozan33@gmail.com` / `33333333`
- ✅ Örnek admin oluşturur: `admin@findpoint.ca` / `admin123`
- ✅ Örnek client, project, payment, hosting, reminder, portfolio oluşturur

### 4. Server'ı Başlat

```bash
npm run dev
```

### 5. Giriş Yap

**Super Admin:**
- URL: `http://localhost:3000/admin`
- Email: `orhanozan33@gmail.com`
- Password: `33333333`

**Admin:**
- Email: `admin@findpoint.ca`
- Password: `admin123`

## 🔧 Build Hatası Düzeltildi

✅ `jsonwebtoken` crypto hatası düzeltildi
✅ `AdminSidebar` duplicate import düzeltildi
✅ Build başarılı (warnings zararsız)

## 📝 Notlar

- TypeORM warnings zararsızdır (opsiyonel bağımlılıklar)
- Veritabanı yoksa önce oluşturun
- Super admin agency'ye bağlı değildir (tüm agency'leri görebilir)

## 🎯 Sonraki Adımlar

1. Super admin ile giriş yap
2. İlk agency'yi oluştur
3. Agency'ye admin kullanıcıları ekle
4. Client ve project'leri yönetmeye başla