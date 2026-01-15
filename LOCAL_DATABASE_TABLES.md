# Local Veritabanı Tabloları

## 📊 Toplam: 13 Tablo

### 1. **portfolio**
- **Kolonlar:** 15
- **İndeksler:** 0
- **Foreign Keys:** 0
- **Açıklama:** Portföy öğeleri

### 2. **contact_submissions**
- **Kolonlar:** 8
- **İndeksler:** 0
- **Foreign Keys:** 0
- **Açıklama:** İletişim formu gönderileri

### 3. **agencies**
- **Kolonlar:** 10
- **İndeksler:** 0
- **Foreign Keys:** 0
- **Açıklama:** Ajanslar (multi-tenant root)

### 4. **payments**
- **Kolonlar:** 10
- **İndeksler:** 0
- **Foreign Keys:** 2
  - `agencyId` → `agencies.id`
  - `projectId` → `projects.id`
- **Açıklama:** Ödemeler

### 5. **projects**
- **Kolonlar:** 13
- **İndeksler:** 0
- **Foreign Keys:** 2
  - `agencyId` → `agencies.id`
  - `clientId` → `clients.id`
- **Açıklama:** Projeler

### 6. **hosting_services**
- **Kolonlar:** 13
- **İndeksler:** 0
- **Foreign Keys:** 2
  - `agencyId` → `agencies.id`
  - `projectId` → `projects.id`
- **Açıklama:** Hosting servisleri

### 7. **clients**
- **Kolonlar:** 10
- **İndeksler:** 0
- **Foreign Keys:** 1
  - `agencyId` → `agencies.id`
- **Açıklama:** Müşteriler

### 8. **users**
- **Kolonlar:** 9
- **İndeksler:** 0
- **Foreign Keys:** 1
  - `agencyId` → `agencies.id`
- **Açıklama:** Kullanıcılar (admin/staff)

### 9. **reminders**
- **Kolonlar:** 16
- **İndeksler:** 0
- **Foreign Keys:** 1
  - `agencyId` → `agencies.id`
- **Açıklama:** Hatırlatıcılar

### 10. **invoices**
- **Kolonlar:** 16
- **İndeksler:** 0
- **Foreign Keys:** 3
  - `agencyId` → `agencies.id`
  - `clientId` → `clients.id`
  - `projectId` → `projects.id`
- **Açıklama:** Faturalar

### 11. **invoice_items**
- **Kolonlar:** 8
- **İndeksler:** 0
- **Foreign Keys:** 1
  - `invoiceId` → `invoices.id`
- **Açıklama:** Fatura kalemleri

### 12. **client_notes**
- **Kolonlar:** 12
- **İndeksler:** 0
- **Foreign Keys:** 3
  - `agencyId` → `agencies.id`
  - `clientId` → `clients.id`
  - `createdById` → `users.id`
- **Açıklama:** Müşteri notları

### 13. **notifications**
- **Kolonlar:** 14
- **İndeksler:** 0
- **Foreign Keys:** 2
  - `agencyId` → `agencies.id`
  - `userId` → `users.id`
- **Açıklama:** Bildirimler

---

## ✅ Durum

**Tüm beklenen tablolar mevcut!**

- **Beklenen:** 13 tablo
- **Mevcut:** 13 tablo
- **Eksik:** 0 tablo
- **Fazla:** 0 tablo

---

## 🔄 Tabloları Listelemek İçin

```bash
npm run list-tables
```

---

## 📝 Notlar

- Tüm tablolar `public` schema'sında
- Multi-tenant yapı için `agencies` tablosu root entity
- Foreign key ilişkileri doğru kurulmuş
- TypeORM entity'leri ile veritabanı tabloları eşleşiyor
