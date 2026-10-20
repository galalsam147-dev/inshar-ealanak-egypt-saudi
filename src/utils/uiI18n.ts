import { SupportedLang } from '../types';

export interface UITranslation {
  // Bottom Nav
  home: string;
  favorites: string;
  nearest: string;
  bookings: string;
  settings: string;

  // TikTok Header Tabs
  forYou: string;
  nearestLoc: string;
  teachersTab: string;
  moversTab: string;
  craftsmenTab: string;
  plumbingTab: string;
  suppliesTab: string;
  compoundsTab: string;
  clinicsTab: string;
  expertsTab: string;
  restaurantsTab: string;
  hotelsTab: string;
  forSaleTab: string;
  settingsFolderBtn: string;
  myLocationBtn: string;

  // Video compression
  videoCompressingTitle: string;
  videoCompressSuccess: string;

  // Reel Feed action bar
  callBtn: string;
  whatsappBtn: string;
  shareBtn: string;
  followBtn: string;
  followingBtn: string;
  orderDeliveryBtn: string;
  bookOnSiteBtn: string;
  bookVisitBtn: string;
  viewDetailsBtn: string;
  subscriberDashboardBtn: string;

  // Settings Folder Modal
  settingsModalTitle: string;
  settingsModalSubtitle: string;
  tabAll: string;
  tabSearch: string;
  tabBusiness: string;
  tabPayment: string;
  tabSystem: string;
  searchFilterTitle: string;
  searchPlaceholder: string;
  cityFilterLabel: string;
  allCitiesOption: string;
  categoryLabel: string;
  sortLabel: string;
  sortNearest: string;
  sortTrusted: string;
  sortPopular: string;
  sortNewest: string;
  bizManageTitle: string;
  free90DaysBadge: string;
  addBizBtnTitle: string;
  addBizBtnSub: string;
  registerUnlistedTitle: string;
  registerUnlistedSub: string;
  adminPanelBtnTitle: string;
  adminPanelBtnSub: string;
  subscriptionsTitle: string;
  officialBankBadge: string;
  bankAccountLabel: string;
  ibanLabel: string;
  vodafoneCashLabel: string;
  instaPayLabel: string;
  viewSubsProgramBtn: string;
  displayLangTitle: string;
  viewModeLabel: string;
  viewModeReelsSub: string;
  viewModeGridSub: string;
  switchToGrid: string;
  switchToReels: string;
  currentCurrencyLabel: string;
  languageLabel: string;
  restoreDefaultsBtn: string;
  applyAndCloseBtn: string;
  footerBrandText: string;
  watchAdsNowBtn: string;

  // Direct Delivery Modal
  directDeliveryTitle: string;
  directFromBizBadge: string;
  deliveryCoverageLabel: string;
  deliveryTimeLabel: string;
  deliveryFeeLabel: string;
  deliveryPhoneLabel: string;
  customerDetailsTitle: string;
  customerNamePlaceholder: string;
  customerAddressPlaceholder: string;
  customerNotesPlaceholder: string;
  selectMenuTitle: string;
  optionalBadge: string;
  phoneCallBtn: string;
  orderWhatsAppBtn: string;
}

