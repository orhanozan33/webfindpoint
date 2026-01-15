# 🚀 Vercel Deployment Guide

## Ön Gereksinimler

1. Vercel hesabı oluşturun: https://vercel.com
2. Vercel CLI yüklü olmalı (opsiyonel): `npm i -g vercel`
3. Git repository hazır olmalı

## 📋 Adım 1: Environment Variables Ayarlama

Vercel Dashboard'da veya CLI ile aşağıdaki environment variables'ları ekleyin:

### Gerekli Environment Variables

```env
# Supabase Database Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?sslmode=require

# JWT Authentication
JWT_SECRET=your-strong-secret-key-change-in-production-min-32-chars

# Site URL (Production)
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app

# Optional: Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id

# Optional: AI Features
OPENAI_API_KEY=your-openai-key
ANTHROPIC_API_KEY=your-anthropic-key
```

### Vercel Dashboard'da Ayarlama

1. Vercel Dashboard'a gidin: https://vercel.com/dashboard
2. Projenizi seçin veya yeni proje oluşturun
3. **Settings** > **Environment Variables** bölümüne gidin
4. Her bir environment variable'ı ekleyin:
   - **Name**: `DATABASE_URL`
   - **Value**: Supabase connection string'iniz
   - **Environment**: Production, Preview, Development (hepsini seçin)
   - **Add** butonuna tıklayın

Aynı şekilde diğer environment variables'ları da ekleyin.

## 📋 Adım 2: Vercel CLI ile Deploy (Önerilen)

### İlk Deploy

```bash
# Vercel CLI ile giriş yapın
vercel login

# Projeyi deploy edin
vercel

# Production'a deploy edin
vercel --prod
```

### Sonraki Deploy'lar

Git push yaptığınızda otomatik deploy olur (GitHub/GitLab/Bitbucket bağlantısı varsa).

## 📋 Adım 3: GitHub/GitLab/Bitbucket Entegrasyonu (Önerilen)

1. Vercel Dashboard > **Settings** > **Git**
2. Repository'nizi bağlayın
3. Her push'ta otomatik deploy olur

## 📋 Adım 4: Build Ayarları

Vercel otomatik olarak Next.js projelerini algılar. Ekstra ayar gerekmez.

**Build Command**: `npm run build` (otomatik)
**Output Directory**: `.next` (otomatik)
**Install Command**: `npm install` (otomatik)

## 📋 Adım 5: Domain Ayarlama (Opsiyonel)

1. Vercel Dashboard > **Settings** > **Domains**
2. Custom domain ekleyin
3. DNS ayarlarını yapın

## ✅ Deployment Sonrası Kontrol

1. **Admin Panel**: `https://your-domain.vercel.app/admin`
2. **Login**: `orhanozan33@gmail.com` / `33333333`
3. Verilerin yüklendiğini kontrol edin

## 🔧 Troubleshooting

### Build Hatası

- Environment variables'ların doğru ayarlandığından emin olun
- `DATABASE_URL` formatını kontrol edin
- Supabase connection string'in SSL modunu kontrol edin

### Database Connection Hatası

- Supabase'de IP whitelist ayarlarını kontrol edin
- Vercel'in IP'lerini Supabase'e ekleyin (gerekirse)
- `DATABASE_URL` içindeki password'ün doğru olduğundan emin olun

### JWT Secret Hatası

- `JWT_SECRET` en az 32 karakter olmalı
- Production'da güçlü bir secret kullanın

## 📝 Notlar

- Vercel otomatik olarak HTTPS sağlar
- Environment variables production, preview ve development için ayrı ayrı ayarlanabilir
- Her deploy'da build loglarını kontrol edin
- Supabase connection pool limitlerini kontrol edin (Vercel serverless functions için)

## 🎯 Hızlı Deploy Komutu

```bash
# Tek seferde production'a deploy
vercel --prod --yes
```
