import type { PhraseTable } from "./phrases";

/**
 * "Viza ma'lumotlar bazasi" library (/knowledge-base) and the subscription
 * prompts in the AI assistant: Uzbek source → Russian / English. The book
 * text itself is Uzbek and is not translated.
 */
export const LIBRARY_PHRASES: PhraseTable = {
  /* ----------------------------------------------------------- Access */
  "To‘liq kirish ochiq": { ru: "Полный доступ открыт", en: "Full access is open" },
  "Amal qilish muddati": { ru: "Действует до", en: "Valid until" },
  "Tahririyat a’zosi sifatida barcha bo‘limlar ochiq.": { ru: "Как редактору вам открыты все разделы.", en: "As an editor, every section is open to you." },
  "Obuna faol emas": { ru: "Подписка не активна", en: "No active subscription" },
  "To‘liq matn obunachilar uchun": { ru: "Полный текст — для подписчиков", en: "Full text is for subscribers" },
  "Mundarija va qisqa parchalar hamma uchun ochiq. To‘liq matn Standard (7 kun), Premium (30 kun), Pro (45 kun) va VIP obunasi davomida ochiladi.": {
    ru: "Оглавление и короткие фрагменты открыты всем. Полный текст доступен на время подписки Standard (7 дней), Premium (30 дней), Pro (45 дней) и VIP.",
    en: "The contents and short excerpts are open to everyone. The full text is available for the length of a Standard (7 days), Premium (30 days), Pro (45 days) or VIP subscription.",
  },
  "Obunani faollashtirish": { ru: "Активировать подписку", en: "Activate subscription" },
  "Obuna talab qilinadi": { ru: "Нужна подписка", en: "Subscription required" },
  "Hisobingizda faol obuna yo‘q. Obunani faollashtiring — to‘liq matn obuna muddati davomida ochiq bo‘ladi va muddat tugaganda avtomatik yopiladi.": {
    ru: "В вашем аккаунте нет активной подписки. Активируйте её — полный текст будет открыт на время подписки и закроется автоматически, когда срок истечёт.",
    en: "Your account has no active subscription. Activate one — the full text stays open for the subscription period and closes automatically when it ends.",
  },
  "To‘liq matnni o‘qish uchun hisobingizga kiring va obunani faollashtiring.": {
    ru: "Чтобы читать полный текст, войдите в аккаунт и активируйте подписку.",
    en: "Sign in and activate a subscription to read the full text.",
  },
  "kun": { ru: "дней", en: "days" },
  "Bo‘limlarning to‘liq matni, mamlakat qoidalari va to‘liq javoblar obuna davomida ochiq bo‘ladi.": {
    ru: "Полный текст разделов, правила по странам и полные ответы открыты на время подписки.",
    en: "Full section texts, country rules and complete answers are open for the length of your subscription.",
  },
  "To‘liq javob va kitob matni faol obunada ochiladi (Standard, Premium, Pro yoki VIP). Hozircha savolingizga mos bo‘limlar ko‘rsatildi.": {
    ru: "Полный ответ и текст книги открываются с активной подпиской (Standard, Premium, Pro или VIP). Пока показаны разделы, подходящие к вашему вопросу.",
    en: "The full answer and the book text open with an active subscription (Standard, Premium, Pro or VIP). For now, the sections that match your question are shown.",
  },

  /* ------------------------------------------------------- Navigation */
  "Kutubxona": { ru: "Библиотека", en: "Library" },
  "Boblar": { ru: "Главы", en: "Chapters" },
  "Davlatlar": { ru: "Страны", en: "Countries" },
  "Viza turlari": { ru: "Типы виз", en: "Visa types" },
  "Qidiruv": { ru: "Поиск", en: "Search" },
  "Qidirish": { ru: "Найти", en: "Search" },
  "Kutubxonadan qidirish": { ru: "Поиск по библиотеке", en: "Search the library" },
  "Masalan: Germaniya, 90/180, bank ko‘chirmasi": { ru: "Например: Германия, 90/180, выписка из банка", en: "E.g. Germany, 90/180, bank statement" },
  "Kutubxona hozir ochilmadi": { ru: "Библиотека сейчас недоступна", en: "The library could not be opened" },
  "Birozdan keyin sahifani yangilang.": { ru: "Обновите страницу чуть позже.", en: "Please refresh the page in a moment." },
  "daq": { ru: "мин", en: "min" },
  "daqiqalik o‘qish": { ru: "мин чтения", en: "min read" },
  "Oldingi": { ru: "Предыдущая", en: "Previous" },
  "Keyingi": { ru: "Следующая", en: "Next" },
  "Oldingi bo‘lim": { ru: "Предыдущий раздел", en: "Previous section" },
  "Keyingi bo‘lim": { ru: "Следующий раздел", en: "Next section" },
  "Bob haqida": { ru: "О главе", en: "About this chapter" },

  /* ------------------------------------------------------------- Home */
  "Premium kutubxona": { ru: "Премиум-библиотека", en: "Premium library" },
  "Viza ma’lumotlar bazasi": { ru: "Визовая база знаний", en: "Visa knowledge base" },
  "VIZAR AI kitobining to‘liq matni: viza turlari, hujjatlar, topshirish jarayoni, suhbat va davlatlar bo‘yicha qoidalar — rasmiy manbalar bilan.": {
    ru: "Полный текст книги VIZAR AI: типы виз, документы, подача, собеседование и правила по странам — с официальными источниками.",
    en: "The complete VIZAR AI book: visa types, documents, applying, the interview and country rules — with official sources.",
  },
  "bob": { ru: "глав", en: "chapters" },
  "bo‘lim": { ru: "разделов", en: "sections" },
  "davlat": { ru: "стран", en: "countries" },
  "rasmiy manba": { ru: "официальных источников", en: "official sources" },
  "Kitob": { ru: "Книга", en: "The book" },
  "To‘qqiz bob": { ru: "Девять глав", en: "Nine chapters" },
  "{n} davlat bo‘yicha qoidalar": { ru: "Правила по {n} странам", en: "Rules for {n} countries" },
  "Har bir davlat uchun murojaat yo‘li, hujjatlar va kirish tartibi — rasmiy manbalar havolasi va oxirgi tekshiruv holati bilan.": {
    ru: "Для каждой страны — куда подавать, какие документы и порядок въезда, со ссылками на официальные источники и статусом последней проверки.",
    en: "For each country: where to apply, documents and entry rules, with links to official sources and the latest check status.",
  },
  "Shengen hududi": { ru: "Шенгенская зона", en: "Schengen area" },
  "Shengendan tashqari Yevropa": { ru: "Европа вне Шенгена", en: "Europe outside Schengen" },
  "Amerika va Okeaniya": { ru: "Америка и Океания", en: "Americas and Oceania" },
  "Osiyo va Yaqin Sharq": { ru: "Азия и Ближний Восток", en: "Asia and the Middle East" },
  "Umumiy qoidalar": { ru: "Общие правила", en: "General rules" },
  "qoida": { ru: "правил", en: "rules" },
  "Turistik, biznes, talaba, tranzit, e-Visa va vizasiz kirish: qaysi viza qachon kerakligi va unda nima yozilgani.": {
    ru: "Туристическая, деловая, студенческая, транзитная, e-Visa и безвизовый въезд: какая виза нужна и что в ней написано.",
    en: "Tourist, business, student, transit, e-Visa and visa-free entry: which visa you need and what it says.",
  },
  "Pasport, anketa, bank ko‘chirmasi, ish joyi ma’lumotnomasi, homiylik va safar rejasi — har bir hujjat nimani isbotlashi kerak.": {
    ru: "Паспорт, анкета, выписка из банка, справка с работы, спонсорство и план поездки — что должен доказать каждый документ.",
    en: "Passport, application form, bank statement, employment letter, sponsorship and itinerary — what each document must prove.",
  },
  "Bobni ochish": { ru: "Открыть главу", en: "Open chapter" },
  "Kutubxonaning to‘liq matnini oching": { ru: "Откройте полный текст библиотеки", en: "Unlock the full library" },
  "Savolingiz bormi? AI maslahatchidan so‘rang": { ru: "Есть вопрос? Спросите AI-консультанта", en: "Have a question? Ask the AI consultant" },
  "Maslahatchi shu kitob asosida javob beradi va har bir javob ostida bob hamda manbani ko‘rsatadi.": {
    ru: "Консультант отвечает по этой книге и под каждым ответом указывает главу и источник.",
    en: "The consultant answers from this book and shows the chapter and source under every answer.",
  },

  /* ---------------------------------------------------- Chapter / section */
  "Bu bobning to‘liq matni obunachilar uchun": { ru: "Полный текст этой главы — для подписчиков", en: "This chapter's full text is for subscribers" },
  "Bo‘limning davomi obunachilar uchun": { ru: "Продолжение раздела — для подписчиков", en: "The rest of this section is for subscribers" },

  /* ---------------------------------------------------------- Country */
  "bo‘lim kitobda": { ru: "разделов в книге", en: "sections in the book" },
  "Viza qoidalari": { ru: "Визовые правила", en: "Visa rules" },
  "Yig‘imlar, topshirish joyi va kirish tartibi o‘zgarib turadi. Ariza berishdan oldin rasmiy manbada tekshiring.": {
    ru: "Сборы, место подачи и порядок въезда меняются. Перед подачей проверьте на официальном сайте.",
    en: "Fees, where to apply and entry rules change. Check the official source before you apply.",
  },
  "Oxirgi tekshiruv": { ru: "Последняя проверка", en: "Last checked" },
  "{country} bo‘yicha qoidalar obunachilar uchun": { ru: "Правила по стране {country} — для подписчиков", en: "{country} rules are for subscribers" },
  "Kitobda": { ru: "В книге", en: "In the book" },
  "Bu davlat kitobning umumiy boblarida yoritilgan.": { ru: "Эта страна описана в общих главах книги.", en: "This country is covered in the book's general chapters." },
  "Barcha davlatlar": { ru: "Все страны", en: "All countries" },

  /* ----------------------------------------------------------- Search */
  "Juda ko‘p so‘rov. Birozdan keyin qayta urinib ko‘ring.": { ru: "Слишком много запросов. Попробуйте чуть позже.", en: "Too many requests. Please try again shortly." },
  "Qidiruvda xatolik yuz berdi. Keyinroq qayta urinib ko‘ring.": { ru: "Ошибка поиска. Попробуйте позже.", en: "Search failed. Please try again later." },
  "Davlat, viza turi yoki hujjat nomini yozing — kitobdan mos bo‘limlar va davlat qoidalari topiladi.": {
    ru: "Введите страну, тип визы или документ — найдём подходящие разделы книги и правила по странам.",
    en: "Type a country, visa type or document — we'll find the matching book sections and country rules.",
  },
  "Kitobda bu so‘rovga mos bo‘lim topilmadi. Boshqacha ifodalab ko‘ring.": {
    ru: "В книге нет раздела по этому запросу. Попробуйте сформулировать иначе.",
    en: "No book section matches this search. Try wording it differently.",
  },
  "Kitobdan": { ru: "Из книги", en: "From the book" },
  "Davlat qoidalari": { ru: "Правила стран", en: "Country rules" },
  "Topilgan bo‘limlarni to‘liq o‘qing": { ru: "Читайте найденные разделы полностью", en: "Read the matching sections in full" },
};
