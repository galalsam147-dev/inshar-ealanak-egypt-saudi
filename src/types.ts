export type SupportedLang = 'ar' | 'en' | 'zh' | 'it' | 'fr' | 'ru' | 'uk';

export type SupportedCurrency = 'EGP' | 'USD' | 'EUR' | 'SAR' | 'AED' | 'CNY' | 'RUB' | 'UAH' | 'GBP';

export type SortOption = 'default' | 'nearest' | 'trusted' | 'popular' | 'newest';

export type Category = 
  | 'الكل'
  | 'تاكسي وأجرة'
  | 'موتوسيكل ودليفري'
  | 'سيارات ليموزين'
  | 'أتوبيسات رحلات وسياحة وعمرة'
  | 'شحن ونقل ثقيل'
  | 'كوافير وتجميل'
  | 'خبراء'
  | 'اتوبيس وسيارات مدرسة'
  | 'عمال ونقل أثاث'
  | 'حرفيين وصيانة منزلية'
  | 'سباكة وأدوات صحية'
  | 'مستلزمات منازل وصناعية'
  | 'خدمات كمبوندات والتجمع'
  | 'مطاعم'
  | 'سندوتشات ووجبات سريعة'
  | 'خضروات وفواكه'
  | 'كافيهات'
  | 'تسوق ومولات'
  | 'أطباء'
  | 'أطباء وعيادات'
  | 'صيدليات ومستشفيات'
  | 'علاج طبيعي وتأهيل'
  | 'كهربائي وصيانة سيارات'
  | 'معرض سيارات'
  | 'رحلات وشاليهات'
  | 'شركات سياحة'
  | 'شركات استيراد وتصدير'
  | 'عقارات'
  | 'عقارات التجمع والكمبوندات'
  | 'سيارات'
  | 'سيارات ومراكز خدمة'
  | 'محاسبين قانونيين'
  | 'محامين'
  | 'مهن حرة'
  | 'أصحاب حرف'
  | 'فنادق ومنتجعات'
  | 'فنادق'
  | 'سياحة'
  | 'سياحة ورحلات'
  | 'شركات'
  | 'شركات وتجارة'
  | 'مدارس'
  | 'صيانة'
  | 'خدمات منزلية'
  | 'قطع غيار'
  | 'كل شيء';

export type PackageTier = 0 | 350 | 900 | 2500 | 5000 | 16000 | 199 | 399 | 799;

export interface ServiceItem {
  n: string;
  p: string;
  priceEgp?: number;
  imageUrl?: string; // صورة الصنف المضغوطة (حتى 100 صنف بالصور)
  compressedKb?: number; // حجم الصورة المضغوطة بالكيلوبايت
  category?: string;
}

export interface BusinessLicense {
  name: string; // 1. ترخيص مزاولة المهنة, 2. رخصة المنشأة والسجل, 3. شهادة الجودة والامتثال, 4. الاعتماد المهني
  number: string;
  issuer?: string;
  isVerified: boolean;
}

export interface SpecialOfferItem {
  id: string;
  title: string;
  priceEgp: number;
  originalPriceEgp?: number;
  description?: string;
  badge?: string;
}

export interface TouristReview {
  id: string;
  userName: string;
  userCountry: string;
  flagEmoji: string;
  rating: number;
  comment: string;
  date: string;
}

export interface BusinessComment {
  id: string | number;
  userName: string;
  userAvatar?: string;
  comment: string;
  createdAt: number;
  status: 'approved' | 'pending';
}

export interface HotelRoomType {
  id: string;
  name: string;
  pricePerNightEgp: number;
  priceSar?: number;
  beds: string;
  maxGuests: number;
  features: string[];
  imageUrl?: string;
  availableCount?: number;
}

export interface HotelBookingDetails {
  isHotel: boolean;
  starRating?: number;
  ratingScore?: number;
  reviewsCount?: number;
  checkInTime?: string;
  checkOutTime?: string;
  sustainabilityCert?: boolean;
  surroundings?: { name: string; distance: string }[];
  amenities?: string[];
  roomTypes?: HotelRoomType[];
}

