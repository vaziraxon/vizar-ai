# Onlayn to'lov: Payme va Click ulash

Kod tayyor, lekin to'lov **o'chiq**. Pastdagi qadamlar bajarilmaguncha saytda to'lov tugmasi ko'rinmaydi. Webhook manzillari esa har qanday so'rovga rad javobini qaytaradi.

## Qanday ishlaydi
1. Foydalanuvchi **Obuna** sahifasida tarifni tanlab, Payme yoki Click tugmasini bosadi.
2. Server `payment_orders` jadvaliga buyurtma yozadi. Narx serverning o'zida turadi: 49 000 / 179 000 / 679 000 so'm. Keyin foydalanuvchi to'lov tizimi sahifasiga yuboriladi.
3. Karta ma'lumotlari Payme yoki Click sahifasida kiritiladi. VIZAR AI ularni ko'rmaydi.
4. To'lov tizimi **bizning serverga** tasdiq yuboradi. Shunda `grant_paid_subscription()` obunani ochadi va foydalanuvchiga bildirishnoma boradi. Brauzerning saytga qaytib kelishi obunani ochmaydi.
5. To'lov qaytarilsa (refund), obuna yopiladi (`revoke_paid_subscription()`).

## 1. Bazani tayyorlash (bir marta)
`supabase/payments.sql` faylini qo'llash kerak. Bu production bazaga o'zgarish, shuning uchun egasining ruxsati bilan qilinadi.
Orqaga qaytarish uchun: `supabase/payments_rollback.sql`.

## 2. Payme Business
1. Kabinetda **veb-kassa** yarating. Hisob turi: **bir martalik** (one-time), maydon nomi: `order_id`.
2. **Endpoint URL**: `https://vizarai.com/api/payments/payme`
3. Kabinet ikkita kalit beradi: `key` (asosiy) va `TEST_KEY` (sinov uchun).
4. Vercel → `vizar-ai-z2ez` → Settings → Environment Variables bo'limiga qo'shing:
   | Nomi | Qiymati |
   |---|---|
   | `PAYME_MERCHANT_ID` | veb-kassa ID'si |
   | `PAYME_KEY` | asosiy kalit |
   | `PAYME_TEST_KEY` | sinov kaliti |
   | `PAYME_TEST_MODE` | sinovda `true`, ishga tushganda olib tashlang |
5. Sinov: [test.paycom.uz](https://test.paycom.uz) sahifasida veb-kassa ID'si va TEST_KEY'ni kiriting. Ikkala ssenariyni o'tkazing:
   - tranzaksiya yaratish va bekor qilish;
   - yaratish, tasdiqlash va bekor qilish.

## 3. Click
1. Click bilan shartnoma tuzilgach, ular `service_id`, `merchant_id`, `secret_key` va `merchant_user_id` beradi.
2. Prepare va Complete uchun bitta URL beriladi: `https://vizarai.com/api/payments/click`
3. Vercel'ga quyidagilarni qo'shing: `CLICK_SERVICE_ID`, `CLICK_MERCHANT_ID`, `CLICK_SECRET_KEY`, `CLICK_MERCHANT_USER_ID`.

## 4. Yoqish
Vercel'ga `PAYMENTS_ENABLED=true` qo'shing va saytni qayta build qiling. Qaysi tizimning kalitlari to'liq bo'lsa, faqat o'sha tizimning tugmasi chiqadi.
Holatni `/admin/payments` sahifasida ko'rish mumkin.

## Ishga tushirishdan oldin (egasi va yurist bilan)
- Foydalanish shartlariga to'lov, qaytarish (refund) va obuna muddati bo'limini qo'shish.
- Maxfiylik siyosatiga Payme va Click'ni to'lovni qayta ishlovchi sifatida qo'shish.
- Narx ikki joyda turadi: `/pricing` matni (`src/lib/i18n/site/*.ts`) va to'lov summasi (`src/lib/payments/config.ts`). Ikkalasini birga o'zgartiring. Test ular bir xilligini tekshiradi.
- Fiskal chek talablarini (OFD/IKPU kodlari) to'lov tizimi bilan aniqlash. Hozir kod chek ma'lumotini yubormaydi.
