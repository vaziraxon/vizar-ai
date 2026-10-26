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
  - Autentifikatsiya uchun rate-limiting qo'shildi
    (`src/lib/rate-limit.ts`, 2026-08-23). Ikki rejimda ishlaydi:
    `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN` o'rnatilsa,
    Upstash Redis REST API orqali barcha instance/region'lar bo'ylab
    umumiy (shared) hisoblagichdan foydalanadi — production uchun
    xavfsiz. O'rnatilmasa, bitta process ichidagi in-memory
    hisoblagichga tushadi (ko'p-instansli muhitda to'liq himoya
    emas). Upstash'ni ishga tushirish uchun `.env.example`ga qarang.
  - Fayl yuklashlar uchun rate-limiting hali yo'q.
  - Haqiqiy OCR yoki AI tahlil xizmati (hozircha barcha AI natijalari
    simulyatsiya qilingan va shunday deb belgilangan)
  - Hisobni real o'chirish (admin/service-role orqali server
    tomonida alohida amalga oshirilishi kerak)
  - Shaxsiy hujjatlarni qayta ishlash bo'yicha rasmiy xavfsizlik va
    maxfiylik auditi — buni haqiqiy foydalanuvchi hujjatlarini qabul
    qilishdan oldin bajarish shart
  - `/admin` va `/agency` endi rol asosida cheklangan
    (`src/lib/supabase/authz.ts` va `middleware.ts`, 2026-08-23):
    `/admin` — `ADMIN_EMAILS` ro'yxatidagi email'lar bilan; `/agency`
    — `account_type = 'agency'` bo'lgan profil yoki `agency_members`
    a'zoligi bilan. Haqiqiy admin roli sxemada hali yo'q (buning uchun
    migratsiya kerak bo'ladi, bu loyiha esa service-role kalitisiz
    uni ishga tushira olmaydi) — shuning uchun `ADMIN_EMAILS` vaqtincha
    yechim. Ikkala sahifa ham hozircha 100% demo/mock ma'lumot
    ko'rsatadi.

## Production'ga chiqarishdan oldin tekshirish ro'yxati

Quyidagilar kod orqali emas, balki Supabase/hosting sozlamalari orqali
qilinishi kerak — shuning uchun bu loyiha ularni avtomatik hal qila
olmaydi:

1. **Supabase Auth redirect URL'lari** — hozircha faqat
   `http://localhost:3000` sozlangan (7-bosqich yuqorida). Production
   domeningizni **Authentication → URL Configuration** bo'limidagi
   **Site URL** va **Redirect URLs** ro'yxatiga qo'shmaguningizcha,
   parolni tiklash va emailni tasdiqlash havolalari haqiqiy
   foydalanuvchilar uchun ishlamaydi.
2. **`NEXT_PUBLIC_SITE_URL`** — hosting muhitingizda (Vercel va h.k.)
   bu o'zgaruvchini haqiqiy domeningizga o'rnating. Agar
   o'rnatilmasa, parolni tiklash havolalari `http://localhost:3000`ga
   yo'naltiriladi (`src/lib/actions/auth.ts`dagi
   `getPublicSiteUrl()` shuni konsolga ogohlantiradi, lekin
   xatolikni to'xtatmaydi). `.env.example` faylida namuna bor.
3. **Rate-limiting** — `UPSTASH_REDIS_REST_URL` va
   `UPSTASH_REDIS_REST_TOKEN`ni o'rnating (bepul: console.upstash.com'da
   Redis bazasi yarating). O'rnatilmasa, ilova baribir ishlaydi, lekin
   faqat bitta process ichida himoyalanadi.
4. **`ADMIN_EMAILS`** — `/admin`ni ko'rish uchun o'z emailingizni shu
   ro'yxatga qo'shing (vergul bilan ajratib bir nechta email
   qo'shsa bo'ladi). O'rnatilmaguncha hech kim, hatto siz ham,
   `/admin`ga kira olmaysiz — bu ataylab shunday (fail-closed).
5. **`/agency`** — o'z hisobingizda ko'rish uchun Sozlamalar
   sahifasida "Hisob turi"ni **Agentlik**ka o'zgartiring.

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

## AI bilimlar bazasi (kitob RAG, mamlakat qoidalari, manba monitoringi)

VIZAR AI kitobi to'liq matni bilan Supabase'da saqlanadi va AI maslahatchi
(`/dashboard/assistant`) faqat shu matn hamda rasmiy manbalarga tayanib
javob beradi. Tarkibi:

