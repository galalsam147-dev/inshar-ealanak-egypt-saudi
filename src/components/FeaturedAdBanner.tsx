import React, { useState } from 'react';
import { Business, SupportedCurrency, SupportedLang } from '../types';
import { 
  Sparkles, Megaphone, MapPin, ExternalLink, MessageCircle, 
  ShoppingBag, Bed, Star, ChevronLeft, ChevronRight, ChevronDown, X, Navigation
} from 'lucide-react';
import { isDeliveryEligible } from '../utils/deliveryEligibility';
import { formatServicePrice } from '../utils/currency';

interface FeaturedAdBannerProps {
  businesses: Business[];
  onOpenBiz: (b: Business) => void;
  onOpenDelivery?: (b: Business) => void;
  onOpenBooking?: (b: Business) => void;
  currentCurrency: SupportedCurrency;
  lang: SupportedLang;
}

export const FeaturedAdBanner: React.FC<FeaturedAdBannerProps> = ({
  businesses,
  onOpenBiz,
  onOpenDelivery,
  onOpenBooking,
  currentCurrency,
  lang,
}) => {
  // Find sponsored or Deal of the Day or VIP businesses
  const ads = businesses.filter((b) => b.isSponsored || b.isDealOfDay || b.pkg === 799 || b.adCampaignTitle);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (ads.length === 0 || isDismissed) return null;

  const currentAd = ads[currentIndex % ads.length];
  const isEligibleForDelivery = isDeliveryEligible(currentAd);
  const isHotel = !!currentAd.hotelBooking?.isHotel || currentAd.cat === 'فنادق' || currentAd.cat === 'فنادق ومنتجعات';

  const nextAd = () => setCurrentIndex((prev) => (prev + 1) % ads.length);
  const prevAd = () => setCurrentIndex((prev) => (prev - 1 + ads.length) % ads.length);

  return (
    <div className="absolute top-16 inset-x-0 z-30 max-w-xl mx-auto w-full px-3 py-1 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="relative overflow-hidden rounded-2xl bg-black/85 backdrop-blur-md border border-amber-500/60 shadow-2xl shadow-black/80 p-2.5 sm:p-3 text-white pointer-events-auto">
        
        {/* Top Header Tag */}
        <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-white/10">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
              <Megaphone className="w-2.5 h-2.5 fill-black" />
              <span>إعلان ممول • Google Ads</span>
            </span>

            {currentAd.isDealOfDay && (
              <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full animate-pulse flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 fill-yellow-300" />
                <span>عرض اليوم 🔥</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 transition cursor-pointer text-[10px] font-bold px-2 flex items-center gap-0.5"
              title={isMinimized ? 'توسيع الإعلان' : 'تصغير الإعلان'}
            >
              <span>{isMinimized ? 'عرض الإعلان 👁️' : 'تصغير'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isMinimized ? '' : 'rotate-180'}`} />
            </button>
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-1 rounded-lg bg-white/5 hover:bg-white/15 text-white/50 hover:text-white transition cursor-pointer"
              title="إخفاء الإعلان"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Minimized Quick Line */}
        {isMinimized ? (
          <div 
            onClick={() => onOpenBiz(currentAd)}
            className="pt-1.5 flex items-center justify-between text-xs cursor-pointer"
          >
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="font-black text-amber-300 truncate">{currentAd.name}</span>
              <span className="text-[10px] text-white/70 truncate">{currentAd.adCampaignTitle || currentAd.bio}</span>
            </div>
            <span className="text-[10px] text-amber-400 font-bold shrink-0">تفاصيل ⬅</span>
          </div>
        ) : (
          <>
            {/* Ad Body Content */}
            <div 
              onClick={() => onOpenBiz(currentAd)}
              className="pt-2 flex items-center gap-2.5 cursor-pointer group"
            >
              {/* Ad Image Thumbnail */}
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
                <img 
                  src={currentAd.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} 
                  alt={currentAd.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                />
                <span className="absolute bottom-0.5 start-0.5 bg-black/80 backdrop-blur-sm text-[8px] font-bold px-1 rounded text-amber-300">
                  {currentAd.cat}
                </span>
              </div>

              {/* Ad Text & Offer Details */}
              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-amber-300 transition truncate">
                    {currentAd.name}
                  </h4>
                  <span className="text-[10px] text-yellow-400 font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                    <span>{currentAd.rating || 4.9}</span>
                  </span>
                </div>

                {/* Ad Headline / Campaign Title */}
                <p className="text-[11px] font-bold text-amber-300 line-clamp-1 drop-shadow-sm">
                  ⚡ {currentAd.adCampaignTitle || 'خصومات حصرية وعروض خاصة للمشتركين والزوار اليوم'}
                </p>

                {/* Location & City */}
                <p className="text-[10px] text-white/70 flex items-center gap-1 truncate">
                  <MapPin className="w-2.5 h-2.5 text-red-400 shrink-0" />
                  <span>{currentAd.city} - {currentAd.addr}</span>
                </p>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between gap-1.5 flex-wrap">
              <div className="flex items-center gap-1">
                {currentAd.services?.[0] && (
                  <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg">
                    {formatServicePrice(currentAd.services[0].p, currentCurrency)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 ms-auto">
                {/* Delivery CTA only for eligible businesses: Stores, Restaurants, Professions */}
                {isEligibleForDelivery && onOpenDelivery && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenDelivery(currentAd);
                    }}
                    className="bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 active:scale-95 text-black font-black text-[10px] px-2.5 py-1 rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag className="w-3 h-3 fill-black" />
                    <span>دليفري 🛵</span>
                  </button>
                )}

                {/* Hotel Booking CTA (الدفع في الفندق / في المكان) */}
                {isHotel && onOpenBooking && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBooking(currentAd);
                    }}
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:brightness-110 active:scale-95 text-black font-black text-[10px] px-2.5 py-1 rounded-xl shadow transition flex items-center gap-1 cursor-pointer"
                  >
                    <Bed className="w-3 h-3 fill-black" />
                    <span>احجز في الفندق 🏨</span>
                  </button>
                )}

                {/* Direct WhatsApp CTA */}
                <a
                  href={`https://wa.me/${currentAd.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `مرحباً ${currentAd.name}، شاهدت إعلانكم المميز عبر إعلانك مصر، أود الاستفسار عن تفاصيل العرض والأسعار.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-black font-black text-[10px] px-2.5 py-1 rounded-xl transition flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 fill-black" />
                  <span>واتساب</span>
                </a>

                {/* View Full Profile CTA */}
                <button
                  type="button"
                  onClick={() => onOpenBiz(currentAd)}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-[10px] px-2 py-1 rounded-xl transition cursor-pointer"
                >
                  عرض 👁️
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
