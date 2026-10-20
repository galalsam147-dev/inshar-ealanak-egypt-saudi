import React, { useState } from 'react';
import { 
  Search, SlidersHorizontal, MapPin, Navigation, Sparkles, 
  ShoppingBag, X, Check, Mic, Globe, Heart, Tag, 
  Flame, LayoutGrid, Smartphone, ChevronDown, Award,
  Volume2, VolumeX, FolderCog, FileText, Bell, Zap, Target,
  MoreVertical, UserCheck, Bike, ShieldAlert, Compass
} from 'lucide-react';
import { Business, SortOption, SupportedCurrency, SupportedLang } from '../types';
import { CATEGORIES, SUBCATEGORIES, CITIES, LANG_LIST, getCityLabel } from '../utils/translations';
import { CURRENCIES } from '../utils/currency';
import { UI_TRANSLATIONS } from '../utils/uiI18n';
import { ProgramLogo } from './ProgramLogo';

export interface TikTokHeaderProps {
  // Search & Filter
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  selectedSubCategory: string;
  onSelectSubCategory: (sub: string) => void;
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  // Display & Location
  viewMode: 'reels' | 'grid';
  onToggleView: () => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  favoritesCount: number;
  showForSaleOnly: boolean;
  onToggleForSale: () => void;
  onDetectLocation: () => void;
  hasUserLocation: boolean;
  isLocating: boolean;
  // User & Actions
  onOpenDelivery: () => void;
  deliveryCount?: number;
  onOpenUserProfile?: () => void;
  currentCurrency: SupportedCurrency;
  onOpenCurrencyModal: () => void;
  lang: SupportedLang;
  onSelectLang: (lang: SupportedLang) => void;
  userPoints?: number;
  onOpenSettings?: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onOpenCaptainRegister?: () => void;
  onOpenMusicBank?: () => void;
  onOpenNearbyDispatch?: () => void;
  onOpenTransportTracking?: () => void;
  onOpenAppInstall?: () => void;
  onOpenSecurityNotice?: () => void;
  onOpenAdd?: () => void;
  onOpenOfficialDomain?: () => void;
  onOpenOrderNowDirectory?: () => void;
  onOpenAssistantPortal?: () => void;
  onOpenSupervisory?: () => void;
  onOpenPriceList?: () => void;
  onOpenPriceDisplay?: () => void;
  onOpenNotifications?: () => void;
  unreadNotificationsCount?: number;
  onOpenDashboard?: () => void;
  onOpenGoogleMaps?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenBooking?: (b?: Business) => void;
  businesses?: Business[];
  onOpenBiz?: (b: Business) => void;
}

