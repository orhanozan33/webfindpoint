# Server Başlatma

## ✅ Temizlik Yapıldı

- ✅ Tüm Node.js process'leri durduruldu
- ✅ Port 3000 temizlendi
- ✅ .next cache temizlendi
- ✅ npm cache temizlendi

## 🚀 Server'ı Başlat

```bash
npm run dev
```

Server başladıktan sonra:
- **Public Site**: http://localhost:3000/en
- **Admin Panel**: http://localhost:3000/admin
- **Super Admin**: orhanozan33@gmail.com / 33333333

## 🔄 Gelecekte Temizlik İçin

Tüm Node.js process'lerini durdurmak:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

Port 3000'ü temizlemek:
```powershell
netstat -ano | findstr :3000
# PID'yi bulup:
Stop-Process -Id <PID> -Force
```

Cache temizlemek:
```bash
npm cache clean --force
rm -rf .next
```