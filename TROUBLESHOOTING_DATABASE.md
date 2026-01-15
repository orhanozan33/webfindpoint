# Veritabanı Bağlantı Sorunları - Sorun Giderme

## ❌ Hata: "password authentication failed"

Bu hata, Supabase veritabanına bağlanırken şifre yanlış olduğunu gösterir.

---

## 🔍 Adım 1: Vercel Environment Variables Kontrolü

Vercel Dashboard → Projeniz → **Settings** → **Environment Variables** bölümüne gidin.

### Kontrol Edilmesi Gerekenler:

1. **`DATABASE_URL`** değeri doğru mu?
   ```
   postgresql://postgres.wyoslbcqqdwtryqcxeni:orhanozan33@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
   ```

2. **Şifre doğru mu?** 
   - Şifre: `orhanozan33`
   - Connection string'de şifre `:` ve `@` arasında olmalı

3. **Tüm environment'lar seçili mi?**
   - Production ✅
   - Preview ✅
   - Development ✅

---

## 🔧 Adım 2: Supabase Dashboard'dan Şifre Kontrolü

1. Supabase Dashboard'a gidin: https://supabase.com/dashboard
2. Projenizi seçin
3. **Settings** → **Database** → **Connection string** bölümüne gidin
4. **Connection pooling** veya **Direct connection** seçeneğini kontrol edin
5. Şifreyi doğrulayın

**Not:** Supabase şifresi değiştirilmiş olabilir. Eğer değiştirdiyseniz, yeni şifreyi kullanın.

---

## 🔄 Adım 3: Connection String Formatı

### Doğru Format:
```
postgresql://[USERNAME]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

### Örnek:
```
postgresql://postgres.wyoslbcqqdwtryqcxeni:orhanozan33@db.wyoslbcqqdwtryqcxeni.supabase.co:5432/postgres
```

### Şifre Özel Karakter İçeriyorsa:

Eğer şifrenizde özel karakterler varsa (örneğin: `@`, `#`, `%`, `&`), URL encode edilmesi gerekir:

- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `&` → `%26`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`

**Örnek:** Şifre `pass@word#123` ise → `pass%40word%23123`

---

## 🔄 Adım 4: Alternatif - Individual Parameters Kullanın

Eğer `DATABASE_URL` çalışmıyorsa, individual parameters kullanabilirsiniz:

Vercel'de şu environment variables'ları ekleyin:

**Key:** `DB_HOST`  
**Value:** `db.wyoslbcqqdwtryqcxeni.supabase.co`

**Key:** `DB_PORT`  
**Value:** `5432`

**Key:** `DB_USERNAME`  
**Value:** `postgres.wyoslbcqqdwtryqcxeni`

**Key:** `DB_PASSWORD`  
**Value:** `orhanozan33`

**Key:** `DB_NAME`  
**Value:** `postgres`

**Key:** `DB_SSL`  
**Value:** `true`

**Not:** `DATABASE_URL` varsa, individual parameters kullanılmaz. İkisinden birini seçin.

---

## ✅ Adım 5: Değişiklikleri Kaydet ve Redeploy Et

1. Vercel'de tüm environment variables'ları kontrol edin
2. "Save" butonuna tıklayın
3. Vercel otomatik olarak yeni bir deployment başlatacak
4. Deployment tamamlandıktan sonra tekrar deneyin

---

## 🧪 Adım 6: Test Et

Deployment tamamlandıktan sonra:

1. **Setup endpoint'ini test edin:**
   ```
   GET https://webfindpoint.vercel.app/api/setup
   ```

2. **Başarılı olursa:**
   ```
   POST https://webfindpoint.vercel.app/api/setup
   ```

---

## 🔐 Supabase Şifresini Değiştirme

Eğer Supabase şifresini değiştirmek isterseniz:

1. Supabase Dashboard → **Settings** → **Database**
2. **Database password** bölümüne gidin
3. "Reset database password" butonuna tıklayın
4. Yeni şifreyi kaydedin
5. Vercel'de `DATABASE_URL` veya `DB_PASSWORD` değerini güncelleyin

---

## 📝 Notlar

- Connection string'de şifre **URL encode edilmemiş** olmalı (özel karakterler yoksa)
- Vercel'de environment variables değiştirildikten sonra **mutlaka redeploy** gerekir
- `DATABASE_URL` ve individual parameters **aynı anda kullanılmamalı**
- Supabase connection string'inde **pooling** veya **direct** seçeneğini kontrol edin

---

## 🆘 Hala Çalışmıyorsa

1. Supabase Dashboard'dan yeni bir connection string oluşturun
2. Vercel'deki tüm database-related environment variables'ları silin
3. Yeniden ekleyin
4. Redeploy edin
