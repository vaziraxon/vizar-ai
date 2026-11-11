import type { LangCode } from "@/lib/translations";

/**
 * Privacy policy and terms of service, written from how the system actually
 * works (checked 2026-11-11): Supabase (Tokyo) for accounts, data and files,
 * Vercel (functions in Tokyo) for hosting and cookie-less Web Analytics,
 * Google only for "Sign in with Google". Anthropic and OpenAI only for the
 * invited AI beta (at most 25 users; supabase/ai_beta.sql) — no audio or
 * transcript is stored. Document upload is closed, nothing is sold or used for ads.
 * Change these texts together with the system, never ahead of it.
 */

/** A paragraph, or a bullet list when it is an array */
export type LegalBlock = string | string[];
export interface LegalSection {
  id: string;
  title: string;
  body: LegalBlock[];
}
export interface LegalDoc {
  title: string;
  description: string;
  updatedLabel: string;
  intro: string;
  sections: LegalSection[];
}

export const LEGAL_UPDATED = "2026-11-11";
const PHONE = "+998 77 179 25 75";

/* -------------------------------------------------------------------------- */
/* Privacy policy                                                              */
/* -------------------------------------------------------------------------- */

export const PRIVACY: Record<LangCode, LegalDoc> = {
  uz: {
    title: "Maxfiylik siyosati",
    description: "VIZAR AI qaysi ma’lumotlarni yig‘adi, ularni qayerda saqlaydi, qanday ishlatadi va siz ularni qanday o‘chirishingiz mumkin.",
    updatedLabel: "Kuchga kirgan sana: 11-noyabr, 2026",
    intro:
      "Ushbu siyosat vizarai.com sayti va VIZAR AI platformasi (keyingi o‘rinlarda — «Xizmat») sizning shaxsiy ma’lumotlaringiz bilan qanday ishlashini tushuntiradi. Xizmatdan foydalanib, siz ushbu siyosatga rozilik bildirasiz.",
    sections: [
      {
        id: "operator",
        title: "1. Biz kimmiz",
        body: [
          "Xizmat «VIZAR-TOUR» mas’uliyati cheklangan jamiyatining (STIR 312 317 579, turistik faoliyat litsenziyasi № 964533) rasmiy loyihasi hisoblanadi. Shaxsiy ma’lumotlaringiz egasi va ularga ishlov beruvchi — «VIZAR-TOUR» MCHJ, Toshkent shahri, O‘zbekiston.",
          `Maxfiylik bo‘yicha savollar uchun: telefon ${PHONE}.`,
        ],
      },
      {
        id: "collect",
        title: "2. Qaysi ma’lumotlarni yig‘amiz",
        body: [
          "Faqat Xizmat ishlashi uchun kerak bo‘lgan ma’lumotlarni yig‘amiz:",
          [
            "Hisob ma’lumotlari: email manzil va parol (parol ochiq holda saqlanmaydi — uni autentifikatsiya xizmati shifrlangan ko‘rinishda saqlaydi).",
            "Google orqali kirsangiz: Google bergan ism, email manzil, profil rasmi havolasi va Google hisobining identifikatori.",
            "Profil: ism, familiya, telefon raqami, profil rasmi, tanlangan til — faqat o‘zingiz kiritsangiz.",
            "Viza tayyorgarligi ma’lumotlari: yo‘nalish va viza turi, safar maqsadi va sanasi, viza tahlilidagi javoblaringiz, hujjat tayyorgarligi testidagi javoblaringiz, shaxsiy checklist belgilari va o‘zingiz qo‘shgan bandlar, suhbat mashqi javoblari va natijalari, tavsiyalar, bildirishnomalar va hisobotlar.",
            "Mutaxassis konsultatsiyasi yoki tarif so‘rovi yuborsangiz: so‘rov matni va siz qoldirgan aloqa ma’lumoti.",
            "Sharh yozsangiz: ismingiz, matn, baho va (ixtiyoriy) rasm.",
            "Texnik ma’lumotlar: suiiste’molni oldini olish uchun IP manzil vaqtincha ishlatiladi; sahifalarga tashriflar cookie’siz, umumlashtirilgan statistika sifatida hisoblanadi.",
          ],
          "Hujjat fayllarini yuklash hozircha yopiq. Ilgari yuklangan fayllar bo‘lsa, ular yopiq (private) omborda saqlanadi va faqat sizga ko‘rinadi.",
        ],
      },
      {
        id: "use",
        title: "3. Ma’lumotlardan qanday foydalanamiz",
        body: [
          [
            "Hisobingizni yaratish, sizni tanib olish va hisobingizni himoya qilish.",
            "Viza tayyorgarligi vositalarini ishlatish: checklist, tayyorgarlik bali, tahlil, test, suhbat mashqi va tavsiyalar.",
            "Siz so‘ragan konsultatsiya va so‘rovlarga javob berish.",
            "Xizmat xavfsizligini ta’minlash, xatolarni tuzatish va uni yaxshilash (umumlashtirilgan statistika asosida).",
          ],
          "Ma’lumotlaringizni sotmaymiz, reklama uchun ishlatmaymiz va ular asosida sizga reklama ko‘rsatmaymiz.",
        ],
      },
      {
        id: "google",
        title: "4. Google orqali kirish",
        body: [
          "«Google orqali kirish» tugmasini bossangiz, Google sizdan ruxsat so‘raydi va bizga faqat asosiy profil ma’lumotlarini beradi: ism, email manzil, profil rasmi havolasi va hisob identifikatori. Google parolingiz, kontaktlaringiz, pochta xatlaringiz yoki Google Drive fayllaringizga kirish huquqini olmaymiz.",
          "Bu ma’lumotlar faqat sizni tizimga kiritish, hisobingizni yaratish va dashboard’da ismingiz bilan murojaat qilish uchun ishlatiladi. Google’dan olingan ma’lumotlardan foydalanish Google API Services User Data Policy, jumladan Limited Use talablariga mos keladi: ular uchinchi shaxslarga uzatilmaydi, sotilmaydi va reklama uchun ishlatilmaydi.",
          "Ruxsatni istalgan vaqtda Google hisobingiz sozlamalarida («Third-party apps & services») bekor qilishingiz mumkin.",
        ],
      },
      {
        id: "storage",
        title: "5. Ma’lumotlar qayerda saqlanadi va kim ishlov beradi",
        body: [
          "Xizmat ishonchli infratuzilma provayderlaridan foydalanadi. Ular ma’lumotlaringizga faqat bizning topshirig‘imiz bilan, Xizmatni ishlatish uchun ishlov beradi:",
          [
            "Supabase — hisoblar va autentifikatsiya, ma’lumotlar bazasi va fayl ombori. Ma’lumotlar Yaponiyadagi (Tokio, ap-northeast-1) serverlarda saqlanadi va diskda shifrlangan.",
            "Vercel — saytni joylashtirish va server funksiyalari (Tokio mintaqasi), shuningdek cookie’siz, umumlashtirilgan tashriflar statistikasi (Vercel Web Analytics).",
            "Google — faqat «Google orqali kirish» uchun.",
            "Anthropic (AQSH) — faqat AI beta ishtirokchilari uchun: Claude yozma maslahatchisi va ovozli suhbat bahosi.",
            "OpenAI (AQSH) — faqat AI beta ishtirokchilari uchun: jonli ovozli suhbat mashqi.",
          ],
          "Shu sababli ma’lumotlaringiz O‘zbekistondan tashqarida — Yaponiyada saqlanadi. Hujjat tekshiruvini kelajakda O‘zbekistondagi serverga o‘tkazish rejalashtirilgan; bu amalga oshsa, siyosat yangilanadi.",
          "AI beta (ko‘pi bilan 25 ta taklif qilingan foydalanuvchi): yozma savollaringiz, hujjat tayyorgarligi testidagi javoblaringiz va kitobdan tegishli parchalar javob tayyorlash uchun Anthropic’ga (AQSH) yuboriladi. Ovozli suhbatda ovozingiz jonli ravishda OpenAI’ga (AQSH) uzatiladi; biz ovozni yozib olmaymiz. Suhbat matni yakuniy baho uchun bir marta Anthropic’ga yuboriladi va bizda saqlanmaydi — faqat suhbat vaqti, sozlamalari, xarajati va bahosi saqlanadi. Bu provayderlar so‘rovlarni o‘z siyosatlariga ko‘ra suiiste’molni kuzatish uchun cheklangan muddat saqlashi mumkin. Suhbatda pasport raqami, JShShIR yoki bank ma’lumotlarini aytmang.",
          "Beta’da ishtirok etmaydigan foydalanuvchilarning shaxsiy ma’lumotlari hech qanday tashqi sun’iy intellekt (AI) xizmatiga yuborilmaydi.",
        ],
      },
      {
        id: "sharing",
        title: "6. Ma’lumotlarni kimga ulashamiz",
        body: [
          "Ma’lumotlaringizni uchinchi shaxslarga bermaymiz, quyidagi hollar bundan mustasno:",
          [
            "Yuqorida ko‘rsatilgan infratuzilma provayderlari — faqat Xizmatni ishlatish uchun.",
            "Qonunda belgilangan hollarda vakolatli davlat organlarining rasmiy so‘roviga binoan.",
            "Siz o‘zingiz ochiq e’lon qilgan ma’lumot — masalan, e’lon qilgan sharhingiz (ism, matn, rasm) saytda hammaga ko‘rinadi.",
          ],
          "Profil rasmlari va sharh rasmlari ochiq havola orqali ko‘rsatiladi: havolani bilgan har kim rasmni ko‘ra oladi.",
        ],
      },
      {
        id: "visa-data",
        title: "7. Viza ma’lumotlariga ishlov berish",
        body: [
          "Viza tahlili, hujjat tayyorgarligi testi va suhbat mashqi javoblari sizning hisobingizga bog‘lanib saqlanadi va faqat sizga ko‘rinadi (har bir qatorga kirish ma’lumotlar bazasi darajasida cheklangan).",
          "Shaxsiy checklist belgilari va hujjat tayyorgarligi testi javoblari brauzeringizda saqlanadi, tizimga kirgan bo‘lsangiz esa hisobingizga ham yoziladi — shunda ular boshqa qurilmalarda ham ko‘rinadi. Til va mavzu tanlovi faqat brauzeringizda qoladi.",
          "Natijalar sizning javoblaringiz va ochiq qoidalar asosida avtomatik hisoblanadi. Biz hujjatlaringizning haqiqiyligini tekshirmaymiz va natijalar viza berilishi ehtimolini bildirmaydi.",
        ],
      },
      {
        id: "retention",
        title: "8. Saqlash muddati va o‘chirish",
        body: [
          "Ma’lumotlaringiz hisobingiz mavjud ekan saqlanadi.",
          "Hisobingizni istalgan vaqtda o‘zingiz o‘chirishingiz mumkin: Sozlamalar → «Hisobni o‘chirish». Bunda yuklangan fayllaringiz va profil rasmingiz o‘chiriladi, so‘ng hisobingiz va unga bog‘liq barcha yozuvlar (profil, arizalar, tahlillar, testlar, suhbat mashqlari, bildirishnomalar va boshqalar) ma’lumotlar bazasidan butunlay o‘chiriladi. Bu amalni qaytarib bo‘lmaydi.",
          "Infratuzilma provayderining texnik zaxira nusxalarida ma’lumotlar cheklangan muddat qolishi mumkin; ular xizmatda ishlatilmaydi va vaqt o‘tishi bilan o‘chib ketadi.",
          "Brauzeringizda saqlangan ma’lumotlarni brauzer sozlamalaridan sayt ma’lumotlarini tozalash orqali o‘chirishingiz mumkin.",
        ],
      },
      {
        id: "rights",
        title: "9. Sizning huquqlaringiz",
        body: [
          [
            "Ma’lumotlaringizni ko‘rish va tuzatish — Profil va Sozlamalar sahifalarida.",
            "Hisobingiz va ma’lumotlaringizni o‘chirish — Sozlamalar → «Hisobni o‘chirish».",
            "Google ruxsatini bekor qilish — Google hisobingiz sozlamalarida.",
            `Boshqa so‘rovlar (masalan, ma’lumotlaringiz nusxasini olish) — telefon orqali: ${PHONE}.`,
          ],
          "Shuningdek, O‘zbekiston Respublikasining «Shaxsga doir ma’lumotlar to‘g‘risida»gi Qonunida belgilangan boshqa huquqlarga egasiz.",
        ],
      },
      {
        id: "cookies",
        title: "10. Cookie va brauzer xotirasi",
        body: [
          "Reklama yoki kuzatuv cookie’laridan foydalanmaymiz. Faqat zarur cookie va brauzer xotirasi ishlatiladi:",
          [
            "Tizimga kirish sessiyasi cookie’lari — siz kirgan holatingizni saqlash uchun.",
            "Til tanlovi cookie’si (vizar-ai-language) — bir yil davomida.",
            "Brauzer xotirasi (localStorage): mavzu (kunduzgi/tungi), til, tanishuv oynasi ko‘rilgani, checklist belgilari va test javoblari.",
          ],
          "Tashriflar statistikasi (Vercel Web Analytics) cookie ishlatmaydi va sizni alohida shaxs sifatida kuzatmaydi.",
        ],
      },
      {
        id: "security",
        title: "11. Xavfsizlik",
        body: [
          "Barcha ulanishlar HTTPS orqali shifrlanadi; ma’lumotlar bazasi va fayllar provayder tomonidan diskda shifrlanadi; har bir foydalanuvchi faqat o‘z ma’lumotlarini ko‘ra olishi ma’lumotlar bazasi darajasida (Row Level Security) cheklangan. Hech bir tizim mutlaq xavfsizlikni kafolatlay olmaydi, shuning uchun ishonchli parol tanlang va uni hech kimga bermang.",
        ],
      },
      {
        id: "children",
        title: "12. Voyaga yetmaganlar",
        body: [
          "Agar siz 18 yoshga to‘lmagan bo‘lsangiz, Xizmatdan ota-onangiz yoki vasiyingiz roziligi bilan foydalaning.",
        ],
      },
      {
        id: "changes",
        title: "13. O‘zgarishlar",
        body: [
          "Xizmat o‘zgarganda ushbu siyosatni yangilaymiz va yangi sanani sahifa boshida ko‘rsatamiz. Muhim o‘zgarishlar haqida saytda xabar beramiz.",
        ],
      },
      {
        id: "contact",
        title: "14. Aloqa",
        body: [`«VIZAR-TOUR» MCHJ, Toshkent shahri, O‘zbekiston. Telefon: ${PHONE}.`],
      },
    ],
  },

  ru: {
    title: "Политика конфиденциальности",
    description: "Какие данные собирает VIZAR AI, где их хранит, как использует и как вы можете их удалить.",
    updatedLabel: "Дата вступления в силу: 11 ноября 2026 г.",
    intro:
      "Настоящая политика объясняет, как сайт vizarai.com и платформа VIZAR AI (далее — «Сервис») обращаются с вашими персональными данными. Пользуясь Сервисом, вы соглашаетесь с этой политикой.",
    sections: [
      {
        id: "operator",
        title: "1. Кто мы",
        body: [
          "Сервис является официальным проектом ООО «VIZAR-TOUR» (ИНН 312 317 579, лицензия на туристическую деятельность № 964533). Владелец и оператор ваших персональных данных — ООО «VIZAR-TOUR», г. Ташкент, Узбекистан.",
          `По вопросам конфиденциальности: телефон ${PHONE}.`,
        ],
      },
      {
        id: "collect",
        title: "2. Какие данные мы собираем",
        body: [
          "Мы собираем только то, что нужно для работы Сервиса:",
          [
            "Данные аккаунта: email и пароль (пароль не хранится в открытом виде — служба аутентификации хранит его в зашифрованном виде).",
            "При входе через Google: имя, email, ссылка на фото профиля и идентификатор аккаунта Google, которые передаёт Google.",
            "Профиль: имя, фамилия, телефон, фото профиля, выбранный язык — только если вы их указали.",
            "Данные подготовки к визе: направление и тип визы, цель и дата поездки, ваши ответы в анализе визы и в тесте готовности документов, отметки личного чек-листа и добавленные вами пункты, ответы и результаты тренировки интервью, рекомендации, уведомления и отчёты.",
            "Если вы отправили запрос на консультацию или тариф: текст запроса и оставленные контактные данные.",
            "Если вы написали отзыв: имя, текст, оценка и (по желанию) фото.",
            "Технические данные: IP-адрес временно используется для защиты от злоупотреблений; посещения страниц считаются без cookie, в виде обобщённой статистики.",
          ],
          "Загрузка файлов документов сейчас закрыта. Если ранее загруженные файлы есть, они хранятся в закрытом (private) хранилище и видны только вам.",
        ],
      },
      {
        id: "use",
        title: "3. Как мы используем данные",
        body: [
          [
            "Создать ваш аккаунт, узнавать вас при входе и защищать аккаунт.",
            "Обеспечить работу инструментов подготовки к визе: чек-лист, балл готовности, анализ, тест, тренировка интервью и рекомендации.",
            "Отвечать на ваши запросы на консультацию и другие обращения.",
            "Обеспечивать безопасность Сервиса, исправлять ошибки и улучшать его (на основе обобщённой статистики).",
          ],
          "Мы не продаём ваши данные, не используем их для рекламы и не показываем вам рекламу на их основе.",
        ],
      },
      {
        id: "google",
        title: "4. Вход через Google",
        body: [
          "Когда вы нажимаете «Войти через Google», Google запрашивает ваше согласие и передаёт нам только основные данные профиля: имя, email, ссылку на фото профиля и идентификатор аккаунта. Мы не получаем доступа к паролю Google, контактам, почте или файлам Google Drive.",
          "Эти данные используются только для входа, создания аккаунта и обращения к вам по имени в личном кабинете. Использование данных, полученных от Google, соответствует Google API Services User Data Policy, включая требования Limited Use: они не передаются третьим лицам, не продаются и не используются для рекламы.",
          "Вы можете в любой момент отозвать доступ в настройках аккаунта Google («Third-party apps & services»).",
        ],
      },
      {
        id: "storage",
        title: "5. Где хранятся данные и кто их обрабатывает",
        body: [
          "Сервис работает на надёжных инфраструктурных провайдерах. Они обрабатывают ваши данные только по нашему поручению и только для работы Сервиса:",
          [
            "Supabase — аккаунты и аутентификация, база данных и файловое хранилище. Данные хранятся на серверах в Японии (Токио, ap-northeast-1) и зашифрованы на диске.",
            "Vercel — размещение сайта и серверные функции (регион Токио), а также обобщённая статистика посещений без cookie (Vercel Web Analytics).",
            "Google — только для «Войти через Google».",
            "Anthropic (США) — только для участников AI-беты: письменный ИИ-консультант Claude и оценка голосового собеседования.",
            "OpenAI (США) — только для участников AI-беты: живая голосовая тренировка собеседования.",
          ],
          "Поэтому ваши данные хранятся за пределами Узбекистана — в Японии. В будущем планируется перенести проверку документов на сервер в Узбекистане; когда это произойдёт, политика будет обновлена.",
          "AI-бета (не более 25 приглашённых пользователей): ваши письменные вопросы, ответы в тесте готовности документов и подходящие фрагменты книги передаются в Anthropic (США) для подготовки ответа. В голосовом собеседовании ваш голос в реальном времени передаётся в OpenAI (США); мы не записываем голос. Текст разговора один раз передаётся в Anthropic для итоговой оценки и у нас не хранится — сохраняются только время, настройки, стоимость и оценка разговора. Эти провайдеры могут хранить запросы ограниченное время для контроля злоупотреблений согласно своим политикам. Не называйте в разговоре номер паспорта, ПИНФЛ или банковские данные.",
          "Персональные данные пользователей, не участвующих в бете, не передаются ни в какие внешние сервисы искусственного интеллекта (AI).",
        ],
      },
      {
        id: "sharing",
        title: "6. Кому мы передаём данные",
        body: [
          "Мы не передаём ваши данные третьим лицам, за исключением следующих случаев:",
          [
            "Указанные выше инфраструктурные провайдеры — только для работы Сервиса.",
            "По официальному запросу уполномоченных государственных органов в случаях, предусмотренных законом.",
            "Данные, которые вы сами опубликовали, — например, опубликованный вами отзыв (имя, текст, фото) виден всем на сайте.",
          ],
          "Фото профиля и фото к отзывам отображаются по открытой ссылке: любой, у кого есть ссылка, может увидеть изображение.",
        ],
      },
      {
        id: "visa-data",
        title: "7. Обработка визовых данных",
        body: [
          "Ответы в анализе визы, тесте готовности документов и тренировке интервью хранятся в привязке к вашему аккаунту и видны только вам (доступ к каждой строке ограничен на уровне базы данных).",
          "Отметки личного чек-листа и ответы теста готовности документов хранятся в браузере, а если вы вошли в аккаунт — ещё и в аккаунте, чтобы они были видны на других устройствах. Выбор языка и темы остаётся только в браузере.",
          "Результаты рассчитываются автоматически на основе ваших ответов и открытых правил. Мы не проверяем подлинность ваших документов, и результаты не означают вероятность получения визы.",
        ],
      },
      {
        id: "retention",
        title: "8. Срок хранения и удаление",
        body: [
          "Ваши данные хранятся, пока существует ваш аккаунт.",
          "Вы можете в любой момент удалить аккаунт сами: Настройки → «Удалить аккаунт». При этом удаляются загруженные файлы и фото профиля, затем аккаунт и все связанные записи (профиль, заявки, анализы, тесты, тренировки интервью, уведомления и др.) полностью удаляются из базы данных. Это действие необратимо.",
          "В технических резервных копиях инфраструктурного провайдера данные могут оставаться ограниченное время; они не используются в Сервисе и со временем удаляются.",
          "Данные, хранящиеся в браузере, можно удалить, очистив данные сайта в настройках браузера.",
        ],
      },
      {
        id: "rights",
        title: "9. Ваши права",
        body: [
          [
            "Просматривать и исправлять свои данные — на страницах Профиль и Настройки.",
            "Удалить аккаунт и данные — Настройки → «Удалить аккаунт».",
            "Отозвать доступ Google — в настройках аккаунта Google.",
            `Другие запросы (например, копия ваших данных) — по телефону: ${PHONE}.`,
          ],
          "Вы также обладаете другими правами, предусмотренными Законом Республики Узбекистан «О персональных данных».",
        ],
      },
      {
        id: "cookies",
        title: "10. Cookie и память браузера",
        body: [
          "Мы не используем рекламные или отслеживающие cookie. Используются только необходимые cookie и память браузера:",
          [
            "Cookie сессии входа — чтобы сохранять ваш вход в систему.",
            "Cookie выбора языка (vizar-ai-language) — на один год.",
            "Память браузера (localStorage): тема (светлая/тёмная), язык, просмотр приветственного окна, отметки чек-листа и ответы теста.",
          ],
          "Статистика посещений (Vercel Web Analytics) не использует cookie и не отслеживает вас как отдельного человека.",
        ],
      },
      {
        id: "security",
        title: "11. Безопасность",
        body: [
          "Все соединения шифруются по HTTPS; база данных и файлы шифруются провайдером на диске; каждый пользователь видит только свои данные — это ограничено на уровне базы данных (Row Level Security). Ни одна система не даёт абсолютной гарантии безопасности, поэтому выбирайте надёжный пароль и никому его не сообщайте.",
        ],
      },
      {
        id: "children",
        title: "12. Несовершеннолетние",
        body: ["Если вам нет 18 лет, пользуйтесь Сервисом с согласия родителей или опекуна."],
      },
      {
        id: "changes",
        title: "13. Изменения",
        body: [
          "При изменении Сервиса мы обновляем эту политику и указываем новую дату в начале страницы. О существенных изменениях мы сообщаем на сайте.",
        ],
      },
      {
        id: "contact",
        title: "14. Контакты",
        body: [`ООО «VIZAR-TOUR», г. Ташкент, Узбекистан. Телефон: ${PHONE}.`],
      },
    ],
  },

  en: {
    title: "Privacy Policy",
    description: "What VIZAR AI collects, where it is stored, how it is used and how you can delete it.",
    updatedLabel: "Effective date: 11 November 2026",
    intro:
      "This policy explains how the vizarai.com website and the VIZAR AI platform (the “Service”) handle your personal data. By using the Service, you agree to this policy.",
    sections: [
      {
        id: "operator",
        title: "1. Who we are",
        body: [
          "The Service is an official project of VIZAR-TOUR LLC (tax ID 312 317 579, tourism activity licence No. 964533). The controller and operator of your personal data is VIZAR-TOUR LLC, Tashkent, Uzbekistan.",
          `For privacy questions: phone ${PHONE}.`,
        ],
      },
      {
        id: "collect",
        title: "2. What we collect",
        body: [
          "We collect only what the Service needs to work:",
          [
            "Account data: email address and password (the password is never stored in plain text — the authentication service stores it in encrypted form).",
            "If you sign in with Google: the name, email address, profile picture link and Google account identifier that Google provides.",
            "Profile: first name, last name, phone number, profile photo and chosen language — only if you enter them.",
            "Visa preparation data: destination and visa type, purpose and date of travel, your answers in the visa assessment and the document readiness test, your personal checklist ticks and the items you added, interview practice answers and results, recommendations, notifications and reports.",
            "If you send a consultation or plan request: the request text and the contact details you leave.",
            "If you write a review: your name, text, rating and (optionally) a photo.",
            "Technical data: your IP address is used briefly to prevent abuse; page visits are counted without cookies, as aggregated statistics.",
          ],
          "Document file upload is currently closed. Any files uploaded earlier are kept in a private storage bucket and are visible only to you.",
        ],
      },
      {
        id: "use",
        title: "3. How we use it",
        body: [
          [
            "To create your account, recognise you when you sign in and protect your account.",
            "To run the visa preparation tools: checklist, readiness score, assessment, test, interview practice and recommendations.",
            "To answer your consultation requests and other enquiries.",
            "To keep the Service secure, fix errors and improve it (based on aggregated statistics).",
          ],
          "We do not sell your data, use it for advertising, or show you ads based on it.",
        ],
      },
      {
        id: "google",
        title: "4. Sign in with Google",
        body: [
          "When you choose “Sign in with Google”, Google asks for your consent and shares only basic profile information with us: name, email address, profile picture link and account identifier. We get no access to your Google password, contacts, email or Google Drive files.",
          "This information is used only to sign you in, create your account and greet you by name in your dashboard. Our use of information received from Google adheres to the Google API Services User Data Policy, including the Limited Use requirements: it is not transferred to third parties, sold, or used for advertising.",
          "You can revoke access at any time in your Google Account settings (“Third-party apps & services”).",
        ],
      },
      {
        id: "storage",
        title: "5. Where data is stored and who processes it",
        body: [
          "The Service runs on established infrastructure providers. They process your data only on our instructions and only to run the Service:",
          [
            "Supabase — accounts and authentication, database and file storage. Data is stored on servers in Japan (Tokyo, ap-northeast-1) and encrypted at rest.",
            "Vercel — website hosting and server functions (Tokyo region), plus cookie-less aggregated visit statistics (Vercel Web Analytics).",
            "Google — only for “Sign in with Google”.",
            "Anthropic (USA) — AI beta participants only: the Claude written adviser and the voice interview evaluation.",
            "OpenAI (USA) — AI beta participants only: the live voice interview practice.",
          ],
          "Your data is therefore stored outside Uzbekistan, in Japan. We plan to move document checking to a server in Uzbekistan in the future; when that happens, this policy will be updated.",
          "AI beta (at most 25 invited users): your written questions, your answers in the document readiness test and the relevant book passages are sent to Anthropic (USA) to prepare an answer. In the voice interview your voice is streamed live to OpenAI (USA); we do not record it. The conversation text is sent once to Anthropic for the final evaluation and is not stored by us — only the session time, settings, cost and evaluation are kept. These providers may keep requests for a limited time for abuse monitoring under their own policies. Do not say your passport number, PINFL or bank details in the interview.",
          "Personal data of users who are not in the beta is not sent to any external artificial intelligence (AI) service.",
        ],
      },
      {
        id: "sharing",
        title: "6. Who we share data with",
        body: [
          "We do not share your data with third parties, except:",
          [
            "The infrastructure providers listed above — only to run the Service.",
            "Competent government authorities, on an official request, where the law requires it.",
            "Information you chose to make public — for example, a review you published (name, text, photo) is visible to everyone on the site.",
          ],
          "Profile photos and review photos are served from public links: anyone with the link can see the image.",
        ],
      },
      {
        id: "visa-data",
        title: "7. How visa-related data is handled",
        body: [
          "Your answers in the visa assessment, document readiness test and interview practice are stored with your account and visible only to you (access to every row is restricted at the database level).",
          "Your personal checklist ticks and document readiness test answers are kept in your browser and, when you are signed in, saved to your account too, so they appear on your other devices. Your language and theme choices stay in your browser only.",
          "Results are calculated automatically from your answers and published rules. We do not verify the authenticity of your documents, and results do not represent the chance of getting a visa.",
        ],
      },
      {
        id: "retention",
        title: "8. Retention and deletion",
        body: [
          "Your data is kept for as long as your account exists.",
          "You can delete your account yourself at any time: Settings → “Delete account”. This removes your uploaded files and profile photo, then your account and every record linked to it (profile, applications, assessments, tests, interview practice, notifications and more) are permanently deleted from the database. This cannot be undone.",
          "Data may remain for a limited time in the infrastructure provider’s technical backups; it is not used by the Service and expires over time.",
          "Data kept in your browser can be removed by clearing this site’s data in your browser settings.",
        ],
      },
      {
        id: "rights",
        title: "9. Your rights",
        body: [
          [
            "View and correct your data — on the Profile and Settings pages.",
            "Delete your account and data — Settings → “Delete account”.",
            "Revoke Google access — in your Google Account settings.",
            `Other requests (for example, a copy of your data) — by phone: ${PHONE}.`,
          ],
          "You also have the other rights provided by the Law of the Republic of Uzbekistan “On Personal Data”.",
        ],
      },
      {
        id: "cookies",
        title: "10. Cookies and browser storage",
        body: [
          "We use no advertising or tracking cookies. Only necessary cookies and browser storage are used:",
          [
            "Sign-in session cookies — to keep you signed in.",
            "A language cookie (vizar-ai-language) — for one year.",
            "Browser storage (localStorage): theme (light/dark), language, whether you have seen the welcome guide, checklist ticks and test answers.",
          ],
          "Visit statistics (Vercel Web Analytics) use no cookies and do not track you as an individual.",
        ],
      },
      {
        id: "security",
        title: "11. Security",
        body: [
          "All connections are encrypted with HTTPS; the database and files are encrypted at rest by the provider; each user can see only their own data, enforced at the database level (Row Level Security). No system can guarantee absolute security, so choose a strong password and never share it.",
        ],
      },
      {
        id: "children",
        title: "12. Minors",
        body: ["If you are under 18, use the Service with the consent of a parent or guardian."],
      },
      {
        id: "changes",
        title: "13. Changes",
        body: [
          "When the Service changes, we update this policy and show the new date at the top of the page. We announce significant changes on the site.",
        ],
      },
      {
        id: "contact",
        title: "14. Contact",
        body: [`VIZAR-TOUR LLC, Tashkent, Uzbekistan. Phone: ${PHONE}.`],
      },
    ],
  },
};