export interface Business {
  id: number | string;
  name: string;
  cat: string;
  subCat?: string;
  country?: string;
  city: string;
  addr: string;
  bio: string;
  verified: number; // 1 or 0
  phone: string;
  hotline?: string; // الخط الساخن المباشر
  phones?: string[]; // Multiple phone numbers support
  videos: string[];
  images: string[];
  services: ServiceItem[];
  hours: string;
  expiry: number; // timestamp
  status: 'active' | 'expired' | 'hidden' | 'flagged' | 'pending';
  pkg: PackageTier;
  likes?: number;
  viewsCount?: number;
  sharesCount?: number;
  callClicksCount?: number;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  rating?: number;
  googleBusinessUrl?: string;
  googleMapsUrl?: string;
  isSponsored?: boolean; // Google Ads / VIP sponsored placement
  isDealOfDay?: boolean; // عرض اليوم المميز
  adCampaignTitle?: string;
  moderationStatus?: 'clean' | 'flagged' | 'pending';
  moderationReason?: string;
  videoStats?: {
    originalSizeMb: number;
    compressedSizeMb: number;
    compressionRatio: number;
  };
  poster?: string;
  isBanned?: boolean;
  banReason?: string;
  subscriptionPayment?: {
    isPaid: boolean;
    method: 'Visa' | 'Vodafone Cash' | 'Etisalat Cash' | 'Orange Cash' | 'InstaPay' | 'Fawry' | 'Bank Transfer' | 'Bank Card' | 'Cash' | 'Free Trial';
    transactionId?: string;
    paidAt?: number;
    amount?: number;
  };
  licenseDocUrl?: string; // Private official license / commercial register for Admin Eyes Only
  licenseVerified?: boolean;
  licenses?: BusinessLicense[]; // 4 Tiers horizontal license cards
  specialOffers?: SpecialOfferItem[]; // 3 Catalog offers with prices
  touristReviews?: TouristReview[]; // Real tourist reviews in multiple languages
  ratingCount?: number; // e.g. 127 reviews
  specialtyBadge?: string; // شارة تخصص دقيق
  audioHoursUrl?: string; // تسجيل صوتي لمواعيد العمل
  vipCustomSlug?: string; // /vip/name URL
  vipBannerUrl?: string; // كبير رئيسية Banner
  websiteUrl?: string; // رابط موقع جاهز أو دومين خاص
  customDomain?: string; // دومين مخصص
  forSaleItem?: ForSaleItem;
  seoKeywords?: string[];
  customerPosts?: CustomerMediaPost[];
  comments?: BusinessComment[];
  hotelBooking?: HotelBookingDetails;
  loyaltyPoints?: number;
  hasDelivery?: boolean; // خيار الدليفري والتوصيل للمشترك
  deliveryInfo?: BusinessDeliveryInfo; // تفاصيل خدمة التوصيل الخاصة بالنشاط
  newCairoZone?: string; // حي أو تجمع القاهرة الجديدة المحدد
  craftTradeId?: string; // تخصص الحرفي أو المهني
  trustDocs?: TrustVerificationDocs; // الأوراق الثبوتية والوجه والبطاقة والرخصة (للإدارة فقط)
  callSpamAudit?: CallSpamAudit; // تدقيق الاتصالات والحجب التلقائي في حال تجاوز 5 يومياً أو 35 أسبوعياً
  transportPricing?: {
    deliveryBasePrice?: string;
    furnitureMovingPrice?: string;
    hourlyLaborRate?: string;
  };
  textAnimation?: TextAnimationType;
  overlayText?: {
    caption?: string;
    animation?: TextAnimationType;
    textColor?: string;
    bgColor?: string;
    speed?: 'slow' | 'normal' | 'fast';
    position?: 'top' | 'center' | 'bottom';
    fontSize?: 'sm' | 'md' | 'lg';
    fontStyle?: TextFontStyle;
    bannerStyle?: TextBannerStyle;
  };
  soundtrack?: BusinessSoundtrack;
  ownerAccessCode?: string; // كود الدخول السري لصاحب النشاط (6 أرقام)
  ownerPin?: string; // الرقم السري الدائم لصفحة المشترك (يدخله أول مرة ويحفظه سراً)
  ownerPhone?: string; // رقم الهاتف المسجل لصاحب النشاط
  ownerEmail?: string; // البريد الإلكتروني لصاحب النشاط
  ownerPageLocked?: boolean; // قفل / فتح الصفحة للجمهور من المشترك أو الأدمن
  uniqueSubscriberKey?: string; // مفتاح / رابط فريد خاص بالمشترك
  googleKeywords?: string[]; // كلمات البحث التلقائية في Google
  interactivePresentation?: InteractivePromoPresentation; // العروض التقديمية التفاعلية للمشترك
  bankTransferDetails?: SubscriberBankTransferDetails; // بيانات وأرقام التحويلات البنكية والمحافظ المستقلة لكل صفحة
  trackingCell?: SubscriberTrackingCell; // خلية التتبع المباشر للتاكسي، الموتوسيكل، الليموزين، الأتوبيس والشحن
  bookingEnabled?: boolean; // تفعيل الحجوزات من داخل الصفحة لتظهر بالخارج
  bookingPrice?: number; // سعر الكشف أو الاستشارة أو الخدمة
  bookingServiceTitle?: string; // مسمى الحجز (كشف، استشارة، معاينة، حجز موعد)
  bookingSlotDurationMinutes?: number; // مدة الحجز حسب مواعيد المشترك (مثال: 30 دقيقة)
  pendingAdminApproval?: boolean; // عدم نشر أي إعلان أو تعديل إلا بعد موافقة الإدارة
  approvalNotes?: string; // ملاحظات اعتماد الإدارة
  submittedByStaffId?: string; // الموظف المساعد الذي أدخل أو عدل الإعلان
  submittedAt?: number;
  workStatus?: 'on' | 'off'; // عند العمل اون وعند العطلة اوف
  satelliteLinked?: boolean; // ربط الموقع بالقمر الصناعي
  underReviewMessage?: string; // رسالة للمشترك تحت المراجعة من الأدمن والمساعدين
  isWatchedByAdmin?: boolean; // متابعة من الأدمن والمساعدين
  customProgramTitle?: string; // تعديل البرنامج لكل مشترك
  customPublishAdMessage?: string; // تعديل رسائل انشر إعلانك لكل مشترك
}

