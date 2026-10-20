import React, { useState, useEffect, useCallback } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  X, Sparkles, Navigation, ShoppingBag, Car, Bike, 
  MapPin, Phone, MessageCircle, Globe, Smartphone, 
  Coins, Volume2, VolumeX, Bell, BellRing, Play, Pause,
  RotateCcw, ShieldCheck, ShieldAlert, Music, Award, Compass
} from 'lucide-react';
import { Business, SupportedLang } from '../types';

interface OrderNowDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onSelectCategory: (category: string) => void;
  onDetectLocation: () => void;
  hasUserLocation: boolean;
  isLocating: boolean;
  onOpenAdd: () => void;
  onOpenSubscribersProgram: () => void;
  onOpenDelivery: () => void;
  onOpenTransportTracking?: () => void;
  onOpenNearbyDispatch?: () => void;
  onOpenOfficialDomain?: () => void;
  onOpenMusicBank?: () => void;
  onOpenAppInstall?: () => void;
  onOpenSecurityNotice?: () => void;
  onOpenCurrencyModal?: () => void;
  onOpenBookingModal?: (biz: Business) => void;
  onVoiceSearchStart?: () => void;
  lang: SupportedLang;
  onSelectLang?: (lang: SupportedLang) => void;
}

// Helper to play a real notification chime like Uber / Talabat
const playAlertChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Two-tone pleasant alert chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.setValueAtTime(880, now + 0.16); // A5
    osc2.frequency.setValueAtTime(293.66, now);
    osc2.frequency.setValueAtTime(440, now + 0.16);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.55);
    osc2.stop(now + 0.55);
  } catch {
    // Ignore audio context restrictions
  }
};

// Helper to speak alert message in Arabic or English
const speakAlertMessage = (text: string, isAr: boolean) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isAr ? 'ar-EG' : 'en-US';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch {
    // Ignore speech synthesis errors
  }
};

