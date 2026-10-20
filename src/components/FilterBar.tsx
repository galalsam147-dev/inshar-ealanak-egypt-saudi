import React, { useState } from 'react';
import { 
  Search, LayoutGrid, Smartphone, X, ExternalLink, 
  MapPin, Flame, ShieldCheck, Heart, Gift, Mic, Wind, Clock, Sparkles 
} from 'lucide-react';
import { CATEGORIES, SUBCATEGORIES, MAJOR_CATEGORY_CARDS, I18N, getCategoryLabel } from '../utils/translations';
import { SortOption, SupportedLang } from '../types';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedSubCategory?: string;
  onSelectSubCategory?: (subCat: string) => void;
  selectedCity: string;
  sortBy: SortOption;
  onSelectSortBy: (sort: SortOption) => void;
  viewMode: 'reels' | 'grid';
  onToggleView: () => void;
  showExpiredOnly: boolean;
  onToggleShowExpired: () => void;
  expiredCount: number;
  showFavoritesOnly?: boolean;
  onToggleFavorites?: () => void;
  favoritesCount?: number;
  showForSaleOnly?: boolean;
  onToggleForSale?: () => void;
  forSaleCount?: number;
  onOpenSubscribersProgram?: () => void;
  onOpenCustomerUpload?: () => void;
  onOpenTransportModal?: (vehicle?: string) => void;
  onDetectLocation?: () => void;
  lang: SupportedLang;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  selectedSubCategory = '',
  onSelectSubCategory,
  selectedCity,
  sortBy,
  onSelectSortBy,
  viewMode,
  onToggleView,
  showExpiredOnly,
  onToggleShowExpired,
  expiredCount,
  showFavoritesOnly = false,
  onToggleFavorites,
  favoritesCount = 0,
  showForSaleOnly = false,
  onToggleForSale,
  forSaleCount = 0,
  onOpenSubscribersProgram,
  onOpenCustomerUpload,
  onOpenTransportModal,
  onDetectLocation,
  lang,
}) => {
  const t = I18N[lang];
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('المتصفح لا يدعم البحث الصوتي المباشر');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onSearchChange(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleOpenGoogleSearch = () => {
    const q = searchQuery.trim() || (selectedCategory !== 'الكل' ? selectedCategory : 'مطاعم وأماكن سياحية');
    const loc = selectedCity ? `${selectedCity} مصر` : 'مصر';
    const googleSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${q} ${loc}`)}`;
    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-black/90 backdrop-blur-md px-3 pt-2 pb-2 border-b border-white/10 space-y-2.5 z-40 shrink-0 select-none">
      {/* Search Input, Voice Search, Google Places Search CTA & View Mode */}
      <div className="flex items-center gap-2 max-w-5xl mx-auto">
        {/* Main Search Input */}
        <div className="flex-1 relative flex items-center">
          <Search className="w-4 h-4 text-white/40 absolute start-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن خدمة، مهنة، مكان... Where to go?"
            className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 text-white placeholder:text-white/40 rounded-full ps-9 pe-16 py-2 text-xs sm:text-sm transition border border-white/10 focus:outline-none focus:border-[#38BDF8]"
          />
          {/* Voice Search Button */}
          <button
            type="button"
            onClick={handleVoiceSearch}
            className={`absolute end-8 p-1 rounded-full text-white transition cursor-pointer ${
              isListening ? 'text-red-500 animate-pulse' : 'text-white/60 hover:text-white'
            }`}
            title="بحث صوتي 🎙️"
          >
            <Mic className="w-4 h-4" />
          </button>

          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute end-2.5 text-white/50 hover:text-white p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Google Places Live Search Button */}
        <button
          onClick={handleOpenGoogleSearch}
          className="bg-white/10 hover:bg-white/20 border border-white/15 text-white/90 hover:text-white px-2.5 sm:px-3 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-sm cursor-pointer"
          title="ابحث في أماكن وخرائط Google مباشرة"
        >
          <img
            src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png"
            alt="Google Maps"
            className="w-4 h-4"
          />
          <span className="hidden md:inline">{t.searchGooglePlaces}</span>
          <span className="md:hidden">Google</span>
          <ExternalLink className="w-3 h-3 text-white/50" />
        </button>

        {/* View Mode Toggle: Reels Feed vs Grid Directory */}
        <button
          onClick={onToggleView}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition shrink-0 cursor-pointer ${
            viewMode === 'grid'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'bg-white text-black hover:bg-white/90'
          }`}
          title={viewMode === 'reels' ? 'عرض الشبكة (Grid)' : 'عرض ريلز تيك توك (Reels)'}
        >
          {viewMode === 'reels' ? (
            <LayoutGrid className="w-4 h-4" />
          ) : (
            <Smartphone className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Clickable Quick Keyword Chips (كلمات البحث وتحديد موقعي على القمر الصناعي والأقرب لي من الخدمات) */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-0.5 text-[10px] max-w-5xl mx-auto">
        {onDetectLocation && (
          <button
            type="button"
            onClick={() => {
              onDetectLocation();
              onSelectSortBy('nearest');
            }}
            className="bg-emerald-500 hover:bg-emerald-400 text-black border border-white px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
          >
            <span>🛰️ تحديد موقعي على القمر الصناعي والأقرب لي من الخدمات</span>
          </button>
        )}
        <span className="text-amber-300 shrink-0 font-black">كلمات البحث:</span>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('أطباء وعيادات');
            onSearchChange('حجز العيادات والمستشفيات');
          }}
          className="bg-teal-500/25 hover:bg-teal-500 text-teal-200 hover:text-black border border-teal-400/50 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🏥 حجز العيادات والمستشفيات</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('أطباء وعيادات');
            onSearchChange('');
          }}
          className="bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black border border-rose-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>👨‍⚕️ عيادة ودكتور</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('صيدليات ومستشفيات');
            onSearchChange('');
          }}
          className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🏥 مستشفى وصيدلية</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('علاج طبيعي وتأهيل');
            onSearchChange('');
          }}
          className="bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black border border-cyan-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🦴 علاج طبيعي</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('كهربائي وصيانة سيارات');
            onSearchChange('');
          }}
          className="bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black border border-amber-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>⚡ كهربائي صيانة سيارات</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('معرض سيارات');
            onSearchChange('');
          }}
          className="bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-black border border-red-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🚗 معرض سيارات</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('رحلات وشاليهات');
            onSearchChange('');
          }}
          className="bg-sky-500/20 hover:bg-sky-500 text-sky-300 hover:text-black border border-sky-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🏖️ رحلات وشاليهات</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('شركات سياحة');
            onSearchChange('');
          }}
          className="bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-black border border-purple-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>✈️ شركات سياحة</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectCategory('شركات استيراد وتصدير');
            onSearchChange('');
          }}
          className="bg-orange-500/20 hover:bg-orange-500 text-orange-300 hover:text-black border border-orange-400/40 px-2.5 py-1 rounded-full font-black transition shrink-0 cursor-pointer flex items-center gap-1 shadow-sm"
        >
          <span>🚢 شركات استيراد وتصدير</span>
        </button>
      </div>

      {/* 6 Major Categories Cards (فئات 6 كروت كبيرة) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 max-w-5xl mx-auto py-0.5">
        {MAJOR_CATEGORY_CARDS.map((card) => {
          const isSelected = selectedCategory === card.categoryFilter || (selectedCategory === 'الكل' && card.id === 'prof_medical');
          return (
            <button
              key={card.id}
              onClick={() => {
                onSelectCategory(card.categoryFilter);
                onSelectSubCategory?.('');
              }}
              className={`p-2 rounded-2xl text-start transition cursor-pointer flex flex-col justify-between border ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/30'
                  : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[11px] font-black truncate">
                  {lang === 'ar' ? card.name : getCategoryLabel(card.categoryFilter, lang)}
                </span>
                {isSelected && <Sparkles className="w-3 h-3 text-amber-300 shrink-0" />}
              </div>
              <p className="text-[9px] text-white/60 line-clamp-1">
                {card.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Distance GPS Quick Filters (200م 500م 1كم 3كم 5كم) + Quick Filters */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-0.5 max-w-5xl mx-auto text-xs">
        <span className="text-[10px] font-bold text-emerald-400 shrink-0 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          <span>الأقرب لي:</span>
        </span>
        {onDetectLocation && (
          <button
            onClick={onDetectLocation}
            className="px-2.5 py-0.5 rounded-full border text-[10px] font-black transition cursor-pointer shrink-0 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-black border-emerald-400/40 flex items-center gap-1"
            title="تحديد مكاني بالـ GPS تلقائياً"
          >
            <span>📍 حدد مكاني الآن</span>
          </button>
        )}
        {['200م', '500م', '1كم', '3كم', '5كم'].map((dist) => (
          <button
            key={dist}
            onClick={() => onSearchChange(searchQuery === dist ? '' : dist)}
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition cursor-pointer shrink-0 ${
              searchQuery === dist
                ? 'bg-emerald-500 text-black border-emerald-400 font-black'
                : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
            }`}
          >
            {dist}
          </button>
        ))}

        <div className="w-[1px] h-3 bg-white/20 shrink-0 mx-1" />

        {/* Quick Filter: مفتوح الآن */}
        <button
          onClick={() => onSearchChange(searchQuery === 'مفتوح' ? '' : 'مفتوح')}
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition cursor-pointer shrink-0 ${
            searchQuery === 'مفتوح'
              ? 'bg-emerald-500 text-black border-emerald-400 font-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
          }`}
        >
          مفتوح الآن 🟢
        </button>

        {/* Quick Filter: مكيف */}
        <button
          onClick={() => onSearchChange(searchQuery === 'تكييف' ? '' : 'تكييف')}
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition cursor-pointer shrink-0 ${
            searchQuery === 'تكييف'
              ? 'bg-sky-500 text-black border-sky-400 font-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
          }`}
        >
          مكيف ❄️
        </button>

        {/* Quick Filter: 24 ساعة */}
        <button
          onClick={() => onSearchChange(searchQuery === '24 ساعة' ? '' : '24 ساعة')}
          className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold transition cursor-pointer shrink-0 ${
            searchQuery === '24 ساعة'
              ? 'bg-amber-400 text-black border-amber-300 font-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border-white/10'
          }`}
        >
          24 ساعة ⏱️
        </button>
      </div>

      {/* QUICK TRANSPORT & VEHICLE DISPATCH ROW (بدل ما نكتب تاكسي ميزة تاكسي أو موتوسيكل فوري) */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-1 max-w-5xl mx-auto text-xs bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-sky-500/10 px-2.5 rounded-2xl border border-white/10">
        <span className="text-[10px] font-black text-amber-300 shrink-0">
          🚕 وسائل النقل والتوصيل:
        </span>

        {/* Taxi */}
        <button
          onClick={() => {
            onSelectCategory('تاكسي وأجرة');
            onSelectSubCategory?.('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
            selectedCategory === 'تاكسي وأجرة'
              ? 'bg-amber-400 text-black font-black shadow-md'
              : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
          }`}
        >
          <span>🚕 تاكسي وأجرة</span>
        </button>

        {/* Motorcycle */}
        <button
          onClick={() => {
            onSelectCategory('موتوسيكل ودليفري');
            onSelectSubCategory?.('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
            selectedCategory === 'موتوسيكل ودليفري'
              ? 'bg-emerald-400 text-black font-black shadow-md'
              : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
          }`}
        >
          <span>🛵 موتوسيكل ودليفري</span>
        </button>

        {/* Limousine */}
        <button
          onClick={() => {
            onSelectCategory('سيارات ليموزين');
            onSelectSubCategory?.('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
            selectedCategory === 'سيارات ليموزين'
              ? 'bg-sky-400 text-black font-black shadow-md'
              : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
          }`}
        >
          <span>🚘 ليموزين VIP</span>
        </button>

        {/* Tour Bus */}
        <button
          onClick={() => {
            onSelectCategory('أتوبيسات رحلات وسياحة وعمرة');
            onSelectSubCategory?.('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
            selectedCategory === 'أتوبيسات رحلات وسياحة وعمرة'
              ? 'bg-purple-400 text-black font-black shadow-md'
              : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
          }`}
        >
          <span>🚌 أتوبيسات رحلات وعمرة</span>
        </button>

        {/* Heavy Truck */}
        <button
          onClick={() => {
            onSelectCategory('شحن ونقل ثقيل');
            onSelectSubCategory?.('');
          }}
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 shrink-0 cursor-pointer ${
            selectedCategory === 'شحن ونقل ثقيل'
              ? 'bg-orange-400 text-black font-black shadow-md'
              : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/10'
          }`}
        >
          <span>🚚 شحن ونقل ثقيل</span>
        </button>

        {/* Instant Dispatch GPS Button */}
        {onOpenTransportModal && (
          <button
            onClick={() => onOpenTransportModal()}
            className="px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1 shrink-0 cursor-pointer bg-gradient-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95"
            title="طلب فوري مع تتبع الـ GPS المباشر"
          >
            <span>طلب فوري وتتبع GPS 🛰️</span>
          </button>
        )}
      </div>

      {/* Sorting & Highlights Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll py-0.5 max-w-5xl mx-auto text-xs">
        {/* Dedicated Favorites Button (المفضلة) */}
        {onToggleFavorites && (
          <button
            onClick={onToggleFavorites}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1.5 shadow-sm cursor-pointer ${
              showFavoritesOnly
                ? 'bg-[#FF2D55] text-white ring-2 ring-[#FF2D55]/50 scale-105'
                : 'bg-white/10 text-white/90 hover:bg-white/15 hover:text-white border border-white/10'
            }`}
            title="الأماكن والأنشطة التي قمت بالإعجاب بها"
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : 'text-[#FF2D55] fill-[#FF2D55]'}`} />
            <span>المفضلة</span>
            {favoritesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                showFavoritesOnly ? 'bg-white text-[#FF2D55]' : 'bg-[#FF2D55] text-white'
              }`}>
                {favoritesCount}
              </span>
            )}
          </button>
        )}

        {/* For Sale Filter Button (عقارات، سيارات، أي شيء للبيع دون مستندات) */}
        {onToggleForSale && (
          <button
            onClick={onToggleForSale}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer ${
              showForSaleOnly
                ? 'bg-amber-400 text-black shadow-md shadow-amber-400/30'
                : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 border border-amber-400/40'
            }`}
            title="تصفح المعروض للبيع فقط (سيارات، عقارات، أي شيء دون مستندات)"
          >
            <span>🏷️</span>
            <span>للبيع (سيارات وعقارات)</span>
            {forSaleCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                showForSaleOnly ? 'bg-black text-amber-400' : 'bg-amber-400 text-black'
              }`}>
                {forSaleCount}
              </span>
            )}
          </button>
        )}

        {/* Subscribers 3 Months Free Banner CTA */}
        {onOpenSubscribersProgram && (
          <button
            onClick={onOpenSubscribersProgram}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-sm cursor-pointer"
            title="عرض ٣ شهور مجاناً وباقات الاشتراك بعد التجربة"
          >
            <Gift className="w-3 h-3 fill-black text-amber-400" />
            <span>٣ شهور مجاناً 🎁</span>
          </button>
        )}

        {/* Customer Video/Photo Upload with Moving Text */}
        {onOpenCustomerUpload && (
          <button
            onClick={onOpenCustomerUpload}
            className="shrink-0 px-3 py-1 rounded-full text-[11px] font-black transition flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-purple-600/30 to-[#FF2D55]/30 hover:from-purple-600 hover:to-[#FF2D55] text-purple-200 hover:text-white border border-purple-500/40 shadow-sm"
            title="تحميل فيديو أو صورة كعميل مع كتابة متحركة"
          >
            <span className="text-xs">🎬</span>
            <span>شارك كعميل</span>
          </button>
        )}

        <span className="text-[11px] font-bold text-white/50 shrink-0 hidden sm:inline">
          {t.sortBy}
        </span>

        {/* Default Sort */}
        <button
          onClick={() => {
            if (showFavoritesOnly && onToggleFavorites) onToggleFavorites();
            onSelectSortBy('default');
          }}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
            sortBy === 'default' && !showFavoritesOnly
              ? 'bg-white text-black font-black'
              : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
          }`}
        >
          المميز
        </button>

        {/* Nearest by GPS */}
        <button
          onClick={() => {
            if (showFavoritesOnly && onToggleFavorites) onToggleFavorites();
            onSelectSortBy('nearest');
          }}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            sortBy === 'nearest' && !showFavoritesOnly
              ? 'bg-emerald-500 text-black font-black shadow-md shadow-emerald-500/30'
              : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/40 border border-emerald-800/40'
          }`}
        >
          <MapPin className="w-3 h-3" />
          <span>{t.nearestToMe}</span>
        </button>

        {/* Most Trusted & Verified */}
        <button
          onClick={() => {
            if (showFavoritesOnly && onToggleFavorites) onToggleFavorites();
            onSelectSortBy('trusted');
          }}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            sortBy === 'trusted' && !showFavoritesOnly
              ? 'bg-[#20D5EC] text-black font-black shadow-md shadow-[#20D5EC]/30'
              : 'bg-cyan-950/40 text-cyan-300 hover:bg-cyan-900/40 border border-cyan-800/40'
          }`}
        >
          <ShieldCheck className="w-3 h-3" />
          <span>{t.mostTrusted}</span>
        </button>

        {/* Most Popular */}
        <button
          onClick={() => {
            if (showFavoritesOnly && onToggleFavorites) onToggleFavorites();
            onSelectSortBy('popular');
          }}
          className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1 cursor-pointer ${
            sortBy === 'popular' && !showFavoritesOnly
              ? 'bg-amber-400 text-black font-black shadow-md shadow-amber-400/30'
              : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/40 border border-amber-800/40'
          }`}
        >
          <Flame className="w-3 h-3" />
          <span>{t.mostPopular}</span>
        </button>

        {/* Expired Filter Toggle (Discreetly at end) */}
        {expiredCount > 0 && (
          <button
            onClick={onToggleShowExpired}
            className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-150 border flex items-center gap-1 cursor-pointer ${
              showExpiredOnly
                ? 'bg-red-600 text-white border-red-500 font-black shadow-md'
                : 'bg-red-950/40 text-red-300 border-red-800/40 hover:bg-red-900/40'
            }`}
            title="عرض الأنشطة المنتهية لاختبار التجديد"
          >
            <span>⏳ المنتهي ({expiredCount})</span>
          </button>
        )}
      </div>

      {/* Category Pills Bar (All Specialties) */}
      <div className="flex gap-1.5 overflow-x-auto hide-scroll py-0.5 max-w-5xl mx-auto items-center">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat && !showExpiredOnly && !showFavoritesOnly;
          return (
            <button
              key={cat}
              onClick={() => {
                if (showExpiredOnly) onToggleShowExpired();
                if (showFavoritesOnly && onToggleFavorites) onToggleFavorites();
                onSelectCategory(cat);
              }}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-[#FF2D55] text-white shadow-sm font-black scale-[1.02]'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/5'
              }`}
            >
              {getCategoryLabel(cat, lang)}
            </button>
          );
        })}
      </div>

      {/* Subcategory Filter Pills (تضييق البحث بالتصنيفات الفرعية) */}
      {selectedCategory && SUBCATEGORIES[selectedCategory] && (
        <div className="flex gap-1.5 overflow-x-auto hide-scroll py-1 max-w-5xl mx-auto items-center bg-white/5 px-2.5 rounded-2xl border border-white/10">
          <span className="text-[10px] text-amber-300 font-bold shrink-0">
            {lang === 'ar' ? '🔍 تضييق البحث:' : '🔍 Filter deeper:'}
          </span>
          {SUBCATEGORIES[selectedCategory].map((sub) => {
            const isSubSelected = (selectedSubCategory === sub) || (!selectedSubCategory && sub === 'الكل');
            return (
              <button
                key={sub}
                onClick={() => onSelectSubCategory && onSelectSubCategory(sub === 'الكل' ? '' : sub)}
                className={`shrink-0 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition cursor-pointer ${
                  isSubSelected
                    ? 'bg-amber-400 text-black font-black shadow-sm scale-[1.02]'
                    : 'bg-black/50 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                }`}
              >
                {sub}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

