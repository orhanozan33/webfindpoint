# PostgreSQL Bağlantı Ayarları

PostgreSQL bağlantısı için `.env.local` dosyası oluşturun (proje kök dizininde):

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=333333
DB_NAME=findpoint
DB_SSL=false

# Next.js Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# JWT Secret (Admin Authentication)
JWT_SECRET=your-secret-key-change-in-production

# Translation API Keys (Portfolio form auto-translation)
# ⚠️ ÖNEMLİ: API key eklemeden de çalışır! (LibreTranslate ve MyMemory ücretsiz kullanılır)
# Daha kaliteli çeviri için aşağıdakilerden birini ekleyebilirsiniz:

# 1. DeepL API (önerilen - en kaliteli çeviri)
# ÜCRETSİZ: 500,000 karakter/ay (sadece email ile kayıt)
# https://www.deepl.com/pro-api
DEEPL_API_KEY=your_deepl_api_key_here

# 2. Microsoft Translator API (en fazla ücretsiz limit)
# ÜCRETSİZ: 2,000,000 karakter/ay
# https://azure.microsoft.com/tr-tr/services/cognitive-services/translator/
MICROSOFT_TRANSLATOR_API_KEY=your_microsoft_api_key_here
MICROSOFT_TRANSLATOR_REGION=global

# 3. Google Translate API
# ÜCRETSİZ: Sınırlı (kredi kartı gerekebilir)
# https://console.cloud.google.com/
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# NOT: API key eklemezseniz, sistem otomatik olarak ücretsiz servisleri kullanır:
# - LibreTranslate (açık kaynak, ücretsiz)
# - MyMemory (10,000 kelime/gün ücretsiz)
```

**Not:** `.env.local` dosyası git'e eklenmez (`.gitignore` içinde). Bu dosyayı manuel olarak oluşturmanız gerekiyor.

## Çeviri API Key'leri Nasıl Alınır?

### DeepL API (Önerilen)
1. https://www.deepl.com/pro-api adresine gidin
2. Ücretsiz hesap oluşturun (500,000 karakter/ay ücretsiz)
3. API key'inizi alın
4. `.env.local` dosyasına `DEEPL_API_KEY=your_key_here` ekleyin

### Google Translate API
1. Google Cloud Console'da proje oluşturun
2. Cloud Translation API'yi etkinleştirin
3. API key oluşturun
4. `.env.local` dosyasına `GOOGLE_TRANSLATE_API_KEY=your_key_here` ekleyin

**Önemli:** En az bir API key eklemeniz gerekiyor. Portfolio form'unda TR alanına yazdığınızda EN ve FR otomatik çevrilecek.