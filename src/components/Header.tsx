import React, { useState } from 'react';
import { 
  Shield, Plus, Volume2, VolumeX, Globe, Coins, MapPin, 
  ChevronDown, Check, Navigation, Gift, Video, ShoppingBag, User, Users 
} from 'lucide-react';
import { SupportedCurrency, SupportedLang } from '../types';
import { CITIES, LANG_LIST, I18N, getCityLabel } from '../utils/translations';
import { CURRENCIES } from '../utils/currency';
import { ProgramLogo } from './ProgramLogo';

interface HeaderProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  lang: SupportedLang;
  onSelectLang: (l: SupportedLang) => void;
  currentCurrency: SupportedCurrency;
  onOpenCurrencyModal: () => void;
  onDetectLocation: () => void;
  isLocating: boolean;
  hasUserLocation: boolean;
  onOpenAdd: () => void;
  onOpenAdmin: () => void;
  onOpenAssistantPortal?: () => void;
  onOpenSubscribersProgram?: () => void;
  onOpenCustomerUpload?: () => void;
  onOpenDelivery?: () => void;
  onOpenCaptainRegister?: () => void;
  onOpenDrivers?: () => void;
  onOpenOrdersData?: () => void;
  onOpenUserProfile?: () => void;
  onOpenTransportTracking?: () => void;
  onOpenAppInstall?: () => void;
  onOpenSecurityNotice?: () => void;
  onOpenOfficialDomain?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  viewMode: 'reels' | 'grid';
}