export const OrderNowDirectoryModal: React.FC<OrderNowDirectoryModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onSelectCategory,
  onDetectLocation,
  hasUserLocation,
  isLocating,
  onOpenAdd,
  onOpenSubscribersProgram,
  onOpenDelivery,
  onOpenTransportTracking,
  onOpenNearbyDispatch,
  onOpenOfficialDomain,
  onOpenMusicBank,
  onOpenAppInstall,
  onOpenSecurityNotice,
  onOpenCurrencyModal,
  onOpenBookingModal,
  onVoiceSearchStart,
  lang,
  onSelectLang,
}) => {
  const [localLang, setLocalLang] = useState<SupportedLang>(lang === 'en' ? 'en' : 'ar');

  useEffect(() => {
    if (lang === 'ar' || lang === 'en') {
      setLocalLang(lang);
    }
  }, [lang]);

  const activeLang: SupportedLang = onSelectLang ? (lang === 'en' ? 'en' : 'ar') : localLang;
  const isAr = activeLang === 'ar';

  const handleSwitchLanguage = (target: SupportedLang) => {
    setLocalLang(target);
    if (onSelectLang) {
      onSelectLang(target);
    }
  };

  // Tracking & Alert Service State (Order vs Taxi)
  const [serviceMode, setServiceMode] = useState<'taxi' | 'order'>('taxi');
  const [progress, setProgress] = useState<number>(45);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [speedKmh, setSpeedKmh] = useState<number>(44);
  const [liveAlertBanner, setLiveAlertBanner] = useState<string | null>(null);
  const [copiedTrackingLink, setCopiedTrackingLink] = useState<boolean>(false);

  // Trigger a live visual + audio alert
  const triggerLiveAlert = useCallback(
    (arMsg: string, enMsg: string) => {
      const msg = isAr ? arMsg : enMsg;
      setLiveAlertBanner(msg);
      if (soundAlertsEnabled) {
        playAlertChime();
        speakAlertMessage(msg, isAr);
      }
    },
    [isAr, soundAlertsEnabled]
  );

  // Current stage (1 to 4) based on progress
  const currentStage = progress >= 95 ? 4 : progress >= 65 ? 3 : progress >= 30 ? 2 : 1;

  // Automatic simulation tick
  useEffect(() => {
    if (!isOpen || !isSimulating) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsSimulating(false);
          return 100;
        }
        const next = Math.min(100, prev + 2);
        setSpeedKmh(Math.floor(34 + Math.random() * 18));

        // Fire arrival/approaching notifications at milestones
        if (prev < 65 && next >= 65) {
          if (serviceMode === 'taxi') {
            triggerLiveAlert(
              '🔔 تنبيه فوري: الكابتن على بُعد دقيقتين من موقعك! استعد للركوب (كود الأمان 4829)',
              '🔔 Live Alert: Your Taxi Captain is 2 minutes away! Get ready (Security PIN: 4829)'
            );
          } else {
            triggerLiveAlert(
              '🔔 تنبيه فوري: كابتن الدليفري استلم طلبك وهو في الطريق إليك الآن!',
              '🔔 Live Alert: Courier picked up your order and is heading to your location!'
            );
          }
        } else if (prev < 98 && next >= 98) {
          if (serviceMode === 'taxi') {
            triggerLiveAlert(
              '✅ تنبيه وصول: الكابتن وصل أمامك الآن! لوحة السيارة: ط س ق 4821',
              '✅ Arrival Alert: Your Captain has arrived outside! Plate: T S Q 4821'
            );
          } else {
            triggerLiveAlert(
              '✅ تنبيه وصول الطلب: كابتن الدليفري وصل عند الباب الآن! بالهناء والشفاء',
              '✅ Order Arrived: Delivery courier is at your door now! Enjoy your order'
            );
          }
        }
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, [isOpen, isSimulating, serviceMode, triggerLiveAlert]);

  if (!isOpen) return null;

  const remainingKm = Math.max(0, ((100 - progress) * 0.065)).toFixed(1);
  const etaMinutes = Math.max(1, Math.round((100 - progress) * 0.16));

  // فئات الأنشطة مع الترجمة الثنائية (عربي / إنجليزي)
  const ACTIVITY_CATEGORIES = [
    { name: 'الكل', enName: 'All Categories', icon: '🌟' },
    { name: 'مطاعم', enName: 'Restaurants', icon: '🍔' },
    { name: 'سندوتشات ووجبات سريعة', enName: 'Fast Food & Sandwiches', icon: '🌯' },
    { name: 'كافيهات', enName: 'Cafes & Coffee', icon: '☕' },
    { name: 'تاكسي وأجرة', enName: 'Taxi & Rides', icon: '🚕' },
    { name: 'موتوسيكل ودليفري', enName: 'Motorcycle & Delivery', icon: '🛵' },
    { name: 'سيارات ليموزين', enName: 'VIP Limousine', icon: '🚘' },
    { name: 'أتوبيسات رحلات وسياحة وعمرة', enName: 'Travel & Tourism Buses', icon: '🚌' },
    { name: 'شحن ونقل ثقيل', enName: 'Heavy Freight & Cargo', icon: '🚛' },
    { name: 'فنادق ومنتجعات', enName: 'Hotels & Resorts', icon: '🏨' },
    { name: 'أطباء وعيادات', enName: 'Doctors & Clinics', icon: '🩺' },
    { name: 'صيدليات ومستشفيات', enName: 'Pharmacies & Hospitals', icon: '💊' },
    { name: 'كوافير وتجميل', enName: 'Beauty & Salons', icon: '💇' },
    { name: 'عقارات التجمع والكمبوندات', enName: 'Real Estate & Compounds', icon: '🏢' },
    { name: 'حرفيين وصيانة منزلية', enName: 'Home Maintenance', icon: '🛠️' },
    { name: 'سباكة وأدوات صحية', enName: 'Plumbing & Sanitary', icon: '🔧' },
    { name: 'عمال ونقل أثاث', enName: 'Furniture Moving', icon: '📦' },
    { name: 'اتوبيس وسيارات مدرسة', enName: 'School Buses', icon: '🎒' },
    { name: 'خدمات كمبوندات والتجمع', enName: 'Compound Services', icon: '🏡' },
    { name: 'تسوق ومولات', enName: 'Shopping & Malls', icon: '🛍️' },
    { name: 'سيارات ومراكز خدمة', enName: 'Car Service Centers', icon: '🚗' },
    { name: 'محامين', enName: 'Lawyers & Legal', icon: '⚖️' },
    { name: 'محاسبين قانونيين', enName: 'Certified Accountants', icon: '📊' },
    { name: 'سياحة ورحلات', enName: 'Travel & Flights', icon: '✈️' },
  ];

  const firstAvailableBiz = businesses.find((b) => b.status === 'active') || businesses[0];

  const handleStageSelect = (stageNum: number) => {
    if (stageNum === 1) {
      setProgress(15);
      triggerLiveAlert(
        serviceMode === 'taxi'
          ? '📋 تم تأكيد طلب التاكسي وتعيين الكابتن محمود الشريف'
          : '📋 تم استلام وتأكيد طلبك في المطعم وجاري البدء',
        serviceMode === 'taxi'
          ? '📋 Taxi ride confirmed & Captain Mahmoud assigned'
          : '📋 Your order has been received and confirmed by the restaurant'
      );
    } else if (stageNum === 2) {
      setProgress(45);
      triggerLiveAlert(
        serviceMode === 'taxi'
          ? '🚕 الكابتن يتحرك الآن في طريقه إلى موقعك بالـ GPS'
          : '🍳 المطعم يقوم بتجهيز وتغليف طلبك الآن بأعلى جودة',
        serviceMode === 'taxi'
          ? '🚕 Captain is now driving to your pickup location via GPS'
          : '🍳 Restaurant is preparing and packaging your order now'
      );
    } else if (stageNum === 3) {
      setProgress(75);
      triggerLiveAlert(
        serviceMode === 'taxi'
          ? '🔔 تنبيه اقتراب: الكابتن على بُعد دقيقتين فقط منك! كود الأمان PIN: 4829'
          : '🛵 تنبيه تحرك: كابتن الدليفري استلم الطلب وهو في الطريق إليك الآن!',
        serviceMode === 'taxi'
          ? '🔔 Approaching Alert: Captain is 2 mins away! Security PIN: 4829'
          : '🛵 Courier Picked Up: Delivery captain is on the way to you now!'
      );
    } else {
      setProgress(100);
      setIsSimulating(false);
      triggerLiveAlert(
        serviceMode === 'taxi'
          ? '✅ تنبيه الوصول: الكابتن وصل أمامك الآن! رحلة آمنة وسعيدة'
          : '✅ تنبيه الوصول: كابتن الدليفري وصل عند الباب الآن! تفضل باستلام طلبك',
        serviceMode === 'taxi'
          ? '✅ Arrival Alert: Captain has arrived at your pickup point! Have a safe ride'
          : '✅ Arrival Alert: Delivery captain has arrived at your door! Enjoy'
      );
    }
  };

  const liveTrackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?track=${serviceMode}`;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top-Center Close Button Above the Page (إغلاق الصفحة أعلى الشاشة في المنتصف فوق الصفحة) */}
      <div
        className="mb-2 flex items-center justify-center z-30"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[0_4px_20px_rgba(220,38,38,0.85)] border-2 border-white transition cursor-pointer active:scale-95"
          title={isAr ? 'غلق الصفحة (✕)' : 'Close Page (✕)'}
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>{isAr ? 'غلق الصفحة' : 'Close Page'}</span>
        </button>
      </div>

      <div
        className="w-full max-w-xl max-h-[84vh] bg-gradient-to-b from-neutral-950 via-zinc-950 to-black border border-amber-400/35 rounded-3xl flex flex-col shadow-2xl overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar: خدماتي - خدمة التنبيه والتتبع للطلب والتاكسي (عربي / إنجليزي) */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between gap-2 bg-black/80 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-[#FF2D55] text-black flex items-center justify-center font-black text-lg shrink-0 shadow-md">
              ⚡
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white truncate">
                  {isAr
                    ? 'خدماتي • خدمة التنبيه والتتبع للطلب والتاكسي'
                    : 'My Services • Order & Taxi Alert & Tracking'}
                </h2>
                <span className="text-[9px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-black animate-pulse">
                  {isAr ? 'تتبع وتنبيه حي 🔔' : 'Live GPS & Alerts 🔔'}
                </span>
              </div>
              <p className="text-[10px] text-amber-300/90 truncate">
                {isAr
                  ? 'تتبع حي مباشر بالـ GPS للطلب والتاكسي بدعم اللغتين العربية والإنجليزية'
                  : 'Real-time GPS live tracking for Orders & Taxi with full Arabic & English support'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Bilingual Switcher Pill (عربي / English) */}
            <div className="flex items-center bg-white/10 p-0.5 rounded-full border border-amber-400/40">
              <button
                type="button"
                onClick={() => handleSwitchLanguage('ar')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                  isAr ? 'bg-amber-400 text-black shadow' : 'text-white/75 hover:text-white'
                }`}
              >
                عربي 🇪🇬
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                  !isAr ? 'bg-amber-400 text-black shadow' : 'text-white/75 hover:text-white'
                }`}
              >
                EN 🇬🇧
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
              title={isAr ? 'إغلاق (✕)' : 'Close (✕)'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-4">
          {/* ===================================================================== */}
          {/* 1. HERO SECTION: خدمة التنبيه والتتبع للطلب والتاكسي مثل البرامج الأخرى بالظبط */}
          {/* ===================================================================== */}
          <div className="bg-gradient-to-br from-neutral-900 via-emerald-950/35 to-black border-2 border-amber-400/50 rounded-2xl p-3 sm:p-3.5 space-y-3 shadow-xl">
            {/* Header & Mode Switcher */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <BellRing className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
                <span className="text-xs sm:text-sm font-black text-amber-300">
                  {isAr
                    ? 'خدمة التنبيه والتتبع المباشر (للطلب والتاكسي):'
                    : 'Live Alert & GPS Tracking (Orders & Taxi):'}
                </span>
              </div>

              {/* Sound & Voice Alert Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !soundAlertsEnabled;
                  setSoundAlertsEnabled(next);
                  if (next) {
                    playAlertChime();
                    speakAlertMessage(
                      isAr ? 'تم تفعيل التنبيه الصوتي للطلب والتاكسي' : 'Voice and sound alerts enabled',
                      isAr
                    );
                  }
                }}
                className={`px-2.5 py-1 rounded-full text-[10px] font-black flex items-center gap-1 border transition cursor-pointer ${
                  soundAlertsEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                    : 'bg-white/10 text-white/60 border-white/15'
                }`}
              >
                {soundAlertsEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>
                  {isAr
                    ? soundAlertsEnabled
                      ? 'التنبيه الصوتي: مفعل 🔔'
                      : 'التنبيه الصوتي: صامت 🔕'
                    : soundAlertsEnabled
                    ? 'Voice Alert: ON 🔔'
                    : 'Voice Alert: Muted 🔕'}
                </span>
              </button>
            </div>

            {/* Dual Mode Selector: تتبع التاكسي 🚕 vs تتبع الطلب والدليفري 🛵 */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setServiceMode('taxi');
                  setProgress(45);
                  setIsSimulating(true);
                  triggerLiveAlert(
                    '🚕 تم تفعيل رادار تتبع وتنبيه التاكسي المباشر بالـ GPS',
                    '🚕 Live Taxi GPS Tracking & Arrival Alert activated'
                  );
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer active:scale-95 ${
                  serviceMode === 'taxi'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-black border-white shadow-lg shadow-amber-500/25'
                    : 'bg-black/60 text-white/80 border-white/15 hover:bg-white/10'
                }`}
              >
                <Car className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'تتبع وتنبيه التاكسي 🚕' : 'Taxi Track & Alert 🚕'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setServiceMode('order');
                  setProgress(55);
                  setIsSimulating(true);
                  triggerLiveAlert(
                    '🛵 تم تفعيل رادار تتبع وتنبيه الطلب والدليفري المباشر',
                    '🛵 Live Order & Delivery Tracking & Alert activated'
                  );
                }}
                className={`py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 border transition cursor-pointer active:scale-95 ${
                  serviceMode === 'order'
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-black border-white shadow-lg shadow-emerald-500/25'
                    : 'bg-black/60 text-white/80 border-white/15 hover:bg-white/10'
                }`}
              >
                <Bike className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'تتبع وتنبيه الطلب 🛵' : 'Order Track & Alert 🛵'}</span>
              </button>
            </div>

            {/* Live Push Alert Banner */}
            {liveAlertBanner && (
              <div className="bg-gradient-to-r from-amber-500/25 via-emerald-500/25 to-amber-500/25 border border-amber-400 rounded-xl p-2.5 flex items-center justify-between gap-2 animate-pulse">
                <div className="flex items-center gap-2 text-[11px] font-black text-amber-200">
                  <Bell className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  <span>{liveAlertBanner}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setLiveAlertBanner(null)}
                  className="text-white/60 hover:text-white text-xs px-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Live Metrics Bar (ETA, Distance, Speed, Security PIN) */}
            <div className="bg-black/70 border border-white/10 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="font-black text-white">
                  {serviceMode === 'taxi'
                    ? isAr
                      ? 'كابتن محمود الشريف (تاكسي مكيف 🚕)'
                      : 'Capt. Mahmoud El-Sherif (A/C Taxi 🚕)'
                    : isAr
                    ? 'كابتن عمر الدسوقي (دليفري طلبات سريع 🛵)'
                    : 'Capt. Omar Desouky (Express Delivery 🛵)'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[10px] flex-wrap">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-lg font-black">
                  ⏱️ {isAr ? `الوصول: ${progress >= 100 ? 0 : etaMinutes} د` : `ETA: ${progress >= 100 ? 0 : etaMinutes}m`}
                </span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-lg font-black">
                  📍 {isAr ? `${remainingKm} كم` : `${remainingKm} km`}
                </span>
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/40 px-2 py-0.5 rounded-lg font-black">
                  🔒 PIN: 4829
                </span>
              </div>
            </div>

            {/* Interactive Live Google Map Preview inside خدماتي */}
            <div className="relative w-full h-44 sm:h-48 rounded-xl overflow-hidden border border-white/15 bg-neutral-950">
              {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
                <Map
                  mapId="DEMO_MAP_ID"
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  defaultCenter={{ lat: 30.0444, lng: 31.2357 }}
                  defaultZoom={14}
                  gestureHandling="greedy"
                  disableDefaultUI={true}
                  className="w-full h-full"
                >
                  {/* Start Marker */}
                  <AdvancedMarker
                    position={{ lat: 30.041, lng: 31.231 }}
                    title={isAr ? 'نقطة الانطلاق / المطعم' : 'Pickup / Restaurant'}
                  >
                    <Pin background="#f59e0b" borderColor="#ffffff" glyphColor="#000000" scale={0.95} />
                  </AdvancedMarker>

                  {/* Customer Destination Marker */}
                  <AdvancedMarker
                    position={{ lat: 30.049, lng: 31.241 }}
                    title={isAr ? 'موقع العميل' : 'Customer Location'}
                  >
                    <Pin background="#10b981" borderColor="#ffffff" glyphColor="#ffffff" scale={0.95} />
                  </AdvancedMarker>

                  {/* Live Moving Taxi / Delivery Vehicle Marker */}
                  <AdvancedMarker
                    position={{
                      lat: 30.041 + (0.008 * progress) / 100,
                      lng: 31.231 + (0.01 * progress) / 100,
                    }}
                    title={serviceMode === 'taxi' ? 'Taxi GPS' : 'Order Delivery GPS'}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-xl bg-black border-2 border-amber-400 flex items-center justify-center text-base shadow-xl">
                        {serviceMode === 'taxi' ? '🚕' : '🛵'}
                      </div>
                      <span className="bg-black/90 text-amber-300 border border-amber-400/50 text-[8.5px] font-black px-1.5 py-0.2 rounded-full mt-0.5 whitespace-nowrap shadow">
                        {speedKmh} {isAr ? 'كم/س' : 'km/h'}
                      </span>
                    </div>
                  </AdvancedMarker>
                </Map>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-xs">
                  {isAr ? 'خريطة التتبع المباشر GPS' : 'Live GPS Tracking Map'}
                </div>
              )}

              {/* Map Floating Controls */}
              <div className="absolute top-2 start-2 z-10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="bg-black/80 hover:bg-black text-white border border-white/20 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  {isSimulating ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
                  <span>{isSimulating ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProgress(15);
                    setIsSimulating(true);
                  }}
                  className="bg-black/80 hover:bg-black text-white border border-white/20 p-1 rounded-lg text-[10px] cursor-pointer"
                  title={isAr ? 'إعادة المسار' : 'Restart Route'}
                >
                  <RotateCcw className="w-3 h-3 text-sky-300" />
                </button>
              </div>

              {/* Instant Test Alert Button on Map */}
              <button
                type="button"
                onClick={() =>
                  triggerLiveAlert(
                    serviceMode === 'taxi'
                      ? '🔔 تنبيه فوري: الكابتن وصل الآن أمام موقعك! لوحة السيارة: ط س ق 4821 • كود الأمان 4829'
                      : '🔔 تنبيه فوري: طلبك وصل الآن مع كابتن الدليفري عند الباب! رقم الطلب #1042',
                    serviceMode === 'taxi'
                      ? '🔔 Instant Alert: Your Taxi Captain has arrived outside! Plate: T S Q 4821 • PIN: 4829'
                      : '🔔 Instant Alert: Your delivery order #1042 has arrived at your door!'
                  )
                }
                className="absolute bottom-2 end-2 z-10 bg-gradient-to-r from-[#FF2D55] to-amber-500 hover:brightness-110 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 cursor-pointer active:scale-95 border border-white/40"
              >
                <BellRing className="w-3 h-3 animate-bounce" />
                <span>{isAr ? 'تجربة جرس التنبيه بالوصول 🔔' : 'Test Arrival Alert Bell 🔔'}</span>
              </button>
            </div>

            {/* 4 Interactive Stages (مثل أوبر وطلبات بالظبط) */}
            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              {[
                {
                  stage: 1,
                  ar: serviceMode === 'taxi' ? '1. قبول الكابتن' : '1. تأكيد الطلب',
                  en: serviceMode === 'taxi' ? '1. Accepted' : '1. Confirmed',
                },
                {
                  stage: 2,
                  ar: serviceMode === 'taxi' ? '2. في الطريق' : '2. جاري التجهيز',
                  en: serviceMode === 'taxi' ? '2. En Route' : '2. Preparing',
                },
                {
                  stage: 3,
                  ar: serviceMode === 'taxi' ? '3. اقترب منك 🔔' : '3. مع الدليفري 🔔',
                  en: serviceMode === 'taxi' ? '3. Nearby 🔔' : '3. Out for Delivery',
                },
                {
                  stage: 4,
                  ar: serviceMode === 'taxi' ? '4. وصل الكابتن ✅' : '4. وصل الطلب ✅',
                  en: serviceMode === 'taxi' ? '4. Arrived ✅' : '4. Delivered ✅',
                },
              ].map((st) => (
                <button
                  key={st.stage}
                  type="button"
                  onClick={() => handleStageSelect(st.stage)}
                  className={`py-1.5 px-1 rounded-xl font-black text-center border transition cursor-pointer truncate ${
                    currentStage >= st.stage
                      ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-sm'
                      : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
                  }`}
                >
                  {isAr ? st.ar : st.en}
                </button>
              ))}
            </div>

            {/* Interactive Live Tracking Link Bar (رابط التتبع المفعل مباشرة) */}
            <div className="bg-black/80 border border-emerald-500/40 rounded-xl p-2.5 space-y-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-300">
                  <Compass className="w-3.5 h-3.5 animate-spin text-amber-400 shrink-0" />
                  <span>{isAr ? 'رابط التتبع المباشر (مفعل حياً بالـ GPS):' : 'Live GPS Tracking Link (Active):'}</span>
                </div>
                <span className="text-[9.5px] font-mono text-white/70 bg-white/5 px-2 py-0.5 rounded border border-white/10 truncate max-w-[200px]" dir="ltr">
                  {liveTrackingUrl}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsSimulating(true);
                    triggerLiveAlert(
                      serviceMode === 'taxi'
                        ? '🛰️ تم تفعيل رابط التتبع المباشر للتاكسي على الخريطة الحية!'
                        : '🛰️ تم تفعيل رابط التتبع المباشر للطلب والدليفري على الخريطة الحية!',
                      serviceMode === 'taxi'
                        ? '🛰️ Live Taxi GPS Tracking Link activated!'
                        : '🛰️ Live Order GPS Tracking Link activated!'
                    );
                    if (serviceMode === 'taxi' && onOpenTransportTracking) {
                      onClose();
                      onOpenTransportTracking();
                    } else if (serviceMode === 'order') {
                      onClose();
                      onOpenDelivery();
                    }
                  }}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer shadow"
                >
                  <Navigation className="w-3 h-3 fill-black" />
                  <span>{isAr ? 'فتح رابط التتبع' : 'Open Track Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(liveTrackingUrl);
                    setCopiedTrackingLink(true);
                    triggerLiveAlert(
                      '🔗 تم نسخ رابط التتبع المباشر بنجاح!',
                      '🔗 Live Tracking Link copied!'
                    );
                    setTimeout(() => setCopiedTrackingLink(false), 2500);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition cursor-pointer shadow"
                >
                  <span>{copiedTrackingLink ? (isAr ? 'تم النسخ ✓' : 'Copied ✓') : (isAr ? 'نسخ رابط التتبع' : 'Copy Link')}</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    isAr
                      ? `🛰️ رابط التتبع المباشر بالـ GPS:\n${liveTrackingUrl}`
                      : `🛰️ Live GPS Tracking Link:\n${liveTrackingUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-black py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1 transition shadow"
                >
                  <MessageCircle className="w-3 h-3 fill-black" />
                  <span>{isAr ? 'مشاركة الرابط' : 'Share Link'}</span>
                </a>
              </div>
            </div>

            {/* Action Buttons to Open Full-Screen Order or Taxi Tracker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {onOpenTransportTracking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTransportTracking();
                  }}
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 hover:brightness-110 active:scale-95 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md border border-white/50 cursor-pointer"
                >
                  <Car className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span>
                    {isAr
                      ? 'فتح شاشة تتبع وتنبيه التاكسي الكاملة 🚕'
                      : 'Open Full Taxi Alert & GPS Tracker 🚕'}
                  </span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDelivery();
                }}
                className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 text-black font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md border border-white/50 cursor-pointer"
              >
                <Bike className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span>
                  {isAr
                    ? 'فتح شاشة تتبع وتنبيه الطلبات والدليفري 🛵'
                    : 'Open Full Order & Delivery Tracker 🛵'}
                </span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 2. SECTION: Unified Add Ad & Subscribe */}
          {/* ===================================================================== */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-black to-neutral-900 border border-emerald-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>
                  {isAr
                    ? 'انشر إعلانك واشترك في المنصة:'
                    : 'Publish Your Ad & Subscribe:'}
                </span>
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                {isAr ? 'عروض حصرية' : 'Exclusive Offers'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAdd();
              }}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:brightness-110 active:scale-95 text-white font-black py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 border border-emerald-300/40 transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>
                {isAr
                  ? 'انشر إعلانك للجمهور والمشتركين مجاناً 🎁 (3 شهور مجاناً)'
                  : 'Publish Your Ad for Free 🎁 (3 Months Free Trial)'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenSubscribersProgram();
              }}
              className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-[#FF2D55] hover:brightness-110 active:scale-95 text-black font-black py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md border border-amber-300/40 transition cursor-pointer"
            >
              <Award className="w-4 h-4 fill-black" />
              <span>
                {isAr
                  ? 'اشترك الآن في الباقات السنوية والشهرية وتفعيل الدفع الإلكتروني 💎'
                  : 'Subscribe to Monthly & Annual Plans + Online Payment 💎'}
              </span>
            </button>
          </div>

          {/* ===================================================================== */}
          {/* 3. SECTION: Major Smart Commands (الأوامر السريعة التفاعلية) */}
          {/* ===================================================================== */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <span>{isAr ? '⚡ الأوامر الذكية السريعة في خدماتي:' : '⚡ Quick Smart Commands in My Services:'}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {/* أمر: اطلب الأقرب ليك (دليفري خاص) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDelivery();
                }}
                className="bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/40 p-2.5 rounded-xl flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer shadow-sm group"
              >
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 border border-amber-400/40 flex items-center justify-center text-lg group-hover:scale-110 transition">
                  🛵
                </div>
                <span className="text-[11px] font-black text-amber-300">
                  {isAr ? 'تتبع وطلب الدليفري' : 'Order & Track Delivery'}
                </span>
                <span className="text-[9px] text-white/60">
                  {isAr ? 'تنبيه وتتبع لحظي للطلب' : 'Live order alert & GPS'}
                </span>
              </button>

              {/* أمر: طلب وتتبع GPS (تاكسي وشحن) */}
              {onOpenTransportTracking && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTransportTracking();
                  }}
                  className="bg-yellow-950/40 hover:bg-yellow-900/60 border border-yellow-500/40 p-2.5 rounded-xl flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-400/40 flex items-center justify-center text-lg group-hover:scale-110 transition">
                    🚕
                  </div>
                  <span className="text-[11px] font-black text-yellow-300">
                    {isAr ? 'تتبع وتنبيه التاكسي GPS' : 'Taxi GPS & Alert'}
                  </span>
                  <span className="text-[9px] text-white/60">
                    {isAr ? 'تاكسي، ليموزين، نقل' : 'Taxi, Limo & Transport'}
                  </span>
                </button>
              )}

              {/* أمر: تحديد موقعي بالـ GPS */}
              <button
                type="button"
                onClick={() => {
                  onDetectLocation();
                }}
                className="bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 p-2.5 rounded-xl flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer shadow-sm group"
              >
                <div className="w-9 h-9 rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/40 flex items-center justify-center text-lg group-hover:scale-110 transition">
                  📍
                </div>
                <span className="text-[11px] font-black text-blue-300">
                  {isAr ? 'حدد موقعي بالـ GPS' : 'Detect My GPS Location'}
                </span>
                <span className="text-[9px] text-white/60">
                  {isLocating
                    ? isAr
                      ? 'جاري التحديد...'
                      : 'Locating...'
                    : hasUserLocation
                    ? isAr
                      ? 'تم التحديد ✓'
                      : 'Location Set ✓'
                    : isAr
                    ? 'إظهار الأقرب لك'
                    : 'Show Nearest to Me'}
                </span>
              </button>

              {/* أمر: اتصال بالقرب ⚡ */}
              {onOpenNearbyDispatch && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNearbyDispatch();
                  }}
                  className="bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 p-2.5 rounded-xl flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer shadow-sm group"
                >
                  <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-400 border border-purple-400/40 flex items-center justify-center text-lg group-hover:scale-110 transition">
                    📡
                  </div>
                  <span className="text-[11px] font-black text-purple-300">
                    {isAr ? 'اتصال بالقرب (رادار) ⚡' : 'Nearby Radar Dispatch ⚡'}
                  </span>
                  <span className="text-[9px] text-white/60">
                    {isAr ? 'اتصال وتنبيه فوري بالـ GPS' : 'Instant GPS Radar & Alert'}
                  </span>
                </button>
              )}

              {/* أمر: بحث صوتي فويس */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onVoiceSearchStart) onVoiceSearchStart();
                }}
                className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 p-2.5 rounded-xl flex flex-col items-center text-center gap-1 transition active:scale-95 cursor-pointer shadow-sm group"
              >
                <div className="w-9 h-9 rounded-full bg-rose-500/20 text-rose-400 border border-rose-400/40 flex items-center justify-center text-lg group-hover:scale-110 transition">
                  🎙️
                </div>
                <span className="text-[11px] font-black text-rose-300">
                  {isAr ? 'بحث بالصوت (الميك)' : 'Voice Search (Mic)'}
                </span>
                <span className="text-[9px] text-white/60">
                  {isAr ? 'تحدث بالعربي أو الإنجليزي' : 'Speak in Arabic or English'}
                </span>
              </button>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 4. SECTION: All Activities & Categories Grid */}
          {/* ===================================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/90 flex items-center gap-1.5">
                <span>
                  {isAr
                    ? '📁 جميع الأنشطة التجارية والخدمات:'
                    : '📁 All Business Categories & Services:'}
                </span>
              </h3>
              <span className="text-[10px] text-white/50 font-mono">
                {ACTIVITY_CATEGORIES.length} {isAr ? 'تصنيف نشط' : 'Categories'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {ACTIVITY_CATEGORIES.map((act) => {
                const count =
                  act.name === 'الكل'
                    ? businesses.length
                    : businesses.filter((b) => b.cat === act.name).length;

                return (
                  <button
                    key={act.name}
                    type="button"
                    onClick={() => {
                      onSelectCategory(act.name);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/30 flex items-center gap-2 transition cursor-pointer text-start active:scale-95 group"
                  >
                    <span className="text-lg shrink-0 group-hover:scale-110 transition">
                      {act.icon}
                    </span>
                    <div className="overflow-hidden">
                      <span className="text-[11px] font-bold text-white block truncate">
                        {isAr ? act.name : act.enName}
                      </span>
                      <span className="text-[9px] text-amber-400 font-mono font-bold">
                        {count} {isAr ? 'مشترك' : 'items'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ===================================================================== */}
          {/* 5. SECTION: Small Utility Controls Row */}
          {/* ===================================================================== */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-bold text-white/60 block">
              {isAr ? 'الأدوات والروابط الرسمية:' : 'Official Tools & Links:'}
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {onOpenOfficialDomain && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenOfficialDomain();
                  }}
                  className="bg-black/60 hover:bg-neutral-800 text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Globe className="w-3 h-3" />
                  <span>alasematex.com</span>
                </button>
              )}

              {onOpenMusicBank && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenMusicBank();
                  }}
                  className="bg-black/60 hover:bg-neutral-800 text-amber-300 border border-amber-400/40 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Music className="w-3 h-3" />
                  <span>{isAr ? 'بنك الموسيقى 🎵' : 'Music Bank 🎵'}</span>
                </button>
              )}

              {onOpenAppInstall && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAppInstall();
                  }}
                  className="bg-black/60 hover:bg-neutral-800 text-sky-300 border border-sky-400/40 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Smartphone className="w-3 h-3" />
                  <span>{isAr ? 'تحميل التطبيق 📲' : 'Install App 📲'}</span>
                </button>
              )}

              {onOpenSecurityNotice && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSecurityNotice();
                  }}
                  className="bg-black/60 hover:bg-neutral-800 text-rose-300 border border-rose-400/40 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <ShieldAlert className="w-3 h-3" />
                  <span>{isAr ? 'تحذير الأمان 🛡️' : 'Safety Notice 🛡️'}</span>
                </button>
              )}

              {onOpenCurrencyModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCurrencyModal();
                  }}
                  className="bg-black/60 hover:bg-neutral-800 text-yellow-300 border border-yellow-400/40 px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Coins className="w-3 h-3" />
                  <span>{isAr ? 'العملات والأسعار 💱' : 'Currencies 💱'}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-white/10 bg-black/60 flex items-center justify-between">
          <span className="text-[10px] text-white/50">
            {isAr
              ? 'خدماتي • خدمة التنبيه والتتبع للطلب والتاكسي (عربي / EN)'
              : 'My Services • Order & Taxi Alert & Tracking (AR / EN)'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition cursor-pointer"
          >
            {isAr ? 'إغلاق ✕' : 'Close ✕'}
          </button>
        </div>
      </div>
    </div>
  );
};