export interface InteractiveSlide {
  id: string;
  imageUrl: string;
  caption: string;
  subCaption?: string;
  animation: 'ken_burns' | 'fade_zoom' | 'slide_left' | 'neon_glow' | 'bounce_in' | 'shimmer';
  textPosition?: 'top' | 'center' | 'bottom';
  durationSec?: number; // e.g. 3 to 6 seconds
  textColor?: string;
  bgColor?: string;
}

export interface InteractivePromoPresentation {
  enabled: boolean;
  title: string;
  slides: InteractiveSlide[];
  soundtrackUrl?: string;
  soundtrackTitle?: string;
  autoPlay: boolean;
  loop: boolean;
  slideDurationSec: number; // default 4 seconds
  transitionStyle: 'fade' | 'slide' | 'zoom';
  badgeText?: string; // e.g. "عرض ترويجي حصري 🔥"
  showFirstInPage: boolean; // يظهر كأول عنصر في صفحة النشاط
}

export interface TrustVerificationDocs {
  facePhotoUrl?: string; // تصوير الوجه سيلفي
  idCardFrontUrl?: string; // صورة البطاقة وش
  idCardBackUrl?: string; // صورة البطاقة ظهر
  licenseFrontUrl?: string; // رخصة أو سجل تجاري وش
  licenseBackUrl?: string; // رخصة أو سجل تجاري ظهر
  officialTaxCardUrl?: string; // بطاقة ضريبية
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  verifiedAt?: number;
  reviewedByAdmin?: boolean;
  notes?: string;
}

export interface CallSpamAudit {
  weeklyCallAttempts: number; // إجمالي المكالمات أسبوعياً (إذا تجاوز 35 يحظر)
  dailyCallAttempts: number; // مكالمات اليوم (إذا تجاوز 5 دون رد أو إزعاج)
  lastCallTimestamp?: number;
  isSpamBlocked?: boolean;
  blockReason?: string;
  blockedAt?: number;
}

export interface BusinessDeliveryInfo {
  available: boolean;
  phone?: string;
  deliveryPhones?: string[]; // أرقام الدليفري المتعددة للنشاط والكباتن والطيارين
  deliveryHotline?: string; // الخط الساخن السريع للدليفري
  deliveryWhatsapp?: string; // رقم واتساب الدليفري الفوري
  areas?: string; // مناطق التغطية (مثلاً: داخل المدينة، بقطر 10 كم)
  fee?: string; // رسوم التوصيل (مثلاً: توصيل مجاني، يبدأ من 15 ج.م)
  estimatedTime?: string; // الوقت المتوقع (مثلاً: خلال 30-45 دقيقة)
  notes?: string; // ملاحظات الطلب
  programName?: string; // اسم البرنامج: اطلب الأقرب ليك
  customDeliveryActive?: boolean; // تفعيل جمع طلبك دليفري خاص
}

