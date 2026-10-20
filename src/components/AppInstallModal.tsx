import React, { useState, useEffect } from 'react';
import { 
  X, Download, Smartphone, Tablet, Monitor, CheckCircle2, 
  Share2, Sparkles, ExternalLink, ShieldCheck, ArrowRight, 
  Copy, Check, Play
} from 'lucide-react';
import { SupportedLang } from '../types';

interface AppInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: SupportedLang;
}

export const AppInstallModal: React.FC<AppInstallModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<'android' | 'ipad' | 'pc'>('android');

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      alert('لتثبيت البرنامج على هذا الجهاز: يمكنك الضغط على خيارات المتصفح (⋮) ثم اختيار "تثبيت التطبيق" أو "إضافة إلى الشاشة الرئيسية".');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="bg-neutral-950 border-2 border-emerald-500/50 w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl relative my-auto text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-900 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-black/40 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center shadow-lg text-emerald-300">
              <Smartphone className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-white">
                  تحميل وتثبيت البرنامج كأبلكيشن 📲
                </h3>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  جاهز للتشغيل
                </span>
              </div>
              <p className="text-[11px] text-emerald-100/90">
                يعمل على كافة أجهزة الآيباد، الآيفون، الأندرويد، والتابلت كبرنامج أصلي
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Main Action Banner */}
          <div className="bg-gradient-to-br from-emerald-950/60 via-neutral-900 to-teal-950/60 border border-emerald-500/40 rounded-2xl p-4 text-center space-y-3 shadow-lg">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr from-[#FF2D55] via-amber-500 to-emerald-400 p-1 shadow-xl">
              <div className="w-full h-full bg-black rounded-[20px] flex items-center justify-center text-2xl font-black">
                إ
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-white">
                منصة إعلانك - تتبع التاكسي والدليفري ودليل الخدمات الشامل
              </h4>
              <p className="text-[11px] text-white/70">
                تطبيق خفيف وسريع، لا يستهلك مساحة التخزين، تحديثات فورية بدون الحاجة لتحميل تحديثات يدوية.
              </p>
            </div>

            {/* Install Button */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-98 text-black font-black py-3 px-5 rounded-2xl text-sm transition shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>تثبيت وتحميل البرنامج فوراً على هذا الجهاز 🚀</span>
            </button>
          </div>

          {/* OS Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-white/5 border border-white/10 rounded-2xl text-xs">
            <button
              type="button"
              onClick={() => setSelectedTab('android')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'android'
                  ? 'bg-emerald-600 text-white shadow font-black'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>أندرويد / Google Play</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('ipad')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'ipad'
                  ? 'bg-emerald-600 text-white shadow font-black'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>الآيباد والآيفون (iOS)</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedTab('pc')}
              className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                selectedTab === 'pc'
                  ? 'bg-emerald-600 text-white shadow font-black'
                  : 'text-white/70 hover:bg-white/10'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>الكمبيوتر واللابتوب</span>
            </button>
          </div>

          {/* Tab Guides */}
          {selectedTab === 'android' && (
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>طريقة التثبيت على أجهزة أندرويد (Google Play):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-white/80 text-[11px] pr-2">
                <li>اضغط على زر <strong>"تثبيت وتحميل البرنامج فوراً"</strong> في الأعلى.</li>
                <li>ستظهر نافذة تأكيد على هاتفك، اضغط <strong>تثبيت (Install)</strong>.</li>
                <li>سيظهر رمز تطبيق <strong>إعلانك</strong> على شاشة هاتفك الرئيسية تماماً كأي برنامج أصلي من متجر Google Play.</li>
              </ol>
            </div>
          )}

          {selectedTab === 'ipad' && (
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <Tablet className="w-4 h-4" />
                <span>طريقة التثبيت على الآيباد والآيفون (iPad & iPhone):</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-white/80 text-[11px] pr-2">
                <li>افتح الموقع في متصفح <strong>سفاري (Safari)</strong> على الآيباد أو الآيفون.</li>
                <li>اضغط على أيقونة <strong>المشاركة (Share ⎋)</strong> أسفل أو أعلى الشاشة.</li>
                <li>مرر للأسفل واختر <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen ➕)</strong>.</li>
                <li>اضغط <strong>إضافة (Add)</strong> بالأعلى؛ وسيتم تثبيت البرنامج ليعمل بملء شاشة الآيباد كبرنامج كامل!</li>
              </ol>
            </div>
          )}

          {selectedTab === 'pc' && (
            <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                <Monitor className="w-4 h-4" />
                <span>طريقة التثبيت على الكمبيوتر ولابتوب:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-white/80 text-[11px] pr-2">
                <li>في متصفح Google Chrome أو Edge، اضغط على أيقونة التثبيت (⊕) في شريط العنوان بالأعلى.</li>
                <li>أو اضغط على القائمة (⋮) ثم اختر <strong>"تثبيت إعلانك كبرنامج"</strong>.</li>
                <li>سيعمل البرنامج في نافذة مستقلة وسريعة على سطح المكتب.</li>
              </ol>
            </div>
          )}

          {/* Share Link */}
          <div className="bg-black/50 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] text-white/50 block">رابط تحميل البرنامج المباشر:</span>
              <span className="font-mono text-white text-[11px] truncate block dir-ltr text-right">
                {window.location.origin}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-neutral-900 border-t border-white/10 p-3 sm:p-4 flex items-center justify-between">
          <span className="text-[11px] text-white/60">
            ✓ متوافق مع كافة أحجام الشاشات والآيباد والأجهزة اللوحية
          </span>
          <button
            type="button"
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-xl text-xs transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