export const TikTokHeader: React.FC<TikTokHeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedCity,
  onSelectCity,
  selectedSubCategory,
  onSelectSubCategory,
  sortBy,
  onSelectSortBy,
  viewMode,
  onToggleView,
  showFavoritesOnly,
  onToggleFavorites,
  favoritesCount,
  showForSaleOnly,
  onToggleForSale,
  onDetectLocation,
  hasUserLocation,
  isLocating,
  onOpenDelivery,
  deliveryCount = 0,
  onOpenUserProfile,
  currentCurrency,
  onOpenCurrencyModal,
  lang,
  onSelectLang,
  userPoints = 0,
  onOpenSettings,
  isMuted = false,
  onToggleMute,
  onOpenCaptainRegister,
  onOpenMusicBank,
  onOpenNearbyDispatch,
  onOpenTransportTracking,
  onOpenAppInstall,
  onOpenSecurityNotice,
  onOpenAdd,
  onOpenOfficialDomain,
  onOpenOrderNowDirectory,
  onOpenAssistantPortal,
  onOpenSupervisory,
  onOpenPriceList,
  onOpenPriceDisplay,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  onOpenDashboard,
  onOpenGoogleMaps,
  onOpenVoiceAssistant,
  onOpenBooking,
  businesses = [],
  onOpenBiz,
}) => {
  // Drawer state for the 3-vertical-dots settings box
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ url: string; title: string; biz?: Business } | null>(null);
  const [autoShowSearchPhotos, setAutoShowSearchPhotos] = useState(true);

  const currInfo = CURRENCIES[currentCurrency];
  const tUi = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;

  const searchMatchedPhotos = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    const results: { url: string; title: string; subtitle: string; biz: Business }[] = [];
    businesses.forEach((b) => {
      if (b.moderationStatus === 'hidden_by_admin' || b.isBannedByAdmin) return;
      const keywordsText = (b.googleSearchKeywords || []).join(' ');
      const haystack = `${b.name} ${b.cat} ${b.subCat || ''} ${b.city} ${b.addr} ${b.phone} ${keywordsText} ${b.vehiclePlateNumber || ''}`.toLowerCase();
      const matchedItem = b.services?.find((s) => s.n.toLowerCase().includes(q));
      if (haystack.includes(q) || matchedItem) {
        if (matchedItem?.imageUrl) {
          results.push({
            url: matchedItem.imageUrl,
            title: `${matchedItem.n} - ${matchedItem.p}`,
            subtitle: b.name,
            biz: b,
          });
        }
        if (b.vehiclePhotoUrl) {
          results.push({
            url: b.vehiclePhotoUrl,
            title: `مركبة: ${b.name} ${b.vehiclePlateNumber ? `(${b.vehiclePlateNumber})` : ''}`,
            subtitle: b.cat,
            biz: b,
          });
        }
        if (b.captainPhotoUrl) {
          results.push({
            url: b.captainPhotoUrl,
            title: `صورة الكابتن: ${b.name}`,
            subtitle: b.city,
            biz: b,
          });
        }
        if (b.images && b.images.length > 0) {
          b.images.slice(0, 2).forEach((imgUrl, idx) => {
            results.push({
              url: imgUrl,
              title: idx === 0 ? b.name : `${b.name} (${idx + 1})`,
              subtitle: `${b.cat} • ${b.city}`,
              biz: b,
            });
          });
        }
      }
    });
    return results.slice(0, 20);
  }, [searchQuery, businesses]);

  return (
    <>
      {/* Fullscreen Photo Lightbox when opening photos during search (فتح الصور عند البحث) */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[260] bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
          dir="rtl"
        >
          <div
            className="max-w-lg w-full bg-neutral-950 border border-amber-400/50 rounded-3xl overflow-hidden shadow-2xl p-3 space-y-2.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 truncate">{lightboxPhoto.title}</span>
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>غلق الصورة</span>
              </button>
            </div>
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-black flex items-center justify-center">
              <img
                src={lightboxPhoto.url}
                alt={lightboxPhoto.title}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            {lightboxPhoto.biz && (
              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] text-white/80">
                  📍 {lightboxPhoto.biz.city} - {lightboxPhoto.biz.addr}
                </div>
                {onOpenBiz && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = lightboxPhoto.biz!;
                      setLightboxPhoto(null);
                      onOpenBiz(target);
                    }}
                    className="bg-[#FF2D55] hover:bg-rose-500 text-white text-[10px] font-black px-3.5 py-1.5 rounded-full cursor-pointer"
                  >
                    فتح صفحة المشترك كاملة
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Floating Transparent TikTok Top Bar */}
      <header className="absolute top-0 inset-x-0 z-40 bg-gradient-to-b from-black/95 via-black/75 to-transparent pt-2 pb-1.5 px-2.5 sm:px-4 select-none text-white pointer-events-none w-full overflow-hidden">
        <div className="max-w-5xl mx-auto w-full flex items-center justify-between gap-2 pointer-events-auto" dir="rtl">
          
          {/* 1. يمين الشاشة: برنامج انشر إعلانك + العنوان مربوط باللوكيشن GPS والمكان */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
            <ProgramLogo
              variant="compact"
              onClick={() => {
                onSelectCategory('الكل');
                onSelectCity('');
              }}
              showSubtitle={false}
            />

            {/* ربط اللوكيشن بالعنوان: كبسولة موحدة تربط الـ GPS باختيار العنوان والمكان */}
            <div
              className={`h-7 sm:h-8 rounded-full transition-all border text-[10px] sm:text-xs font-black flex items-center gap-1 px-2 sm:px-2.5 shadow-sm backdrop-blur-md min-w-0 ${
                hasUserLocation
                  ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                  : 'bg-black/70 hover:bg-neutral-900/90 text-amber-300 border-amber-400/40'
              }`}
              title="العنوان مربوط باللوكيشن GPS والمكان"
            >
              <button
                type="button"
                onClick={() => {
                  onDetectLocation();
                  onSelectSortBy('nearest');
                }}
                className="flex items-center gap-1 cursor-pointer active:scale-90 pe-1.5 border-e border-white/15 shrink-0"
                title="تحديد اللوكيشن الحالي بالـ GPS"
              >
                <Navigation className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isLocating ? 'animate-spin text-amber-300' : hasUserLocation ? 'fill-emerald-300 text-emerald-300' : 'text-amber-400'}`} />
                <span className="whitespace-nowrap">
                  {hasUserLocation
                    ? (lang === 'ar' ? 'موقعي' : 'My GPS')
                    : (lang === 'ar' ? 'العنوان' : 'Location')}
                </span>
              </button>

              <select
                value={selectedCity}
                onChange={(e) => {
                  onSelectCity(e.target.value);
                  onDetectLocation();
                }}
                className="bg-transparent text-[10px] sm:text-xs font-black text-white/95 focus:outline-none cursor-pointer max-w-[75px] sm:max-w-[110px] truncate ps-0.5"
                title={lang === 'ar' ? 'اختر العنوان والمكان' : 'Select City & Location'}
              >
                <option value="" className="bg-neutral-900 text-white">
                  {lang === 'ar' ? 'كل الأماكن' : 'All Cities'}
                </option>
                {CITIES.map((c) => (
                  <option key={c} value={c} className="bg-neutral-900 text-white">
                    {getCityLabel(c, lang)}
                  </option>
                ))}
              </select>

              {onOpenGoogleMaps && (
                <button
                  type="button"
                  onClick={onOpenGoogleMaps}
                  className="ps-1.5 border-s border-white/15 text-emerald-300 hover:text-white flex items-center cursor-pointer active:scale-90 shrink-0"
                  title={lang === 'ar' ? 'فتح خريطة جوجل التفاعلية' : 'Open Interactive Google Maps'}
                >
                  <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* 2. منتصف الشاشة: شريط خدماتي ⚡ (التنبيه والتتبع للطلب والتاكسي - عربي وإنجليزي) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onOpenOrderNowDirectory || onOpenDelivery}
              className="h-7 sm:h-8 bg-gradient-to-r from-amber-400 via-orange-400 to-[#FF2D55] hover:brightness-110 active:scale-95 text-black font-black text-[10px] sm:text-xs px-3 sm:px-4 rounded-full flex items-center gap-1.5 shadow-md border border-white/40 cursor-pointer transition-all"
              title={lang === 'ar' ? 'خدماتي - خدمة التنبيه والتتبع للطلب والتاكسي' : 'My Services - Order & Taxi Alert & Tracking'}
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black text-black shrink-0" />
              <span className="whitespace-nowrap">{lang === 'ar' ? 'خدماتي' : 'My Services'}</span>
            </button>

            {/* زر التبديل السريع بين العربي والإنجليزي */}
            <button
              type="button"
              onClick={() => onSelectLang(lang === 'ar' ? 'en' : 'ar')}
              className="h-7 sm:h-8 px-2 sm:px-2.5 rounded-full bg-black/80 hover:bg-neutral-800 text-amber-300 border border-amber-400/40 text-[10px] sm:text-xs font-black flex items-center justify-center shadow-sm cursor-pointer active:scale-90 shrink-0"
              title={lang === 'ar' ? 'Switch to English' : 'التحويل للغة العربية'}
            >
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
          </div>

          {/* 3. يسار الشاشة: البحث + أيقونة 3 نقط واحدة فقط (⋮) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* البحث عن كل نشاط أو أي مشترك مسجل + المايك الصوتي */}
            <div className="h-7 sm:h-8 flex items-center bg-black/75 backdrop-blur-md border border-white/25 hover:border-amber-400/60 rounded-full px-2 sm:px-2.5 transition-all shadow-sm gap-1">
              <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300/90 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  onSearchChange(val);
                  if (val.trim() && selectedCategory !== 'الكل') {
                    onSelectCategory('الكل');
                  }
                }}
                placeholder={lang === 'ar' ? 'ابحث عن مشترك أو نشاط...' : 'Search subscriber or activity...'}
                className="w-16 sm:w-28 focus:w-28 sm:focus:w-40 bg-transparent text-white text-[10px] sm:text-xs ps-1 pe-0.5 focus:outline-none placeholder:text-white/45 transition-all"
                title="البحث عن كل نشاط أو أي مشترك اسمه مسجل"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-red-400 hover:text-white text-[10px] p-0.5 cursor-pointer flex items-center"
                  title="غلق البحث (X)"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              {onOpenVoiceAssistant && (
                <button
                  type="button"
                  onClick={onOpenVoiceAssistant}
                  className="w-5 h-5 rounded-full bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black flex items-center justify-center transition cursor-pointer shrink-0"
                  title="أوامر صوتية بالصفحات والبحث الصوتي 🎤"
                >
                  <Mic className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* إعدادات 3 نقط فوق بعض (⋮) الوحيدة على الشاشة */}
            <button
              onClick={() => setIsOptionsOpen(true)}
              className="w-7 h-7 sm:w-8 sm:h-8 bg-black/85 hover:bg-neutral-800 text-amber-300 hover:text-white rounded-full flex items-center justify-center transition-all border border-amber-400/50 shadow-md cursor-pointer active:scale-90 shrink-0"
              title="الصفحات والإعدادات (3 نقط ⋮)"
              aria-label="الإعدادات والصفحات"
            >
              <MoreVertical className="w-4 h-4 text-amber-300" />
            </button>
          </div>
        </div>

        {/* شريط فتح الصور تلقائياً عند البحث (فتح الصور عند البحث) */}
        {searchQuery.trim() && autoShowSearchPhotos && searchMatchedPhotos.length > 0 && (
          <div
            className="max-w-3xl mx-auto mt-1.5 bg-neutral-950/95 backdrop-blur-md border border-amber-400/50 rounded-2xl p-2 shadow-2xl pointer-events-auto"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-1.5 px-1">
              <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
                <span>🖼️ فتح الصور عند البحث ({searchMatchedPhotos.length} صورة مطابقة لـ "{searchQuery}")</span>
              </span>
              <button
                type="button"
                onClick={() => setAutoShowSearchPhotos(false)}
                className="text-[9.5px] bg-red-600/80 hover:bg-red-600 text-white font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
                <span>إخفاء الصور</span>
              </button>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {searchMatchedPhotos.map((item, idx) => (
                <div
                  key={`${item.biz.id}_${idx}`}
                  onClick={() => setLightboxPhoto({ url: item.url, title: item.title, biz: item.biz })}
                  className="shrink-0 w-24 bg-black/80 border border-white/15 hover:border-amber-400 rounded-xl overflow-hidden cursor-pointer group transition"
                >
                  <div className="w-24 h-16 overflow-hidden bg-neutral-900 relative">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                    />
                    <span className="absolute bottom-0.5 left-0.5 bg-black/75 text-amber-300 text-[7.5px] font-black px-1 rounded">
                      تكبير 🔍
                    </span>
                  </div>
                  <div className="p-1">
                    <div className="text-[8.5px] font-black text-white truncate">{item.title}</div>
                    <div className="text-[7.5px] text-amber-300/80 truncate">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* In-Page Options & Pages Drawer (برنامج انشر إعلانك - الصفحات والإعدادات داخل 3 نقط ⋮) */}
      {isOptionsOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col justify-end items-center p-0 animate-in fade-in duration-200"
          onClick={() => setIsOptionsOpen(false)}
        >
          <div 
            className="w-full max-w-2xl mx-auto bg-neutral-950/98 border-t border-x border-white/15 rounded-t-3xl shadow-2xl p-4 space-y-3 max-h-[85dvh] overflow-y-auto text-white"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black flex items-center justify-center font-black shadow">
                  <MoreVertical className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">
                    برنامج انشر إعلانك • الصفحات والإعدادات (⋮)
                  </h3>
                  <p className="text-[9px] text-white/50">
                    جميع صفحات البرنامج والخدمات مجمعة في مكان واحد
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {onOpenVoiceAssistant && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onOpenVoiceAssistant();
                    }}
                    className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black flex items-center gap-1 shadow cursor-pointer active:scale-95"
                  >
                    <Mic className="w-3 h-3" />
                    <span>أمر صوتي 🎤</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOptionsOpen(false)}
                  className="px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-black flex items-center gap-1 transition cursor-pointer active:scale-90 shadow"
                  title="غلق الصفحة (X)"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>غلق</span>
                </button>
              </div>
            </div>

            {/* شريط البحث السريع داخل الصفحات عن أي مشترك مسجل أو كل نشاط + زر عايز أشترك */}
            <div className="bg-white/5 border border-white/15 rounded-2xl p-2.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 flex items-center bg-black/70 border border-amber-400/40 rounded-xl px-2.5 py-1.5 gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      onSearchChange(e.target.value);
                      if (e.target.value.trim() && selectedCategory !== 'الكل') {
                        onSelectCategory('الكل');
                      }
                    }}
                    placeholder="ابحث عن أي مشترك اسمه مسجل أو ابحث عن كل نشاط..."
                    className="w-full bg-transparent text-white text-[11px] focus:outline-none placeholder:text-white/40"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => onSearchChange('')}
                      className="text-red-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                {onOpenAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onOpenAdd();
                    }}
                    className="bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white font-black text-[10px] px-3 py-1.5 rounded-xl shrink-0 shadow cursor-pointer active:scale-95"
                  >
                    📢 عايز أشترك
                  </button>
                )}
              </div>

              {/* قائمة سريعة بالمشتركين المسجلين مع صورهم للوصول لأي مشترك أو فتح صورته فوراً */}
              {businesses.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-amber-300/90 block">
                    👤 المشتركين المسجلين (اضغط على الصورة لتكبيرها أو الاسم لفتح الصفحة):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                    {businesses
                      .filter((b) =>
                        !searchQuery.trim() ||
                        `${b.name} ${b.cat} ${b.city} ${(b.googleSearchKeywords || []).join(' ')}`.toLowerCase().includes(searchQuery.trim().toLowerCase())
                      )
                      .slice(0, 15)
                      .map((b) => {
                        const thumb = b.captainPhotoUrl || b.vehiclePhotoUrl || b.images?.[0];
                        return (
                          <div
                            key={b.id}
                            className="px-2 py-1 rounded-xl bg-neutral-900 hover:bg-amber-500/20 border border-white/15 hover:border-amber-400 text-[9.5px] font-bold text-white flex items-center gap-1.5 transition"
                          >
                            {thumb && (
                              <img
                                src={thumb}
                                alt={b.name}
                                onClick={() => setLightboxPhoto({ url: thumb, title: b.name, biz: b })}
                                className="w-6 h-6 rounded-lg object-cover border border-amber-400 cursor-pointer hover:scale-110 transition"
                                title="اضغط لفتح الصورة عند البحث"
                              />
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                setIsOptionsOpen(false);
                                if (onOpenBiz) onOpenBiz(b);
                                else onSearchChange(b.name);
                              }}
                              className="flex items-center gap-1 cursor-pointer"
                            >
                              <span className="truncate max-w-[120px]">{b.name}</span>
                              <span className="text-[8px] text-amber-400">({b.cat})</span>
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* قسم صفحات برنامج انشر إعلانك داخل الـ 3 نقط */}
            <div className="space-y-1.5">
              <span className="text-[9.5px] font-black text-amber-300 block">
                📑 صفحات برنامج انشر إعلانك (اضغط أو استخدم الأوامر الصوتية 🎤):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {/* 1. الصفحة الرئيسية (الريلز) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('الكل');
                    if (showFavoritesOnly) onToggleFavorites();
                    if (showForSaleOnly) onToggleForSale();
                  }}
                  className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/15 text-right flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#FF2D55] text-white flex items-center justify-center shrink-0 font-black">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-white truncate">الرئيسية (الريلز)</div>
                    <div className="text-[8px] text-white/55 truncate">عرض الإعلانات</div>
                  </div>
                </button>

                {/* 2. صفحة المفضلة */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onToggleFavorites();
                  }}
                  className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 font-black">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-rose-300 truncate">صفحة المفضلة ({favoritesCount})</div>
                    <div className="text-[8px] text-white/55 truncate">الإعلانات المحفوظة</div>
                  </div>
                </button>

                {/* 4. صفحة انشر إعلانك (+) */}
                {onOpenAdd && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOptionsOpen(false);
                      onOpenAdd();
                    }}
                    className="p-2 rounded-xl bg-gradient-to-r from-[#FF2D55]/25 to-amber-500/20 hover:brightness-110 border border-[#FF2D55]/50 text-right flex items-center gap-2 transition cursor-pointer active:scale-95"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#FF2D55] to-amber-500 text-white flex items-center justify-center shrink-0 font-black">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[10px] font-black text-white truncate">انشر إعلانك 📢</div>
                      <div className="text-[8px] text-amber-300 truncate">90 يوم مجاناً</div>
                    </div>
                  </button>
                )}

                {/* 5. لوحة المشترك في صفحة بالداخل */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    if (onOpenDashboard) onOpenDashboard();
                    else if (onOpenSettings) onOpenSettings();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 hover:from-amber-500/30 border border-amber-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm">
                    <UserCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-amber-300 truncate">لوحة المشترك 📊</div>
                    <div className="text-[8px] text-white/55 truncate">صفحة المشترك بالداخل</div>
                  </div>
                </button>

                {/* 6. طلب دليفري وتتبع السائق */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenDelivery();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-orange-500/20 to-red-500/10 hover:from-orange-500/30 border border-orange-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-orange-500 text-black flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Bike className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-orange-300 truncate">طلب دليفري 🛵</div>
                    <div className="text-[8px] text-white/55 truncate">توصيل وتتبع الكابتن</div>
                  </div>
                </button>

                {/* 7. حجز عيادة والمستشفيات (مضاف داخل الإعدادات 3 نقط إضافة للآخرين) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('أطباء وعيادات');
                    onSearchChange('');
                    if (onOpenBooking) {
                      const medBiz = businesses.find(
                        (b) =>
                          b.cat.includes('أطباء') ||
                          b.cat.includes('عياد') ||
                          b.cat.includes('مستشف') ||
                          b.cat.includes('صيدلي') ||
                          b.cat.includes('علاج طبيعي')
                      );
                      onOpenBooking(medBiz);
                    }
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-teal-500/25 to-emerald-500/15 hover:from-teal-500/35 border border-teal-400/50 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-teal-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                    🏥
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-teal-300 truncate">حجز عيادة والمستشفيات</div>
                    <div className="text-[8px] text-white/65 truncate">حجز كشف ومواعيد فورية</div>
                  </div>
                </button>

                {/* 8. عيادة دكتور */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('أطباء وعيادات');
                    onSelectSubCategory('');
                    onSearchChange('');
                    if (showFavoritesOnly) onToggleFavorites();
                    if (showForSaleOnly) onToggleForSale();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/10 hover:from-emerald-500/30 border border-emerald-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                    👨‍⚕️
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-emerald-300 truncate">عيادة دكتور 👨‍⚕️</div>
                    <div className="text-[8px] text-white/65 truncate">أطباء واستشاريين</div>
                  </div>
                </button>

                {/* 9. مستشفى وصيدلية */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('صيدليات ومستشفيات');
                    onSelectSubCategory('');
                    onSearchChange('');
                    if (showFavoritesOnly) onToggleFavorites();
                    if (showForSaleOnly) onToggleForSale();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-sky-500/10 hover:from-cyan-500/30 border border-cyan-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                    💊
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-cyan-300 truncate">مستشفى وصيدلية 🏥</div>
                    <div className="text-[8px] text-white/65 truncate">طوارئ وصيدليات 24 س</div>
                  </div>
                </button>

                {/* 10. علاج طبيعي */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('علاج طبيعي وتأهيل');
                    onSelectSubCategory('');
                    onSearchChange('');
                    if (showFavoritesOnly) onToggleFavorites();
                    if (showForSaleOnly) onToggleForSale();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-lime-500/20 to-emerald-500/10 hover:from-lime-500/30 border border-lime-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-lime-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                    🦴
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-lime-300 truncate">علاج طبيعي 🦴</div>
                    <div className="text-[8px] text-white/65 truncate">جلسات وتأهيل حركي</div>
                  </div>
                </button>

                {/* 11. كهربائي وصيانة سيارات */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onSelectCategory('كهربائي وصيانة سيارات');
                    onSelectSubCategory('');
                    onSearchChange('');
                    if (showFavoritesOnly) onToggleFavorites();
                    if (showForSaleOnly) onToggleForSale();
                  }}
                  className="p-2 rounded-xl bg-gradient-to-r from-amber-500/25 to-orange-500/15 hover:from-amber-500/35 border border-amber-400/50 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                    ⚡
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-amber-300 truncate">كهربائي وصيانة سيارات</div>
                    <div className="text-[8px] text-white/65 truncate">أعطال كمبيوتر وميكانيكا</div>
                  </div>
                </button>
              </div>
            </div>

            {/* باقي الخدمات والأدوات داخل خانة الإعدادات 3 نقط */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-1.5 border-t border-white/10">

              {/* تحديد موقعي على القمر الصناعي والأقرب لي من الخدمات */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  onDetectLocation();
                  onSelectSortBy('nearest');
                  onSelectCategory('الكل');
                  if (onOpenGoogleMaps) {
                    onOpenGoogleMaps();
                  }
                }}
                className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                  🛰️
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-emerald-300 truncate">موقعي والأقرب لي 🛰️</div>
                  <div className="text-[8px] text-white/60 truncate">قمر صناعي وأقرب خدمات</div>
                </div>
              </button>

              {/* خريطة جوجل التفاعلية للأماكن (Google Maps) */}
              {onOpenGoogleMaps && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenGoogleMaps();
                  }}
                  className="p-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-emerald-300 truncate">خرائط جوجل 🗺️</div>
                    <div className="text-[8px] text-white/55 truncate">كل الأماكن على الخريطة</div>
                  </div>
                </button>
              )}

              {/* تتبع السائق والتاكسي المباشر GPS */}
              {onOpenTransportTracking && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenTransportTracking();
                  }}
                  className="p-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-sky-500 text-black flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Compass className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-sky-300 truncate">تتبع السائق 🛰️</div>
                    <div className="text-[8px] text-white/55 truncate">خريطة GPS مباشرة</div>
                  </div>
                </button>
              )}

              {/* معرض سيارات */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  onSelectCategory('معرض سيارات');
                  onSelectSubCategory('');
                  onSearchChange('');
                }}
                className="p-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-rose-500 text-white flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                  🚗
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-rose-300 truncate">معرض سيارات 🚗</div>
                  <div className="text-[8px] text-white/55 truncate">زيرو ومستعمل وتقسيط</div>
                </div>
              </button>

              {/* رحلات وشاليهات */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  onSelectCategory('رحلات وشاليهات');
                  onSelectSubCategory('');
                  onSearchChange('');
                }}
                className="p-2 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-sky-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                  🏖️
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-sky-300 truncate">رحلات وشاليهات 🏖️</div>
                  <div className="text-[8px] text-white/55 truncate">مصايف وحجز شاليهات</div>
                </div>
              </button>

              {/* شركات سياحة */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  onSelectCategory('شركات سياحة');
                  onSelectSubCategory('');
                  onSearchChange('');
                }}
                className="p-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                  ✈️
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-indigo-300 truncate">شركات سياحة ✈️</div>
                  <div className="text-[8px] text-white/55 truncate">حجز طيران وفنادق</div>
                </div>
              </button>

              {/* شركات استيراد وتصدير */}
              <button
                type="button"
                onClick={() => {
                  setIsOptionsOpen(false);
                  onSelectCategory('شركات استيراد وتصدير');
                  onSelectSubCategory('');
                  onSearchChange('');
                }}
                className="p-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/40 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
              >
                <div className="w-6 h-6 rounded-lg bg-purple-400 text-black flex items-center justify-center shrink-0 font-black shadow-sm text-xs">
                  🚢
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black text-purple-300 truncate">شركات استيراد وتصدير</div>
                  <div className="text-[8px] text-white/55 truncate">تخليص جمركي وشحن دولي</div>
                </div>
              </button>

              {/* الرقابة والمساعدين */}
              {onOpenSupervisory && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenSupervisory();
                  }}
                  className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/90 text-black flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Award className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-amber-300 truncate">الرقابة 🛡️</div>
                    <div className="text-[8px] text-white/55 truncate">إدارة ومراجعة</div>
                  </div>
                </button>
              )}

              {/* التحذير الأمني والقانوني */}
              {onOpenSecurityNotice && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenSecurityNotice();
                  }}
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-red-500 text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-red-300 truncate">إخلاء المسؤولية ⚠️</div>
                    <div className="text-[8px] text-white/55 truncate">نحن مجرد إعلان</div>
                  </div>
                </button>
              )}

              {/* تغيير العملة */}
              {onOpenCurrencyModal && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenCurrencyModal();
                  }}
                  className="p-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-blue-300 truncate">العملة ({currInfo.symbol})</div>
                    <div className="text-[8px] text-white/55 truncate">تحويل الأسعار</div>
                  </div>
                </button>
              )}

              {/* الصوت والموسيقى */}
              {onToggleMute && (
                <button
                  type="button"
                  onClick={onToggleMute}
                  className="p-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-purple-300 truncate">الصوت 🎵</div>
                    <div className="text-[8px] text-white/55 truncate">{isMuted ? 'مكتوم' : 'مفعل'}</div>
                  </div>
                </button>
              )}

              {/* الدومين الرسمي */}
              {onOpenOfficialDomain && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenOfficialDomain();
                  }}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-cyan-500 text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-cyan-300 truncate">الدومين 🌐</div>
                    <div className="text-[8px] text-white/55 truncate">الرابط الرسمي</div>
                  </div>
                </button>
              )}

              {/* تسجيل كابتن دليفري جديد */}
              {onOpenCaptainRegister && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOptionsOpen(false);
                    onOpenCaptainRegister();
                  }}
                  className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-400/30 text-right flex items-center gap-2 transition cursor-pointer active:scale-95 group"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-black shadow-sm">
                    <Bike className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-black text-emerald-300 truncate">تسجيل كابتن 🏍️</div>
                    <div className="text-[8px] text-white/55 truncate">أسطول التوصيل</div>
                  </div>
                </button>
              )}
            </div>

            {/* تصنيف الأنشطة واختيار المحافظة وترتيب النتائج بأزرار كبسولة صغيرة */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <label className="text-[10px] font-bold text-white/70 shrink-0">المحافظة:</label>
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="flex-1 bg-neutral-900 border border-white/15 rounded-full px-3 py-1 text-[10px] text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="" className="bg-neutral-900 text-white">كل محافظات مصر (100 مليون عميل 🇪🇬)</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c} className="bg-neutral-900 text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-white/70 block">التصنيف السريع:</label>
                <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto pr-1">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        onSelectCategory(cat);
                        onSelectSubCategory('');
                      }}
                      className={`px-2.5 py-1 rounded-full text-[9.5px] font-bold border transition cursor-pointer active:scale-95 ${
                        selectedCategory === cat
                          ? 'bg-gradient-to-r from-[#FF2D55] to-rose-600 text-white border-[#FF2D55] shadow-sm'
                          : 'bg-white/5 border-white/10 text-white/75 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* زر الإغلاق والتطبيق المصغر */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  onSelectCategory('الكل');
                  onSelectCity('');
                  onSearchChange('');
                  onSelectSubCategory('');
                  onSelectSortBy('default');
                }}
                className="text-[10px] text-white/50 hover:text-white underline cursor-pointer"
              >
                إعادة تعيين الكل
              </button>

              <button
                type="button"
                onClick={() => setIsOptionsOpen(false)}
                className="bg-red-600 hover:bg-red-500 active:scale-95 text-white font-black text-[11px] px-5 py-1.5 rounded-full shadow-md flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>غلق الصفحة (X)</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