export interface ForSaleItem {
  isForSale: boolean;
  price: number;
  itemType: string; // 'سيارة' | 'عقار' | 'أجهزة' | 'أي شيء'
  title?: string;
  condition: string; // 'جديد بالضمان' | 'كسر زيرو' | 'مستعمل بحالة ممتازة' | 'جاهز للاستلام'
  websiteOrDomain?: string; // موقع جاهز أو دومين خاص
  publicImages?: string[]; // صور المعروضات للجمهور
  specs?: string; // تفاصيل ومواصفات المعروض للبيع
  noDocsRequired?: boolean; // بيع حر مباشر للجمهور دون الحاجة لمستندات
}

export type TextAnimationType = 'marquee' | 'bounce' | 'wave' | 'slide' | 'neon' | 'pop' | 'flip3d' | 'vibrate' | 'typewriter' | 'shimmer';

export type TextFontStyle = 'kufi' | 'ruqah' | 'bold_poster' | 'neon_cyber' | 'typewriter' | 'naskh';

export type TextBannerStyle = 'glass_dark' | 'glass_red' | 'glass_gold' | 'neon_glow_box' | 'emerald_card' | 'sticker_gradient' | 'badge_angled' | 'transparent_outline';

export interface CustomerMediaPost {
  id: string | number;
  businessId: string | number;
  businessName?: string;
  userName: string;
  userPhone?: string;
  type: 'video' | 'image';
  url: string;
  caption: string;
  textAnimation: TextAnimationType;
  textColor?: string;
  bgColor?: string;
  position?: 'top' | 'center' | 'bottom';
  speed?: 'slow' | 'normal' | 'fast';
  fontSize?: 'sm' | 'md' | 'lg';
  createdAt: number;
  likes?: number;
  soundtrack?: BusinessSoundtrack;
}

export interface UserProfile {
  id: string;
  username: string; // e.g. @ahmed_dalilak
  displayName: string;
  avatarUrl: string;
  bio?: string;
  phone?: string;
  city?: string;
  followersCount: number;
  followingIds: (string | number)[]; // IDs of businesses followed
  points: number;
  walletBalance: number;
  createdAt: number;
  isVerified?: boolean;
}

export type DeliveryCategory = 'restaurant' | 'grocery' | 'pharmacy' | 'documents' | 'retail' | 'custom';

export type DeliveryStatus = 'received' | 'preparing' | 'on_the_way' | 'delivered' | 'cancelled';

export interface DeliveryOrderItem {
  name: string;
  quantity: number;
  estimatedPriceEgp?: number;
  notes?: string;
}
export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  avatarUrl?: string;
  vehicleType: string;
  plateNumber: string;
  city: string;
  coverageZones: string[];
  rating: number;
  completedOrdersCount: number;
  status: 'available' | 'on_delivery' | 'offline';
  isVerified: boolean;
  joinedDate: number;
  activeOrderId?: string;
}

export interface DeliveryOrder {
  id: string;
  orderNumber: string; // e.g. DLK-8492
  businessId?: string | number;
  businessName: string;
  businessPhone?: string;
  category: DeliveryCategory;
  items: DeliveryOrderItem[];
  pickupAddress: string;
  deliveryAddress: string;
  customerName: string;
  customerPhone: string;
  captainName?: string;
  captainPhone?: string;
  deliveryFeeEgp: number;
  itemsSubtotalEgp: number;
  totalEgp: number;
  paymentMethod: 'cash' | 'wallet' | 'vodafone_cash' | 'instapay' | 'visa';
  status: DeliveryStatus;
  statusUpdates: { status: DeliveryStatus; time: number; note: string }[];
  notes?: string;
  createdAt: number;
  estimatedMinutes?: number;
}

export interface SoundtrackTrack {
  id: string;
  title: string;
  artist: string;
  category: 'promo' | 'chill' | 'trending' | 'oriental' | 'spiritual' | 'corporate' | 'energetic' | 'quran' | 'dua' | 'custom';
  categoryLabelAr: string;
  url: string;
  duration?: string;
  compressedSizeKb?: number;
  isCustom?: boolean;
  addedAt?: number;
}

