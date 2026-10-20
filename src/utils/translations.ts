import { SupportedLang } from '../types';

export const CITIES = [
  // مدن مصر ومناطق القاهرة الجديدة والتجمع
  "القاهرة الجديدة والتجمع الخامس",
  "الرحاب ومدينتي",
  "القاهرة",
  "الجيزة والشيخ زايد وأكتوبر",
  "الشروق وبدر والعبور",
  "الإسكندرية والساحل الشمالي",
  "العين السخنة",
  "جنوب سيناء - شرم الشيخ",
  "البحر الأحمر - الغردقة",
  "السويس",
  "الدقهلية - المنصورة",
  "الإسماعيلية",
  "بورسعيد",
  "الأقصر",
  "أسوان",
  "الغربية - طنطا",
  "المنوفية",
  "القليوبية",
  "الفيوم",
  "بني سويف",
  "المنيا",
  "أسيوط",
  "سوهاج",
  "قنا",
  "كفر الشيخ",
  "دمياط",
  "الشرقية",
  "مطروح",
  // دول أخرى وسياحة عالمية (دليل عالمي)
  "السعودية - الرياض",
  "السعودية - جدة",
  "السعودية - مكة المكرمة",
  "السعودية - المدينة المنورة",
  "الإمارات - دبي",
  "الإمارات - أبوظبي",
  "الإمارات - الشارقة",
  "تركيا - إسطنبول",
  "تركيا - أنطاليا",
  "دليل سياحي عالمي"
];

export const CATEGORIES = [
  "الكل",
  "تاكسي وأجرة",
  "موتوسيكل ودليفري",
  "سيارات ليموزين",
  "أتوبيسات رحلات وسياحة وعمرة",
  "شحن ونقل ثقيل",
  "خبراء",
  "اتوبيس وسيارات مدرسة",
  "عمال ونقل أثاث",
  "حرفيين وصيانة منزلية",
  "سباكة وأدوات صحية",
  "مستلزمات منازل وصناعية",
  "خدمات كمبوندات والتجمع",
  "مطاعم",
  "سندوتشات ووجبات سريعة",
  "خضروات وفواكه",
  "كافيهات",
  "أطباء وعيادات",
  "صيدليات ومستشفيات",
  "علاج طبيعي وتأهيل",
  "كهربائي وصيانة سيارات",
  "معرض سيارات",
  "رحلات وشاليهات",
  "شركات سياحة",
  "شركات استيراد وتصدير",
  "تسوق ومولات",
  "عقارات التجمع والكمبوندات",
  "سيارات ومراكز خدمة",
  "محاسبين قانونيين",
  "محامين",
  "فنادق ومنتجعات",
  "سياحة ورحلات",
  "شركات وتجارة",
  "كل شيء"
];

export const SUBCATEGORIES: Record<string, string[]> = {
  "تاكسي وأجرة": ["الكل", "تاكسي العاصمة والتجمع 🚕", "تاكسي أبيض مطار القاهرة ✈️", "تاكسي نسائي وردي (Pink Taxi) 🌸", "أجرة وسفر بين المحافظات 🛣️", "تاكسي ذكي بالعداد والـ GPS 📡"],
  "موتوسيكل ودليفري": ["الكل", "كابتن سكوتر وموتوسيكل سريع 🛵", "توصيل طرود وأوراق هامة 📦", "دليفري مطاعم ووجبات 🍔", "مشاوير سريعة بالتجمع ⚡", "سكوتر كهربائي وبنزين 🔋"],
  "سيارات ليموزين": ["الكل", "ليموزين مطار القاهرة الدولي 🚘", "سيارات VIP رجال أعمال وفنادق 💼", "سيارات زفاف وأعراس فاخرة 💐", "سفر وسياحة بين المحافظات 🏖️", "مرسيدس وبي إم دبليو بسائق خاص ⭐"],
  "أتوبيسات رحلات وسياحة وعمرة": ["الكل", "أتوبيسات رحلات سياحية 50 راكب 🚌", "ميني باص رحلات وعمرة 🕋", "باصات حج وعمرة مكيفة 🕌", "رحلات شرم الشيخ والغردقة 🌊", "حفلات وسفاري وباصات مرسيدس 🌴"],
  "شحن ونقل ثقيل": ["الكل", "تريلات ونقل بضائع ثقيل 🚚", "نقل عفش وأثاث منزلي 🛋️", "أوناش رفع هيدروليكية 🏗️", "سيارات جامبو ودبابة مغلقة 📦", "شحن بين المحافظات والموانئ 🚢"],
  "خبراء": ["الكل", "استشاريين إدارة وأعمال", "خبراء قانونيون ومحكمين", "خبراء ضرائب ومالية", "خبراء برمجة وتكنولوجيا", "مترجمين معتمدين", "خبراء ديكور وهندسة", "خبراء تغذية ولياقة", "شيفات محترفون"],
  "اتوبيس وسيارات مدرسة": ["الكل", "أتوبيسات مدارس خاصة ودولية", "ميني باص رحلات طلابية", "سيارات فان خاصة للمدارس", "توصيل جامعات ومعاهد", "اشتراكات شهرية وسنوية", "باصات مكيفة ومشرفات أمان", "خدمات نقل حضانات"],
  "عمال ونقل أثاث": ["الكل", "شركات نقل أثاث وعفش", "ونش رفع أثاث هيدروليكي", "فنيين فك وتركيب غرف ومطابخ", "شحن وتوصيل بضائع وطرود", "عمال تشوين ويومية", "تغليف كرتون وحماية أثاث"],
  "حرفيين وصيانة منزلية": ["الكل", "سباكة وصحي", "كهرباء ومفاتيح ذكية", "تكييفات (شحن وصيانة وتركيب)", "نجارة وأثاث وأبواب", "ألوميتال وشبابيك ومطابخ", "نقاشة ودهانات حديثة", "صيانة غسالات وثلاجات وأجهزة", "فني دش وشاشات وكاميرات"],
  "سباكة وأدوات صحية": ["الكل", "محلات بيع سباكة وأدوات صحية", "خلاطات ومحابس ودش", "مواسير ووصلات بوليمر", "فلاتر مياه وصيانة شمعات", "أطقم حمامات وسيراميك", "مضخات ومواتير مياه"],
  "مستلزمات منازل وصناعية": ["الكل", "حدايد وبويات ودهانات", "عدد وأدوات صناعية وكهربائية", "مستلزمات كهرباء وإضاءة ليد", "عوازل أسطح ومواد بناء", "رخام وجرانيت وسيراميك", "أبواب مصفحة وكوالين", "أدوات ومستلزمات حدائق"],
  "خدمات كمبوندات والتجمع": ["الكل", "تنسيق حدائق ولاندسكيب", "تنظيف شقق وفلل وسجاد", "شركات تشطيبات وديكور", "دراي كلين ومغاسل سريعة", "أمن وحراسة وأنظمة مراقبة", "صيانة حمامات سباحة", "خدمات رعاية ومربيات منزلية"],
  "مهن حرة وأطباء": ["الكل", "محاماة وقضايا", "محاسبة وضرائب", "هندسة وديكور", "عيادات وأطباء", "صيدليات ومستشفيات", "معامل تحاليل وأشعة"],
  "خدمات وصيانة": ["الكل", "سباكة وصحي", "كهرباء وتكييف", "نجارة وأثاث", "ميكانيكا وصيانة سيارات", "نقل أثاث وونش", "نظافة وتشطيبات"],
  "تجارية وتسوق": ["الكل", "سوبر ماركت وجملة", "مغاسل ملابس وسجاد", "ملابس وأحذية وعطور", "موبايلات وكمبيوتر", "ذهب ومجوهرات", "قطع غيار وزيوت"],
  "مطاعم وكافيهات": ["الكل", "مشويات وكباب", "بيتزا وفطائر", "كشري ومصري أصيل", "فاست فود وبرجر", "مأكولات سورية", "كافيهات وقهوة مختصة"],
  "سياحة وفنادق مصر": ["الكل", "آثار فرعونية (أهرامات والأقصر)", "شواطئ ومنتجعات (شرم والغردقة)", "فنادق العين السخنة", "سياحة دينية وإسلامية", "واحات ورحلات سفاري"],
  "مطاعم": ["الكل", "مشويات وكباب", "بيتزا وفطائر إيطالية", "مأكولات سورية وشاورما", "أسماك وبحريات", "طواجن ومحاشي", "مطبخ مصري وكشري", "أكل خليجي ومندي"],
  "سندوتشات ووجبات سريعة": ["الكل", "شاورما سوري ولحم", "برجر وسماش", "كريب وحواوشي", "كبدة وسجق بلدي", "سندوتشات فول وطعمية", "سندوتشات جمبري وبحريات", "فاست فود وتيك أواي"],
  "خضروات وفواكه": ["الكل", "خضروات طازجة يومياً", "فواكه وموالح موسمية", "خضار مقطع ومغلف جاهز للطبخ", "تمور ومكسرات", "منتجات مزارع أورجانيك", "عصائر فريش وفواكه"],
  "كافيهات": ["الكل", "قهوة مختصة V60", "كافيهات عائلية بالتجمع", "مشروبات وحلويات", "كافيهات أوبن إير"],
  "فنادق ومنتجعات": ["الكل", "منتجعات العين السخنة", "فنادق 5 نجوم", "شقق مصيفية وفلل", "منتجعات شرم والغردقة", "غرف وأجنحة فاخرة"],
  "فنادق": ["الكل", "منتجعات العين السخنة", "فنادق 5 نجوم", "شقق مصيفية وفلل", "منتجعات شرم والغردقة"],
  "محاسبين قانونيين": ["الكل", "محاسب قانوني معتمد", "مراجعة وتدقيق حسابات", "ضرائب وقيمة مضافة", "تأسيس شركات واستثمار", "دراسات جدوى"],
  "أصحاب حرف": ["الكل", "سباكة وصحي", "كهرباء وتكييف", "نجارة وأثاث", "نقاشة وديكور", "صيانة سيارات", "أجهزة منزلية"],
  "مهن حرة": ["الكل", "محاسب قانوني معتمد", "استشارات هندسية", "تصميم وديكور", "ترجمة معتمدة", "تسويق رقمي"],
  "عقارات التجمع والكمبوندات": ["الكل", "شقق فاخرة للبيع 🏢", "محلات تجارية للبيع 🏪", "مولات ومراكز تسوق استثمارية 🏬", "فلل مستقلة وتاون هاوس 🏡", "شاليهات مصيفية (السخنة والساحل) 🏖️", "شقق للإيجار بالتجمع", "أراضي بيت الوطن والنرجس"],
  "عقارات": ["الكل", "شقق للبيع 🏢", "محلات تجارية 🏪", "مولات تجارية 🏬", "فلل وقصور 🏡", "شاليهات مصايف 🏖️", "شقق للإيجار", "أراضي ومكاتب"],
  "سيارات ومراكز خدمة": ["الكل", "كهربائي صيانة سيارات", "مراكز صيانة التجمع", "غسيل وتلميع سيارات", "بطاريات وإطارات", "زيوت وفلاتر", "سمكرة ودهان", "ونش إنقاذ سريع"],
  "كهربائي وصيانة سيارات": ["الكل", "كهربائي صيانة سيارات", "فحص كمبيوتر وأعطال كهرباء", "صيانة ميكانيكا وعفشة", "شحن تكييف وبطاريات سيارات", "طوارئ وإنقاذ سيارات على الطريق"],
  "معرض سيارات": ["الكل", "معرض سيارات زيرو ومستعمل", "بيع وشراء واستبدال سيارات", "سيارات بالتقسيط المباشر والبنكي", "سيارات SUV وسيدان وكهربائية"],
  "سيارات": ["الكل", "سيارات للبيع (سبتره)", "معارض سيارات", "كهربائي صيانة سيارات", "مراكز صيانة", "قطع غيار وإكسسوارات"],
  "أطباء وعيادات": ["الكل", "عيادة ودكتور", "عيادات باطنة", "أسنان", "عيون وجراحة", "عظام ومفاصل", "أطفال وحديثي الولادة", "جلدية وتجميل", "علاج طبيعي"],
  "صيدليات ومستشفيات": ["الكل", "مستشفى وصيدلية", "مستشفيات تخصصية وطوارئ 24 ساعة", "صيدليات خدمة ليلية وتوصيل", "مراكز أشعة وتحاليل طبية"],
  "علاج طبيعي وتأهيل": ["الكل", "علاج طبيعي وتأهيل", "تأهيل إصابات الملاعب والكسور", "علاج طبيعي للعمود الفقري والغضروف", "جلسات علاج طبيعي منزلية", "تخسيس وتغذية علاجية"],
  "رحلات وشاليهات": ["الكل", "شاليهات للإيجار بالعين السخنة والساحل", "رحلات بحرية ويخوت وسفاري", "رحلات اليوم الواحد والعائلات", "شاليهات ومصايف شرم والغردقة"],
  "شركات سياحة": ["الكل", "شركات سياحة وحج وعمرة", "حجز تذاكر طيران وفنادق", "برامج سياحة داخلية وخارجية", "تأشيرات ورحلات سياحية"],
  "شركات استيراد وتصدير": ["الكل", "استيراد وتصدير وتخليص جمركي", "شحن دولي وبحري وجوي", "توريد مستلزمات ومعدات وبضائع", "تصدير حاصلات ومنتجات مصرية"],
  "أطباء": ["الكل", "عيادة ودكتور", "عيادات باطنة", "أسنان", "عيون وجراحة", "عظام ومفاصل", "أطفال وحديثي الولادة"],
  "سياحة": ["الكل", "رحلات وشاليهات", "شركات سياحة", "رحلات وسفاري", "حج وعمرة", "حجوزات طيران", "شواطئ وبحيرات"],
  "سياحة ورحلات": ["الكل", "رحلات وشاليهات", "شركات سياحة", "رحلات وسفاري", "حج وعمرة", "حجوزات طيران", "شواطئ وبحيرات"],
  "شركات وتجارة": ["الكل", "شركات استيراد وتصدير", "توريدات عمومية", "تجهيزات مكاتب", "خدمات لوجستية"],
};

