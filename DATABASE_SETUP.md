# Veritabanı Kurulumu ✅

## ✅ Tamamlandı

**Veritabanı:** `webfindpoint` oluşturuldu  
**Super Admin:** `orhanozan33@gmail.com` / `33333333` oluşturuldu  
**Örnek Veriler:** Seed edildi

## 📊 Oluşturulan Veriler

### Kullanıcılar
- ✅ **Super Admin**: `orhanozan33@gmail.com` / `33333333`
- ✅ **Admin**: `admin@findpoint.ca` / `admin123`

### Agency
- ✅ **FindPoint Agency** (örnek agency)

### Örnek Veriler
- ✅ 1 Client (John Doe - Acme Corporation)
- ✅ 1 Project (Acme Website Redesign)
- ✅ 1 Payment ($5,000 CAD)
- ✅ 1 Hosting Service (Vercel)
- ✅ 1 Reminder (Hosting expiration)
- ✅ 1 Portfolio Item

## 🚀 Kullanım

### Giriş Yap

**Super Admin:**
```
URL: http://localhost:3000/admin
Email: orhanozan33@gmail.com
Password: 33333333
```

**Admin:**
```
Email: admin@findpoint.ca
Password: admin123
```

### Veritabanı Bilgileri

- **Database Name**: `webfindpoint`
- **Host**: `localhost`
- **Port**: `5432`
- **Username**: `postgres`
- **Password**: `333333`

## 🔄 Tekrar Seed Etmek İsterseniz

```bash
npm run seed
```

Bu komut:
- Mevcut verileri temizler
- Super admin'i yeniden oluşturur
- Örnek verileri ekler

## 📝 Notlar

- Super admin'in `agencyId` yok (tüm agency'leri görebilir)
- Admin kullanıcısı "FindPoint Agency"ye bağlı
- Tüm örnek veriler "FindPoint Agency"ye ait