export interface BusinessSoundtrack {
  trackId?: string;
  title: string;
  artist?: string;
  url: string;
  isExternal?: boolean;
  isMuted: boolean;
  volume?: number; // 0.0 - 1.0 (defaults to 0.7)
  stereoPan?: number; // -1.0 (Left) to +1.0 (Right), 0 is Center
  stereoMode?: 'normal' | 'wide' | 'surround_3d';
  bassBoost?: number; // 0 to 12 dB
  trebleBoost?: number; // 0 to 12 dB
  mutedByAdmin?: boolean; // كتم إداري إجباري
  adminMuteReason?: string; // سبب الكتم من الإدارة
  updatedAt?: number;
}

export interface SubscriberBankTransferDetails {
  enabled: boolean;
  // 1. الحسابات البنكية الرسمية
  bankName?: string; // اسم البنك (مثال: بنك مصر، البنك الأهلي المصري، CIB، بنك الإسكندرية، QNB)
  accountHolderName?: string; // اسم صاحب الحساب البنكي
  accountNumber?: string; // رقم الحساب البنكي
  iban?: string; // الآيبان الدولي IBAN
  swiftCode?: string; // كود السويفت SWIFT
  // 2. بطاقات الدفع فيزا وماستركارد
  visaCardNumber?: string; // رقم كارت فيزا أو ماستركارد المخصص للتحويل
  visaHolderName?: string; // اسم صاحب بطاقة الفيزا
  // 3. المحافظ الإلكترونية والدفع اللحظي
  vodafoneCashNumber?: string; // رقم محفظة فودافون كاش
  instapayId?: string; // معرف أو هاتف إنستاباي InstaPay Handle
  etisalatCashNumber?: string; // محفظة اتصالات كاش
  orangeCashNumber?: string; // محفظة أورنج كاش
  wePayNumber?: string; // محفظة وي باي WE Pay
  smartWalletNumber?: string; // المحفظة البنكية الذكية (CIB Smart Wallet / NBE PhoneCash)
  // 4. أرقام الاتصال المتعددة والخط الساخن
  phones?: string[]; // إدخال أكثر من رقم هاتف (هاتف 1، هاتف 2، هاتف 3)
  hotline?: string; // الخط الساخن المختصر (مثال: 19822)
  transferPhone?: string; // هاتف استلام رسائل وتأكيدات التحويل
  customerTransferNotes?: string; // تعليمات خاصة بالتحويل للعملاء والزبائن
  // 5. قنوات التواصل والمكالمات (تليجرام، جوجل ميت، مكالمات فيديو وصوت)
  telegramUsername?: string; // معرف أو رابط تليجرام للتواصل وتحويل الأموال
  googleMeetUrl?: string; // رابط اجتماعات ومكالمات جوجل ميت Google Meet
  videoCallPhone?: string; // هاتف مكالمات الفيديو المباشرة
  voiceCallPhone?: string; // هاتف المكالمات الصوتية المباشرة
  autoReplyMessage?: string; // نص الرد الآلي في الحجز لتأكيد المواعيد
  // 6. الحماية والتشفير ضد الهكر والاختراق
  isEncryptedSecurity?: boolean; // مؤشر الحماية العالية ضد التعديل غير المصرح به
  updatedAt?: number;
  tripPaymentMethods?: TripPaymentMethod[]; // أرقام وطرق دفع الرحلات اليدوية (إضافة وتعديل وحذف)
}

/**
 * بيانات وسيلة/رقم دفع الرحلة يدوياً (فودافون كاش، إنستاباي، أورنج كاش، اتصالات كاش، وي باي، بنك، إلخ)
 */
export interface TripPaymentMethod {
  id: string;
  type: 'vodafone_cash' | 'instapay' | 'orange_cash' | 'etisalat_cash' | 'we_pay' | 'smart_wallet' | 'bank_account' | 'visa_card' | 'cash' | 'custom';
  label: string; // مسمى الرقم/الوسيلة (مثال: فودافون كاش الكابتن، إنستاباي السائق)
  number: string; // رقم الهاتف أو المعرف البنكي (مثال: 01006656669 أو user@instapay)
  holderName?: string; // اسم صاحب المحفظة أو الحساب
  notes?: string; // ملاحظات (مثال: متاح 24 ساعة، استلام فوري)
  isPrimary?: boolean; // الوسيلة الأساسية
  addedAt?: number;
}

