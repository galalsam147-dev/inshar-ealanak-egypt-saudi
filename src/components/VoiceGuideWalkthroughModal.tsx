import React, { useState, useEffect } from 'react';
import { 
  X, Volume2, VolumeX, Sparkles, TrendingUp, Award, 
  Mic, CheckCircle2, ShieldCheck, Play, Pause, Eye, Headphones, Radio
} from 'lucide-react';
import { SupportedLang } from '../types';
import { speakLoudText, stopSpeaking, SUBSCRIBER_WELCOME_AUDIO_SCRIPTS } from '../utils/speechVoiceAssistant';

interface VoiceGuideWalkthroughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdd: () => void;
  lang: SupportedLang;
}

export const VoiceGuideWalkthroughModal: React.FC<VoiceGuideWalkthroughModalProps> = ({
  isOpen,
  onClose,
  onOpenAdd,
  lang,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  useEffect(() => {
    // Stop any ongoing speech when modal unmounts or closes
    if (!isOpen) {
      stopSpeaking();
      setIsPlayingAudio(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const scriptText = SUBSCRIBER_WELCOME_AUDIO_SCRIPTS[lang] || SUBSCRIBER_WELCOME_AUDIO_SCRIPTS.ar;

  const handleTogglePlay = () => {
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakLoudText(scriptText, lang, {
        rate: 0.95,
        volume: 1.0,
        onEnd: () => setIsPlayingAudio(false),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-neutral-900 border border-white/20 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Top Header with Gradient */}
        <div className="bg-gradient-to-r from-[#FF2D55] via-purple-700 to-indigo-800 p-5 sm:p-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-2xl shadow-lg">
                🎙️✨
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black">
                  {lang === 'ar' ? 'دليل الاستخدام الذكي والمساعد الصوتي' : 'Smart Guide & Voice Assistant'}
                </h3>
                <p className="text-xs text-white/90 font-medium">
                  {lang === 'ar' ? 'كيف تستخدم إعلانك كمشترك لتحقيق الشهرة وأعلى مبيعات' : 'How to subscribe to E3lanak, gain massive fame, and maximize your sales'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Audio TTS Player Banner */}
          <div className="mt-4 bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleTogglePlay}
                className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white transition active:scale-95 shadow-lg cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-black animate-pulse ring-2 ring-amber-300'
                    : 'bg-[#FF2D55] hover:bg-[#ff3b61]'
                }`}
                title={isPlayingAudio ? 'إيقاف الصوت مؤقتاً' : 'استمع للشرح بصوت عالي'}
              >
                {isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ms-0.5" />}
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">
                    {lang === 'ar' ? 'الاستماع لقراءة الشرح بصوت عالي' : 'Listen to Loud Voice Guide'}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.2 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <Headphones className="w-3 h-3" />
                    <span>{lang === 'ar' ? 'للمكفوفين والمستخدمين' : 'Accessibility TTS'}</span>
                  </span>
                </div>
                <p className="text-[10px] text-white/70">
                  {isPlayingAudio
                    ? (lang === 'ar' ? '🔊 جاري التحدث بصوت عالي وواضح...' : '🔊 Speaking aloud now...')
                    : (lang === 'ar' ? 'اضغط للاستماع فوراً دون الحاجة للقراءة' : 'Click to hear instructions aloud')}
                </p>
              </div>
            </div>

            {isPlayingAudio && (
              <div className="flex items-end gap-1 h-5 pe-2">
                <span className="w-1 bg-amber-400 h-2 animate-bounce" />
                <span className="w-1 bg-amber-300 h-5 animate-bounce delay-100" />
                <span className="w-1 bg-yellow-400 h-3 animate-bounce delay-200" />
                <span className="w-1 bg-amber-400 h-4 animate-bounce delay-300" />
              </div>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Key Advantages Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. الشهرة والانتشار */}
            <div className="bg-gradient-to-br from-purple-950/40 to-neutral-900 border border-purple-500/30 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">
                {lang === 'ar' ? '١. شهرة واسعة وانتشار' : '1. Viral Fame & Reach'}
              </h4>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {lang === 'ar'
                  ? 'ريلز تفاعلية بالفيديو تعرض خدماتك وموقعك مباشرة أمام آلاف سكان القاهرة الجديدة والتجمع وكافة المحافظات.'
                  : 'TikTok reels showcasing your videos, work, and GPS location to thousands of daily active users.'}
              </p>
            </div>

            {/* 2. زيادة المبيعات المباشرة */}
            <div className="bg-gradient-to-br from-emerald-950/40 to-neutral-900 border border-emerald-500/30 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">
                {lang === 'ar' ? '٢. زيادة ضخمة بالمبيعات' : '2. Explosive Direct Sales'}
              </h4>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {lang === 'ar'
                  ? 'اتصال هاتفي ومحادثات واتساب فورية مباشرة مع العميل دون أي وسيط وبدون أي نسبة عمولة، الأرباح لك بنسبة 100%.'
                  : 'Direct calls and WhatsApp chats with zero commission, zero middleman. 100% of profit is yours.'}
              </p>
            </div>

            {/* 3. التميز والتشغيل المستمر */}
            <div className="bg-gradient-to-br from-amber-950/40 to-neutral-900 border border-amber-500/30 rounded-2xl p-3.5 space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">
                {lang === 'ar' ? '٣. تميز وشغل مستمر' : '3. Stand Out & Continuous Jobs'}
              </h4>
              <p className="text-[11px] text-white/70 leading-relaxed">
                {lang === 'ar'
                  ? 'علامة التوثيق الزرقاء وشهادة الثقة والترخيص الرسمي وظهورك في نتائج "الأقرب بالـ GPS" يجلب لك عقوداً وطلبات يومية.'
                  : 'Blue verification badge, trust credentials, and GPS nearest discovery keep jobs and orders flowing.'}
              </p>
            </div>
          </div>

          {/* Voice Input Guidance Box (اكتب أو قول للخانة) */}
          <div className="bg-blue-950/30 border border-blue-500/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-blue-300">
                {lang === 'ar' ? 'توجيه صوتي ذكي: اكتب أو قول للخانة!' : 'Smart Voice Dictation: Type or Speak for Every Field!'}
              </h4>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              {lang === 'ar'
                ? 'في كافة نماذج الإضافة والبحث، ستجد زر الميكروفون بجوار كل خانة. يمكنك إما الكتابة باليد أو الضغط على الميكروفون والتحدث بصوتك لملء الاسم، رقم الهاتف، العنوان في التجمع، التخصص، والأسعار دون الحاجة للطباعة.'
                : 'In all forms, you will find a microphone button next to each field. Tap it to dictate your business name, phone, address, and services effortlessly.'}
            </p>
          </div>

          {/* Privacy & Blind Screen-Reader Notice */}
          <div className="bg-neutral-800/80 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-white block">
                  {lang === 'ar' ? 'خصوصية مشفرة للمكالمات والحسابات' : 'Encrypted Privacy & Spam Protection'}
                </span>
                <span className="text-[11px] text-white/60">
                  {lang === 'ar' ? 'أرقام البنوك وإنستاباي مشفرة ومحجوبة تلقائياً مع حظر أي إزعاج يتجاوز 5 مكالمات يومياً أو 35 أسبوعياً.' : 'Bank and InstaPay masked, with automated rate limiting against spam calls.'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleTogglePlay}
              className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition shrink-0 cursor-pointer"
            >
              <Radio className="w-4 h-4 text-[#FF2D55]" />
              <span>{isPlayingAudio ? (lang === 'ar' ? 'إيقاف ⏹️' : 'Stop ⏹️') : (lang === 'ar' ? 'تشغيل الصوت 🔊' : 'Play Audio 🔊')}</span>
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-black/50 border-t border-white/10 p-4 sm:p-5 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              stopSpeaking();
              onClose();
            }}
            className="text-xs font-bold text-white/60 hover:text-white px-4 py-2 rounded-xl transition cursor-pointer"
          >
            {lang === 'ar' ? 'تخطي واستكشاف' : 'Skip & Explore'}
          </button>

          <button
            onClick={() => {
              stopSpeaking();
              onClose();
              onOpenAdd();
            }}
            className="bg-gradient-to-r from-[#FF2D55] via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xl shadow-[#FF2D55]/30 transition flex items-center gap-2 cursor-pointer"
          >
            <span>{lang === 'ar' ? 'انطلق وأضف نشاطك مجاناً لمدة 90 يوم 🚀' : 'Start Your 90-Day Free Listing 🚀'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
