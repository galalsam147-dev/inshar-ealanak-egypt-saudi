import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, MapPin, Search, CheckCircle2, UserCheck, Megaphone, Layers, Building2 } from 'lucide-react';
import { CITIES, CATEGORIES } from '../utils/translations';
import { Business } from '../types';

interface VoiceCommandAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: string) => void;
  onSearch: (query: string) => void;
  onOpenPage: (page: 'supervisory' | 'delivery' | 'subscriber' | 'add' | 'favorites' | 'settings' | 'directory' | 'maps' | 'close_all') => void;
  currentCity?: string;
  businesses?: Business[];
  onSelectBusiness?: (biz: Business) => void;
  onSelectCategory?: (cat: string) => void;
}

export const VoiceCommandAssistantModal: React.FC<VoiceCommandAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  onSearch,
  onOpenPage,
  currentCity = '',
  businesses = [],
  onSelectBusiness,
  onSelectCategory,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [statusMessage, setStatusMessage] = useState(
    'تحدث الآن: قل "عايز أشترك" أو انطق اسم أي مشترك مسجل أو ابحث عن أي نشاط أو صفحة أو قل "غلق"'
  );
  const [detectedAction, setDetectedAction] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Text to speech announcer
  const speakAnnouncement = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ar-EG';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Filtered subscribers for live quick display inside the modal
  const matchingSubscribers = useMemo(() => {
    const q = (manualInput || transcript).trim().toLowerCase()
      .replace(/عايز مشترك|مشترك اسمه|مشترك|عايز|اريد|ابحث عن|بحث عن|افتح/g, '')
      .trim();
    if (!q) return businesses.slice(0, 12);
    return businesses.filter((b) => {
      const full = `${b.name} ${b.cat} ${b.subCat || ''} ${b.city} ${b.addr} ${b.phone || ''}`.toLowerCase();
      return full.includes(q);
    });
  }, [businesses, manualInput, transcript]);

  const processVoiceCommand = (rawText: string) => {
    const text = rawText.trim().toLowerCase();
    if (!text) return;

    // 0. Check for Close Page command ("غلق" / "اقفل" / "اكس" / "إغلاق")
    if (
      text === 'غلق' ||
      text === 'اقفل' ||
      text === 'اكس' ||
      text === 'إغلاق' ||
      text === 'اغلاق' ||
      text.includes('غلق الصفح') ||
      text.includes('اقفل الصفح') ||
      text.includes('علامه اكس') ||
      text.includes('علامة اكس')
    ) {
      const msg = 'تم غلق الصفحة والعودة للشاشة الرئيسية';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('close_all');
      setTimeout(onClose, 800);
      return;
    }

    // 1. Check for "عايز اشترك" / Subscribe / Add Business command
    if (
      text.includes('عايز اشترك') ||
      text.includes('عاوز اشترك') ||
      text.includes('اريد الاشتراك') ||
      text.includes('اشترك') ||
      text.includes('اشتراك جديد') ||
      text.includes('انشر اعلان') ||
      text.includes('انشر إعلان') ||
      text.includes('اضافة اعلان') ||
      text.includes('إضافة إعلان')
    ) {
      const msg = 'أهلاً بك! جاري فتح صفحة الاشتراك ونشر إعلانك مجاناً لمدة 90 يوم';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('add');
      setTimeout(onClose, 1000);
      return;
    }

    // 2. Check for Registered Subscriber by Name ("عايز اي مشترك اسمه مسجل")
    const cleanedForSubscriber = text
      .replace(/عايز اي مشترك اسمه مسجل|عايز مشترك اسمه|عايز مشترك|مشترك اسمه|افتح مشترك|ابحث عن مشترك|عايز|اريد|افتح|شاهد|بحث عن|ابحث عن/g, '')
      .trim();

    if (cleanedForSubscriber.length >= 2 && businesses.length > 0) {
      const matchedBiz = businesses.find((b) => {
        const bName = b.name.toLowerCase();
        if (bName.includes(cleanedForSubscriber) || text.includes(bName)) return true;
        // Match significant words in subscriber name (e.g. "الكبابجي", "النور", "الشروق", etc.)
        const nameWords = bName.split(/\s+/).filter((w) => w.length >= 3 && !['مطعم', 'شركة', 'مكتب', 'مركز', 'عيادة', 'محل', 'معرض'].includes(w));
        return nameWords.some((w) => cleanedForSubscriber.includes(w) || text.includes(w));
      });

      if (matchedBiz) {
        const msg = `تم العثور على المشترك المسجل: ${matchedBiz.name}، جاري فتح صفحته الآن`;
        setDetectedAction(msg);
        speakAnnouncement(msg);
        onSearch(matchedBiz.name);
        if (onSelectBusiness) {
          onSelectBusiness(matchedBiz);
        }
        setTimeout(onClose, 1100);
        return;
      }
    }

    // 3. Check for Page navigation commands ("اعطاء اوامر صوتيه بالصفحات")
    if (text.includes('رقابة') || text.includes('رقابه') || text.includes('مساعد')) {
      const msg = 'جاري فتح صفحة الرقابة والمساعدين';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('supervisory');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('خدماتي') || text.includes('خدماتنا') || text.includes('دليل الأنشطة')) {
      const msg = 'جاري فتح صفحة خدماتي والتنبيه والتتبع';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('directory');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('خريطة') || text.includes('خريطه') || text.includes('جوجل ماب')) {
      const msg = 'جاري فتح خريطة جوجل التفاعلية';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('maps');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('دليفري') || text.includes('توصيل') || text.includes('تتبع السائق')) {
      const msg = 'جاري فتح صفحة الدليفري وتتبع السائق';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('delivery');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('لوحة المشترك') || text.includes('لوحه المشترك') || text.includes('صفحة المشتركين') || text.includes('صفحه المشتركين')) {
      const msg = 'جاري فتح صفحة ولوحة المشتركين';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('subscriber');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('مفضلة') || text.includes('مفضله') || text.includes('قلب')) {
      const msg = 'جاري فتح صفحة المفضلة';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('favorites');
      setTimeout(onClose, 1000);
      return;
    }
    if (text.includes('إعدادات') || text.includes('اعدادات')) {
      const msg = 'جاري فتح حافظة الإعدادات والصفحات';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onOpenPage('settings');
      setTimeout(onClose, 1000);
      return;
    }

    // 4. Check for Governorates / Cities ("المحافظة تسمي المكان")
    const matchedCity = CITIES.find((c) => {
      const cleanCity = c.toLowerCase();
      const tokens = cleanCity.split(/[-–() ,]+/);
      return tokens.some((token) => token.length > 2 && text.includes(token));
    });

    if (matchedCity) {
      const placeAnnouncement = `المحافظة تسمي المكان: تم تحديد ${matchedCity}`;
      setDetectedAction(placeAnnouncement);
      speakAnnouncement(placeAnnouncement);
      onSelectCity(matchedCity);
      setTimeout(onClose, 1200);
      return;
    }

    // 5. Check for "البحث عن كل نشاط" / All Activities or Specific Activity Category
    if (text.includes('كل نشاط') || text.includes('كل الأنشطة') || text.includes('كل الانشطه') || text.includes('جميع الأنشطة')) {
      const msg = 'تم عرض جميع الأنشطة والمشتركين في البرنامج';
      setDetectedAction(msg);
      speakAnnouncement(msg);
      if (onSelectCategory) onSelectCategory('الكل');
      onSearch('');
      setTimeout(onClose, 1000);
      return;
    }

    const matchedCategory = CATEGORIES.find((cat) => {
      if (cat === 'الكل') return false;
      const catClean = cat.toLowerCase();
      if (text.includes(catClean)) return true;
      const words = catClean.split(/[\s/،-]+/).filter((w) => w.length >= 3);
      return words.some((w) => text.includes(w));
    });

    if (matchedCategory && onSelectCategory) {
      const msg = `تم فتح نشاط: ${matchedCategory}`;
      setDetectedAction(msg);
      speakAnnouncement(msg);
      onSelectCategory(matchedCategory);
      onSearch('');
      setTimeout(onClose, 1100);
      return;
    }

    // General Activity or Subscriber Search
    const searchQuery = cleanedForSubscriber || text;
    if (searchQuery) {
      const msg = `تم البحث في كل الأنشطة والمشتركين عن: ${searchQuery}`;
      setDetectedAction(msg);
      speakAnnouncement(msg);
      if (onSelectCategory) onSelectCategory('الكل');
      onSearch(searchQuery);
      setTimeout(onClose, 1200);
      return;
    }

    setStatusMessage(`سمعت: "${rawText}". جرب قول "عايز أشترك" أو اسم المشترك أو النشاط`);
  };

  const interimTimerRef = useRef<any>(null);
  const executedRef = useRef<boolean>(false);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMessage('يمكنك الكتابة في مربع البحث أدناه أو الضغط على أي أمر صوتي أو مشترك مسجل مباشرة');
      return;
    }

    try {
      executedRef.current = false;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-EG';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;

      recognition.onstart = () => {
        setIsListening(true);
        setStatusMessage('حساس الصوت مفعل... تحدث الآن: قل "عايز أشترك" أو اسم أي مشترك مسجل أو اسم النشاط أو "غلق"');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const resultText = event.results[current][0].transcript;
        setTranscript(resultText);

        if (interimTimerRef.current) {
          clearTimeout(interimTimerRef.current);
        }

        if (event.results[current].isFinal) {
          if (!executedRef.current) {
            executedRef.current = true;
            processVoiceCommand(resultText);
          }
        } else if (resultText.trim().length >= 2) {
          // High-sensitivity trigger: execute after short pause even if browser delays isFinal
          interimTimerRef.current = setTimeout(() => {
            if (!executedRef.current) {
              executedRef.current = true;
              processVoiceCommand(resultText);
            }
          }, 550);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
        setStatusMessage('لم نتمكن من التقاط الصوت، يمكنك اختيار الأمر أو البحث عن المشترك والنشاط مباشرة أدناه');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (interimTimerRef.current) {
      clearTimeout(interimTimerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      setIsListening(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setManualInput('');
      setDetectedAction(null);
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-2 sm:p-3 animate-in fade-in select-none" dir="rtl">
      {/* Top-Center Close Button Above the Page (إغلاق الصفحة أعلى الشاشة في المنتصف فوق الصفحة) */}
      <div className="mb-2 flex items-center justify-center z-20">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-[0_4px_20px_rgba(220,38,38,0.75)] border-2 border-white transition cursor-pointer active:scale-95"
          title="غلق الصفحة (X)"
        >
          <X className="w-4 h-4 stroke-[3]" />
          <span>غلق الصفحة</span>
        </button>
      </div>

      <div className="relative w-full sm:max-w-lg max-h-[82dvh] bg-neutral-950 border border-amber-400/50 rounded-3xl p-4 shadow-2xl flex flex-col text-center space-y-3 overflow-y-auto">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
          <div className="flex items-center gap-1.5 text-amber-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <h3 className="text-xs sm:text-sm font-black text-white">
              الأوامر الصوتية بالصفحات والبحث الشامل 🎤
            </h3>
          </div>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded-full bg-red-600/90 hover:bg-red-500 text-white text-xs font-black flex items-center gap-1 shadow-md transition cursor-pointer active:scale-95"
            title="غلق الصفحة (X)"
          >
            <X className="w-3.5 h-3.5" />
            <span>غلق</span>
          </button>
        </div>

        {/* Big Mic Button + Direct Voice/Text Command Bar */}
        <div className="flex items-center gap-3 bg-black/60 border border-white/10 rounded-2xl p-2.5">
          <div className="relative shrink-0">
            {isListening && (
              <div className="absolute inset-0 rounded-full bg-amber-400/30 animate-ping" />
            )}
            <button
              onClick={() => (isListening ? stopListening() : startListening())}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 to-amber-500 scale-105'
                  : 'bg-gradient-to-tr from-amber-500 to-orange-600 hover:scale-105 active:scale-95'
              }`}
              title={isListening ? 'إيقاف الاستماع' : 'تحدث الآن'}
            >
              <Mic className={`w-6 h-6 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          <div className="flex-1 text-right space-y-1.5">
            {detectedAction ? (
              <div className="flex items-center gap-1.5 text-emerald-400 font-black text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{detectedAction}</span>
              </div>
            ) : (
              <p className="text-[11px] text-amber-300 font-bold leading-snug">
                {transcript ? `"${transcript}"` : statusMessage}
              </p>
            )}

            {/* Direct Search / Command Input for Subscriber Name or Activity */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualInput.trim()) processVoiceCommand(manualInput);
              }}
              className="flex items-center gap-1.5"
            >
              <div className="flex-1 flex items-center bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5">
                <Search className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1.5" />
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="ابحث باسم أي مشترك مسجل أو كل نشاط أو اكتب (عايز أشترك)..."
                  className="w-full bg-transparent text-white text-[11px] focus:outline-none placeholder:text-white/40"
                />
                {manualInput && (
                  <button
                    type="button"
                    onClick={() => setManualInput('')}
                    className="text-white/50 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] px-3 py-1.5 rounded-xl shrink-0 cursor-pointer"
              >
                نفّذ
              </button>
            </form>
          </div>
        </div>

        {/* 1. Primary Instant Voice Commands ("عايز اشترك" + "البحث عن كل نشاط" + "غلق") */}
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => processVoiceCommand('عايز اشترك')}
            className="p-2 rounded-xl bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md cursor-pointer active:scale-95"
          >
            <Megaphone className="w-3.5 h-3.5 shrink-0" />
            <span>عايز أشترك 📢</span>
          </button>

          <button
            type="button"
            onClick={() => processVoiceCommand('البحث عن كل نشاط')}
            className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span>كل الأنشطة 🔍</span>
          </button>

          <button
            type="button"
            onClick={() => processVoiceCommand('غلق الصفحة')}
            className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/50 text-red-300 font-black text-[11px] flex items-center justify-center gap-1 cursor-pointer active:scale-95"
          >
            <X className="w-3.5 h-3.5 shrink-0" />
            <span>غلق الصفحات ✕</span>
          </button>
        </div>

        {/* 2. Registered Subscribers Finder ("عايز اي مشترك اسمه مسجل") */}
        <div className="w-full text-right space-y-1.5 bg-white/[0.03] border border-white/10 rounded-2xl p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-amber-300 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5" />
              <span>المشتركين المسجلين (انطق اسم أي مشترك أو اضغط لفتح صفحته):</span>
            </span>
            <span className="text-[9px] text-white/50">{businesses.length} مشترك مسجل</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pt-1">
            {matchingSubscribers.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => {
                  const msg = `فتح المشترك المسجل: ${b.name}`;
                  setDetectedAction(msg);
                  speakAnnouncement(msg);
                  onSearch(b.name);
                  if (onSelectBusiness) onSelectBusiness(b);
                  setTimeout(onClose, 600);
                }}
                className="bg-neutral-900 hover:bg-amber-500/20 border border-white/15 hover:border-amber-400/50 text-white text-[10px] font-bold px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1 max-w-full"
              >
                <Building2 className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate max-w-[150px]">{b.name}</span>
                <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded-full shrink-0">
                  {b.cat}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Search Every Activity ("البحث عن كل نشاط") */}
        <div className="w-full text-right space-y-1.5 bg-white/[0.03] border border-white/10 rounded-2xl p-2.5">
          <span className="text-[10px] font-black text-sky-300 block">
            🔍 البحث عن كل نشاط (انطق اسم النشاط أو اختره فوراً):
          </span>
          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  const msg = cat === 'الكل' ? 'عرض كل الأنشطة' : `فتح نشاط ${cat}`;
                  setDetectedAction(msg);
                  speakAnnouncement(msg);
                  if (onSelectCategory) onSelectCategory(cat);
                  onSearch('');
                  setTimeout(onClose, 600);
                }}
                className="bg-sky-500/15 hover:bg-sky-500/30 border border-sky-400/30 text-sky-200 text-[9.5px] font-bold px-2.5 py-1 rounded-full transition cursor-pointer"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Voice Commands for Pages & Governorates ("اعطاء اوامر صوتيه بالصفحات") */}
        <div className="w-full text-right space-y-1.5">
          <span className="text-[10px] font-black text-white/60 block">
            📑 أوامر صوتية لفتح الصفحات والمحافظات:
          </span>
          <div className="flex flex-wrap gap-1.5 justify-center">
            <button
              type="button"
              onClick={() => processVoiceCommand('عايز اشترك')}
              className="bg-[#FF2D55]/20 text-rose-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FF2D55]/40 cursor-pointer"
            >
              📢 صفحة الاشتراك (عايز أشترك)
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('لوحة المشترك')}
              className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-400/40 cursor-pointer"
            >
              📊 صفحة المشتركين
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('خدماتي')}
              className="bg-orange-500/20 text-orange-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-orange-400/40 cursor-pointer"
            >
              ⚡ صفحة خدماتي والتتبع
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('خريطة جوجل')}
              className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-400/40 cursor-pointer"
            >
              🗺️ صفحة الخريطة
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('صفحة الرقابة')}
              className="bg-indigo-500/20 text-indigo-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-indigo-400/40 cursor-pointer"
            >
              🛡️ صفحة الرقابة
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('صفحة المفضلة')}
              className="bg-pink-500/20 text-pink-300 text-[10px] font-bold px-2.5 py-1 rounded-full border border-pink-400/40 cursor-pointer"
            >
              ❤️ صفحة المفضلة
            </button>
          </div>

          <div className="flex flex-wrap gap-1 justify-center pt-1">
            {['القاهرة', 'الجيزة', 'الإسكندرية', 'المنصورة', 'أسوان', 'طنطا', 'السويس', 'الغردقة'].map((gov) => (
              <button
                key={gov}
                type="button"
                onClick={() => processVoiceCommand(`محافظة ${gov}`)}
                className="bg-white/10 hover:bg-amber-400/20 text-white text-[9.5px] font-bold px-2 py-0.5 rounded-full border border-white/10 transition cursor-pointer flex items-center gap-1"
              >
                <MapPin className="w-2.5 h-2.5 text-amber-400" />
                <span>{gov}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Close Bar */}
        <div className="pt-2 border-t border-white/10 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>غلق نافذة الأوامر الصوتية (X)</span>
          </button>
        </div>

      </div>
    </div>
  );
};

