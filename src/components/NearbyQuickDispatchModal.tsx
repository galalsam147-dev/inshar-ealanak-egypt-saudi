import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Phone, MessageCircle, Navigation, MapPin, 
  Car, Bike, Truck, Bus, ShieldCheck, AlertTriangle, 
  CheckCircle2, Clock, Volume2, VolumeX, Sparkles, User, RefreshCw
} from 'lucide-react';
import { Business, SupportedLang } from '../types';
import { TripPaymentMethodsManager } from './TripPaymentMethodsManager';

interface NearbySubscriberDispatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  userCoords: { lat: number; lng: number } | null;
  onDetectLocation: () => void;
  onOpenLiveTracking?: (biz?: Business) => void;
  lang: SupportedLang;
}

export type ProximityServiceFilter = 'all' | 'taxi' | 'delivery' | 'services';

export const NearbyQuickDispatchModal: React.FC<NearbySubscriberDispatchModalProps> = ({
  isOpen,
  onClose,
  businesses,
  userCoords,
  onDetectLocation,
  onOpenLiveTracking,
  lang,
}) => {
  if (!isOpen) return null;

  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<ProximityServiceFilter>('all');
  const [callingBiz, setCallingBiz] = useState<Business | null>(null);
  const [callTimer, setCallTimer] = useState<number>(20);
  const [callAccepted, setCallAccepted] = useState<boolean>(false);
  const [callRejected, setCallRejected] = useState<boolean>(false);
  const [isRingingSound, setIsRingingSound] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active user coords fallback
  const userLat = userCoords?.lat || 30.0444;
  const userLng = userCoords?.lng || 31.2357;

  // Calculate distance in km
  const getDistanceKm = (biz: Business): number => {
    const lat = typeof biz.lat === 'number' ? biz.lat : (biz.lat ? parseFloat(String(biz.lat)) : (biz.trackingCell?.lat || 30.0444));
    const lng = typeof biz.lng === 'number' ? biz.lng : (biz.lng ? parseFloat(String(biz.lng)) : (biz.trackingCell?.lng || 31.2357));
    const dLat = (lat - userLat) * 111;
    const dLng = (lng - userLng) * 111 * Math.cos(userLat * (Math.PI / 180));
    const dist = Math.sqrt(dLat * dLat + dLng * dLng);
    return Math.max(0.4, parseFloat(dist.toFixed(1)));
  };

  // Find all subscribers / drivers matching filter and active status
  const nearbySubscribers = useMemo(() => {
    return businesses
      .map((b) => {
        const dist = getDistanceKm(b);
        const isTaxi = b.cat.includes('تاكسي') || b.trackingCell?.vehicleType === 'taxi';
        const isDelivery = b.cat.includes('دليفري') || b.cat.includes('موتوسيكل') || b.hasDelivery;
        const isTransport = b.trackingCell?.enabled || isTaxi || isDelivery;
        
        // Status: "available" or "active" or check tracking cell
        const isAvailable = b.trackingCell?.currentStatus !== 'busy' && b.status === 'active';

        return {
          ...b,
          distanceKm: dist,
          isTaxi,
          isDelivery,
          isTransport,
          isAvailable,
        };
      })
      .filter((b) => {
        if (activeTab === 'taxi') return b.isTaxi;
        if (activeTab === 'delivery') return b.isDelivery;
        if (activeTab === 'services') return !b.isTransport;
        return true;
      })
      .sort((a, b) => {
        // Active/available first, then nearest distance
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return a.distanceKm - b.distanceKm;
      });
  }, [businesses, activeTab, userLat, userLng]);

  // Audio synthesize ringtone
  useEffect(() => {
    if (!callingBiz || !soundEnabled || callAccepted || callRejected) return;

    let audioCtx: AudioContext | null = null;
    let osc: OscillatorNode | null = null;
    let gain: GainNode | null = null;
    let intervalId: any = null;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();

        const playRingBurst = () => {
          if (!audioCtx || audioCtx.state === 'closed') return;
          try {
            osc = audioCtx.createOscillator();
            gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, audioCtx.currentTime); // Standard ring frequency
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.8);
          } catch (e) {
            // Ignore audio interruption
          }
        };

        playRingBurst();
        intervalId = setInterval(playRingBurst, 2500);
      }
    } catch (e) {
      console.warn('Audio not allowed:', e);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (audioCtx && audioCtx.state !== 'closed') {
        try { audioCtx.close(); } catch {}
      }
    };
  }, [callingBiz, soundEnabled, callAccepted, callRejected]);

  // Countdown timer for incoming call simulation
  useEffect(() => {
    if (!callingBiz) return;

    setCallTimer(20);
    setCallAccepted(false);
    setCallRejected(false);

    const timer = setInterval(() => {
      setCallTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCallRejected(true); // Auto reject / timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [callingBiz]);

  const handleStartCall = (biz: Business) => {
    setCallingBiz(biz);
    setCallAccepted(false);
    setCallRejected(false);
  };

  const handleAcceptCall = () => {
    setCallAccepted(true);
    setCallRejected(false);
  };

  const handleRejectCall = () => {
    setCallRejected(true);
    setCallAccepted(false);
  };

  const hasAnyAvailable = nearbySubscribers.some((s) => s.isAvailable);

  return (
    <div 
      className="fixed inset-0 z-[170] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div 
        className="bg-[#0f111a] border border-amber-400/40 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl flex flex-col my-auto text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF2D55] p-3.5 sm:p-4 flex items-center justify-between text-black">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-black text-amber-400 flex items-center justify-center font-black shadow-md border border-amber-300/30 text-lg">
              📡
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-black flex items-center gap-1.5">
                <span>الاتصال بالقرب من الموقع (طلب فوري)</span>
                <span className="text-[10px] bg-black text-amber-300 font-bold px-2 py-0.5 rounded-full">
                  GPS مباشر ⚡
                </span>
              </h3>
              <p className="text-[10px] sm:text-[11px] text-black/80 font-medium">
                اتصال سريع بالمشتركين الأقرب جغرافياً • قبول أو رفض مباشر ومتابعة حية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-black transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User GPS Location Bar */}
        <div className="bg-neutral-900 border-b border-white/10 px-3 py-2 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-white/80 truncate">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">
              موقعك: <b>{userCoords ? `${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)}` : 'جاري الرصد التلقائي...'}</b>
            </span>
          </div>

          <button
            type="button"
            onClick={onDetectLocation}
            className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-xl text-[10px] font-black shrink-0 transition flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            <span>تحديث موقعي 📍</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 p-2.5 bg-neutral-950/80 border-b border-white/10 overflow-x-auto text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer ${
              activeTab === 'all'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            الكل ({businesses.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('taxi')}
            className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'taxi'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Car className="w-3.5 h-3.5" />
            <span>تاكسي وأجرة</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('delivery')}
            className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'delivery'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>دليفري وطلبات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1.5 rounded-xl font-black transition cursor-pointer flex items-center gap-1 ${
              activeTab === 'services'
                ? 'bg-amber-400 text-black shadow-md'
                : 'bg-white/5 text-white/70 hover:bg-white/10'
            }`}
          >
            <span>🏢 حرف وخدمات ومحامين</span>
          </button>
        </div>

        {/* Interactive Calling Screen (اتصال عليه وهو يقبل أو يرفض) */}
        {callingBiz && (
          <div className="bg-gradient-to-b from-neutral-900 to-[#121626] border-b border-amber-400/40 p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                <span>
                  {!callAccepted && !callRejected && `جاري الاتصال والطلب بالقرب من موقعك (${callTimer} ثانية)...`}
                  {callAccepted && '🎉 تم قبول الطلب من الكابتن / المشترك بنجاح!'}
                  {callRejected && '⚠️ تعذر الرد أو تم رفض الطلب (الكابتن غير متاح حالياً)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white/60 hover:text-white p-1 rounded-lg"
                title={soundEnabled ? 'كتم الرنين' : 'تشغيل الرنين'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            {/* Target Subscriber Calling Card */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 border border-amber-400/30 shrink-0">
                  <img
                    src={callingBiz.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'}
                    alt={callingBiz.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">{callingBiz.name}</h4>
                  <div className="text-[10px] text-white/60 flex items-center gap-2 mt-0.5">
                    <span>{callingBiz.cat}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{getDistanceKm(callingBiz)} كم منك</span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-mono block">
                    {callingBiz.phone}
                  </span>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="text-end">
                {!callAccepted && !callRejected && (
                  <span className="text-[10px] font-black bg-amber-400 text-black px-2.5 py-1 rounded-full animate-pulse shadow">
                    جاري الرنين 📲
                  </span>
                )}
                {callAccepted && (
                  <span className="text-[10px] font-black bg-emerald-500 text-black px-2.5 py-1 rounded-full shadow">
                    مقبول ✓ متوجه إليك
                  </span>
                )}
                {callRejected && (
                  <span className="text-[10px] font-black bg-red-500 text-white px-2.5 py-1 rounded-full shadow">
                    مرفوض / مشغول ✕
                  </span>
                )}
              </div>
            </div>

            {/* Simulated Driver Accept / Reject Controls (محاكاة هاتف السائق/المشترك لقبول ورفض الطلب) */}
            {!callAccepted && !callRejected && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                <div className="text-[10px] text-white/70 text-center font-bold">
                  📲 شاشة المشترك/الكابتن (اضغط لمحاكاة قبول أو رفض الكابتن):
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleAcceptCall}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>قبول الطلب (Accept)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRejectCall}
                    className="bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-red-600/20 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                    <span>رفض الطلب (Decline)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Post-Accept Actions */}
            {callAccepted && (
              <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-2xl p-3 space-y-2 animate-in fade-in">
                <p className="text-[11px] text-emerald-200">
                  ✓ الكابتن وافق على مشوارك/طلبك ويتحرك الآن نحو موقعك. يمكنك متابعة مسار المركبة حياً أو التواصل عبر الواتساب والهاتف:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={`tel:${callingBiz.phone}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>اتصال بالسائق</span>
                  </a>

                  <a
                    href={`https://wa.me/${callingBiz.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${callingBiz.name}، أنا طلبتك الآن عبر برنامج إعلانك وأنتظر وصولك إلى موقعي: https://maps.google.com/?q=${userLat},${userLng}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-black" />
                    <span>واتساب الكابتن</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenLiveTracking) {
                        onClose();
                        onOpenLiveTracking(callingBiz);
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow cursor-pointer"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>تتبع الـ GPS المباشر 🛰️</span>
                  </button>
                </div>

                {/* Trip Payment Numbers & Fare Management (إضافة، تعديل، حذف أرقام دفع الرحلة) */}
                <TripPaymentMethodsManager
                  storageKey={callingBiz.phone}
                  initialMethods={callingBiz.trackingCell?.tripPaymentMethods}
                  captainName={callingBiz.name}
                  captainPhone={callingBiz.phone}
                  currentFareEgp={callingBiz.trackingCell?.minimumTripPriceEgp || 35}
                  allowFareEdit={true}
                />
              </div>
            )}

            {/* Post-Reject State (Try another nearby subscriber) */}
            {callRejected && (
              <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3 space-y-2 text-start animate-in fade-in">
                <p className="text-[11px] text-red-200 font-bold">
                  الكابتن اعتذر عن استقبال الطلب حالياً. يرجى اختيار مشترك أو تاكسي آخر من القائمة بالأسفل:
                </p>
                <button
                  type="button"
                  onClick={() => setCallingBiz(null)}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold py-1.5 px-3 rounded-xl text-xs transition cursor-pointer"
                >
                  العودة للقائمة واختيار كابتن آخر
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State Banner (في حالة عدم وجود تاكسي أو مشتركين متاحين) */}
        {!hasAnyAvailable && (
          <div className="p-4 m-3 bg-red-950/60 border-2 border-red-500/80 rounded-2xl text-center space-y-2 shadow-xl animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center mx-auto text-2xl font-black">
              ⚠️
            </div>
            <h4 className="text-sm font-black text-white">
              لا يوجد أي حالة للطلب • لا يوجد تاكسي أو مشترك متاح
            </h4>
            <p className="text-[11px] text-white/70 max-w-md mx-auto leading-relaxed">
              كافة الكباتن والمشتركين في نطاق موقعك الحالي غير نشطين أو في عطلة الآن. يمكنك توسيع نطاق البحث أو المحاولة مجدداً بعد قليل.
            </p>
          </div>
        )}

        {/* List of Nearby Subscribers */}
        <div className="p-3 sm:p-4 space-y-2.5 max-h-[50vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-white/60">
            <span>المشتركون المتاحون بالقرب منك:</span>
            <span>{nearbySubscribers.length} نتيجة</span>
          </div>

          {nearbySubscribers.map((biz) => {
            const isOnline = biz.isAvailable;
            const dist = getDistanceKm(biz);

            return (
              <div
                key={biz.id}
                className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 ${
                  isOnline
                    ? 'bg-neutral-900/90 border-white/10 hover:border-amber-400/50'
                    : 'bg-neutral-950/50 border-white/5 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden bg-white/10 border border-white/10 shrink-0 relative">
                    <img
                      src={biz.images?.[0] || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400'}
                      alt={biz.name}
                      className="w-full h-full object-cover"
                    />
                    {isOnline && (
                      <span className="absolute bottom-1 end-1 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-black" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h5 className="text-xs font-black text-white">{biz.name}</h5>
                      <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.2 rounded">
                        {biz.cat}
                      </span>
                    </div>

                    <div className="text-[10px] text-white/60 flex items-center gap-2">
                      <span className="text-emerald-400 font-bold font-mono">📍 {dist} كم</span>
                      <span>•</span>
                      <span>{biz.addr || biz.city}</span>
                    </div>

                    {/* Status Badge: يفتح نشط / يفتح غير نشط */}
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                        isOnline
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-neutral-800 text-neutral-400'
                      }`}>
                        {isOnline ? '🟢 يفتح نشط (شغال)' : '⚪ يفتح غير نشط (في عطلة)'}
                      </span>

                      {biz.trackingCell && (
                        <span className="text-[9px] text-amber-300 font-mono">
                          لوحة: {biz.trackingCell.vehiclePlate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Action Button: الاتصال بالقرب */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  <button
                    type="button"
                    disabled={!isOnline}
                    onClick={() => handleStartCall(biz)}
                    className={`font-black text-xs px-3 py-2 rounded-xl transition flex items-center justify-center gap-1 shadow cursor-pointer ${
                      isOnline
                        ? 'bg-amber-400 hover:bg-amber-300 text-black active:scale-95'
                        : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                    }`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>طلب واتصال 📲</span>
                  </button>

                  <a
                    href={`https://wa.me/${biz.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${biz.name}، أنا قريب منك بمسافة ${dist} كم وأرغب في طلب خدمتك عبر برنامج إعلانك.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] text-[10px] font-black py-1 px-2 rounded-lg text-center transition"
                  >
                    واتساب سريع
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t border-white/10 p-3 sm:p-4 flex items-center justify-between text-xs">
          <span className="text-white/60 text-[11px]">
            🛡️ جميع المشتركين معتمدون وفق الحصص والقانون ببرنامج إعلانك
          </span>

          <button
            type="button"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