export const Header: React.FC<HeaderProps> = ({
  selectedCity,
  onSelectCity,
  lang,
  onSelectLang,
  currentCurrency,
  onOpenCurrencyModal,
  onDetectLocation,
  isLocating,
  hasUserLocation,
  onOpenAdd,
  onOpenAdmin,
  onOpenAssistantPortal,
  onOpenSubscribersProgram,
  onOpenCustomerUpload,
  onOpenDelivery,
  onOpenCaptainRegister,
  onOpenUserProfile,
  onOpenTransportTracking,
  onOpenAppInstall,
  onOpenSecurityNotice,
  onOpenOfficialDomain,
  isMuted,
  onToggleMute,
  viewMode,
}) => {
  const t = I18N[lang];
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const currentLangObj = LANG_LIST.find((l) => l.code === lang) || LANG_LIST[0];
  const currInfo = CURRENCIES[currentCurrency];

  return (
    <header className="h-[56px] bg-black/95 backdrop-blur-md border-b border-white/10 flex justify-between items-center px-2 sm:px-4 z-50 shrink-0 select-none">
      {/* Brand */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <ProgramLogo variant="compact" showSubtitle={true} />
        <span className="hidden lg:inline-block px-1.5 py-0.5 text-[9px] font-bold bg-amber-400/20 text-amber-300 rounded-md border border-amber-400/30">
          مصر 🇪🇬
        </span>
      </div>

      {/* Action controls */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Detect GPS Location Button */}
        <button
          onClick={onDetectLocation}
          className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition border ${
            hasUserLocation
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
              : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/10'
          }`}
          title={t.detectLocation}
        >
          <Navigation
            className={`w-3 h-3 ${isLocating ? 'animate-spin text-amber-400' : hasUserLocation ? 'text-emerald-400 fill-emerald-400' : 'text-[#FF2D55]'}`}
          />
          <span className="hidden sm:inline">
            {isLocating ? '...' : hasUserLocation ? (lang === 'ar' ? 'موقعي 📍' : 'My Location 📍') : (lang === 'ar' ? 'أقرب لي' : 'Near Me')}
          </span>
        </button>

        {/* Currency Switcher Pill */}
        <button
          onClick={onOpenCurrencyModal}
          className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition"
          title={t.ratesAndCurrencies}
        >
          <span>{currInfo.flag}</span>
          <span>{currInfo.code}</span>
          <span className="text-white/40 hidden sm:inline">({currInfo.symbol})</span>
        </button>

        {/* Multi-Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="bg-white text-black hover:bg-white/90 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition shadow-sm"
          >
            <span>{currentLangObj.flag}</span>
            <span>{currentLangObj.code.toUpperCase()}</span>
            <ChevronDown className="w-3 h-3 stroke-[3]" />
          </button>

          {/* Languages Menu (7 Languages) */}
          {langMenuOpen && (
            <div className="absolute end-0 mt-1.5 w-44 bg-neutral-900 border border-white/20 rounded-2xl shadow-2xl py-1.5 z-50 overflow-hidden text-xs">
              {LANG_LIST.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    onSelectLang(item.code);
                    setLangMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-start flex items-center justify-between hover:bg-white/10 transition ${
                    lang === item.code ? 'text-[#FF2D55] font-black bg-white/5' : 'text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">{item.flag}</span>
                    <span>{item.nativeName}</span>
                  </span>
                  {lang === item.code && <Check className="w-3.5 h-3.5 text-[#FF2D55]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* City Selector */}
        <div className="relative hidden xs:block">
          <select
            value={selectedCity}
            aria-label={t.allCities}
            onChange={(e) => onSelectCity(e.target.value)}
            className="bg-white/10 hover:bg-white/15 text-white rounded-full text-[10px] sm:text-xs px-2 py-1 font-bold cursor-pointer transition border border-white/10 focus:outline-none focus:border-[#FF2D55] max-w-[100px] sm:max-w-none truncate"
          >
            <option value="" className="bg-neutral-900 text-white">
              {t.allCities}
            </option>
            {CITIES.map((city) => (
              <option key={city} value={city} className="bg-neutral-900 text-white">
                {getCityLabel(city, lang)}
              </option>
            ))}
          </select>
        </div>

        {/* Global Mute Toggle (in Reels view) */}
        {viewMode === 'reels' && (
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? t.soundOn : t.soundOff}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
            title={isMuted ? t.soundOn : t.soundOff}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white/70" /> : <Volume2 className="w-3.5 h-3.5 text-[#FF2D55]" />}
          </button>
        )}

        {/* Quick Transport & Taxi Dispatch GPS Modal */}
        {onOpenTransportTracking && (
          <button
            onClick={onOpenTransportTracking}
            className="bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 active:scale-95 text-black px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="طلب وتتبع تاكسي وموتوسيكل وشحن فوري مع الـ GPS"
          >
            <span>🚕 تاكسي ونقل 🛰️</span>
          </button>
        )}

        {/* Quick App Download / Google Play Modal */}
        {onOpenAppInstall && (
          <button
            onClick={onOpenAppInstall}
            className="bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 hover:brightness-110 active:scale-95 text-white px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="تحميل البرنامج على جميع الأجهزة وGoogle Play والآيباد"
          >
            <span>📲 تطبيق الجوال</span>
          </button>
        )}

        {/* Quick Anti-Fraud Security Warning */}
        {onOpenSecurityNotice && (
          <button
            onClick={onOpenSecurityNotice}
            className="bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="تحذير النصب والاحتيال: التأكد من البضاعة والدفع كاش عند الاستلام"
          >
            <span>⚠️ أمان</span>
          </button>
        )}

        {/* Subscribers Program (3 Months Free) CTA */}
        {onOpenSubscribersProgram && (
          <button
            onClick={onOpenSubscribersProgram}
            className="bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/40 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="برنامج المشتركين: ٣ شهور مجاناً وباقات الاشتراك"
          >
            <Gift className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">٣ شهور مجاناً 🎁</span>
            <span className="sm:hidden">مجاناً 🎁</span>
          </button>
        )}

        {/* Delivery & Taxi Captain Registration (3 Months Free - Full Subscriber) */}
        {onOpenCaptainRegister && (
          <button
            onClick={onOpenCaptainRegister}
            className="bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/40 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="اشتراك كابتن تاكسي ودليفري ونقل (مشترك رسمي ٣ شهور مجاناً بكافة الخصائص)"
          >
            <span>🚕🛵 كابتن تاكسي ودليفري</span>
          </button>
        )}

        {/* Delivery Program: اطلب الأقرب ليك (جمع طلبك دليفري خاص) */}
        {onOpenDelivery && (
          <button
            onClick={onOpenDelivery}
            className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs flex items-center gap-1 shadow-md transition cursor-pointer"
            title="برنامج: اطلب الأقرب ليك (جمع طلبك دليفري خاص وأرقام الدليفري)"
          >
            <span>🛵</span>
            <span className="hidden sm:inline">اطلب الأقرب ليك ⚡</span>
            <span className="sm:hidden">دليفري خاص</span>
          </button>
        )}

        {/* Customer Upload Media (Videos & Photos with Moving Text) */}
        {onOpenCustomerUpload && (
          <button
            onClick={onOpenCustomerUpload}
            className="bg-purple-600/25 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-400/40 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shadow-sm"
            title="تحميل فيديو أو صورة كعميل مع كتابة متحركة"
          >
            <Video className="w-3 h-3 text-purple-400" />
            <span className="hidden sm:inline">مشاركة عميل 🎬</span>
            <span className="sm:hidden">عميل 🎬</span>
          </button>
        )}

        {/* Official Domain Link Button */}
        {onOpenOfficialDomain && (
          <button
            onClick={onOpenOfficialDomain}
            className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-500/40 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition cursor-pointer shrink-0"
            title="الرابط النهائي بالدومين الرسمي (alasematex.com)"
          >
            <span>🌐</span>
            <span className="hidden sm:inline font-mono">alasematex.com</span>
          </button>
        )}

        {/* Add listing button (أضف إعلانك للجمهور مجاناً) */}
        <button
          onClick={onOpenAdd}
          className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 text-white px-2.5 sm:px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-black flex items-center gap-1 transition shadow-lg shadow-emerald-500/30 cursor-pointer animate-pulse"
          title="زرار أضف إعلانك للجمهور المشتركين الآن مجاناً (3 شهور مجاناً)"
        >
          <Plus className="w-3 h-3 stroke-[3]" />
          <span>أضف إعلانك مجاناً 🎁</span>
        </button>

        {/* Admin panel button - Discreet, secure, no password leakage */}
        <button
          onClick={onOpenAdmin}
          className="bg-white/10 hover:bg-white/20 active:scale-95 text-white/90 hover:text-white px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition border border-white/15 cursor-pointer shrink-0"
          title="دخول لوحة إدارة المنصة (محمي برمز سري)"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden md:inline">الإدارة</span>
        </button>

        {/* Assistant Admin & Staff Portal Button (صفحة بجوار الإدارة للمساعدين 1 إلى 8) */}
        {onOpenAssistantPortal && (
          <button
            onClick={onOpenAssistantPortal}
            className="bg-blue-600/30 hover:bg-blue-600/50 active:scale-95 text-blue-200 hover:text-white px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold flex items-center gap-1 transition border border-blue-500/40 cursor-pointer shrink-0 shadow-sm"
            title="بوابة مساعدي الإدارة والموظفين (فريق العمل 1 إلى 8 والرقابة على النشر)"
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden md:inline">المساعدين (1-8)</span>
          </button>
        )}
      </div>
    </header>
  );
};
