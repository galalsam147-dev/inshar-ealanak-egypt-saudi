import React, { useState, useEffect, useCallback } from 'react';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import { 
  Motorbike, Phone, MessageCircle, 
  RotateCw, Play, Pause, Wallet, BellRing, Volume2, VolumeX
} from 'lucide-react';
import { DeliveryOrder, DeliveryStatus, SupportedLang } from '../types';

interface LiveOrderTrackingMapProps {
  order: DeliveryOrder;
  onClose?: () => void;
  lang: SupportedLang;
  onSelectLang?: (lang: SupportedLang) => void;
  onUpdateStatus?: (newStatus: DeliveryStatus) => void;
}

const playOrderAlertChime = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.setValueAtTime(783.99, now + 0.14); // G5
    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.5);
  } catch {}
};

const speakOrderVoice = (text: string, isAr: boolean) => {
  try {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = isAr ? 'ar-EG' : 'en-US';
      window.speechSynthesis.speak(u);
    }
  } catch {}
};

export const LiveOrderTrackingMap: React.FC<LiveOrderTrackingMapProps> = ({
  order,
  onClose,
  lang,
  onSelectLang,
  onUpdateStatus,
}) => {
  const [localLang, setLocalLang] = useState<SupportedLang>(lang === 'en' ? 'en' : 'ar');

  useEffect(() => {
    if (lang === 'ar' || lang === 'en') setLocalLang(lang);
  }, [lang]);

  const activeLang: SupportedLang = onSelectLang ? (lang === 'en' ? 'en' : 'ar') : localLang;
  const isAr = activeLang === 'ar';

  const handleSwitchLanguage = (target: SupportedLang) => {
    setLocalLang(target);
    if (onSelectLang) onSelectLang(target);
  };

  // Live journey simulation percentage (0 to 100)
  const [progress, setProgress] = useState<number>(() => {
    if (order.status === 'delivered') return 100;
    if (order.status === 'on_the_way') return 55;
    if (order.status === 'preparing') return 25;
    return 10;
  });

  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [soundAlertsEnabled, setSoundAlertsEnabled] = useState<boolean>(true);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState<number>(38);
  const [currentStatus, setCurrentStatus] = useState<DeliveryStatus>(order.status || 'on_the_way');
  const [copiedTransfer, setCopiedTransfer] = useState<boolean>(false);
  const [alertBanner, setAlertBanner] = useState<string | null>(null);

  // Captain details
  const captainName = order.captainName || (isAr ? 'كابتن محمود الشريف' : 'Capt. Mahmoud El-Sherif');
  const captainPhone = order.captainPhone || '01006656669';
  const captainTransferPhone = captainPhone;
  const restaurantName = order.businessName || (isAr ? 'مطعم المشويات والوجبات' : 'Grill & Meals Restaurant');
  const customerAddress = order.deliveryAddress || (isAr ? 'التجمع الخامس - شارع التسعين الشمالي' : '5th Settlement - North 90th St.');

  const fireOrderAlert = useCallback(
    (arMsg: string, enMsg: string) => {
      const msg = isAr ? arMsg : enMsg;
      setAlertBanner(msg);
      if (soundAlertsEnabled) {
        playOrderAlertChime();
        speakOrderVoice(msg, isAr);
      }
      setTimeout(() => setAlertBanner(null), 5000);
    },
    [isAr, soundAlertsEnabled]
  );

  // Automatic live tracking simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentStatus('delivered');
          onUpdateStatus?.('delivered');
          setIsSimulating(false);
          return 100;
        }

        const next = Math.min(100, prev + 1.5);
        setCurrentSpeedKmh(Math.floor(32 + Math.random() * 14));

        if (prev < 65 && next >= 65) {
          setCurrentStatus('on_the_way');
          onUpdateStatus?.('on_the_way');
          fireOrderAlert(
            `🔔 تنبيه الطلب: الكابتن ${captainName} استلم الأوردر (#${order.orderNumber}) وهو في الطريق إليك!`,
            `🔔 Order Alert: ${captainName} picked up order (#${order.orderNumber}) and is on the way!`
          );
        } else if (prev < 99 && next >= 99) {
          setCurrentStatus('delivered');
          onUpdateStatus?.('delivered');
          fireOrderAlert(
            `✅ تنبيه الوصول: طلبك رقم (#${order.orderNumber}) وصل عند الباب الآن! بالهناء والشفاء`,
            `✅ Arrival Alert: Your order (#${order.orderNumber}) has arrived at your door! Enjoy!`
          );
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, onUpdateStatus, captainName, order.orderNumber, fireOrderAlert]);

  // Derived metrics based on progress
  const distanceRemainingKm = Math.max(0, (100 - progress) * 0.045).toFixed(1);
  const etaMinutes = Math.max(1, Math.round((100 - progress) * 0.25));

  const handleCopyTransferPhone = () => {
    navigator.clipboard.writeText(captainTransferPhone);
    setCopiedTransfer(true);
    setTimeout(() => setCopiedTransfer(false), 2500);
  };

  const handleJumpToStatus = (status: DeliveryStatus, targetProgress: number) => {
    setCurrentStatus(status);
    setProgress(targetProgress);
    onUpdateStatus?.(status);

    if (status === 'received') {
      fireOrderAlert(
        '📋 تم استلام وتأكيد طلبك في المطعم وجاري البدء',
        '📋 Your order has been received and confirmed by the restaurant'
      );
    } else if (status === 'preparing') {
      fireOrderAlert(
        '🍳 المطعم يقوم الآن بتجهيز وتغليف وجبتك الساخنة',
        '🍳 The restaurant is now preparing and packaging your hot meal'
      );
    } else if (status === 'on_the_way') {
      fireOrderAlert(
        `🛵 الكابتن ${captainName} استلم الطلب وهو في الطريق إليك الآن!`,
        `🛵 ${captainName} picked up your order and is heading to you now!`
      );
    } else if (status === 'delivered') {
      setIsSimulating(false);
      fireOrderAlert(
        '✅ تنبيه الوصول: الكابتن وصل عند الباب وتم تسليم الطلب بنجاح!',
        '✅ Arrival Alert: Courier is at your door and order is delivered!'
      );
    }
  };

  return (
    <div
      className="bg-neutral-950 border border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      {/* Top Header with Bilingual AR / EN Toggle */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-4 sm:p-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-md flex items-center justify-center border border-emerald-400/30 text-emerald-300 shrink-0">
            <Motorbike className="w-6 h-6 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-black text-sm sm:text-lg text-white truncate">
                {isAr
                  ? 'خدمة التنبيه والتتبع المباشر للطلب 🛵'
                  : 'Live Order & Delivery Alert & GPS Tracking 🛵'}
              </h3>
              <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse shadow">
                {isAr ? 'تحديث وتنبيه حي 🔔' : 'Live GPS & Alert 🔔'}
              </span>
            </div>
            <p className="text-[11px] text-emerald-100/90 font-mono truncate">
              {isAr
                ? `رقم الأوردر: #${order.orderNumber} • مسار الكابتن من المطعم للعميل`
                : `Order #${order.orderNumber} • Live Route from Store to Customer`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* AR / EN Switcher */}
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
            type="button"
            onClick={() => setSoundAlertsEnabled(!soundAlertsEnabled)}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-amber-300 transition cursor-pointer"
            title={isAr ? 'تفعيل/كتم التنبيه الصوتي' : 'Toggle Voice Alert'}
          >
            {soundAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-white/50" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Live Push Alert Banner */}
      {alertBanner && (
        <div className="bg-gradient-to-r from-amber-400 via-emerald-400 to-amber-400 text-black font-black px-4 py-2 text-xs flex items-center justify-center gap-2 animate-bounce">
          <BellRing className="w-4 h-4 shrink-0" />
          <span>{alertBanner}</span>
        </div>
      )}

      {/* Live Status Ticker */}
      <div className="bg-neutral-900 border-b border-white/10 px-4 py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="font-black text-amber-300">
            {currentStatus === 'received' &&
              (isAr ? '1. تم استلام الأوردر وتأكيده بالمطعم 📋' : '1. Order Received & Confirmed by Store 📋')}
            {currentStatus === 'preparing' &&
              (isAr ? '2. المطعم يقوم بتجهيز وتغليف وجبتك الآن 🍳' : '2. Store is Preparing & Packaging Your Order 🍳')}
            {currentStatus === 'on_the_way' &&
              (isAr ? '3. الكابتن استلم الطلب وهو في الطريق إليك 🚀' : '3. Courier Picked Up & Is On the Way to You 🚀')}
            {currentStatus === 'delivered' &&
              (isAr ? '4. تم تسليم الأوردر بنجاح! بالهناء والشفاء ✅' : '4. Order Delivered Successfully! Enjoy ✅')}
          </span>
        </div>

        <div className="flex items-center gap-2.5 font-mono text-[11px] flex-wrap">
          <span className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10 text-white/80">
            ⏱️ {isAr ? 'متبقي:' : 'ETA:'}{' '}
            <b className="text-emerald-400 font-bold">
              {progress >= 100 ? '0' : etaMinutes} {isAr ? 'دقيقة' : 'min'}
            </b>
          </span>
          <span className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10 text-white/80">
            📍 {isAr ? 'مسافة:' : 'Dist:'}{' '}
            <b className="text-amber-300 font-bold">
              {distanceRemainingKm} {isAr ? 'كم' : 'km'}
            </b>
          </span>
          <span className="bg-black/50 px-2.5 py-1 rounded-xl border border-white/10 text-white/80 hidden sm:inline-block">
            ⚡ {isAr ? 'سرعة:' : 'Speed:'}{' '}
            <b className="text-sky-300 font-bold">
              {progress >= 100 ? 0 : currentSpeedKmh} {isAr ? 'كم/س' : 'km/h'}
            </b>
          </span>
        </div>
      </div>

      {/* Interactive Google Map Canvas */}
      <div className="relative w-full h-72 sm:h-80 bg-[#0c1218] overflow-hidden select-none border-b border-white/10">
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY ? (
          <Map
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            defaultCenter={{ lat: 30.0444, lng: 31.2357 }}
            defaultZoom={14}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
          >
            {/* Point A: Restaurant Marker */}
            <AdvancedMarker position={{ lat: 30.04, lng: 31.23 }} title={restaurantName}>
              <Pin background="#f59e0b" borderColor="#ffffff" glyphColor="#000000" scale={1.1} />
            </AdvancedMarker>

            {/* Point B: Customer Home Marker */}
            <AdvancedMarker
              position={{ lat: 30.05, lng: 31.242 }}
              title={isAr ? 'مكان التسليم (العميل)' : 'Customer Delivery Location'}
            >
              <Pin background="#ef4444" borderColor="#ffffff" glyphColor="#ffffff" scale={1.1} />
            </AdvancedMarker>

            {/* Moving Captain Marker */}
            <AdvancedMarker
              position={{
                lat: 30.04 + (0.01 * progress) / 100,
                lng: 31.23 + (0.012 * progress) / 100,
              }}
              title={captainName}
            >
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-black border-2 border-white flex items-center justify-center shadow-2xl">
                  <Motorbike className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div className="bg-emerald-950/95 border border-emerald-400 text-emerald-300 text-[9px] font-black px-2 py-0.5 rounded-full mt-1 shadow-xl whitespace-nowrap">
                  {captainName}
                </div>
              </div>
            </AdvancedMarker>
          </Map>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/60 text-xs">
            {isAr ? 'جاري تحميل خريطة التتبع...' : 'Loading Live Order Map...'}
          </div>
        )}

        {/* Floating Simulation & Alert Controls */}
        <div className="absolute bottom-3 end-3 z-30 flex items-center gap-1.5 bg-black/75 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 text-xs">
          <button
            type="button"
            onClick={() =>
              fireOrderAlert(
                `🔔 تنبيه فوري: الكابتن ${captainName} وصل بطلبك الآن عند الباب!`,
                `🔔 Instant Alert: ${captainName} has arrived at your door with your order!`
              )
            }
            className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black transition flex items-center gap-1 cursor-pointer font-black text-[11px]"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>{isAr ? 'تنبيه الوصول 🔔' : 'Arrival Alert 🔔'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSimulating(!isSimulating)}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 cursor-pointer font-bold text-[11px]"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSimulating ? (isAr ? 'إيقاف' : 'Pause') : (isAr ? 'تشغيل' : 'Play')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProgress(0);
              setCurrentStatus('received');
              setIsSimulating(true);
            }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1 cursor-pointer font-bold text-[11px]"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>{isAr ? 'إعادة' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Progress Track Stages Bar */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Progress Slider Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs font-bold text-white/80">
            <span>{isAr ? 'مسار إنجاز وتوصيل الطلب:' : 'Order Delivery Progress:'}</span>
            <span className="text-emerald-400 font-mono font-black">
              {Math.round(progress)}% {isAr ? 'مكتمل' : 'Completed'}
            </span>
          </div>
          <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 h-full rounded-full transition-all duration-300 shadow-lg shadow-emerald-500/50"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* 4 Interactive State Shortcuts */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleJumpToStatus('received', 15)}
            className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold ${
              currentStatus === 'received'
                ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 font-black'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {isAr ? '📋 1. استلام الأوردر' : '📋 1. Order Confirmed'}
          </button>

          <button
            type="button"
            onClick={() => handleJumpToStatus('preparing', 40)}
            className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold ${
              currentStatus === 'preparing'
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 font-black'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {isAr ? '🍳 2. تجهيز بالمطعم' : '🍳 2. Preparing'}
          </button>

          <button
            type="button"
            onClick={() => handleJumpToStatus('on_the_way', 75)}
            className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold ${
              currentStatus === 'on_the_way'
                ? 'bg-sky-500/25 border-sky-400 text-sky-300 font-black'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {isAr ? '🛵 3. الكابتن في الطريق' : '🛵 3. On the Way'}
          </button>

          <button
            type="button"
            onClick={() => handleJumpToStatus('delivered', 100)}
            className={`p-2 rounded-xl border text-center transition cursor-pointer font-bold ${
              currentStatus === 'delivered'
                ? 'bg-emerald-600/35 border-emerald-400 text-emerald-200 font-black'
                : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
            }`}
          >
            {isAr ? '✅ 4. تم التسليم' : '✅ 4. Delivered'}
          </button>
        </div>

        {/* Captain & Private Payment Transfer Box */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-2xl font-black">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-sm text-white">{captainName}</h4>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {isAr ? 'كابتن معتمد 🛡️' : 'Verified Courier 🛡️'}
                  </span>
                </div>
                <p className="text-[11px] text-white/60">
                  {isAr
                    ? 'سكوتر دليفري إكسبريس • خدمة التنبيه والتتبع الفوري'
                    : 'Express Delivery Scooter • Live GPS & Arrival Alerts'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${captainPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  isAr
                    ? `مرحباً كابتن ${captainName}، أتابع معك الأوردر رقم (#${order.orderNumber}).`
                    : `Hello ${captainName}, following up on order (#${order.orderNumber}).`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                <span>{isAr ? 'واتساب الكابتن' : 'WhatsApp'}</span>
              </a>

              <a
                href={`tel:${captainPhone}`}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs p-2 rounded-xl transition"
                title={isAr ? 'اتصال هاتفي مباشر' : 'Call Courier'}
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Captain Direct Transfer Notice */}
          <div className="bg-black/60 border border-amber-400/30 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Wallet className="w-4 h-4 text-amber-400" />
                <span>
                  {isAr
                    ? 'طرق دفع الحساب للكابتن (تحويل خاص أو كاش):'
                    : 'Payment Methods (Direct Transfer or Cash):'}
                </span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                {isAr ? 'تحويل مباشر 100%' : '100% Direct'}
              </span>
            </div>

            <div className="flex items-center justify-between bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="text-white/60">
                  {isAr ? 'رقم التحويل للكابتن:' : 'Courier Transfer No:'}
                </span>
                <strong className="text-emerald-400 font-black text-sm">{captainTransferPhone}</strong>
                <span className="text-[10px] text-purple-300 font-sans">
                  {isAr ? '(إنستاباي / فودافون كاش)' : '(InstaPay / Wallet)'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyTransferPhone}
                className="bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition cursor-pointer"
              >
                {copiedTransfer ? (isAr ? '✓ تم النسخ' : '✓ Copied') : (isAr ? 'نسخ الرقم' : 'Copy')}
              </button>
            </div>
          </div>
        </div>

        {/* Order Details Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex justify-between items-center text-white/70">
            <span>{isAr ? 'وجهة التسليم (عنوان العميل):' : 'Delivery Address:'}</span>
            <span className="text-white font-bold">{customerAddress}</span>
          </div>
          <div className="flex justify-between items-center text-white/70">
            <span>{isAr ? 'المحل / المطعم المرسل:' : 'Store / Restaurant:'}</span>
            <span className="text-amber-300 font-bold">{restaurantName}</span>
          </div>
          <div className="flex justify-between items-center text-white/70 pt-1 border-t border-white/5">
            <span>{isAr ? 'إجمالي الفاتورة المستحق عند الوصول:' : 'Total Amount Due on Arrival:'}</span>
            <span className="text-emerald-400 font-black text-sm">
              {order.totalEgp || 185} {isAr ? 'ج.م' : 'EGP'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
