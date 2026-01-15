# Local Verileri Supabase'e Aktarma - Talimatlar

## ❌ Şifre Hatası

Migration script'i şifre hatası veriyor. Bu, Supabase şifresinin yanlış veya değişmiş olduğunu gösterir.

---

## ✅ Çözüm 1: Supabase'den Yeni Connection String Alın

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **Database** → **Connection string**
4. **Direct connection** seçin (pooling değil)
5. **URI** formatını seçin
6. Yeni connection string'i kopyalayın

**Örnek:**
```
postgresql://postgres.wyoslbcqqdwtryqcxeni:[YENI-SIFRE]@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
```

7. `.env` dosyasına ekleyin:
```env
SUPABASE_DATABASE_URL=postgresql://postgres.wyoslbcqqdwtryqcxeni:[YENI-SIFRE]@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
```

8. Script'i tekrar çalıştırın:
```bash
npm run migrate-to-supabase
```

---

## ✅ Çözüm 2: Seed Script ile Örnek Veriler Oluşturun

Eğer local'de önemli veriler yoksa, seed script'i ile Supabase'de örnek veriler oluşturabilirsiniz:

1. `.env` dosyasında `DATABASE_URL`'i Supabase connection string yapın:
```env
DATABASE_URL=postgresql://postgres.wyoslbcqqdwtryqcxeni:orhanozan33@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
```

2. Seed script'ini çalıştırın:
```bash
npm run seed
```

Bu şunları oluşturur:
- ✅ Super Admin: `orhanozan33@gmail.com` / `33333333`
- ✅ Admin: `admin@findpoint.ca` / `admin123`
- ✅ Örnek agency, client, project, payment, hosting, reminder, portfolio

---

## ✅ Çözüm 3: Manuel Olarak Super Admin Oluşturun

1. Supabase Dashboard → **Table Editor** → `users` tablosu
2. **Insert row** butonuna tıklayın
3. Şu değerleri girin:

**Email:** `orhanozan33@gmail.com`  
**Password:** (bcrypt hash - aşağıdaki script ile oluşturun)  
**Name:** `Super Admin`  
**Role:** `super_admin`  
**isActive:** `true`  
**agencyId:** (boş bırakın)

### Password Hash Oluşturma

Node.js console'da:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('33333333', 10).then(console.log);
```

Veya online tool kullanın: https://bcrypt-generator.com/

**Hash:** `$2a$10$...` ile başlamalı

---

## 📝 Notlar

- **Şifre sıfırlandıysa** mutlaka yeni connection string kullanın
- **Direct connection** kullanın (pooling değil)
- **Connection string'de şifre** `:` ve `@` arasında olmalı

---

## 🆘 Hala Çalışmıyorsa

1. Supabase Dashboard → **Settings** → **Database** → **Database password**
2. Şifreyi kontrol edin veya yeni bir şifre oluşturun
3. Yeni şifre ile connection string'i güncelleyin
4. Tekrar deneyin