export interface MajorCategoryCard {
  id: string;
  name: string;
  iconName: string;
  description: string;
  gradient: string;
  categoryFilter: string;
}

export const MAJOR_CATEGORY_CARDS: MajorCategoryCard[] = [
  {
    id: 'school_buses_transport',
    name: 'اتوبيس وسيارات مدرسة',
    iconName: 'Bus',
    description: 'أتوبيسات مدارس خاصة، سيارات فان، نقل جامعات ورحلات طلابية آمنة',
    gradient: 'from-amber-600 via-yellow-600 to-orange-700',
    categoryFilter: 'اتوبيس وسيارات مدرسة'
  },
  {
    id: 'movers_transport',
    name: 'عمال ونقل أثاث',
    iconName: 'Truck',
    description: 'شركات نقل عفش، ونش هيدروليكي، عمال تشوين ويومية بالتجمع',
    gradient: 'from-orange-600 via-amber-700 to-yellow-800',
    categoryFilter: 'عمال ونقل أثاث'
  },
  {
    id: 'craftsmen_home',
    name: 'حرفيين وصيانة منزلية',
    iconName: 'Wrench',
    description: 'سباكة، كهرباء، صيانة تكييفات، نجارة، نقاشة ودهانات، ألوميتال',
    gradient: 'from-amber-600 via-amber-700 to-orange-800',
    categoryFilter: 'حرفيين وصيانة منزلية'
  },
  {
    id: 'plumbing_sanitary',
    name: 'سباكة وأدوات صحية',
    iconName: 'Droplet',
    description: 'محلات بيع سباكة، خلاطات ومحابس، فلاتر مياه، مضخات وأطقم حمامات',
    gradient: 'from-cyan-600 via-teal-700 to-blue-900',
    categoryFilter: 'سباكة وأدوات صحية'
  },
  {
    id: 'home_industrial_supplies',
    name: 'مستلزمات منازل وصناعية',
    iconName: 'Hammer',
    description: 'حدايد وبويات، عدد صناعية وكهربائية، مواد بناء وعوازل بالتجمع',
    gradient: 'from-slate-700 via-zinc-800 to-neutral-900',
    categoryFilter: 'مستلزمات منازل وصناعية'
  },
  {
    id: 'compounds_tagamoa',
    name: 'خدمات كمبوندات والتجمع',
    iconName: 'Home',
    description: 'لاندسكيب وحدائق، نظافة فلل، أمن وحراسة، صيانة مسابح، دراي كلين',
    gradient: 'from-emerald-700 via-green-800 to-teal-950',
    categoryFilter: 'خدمات كمبوندات والتجمع'
  },
  {
    id: 'experts_only',
    name: 'خبراء فقط',
    iconName: 'Award',
    description: 'استشاريين إدارة وأعمال، خبراء قانونيون ومحكمين، خبراء ضرائب وتكنولوجيا',
    gradient: 'from-purple-700 via-violet-800 to-neutral-900',
    categoryFilter: 'خبراء'
  },
  {
    id: 'prof_medical',
    name: 'مهن حرة وأطباء',
    iconName: 'Briefcase',
    description: 'محاماة، محاسبة، استشارات هندسية، عيادات ومستشفيات',
    gradient: 'from-blue-700 via-blue-800 to-indigo-900',
    categoryFilter: 'مهن حرة'
  },
  {
    id: 'food_cafes',
    name: 'مطاعم وكافيهات',
    iconName: 'Utensils',
    description: 'مشويات، بيتزا، كشري، مأكولات بحرية، كافيهات بالتجمع',
    gradient: 'from-rose-700 via-red-800 to-neutral-900',
    categoryFilter: 'مطاعم'
  },
  {
    id: 'trade_shopping',
    name: 'تجارية وتسوق',
    iconName: 'ShoppingBag',
    description: 'سوبر ماركت، سباكة، مستلزمات منازل، ملابس، مولات التجمع',
    gradient: 'from-emerald-700 via-teal-800 to-slate-900',
    categoryFilter: 'تسوق ومولات'
  },
  {
    id: 'tourism_egypt',
    name: 'سياحة وفنادق مصر',
    iconName: 'Compass',
    description: 'الأهرامات، الأقصر، شرم والغردقة، فنادق العين السخنة',
    gradient: 'from-sky-700 via-blue-800 to-neutral-950',
    categoryFilter: 'فنادق ومنتجعات'
  }
];

