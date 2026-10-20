import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  X, Navigation, Phone, MessageCircle, Share2, 
  Volume2, VolumeX, Play, Pause, RotateCcw, AlertOctagon, Car, 
  Truck, Bus, Bike, BellRing, Satellite, Camera, Upload
} from 'lucide-react';
import { Business, SubscriberTrackingCell, SupportedLang } from '../types';
import { TripPaymentMethodsManager } from './TripPaymentMethodsManager';

export type TransportVehicleType = 'taxi' | 'motorcycle' | 'limousine' | 'bus_travel' | 'heavy_truck';

export interface LiveTaxiTransportTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBusiness?: Business | null;
  defaultVehicleType?: TransportVehicleType;
  userCoords?: { lat: number; lng: number } | null;
  onDetectLocation?: () => void;
  lang: SupportedLang;
  onSelectLang?: (lang: SupportedLang) => void;
  onUpdateBusiness?: (updated: Business) => void;
}

const playTaxiAlertChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5
    osc.frequency.setValueAtTime(987.77, now + 0.15); // B5
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
};

const speakTaxiVoice = (text: string, isAr: boolean) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isAr ? 'ar-EG' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  } catch {}
};

export const LiveTaxiTransportTrackingModal: React.FC<LiveTaxiTransportTrackingModalProps> = ({
  isOpen,
  onClose,
  targetBusiness,
  defaultVehicleType = 'taxi',
  userCoords,
  onDetectLocation,
  lang,
  onSelectLang,
  onUpdateBusiness,
}) => {
  const [localLang, setLocalLang] = useState<SupportedLang>(lang === 'en' ? 'en' : 'ar');
  const [satelliteMode, setSatelliteMode] = useState<boolean>(true);
  const [workStatus, setWorkStatus] = useState<'active' | 'inactive'>(
    targetBusiness?.workStatus === 'inactive' ? 'inactive' : 'active'
  );
  const [customCaptainPhoto, setCustomCaptainPhoto] = useState<string>(
    targetBusiness?.captainPhotoUrl || targetBusiness?.trackingCell?.captainPhoto || ''
  );
  const [customVehiclePhoto, setCustomVehiclePhoto] = useState<string>(
    targetBusiness?.vehiclePhotoUrl || targetBusiness?.trackingCell?.vehiclePhotoUrl || ''
  );
  const [customPlateNumber, setCustomPlateNumber] = useState<string>(
    targetBusiness?.vehiclePlateNumber || targetBusiness?.trackingCell?.vehiclePlate || ''
  );
  const [customVehicleShape, setCustomVehicleShape] = useState<string>(
    targetBusiness?.vehicleShape || 'sedan_taxi'
  );
  const [whatsappCallerPhone, setWhatsappCallerPhone] = useState<string>('');
  const [isEditingVehicleData, setIsEditingVehicleData] = useState<boolean>(false);

  useEffect(() => {
    if (lang === 'ar' || lang === 'en') setLocalLang(lang);
  }, [lang]);

  const activeLang: SupportedLang = onSelectLang ? (lang === 'en' ? 'en' : 'ar') : localLang;
  const isAr = activeLang === 'ar';

  const handleSwitchLanguage = (target: SupportedLang) => {
    setLocalLang(target);
    if (onSelectLang) onSelectLang(target);
  };

  // Selected vehicle type
  const [vehicleType, setVehicleType] = useState<TransportVehicleType>(() => {
    if (targetBusiness?.trackingCell?.vehicleType) {
      const v = targetBusiness.trackingCell.vehicleType;
      if (['taxi', 'motorcycle', 'limousine', 'bus_travel', 'heavy_truck'].includes(v)) {
        return v as TransportVehicleType;
      }
    }
    if (targetBusiness?.cat === 'موتوسيكل ودليفري') return 'motorcycle';
    if (targetBusiness?.cat === 'سيارات ليموزين') return 'limousine';
    if (targetBusiness?.cat === 'أتوبيسات رحلات وسياحة وعمرة' || targetBusiness?.cat === 'اتوبيس وسيارات مدرسة') return 'bus_travel';
    if (targetBusiness?.cat === 'شحن ونقل ثقيل' || targetBusiness?.cat === 'عمال ونقل أثاث') return 'heavy_truck';
    return defaultVehicleType;
  });

  // Addresses
  const activeUserCoords = userCoords || { lat: 30.0444, lng: 31.2357 };
  const [pickupAddress, setPickupAddress] = useState<string>(
    userCoords
      ? isAr
        ? 'موقعي الحالي المحدد بالـ GPS (التجمع الخامس)'
        : 'My Current GPS Location (5th Settlement)'
      : isAr
      ? 'التجمع الخامس - شارع التسعين الجنوبي'
      : '5th Settlement - South 90th Street'
  );
  const [destinationAddress, setDestinationAddress] = useState<string>(
    targetBusiness
      ? `${targetBusiness.name} (${targetBusiness.addr})`
      : isAr
      ? 'مطار القاهرة الدولي - صالة 3'
      : 'Cairo International Airport - Terminal 3'
  );

  // Captain details based on targetBusiness or defaults
  const cell: SubscriberTrackingCell = useMemo(() => {
    if (targetBusiness?.trackingCell) {
      return targetBusiness.trackingCell;
    }
    switch (vehicleType) {
      case 'motorcycle':
        return {
          enabled: true,
          vehicleType: 'motorcycle',
          vehiclePlate: isAr ? 'م ن ر 1932' : 'M N R 1932',
          vehicleModel: isAr ? 'سكوتر هوندا 160cc سريع' : 'Honda 160cc Express Scooter',
          captainName: isAr ? 'كابتن عمر الدسوقي' : 'Capt. Omar El-Desouky',
          captainPhone: targetBusiness?.phone || '01006656669',
          currentStatus: 'available',
          currentArea: isAr ? 'التجمع الأول والرحاب' : '1st Settlement & Rehab',
          ratePerKmEgp: 4,
          minimumTripPriceEgp: 15,
          rating: 4.9,
          totalTrips: 1840,
        };
      case 'limousine':
        return {
          enabled: true,
          vehicleType: 'limousine',
          vehiclePlate: isAr ? 'ر ق م 7777' : 'R Q M 7777',
          vehicleModel: isAr ? 'مرسيدس E-Class 2024 فاخرة VIP' : 'Mercedes E-Class 2024 VIP',
          captainName: isAr ? 'كابتن حازم رضوان' : 'Capt. Hazem Radwan',
          captainPhone: targetBusiness?.phone || '01006656669',
          currentStatus: 'available',
          currentArea: isAr ? 'مطار القاهرة الدولي والتجمع الخامس' : 'Cairo Airport & New Cairo',
          ratePerKmEgp: 18,
          minimumTripPriceEgp: 200,
          rating: 5.0,
          totalTrips: 920,
        };
      case 'bus_travel':
        return {
          enabled: true,
          vehicleType: 'bus_travel',
          vehiclePlate: isAr ? 'ب ا ص 9520' : 'B U S 9520',
          vehicleModel: isAr ? 'مرسيدس ترافيلو 50 راكب مكيف VIP' : 'Mercedes Travego 50-Seat VIP Bus',
          captainName: isAr ? 'كابتن كمال عبد الصمد' : 'Capt. Kamal Abdel-Samad',
          captainPhone: targetBusiness?.phone || '01006656669',
          currentStatus: 'available',
          currentArea: isAr ? 'ميدان التحرير ومحطات السفر الكبرى' : 'Tahrir Square & Central Stations',
          ratePerKmEgp: 35,
          minimumTripPriceEgp: 1500,
          rating: 4.9,
          totalTrips: 580,
        };
      case 'heavy_truck':
        return {
          enabled: true,
          vehicleType: 'heavy_truck',
          vehiclePlate: isAr ? 'ن ق ل 3341' : 'T R K 3341',
          vehicleModel: isAr ? 'جامبو مغلقة + ونش هيدروليكي 16 دور' : 'Closed Box Truck + Hydraulic Winch',
          captainName: isAr ? 'كابتن إبراهيم عاشور' : 'Capt. Ibrahim Ashour',
          captainPhone: targetBusiness?.phone || '01006656669',
          currentStatus: 'available',
          currentArea: isAr ? 'القاهرة الجديدة والمنطقة الصناعية' : 'New Cairo & Industrial Zone',
          ratePerKmEgp: 22,
          minimumTripPriceEgp: 650,
          rating: 4.8,
          totalTrips: 1120,
        };
      case 'taxi':
      default:
        return {
          enabled: true,
          vehicleType: 'taxi',
          vehiclePlate: isAr ? 'ط س ق 4821' : 'T S Q 4821',
          vehicleModel: isAr ? 'هيونداي إلنترا 2024 مكيفة بالعداد' : 'Hyundai Elantra 2024 A/C Taxi',
          captainName: isAr ? 'كابتن محمود الشريف' : 'Capt. Mahmoud El-Sherif',
          captainPhone: targetBusiness?.phone || '01006656669',
          currentStatus: 'available',
          currentArea: isAr ? 'التجمع الخامس - شارع التسعين' : '5th Settlement - 90th St.',
          ratePerKmEgp: 6,
          minimumTripPriceEgp: 25,
          rating: 4.9,
          totalTrips: 2430,
        };
    }
  }, [targetBusiness, vehicleType, isAr]);

  // Trip tracking progression (0 to 100%)
  const [tripProgress, setTripProgress] = useState<number>(35);
  const [isLiveSimulating, setIsLiveSimulating] = useState<boolean>(true);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(42);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fireAlertNotification = useCallback(
    (arText: string, enText: string) => {
      const text = isAr ? arText : enText;
      setToastMsg(text);
      if (soundAlertsEnabled) {
        playTaxiAlertChime();
        speakTaxiVoice(text, isAr);
      }
      setTimeout(() => setToastMsg(null), 5000);
    },
    [isAr, soundAlertsEnabled]
  );

  // Status stage
  const tripStage = useMemo<'confirmed' | 'approaching' | 'on_trip' | 'completed'>(() => {
    if (tripProgress >= 100) return 'completed';
    if (tripProgress >= 45) return 'on_trip';
    if (tripProgress >= 15) return 'approaching';
    return 'confirmed';
  }, [tripProgress]);

  // Estimated fare calculation & manual fare customization
  const distanceKm = 8.4;
  const initialCalculatedFare = useMemo(() => {
    const min = cell.minimumTripPriceEgp || 25;
    const perKm = cell.ratePerKmEgp || 6;
    return Math.round(min + distanceKm * perKm);
  }, [cell, distanceKm]);

  const [customTripFare, setCustomTripFare] = useState<number | null>(null);
  const activeFare = customTripFare !== null ? customTripFare : initialCalculatedFare;

  // Auto tick live simulation with automatic voice/sound alerts
  useEffect(() => {
    if (!isOpen || !isLiveSimulating) return;

    const interval = setInterval(() => {
      setTripProgress((prev) => {
        if (prev >= 100) {
          setIsLiveSimulating(false);
          return 100;
        }
        const next = Math.min(100, prev + 1.5);
        setCurrentSpeedKmh(Math.floor(35 + Math.random() * 18));

        if (prev < 45 && next >= 45) {
          fireAlertNotification(
            `🔔 تنبيه: ${cell.captainName} وصل إلى نقطة الالتقاء وبدأت الرحلة! (PIN: 4829)`,
            `🔔 Alert: ${cell.captainName} arrived at pickup & started the trip! (PIN: 4829)`
          );
        } else if (prev < 99 && next >= 99) {
          fireAlertNotification(
            `✅ تنبيه الوصول: تم الوصول إلى الوجهة بسلامة الله! الأجرة المستحقة ${activeFare} ج.م`,
            `✅ Arrival Alert: You have arrived safely at your destination! Fare: ${activeFare} EGP`
          );
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isLiveSimulating, cell.captainName, activeFare, fireAlertNotification]);

  if (!isOpen) return null;

  const remainingDistKm = Math.max(0, (100 - tripProgress) * 0.084).toFixed(1);
  const etaMinutes = Math.max(1, Math.round((100 - tripProgress) * 0.2));

  const vehicleIcon = () => {
    switch (vehicleType) {
      case 'motorcycle':
        return <Bike className="w-5 h-5 text-amber-300" />;
      case 'limousine':
        return <Car className="w-5 h-5 text-sky-300" />;
      case 'bus_travel':
        return <Bus className="w-5 h-5 text-emerald-300" />;
      case 'heavy_truck':
        return <Truck className="w-5 h-5 text-orange-300" />;
      case 'taxi':
      default:
        return <Car className="w-5 h-5 text-yellow-300" />;
    }
  };

  const vehicleLabel = () => {
    switch (vehicleType) {
      case 'motorcycle':
        return isAr ? 'دليفري وموتوسيكل وسكوتر سريع 🛵' : 'Express Motorcycle & Delivery 🛵';
      case 'limousine':
        return isAr ? 'سيارات ليموزين ورجال أعمال VIP 🚘' : 'VIP Business Limousine 🚘';
      case 'bus_travel':
        return isAr ? 'أتوبيسات رحلات وسياحة وعمرة 🚌' : 'Tourism & Travel Buses 🚌';
      case 'heavy_truck':
        return isAr ? 'شحن ونقل ثقيل ونقل عفش 🚚' : 'Heavy Cargo & Furniture Truck 🚚';
      case 'taxi':
      default:
        return isAr ? 'تاكسي وأجرة بالعداد والـ GPS 🚕' : 'Metered A/C Taxi with GPS 🚕';
    }
  };

  const liveRideTrackingUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/?track=taxi`;

  return (
    <div
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
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
        className="bg-neutral-950 border border-emerald-500/40 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-auto text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Bilingual AR / EN Toggle */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-neutral-900 p-4 sm:p-5 flex items-center justify-between gap-2 border-b border-emerald-500/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md text-emerald-300 flex items-center justify-center border border-emerald-400/40 shadow-lg shrink-0">
              {vehicleIcon()}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-black text-sm sm:text-lg text-white truncate">
                  {isAr
                    ? 'خدمة التنبيه والتتبع المباشر للتاكسي والنقل 🛰️'
                    : 'Live Taxi & Transport Alert & GPS Tracking 🛰️'}
                </h3>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
                  {isAr ? 'تنبيه وتتبع حي 🔔' : 'Live GPS & Alert 🔔'}
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/90 font-mono truncate">
                {targetBusiness
                  ? targetBusiness.name
                  : isAr
                  ? 'خدماتي • تتبع حي مباشر بالـ GPS'
                  : 'My Services • Live GPS Tracking'} • {cell.captainName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Language Switcher Pill */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-full border border-white/20">
              <button
                type="button"
                onClick={() => handleSwitchLanguage('ar')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                  isAr ? 'bg-amber-400 text-black' : 'text-white/75 hover:text-white'
                }`}
              >
                عربي
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage('en')}
                className={`px-2 py-0.5 rounded-full text-[10px] font-black transition cursor-pointer ${
                  !isAr ? 'bg-amber-400 text-black' : 'text-white/75 hover:text-white'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Anti-Fraud Caution Top Banner */}
        <div className="bg-red-950/70 border-b border-red-500/40 px-4 py-2 flex items-start gap-2.5 text-xs text-red-200">
          <AlertOctagon className="w-4 h-4 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="space-y-0.5">
            <span className="font-black text-amber-300 block text-[11px]">
              {isAr
                ? '⚠️ تحذير أمني هام للجمهور + كود أمان الرحلة (PIN: 4829):'
                : '⚠️ Safety Notice + Ride Verification Code (PIN: 4829):'}
            </span>
            <p className="text-[10px] text-red-100/90 leading-relaxed">
              {isAr
                ? 'تحقق من رقم اللوحة وهوية الكابتن وكود الأمان قبل الركوب أو الاستلام. ننصح بالدفع كاش أو عند الوصول فقط.'
                : 'Verify license plate, captain identity, and security PIN before boarding or paying. Cash on arrival recommended.'}
            </p>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Live Alert Banner */}
          {toastMsg && (
            <div className="bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 text-black font-black text-center py-2 px-3 rounded-xl text-xs animate-bounce flex items-center justify-center gap-2 shadow-lg">
              <BellRing className="w-4 h-4 shrink-0" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* 1. Quick Vehicle Selector + Voice Alert Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-[11px] font-bold text-white/70">
                {isAr
                  ? 'اختر نوع وسيلة النقل والتتبع فوراً:'
                  : 'Select Transport Vehicle Type:'}
              </span>
              <button
                type="button"
                onClick={() => {
                  const next = !soundAlertsEnabled;
                  setSoundAlertsEnabled(next);
                  if (next) {
                    playTaxiAlertChime();
                    speakTaxiVoice(
                      isAr ? 'التنبيه الصوتي مفعل للتاكسي والرحلة' : 'Taxi voice alert enabled',
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
                      ? 'جرس وصوت التنبيه: مفعل 🔔'
                      : 'جرس التنبيه: صامت 🔕'
                    : soundAlertsEnabled
                    ? 'Sound & Voice Alert: ON 🔔'
                    : 'Sound Alert: Muted 🔕'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { type: 'taxi' as TransportVehicleType, ar: 'تاكسي 🚕', en: 'Taxi 🚕', icon: '🚕' },
                { type: 'motorcycle' as TransportVehicleType, ar: 'موتوسيكل 🛵', en: 'Delivery 🛵', icon: '🛵' },
                { type: 'limousine' as TransportVehicleType, ar: 'ليموزين 🚘', en: 'Limousine 🚘', icon: '🚘' },
                { type: 'bus_travel' as TransportVehicleType, ar: 'أتوبيس 🚌', en: 'Bus 🚌', icon: '🚌' },
                { type: 'heavy_truck' as TransportVehicleType, ar: 'شحن ثقيل 🚚', en: 'Truck 🚚', icon: '🚚' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setVehicleType(item.type)}
                  className={`p-2 rounded-xl text-center font-bold transition flex flex-col items-center gap-1 border cursor-pointer ${
                    vehicleType === item.type
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md font-black'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border-white/10'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="text-[10px] truncate">{isAr ? item.ar : item.en}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Pickup & Dropoff Inputs with GPS Auto-detection */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-white/50 block">
                  {isAr ? 'نقطة الانطلاق / الركوب (موقعك بالـ GPS):' : 'Pickup Location (Your GPS):'}
                </span>
                <input
                  type="text"
                  value={pickupAddress}
                  onChange={(e) => setPickupAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
              {onDetectLocation && (
                <button
                  type="button"
                  onClick={() => {
                    onDetectLocation();
                    setPickupAddress(
                      isAr ? 'موقعي الحالي المحدد بالـ GPS 📍' : 'My Current GPS Location 📍'
                    );
                    fireAlertNotification(
                      '📍 تم تحديد موقع الركوب بالـ GPS وإرساله للكابتن!',
                      '📍 Pickup GPS location detected and sent to Captain!'
                    );
                  }}
                  className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/30 px-2 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                >
                  <Navigation className="w-3 h-3" />
                  <span>{isAr ? 'موقعي 📍' : 'My GPS 📍'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400 shrink-0" />
              <div className="flex-1">
                <span className="text-[10px] text-white/50 block">
                  {isAr ? 'نقطة الوصول / الوجهة:' : 'Dropoff / Destination:'}
                </span>
                <input
                  type="text"
                  value={destinationAddress}
                  onChange={(e) => setDestinationAddress(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-red-400"
                />
              </div>
            </div>
          </div>

          {/* 3. Live Status & Metrics Bar + 4 Interactive Stage Buttons */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-3 space-y-2.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="font-black text-amber-300">
                  {tripStage === 'confirmed' &&
                    (isAr ? '1. تم تأكيد الطلب وتعيين الكابتن 📋' : '1. Ride Confirmed & Captain Assigned 📋')}
                  {tripStage === 'approaching' &&
                    (isAr ? '2. الكابتن في الطريق إليك الآن 🚕' : '2. Captain is En Route to Pickup 🚕')}
                  {tripStage === 'on_trip' &&
                    (isAr ? '3. الرحلة جارية مع التتبع المباشر بالـ GPS 🛰️' : '3. On Trip with Live GPS Tracking 🛰️')}
                  {tripStage === 'completed' &&
                    (isAr ? '4. تم الوصول بنجاح! رحلة سعيدة ✅' : '4. Arrived Safely! Trip Completed ✅')}
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                <span className="bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 text-white/80">
                  ⏱️ {isAr ? 'متبقي:' : 'ETA:'}{' '}
                  <b className="text-emerald-400 font-bold">
                    {tripProgress >= 100 ? '0' : etaMinutes} {isAr ? 'د' : 'min'}
                  </b>
                </span>
                <span className="bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 text-white/80">
                  📍 {isAr ? 'مسافة:' : 'Dist:'}{' '}
                  <b className="text-amber-300 font-bold">
                    {remainingDistKm} {isAr ? 'كم' : 'km'}
                  </b>
                </span>
                <span className="bg-black/60 px-2 py-0.5 rounded-lg border border-white/10 text-white/80">
                  ⚡ <b className="text-sky-300 font-bold">{tripProgress >= 100 ? 0 : currentSpeedKmh} {isAr ? 'كم/س' : 'km/h'}</b>
                </span>
              </div>
            </div>

            {/* Interactive Stage Triggers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setTripProgress(10);
                  fireAlertNotification(
                    '📋 تم قبول الرحلة وتأكيد الكابتن بنجاح',
                    '📋 Ride accepted and Captain confirmed'
                  );
                }}
                className={`p-1.5 rounded-xl border font-black cursor-pointer transition ${
                  tripStage === 'confirmed'
                    ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isAr ? '📋 1. تأكيد الكابتن' : '📋 1. Confirmed'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTripProgress(30);
                  fireAlertNotification(
                    `🚕 الكابتن ${cell.captainName} في الطريق إليك الآن!`,
                    `🚕 ${cell.captainName} is on the way to you now!`
                  );
                }}
                className={`p-1.5 rounded-xl border font-black cursor-pointer transition ${
                  tripStage === 'approaching'
                    ? 'bg-amber-500/25 border-amber-400 text-amber-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isAr ? '🚕 2. الكابتن في الطريق' : '🚕 2. En Route'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTripProgress(65);
                  fireAlertNotification(
                    `🔔 تنبيه وصول الكابتن: ${cell.captainName} وصل الآن أمامك! لوحة: ${cell.vehiclePlate}`,
                    `🔔 Captain Arrived: ${cell.captainName} is outside now! Plate: ${cell.vehiclePlate}`
                  );
                }}
                className={`p-1.5 rounded-xl border font-black cursor-pointer transition ${
                  tripStage === 'on_trip'
                    ? 'bg-sky-500/25 border-sky-400 text-sky-300'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isAr ? '🔔 3. تنبيه وصول الكابتن' : '🔔 3. Captain Arrived'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTripProgress(100);
                  setIsLiveSimulating(false);
                  fireAlertNotification(
                    '✅ تم الوصول إلى الوجهة بنجاح! شكراً لاستخدامك خدماتي',
                    '✅ Arrived at destination safely! Thank you for using My Services'
                  );
                }}
                className={`p-1.5 rounded-xl border font-black cursor-pointer transition ${
                  tripStage === 'completed'
                    ? 'bg-emerald-600/35 border-emerald-400 text-emerald-200'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                }`}
              >
                {isAr ? '✅ 4. تم الوصول' : '✅ 4. Completed'}
              </button>
            </div>
          </div>

          {/* 4. Interactive Google Map (Live Moving Vehicle + Satellite + Program Logo) */}
          <div className="relative w-full h-64 sm:h-72 bg-[#090e13] rounded-2xl overflow-hidden border border-white/10 select-none shadow-inner">
            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
              <Map
                mapId="DEMO_MAP_ID"
                mapTypeId={satelliteMode ? 'hybrid' : 'roadmap'}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                defaultCenter={activeUserCoords}
                defaultZoom={14}
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                {/* Pickup Marker */}
                <AdvancedMarker position={activeUserCoords} title={isAr ? 'موقع المتصل / الركوب' : 'Pickup Point'}>
                  <Pin background="#10b981" borderColor="#ffffff" glyphColor="#000000" scale={1.1} />
                </AdvancedMarker>

                {/* Destination Marker */}
                <AdvancedMarker
                  position={{
                    lat: activeUserCoords.lat + 0.012,
                    lng: activeUserCoords.lng + 0.015,
                  }}
                  title={isAr ? 'نقطة الوصول' : 'Destination'}
                >
                  <Pin background="#ef4444" borderColor="#ffffff" glyphColor="#ffffff" scale={1.1} />
                </AdvancedMarker>

                {/* Moving Captain Marker with Program Logo & Vehicle Shape */}
                <AdvancedMarker
                  position={{
                    lat: activeUserCoords.lat + (0.012 * tripProgress) / 100,
                    lng: activeUserCoords.lng + (0.015 * tripProgress) / 100,
                  }}
                  title={`${cell.captainName} (${currentSpeedKmh} km/h)`}
                >
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-[#FF2D55] to-amber-500 border border-white text-white text-[8px] font-black shadow-lg mb-0.5 whitespace-nowrap">
                      <span>📢 إعلانك</span>
                      <span
                        className={`px-1 rounded-full ${
                          workStatus === 'inactive' ? 'bg-red-700 text-white' : 'bg-emerald-400 text-black'
                        }`}
                      >
                        {workStatus === 'inactive' ? 'OFF' : 'ON'}
                      </span>
                    </div>
                    <span className="w-10 h-10 rounded-2xl bg-black border-2 border-amber-400 flex items-center justify-center text-base shadow-xl overflow-hidden">
                      {customVehiclePhoto ? (
                        <img src={customVehiclePhoto} alt="المركبة" className="w-full h-full object-cover" />
                      ) : (
                        <>
                          {vehicleType === 'motorcycle' && '🏍️'}
                          {vehicleType === 'limousine' && '🚘'}
                          {vehicleType === 'bus_travel' && '🚌'}
                          {vehicleType === 'heavy_truck' && '🚚'}
                          {vehicleType === 'taxi' && '🚖'}
                        </>
                      )}
                    </span>
                    <span className="bg-black/90 border border-amber-400/50 text-amber-300 text-[8.5px] font-black px-2 py-0.5 rounded-full mt-0.5 shadow whitespace-nowrap">
                      {cell.captainName} • {customPlateNumber || cell.vehiclePlate}
                    </span>
                  </div>
                </AdvancedMarker>
              </Map>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/60 text-xs">
                {isAr ? 'جاري تحميل خريطة التتبع بالقمر الصناعي...' : 'Loading Live Satellite GPS Map...'}
              </div>
            )}

            {/* Simulation & Satellite & Work ON/OFF controls overlay */}
            <div className="absolute top-2.5 start-2.5 z-20 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsLiveSimulating(!isLiveSimulating)}
                className="bg-black/80 hover:bg-black/95 border border-white/20 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
              >
                {isLiveSimulating ? <Pause className="w-3 h-3 text-amber-300" /> : <Play className="w-3 h-3 text-emerald-400" />}
                <span>
                  {isLiveSimulating
                    ? isAr
                      ? 'إيقاف مؤقت'
                      : 'Pause'
                    : isAr
                    ? 'استئناف'
                    : 'Resume'}
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTripProgress(10);
                  setIsLiveSimulating(true);
                }}
                className="bg-black/80 hover:bg-black/95 border border-white/20 text-white p-1 rounded-lg text-[10px] cursor-pointer"
                title={isAr ? 'إعادة الرحلة من البداية' : 'Restart Trip'}
              >
                <RotateCcw className="w-3 h-3 text-sky-300" />
              </button>
              <button
                type="button"
                onClick={() => setSatelliteMode((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer border ${
                  satelliteMode
                    ? 'bg-sky-500 text-black border-white shadow'
                    : 'bg-black/80 text-sky-300 border-sky-400/40'
                }`}
              >
                <Satellite className="w-3 h-3" />
                <span>{satelliteMode ? 'قمر صناعي 🛰️' : 'خريطة عادية'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = workStatus === 'active' ? 'inactive' : 'active';
                  setWorkStatus(next);
                  if (targetBusiness && onUpdateBusiness) {
                    onUpdateBusiness({ ...targetBusiness, workStatus: next });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 cursor-pointer border ${
                  workStatus === 'active'
                    ? 'bg-emerald-500 text-black border-white shadow'
                    : 'bg-red-600 text-white border-white shadow'
                }`}
              >
                <span>{workStatus === 'active' ? '🟢 عند العمل ON' : '⚪ عند العطلة OFF'}</span>
              </button>
            </div>
          </div>

          {/* 5. Captain Cell, Vehicle Photo, Personal Photo, Plate Number & Shape/Type */}
          <div className="bg-gradient-to-r from-neutral-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {/* Personal Captain Photo */}
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 border-2 border-emerald-400/60 flex items-center justify-center text-xl font-black text-amber-400 overflow-hidden relative shrink-0">
                  {customCaptainPhoto || cell.captainPhoto ? (
                    <img src={customCaptainPhoto || cell.captainPhoto} alt={cell.captainName} className="w-full h-full object-cover" />
                  ) : (
                    '👨‍✈️'
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[7.5px] text-center text-emerald-300 font-black">
                    صورة شخصية
                  </span>
                </div>

                {/* Vehicle Photo */}
                <div className="w-16 h-14 rounded-2xl bg-neutral-800 border-2 border-amber-400/60 flex items-center justify-center text-xl font-black text-amber-400 overflow-hidden relative shrink-0">
                  {customVehiclePhoto || targetBusiness?.images?.[0] ? (
                    <img src={customVehiclePhoto || targetBusiness?.images?.[0]} alt="صورة المركبة" className="w-full h-full object-cover" />
                  ) : (
                    <span>{vehicleType === 'motorcycle' ? '🏍️' : '🚖'}</span>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[7.5px] text-center text-amber-300 font-black">
                    صورة المركبة
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-black text-sm text-white">{cell.captainName}</h4>
                    <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-500/40">
                      {workStatus === 'active' ? '🟢 في العمل ON' : '⚪ في عطلة OFF'}
                    </span>
                    <span className="bg-amber-400/20 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded border border-amber-400/40">
                      ⭐ {cell.rating || 4.9}
                    </span>
                  </div>
                  <p className="text-[11px] text-white/80 mt-0.5">
                    {cell.vehicleModel || vehicleLabel()} • {isAr ? 'رقم المركبة:' : 'Plate:'}{' '}
                    <b className="bg-amber-400 text-black px-1.5 py-0.2 rounded font-mono font-black">
                      {customPlateNumber || cell.vehiclePlate || 'ط س ق 4821'}
                    </b>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setIsEditingVehicleData((p) => !p)}
                      className="text-[9.5px] bg-white/10 hover:bg-amber-400 hover:text-black text-amber-300 font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 cursor-pointer transition"
                    >
                      <Camera className="w-3 h-3" />
                      <span>وضع وتحميل صور ورقم المركبة والصورة الشخصية والشكل والنوع</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Price / Fare Estimate */}
              <div className="text-start sm:text-end bg-black/50 border border-white/10 rounded-xl px-3 py-1.5">
                <span className="text-[10px] text-white/50 block">
                  {customTripFare !== null
                    ? isAr
                      ? 'الأجرة المتفق عليها:'
                      : 'Agreed Fare:'
                    : isAr
                    ? 'الأجرة التقديرية بالعداد:'
                    : 'Estimated Meter Fare:'}
                </span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  ~ {activeFare} {isAr ? 'ج.م' : 'EGP'}
                </span>
              </div>
            </div>

            {/* Inline Upload & Edit Panel for Vehicle Photo, Captain Photo, Plate Number, Shape & Type */}
            {isEditingVehicleData && (
              <div className="bg-black/70 border border-amber-400/40 rounded-2xl p-3 space-y-2.5 text-xs">
                <div className="font-black text-amber-300 text-[11px]">
                  📸 وضع وتحميل صور ورقم المركبة والسيارة وصورة شخصية وشكل السيارة ونوعها عند التتبع:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-white/70 block mb-1">رقم المركبة / اللوحة المعدنية:</label>
                    <input
                      type="text"
                      value={customPlateNumber}
                      onChange={(e) => setCustomPlateNumber(e.target.value)}
                      placeholder="مثال: أ ب ج 4581"
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/70 block mb-1">شكل السيارة ونوعها عند التتبع:</label>
                    <select
                      value={customVehicleShape}
                      onChange={(e) => setCustomVehicleShape(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    >
                      <option value="sedan_taxi">🚖 سيارة ملاكي / تاكسي سيدان</option>
                      <option value="suv_4x4">🚙 سيارة دفع رباعي / عائلية SUV</option>
                      <option value="motorcycle">🏍️ موتوسيكل دليفري وتوصيل</option>
                      <option value="scooter">🛵 سكوتر سريع للطلبات</option>
                      <option value="van_pickup">🚐 فان / ربع نقل بضائع</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="flex items-center justify-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 rounded-xl py-2 px-3 cursor-pointer font-black text-[10px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>تحميل صورة شخصية للكابتن</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setCustomCaptainPhoto(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                  <label className="flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 rounded-xl py-2 px-3 cursor-pointer font-black text-[10px]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>تحميل صورة المركبة / السيارة / الموتوسيكل</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setCustomVehiclePhoto(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
                {targetBusiness && onUpdateBusiness && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateBusiness({
                        ...targetBusiness,
                        captainPhotoUrl: customCaptainPhoto || targetBusiness.captainPhotoUrl,
                        vehiclePhotoUrl: customVehiclePhoto || targetBusiness.vehiclePhotoUrl,
                        vehiclePlateNumber: customPlateNumber || targetBusiness.vehiclePlateNumber,
                        vehicleShape: customVehicleShape as Business['vehicleShape'],
                        workStatus,
                      });
                      setIsEditingVehicleData(false);
                      fireAlertNotification(
                        '✅ تم حفظ صور ورقم المركبة والصورة الشخصية وشكل المركبة بنجاح',
                        '✅ Saved vehicle photo, plate number, personal photo, and vehicle shape'
                      );
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-1.5 rounded-xl text-xs cursor-pointer"
                  >
                    حفظ بيانات وصور المركبة والكابتن على الصفحة
                  </button>
                )}
              </div>
            )}

            {/* WhatsApp Caller Live Tracking Bar (خاصية التتبع للمتصل على الواتساب مباشرة) */}
            <div className="bg-emerald-950/50 border border-emerald-400/40 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[10px] font-bold text-emerald-200">
                🛰️ خاصية التتبع للمتصل على الواتساب مباشرة (إرسال رادار موقع المركبة والكابتن لحظياً للمتصل):
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="tel"
                  value={whatsappCallerPhone}
                  onChange={(e) => setWhatsappCallerPhone(e.target.value)}
                  placeholder="رقم واتساب المتصل (اختياري)..."
                  className="flex-1 sm:w-36 bg-black/60 border border-emerald-400/40 rounded-lg px-2 py-1 text-[10px] text-white"
                />
                <a
                  href={`https://wa.me/${
                    whatsappCallerPhone.replace(/\D/g, '')
                      ? `2${whatsappCallerPhone.replace(/\D/g, '').replace(/^2/, '')}`
                      : cell.captainPhone.replace(/\D/g, '')
                  }?text=${encodeURIComponent(
                    `🛰️ رابط التتبع المباشر عبر القمر الصناعي للمتصل على الواتساب:\n👤 الكابتن: ${cell.captainName}\n🚘 المركبة: ${cell.vehicleModel || vehicleLabel()}\n🔢 رقم المركبة: ${customPlateNumber || cell.vehiclePlate}\n🟢 الحالة: ${workStatus === 'active' ? 'في العمل ON' : 'في عطلة OFF'}\n📍 موقعي المباشر على الخريطة: https://maps.google.com/?q=${activeUserCoords.lat},${activeUserCoords.lng}\n🔗 رابط رادار التتبع الحي: ${liveRideTrackingUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black px-3 py-1 rounded-lg text-[10px] whitespace-nowrap flex items-center gap-1 shadow"
                >
                  <MessageCircle className="w-3 h-3 fill-black" />
                  <span>تتبع المتصل واتساب</span>
                </a>
              </div>
            </div>

            {/* Contact & Alert Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <a
                href={`tel:${cell.captainPhone}`}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{isAr ? 'اتصال بالكابتن' : 'Call Captain'}</span>
              </a>

              <a
                href={`https://wa.me/${cell.captainPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  isAr
                    ? `مرحباً كابتن، أنا في انتظارك في: ${pickupAddress} • موقعي الدقيق على الخريطة: https://maps.google.com/?q=${activeUserCoords.lat},${activeUserCoords.lng}`
                    : `Hello Captain, I am waiting at: ${pickupAddress} • My GPS Location: https://maps.google.com/?q=${activeUserCoords.lat},${activeUserCoords.lng}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-black" />
                <span>{isAr ? 'واتساب الكابتن' : 'WhatsApp'}</span>
              </a>

              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  isAr
                    ? `🚗 رابط التتبع المباشر لرحلتي بالـ GPS:\nالكابتن: ${cell.captainName}\nالمركبة: ${cell.vehicleModel || vehicleLabel()}\nاللوحة: ${cell.vehiclePlate}\nرابط التتبع المباشر:\n${liveRideTrackingUrl}`
                    : `🚗 Live GPS Ride Tracking Link:\nCaptain: ${cell.captainName}\nVehicle: ${cell.vehicleModel || vehicleLabel()}\nPlate: ${cell.vehiclePlate}\nLive Link:\n${liveRideTrackingUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-purple-600 hover:bg-purple-500 text-white font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isAr ? 'رابط التتبع 🛡️' : 'Tracking Link 🛡️'}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  fireAlertNotification(
                    `🔔 تنبيه فوري: الكابتن ${cell.captainName} (${cell.vehiclePlate}) وصل الآن إلى ${pickupAddress}!`,
                    `🔔 Instant Alert: ${cell.captainName} (${cell.vehiclePlate}) has arrived at ${pickupAddress}!`
                  );
                }}
                className="bg-amber-400 hover:bg-amber-300 text-black font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition text-xs shadow cursor-pointer"
              >
                <BellRing className="w-3.5 h-3.5 fill-black" />
                <span>{isAr ? 'تنبيه بالوصول 🔔' : 'Arrival Alert 🔔'}</span>
              </button>
            </div>
          </div>

          {/* 6. Trip Payment Numbers & Fare Manager */}
          <TripPaymentMethodsManager
            storageKey={cell.captainPhone || 'default_captain'}
            initialMethods={cell.tripPaymentMethods}
            captainName={cell.captainName}
            captainPhone={cell.captainPhone}
            currentFareEgp={activeFare}
            onFareChange={(newFare) => setCustomTripFare(newFare)}
            allowFareEdit={true}
          />
        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t border-white/10 p-3 sm:p-4 flex items-center justify-between">
          <div className="text-[11px] text-white/60">
            <span>
              {isAr
                ? '🛡️ خدمة التنبيه والتتبع للتاكسي والنقل (عربي / EN)'
                : '🛡️ Live Taxi & Transport Alert & GPS Tracking (AR / EN)'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