/* -------------------------------------------------------------------------- */
/* Terms of service                                                            */
/* -------------------------------------------------------------------------- */

export const TERMS: Record<LangCode, LegalDoc> = {
  uz: {
    title: "Foydalanish shartlari",
    description: "VIZAR AI xizmatidan foydalanish qoidalari: xizmat nima qiladi va nima qilmaydi, hisob, mazmun va javobgarlik.",
    updatedLabel: "Kuchga kirgan sana: 11-noyabr, 2026",
    intro:
      "Ushbu shartlar vizarai.com sayti va VIZAR AI platformasidan (keyingi o‘rinlarda — «Xizmat») foydalanish qoidalarini belgilaydi. Ro‘yxatdan o‘tish yoki Xizmatdan foydalanish orqali siz ushbu shartlarni va Maxfiylik siyosatini qabul qilasiz.",
    sections: [
      {
        id: "service",
        title: "1. Xizmat haqida",
        body: [
          "Xizmat «VIZAR-TOUR» MCHJ (STIR 312 317 579, turistik faoliyat litsenziyasi № 964533) tomonidan taqdim etiladi. U vizaga tayyorlanishga yordam beruvchi vositalarni o‘z ichiga oladi: viza tahlili, shaxsiy checklist, hujjat tayyorgarligi testi, tayyorgarlik bali, suhbat mashqi, viza ma’lumotlar bazasi va boshqa vositalar.",
        ],
      },
      {
        id: "no-guarantee",
        title: "2. Xizmat nima emas",
        body: [
          [
            "Xizmat elchixona, konsullik yoki rasmiy viza markazi emas va ularning nomidan ish yuritmaydi.",
            "Xizmat viza berilishini kafolatlamaydi. Viza bo‘yicha yakuniy qarorni har doim tegishli davlatning vakolatli organi qabul qiladi.",
            "Xizmat hujjatlaringizning haqiqiyligini tekshirmaydi. Ballar, foizlar va tavsiyalar siz bergan javoblar hamda umumiy qoidalar asosida avtomatik hisoblanadi va faqat ma’lumot uchun mo‘ljallangan.",
            "Xizmat yuridik maslahat bermaydi.",
          ],
        ],
      },
      {
        id: "accuracy",
        title: "3. Ma’lumotlarning dolzarbligi",
        body: [
          "Viza talablari tez-tez o‘zgaradi. Ma’lumotlarni rasmiy manbalar asosida dolzarb saqlashga harakat qilamiz, ammo ularning to‘liqligi va o‘z vaqtida yangilanishini kafolatlay olmaymiz. Hujjat topshirishdan oldin har doim tegishli elchixona yoki rasmiy viza markazining saytini tekshiring.",
        ],
      },
      {
        id: "account",
        title: "4. Hisob",
        body: [
          [
            "Ro‘yxatdan o‘tishda to‘g‘ri ma’lumot kiriting va hisobingiz xavfsizligi (parol, Google hisobi) uchun o‘zingiz javob berasiz.",
            "Hisobingizdan boshqa shaxs ruxsatsiz foydalanganini sezsangiz, darhol parolni almashtiring va biz bilan bog‘laning.",
            "Hisobingizni istalgan vaqtda Sozlamalar → «Hisobni o‘chirish» orqali o‘chirishingiz mumkin.",
            "Agar siz 18 yoshga to‘lmagan bo‘lsangiz, Xizmatdan ota-onangiz yoki vasiyingiz roziligi bilan foydalaning.",
          ],
        ],
      },
      {
        id: "pricing",
        title: "5. Narx",
        body: [
          "Hozircha ro‘yxatdan o‘tgan foydalanuvchilar Xizmat vositalaridan bepul foydalanadi. Pullik tariflar joriy etilsa, ularning narxi, to‘lov va qaytarish shartlari to‘lovdan oldin alohida e’lon qilinadi; sizning roziligingizsiz hech qanday to‘lov olinmaydi.",
        ],
      },
      {
        id: "conduct",
        title: "6. Ruxsat etilmagan harakatlar",
        body: [
          "Xizmatdan quyidagi maqsadlarda foydalanish taqiqlanadi:",
          [
            "soxta yoki qalbaki hujjatlar tayyorlash, yolg‘on ma’lumot berish yoki boshqa noqonuniy maqsadlarda;",
            "boshqa shaxslarning ma’lumotlarini ularning roziligisiz kiritish;",
            "Xizmat xavfsizligini buzishga, boshqalarning hisoblariga kirishga yoki Xizmatni ortiqcha yuklashga urinish;",
            "Xizmat mazmunini avtomatik vositalar bilan ommaviy nusxalash.",
          ],
          "Bunday holatlarda hisobga kirishni cheklash yoki uni o‘chirish huquqini saqlab qolamiz.",
        ],
      },
      {
        id: "content",
        title: "7. Siz yozgan mazmun",
        body: [
          "Sharh yozib e’lon qilsangiz, u saytda ismingiz va ixtiyoriy rasmingiz bilan darhol ko‘rinadi. Sharhingizni istalgan vaqtda tahrirlashingiz yoki o‘chirishingiz mumkin. Qoidalarga zid sharhlarni yashirish yoki o‘chirish huquqini saqlab qolamiz. Yozgan mazmuningiz uchun o‘zingiz javob berasiz.",
        ],
      },
      {
        id: "ip",
        title: "8. Intellektual mulk",
        body: [
          "Xizmat dizayni, logotip va maskot, matnlar, VIZAR AI viza kitobi va bilimlar bazasi «VIZAR-TOUR» MCHJga tegishli. Ularni ruxsatsiz nusxalash, tarqatish yoki tijorat maqsadida ishlatish taqiqlanadi. Shaxsiy viza tayyorgarligingiz uchun foydalanishingiz mumkin.",
        ],
      },
      {
        id: "third-party",
        title: "9. Uchinchi tomon xizmatlari",
        body: [
          "Xizmatda rasmiy manbalar va boshqa saytlarga havolalar bo‘lishi mumkin. Ularning mazmuni va ishlashi uchun javobgar emasmiz. «Google orqali kirish» Google shartlariga bo‘ysunadi.",
        ],
      },
      {
        id: "availability",
        title: "10. Xizmatning mavjudligi va o‘zgarishi",
        body: [
          "Xizmatni doimiy ishlatishga harakat qilamiz, ammo uzilishlarsiz ishlashini kafolatlamaymiz. Vositalarni qo‘shish, o‘zgartirish yoki to‘xtatishimiz mumkin; ba’zi vositalar sinov bosqichida bo‘lishi mumkin (masalan, hujjat yuklash hozircha yopiq).",
        ],
      },
      {
        id: "liability",
        title: "11. Javobgarlikni cheklash",
        body: [
          "Xizmat «boricha» taqdim etiladi. Qonun ruxsat bergan darajada, Xizmat ma’lumotlari yoki natijalariga tayanib qabul qilingan qarorlar, viza rad etilishi, safar xarajatlari yoki boshqa bilvosita zararlar uchun javobgar emasmiz.",
        ],
      },
      {
        id: "law",
        title: "12. Amaldagi qonunchilik",
        body: [
          "Ushbu shartlar O‘zbekiston Respublikasi qonunchiligiga muvofiq tartibga solinadi. Nizolar avvalo muzokaralar yo‘li bilan, kelishuvga erishilmasa — O‘zbekiston Respublikasining vakolatli sudida hal qilinadi.",
        ],
      },
      {
        id: "changes",
        title: "13. Shartlarning o‘zgarishi",
        body: [
          "Shartlarni yangilashimiz mumkin; yangi sana sahifa boshida ko‘rsatiladi. O‘zgarishlardan keyin Xizmatdan foydalanishni davom ettirish yangi shartlarni qabul qilganingizni bildiradi.",
        ],
      },
      {
        id: "contact",
        title: "14. Aloqa",
        body: [`«VIZAR-TOUR» MCHJ, Toshkent shahri, O‘zbekiston. Telefon: ${PHONE}.`],
      },
    ],
  },

  ru: {
    title: "Условия использования",
    description: "Правила использования VIZAR AI: что сервис делает и чего не делает, аккаунт, контент и ответственность.",
    updatedLabel: "Дата вступления в силу: 11 ноября 2026 г.",
    intro:
      "Настоящие условия определяют правила использования сайта vizarai.com и платформы VIZAR AI (далее — «Сервис»). Регистрируясь или пользуясь Сервисом, вы принимаете эти условия и Политику конфиденциальности.",
    sections: [
      {
        id: "service",
        title: "1. О Сервисе",
        body: [
          "Сервис предоставляется ООО «VIZAR-TOUR» (ИНН 312 317 579, лицензия на туристическую деятельность № 964533). Он включает инструменты подготовки к визе: анализ визы, личный чек-лист, тест готовности документов, балл готовности, тренировку интервью, визовую базу знаний и другие инструменты.",
        ],
      },
      {
        id: "no-guarantee",
        title: "2. Чем Сервис не является",
        body: [
          [
            "Сервис не является посольством, консульством или официальным визовым центром и не действует от их имени.",
            "Сервис не гарантирует выдачу визы. Окончательное решение по визе всегда принимает уполномоченный орган соответствующего государства.",
            "Сервис не проверяет подлинность ваших документов. Баллы, проценты и рекомендации рассчитываются автоматически на основе ваших ответов и общих правил и носят информационный характер.",
            "Сервис не оказывает юридических консультаций.",
          ],
        ],
      },
      {
        id: "accuracy",
        title: "3. Актуальность информации",
        body: [
          "Визовые требования часто меняются. Мы стараемся поддерживать информацию актуальной на основе официальных источников, но не можем гарантировать её полноту и своевременное обновление. Перед подачей документов всегда проверяйте сайт соответствующего посольства или официального визового центра.",
        ],
      },
      {
        id: "account",
        title: "4. Аккаунт",
        body: [
          [
            "Указывайте при регистрации достоверные данные; вы сами отвечаете за безопасность аккаунта (пароль, аккаунт Google).",
            "Если заметили, что кто-то без разрешения пользуется вашим аккаунтом, сразу смените пароль и свяжитесь с нами.",
            "Вы можете в любой момент удалить аккаунт: Настройки → «Удалить аккаунт».",
            "Если вам нет 18 лет, пользуйтесь Сервисом с согласия родителей или опекуна.",
          ],
        ],
      },
      {
        id: "pricing",
        title: "5. Стоимость",
        body: [
          "Сейчас зарегистрированные пользователи пользуются инструментами Сервиса бесплатно. Если будут введены платные тарифы, их стоимость, условия оплаты и возврата будут отдельно объявлены до оплаты; без вашего согласия никакая оплата не взимается.",
        ],
      },
      {
        id: "conduct",
        title: "6. Запрещённые действия",
        body: [
          "Запрещается использовать Сервис для следующего:",
          [
            "подготовки поддельных документов, предоставления ложных сведений или иных незаконных целей;",
            "ввода данных других людей без их согласия;",
            "попыток нарушить безопасность Сервиса, получить доступ к чужим аккаунтам или перегрузить Сервис;",
            "массового копирования содержимого Сервиса автоматическими средствами.",
          ],
          "В таких случаях мы оставляем за собой право ограничить доступ к аккаунту или удалить его.",
        ],
      },
      {
        id: "content",
        title: "7. Ваш контент",
        body: [
          "Если вы публикуете отзыв, он сразу появляется на сайте с вашим именем и, по желанию, фото. Вы можете в любой момент отредактировать или удалить свой отзыв. Мы оставляем за собой право скрыть или удалить отзывы, нарушающие правила. Вы отвечаете за содержание того, что пишете.",
        ],
      },
      {
        id: "ip",
        title: "8. Интеллектуальная собственность",
        body: [
          "Дизайн Сервиса, логотип и маскот, тексты, визовая книга VIZAR AI и база знаний принадлежат ООО «VIZAR-TOUR». Их копирование, распространение или коммерческое использование без разрешения запрещено. Вы можете использовать их для личной подготовки к визе.",
        ],
      },
      {
        id: "third-party",
        title: "9. Сторонние сервисы",
        body: [
          "Сервис может содержать ссылки на официальные источники и другие сайты. Мы не отвечаем за их содержание и работу. «Вход через Google» регулируется условиями Google.",
        ],
      },
      {
        id: "availability",
        title: "10. Доступность и изменение Сервиса",
        body: [
          "Мы стремимся обеспечить постоянную работу Сервиса, но не гарантируем её без перерывов. Мы можем добавлять, изменять или прекращать работу инструментов; некоторые инструменты могут быть в тестовом режиме (например, загрузка документов сейчас закрыта).",
        ],
      },
      {
        id: "liability",
        title: "11. Ограничение ответственности",
        body: [
          "Сервис предоставляется «как есть». В пределах, допускаемых законом, мы не несём ответственности за решения, принятые на основе информации или результатов Сервиса, за отказ в визе, расходы на поездку или иные косвенные убытки.",
        ],
      },
      {
        id: "law",
        title: "12. Применимое право",
        body: [
          "Настоящие условия регулируются законодательством Республики Узбекистан. Споры решаются сначала путём переговоров, а при недостижении согласия — в компетентном суде Республики Узбекистан.",
        ],
      },
      {
        id: "changes",
        title: "13. Изменение условий",
        body: [
          "Мы можем обновлять условия; новая дата указывается в начале страницы. Продолжение использования Сервиса после изменений означает принятие новых условий.",
        ],
      },
      {
        id: "contact",
        title: "14. Контакты",
        body: [`ООО «VIZAR-TOUR», г. Ташкент, Узбекистан. Телефон: ${PHONE}.`],
      },
    ],
  },

  en: {
    title: "Terms of Service",
    description: "The rules for using VIZAR AI: what the service does and does not do, accounts, content and liability.",
    updatedLabel: "Effective date: 11 November 2026",
    intro:
      "These terms set out the rules for using the vizarai.com website and the VIZAR AI platform (the “Service”). By signing up for or using the Service, you accept these terms and the Privacy Policy.",
    sections: [
      {
        id: "service",
        title: "1. About the Service",
        body: [
          "The Service is provided by VIZAR-TOUR LLC (tax ID 312 317 579, tourism activity licence No. 964533). It offers tools to help you prepare for a visa: visa assessment, personal checklist, document readiness test, readiness score, interview practice, a visa knowledge base and other tools.",
        ],
      },
      {
        id: "no-guarantee",
        title: "2. What the Service is not",
        body: [
          [
            "The Service is not an embassy, consulate or official visa centre and does not act on their behalf.",
            "The Service does not guarantee a visa. The final visa decision is always made by the competent authority of the country concerned.",
            "The Service does not verify the authenticity of your documents. Scores, percentages and recommendations are calculated automatically from your answers and general rules and are for information only.",
            "The Service does not give legal advice.",
          ],
        ],
      },
      {
        id: "accuracy",
        title: "3. Accuracy of information",
        body: [
          "Visa requirements change often. We work to keep information current based on official sources, but we cannot guarantee that it is complete or updated in time. Always check the relevant embassy or official visa centre website before you apply.",
        ],
      },
      {
        id: "account",
        title: "4. Your account",
        body: [
          [
            "Provide accurate information when you sign up; you are responsible for keeping your account secure (password, Google account).",
            "If you notice someone using your account without permission, change your password at once and contact us.",
            "You can delete your account at any time: Settings → “Delete account”.",
            "If you are under 18, use the Service with the consent of a parent or guardian.",
          ],
        ],
      },
      {
        id: "pricing",
        title: "5. Price",
        body: [
          "For now, registered users use the Service’s tools free of charge. If paid plans are introduced, their price and payment and refund terms will be announced separately before any payment; no payment is ever taken without your consent.",
        ],
      },
      {
        id: "conduct",
        title: "6. Prohibited use",
        body: [
          "You may not use the Service to:",
          [
            "prepare forged or counterfeit documents, provide false information, or pursue any other unlawful purpose;",
            "enter other people’s data without their consent;",
            "attempt to breach the Service’s security, access other people’s accounts, or overload the Service;",
            "copy the Service’s content in bulk by automated means.",
          ],
          "In such cases we reserve the right to restrict or delete the account.",
        ],
      },
      {
        id: "content",
        title: "7. Your content",
        body: [
          "If you publish a review, it appears on the site at once with your name and, optionally, a photo. You can edit or delete your review at any time. We reserve the right to hide or remove reviews that break the rules. You are responsible for what you write.",
        ],
      },
      {
        id: "ip",
        title: "8. Intellectual property",
        body: [
          "The Service’s design, logo and mascot, texts, the VIZAR AI visa book and knowledge base belong to VIZAR-TOUR LLC. Copying, distributing or using them commercially without permission is prohibited. You may use them for your own visa preparation.",
        ],
      },
      {
        id: "third-party",
        title: "9. Third-party services",
        body: [
          "The Service may link to official sources and other websites. We are not responsible for their content or operation. “Sign in with Google” is subject to Google’s terms.",
        ],
      },
      {
        id: "availability",
        title: "10. Availability and changes",
        body: [
          "We aim to keep the Service running, but we do not guarantee uninterrupted operation. We may add, change or discontinue tools; some tools may be in a test phase (for example, document upload is currently closed).",
        ],
      },
      {
        id: "liability",
        title: "11. Limitation of liability",
        body: [
          "The Service is provided “as is”. To the extent permitted by law, we are not liable for decisions made in reliance on the Service’s information or results, visa refusals, travel costs or other indirect losses.",
        ],
      },
      {
        id: "law",
        title: "12. Governing law",
        body: [
          "These terms are governed by the laws of the Republic of Uzbekistan. Disputes are first resolved by negotiation and, failing agreement, by the competent court of the Republic of Uzbekistan.",
        ],
      },
      {
        id: "changes",
        title: "13. Changes to these terms",
        body: [
          "We may update these terms; the new date is shown at the top of the page. Continuing to use the Service after a change means you accept the new terms.",
        ],
      },
      {
        id: "contact",
        title: "14. Contact",
        body: [`VIZAR-TOUR LLC, Tashkent, Uzbekistan. Phone: ${PHONE}.`],
      },
    ],
  },
};