export const CATEGORY_LABELS_I18N: Record<string, Record<SupportedLang, string>> = {
  "الكل": {
    ar: "الكل",
    en: "All",
    fr: "Tout",
    zh: "全部",
    it: "Tutti",
    ru: "Все",
    uk: "Всі"
  },
  "علاج طبيعي وتأهيل": {
    ar: "علاج طبيعي وتأهيل 🦴",
    en: "Physical Therapy 🦴",
    fr: "Physiothérapie 🦴",
    zh: "物理治疗与康复 🦴",
    it: "Fisioterapia 🦴",
    ru: "Физиотерапия 🦴",
    uk: "Фізіотерапія 🦴"
  },
  "كهربائي وصيانة سيارات": {
    ar: "كهربائي وصيانة سيارات ⚡🚗",
    en: "Auto Electrician & Car Repair ⚡🚗",
    fr: "Électricien & Réparation Auto ⚡🚗",
    zh: "汽车电工与维修 ⚡🚗",
    it: "Elettrauto e Riparazione Auto ⚡🚗",
    ru: "Автоэлектрик и автосервис ⚡🚗",
    uk: "Автоелектрик та ремонт авто ⚡🚗"
  },
  "معرض سيارات": {
    ar: "معرض سيارات 🚘",
    en: "Car Showroom 🚘",
    fr: "Concessionnaire Auto 🚘",
    zh: "汽车展厅 🚘",
    it: "Autosalone 🚘",
    ru: "Автосалон 🚘",
    uk: "Автосалон 🚘"
  },
  "رحلات وشاليهات": {
    ar: "رحلات وشاليهات 🏖️",
    en: "Trips & Chalets 🏖️",
    fr: "Excursions & Chalets 🏖️",
    zh: "旅行与度假屋 🏖️",
    it: "Escursioni e Chalet 🏖️",
    ru: "Поездки и шале 🏖️",
    uk: "Поїздки та шале 🏖️"
  },
  "شركات سياحة": {
    ar: "شركات سياحة ✈️",
    en: "Tourism Companies ✈️",
    fr: "Agences de Tourisme ✈️",
    zh: "旅游公司 ✈️",
    it: "Agenzie Turistiche ✈️",
    ru: "Туристические компании ✈️",
    uk: "Туристичні компанії ✈️"
  },
  "شركات استيراد وتصدير": {
    ar: "شركات استيراد وتصدير 🚢",
    en: "Import & Export Companies 🚢",
    fr: "Sociétés Import-Export 🚢",
    zh: "进出口公司 🚢",
    it: "Import-Export 🚢",
    ru: "Импорт и экспорт 🚢",
    uk: "Імпорт та експорт 🚢"
  },
  "تاكسي وأجرة": {
    ar: "تاكسي وأجرة 🚕",
    en: "Taxi & Cabs 🚕",
    fr: "Taxis & Courses 🚕",
    zh: "出租车与网约车 🚕",
    it: "Taxi e Corse 🚕",
    ru: "Такси и поездки 🚕",
    uk: "Таксі та поїздки 🚕"
  },
  "موتوسيكل ودليفري": {
    ar: "موتوسيكل ودليفري 🛵",
    en: "Motorcycle & Delivery 🛵",
    fr: "Moto & Livraison 🛵",
    zh: "摩托车与快送 🛵",
    it: "Moto e Consegne 🛵",
    ru: "Мотоциклы и доставка 🛵",
    uk: "Мотоцикли та доставка 🛵"
  },
  "سيارات ليموزين": {
    ar: "سيارات ليموزين 🚘",
    en: "Limousine & VIP Cars 🚘",
    fr: "Limousine & VIP 🚘",
    zh: "豪华轿车与贵宾接送 🚘",
    it: "Limousine e VIP 🚘",
    ru: "Лимузины и VIP-авто 🚘",
    uk: "Лімузини та VIP-авто 🚘"
  },
  "أتوبيسات رحلات وسياحة وعمرة": {
    ar: "أتوبيسات رحلات وسياحة وعمرة 🚌",
    en: "Tour & Umrah Buses 🚌",
    fr: "Bus Voyages & Omra 🚌",
    zh: "旅游大巴与朝觐客车 🚌",
    it: "Autobus Turistici e Umrah 🚌",
    ru: "Туристические автобусы и Умра 🚌",
    uk: "Туристичні автобуси та Умра 🚌"
  },
  "شحن ونقل ثقيل": {
    ar: "شحن ونقل ثقيل 🚚",
    en: "Heavy Shipping & Cargo 🚚",
    fr: "Transport Lourd & Fret 🚚",
    zh: "重型货运与托运 🚚",
    it: "Spedizioni e Trasporto Pesante 🚚",
    ru: "Грузоперевозки и фуры 🚚",
    uk: "Вантажоперевезення та фури 🚚"
  },
  "خبراء": {
    ar: "خبراء فقط",
    en: "Experts Only",
    fr: "Experts Uniquement",
    zh: "特邀专家",
    it: "Solo Esperti",
    ru: "Только эксперты",
    uk: "Тільки експерти"
  },
  "خبراء فقط": {
    ar: "خبراء فقط",
    en: "Experts Only",
    fr: "Experts Uniquement",
    zh: "特邀专家",
    it: "Solo Esperti",
    ru: "Только эксперты",
    uk: "Тільки експерти"
  },
  "اتوبيس وسيارات مدرسة": {
    ar: "اتوبيس وسيارات مدرسة",
    en: "School Buses & Cars",
    fr: "Bus & Voitures Scolaires",
    zh: "校车与学生接送",
    it: "Scuolabus e Auto Scolastiche",
    ru: "Школьные автобусы и трансфер",
    uk: "Шкільні автобуси та перевезення"
  },
  "عمال ونقل أثاث": {
    ar: "عمال ونقل أثاث",
    en: "Workers & Moving",
    fr: "Ouvriers & Déménagement",
    zh: "搬家与人工",
    it: "Manovali e Traslochi",
    ru: "Грузчики и переезд",
    uk: "Вантажники та переїзд"
  },
  "حرفيين وصيانة منزلية": {
    ar: "حرفيين وصيانة منزلية",
    en: "Craftsmen & Maintenance",
    fr: "Artisans & Entretien",
    zh: "工匠与家居维修",
    it: "Artigiani e Manutenzione",
    ru: "Мастера и ремонт",
    uk: "Майстри та ремонт"
  },
  "سباكة وأدوات صحية": {
    ar: "سباكة وأدوات صحية",
    en: "Plumbing & Sanitary",
    fr: "Plomberie & Sanitaire",
    zh: "水暖与卫浴",
    it: "Idraulica e Sanitari",
    ru: "Сантехника",
    uk: "Сантехніка"
  },
  "مستلزمات منازل وصناعية": {
    ar: "مستلزمات منازل وصناعية",
    en: "Home & Industrial Supplies",
    fr: "Équipements Maison & Industrie",
    zh: "家居与工业用品",
    it: "Forniture Casa e Industria",
    ru: "Товары для дома и техника",
    uk: "Товари для дому та промислові"
  },
  "خدمات كمبوندات والتجمع": {
    ar: "خدمات كمبوندات والتجمع",
    en: "Tagamoa & Compounds Services",
    fr: "Services Compounds & Tagamoa",
    zh: "聚居区与社区服务",
    it: "Servizi Residenziali e Tagamoa",
    ru: "Услуги в Тагамоа и компаундах",
    uk: "Послуги в Тагамоа та житлових комплексах"
  },
  "مطاعم": {
    ar: "مطاعم",
    en: "Restaurants",
    fr: "Restaurants",
    zh: "餐厅",
    it: "Ristoranti",
    ru: "Рестораны",
    uk: "Ресторани"
  },
  "كافيهات": {
    ar: "كافيهات",
    en: "Cafes",
    fr: "Cafés",
    zh: "咖啡馆",
    it: "Caffè",
    ru: "Кафе",
    uk: "Кафе"
  },
  "أطباء وعيادات": {
    ar: "أطباء وعيادات",
    en: "Doctors & Clinics",
    fr: "Médecins & Cliniques",
    zh: "医生与诊所",
    it: "Medici e Cliniche",
    ru: "Врачи и клиники",
    uk: "Лікарі та клініки"
  },
  "أطباء": {
    ar: "أطباء",
    en: "Doctors",
    fr: "Médecins",
    zh: "医生",
    it: "Medici",
    ru: "Врачи",
    uk: "Лікарі"
  },
  "صيدليات ومستشفيات": {
    ar: "صيدليات ومستشفيات",
    en: "Pharmacies & Hospitals",
    fr: "Pharmacies & Hôpitaux",
    zh: "药房与医院",
    it: "Farmacie e Ospedali",
    ru: "Аптеки и больницы",
    uk: "Аптеки та лікарні"
  },
  "تسوق ومولات": {
    ar: "تسوق ومولات",
    en: "Shopping & Malls",
    fr: "Shopping & Centres",
    zh: "购物与商场",
    it: "Shopping e Centri",
    ru: "Торговые центры",
    uk: "Торгові центри"
  },
  "عقارات التجمع والكمبوندات": {
    ar: "عقارات التجمع والكمبوندات",
    en: "Tagamoa & Compounds Real Estate",
    fr: "Immobilier Tagamoa & Résidences",
    zh: "地产与物业",
    it: "Immobiliare e Residence",
    ru: "Недвижимость и компаунды",
    uk: "Нерухомість та житлові комплекси"
  },
  "عقارات": {
    ar: "عقارات",
    en: "Real Estate",
    fr: "Immobilier",
    zh: "房产",
    it: "Immobiliare",
    ru: "Недвижимость",
    uk: "Нерухомість"
  },
  "سيارات ومراكز خدمة": {
    ar: "سيارات ومراكز خدمة",
    en: "Auto & Service Centers",
    fr: "Auto & Centres de Service",
    zh: "汽车与服务中心",
    it: "Auto e Assistenza",
    ru: "Автосервис и запчасти",
    uk: "Автосервіс та запчастини"
  },
  "سيارات": {
    ar: "سيارات",
    en: "Cars & Auto",
    fr: "Automobile",
    zh: "汽车",
    it: "Automobili",
    ru: "Автомобили",
    uk: "Автомобілі"
  },
  "محاسبين قانونيين": {
    ar: "محاسبين قانونيين",
    en: "Chartered Accountants",
    fr: "Experts-Comptables",
    zh: "注册会计师",
    it: "Commercialisti",
    ru: "Аудиторы и бухгалтеры",
    uk: "Бухгалтери та аудитори"
  },
  "محامين": {
    ar: "محامين",
    en: "Lawyers",
    fr: "Avocats",
    zh: "律师事务所",
    it: "Avvocati",
    ru: "Юристы",
    uk: "Юристи"
  },
  "مهن حرة": {
    ar: "مهن حرة",
    en: "Free Professions",
    fr: "Professions Libérales",
    zh: "专业人士",
    it: "Libere Professioni",
    ru: "Свободные профессии",
    uk: "Вільні професії"
  },
  "أصحاب حرف": {
    ar: "أصحاب حرف",
    en: "Tradesmen & Crafts",
    fr: "Artisans",
    zh: "手艺人",
    it: "Artigiani",
    ru: "Ремесленники",
    uk: "Ремісники"
  },
  "فنادق ومنتجعات": {
    ar: "فنادق ومنتجعات",
    en: "Hotels & Resorts",
    fr: "Hôtels & Complexes",
    zh: "酒店与度假村",
    it: "Hotel e Resort",
    ru: "Отели и курорты",
    uk: "Готелі та курорти"
  },
  "فنادق": {
    ar: "فنادق",
    en: "Hotels",
    fr: "Hôtels",
    zh: "酒店",
    it: "Hotel",
    ru: "Отели",
    uk: "Готелі"
  },
  "سياحة ورحلات": {
    ar: "سياحة ورحلات",
    en: "Tourism & Trips",
    fr: "Tourisme & Voyages",
    zh: "旅游与行程",
    it: "Turismo e Viaggi",
    ru: "Туризм и туры",
    uk: "Туризм та тури"
  },
  "سياحة": {
    ar: "سياحة",
    en: "Tourism",
    fr: "Tourisme",
    zh: "旅游",
    it: "Turismo",
    ru: "Туризм",
    uk: "Туризм"
  },
  "شركات وتجارة": {
    ar: "شركات وتجارة",
    en: "Companies & Trade",
    fr: "Entreprises & Commerce",
    zh: "商业与公司",
    it: "Aziende e Commercio",
    ru: "Компании и бизнес",
    uk: "Компанії та бізнес"
  },
  "كل شيء": {
    ar: "كل شيء",
    en: "Everything",
    fr: "Tout",
    zh: "所有",
    it: "Tutto",
    ru: "Все подряд",
    uk: "Все підряд"
  }
};