/**
 * خلية التتبع المباشر لكل مشترك (تاكسي، موتوسيكل، ليموزين، أتوبيس رحلات وعمرة، شحن ونقل ثقيل)
 */
export interface SubscriberTrackingCell {
  enabled: boolean;
  vehicleType: 'taxi' | 'motorcycle' | 'limousine' | 'bus_travel' | 'heavy_truck' | 'car_rental' | 'delivery' | 'service';
  vehiclePlate?: string; // رقم اللوحة المعدنية أو كود المركبة (مثال: ط س ق 4821)
  vehicleModel?: string; // موديل وسنة الصنع (مثال: هيونداي النترا 2024 / بوكسر 150)
  captainName: string; // اسم السائق أو الكابتن
  captainPhone: string; // رقم هاتف الكابتن المباشر
  captainPhoto?: string; // صورة الكابتن
  currentStatus: 'available' | 'on_trip' | 'busy' | 'offline'; // متاح للطلب الفوري / في رحلة / مشغول / مغلق
  currentArea: string; // المنطقة الجغرافية الحالية (مثال: التجمع الخامس - التسعين الجنوبي)
  lat?: number;
  lng?: number;
  lastPing?: number;
  speedKmh?: number;
  ratePerKmEgp?: number; // سعر الكيلو متر بالجنيه
  minimumTripPriceEgp?: number; // فتح العداد أو الحد الأدنى للرحلة
  serviceDescription?: string; // تفاصيل الخدمة (تاكسي أبيض، دليفري سريع، ليموزين VIP، نقل أثاث، باص 50 راكب)
  multiplePhones?: string[]; // أكثر من رقم للتواصل المباشر
  hotline?: string; // خط ساخن سريع
  rating?: number; // تقييم الكابتن (مثال: 4.9)
  totalTrips?: number; // عدد الرحلات المنجزة
  tripPaymentMethods?: TripPaymentMethod[]; // أرقام وطرق دفع الرحلة اليدوية (إضافة وتعديل وحذف)
  vehiclePhotos?: string[]; // صور المركبة والسيارة
  vehicleShape?: 'sedan_taxi' | 'suv' | 'scooter' | 'box_motorcycle' | 'limousine_vip' | 'bus' | 'pickup_truck'; // شكل السيارة ونوعها عند التتبع
  vehicleColor?: string; // لون المركبة
  workMode?: 'on' | 'off'; // عند العمل ON وعند العطلة OFF
  satelliteLinked?: boolean; // ربط الموقع بالقمر الصناعي
  whatsappCallerTrackingActive?: boolean; // خاصية التتبع للمتصل على الواتس
}

export interface StaffPermissions {
  canReviewAds: boolean; // الرقابة على الإعلانات ومراجعتها
  canInputData: boolean; // إدخال البيانات
  canEdit: boolean; // التعديل
  canAdd: boolean; // الإضافة
  canDelete: boolean; // الحذف
  canHide: boolean; // الإخفاء
}

export interface StaffMember {
  id: string; // "staff_1" ... "staff_8"
  staffNumber: number; // 1 to 8
  name: string; // اسم الموظف
  username: string; // اسم المستخدم
  password: string; // كلمة المرور
  pin: string; // الرقم السري
  shiftHours: string; // ساعات العمل (مثال: 09:00 ص - 05:00 م)
  isActive: boolean; // فتح / قفل التفعيل من المدير
  isHidden: boolean; // ظهور / إخفاء الموظف
  workOrderActive: boolean; // أمر تشغيل وتفعيل صادر من الإدارة
  permissions: StaffPermissions;
  phone?: string;
  notes?: string;
  lastLoginAt?: number;
  approvedAdsCount?: number;
  reviewedAdsCount?: number;
}

export type NotificationType = 'comment_reply' | 'delivery_update' | 'order_placed' | 'points_earned' | 'like_received' | 'system_alert' | 'page_deleted' | 'new_subscriber' | 'under_review' | 'duplicate_phone_alert';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: number;
  read: boolean;
  businessId?: string | number;
  businessName?: string;
  orderNumber?: string;
  avatarUrl?: string;
  actionUrl?: string;
  meta?: Record<string, any>;
}
