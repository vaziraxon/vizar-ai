# Supabase sozlash bo'yicha qo'llanma

Ushbu hujjat VIZAR AI loyihasini haqiqiy Supabase backend bilan
ulash uchun bosqichma-bosqich yo'riqnoma beradi. Hech qanday qadam
oldindan bajarilmagan — loyihani ishga tushirishdan oldin quyidagilarni
o'zingiz bajarishingiz kerak.

## 1. Supabase hisobini yarating

[supabase.com](https://supabase.com) saytiga kiring va bepul hisob
oching (GitHub orqali kirish eng tezkor usul).

## 2. Yangi loyiha yarating

Dashboard'da **New Project** tugmasini bosing:
- Tashkilot (organization) tanlang yoki yangi yarating
- Loyihaga nom bering (masalan, `vizar-ai`)
- Kuchli database parolini yarating va **xavfsiz joyda saqlang**
- Eng yaqin regionni tanlang (masalan, Frankfurt yoki Singapur)

Loyiha tayyor bo'lishi 1-2 daqiqa vaqt oladi.

## 3. Project URL'ni toping

Dashboard → **Project Settings** → **API** bo'limiga o'ting.
**Project URL** qatoridagi manzilni nusxalang
(masalan, `https://xxxxxxxxxxxx.supabase.co`).

## 4. anon/publishable kalitni toping

Xuddi shu **API** sahifasida **Project API keys** bo'limida
**anon public** kalitni toping va nusxalang.

⚠️ **Faqat shu kalitni oling.** `service_role` kalitini hech qachon
frontend kodiga yoki `.env.local` fayliga qo'ymang — bu loyiha undan
umuman foydalanmaydi.

## 5. `.env.local` faylini yarating

Loyiha papkasida `.env.example` faylini nusxalab `.env.local` deb
nomlang, so'ng qiymatlarni kiriting:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

`.env.local` fayli `.gitignore`da allaqachon istisno qilingan — uni
hech qachon Git'ga qo'shmang.

## 6. `supabase/schema.sql`ni ishga tushiring

Supabase Dashboard → **SQL Editor** → **New query**.
`supabase/schema.sql` faylining butun mazmunini joylashtirib, **Run**
tugmasini bosing. Bu barcha jadvallarni, trigger'larni va Row Level
Security siyosatlarini yaratadi.

## 7. `supabase/storage.sql`ni ishga tushiring

Xuddi shu tarzda, **SQL Editor**da yangi so'rov oching va
`supabase/storage.sql` mazmunini ishga tushiring. Bu `visa-documents`
nomli **yopiq (private)** bucket'ni yaratadi.

## 8. RLS yoqilganini tasdiqlang

**Table Editor** → har bir jadvalni oching → yon panelda
**RLS enabled** yozuvi ko'rinishi kerak. `schema.sql` buni avtomatik
yoqadi, lekin tekshirib qo'yish tavsiya etiladi.

## 9. `visa-documents` bucket yopiqligini tasdiqlang

**Storage** bo'limiga o'ting → `visa-documents` bucket'ini toping →
u **Private** deb belgilanganini tekshiring (yashil "Public" belgisi
ko'rinmasligi kerak).

## 10. Auth redirect URL'larini sozlang

**Authentication** → **URL Configuration** bo'limiga o'ting:

- **Site URL**: `http://localhost:3000`
- **Redirect URLs** ro'yxatiga qo'shing:
  ```
  http://localhost:3000/auth/callback
  ```

Production'ga chiqarganingizda, haqiqiy domeningizni ham
(`https://sizning-domeningiz.uz/auth/callback`) shu ro'yxatga
qo'shishni unutmang — hozircha faqat localhost sozlangan.

## 11. Paketlarni o'rnating

```bash
npm install
```

## 12. Loyihani ishga tushiring

```bash
npm run dev
```

`http://localhost:3000` manzilini brauzerda oching.

## 13. Test foydalanuvchi bilan ro'yxatdan o'ting

`/register` sahifasiga o'ting va test ma'lumotlar bilan ro'yxatdan
o'ting. Standart Supabase sozlamalarida email tasdiqlash talab
qilinadi — Supabase yuborgan xatdagi havolani bosing (yoki
**Authentication → Users** bo'limida foydalanuvchini qo'lda
tasdiqlang, agar test email sozlanmagan bo'lsa).

## 14. Kirishni tekshiring

`/login` sahifasida email va parolingiz bilan kiring. Muvaffaqiyatli
kirgach `/dashboard` sahifasiga yo'naltirilishingiz kerak.

## 15. Ariza yaratishni tekshiring

`/assessment` sahifasida yangi tahlilni boshlang. Birinchi bosqichni
to'ldirib "Keyingi" tugmasini bosganingizda, Supabase'da yangi
`visa_applications` qatori yaratilishi kerak (**Table Editor** orqali
tekshiring).

## 16. Hujjat yuklashni tekshiring

`/documents` sahifasida (avval kamida bitta ariza yaratilgan bo'lishi
kerak) test uchun kichik PDF yoki rasm faylini yuklang. **Storage** →
`visa-documents` bo'limida `{user_id}/{application_id}/...` yo'lida
fayl paydo bo'lishi kerak.

⚠️ **Hozircha test hujjatlaridan foydalaning** — haqiqiy passport yoki
moliyaviy hujjatlarni yuklamang.

## 17. Chiqishni tekshiring

Profil menyusidan yoki Sozlamalar sahifasidan **Chiqish** tugmasini
bosing. `/login` sahifasiga qaytarilishingiz va qayta himoyalangan
sahifalarga kira olmasligingiz kerak.

---

## Muhim xavfsizlik eslatmalari

- **`service_role` kalitini hech qachon** frontendga yoki
  `.env.local`ga qo'ymang. Bu loyiha undan umuman foydalanmaydi.
- Barcha jadvallarda RLS yoqilgan va faqat egasi o'z ma'lumotlarini
  ko'ra oladi — `supabase/schema.sql`dagi siyosatlarni o'zgartirishdan
  oldin diqqat bilan o'qib chiqing.
- `visa-documents` bucket har doim **yopiq** bo'lishi kerak. Fayllarni
  ko'rish faqat vaqtinchalik signed URL orqali amalga oshiriladi.
- Bu MVP hali quyidagilarni **amalga oshirmagan** (keyingi bosqichlar
  uchun TODO sifatida qoldirilgan):
  - Autentifikatsiya va yuklashlar uchun rate-limiting
  - Haqiqiy OCR yoki AI tahlil xizmati (hozircha barcha AI natijalari
    simulyatsiya qilingan va shunday deb belgilangan)
  - Hisobni real o'chirish (admin/service-role orqali server
    tomonida alohida amalga oshirilishi kerak)
  - Shaxsiy hujjatlarni qayta ishlash bo'yicha rasmiy xavfsizlik va
    maxfiylik auditi — buni haqiqiy foydalanuvchi hujjatlarini qabul
    qilishdan oldin bajarish shart

## Turlarni qayta generatsiya qilish (kelajakda)

`src/types/database.ts` fayli hozircha qo'lda yozilgan (haqiqiy loyiha
mavjud bo'lmagani uchun). Loyihangiz tayyor bo'lgach, quyidagi buyruq
bilan haqiqiy sxema asosida qayta generatsiya qilishingiz mumkin:

```bash
npx supabase gen types typescript --project-id <sizning-project-id> \
  --schema public > src/types/database.ts
```

Bu buyruq **ushbu tayyorlov jarayonida ishga tushirilmagan** — haqiqiy
loyiha ID topilmagani sababli faqat hujjatlashtirilgan.