export function getCategoryLabel(category: string, lang: SupportedLang = 'ar'): string {
  if (!category) return '';
  const match = CATEGORY_LABELS_I18N[category];
  if (match && match[lang]) {
    return match[lang];
  }
  return category;
}

export function getCityLabel(city: string, lang: SupportedLang = 'ar'): string {
  if (!city) return lang === 'ar' ? 'كل المدن 🇪🇬' : 'All Cities 🇪🇬';
  if (lang === 'ar') return city;
  const map: Record<string, string> = {
    'القاهرة': 'Cairo',
    'القاهرة الجديدة': 'New Cairo',
    'التجمع الخامس': 'Fifth Settlement',
    'التجمع الأول': 'First Settlement',
    'الرحاب': 'Al Rehab',
    'مدينتي': 'Madinaty',
    'مدينة نصر': 'Nasr City',
    'مصر الجديدة': 'Heliopolis',
    'المعادي': 'Maadi',
    'الشيخ زايد': 'Sheikh Zayed',
    '6 أكتوبر': '6th of October',
    'الجيزة': 'Giza',
    'الإسكندرية': 'Alexandria',
    'شرم الشيخ': 'Sharm El Sheikh',
    'الغردقة': 'Hurghada',
    'العين السخنة': 'Ain Sokhna',
    'الساحل الشمالي': 'North Coast',
    'دبي': 'Dubai',
    'أبوظبي': 'Abu Dhabi',
    'الرياض': 'Riyadh',
    'جدة': 'Jeddah',
  };
  return map[city] || city;
}

export const EGYPTIAN_TOURIST_PHRASES = [
  { ar: "بكام ده لو سمحت؟", en: "How much is this please?", ru: "Сколько это стоит?", it: "Quanto costa per favore?" },
  { ar: "عايز تاكسي للأهرامات", en: "I want a taxi to the Pyramids", ru: "Мне нужно такси до пирамид", it: "Vorrei un taxi per le piramidi" },
  { ar: "الحساب كام؟", en: "What is the bill?", ru: "Какой счет?", it: "Quant'è il conto?" },
  { ar: "فين أقرب صيدلية أو مستشفى؟", en: "Where is the nearest pharmacy/hospital?", ru: "Где ближайшая аптека?", it: "Dov'è la farmacia più vicina?" },
  { ar: "شكراً جزيلاً - تسلم إيدك", en: "Thank you very much!", ru: "Большое спасибо!", it: "Grazie mille!" }
];