| Qism | Joyi |
| --- | --- |
| Sxema (faqat yangi `kb_*` jadvallar, mavjudlarga tegmaydi) | `supabase/knowledge.sql` |
| Edge Functions: embedding, gibrid qidiruv, manba tekshiruvi | `supabase/functions/kb-embed`, `kb-search`, `kb-verify-sources` |
| Kitobni .docx'dan ajratish (matn qisqartirilmaydi, tekshiriladi) | `scripts/knowledge/parse-book.mjs` |
| Bazaga bir martalik import | `scripts/knowledge/import-book.mjs` |
| Javob API (Claude, manba ko'rsatib) | `src/app/api/knowledge/ask/route.ts` |
| Tahrirlash paneli | `/admin/knowledge` |

### O'rnatish tartibi

1. **Zaxira nusxa.** Free tarifda Supabase avtomatik backup bermaydi —
   avval o'zingiz oling (Docker kerak; ulanish satri: Dashboard → Connect):

   ```bash
   npx supabase db dump --db-url "$DB_URL" -f backup/schema.sql
   npx supabase db dump --db-url "$DB_URL" -f backup/data.sql --use-copy --data-only
   ```

2. **Sxema.** SQL Editor'da `supabase/knowledge.sql`ni ishga tushiring.
   So'ng Edge Functions manzilini kiriting (embedding trigger va cron
   uchun):

   ```sql
   insert into kb_private.settings (key, value)
   values ('functions_url', 'https://<project-ref>.supabase.co/functions/v1')
   on conflict (key) do update set value = excluded.value;
   ```

3. **Edge Functions.** `kb-embed`, `kb-search`, `kb-verify-sources`ni
   `verify_jwt = false` bilan deploy qiling
   (`npx supabase functions deploy kb-search --no-verify-jwt` va h.k.).
   Embedding modeli (`gte-small`) Supabase ichida ishlaydi — kalit kerak emas.

4. **Kitobni yuklash.**

   ```bash
   node scripts/knowledge/parse-book.mjs kitob.docx book.json
   node scripts/knowledge/import-book.mjs prepare token.txt   # chiqqan SQLni SQL Editor'da ishga tushiring
   node scripts/knowledge/import-book.mjs run book.json token.txt
   ```

   Keyin SQL Editor'da `drop function public.kb_admin_import(text, text, jsonb);`
   va `token.txt`ni o'chiring. Embedding hisoblash to'xtab qolsa (Edge
   Function CPU limiti, HTTP 546), uni alohida davom ettirish mumkin:
   `node scripts/knowledge/import-book.mjs embed`.

5. **Muharrirlar.** `/admin/knowledge`da tahrirlash uchun email ham
   `ADMIN_EMAILS`da, ham bazada bo'lishi kerak:

   ```sql
   insert into public.kb_editors (email) values ('siz@example.com');
   ```

6. **AI javoblar.** Hosting muhitiga `ANTHROPIC_API_KEY` qo'shing va qayta
   deploy qiling — boshqa o'zgarish kerak emas. Kalitgacha (yoki
   `KB_AI_MODE=off` bo'lsa) maslahatchi pullik API'ni chaqirmaydi:
   kitobdan eng mos bo'limlar va rasmiy manbalar ko'rsatiladi,
   foydalanuvchiga "AI javoblari hozircha ulanmagan" degan xabar chiqadi.
   `next dev`da kalit bo'lmasa, interfeysni sinash uchun mock javoblar
   ishlatiladi (production'da hech qachon). Kalit bor-u, hisobda mablag'
   bo'lmasa yoki API ishlamasa ham, foydalanuvchi xato emas, kitob
   bo'limlarini oladi.

7. **Tekshirish.** `node scripts/knowledge/health-check.mjs` — baza, RLS,
   qidiruv va embedding navbatini publishable kalit bilan tekshiradi
   (pullik chaqiruv yo'q). `node scripts/knowledge/rag-test.mjs` — qidiruv
   sifati testi.

### API endpointlar

| Endpoint | Kim uchun | Nima qiladi | Pullik? |
| --- | --- | --- | --- |
| `GET /api/knowledge/status` | hamma | AI rejimi (`live`/`mock`/`off`) va baza hajmi | yo'q |
| `POST /api/knowledge/search` | tizimga kirganlar, 60/10 daq | gibrid qidiruv: bo'limlar + mamlakat qoidalari | yo'q |
| `POST /api/knowledge/ask` | tizimga kirganlar, 20/10 daq | javob (NDJSON oqim) + manbalar | faqat `live` rejimda |

### Qanday ishlaydi

- **Qidiruv:** savol so'zlari o'zbekcha qo'shimchalardan tozalanib
  (`vizalarning` → `viza`), apostrof variantlari birxillashtirilib
  full-text qidiruv qilinadi va `gte-small` vektor qidiruvi bilan
  Reciprocal Rank Fusion orqali birlashtiriladi.
- **Javob:** topilgan bo'laklar Claude'ga `search_result` bloklari sifatida
  beriladi; javobdagi har bir iqtibos `[n]` bilan bob/bo'lim yoki rasmiy
  manbaga bog'lanadi.
- **O'zgaruvchan talablar:** `kb-verify-sources` har soatda haftada bir
  marta tekshirilmagan 10 tagacha rasmiy sahifani ochib, matnini
  solishtiradi. Sahifa o'zgarsa, unga tayangan mamlakat qoidalari
  `needs_review` holatiga o'tadi va AI javobida “rasmiy sahifada
  tekshiring” deb ogohlantiradi. Muharrir sahifani o'qib, qoidani
  `/admin/knowledge/rules`da tasdiqlaydi yoki yangilaydi.
- **Kitob faqat o'qish uchun ochiq:** `published` holatidagi qatorlarni
  hamma o'qiy oladi. Faqat tizimga kirganlar uchun qilish kerak bo'lsa,
  `knowledge.sql`dagi `*_read` siyosatlarida `to anon, authenticated`ni
  `to authenticated`ga almashtiring.
