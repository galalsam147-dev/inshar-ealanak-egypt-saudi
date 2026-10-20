import React, { useState } from 'react';
import { Business, SupportedCurrency, SupportedLang } from '../types';
import { CheckCircle, MapPin, Play, MessageCircle, Phone, Navigation, Megaphone, KeyRound } from 'lucide-react';
import { I18N } from '../utils/translations';
import { formatDistance } from '../utils/distance';
import { formatServicePrice } from '../utils/currency';

interface GridFeedProps {
  businesses: Business[];
  onOpenBiz: (b: Business) => void;
  currentCurrency: SupportedCurrency;
  lang: SupportedLang;
  onOpenOwnerLock?: (b: Business) => void;
  onOpenPriceList?: (b: Business) => void;
  onOpenTransportModal?: (b: Business) => void;
}

export const GridFeed: React.FC<GridFeedProps> = ({
  businesses,
  onOpenBiz,
  currentCurrency,
  lang,
  onOpenOwnerLock,
  onOpenPriceList,
  onOpenTransportModal,
}) => {
  const t = I18N[lang];
  const [phoneSelectorBiz, setPhoneSelectorBiz] = useState<Business | null>(null);

  if (businesses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 space-y-2">
        <p className="text-sm font-semibold">{t.noResults}</p>
        <span className="text-xs text-white/40">{t.expiredNotice}</span>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 overflow-y-auto hide-scroll bg-[#0f0f11] p-3 sm:p-5">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 pb-20">
        {businesses.map((b) => {
          const daysLeft = Math.ceil((b.expiry - Date.now()) / 86400000);
          const hasVideo = b.videos && b.videos.length > 0;
          const imageSrc =
            b.images?.[0] ||
            'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600';
          const allPhones = b.phones && b.phones.length > 0 ? b.phones : [b.phone];

          return (
            <div
              key={b.id}
              onClick={() => onOpenBiz(b)}
              className="group bg-neutral-900/90 rounded-2xl overflow-hidden border border-white/10 hover:border-[#FF2D55]/60 transition-all duration-200 hover:-translate-y-1 shadow-lg hover:shadow-2xl hover:shadow-[#FF2D55]/10 cursor-pointer flex flex-col relative"
            >
              {/* Google Ads / Sponsored Tag */}
              {b.isSponsored && (
                <div className="absolute top-2 start-2 z-20 bg-black/80 backdrop-blur-md border border-amber-400/50 text-amber-300 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Megaphone className="w-2.5 h-2.5" />
                  <span>Google Ads</span>
                </div>
              )}

              {/* Cover Media Preview */}
              <div className="relative h-36 sm:h-44 overflow-hidden bg-black">
                <img
                  src={imageSrc}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />

                {/* Video Indicator */}
                {hasVideo && (
                  <div className="absolute bottom-2 end-2 bg-black/60 backdrop-blur-md text-white p-1 rounded-full border border-white/20">
                    <Play className="w-3 h-3 fill-white translate-x-0.5" />
                  </div>
                )}

                {/* Center-Bottom Plus (+) Sign for Price List & Menu */}
                {onOpenPriceList && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenPriceList(b);
                    }}
                    className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 h-5.5 bg-gradient-to-r from-amber-400 via-orange-400 to-[#FF2D55] hover:brightness-110 active:scale-95 text-black px-2 rounded-full font-black text-[9px] shadow-lg shadow-black/80 flex items-center gap-1 border border-white/40 cursor-pointer backdrop-blur-md transition-all"
                    title="عرض وتعديل قائمة الأسعار والمنيو (+)"
                  >
                    <span className="w-3.5 h-3.5 rounded-full bg-black text-amber-400 flex items-center justify-center font-black text-[10px] leading-none">
                      +
                    </span>
                    <span className="font-extrabold whitespace-nowrap text-white drop-shadow">
                      الأسعار والطلب
                    </span>
                  </button>
                )}

                {/* Category & Distance overlay */}
                <div className="absolute bottom-2 start-2 flex items-center gap-1 flex-wrap">
                  <span className="bg-black/70 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10">
                    {b.cat}
                  </span>
                  {b.distanceKm !== undefined && (
                    <span className="bg-emerald-600/80 backdrop-blur-md text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <Navigation className="w-2 h-2 fill-white" />
                      <span>{formatDistance(b.distanceKm, lang)}</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-xs font-black text-white group-hover:text-[#FF2D55] transition line-clamp-1">
                      {b.name}
                    </h3>
                    {b.verified === 1 && (
                      <CheckCircle className="w-3 h-3 fill-[#20D5EC] text-black shrink-0" />
                    )}
                  </div>

                  <a
                    href={
                      b.lat && b.lng
                        ? `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.city} ${b.addr}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-emerald-300/90 hover:text-emerald-300 flex items-center gap-1 mt-0.5 line-clamp-1 underline decoration-emerald-400/40 cursor-pointer"
                    title="اضغط لفتح العنوان واللوكيشن على الخريطة GPS"
                  >
                    <MapPin className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    <span>{b.city} - {b.addr}</span>
                  </a>
                </div>

                {/* Service Price & Sleek Mini Actions */}
                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between">
                  <div className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full">
                    {b.services?.[0]
                      ? formatServicePrice(b.services[0].p, currentCurrency)
                      : '350 ج.م'}
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        if (allPhones.length > 1) {
                          setPhoneSelectorBiz(b);
                        } else {
                          window.open(`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}`, '_blank');
                        }
                      }}
                      className="w-6 h-6 bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white rounded-full flex items-center justify-center transition relative active:scale-90 cursor-pointer border border-[#25D366]/30"
                      title={t.whatsapp}
                    >
                      <MessageCircle className="w-3 h-3" />
                      {allPhones.length > 1 && (
                        <span className="absolute -top-1 -end-1 bg-[#25D366] text-white text-[7px] font-bold w-3 h-3 rounded-full flex items-center justify-center">
                          {allPhones.length}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        if (allPhones.length > 1) {
                          setPhoneSelectorBiz(b);
                        } else {
                          window.location.href = `tel:${b.phone}`;
                        }
                      }}
                      className="w-6 h-6 bg-white/10 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition active:scale-90 cursor-pointer border border-white/15"
                      title={t.call}
                    >
                      <Phone className="w-3 h-3" />
                    </button>

                    {/* Direct Transport Tracking Dispatch button */}
                    {(b.trackingCell?.enabled || ['تاكسي وأجرة', 'موتوسيكل ودليفري', 'سيارات ليموزين', 'أتوبيسات رحلات وسياحة وعمرة', 'شحن ونقل ثقيل'].includes(b.cat)) && onOpenTransportModal && (
                      <button
                        onClick={() => onOpenTransportModal(b)}
                        className="w-6 h-6 bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-110 text-black font-black rounded-full flex items-center justify-center transition shadow text-[9px] active:scale-90 cursor-pointer"
                        title="طلب فوري وتتبع مباشر GPS 🛰️"
                      >
                        <span>🚕</span>
                      </button>
                    )}

                    {/* Owner Lock / Edit Page button */}
                    <button
                      onClick={() => onOpenOwnerLock?.(b)}
                      className="w-6 h-6 bg-gradient-to-br from-[#FF6B35]/25 to-[#FFD700]/25 hover:from-[#FF6B35] hover:to-[#FFD700] text-amber-300 hover:text-black rounded-full flex items-center justify-center transition active:scale-90 cursor-pointer border border-amber-400/30"
                      title="🔐 تعديل صفحتي برقم سري (صاحب النشاط)"
                    >
                      <KeyRound className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Multi-phone numbers quick modal */}
      {phoneSelectorBiz && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPhoneSelectorBiz(null)}
        >
          <div
            className="bg-neutral-900 border border-white/15 rounded-3xl p-5 w-full max-w-sm text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPhoneSelectorBiz(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              ✕
            </button>
            <h4 className="font-black text-sm text-center mb-1">
              {phoneSelectorBiz.name}
            </h4>
            <p className="text-[11px] text-white/60 text-center mb-4">
              {t.contactNumbers}
            </p>
            <div className="space-y-2">
              {(phoneSelectorBiz.phones || [phoneSelectorBiz.phone]).map((ph, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between"
                >
                  <span className="font-bold text-xs tracking-wider dir-ltr">
                    {ph}
                  </span>
                  <div className="flex gap-1.5">
                    <a
                      href={`https://wa.me/${ph.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#25D366] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>واتساب</span>
                    </a>
                    <a
                      href={`tel:${ph}`}
                      className="px-2.5 py-1 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