export const TOURIST_EMERGENCY_NUMBERS = {
  touristPolice: '126', // شرطة السياحة
  ambulance: '123', // الإسعاف
  police: '122', // النجدة
  civilDefense: '180', // المطافئ والحماية المدنية
};

export const DEFAULT_VIDEOS = [
  "https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-41551-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-mechanic-working-on-a-car-engine-42795-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-luxury-hotel-room-43405-large.mp4",
  "https://assets.mixkit.co/videos/preview/mixkit-doctor-explaining-an-x-ray-to-a-patient-43409-large.mp4"
];

export const LANG_LIST: { code: SupportedLang; name: string; nativeName: string; flag: string; dir: 'rtl' | 'ltr' }[] = [
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇪🇬', dir: 'rtl' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', dir: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', dir: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', dir: 'ltr' },
];

export interface TranslationDict {
  appName: string;
  appNameAr: string;
  allCities: string;
  searchPlaceholder: string;
  addBtn: string;
  adminBtn: string;
  all: string;
  remainingFree: string;
  daysLeft: string;
  expired: string;
  verified: string;
  unverified: string;
  call: string;
  whatsapp: string;
  openInMaps: string;
  directions: string;
  servicesAndPrices: string;
  videoGallery: string;
  expiredAlert: string;
  renewNow: string;
  basicPlan: string;
  premiumPlan: string;
  vipPlan: string;
  paymentNote: string;
  copyNumber: string;
  numberCopied: string;
  close: string;
  addTitle: string;
  addSubtitle: string;
  bizName: string;
  selectCategory: string;
  selectCity: string;
  address: string;
  pickOnMap: string;
  description: string;
  phoneOrWa: string;
  additionalPhones: string;
  addPhoneBtn: string;
  dropMedia: string;
  addService: string;
  serviceName: string;
  servicePrice: string;
  excelImport: string;
  choosePackage: string;
  free90Days: string;
  basic199: string;
  premium399: string;
  vip799: string;
  publishNow: string;
  publishedSuccess: string;
  adminTitle: string;
  enterPassword: string;
  passwordPlaceholder: string;
  login: string;
  totalBiz: string;
  activeBiz: string;
  expiredBiz: string;
  searchAdmin: string;
  allStatus: string;
  expiredStatus: string;
  activeStatus: string;
  hide: string;
  show: string;
  extend30: string;
  delete: string;
  soundOn: string;
  soundOff: string;
  noResults: string;
  expiredNotice: string;
  // New features
  nearestToMe: string;
  mostTrusted: string;
  mostPopular: string;
  searchGooglePlaces: string;
  detectLocation: string;
  locationDetected: string;
  locationError: string;
  distanceKm: string;
  ratesAndCurrencies: string;
  ratesTitle: string;
  sponsoredAd: string;
  googleAdsSponsored: string;
  viewDetailsAndPrices: string;
  sortBy: string;
  contactNumbers: string;
}