export const UI_TRANSLATIONS: Record<SupportedLang, UITranslation> = {
  ar: {
    home: "الرئيسية",
    favorites: "المفضلة",
    nearest: "الأقرب 📍",
    bookings: "الحجوزات",
    settings: "الإعدادات 📁",

    forYou: "لك (For You)",
    nearestLoc: "الأقرب 📍",
    teachersTab: "اتوبيس وسيارات مدرسة 🚌",
    moversTab: "عمال ونقل 🚛",
    craftsmenTab: "حرفيين 🔧",
    plumbingTab: "سباكة 🚰",
    suppliesTab: "مستلزمات منازل 🏗️",
    compoundsTab: "كمبوندات والتجمع 🏡",
    clinicsTab: "عيادات 🩺",
    expertsTab: "خبراء فقط 🎓",
    restaurantsTab: "مطاعم 🍔",
    hotelsTab: "فنادق 🏨",
    forSaleTab: "للبيع 🏷️",
    settingsFolderBtn: "الإعدادات 📁",
    myLocationBtn: "موقعي 📍",

    videoCompressingTitle: "جاري ضغط الفيديو وتقليص الحجم لتسريع التحميل والتوفير...",
    videoCompressSuccess: "تم ضغط الفيديو بنجاح",

    callBtn: "اتصال 📞",
    whatsappBtn: "واتساب 💬",
    shareBtn: "مشاركة ↗️",
    followBtn: "+ متابعة",
    followingBtn: "✓ متابع",
    orderDeliveryBtn: "طلب دليفري 🛵",
    bookOnSiteBtn: "احجز والدفع في المكان 🏨",
    bookVisitBtn: "حجز زيارة 🎟️",
    viewDetailsBtn: "عرض التفاصيل والأسعار",
    subscriberDashboardBtn: "لوحة المشترك 📊",

    settingsModalTitle: "📁 حافظة الإعدادات والخيارات",
    settingsModalSubtitle: "جميع خيارات البحث، التصنيفات، الاشتراكات والخدمات في مجلد واحد",
    tabAll: "🌟 الكل",
    tabSearch: "🔍 البحث والتصنيفات",
    tabBusiness: "📢 إضافة وإدارة النشاط",
    tabPayment: "💳 الاشتراكات والفيزا",
    tabSystem: "⚙️ العرض واللغة",
    searchFilterTitle: "بحث وتصفية الأنشطة:",
    searchPlaceholder: "ابحث بالاسم، النشاط، رقم التليفون، المدينة...",
    cityFilterLabel: "المحافظة أو المدينة في مصر:",
    allCitiesOption: "كل محافظات مصر ومناطق التجمع 🇪🇬",
    categoryLabel: "النشاط التجاري / المهني:",
    sortLabel: "ترتيب النتائج المعروضة:",
    sortNearest: "الأقرب لموقعي",
    sortTrusted: "✓ الأكثر ثقة",
    sortPopular: "🔥 الأكثر شهرة",
    sortNewest: "⚡ الأحدث",
    bizManageTitle: "انشر إعلانك وإدارة الأنشطة التجارية والمهنية:",
    free90DaysBadge: "90 يوماً مجاناً",
    addBizBtnTitle: "+ انشر إعلانك الآن",
    addBizBtnSub: "90 يوماً مجاناً دون أي عمولات",
    registerUnlistedTitle: "🎁 سجل محلاً غير مسجل",
    registerUnlistedSub: "ترحيب مباشر بالواتساب للنشاط",
    adminPanelBtnTitle: "🛡️ لوحة إدارة المنصة",
    adminPanelBtnSub: "دخول المشرف (محمي برمز سري)",
    subscriptionsTitle: "باقات الاشتراكات والتحصيل البنكي المعتمد:",
    officialBankBadge: "بنك مصر",
    bankAccountLabel: "رقم الحساب البنكي المعتمد:",
    ibanLabel: "الآيبان الدولي (IBAN):",
    vodafoneCashLabel: "📱 فودافون كاش:",
    instaPayLabel: "⚡ إنستاباي:",
    viewSubsProgramBtn: "💳 فتح تفاصيل باقات الاشتراكات والفيزا",
    displayLangTitle: "تخصيص طريقة العرض واللغة والعملة:",
    viewModeLabel: "طريقة عرض الإعلانات:",
    viewModeReelsSub: "عرض تيك توك ملء الشاشة مع التفاعل",
    viewModeGridSub: "عرض شبكة المربعات السريعة",
    switchToGrid: "تبديل للشبكة",
    switchToReels: "تبديل لتيك توك",
    currentCurrencyLabel: "العملة الحالية:",
    languageLabel: "اللغة:",
    restoreDefaultsBtn: "استعادة البيانات الافتراضية للبداية",
    applyAndCloseBtn: "تطبيق وإغلاق ✓",
    footerBrandText: "منصة انشر إعلانك • تيك توك الإعلانات والخدمات والتوصيل 🇪🇬",
    watchAdsNowBtn: "مشاهدة الإعلانات الآن 👁️",

    directDeliveryTitle: "طلب دليفري وتوصيل 🛵",
    directFromBizBadge: "مباشر من النشاط",
    deliveryCoverageLabel: "تغطية التوصيل:",
    deliveryTimeLabel: "وقت الوصول:",
    deliveryFeeLabel: "رسوم التوصيل:",
    deliveryPhoneLabel: "رقم الدليفري:",
    customerDetailsTitle: "بياناتك وعنوان التوصيل:",
    customerNamePlaceholder: "اسمك الكريم (اختياري)",
    customerAddressPlaceholder: "عنوان التوصيل بالتفصيل (الشارع، رقم العمارة، الشقة)",
    customerNotesPlaceholder: "أي طلبات أو ملاحظات إضافية بخصوص الأوردر...",
    selectMenuTitle: "اختر من القائمة / الأصناف:",
    optionalBadge: "اختياري",
    phoneCallBtn: "اتصال تليفوني",
    orderWhatsAppBtn: "طلب عبر الواتساب",
  },

  en: {
    home: "Home",
    favorites: "Favorites",
    nearest: "Nearby 📍",
    bookings: "Bookings",
    settings: "Settings 📁",

    forYou: "For You",
    nearestLoc: "Nearby 📍",
    teachersTab: "School Buses & Cars 🚌",
    moversTab: "Movers & Cargo 🚛",
    craftsmenTab: "Craftsmen 🔧",
    plumbingTab: "Plumbing 🚰",
    suppliesTab: "Home & Supplies 🏗️",
    compoundsTab: "Tagamoa & Compounds 🏡",
    clinicsTab: "Clinics 🩺",
    expertsTab: "Experts Only 🎓",
    restaurantsTab: "Food 🍔",
    hotelsTab: "Hotels 🏨",
    forSaleTab: "For Sale 🏷️",
    settingsFolderBtn: "Settings 📁",
    myLocationBtn: "My Location 📍",

    videoCompressingTitle: "Compressing video on-the-fly for faster loading and data saving...",
    videoCompressSuccess: "Video compressed successfully",

    callBtn: "Call 📞",
    whatsappBtn: "WhatsApp 💬",
    shareBtn: "Share ↗️",
    followBtn: "+ Follow",
    followingBtn: "✓ Following",
    orderDeliveryBtn: "Order Delivery 🛵",
    bookOnSiteBtn: "Book - Pay on Site 🏨",
    bookVisitBtn: "Book Visit 🎟️",
    viewDetailsBtn: "View Details & Prices",
    subscriberDashboardBtn: "Dashboard 📊",

    settingsModalTitle: "📁 Settings & Preferences Folder",
    settingsModalSubtitle: "All search options, categories, subscriptions & services in one folder",
    tabAll: "🌟 All",
    tabSearch: "🔍 Search & Categories",
    tabBusiness: "📢 Add & Manage Business",
    tabPayment: "💳 Subscriptions & Bank",
    tabSystem: "⚙️ Display & Language",
    searchFilterTitle: "Search & Filter Listings:",
    searchPlaceholder: "Search by name, business, phone, city...",
    cityFilterLabel: "City or Area in Egypt:",
    allCitiesOption: "All Egypt Cities & Tagamoa Areas 🇪🇬",
    categoryLabel: "Commercial / Professional Activity:",
    sortLabel: "Sort Results:",
    sortNearest: "Nearest to Me",
    sortTrusted: "✓ Most Trusted",
    sortPopular: "🔥 Most Popular",
    sortNewest: "⚡ Newest",
    bizManageTitle: "Add & Manage Business Listings:",
    free90DaysBadge: "90 Days Free",
    addBizBtnTitle: "+ Add Your Business Now",
    addBizBtnSub: "90 days free with zero commissions",
    registerUnlistedTitle: "🎁 Register an Unlisted Shop",
    registerUnlistedSub: "Direct WhatsApp welcome sent to the business",
    adminPanelBtnTitle: "🛡️ Admin Control Panel",
    adminPanelBtnSub: "Admin Access (Protected by PIN)",
    subscriptionsTitle: "Subscription Plans & Official Bank Payment:",
    officialBankBadge: "Banque Misr",
    bankAccountLabel: "Official Bank Account Number:",
    ibanLabel: "International IBAN:",
    vodafoneCashLabel: "📱 Vodafone Cash:",
    instaPayLabel: "⚡ InstaPay:",
    viewSubsProgramBtn: "💳 View Plans & Visa Payment Details",
    displayLangTitle: "Customize View Mode, Language & Currency:",
    viewModeLabel: "Ad Display Mode:",
    viewModeReelsSub: "TikTok Full-Screen Reel Mode with interaction",
    viewModeGridSub: "Fast Grid Cards View",
    switchToGrid: "Switch to Grid",
    switchToReels: "Switch to TikTok",
    currentCurrencyLabel: "Current Currency:",
    languageLabel: "Language:",
    restoreDefaultsBtn: "Reset Data to Defaults",
    applyAndCloseBtn: "Apply & Close ✓",
    footerBrandText: "E3lanak Platform • TikTok of Ads, Services & Delivery 🇪🇬",
    watchAdsNowBtn: "Watch Ads Now 👁️",

    directDeliveryTitle: "Direct Delivery Order 🛵",
    directFromBizBadge: "Direct from Merchant",
    deliveryCoverageLabel: "Coverage Area:",
    deliveryTimeLabel: "Estimated Time:",
    deliveryFeeLabel: "Delivery Fee:",
    deliveryPhoneLabel: "Delivery Phone:",
    customerDetailsTitle: "Your Details & Delivery Address:",
    customerNamePlaceholder: "Your Name (Optional)",
    customerAddressPlaceholder: "Detailed Delivery Address (Street, Building, Flat)",
    customerNotesPlaceholder: "Any special requests or instructions...",
    selectMenuTitle: "Choose from Menu / Items:",
    optionalBadge: "Optional",
    phoneCallBtn: "Direct Phone Call",
    orderWhatsAppBtn: "Order via WhatsApp",
  },

  zh: {
    home: "首页",
    favorites: "收藏",
    nearest: "附近 📍",
    bookings: "预订",
    settings: "设置 📁",

    forYou: "推荐 (For You)",
    nearestLoc: "附近 📍",
    teachersTab: "校车与专车 🚌",
    moversTab: "搬家货运 🚛",
    craftsmenTab: "工匠维修 🔧",
    plumbingTab: "水暖卫浴 🚰",
    suppliesTab: "家居建材 🏗️",
    compoundsTab: "社区服务 🏡",
    clinicsTab: "诊所医疗 🩺",
    expertsTab: "专家顾问 🎓",
    restaurantsTab: "美食 🍔",
    hotelsTab: "酒店 🏨",
    forSaleTab: "出售 🏷️",
    settingsFolderBtn: "设置 📁",
    myLocationBtn: "我的位置 📍",

    videoCompressingTitle: "正在实时压缩视频以加快加载并节省流量...",
    videoCompressSuccess: "视频压缩成功",

    callBtn: "致电 📞",
    whatsappBtn: "微信/WhatsApp 💬",
    shareBtn: "分享 ↗️",
    followBtn: "+ 关注",
    followingBtn: "✓ 已关注",
    orderDeliveryBtn: "外卖配送 🛵",
    bookOnSiteBtn: "预订到店付款 🏨",
    bookVisitBtn: "预约到访 🎟️",
    viewDetailsBtn: "查看详情与价格",
    subscriberDashboardBtn: "数据看板 📊",

    settingsModalTitle: "📁 设置与选项文件夹",
    settingsModalSubtitle: "所有搜索选项、类别、订阅和服务集合在一个文件夹中",
    tabAll: "🌟 全部",
    tabSearch: "🔍 搜索与分类",
    tabBusiness: "📢 发布与管理",
    tabPayment: "💳 订阅与支付",
    tabSystem: "⚙️ 显示与语言",
    searchFilterTitle: "搜索与筛选活动：",
    searchPlaceholder: "输入名称、行业、电话、城市搜索...",
    cityFilterLabel: "埃及省份或城市：",
    allCitiesOption: "埃及全境及新开罗地区 🇪🇬",
    categoryLabel: "商业/专业分类：",
    sortLabel: "排序方式：",
    sortNearest: "距离最近",
    sortTrusted: "✓ 最值得信赖",
    sortPopular: "🔥 最受欢迎",
    sortNewest: "⚡ 最新添加",
    bizManageTitle: "商业与专业信息管理：",
    free90DaysBadge: "90天免费",
    addBizBtnTitle: "+ 立即添加您的企业广告",
    addBizBtnSub: "90天完全免费零佣金",
    registerUnlistedTitle: "🎁 登记未收录商户",
    registerUnlistedSub: "向商家发送欢迎消息",
    adminPanelBtnTitle: "🛡️ 平台管理后台",
    adminPanelBtnSub: "管理员入口（密码保护）",
    subscriptionsTitle: "订阅套餐与官方银行收款：",
    officialBankBadge: "埃及银行 (Banque Misr)",
    bankAccountLabel: "官方银行账号：",
    ibanLabel: "国际IBAN号码：",
    vodafoneCashLabel: "📱 Vodafone Cash：",
    instaPayLabel: "⚡ InstaPay：",
    viewSubsProgramBtn: "💳 查看订阅与Visa支付详情",
    displayLangTitle: "自定义显示模式、语言与货币：",
    viewModeLabel: "广告展示模式：",
    viewModeReelsSub: "抖音全屏交互模式",
    viewModeGridSub: "快捷网格卡片模式",
    switchToGrid: "切换到网格",
    switchToReels: "切换到全屏",
    currentCurrencyLabel: "当前货币：",
    languageLabel: "界面语言：",
    restoreDefaultsBtn: "恢复初始默认数据",
    applyAndCloseBtn: "应用并关闭 ✓",
    footerBrandText: "E3lanak 平台 • 广告与服务社交平台 🇪🇬",
    watchAdsNowBtn: "立即浏览广告 👁️",

    directDeliveryTitle: "直达配送订购 🛵",
    directFromBizBadge: "商家直发",
    deliveryCoverageLabel: "配送范围：",
    deliveryTimeLabel: "预计时间：",
    deliveryFeeLabel: "配送费用：",
    deliveryPhoneLabel: "外卖热线：",
    customerDetailsTitle: "您的信息与送餐地址：",
    customerNamePlaceholder: "您的称呼（可选）",
    customerAddressPlaceholder: "详细配送地址（街道、楼号、房号）",
    customerNotesPlaceholder: "订单备注或特殊要求...",
    selectMenuTitle: "从菜单/项目中选择：",
    optionalBadge: "可选",
    phoneCallBtn: "直接电话订购",
    orderWhatsAppBtn: "通过WhatsApp订购",
  },

  it: {
    home: "Home",
    favorites: "Preferiti",
    nearest: "Vicino 📍",
    bookings: "Prenotazioni",
    settings: "Impostazioni 📁",

    forYou: "Per Te",
    nearestLoc: "Vicino 📍",
    teachersTab: "Scuolabus e Auto 🚌",
    moversTab: "Traslochi 🚛",
    craftsmenTab: "Artigiani 🔧",
    plumbingTab: "Idraulica 🚰",
    suppliesTab: "Forniture Casa 🏗️",
    compoundsTab: "Residence & Tagamoa 🏡",
    clinicsTab: "Cliniche 🩺",
    expertsTab: "Solo Esperti 🎓",
    restaurantsTab: "Cibo 🍔",
    hotelsTab: "Hotel 🏨",
    forSaleTab: "In Vendita 🏷️",
    settingsFolderBtn: "Impostazioni 📁",
    myLocationBtn: "La mia posizione 📍",

    videoCompressingTitle: "Compressione video in corso per velocizzare il caricamento...",
    videoCompressSuccess: "Video compresso con successo",

    callBtn: "Chiama 📞",
    whatsappBtn: "WhatsApp 💬",
    shareBtn: "Condividi ↗️",
    followBtn: "+ Segui",
    followingBtn: "✓ Seguito",
    orderDeliveryBtn: "Ordina a domicilio 🛵",
    bookOnSiteBtn: "Prenota e paga sul posto 🏨",
    bookVisitBtn: "Prenota visita 🎟️",
    viewDetailsBtn: "Dettagli e prezzi",
    subscriberDashboardBtn: "Cruscotto 📊",

    settingsModalTitle: "📁 Cartella Impostazioni & Opzioni",
    settingsModalSubtitle: "Tutte le opzioni di ricerca, categorie e abbonamenti in una cartella",
    tabAll: "🌟 Tutto",
    tabSearch: "🔍 Ricerca & Categorie",
    tabBusiness: "📢 Gestione Attività",
    tabPayment: "💳 Abbonamenti & Banca",
    tabSystem: "⚙️ Visualizzazione & Lingua",
    searchFilterTitle: "Cerca e filtra attività:",
    searchPlaceholder: "Cerca per nome, servizio, telefono, città...",
    cityFilterLabel: "Città in Egitto:",
    allCitiesOption: "Tutte le città dell'Egitto e Tagamoa 🇪🇬",
    categoryLabel: "Attività commerciale:",
    sortLabel: "Ordina risultati:",
    sortNearest: "Più vicino a me",
    sortTrusted: "✓ Più affidabile",
    sortPopular: "🔥 Più popolare",
    sortNewest: "⚡ Più recente",
    bizManageTitle: "Aggiungi e gestisci attività:",
    free90DaysBadge: "90 giorni gratuiti",
    addBizBtnTitle: "+ Aggiungi la tua attività",
    addBizBtnSub: "90 giorni gratis senza commissioni",
    registerUnlistedTitle: "🎁 Registra negozio non presente",
    registerUnlistedSub: "Invia benvenuto diretto su WhatsApp",
    adminPanelBtnTitle: "🛡️ Pannello Amministratore",
    adminPanelBtnSub: "Accesso Admin (protetto da PIN)",
    subscriptionsTitle: "Abbonamenti e pagamento bancario ufficiale:",
    officialBankBadge: "Banque Misr",
    bankAccountLabel: "Numero di conto bancario ufficiale:",
    ibanLabel: "IBAN internazionale:",
    vodafoneCashLabel: "📱 Vodafone Cash:",
    instaPayLabel: "⚡ InstaPay:",
    viewSubsProgramBtn: "💳 Dettagli piani e carta Visa",
    displayLangTitle: "Personalizza vista, lingua e valuta:",
    viewModeLabel: "Modalità di visualizzazione:",
    viewModeReelsSub: "Modalità a schermo intero TikTok con interazione",
    viewModeGridSub: "Visualizzazione rapida a griglia",
    switchToGrid: "Passa a Griglia",
    switchToReels: "Passa a TikTok",
    currentCurrencyLabel: "Valuta attuale:",
    languageLabel: "Lingua:",
    restoreDefaultsBtn: "Ripristina dati predefiniti",
    applyAndCloseBtn: "Applica e chiudi ✓",
    footerBrandText: "Piattaforma E3lanak • TikTok di annunci e servizi 🇪🇬",
    watchAdsNowBtn: "Guarda gli annunci ora 👁️",

    directDeliveryTitle: "Ordine con consegna diretta 🛵",
    directFromBizBadge: "Diretto dall'attività",
    deliveryCoverageLabel: "Copertura:",
    deliveryTimeLabel: "Tempo stimato:",
    deliveryFeeLabel: "Tariffa di consegna:",
    deliveryPhoneLabel: "Telefono consegne:",
    customerDetailsTitle: "I tuoi dati e indirizzo di consegna:",
    customerNamePlaceholder: "Tuo nome (facoltativo)",
    customerAddressPlaceholder: "Indirizzo dettagliato (via, civico, piano)",
    customerNotesPlaceholder: "Istruzioni o note aggiuntive...",
    selectMenuTitle: "Scegli dal menu / articoli:",
    optionalBadge: "Facoltativo",
    phoneCallBtn: "Chiama al telefono",
    orderWhatsAppBtn: "Ordina via WhatsApp",
  },

  fr: {
    home: "Accueil",
    favorites: "Favoris",
    nearest: "À proximité 📍",
    bookings: "Réservations",
    settings: "Paramètres 📁",

    forYou: "Pour Toi",
    nearestLoc: "À proximité 📍",
    teachersTab: "Bus Scolaire & Voitures 🚌",
    moversTab: "Déménagement 🚛",
    craftsmenTab: "Artisans 🔧",
    plumbingTab: "Plomberie 🚰",
    suppliesTab: "Fournitures Maison 🏗️",
    compoundsTab: "Résidences & Tagamoa 🏡",
    clinicsTab: "Cliniques 🩺",
    expertsTab: "Experts Uniquement 🎓",
    restaurantsTab: "Restaurants 🍔",
    hotelsTab: "Hôtels 🏨",
    forSaleTab: "À Vendre 🏷️",
    settingsFolderBtn: "Paramètres 📁",
    myLocationBtn: "Ma position 📍",

    videoCompressingTitle: "Compression vidéo en cours pour accélérer le chargement...",
    videoCompressSuccess: "Vidéo compressée avec succès",

    callBtn: "Appeler 📞",
    whatsappBtn: "WhatsApp 💬",
    shareBtn: "Partager ↗️",
    followBtn: "+ Suivre",
    followingBtn: "✓ Suivi",
    orderDeliveryBtn: "Commander livraison 🛵",
    bookOnSiteBtn: "Réserver - Payer sur place 🏨",
    bookVisitBtn: "Réserver visite 🎟️",
    viewDetailsBtn: "Voir détails et prix",
    subscriberDashboardBtn: "Tableau de bord 📊",

    settingsModalTitle: "📁 Dossier Paramètres & Options",
    settingsModalSubtitle: "Toutes les options de recherche, catégories et abonnements réunis",
    tabAll: "🌟 Tout",
    tabSearch: "🔍 Recherche & Catégories",
    tabBusiness: "📢 Ajouter & Gérer",
    tabPayment: "💳 Abonnements & Banque",
    tabSystem: "⚙️ Affichage & Langue",
    searchFilterTitle: "Rechercher et filtrer les annonces :",
    searchPlaceholder: "Rechercher par nom, activité, téléphone, ville...",
    cityFilterLabel: "Ville en Égypte :",
    allCitiesOption: "Toutes les villes d'Égypte et Tagamoa 🇪🇬",
    categoryLabel: "Activité commerciale / professionnelle :",
    sortLabel: "Trier les résultats :",
    sortNearest: "Le plus proche de moi",
    sortTrusted: "✓ Le plus fiable",
    sortPopular: "🔥 Le plus populaire",
    sortNewest: "⚡ Le plus récent",
    bizManageTitle: "Gestion des activités professionnelles :",
    free90DaysBadge: "90 jours gratuits",
    addBizBtnTitle: "+ Publier votre annonce",
    addBizBtnSub: "90 jours gratuits sans commission",
    registerUnlistedTitle: "🎁 Enregistrer un commerce non répertorié",
    registerUnlistedSub: "Envoi automatique d'un message WhatsApp de bienvenue",
    adminPanelBtnTitle: "🛡️ Panneau d'administration",
    adminPanelBtnSub: "Accès Admin (protégé par code secret)",
    subscriptionsTitle: "Formules d'abonnement & Paiement bancaire officiel :",
    officialBankBadge: "Banque Misr",
    bankAccountLabel: "Numéro de compte bancaire officiel :",
    ibanLabel: "IBAN international :",
    vodafoneCashLabel: "📱 Vodafone Cash :",
    instaPayLabel: "⚡ InstaPay :",
    viewSubsProgramBtn: "💳 Détails des forfaits & carte Visa",
    displayLangTitle: "Personnaliser l'affichage, la langue et la devise :",
    viewModeLabel: "Mode d'affichage :",
    viewModeReelsSub: "Mode plein écran TikTok interactif",
    viewModeGridSub: "Mode grille rapide",
    switchToGrid: "Passer en grille",
    switchToReels: "Passer en TikTok",
    currentCurrencyLabel: "Devise actuelle :",
    languageLabel: "Langue :",
    restoreDefaultsBtn: "Restaurer les données par défaut",
    applyAndCloseBtn: "Appliquer et fermer ✓",
    footerBrandText: "Plateforme E3lanak • Le TikTok des annonces et services 🇪🇬",
    watchAdsNowBtn: "Découvrir les annonces 👁️",

    directDeliveryTitle: "Commande en livraison directe 🛵",
    directFromBizBadge: "Direct commerçant",
    deliveryCoverageLabel: "Zone de livraison :",
    deliveryTimeLabel: "Temps estimé :",
    deliveryFeeLabel: "Frais de livraison :",
    deliveryPhoneLabel: "Téléphone livraison :",
    customerDetailsTitle: "Vos coordonnées et adresse de livraison :",
    customerNamePlaceholder: "Votre nom (facultatif)",
    customerAddressPlaceholder: "Adresse détaillée (rue, bâtiment, étage)",
    customerNotesPlaceholder: "Instructions de livraison particulières...",
    selectMenuTitle: "Choisir dans le menu / articles :",
    optionalBadge: "Facultatif",
    phoneCallBtn: "Appel téléphonique",
    orderWhatsAppBtn: "Commander via WhatsApp",
  },

  ru: {
    home: "Главная",
    favorites: "Избранное",
    nearest: "Рядом 📍",
    bookings: "Бронирования",
    settings: "Настройки 📁",

    forYou: "Для вас",
    nearestLoc: "Рядом 📍",
    teachersTab: "Школьные автобусы 🚌",
    moversTab: "Грузоперевозки 🚛",
    craftsmenTab: "Мастера 🔧",
    plumbingTab: "Сантехника 🚰",
    suppliesTab: "Товары для дома 🏗️",
    compoundsTab: "Компаунды и Тагамоа 🏡",
    clinicsTab: "Клиники 🩺",
    expertsTab: "Только эксперты 🎓",
    restaurantsTab: "Еда 🍔",
    hotelsTab: "Отели 🏨",
    forSaleTab: "Продажа 🏷️",
    settingsFolderBtn: "Настройки 📁",
    myLocationBtn: "Моя геопозиция 📍",

    videoCompressingTitle: "Сжатие видео для быстрой загрузки и экономии трафика...",
    videoCompressSuccess: "Видео успешно сжато",

    callBtn: "Позвонить 📞",
    whatsappBtn: "WhatsApp 💬",
    shareBtn: "Поделиться ↗️",
    followBtn: "+ Подписаться",
    followingBtn: "✓ Вы подписаны",
    orderDeliveryBtn: "Заказать доставку 🛵",
    bookOnSiteBtn: "Бронь с оплатой на месте 🏨",
    bookVisitBtn: "Забронировать визит 🎟️",
    viewDetailsBtn: "Подробнее и цены",
    subscriberDashboardBtn: "Кабинет 📊",

    settingsModalTitle: "📁 Папка настроек и параметров",
    settingsModalSubtitle: "Все параметры поиска, категории, подписки и сервисы в одной папке",
    tabAll: "🌟 Все",
    tabSearch: "🔍 Поиск и категории",
    tabBusiness: "📢 Добавить и управлять",
    tabPayment: "💳 Подписки и банк",
    tabSystem: "⚙️ Вид и язык",
    searchFilterTitle: "Поиск и фильтрация объявлений:",
    searchPlaceholder: "Поиск по названию, виду услуг, телефону, городу...",
    cityFilterLabel: "Город или район в Египте:",
    allCitiesOption: "Все города Египта и Новый Каир 🇪🇬",
    categoryLabel: "Сфера деятельности:",
    sortLabel: "Сортировка результатов:",
    sortNearest: "Ближайшие ко мне",
    sortTrusted: "✓ Проверенные",
    sortPopular: "🔥 Популярные",
    sortNewest: "⚡ Новые",
    bizManageTitle: "Управление бизнесом и услугами:",
    free90DaysBadge: "90 дней бесплатно",
    addBizBtnTitle: "+ Добавить свое объявление",
    addBizBtnSub: "90 дней бесплатно без комиссии",
    registerUnlistedTitle: "🎁 Зарегистрировать заведение",
    registerUnlistedSub: "Прямое приветствие в WhatsApp",
    adminPanelBtnTitle: "🛡️ Панель администратора",
    adminPanelBtnSub: "Вход для админа (защищен PIN)",
    subscriptionsTitle: "Тарифы подписки и официальные банковские реквизиты:",
    officialBankBadge: "Банк Миср (Banque Misr)",
    bankAccountLabel: "Официальный расчетный счет:",
    ibanLabel: "Международный номер IBAN:",
    vodafoneCashLabel: "📱 Vodafone Cash:",
    instaPayLabel: "⚡ InstaPay:",
    viewSubsProgramBtn: "💳 Подробнее о тарифах и оплате картой Visa",
    displayLangTitle: "Настройка вида, языка и валюты:",
    viewModeLabel: "Режим показа объявлений:",
    viewModeReelsSub: "Полноэкранный режим TikTok с интерактивом",
    viewModeGridSub: "Быстрый режим сетки",
    switchToGrid: "Переключить на сетку",
    switchToReels: "Переключить на TikTok",
    currentCurrencyLabel: "Текущая валюта:",
    languageLabel: "Язык интерфейса:",
    restoreDefaultsBtn: "Сбросить данные к начальным",
    applyAndCloseBtn: "Применить и закрыть ✓",
    footerBrandText: "Платформа E3lanak • TikTok объявлений и услуг 🇪🇬",
    watchAdsNowBtn: "Смотреть объявления 👁️",

    directDeliveryTitle: "Прямой заказ доставки 🛵",
    directFromBizBadge: "Напрямую от заведения",
    deliveryCoverageLabel: "Зона доставки:",
    deliveryTimeLabel: "Примерное время:",
    deliveryFeeLabel: "Стоимость доставки:",
    deliveryPhoneLabel: "Телефон доставки:",
    customerDetailsTitle: "Ваши данные и адрес доставки:",
    customerNamePlaceholder: "Ваше имя (необязательно)",
    customerAddressPlaceholder: "Точный адрес доставки (улица, дом, квартира)",
    customerNotesPlaceholder: "Пожелания к заказу...",
    selectMenuTitle: "Выберите из меню / списка:",
    optionalBadge: "По желанию",
    phoneCallBtn: "Позвонить по телефону",
    orderWhatsAppBtn: "Заказ через WhatsApp",
  },

  uk: {
    home: "Головна",
    favorites: "Улюблені",
    nearest: "Поблизу 📍",
    bookings: "Бронювання",
    settings: "Налаштування 📁",

    forYou: "Для вас",
    nearestLoc: "Поблизу 📍",
    teachersTab: "Шкільні автобуси 🚌",
    moversTab: "Вантажоперевезення 🚛",
    craftsmenTab: "Майстри 🔧",
    plumbingTab: "Сантехніка 🚰",
    suppliesTab: "Товари для дому 🏗️",
    compoundsTab: "Комплекси та Тагамоа 🏡",
    clinicsTab: "Клініки 🩺",
    expertsTab: "Тільки експерти 🎓",
    restaurantsTab: "Заклади 🍔",
    hotelsTab: "Готелі 🏨",
    forSaleTab: "Продаж 🏷️",
    settingsFolderBtn: "Налаштування 📁",
    myLocationBtn: "Моя геопозиція 📍",

    videoCompressingTitle: "Стиснення відео для швидкого завантаження та економії трафіку...",
    videoCompressSuccess: "Відео успішно стиснуто",

    callBtn: "Зателефонувати 📞",
    whatsappBtn: "WhatsApp 💬",
    shareBtn: "Поділитися ↗️",
    followBtn: "+ Підписатися",
    followingBtn: "✓ Ви підписані",
    orderDeliveryBtn: "Замовити доставку 🛵",
    bookOnSiteBtn: "Бронювання з оплатою на місці 🏨",
    bookVisitBtn: "Забронювати візит 🎟️",
    viewDetailsBtn: "Деталі та ціни",
    subscriberDashboardBtn: "Кабінет 📊",

    settingsModalTitle: "📁 Папка налаштувань та параметрів",
    settingsModalSubtitle: "Всі параметри пошуку, категорії, підписки та послуги в одній папці",
    tabAll: "🌟 Всі",
    tabSearch: "🔍 Пошук та категорії",
    tabBusiness: "📢 Додати та керувати",
    tabPayment: "💳 Підписки та банк",
    tabSystem: "⚙️ Вигляд та мова",
    searchFilterTitle: "Пошук та фільтрація оголошень:",
    searchPlaceholder: "Пошук за назвою, сферою, телефоном, містом...",
    cityFilterLabel: "Місто або район в Єгипті:",
    allCitiesOption: "Всі міста Єгипту та Новий Каїр 🇪🇬",
    categoryLabel: "Сфера діяльності:",
    sortLabel: "Сортування результатів:",
    sortNearest: "Найближчі до мене",
    sortTrusted: "✓ Найбільш надійні",
    sortPopular: "🔥 Найбільш популярні",
    sortNewest: "⚡ Нові",
    bizManageTitle: "Керування бізнесом та оголошеннями:",
    free90DaysBadge: "90 днів безкоштовно",
    addBizBtnTitle: "+ Додати своє оголошення",
    addBizBtnSub: "90 днів безкоштовно без комісій",
    registerUnlistedTitle: "🎁 Зареєструвати заклад",
    registerUnlistedSub: "Пряме вітання у WhatsApp",
    adminPanelBtnTitle: "🛡️ Панель адміністратора",
    adminPanelBtnSub: "Вхід для адміна (захищено PIN)",
    subscriptionsTitle: "Тарифи підписки та офіційні банківські реквізити:",
    officialBankBadge: "Банк Міср (Banque Misr)",
    bankAccountLabel: "Офіційний розрахунковий рахунок:",
    ibanLabel: "Міжнародний номер IBAN:",
    vodafoneCashLabel: "📱 Vodafone Cash:",
    instaPayLabel: "⚡ InstaPay:",
    viewSubsProgramBtn: "💳 Деталі тарифів та оплата карткою Visa",
    displayLangTitle: "Налаштування вигляду, мови та валюти:",
    viewModeLabel: "Режим перегляду оголошень:",
    viewModeReelsSub: "Повноекранний режим TikTok з інтерактивом",
    viewModeGridSub: "Швидкий режим сітки",
    switchToGrid: "Перемкнути на сітку",
    switchToReels: "Перемкнути на TikTok",
    currentCurrencyLabel: "Поточна валюта:",
    languageLabel: "Мова інтерфейсу:",
    restoreDefaultsBtn: "Скинути дані до початкових",
    applyAndCloseBtn: "Застосувати і закрити ✓",
    footerBrandText: "Платформа E3lanak • TikTok оголошень та послуг 🇪🇬",
    watchAdsNowBtn: "Дивитися оголошення 👁️",

    directDeliveryTitle: "Пряме замовлення доставки 🛵",
    directFromBizBadge: "Прямо від закладу",
    deliveryCoverageLabel: "Зона доставки:",
    deliveryTimeLabel: "Орієнтовний час:",
    deliveryFeeLabel: "Вартість доставки:",
    deliveryPhoneLabel: "Телефон доставки:",
    customerDetailsTitle: "Ваші дані та адреса доставки:",
    customerNamePlaceholder: "Ваше ім'я (необов'язково)",
    customerAddressPlaceholder: "Точна адреса доставки (вулиця, будинок, квартира)",
    customerNotesPlaceholder: "Побажання щодо замовлення...",
    selectMenuTitle: "Виберіть з меню / переліку:",
    optionalBadge: "За бажанням",
    phoneCallBtn: "Зателефонувати",
    orderWhatsAppBtn: "Замовлення через WhatsApp",
  }
};

export function getUITranslations(lang: SupportedLang): UITranslation {
  return UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
}