export const I18N: Record<SupportedLang, TranslationDict> = {
  ar: {
    appName: "E3lanak",
    appNameAr: "انشر إعلانك",
    allCities: "📍 كل المدن",
    searchPlaceholder: "ابحث في انشر إعلانك: مطاعم، خضروات، سندوتشات، شركات، دليفري...",
    addBtn: "+ انشر إعلانك",
    adminBtn: "Admin",
    all: "الكل",
    remainingFree: "متبقي",
    daysLeft: "يوم مجاناً",
    expired: "منتهي الصلاحية",
    verified: "موثق",
    unverified: "غير موثق",
    call: "اتصال",
    whatsapp: "واتساب",
    openInMaps: "فتح في خرائط Google",
    directions: "اتجاهات السير",
    servicesAndPrices: "الخدمات والأسعار",
    videoGallery: "معرض الفيديوهات والصور",
    expiredAlert: "انتهت الفترة المجانية - 90 يوم",
    renewNow: "تجديد الاشتراك الآن",
    basicPlan: "باقة الأساسية",
    premiumPlan: "باقة بريميوم ⭐",
    vipPlan: "باقة VIP 👑",
    paymentNote: "الدفع عبر فودافون كاش أو إنستا باي على الرقم: 01006656669",
    copyNumber: "نسخ الرقم",
    numberCopied: "تم نسخ الرقم بنجاح!",
    close: "إغلاق",
    addTitle: "انشر إعلانك - 90 يوم مجاناً 📢",
    addSubtitle: "صوت 🎤 + خريطة 📍 + هواتف متعددة + سحب وإفلات + CSV",
    bizName: "اسم الإعلان / النشاط التجاري",
    selectCategory: "اختر التصنيف والتخصص",
    selectCity: "اختر المدينة / المحافظة",
    address: "العنوان بالتفصيل",
    pickOnMap: "📍 تحديد على الخريطة",
    description: "الوصف ونبذة عن النشاط (أو اضغط المايك)",
    phoneOrWa: "رقم الهاتف الرئيسي / الواتساب",
    additionalPhones: "أرقام هواتف إضافية (أرضي، خدمة عملاء، فرع ثان)",
    addPhoneBtn: "+ إضافة رقم هاتف",
    dropMedia: "اسحب الفيديوهات والصور هنا أو انقر للاختيار",
    addService: "+ إضافة خدمة / منتج",
    serviceName: "اسم الخدمة أو المنتج",
    servicePrice: "السعر (مثال: 350ج / $7)",
    excelImport: "استيراد بيانات عملاء من ملف Excel أو CSV",
    choosePackage: "اختر خطة الاشتراك",
    free90Days: "🎁 90 يوم مجاناً - 0 ج.م",
    basic199: "Basic 199 ج.م - 10 فيديوهات",
    premium399: "Premium 399 ج.م - 30 فيديو + توثيق ⭐",
    vip799: "VIP 799 ج.م - غير محدود + إعلان مميز 👑",
    publishNow: "انشر إعلانك الآن - يبدأ 90 يوم ⏳",
    publishedSuccess: "✅ تم نشر إعلانك بنجاح لمدة 90 يوم مجاناً!",
    adminTitle: "لوحة تحكم الإدارة E3lanak Admin",
    enterPassword: "أدخل كلمة مرور الإدارة:",
    passwordPlaceholder: "رمز المرور (1234)",
    login: "دخول",
    totalBiz: "إجمالي الأنشطة",
    activeBiz: "نشطة حالياً",
    expiredBiz: "منتهية الصلاحية",
    searchAdmin: "ابحث بالاسم أو المدينة...",
    allStatus: "الكل",
    expiredStatus: "المنتهي فقط",
    activeStatus: "النشط فقط",
    hide: "إخفاء",
    show: "إظهار",
    extend30: "+30 يوم",
    delete: "حذف",
    soundOn: "تشغيل الصوت",
    soundOff: "كتم الصوت",
    noResults: "لا توجد نتائج مطابقة، جرب البحث بكلمات أخرى أو ابحث في Google",
    expiredNotice: "الأنشطة المنتهية مخفية تلقائياً بعد 90 يوم",
    nearestToMe: "📍 الأقرب لموقعي",
    mostTrusted: "⭐ الأكثر ثقة وتوثيقاً",
    mostPopular: "🔥 الأكثر تفاعلاً وشهرة",
    searchGooglePlaces: "بحث في خرائط وأماكن Google 🌐",
    detectLocation: "📍 تحديد موقعي الحالي",
    locationDetected: "تم تحديد موقعك بدقة! جاري ترتيب الأقرب إليك",
    locationError: "تعذر الوصول للموقع. يرجى تفعيل الـ GPS في جهازك",
    distanceKm: "كم منك",
    ratesAndCurrencies: "العملات وأسعار الصرف",
    ratesTitle: "أسعار العملات الرسمية مقابل الجنيه المصري (EGP)",
    sponsoredAd: "إعلان ممول",
    googleAdsSponsored: "إعلان مدعوم من Google Ads",
    viewDetailsAndPrices: "عرض التفاصيل وأرقام التواصل والأسعار",
    sortBy: "ترتيب حسب:",
    contactNumbers: "أرقام التواصل والهواتف:"
  },
  en: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 All Cities",
    searchPlaceholder: "Search E3lanak: school transport, restaurants, vegetables, services, delivery...",
    addBtn: "+ Add Listing",
    adminBtn: "Admin",
    all: "All",
    remainingFree: "Left",
    daysLeft: "days free",
    expired: "Expired",
    verified: "Verified",
    unverified: "Unverified",
    call: "Call",
    whatsapp: "WhatsApp",
    openInMaps: "Google Maps",
    directions: "Directions",
    servicesAndPrices: "Services & Prices",
    videoGallery: "Video & Photo Showcase",
    expiredAlert: "Free trial ended - 90 Days",
    renewNow: "Renew Subscription Now",
    basicPlan: "Basic Plan",
    premiumPlan: "Premium Plan ⭐",
    vipPlan: "VIP Plan 👑",
    paymentNote: "Pay via Vodafone Cash or InstaPay to: 01006656669",
    copyNumber: "Copy Number",
    numberCopied: "Number copied to clipboard!",
    close: "Close",
    addTitle: "Add New Business - 90 Days Free 🎤",
    addSubtitle: "Voice 🎤 + Map 📍 + Multi-Phone + Drag & Drop + CSV",
    bizName: "Business Name",
    selectCategory: "Select Category & Specialty",
    selectCity: "Select City / Governorate",
    address: "Detailed Address",
    pickOnMap: "📍 Pin on Map",
    description: "Description & Bio (or click mic for voice input)",
    phoneOrWa: "Primary Phone / WhatsApp",
    additionalPhones: "Additional Phone Numbers (Landline, Hotline, 2nd branch)",
    addPhoneBtn: "+ Add Phone Number",
    dropMedia: "Drop videos & photos here or click to browse",
    addService: "+ Add Service / Product",
    serviceName: "Service or Product Name",
    servicePrice: "Price (e.g. 350 EGP / $7)",
    excelImport: "Import clients from CSV file",
    choosePackage: "Choose Subscription Plan",
    free90Days: "🎁 90 Days Free - 0 EGP",
    basic199: "Basic 199 EGP - 10 videos",
    premium399: "Premium 399 EGP - 30 videos + Verified ⭐",
    vip799: "VIP 799 EGP - Unlimited + Sponsored Ads 👑",
    publishNow: "Publish Now - Start 90 Days ⏳",
    publishedSuccess: "✅ Business published successfully with 90 free days!",
    adminTitle: "E3lanak Admin Dashboard",
    enterPassword: "Enter Admin Password:",
    passwordPlaceholder: "Password (1234)",
    login: "Login",
    totalBiz: "Total Businesses",
    activeBiz: "Active Now",
    expiredBiz: "Expired",
    searchAdmin: "Search by name or city...",
    allStatus: "All",
    expiredStatus: "Expired only",
    activeStatus: "Active only",
    hide: "Hide",
    show: "Show",
    extend30: "+30 Days",
    delete: "Delete",
    soundOn: "Sound On",
    soundOff: "Mute",
    noResults: "No matching results found. Try other keywords or search Google",
    expiredNotice: "Expired listings automatically hidden after 90 days",
    nearestToMe: "📍 Nearest to Me",
    mostTrusted: "⭐ Most Trusted & Verified",
    mostPopular: "🔥 Most Popular",
    searchGooglePlaces: "Search in Google Maps & Places 🌐",
    detectLocation: "📍 Detect My Location",
    locationDetected: "GPS location detected! Sorting nearest places to you",
    locationError: "Could not access location. Please enable GPS permissions",
    distanceKm: "km away",
    ratesAndCurrencies: "Currencies & Rates",
    ratesTitle: "Official Exchange Rates vs Egyptian Pound (EGP)",
    sponsoredAd: "Sponsored Ad",
    googleAdsSponsored: "Google Ads Sponsored Placement",
    viewDetailsAndPrices: "View details, contact phones & full prices",
    sortBy: "Sort by:",
    contactNumbers: "Contact Phone Numbers:"
  },
  zh: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 所有城市",
    searchPlaceholder: "搜索E3lanak：校车运输、餐厅、蔬菜水果、各类服务...",
    addBtn: "+ 添加商户",
    adminBtn: "管理",
    all: "全部",
    remainingFree: "剩余",
    daysLeft: "天免费",
    expired: "已到期",
    verified: "已认证",
    unverified: "未认证",
    call: "拨打电话",
    whatsapp: "WhatsApp",
    openInMaps: "谷歌地图中打开",
    directions: "导航路线",
    servicesAndPrices: "服务与价格",
    videoGallery: "视频与图片展示",
    expiredAlert: "90天免费试用期已结束",
    renewNow: "立即续订",
    basicPlan: "基础版",
    premiumPlan: "高级版 ⭐",
    vipPlan: "VIP尊享版 👑",
    paymentNote: "通过 Vodafone Cash 或 InstaPay 付款至: 01006656669",
    copyNumber: "复制号码",
    numberCopied: "已成功复制号码！",
    close: "关闭",
    addTitle: "添加新商户 - 90天免费 🎤",
    addSubtitle: "语音 🎤 + 地图 📍 + 多电话 + 拖拽上传 + CSV导入",
    bizName: "商家名称",
    selectCategory: "选择行业和分类",
    selectCity: "选择城市 / 省份",
    address: "详细地址",
    pickOnMap: "📍 地图选点",
    description: "描述与简介（或点击麦克风语音输入）",
    phoneOrWa: "主要联系电话 / WhatsApp",
    additionalPhones: "备用电话号码（座机、分店、客服）",
    addPhoneBtn: "+ 添加联系电话",
    dropMedia: "拖放视频和照片到此处或点击浏览",
    addService: "+ 添加服务或商品",
    serviceName: "服务或商品名称",
    servicePrice: "价格（例如：350 EGP / $7）",
    excelImport: "从CSV表格导入客户",
    choosePackage: "选择订阅套餐",
    free90Days: "🎁 90天免费 - 0 EGP",
    basic199: "基础套餐 199 EGP - 10个视频",
    premium399: "高级套餐 399 EGP - 30个视频 + 认证蓝标 ⭐",
    vip799: "VIP套餐 799 EGP - 无限制 + 谷歌推广广告 👑",
    publishNow: "立即发布 - 开启90天免费 ⏳",
    publishedSuccess: "✅ 商家已成功发布，享有90天免费展示！",
    adminTitle: "E3lanak 后台管理系统",
    enterPassword: "请输入管理员密码：",
    passwordPlaceholder: "密码 (1234)",
    login: "登录",
    totalBiz: "商户总数",
    activeBiz: "当前活跃",
    expiredBiz: "已到期",
    searchAdmin: "按名称或城市搜索...",
    allStatus: "全部状态",
    expiredStatus: "仅到期",
    activeStatus: "仅活跃",
    hide: "隐藏",
    show: "显示",
    extend30: "+30天",
    delete: "删除",
    soundOn: "开启声音",
    soundOff: "静音",
    noResults: "未找到匹配结果，请尝试其他关键词或在谷歌上搜索",
    expiredNotice: "到期商家在90天后自动对公众隐藏",
    nearestToMe: "📍 离我最近",
    mostTrusted: "⭐ 最受信任认证",
    mostPopular: "🔥 最受欢迎热度",
    searchGooglePlaces: "在 Google 地图与地点中搜索 🌐",
    detectLocation: "📍 获取当前GPS位置",
    locationDetected: "已定位！正在按距离为您排序",
    locationError: "无法获取位置，请在设备中允许GPS权限",
    distanceKm: "公里",
    ratesAndCurrencies: "货币与汇率",
    ratesTitle: "埃及镑 (EGP) 官方参考汇率",
    sponsoredAd: "赞助推广",
    googleAdsSponsored: "Google Ads 推荐商户",
    viewDetailsAndPrices: "查看商户详情、电话及全部价格",
    sortBy: "排序方式:",
    contactNumbers: "联系电话列表:"
  },
  it: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 Tutte le città",
    searchPlaceholder: "Cerca su E3lanak: scuolabus, ristoranti, verdure, servizi...",
    addBtn: "+ Aggiungi",
    adminBtn: "Admin",
    all: "Tutto",
    remainingFree: "Rimasti",
    daysLeft: "giorni gratis",
    expired: "Scaduto",
    verified: "Verificato",
    unverified: "Non verificato",
    call: "Chiama",
    whatsapp: "WhatsApp",
    openInMaps: "Apri in Google Maps",
    directions: "Indicazioni stradali",
    servicesAndPrices: "Servizi e Prezzi",
    videoGallery: "Galleria Video e Foto",
    expiredAlert: "Periodo di prova gratuito terminato - 90 giorni",
    renewNow: "Rinnova Abbonamento Ora",
    basicPlan: "Piano Base",
    premiumPlan: "Piano Premium ⭐",
    vipPlan: "Piano VIP 👑",
    paymentNote: "Paga tramite Vodafone Cash o InstaPay al: 01006656669",
    copyNumber: "Copia numero",
    numberCopied: "Numero copiato con successo!",
    close: "Chiudi",
    addTitle: "Aggiungi Nuova Attività - 90 Giorni Gratis 🎤",
    addSubtitle: "Voce 🎤 + Mappa 📍 + Più telefoni + Drag & Drop + CSV",
    bizName: "Nome dell'attività",
    selectCategory: "Seleziona Categoria e Settore",
    selectCity: "Seleziona Città / Governatorato",
    address: "Indirizzo Dettagliato",
    pickOnMap: "📍 Seleziona sulla mappa",
    description: "Descrizione e Bio (o premi il microfono per dettare)",
    phoneOrWa: "Telefono principale / WhatsApp",
    additionalPhones: "Numeri di telefono aggiuntivi (Fisso, Assistenza, Filiale)",
    addPhoneBtn: "+ Aggiungi numero di telefono",
    dropMedia: "Trascina video e foto qui o clicca per caricare",
    addService: "+ Aggiungi servizio o prodotto",
    serviceName: "Nome del servizio / prodotto",
    servicePrice: "Prezzo (es. 350 EGP / 7€)",
    excelImport: "Importa clienti da file CSV",
    choosePackage: "Scegli piano di abbonamento",
    free90Days: "🎁 90 Giorni Gratis - 0 EGP",
    basic199: "Base 199 EGP - 10 video",
    premium399: "Premium 399 EGP - 30 video + Badge Verificato ⭐",
    vip799: "VIP 799 EGP - Illimitato + Sponsor Google Ads 👑",
    publishNow: "Pubblica Ora - Inizia i 90 giorni ⏳",
    publishedSuccess: "✅ Attività pubblicata con successo per 90 giorni gratis!",
    adminTitle: "Pannello Amministrazione E3lanak",
    enterPassword: "Inserisci password amministratore:",
    passwordPlaceholder: "Password (1234)",
    login: "Accedi",
    totalBiz: "Totale attività",
    activeBiz: "Attive",
    expiredBiz: "Scadute",
    searchAdmin: "Cerca per nome o città...",
    allStatus: "Tutti",
    expiredStatus: "Solo scaduti",
    activeStatus: "Solo attivi",
    hide: "Nascondi",
    show: "Mostra",
    extend30: "+30 giorni",
    delete: "Elimina",
    soundOn: "Attiva audio",
    soundOff: "Disattiva audio",
    noResults: "Nessun risultato trovato. Prova con altre parole o cerca su Google",
    expiredNotice: "Le attività scadute sono nascoste automaticamente dopo 90 giorni",
    nearestToMe: "📍 Più vicino a me",
    mostTrusted: "⭐ Più affidabili e verificati",
    mostPopular: "🔥 Più popolari",
    searchGooglePlaces: "Cerca su Google Maps e Luoghi 🌐",
    detectLocation: "📍 Rileva la mia posizione",
    locationDetected: "Posizione GPS rilevata! Ordinamento dei luoghi più vicini",
    locationError: "Impossibile accedere alla posizione. Abilita il GPS",
    distanceKm: "km da te",
    ratesAndCurrencies: "Valute e Tassi di Cambio",
    ratesTitle: "Tassi di cambio ufficiali rispetto alla Lira Egiziana (EGP)",
    sponsoredAd: "Sponsorizzato",
    googleAdsSponsored: "Annuncio Sponsorizzato Google Ads",
    viewDetailsAndPrices: "Visualizza dettagli, contatti e listino prezzi",
    sortBy: "Ordina per:",
    contactNumbers: "Numeri di contatto telefonico:"
  },
  fr: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 Toutes les villes",
    searchPlaceholder: "Rechercher sur E3lanak: transport scolaire, restaurants, légumes, services...",
    addBtn: "+ Ajouter",
    adminBtn: "Admin",
    all: "Tous",
    remainingFree: "Restant",
    daysLeft: "jours gratuits",
    expired: "Expiré",
    verified: "Vérifié",
    unverified: "Non vérifié",
    call: "Appeler",
    whatsapp: "WhatsApp",
    openInMaps: "Ouvrir dans Google Maps",
    directions: "Itinéraire",
    servicesAndPrices: "Services et Tarifs",
    videoGallery: "Galerie Vidéos et Photos",
    expiredAlert: "Période d'essai gratuite de 90 jours terminée",
    renewNow: "Renouveler l'abonnement maintenant",
    basicPlan: "Formule Basique",
    premiumPlan: "Formule Premium ⭐",
    vipPlan: "Formule VIP 👑",
    paymentNote: "Paiement via Vodafone Cash ou InstaPay au: 01006656669",
    copyNumber: "Copier le numéro",
    numberCopied: "Numéro copié avec succès !",
    close: "Fermer",
    addTitle: "Ajouter un établissement - 90 Jours Gratuits 🎤",
    addSubtitle: "Vocal 🎤 + Carte 📍 + Multi-Téléphones + Glisser-Déposer + CSV",
    bizName: "Nom de l'établissement",
    selectCategory: "Sélectionner la catégorie et spécialité",
    selectCity: "Sélectionner la ville / gouvernorat",
    address: "Adresse détaillée",
    pickOnMap: "📍 Pointer sur la carte",
    description: "Description (ou dictez via le micro)",
    phoneOrWa: "Téléphone principal / WhatsApp",
    additionalPhones: "Numéros de téléphone supplémentaires (Fixe, SAV, Agence)",
    addPhoneBtn: "+ Ajouter un numéro de téléphone",
    dropMedia: "Déposez vidéos et photos ici ou cliquez pour choisir",
    addService: "+ Ajouter un service / produit",
    serviceName: "Nom du service ou produit",
    servicePrice: "Prix (ex: 350 EGP / 7€)",
    excelImport: "Importer des contacts depuis un fichier CSV",
    choosePackage: "Choisir le forfait d'abonnement",
    free90Days: "🎁 90 Jours Gratuits - 0 EGP",
    basic199: "Basic 199 EGP - 10 vidéos",
    premium399: "Premium 399 EGP - 30 vidéos + Badge Vérifié ⭐",
    vip799: "VIP 799 EGP - Illimité + Annonce Google Ads 👑",
    publishNow: "Publier Maintenant - 90 jours offerts ⏳",
    publishedSuccess: "✅ Établissement publié avec succès pendant 90 jours gratuits !",
    adminTitle: "Panneau d'Administration E3lanak",
    enterPassword: "Entrez le mot de passe administrateur :",
    passwordPlaceholder: "Mot de passe (1234)",
    login: "Connexion",
    totalBiz: "Total des établissements",
    activeBiz: "Actifs actuellement",
    expiredBiz: "Expirés",
    searchAdmin: "Recherche par nom ou ville...",
    allStatus: "Tous les statuts",
    expiredStatus: "Expirés seulement",
    activeStatus: "Actifs seulement",
    hide: "Masquer",
    show: "Afficher",
    extend30: "+30 jours",
    delete: "Supprimer",
    soundOn: "Activer le son",
    soundOff: "Muet",
    noResults: "Aucun résultat trouvé. Essayez d'autres mots-clés ou cherchez sur Google",
    expiredNotice: "Les fiches expirées sont masquées automatiquement après 90 jours",
    nearestToMe: "📍 Le plus proche de moi",
    mostTrusted: "⭐ Les plus fiables et vérifiés",
    mostPopular: "🔥 Les plus populaires",
    searchGooglePlaces: "Rechercher sur Google Maps et Lieux 🌐",
    detectLocation: "📍 Localiser ma position",
    locationDetected: "Position GPS détectée ! Classement par proximité",
    locationError: "Impossible d'accéder à la position. Activez le GPS",
    distanceKm: "km de vous",
    ratesAndCurrencies: "Devises et Taux de Change",
    ratesTitle: "Taux de change officiels par rapport à la Livre Égyptienne (EGP)",
    sponsoredAd: "Sponsorisé",
    googleAdsSponsored: "Annonce Sponsorisée Google Ads",
    viewDetailsAndPrices: "Voir détails, numéros d'appel et tarifs",
    sortBy: "Trier par :",
    contactNumbers: "Numéros de contact disponibles :"
  },
  ru: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 Все города",
    searchPlaceholder: "Поиск в E3lanak: школьный транспорт, рестораны, овощи, услуги...",
    addBtn: "+ Добавить",
    adminBtn: "Админ",
    all: "Все",
    remainingFree: "Осталось",
    daysLeft: "дней бесплатно",
    expired: "Истек срок",
    verified: "Проверен",
    unverified: "Не проверен",
    call: "Позвонить",
    whatsapp: "WhatsApp",
    openInMaps: "Открыть в Google Maps",
    directions: "Маршрут",
    servicesAndPrices: "Услуги и цены",
    videoGallery: "Галерея видео и фото",
    expiredAlert: "Бесплатный период 90 дней завершен",
    renewNow: "Продлить подписку сейчас",
    basicPlan: "Базовый тариф",
    premiumPlan: "Премиум тариф ⭐",
    vipPlan: "VIP тариф 👑",
    paymentNote: "Оплата через Vodafone Cash или InstaPay на: 01006656669",
    copyNumber: "Скопировать номер",
    numberCopied: "Номер успешно скопирован!",
    close: "Закрыть",
    addTitle: "Добавить бизнес - 90 дней бесплатно 🎤",
    addSubtitle: "Голос 🎤 + Карта 📍 + Несколько телефонов + Drag & Drop + CSV",
    bizName: "Название бизнеса",
    selectCategory: "Выберите категорию и специальность",
    selectCity: "Выберите город / провинцию",
    address: "Подробный адрес",
    pickOnMap: "📍 Указать на карте",
    description: "Описание и информация (или продиктуйте в микрофон)",
    phoneOrWa: "Основной телефон / WhatsApp",
    additionalPhones: "Дополнительные телефоны (городской, горячая линия, филиал)",
    addPhoneBtn: "+ Добавить номер телефона",
    dropMedia: "Перетащите видео и фото сюда или нажмите для выбора",
    addService: "+ Добавить услугу / товар",
    serviceName: "Название услуги или товара",
    servicePrice: "Цена (например: 350 EGP / 700 ₽)",
    excelImport: "Импорт клиентов из CSV файла",
    choosePackage: "Выберите тарифный план",
    free90Days: "🎁 90 дней бесплатно - 0 EGP",
    basic199: "Базовый 199 EGP - 10 видео",
    premium399: "Премиум 399 EGP - 30 видео + Значок проверки ⭐",
    vip799: "VIP 799 EGP - Без ограничений + Реклама Google Ads 👑",
    publishNow: "Опубликовать сейчас - Старт 90 дней ⏳",
    publishedSuccess: "✅ Бизнес успешно опубликован на 90 дней бесплатно!",
    adminTitle: "Панель администратора E3lanak",
    enterPassword: "Введит пароль администратора:",
    passwordPlaceholder: "Пароль (1234)",
    login: "Войти",
    totalBiz: "Всего объектов",
    activeBiz: "Активных сейчас",
    expiredBiz: "Истекших",
    searchAdmin: "Поиск по названию или городу...",
    allStatus: "Все статусы",
    expiredStatus: "Только истекшие",
    activeStatus: "Только активные",
    hide: "Скрыть",
    show: "Показать",
    extend30: "+30 дней",
    delete: "Удалить",
    soundOn: "Включить звук",
    soundOff: "Без звука",
    noResults: "Ничего не найдено. Попробуйте другие слова или поиск в Google",
    expiredNotice: "Истекшие объекты автоматически скрываются после 90 дней",
    nearestToMe: "📍 Ближайшие ко мне",
    mostTrusted: "⭐ Самые надежные и проверенные",
    mostPopular: "🔥 Самые популярные",
    searchGooglePlaces: "Искать в Google Maps и Местах 🌐",
    detectLocation: "📍 Определить мое местоположение",
    locationDetected: "GPS определен! Сортировка ближайших мест к вам",
    locationError: "Не удалось получить доступ к геопозиции. Включите GPS",
    distanceKm: "км от вас",
    ratesAndCurrencies: "Валюты и курсы",
    ratesTitle: "Официальные курсы валют к египетскому фунту (EGP)",
    sponsoredAd: "Реклама",
    googleAdsSponsored: "Рекомендовано Google Ads",
    viewDetailsAndPrices: "Подробнее, контакты и полный прайс-лист",
    sortBy: "Сортировка:",
    contactNumbers: "Контактные телефоны:"
  },
  uk: {
    appName: "E3lanak",
    appNameAr: ".إعلانك",
    allCities: "📍 Усі міста",
    searchPlaceholder: "Пошук у E3lanak: шкільний транспорт, ресторани, овочі, послуги...",
    addBtn: "+ Додати",
    adminBtn: "Адмін",
    all: "Усе",
    remainingFree: "Залишилось",
    daysLeft: "днів безкоштовно",
    expired: "Закінчився термін",
    verified: "Перевірено",
    unverified: "Не перевірено",
    call: "Подзвонити",
    whatsapp: "WhatsApp",
    openInMaps: "Відкрити в Google Maps",
    directions: "Маршрут",
    servicesAndPrices: "Послуги та ціни",
    videoGallery: "Галерея відео та фото",
    expiredAlert: "Безкоштовний пробний період 90 днів закінчився",
    renewNow: "Продовжити підписку зараз",
    basicPlan: "Базовий тариф",
    premiumPlan: "Преміум тариф ⭐",
    vipPlan: "VIP тариф 👑",
    paymentNote: "Оплата через Vodafone Cash або InstaPay на номер: 01006656669",
    copyNumber: "Скопіювати номер",
    numberCopied: "Номер успішно скопійовано!",
    close: "Закрити",
    addTitle: "Додати бізнес - 90 днів безкоштовно 🎤",
    addSubtitle: "Голос 🎤 + Карта 📍 + Кілька телефонів + Drag & Drop + CSV",
    bizName: "Назва бізнесу",
    selectCategory: "Оберіть категорію та спеціальність",
    selectCity: "Оберіть місто / область",
    address: "Детальна адреса",
    pickOnMap: "📍 Вказати на карті",
    description: "Опис та інформація (або продиктуйте в мікрофон)",
    phoneOrWa: "Основний телефон / WhatsApp",
    additionalPhones: "Додаткові телефони (міський, гаряча лінія, філія)",
    addPhoneBtn: "+ Додати номер телефону",
    dropMedia: "Перетягніть відео та фото сюди або натисніть для вибору",
    addService: "+ Додати послугу / товар",
    serviceName: "Назва послуги або товару",
    servicePrice: "Ціна (наприклад: 350 EGP / 300 ₴)",
    excelImport: "Імпорт клієнтів з файлу CSV",
    choosePackage: "Оберіть тарифний план",
    free90Days: "🎁 90 днів безкоштовно - 0 EGP",
    basic199: "Базовий 199 EGP - 10 відео",
    premium399: "Преміум 399 EGP - 30 відео + Значок верифікації ⭐",
    vip799: "VIP 799 EGP - Без обмежень + Google Ads реклама 👑",
    publishNow: "Опублікувати зараз - Старт 90 днів ⏳",
    publishedSuccess: "✅ Бізнес успішно опубліковано на 90 днів безкоштовно!",
    adminTitle: "Панель адміністратора E3lanak",
    enterPassword: "Введіть пароль адміністратора:",
    passwordPlaceholder: "Пароль (1234)",
    login: "Увійти",
    totalBiz: "Всього об'єктів",
    activeBiz: "Активних зараз",
    expiredBiz: "Закінчилися",
    searchAdmin: "Пошук за назвою або містом...",
    allStatus: "Усі статуси",
    expiredStatus: "Лише прострочені",
    activeStatus: "Лише активні",
    hide: "Приховати",
    show: "Показати",
    extend30: "+30 днів",
    delete: "Видалити",
    soundOn: "Увімкнути звук",
    soundOff: "Вимкнути звук",
    noResults: "Нічого не знайдено. Спробуйте інші слова або пошук у Google",
    expiredNotice: "Прострочені об'єкти автоматично приховуються після 90 днів",
    nearestToMe: "📍 Найближчі до мене",
    mostTrusted: "⭐ Найнадійніші та перевірені",
    mostPopular: "🔥 Найпопулярніші",
    searchGooglePlaces: "Шукати в Google Maps та Місцях 🌐",
    detectLocation: "📍 Визначити моє місцезнаходження",
    locationDetected: "GPS визначено! Сортування найближчих місць до вас",
    locationError: "Не вдалося отримати геопозицію. Увімкніть GPS",
    distanceKm: "км від вас",
    ratesAndCurrencies: "Валюти та курси",
    ratesTitle: "Офіційні курси валют до єгипетського фунта (EGP)",
    sponsoredAd: "Реклама",
    googleAdsSponsored: "Рекомендовано Google Ads",
    viewDetailsAndPrices: "Детальніше, контакти та повний прайс-лист",
    sortBy: "Сортувати за:",
    contactNumbers: "Контактні телефони:"
  }
};
