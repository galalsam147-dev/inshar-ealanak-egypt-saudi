import React, { useState } from 'react';
import { 
  X, Globe, Copy, Check, ExternalLink, ShieldCheck, 
  QrCode, Sparkles, Share2, Smartphone, Gift, CheckCircle2 
} from 'lucide-react';
import { SupportedLang } from '../types';

interface OfficialDomainModalProps {
  onClose: () => void;
  lang?: SupportedLang;
  businessId?: number | string;
  businessName?: string;
}

export const OfficialDomainModal: React.FC<OfficialDomainModalProps> = ({
  onClose,
  lang = 'ar',
  businessId,
  businessName,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Official Domain Links (alasematex.com)
  const OFFICIAL_DOMAIN = 'https://alasematex.com';
  const OFFICIAL_ADD_AD_URL = 'https://alasematex.com/add-ad';
  const OFFICIAL_TRIAL_URL = 'https://alasematex.com/free-3-months';
  const OFFICIAL_CURRENT_PAGE = businessId 
    ? `https://alasematex.com/p/${businessId}` 
    : `https://alasematex.com`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const shareViaWhatsApp = (url: string, text: string) => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`;
    const a = document.createElement('a');
    a.href = waUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };

  return (
    <div 
      className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
      dir="rtl"
    >
      <div 
        className="w-full max-w-lg bg-neutral-950 border border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl text-white space-y-4 my-auto relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-black font-black shadow-lg shadow-emerald-500/30">
              <Globe className="w-5 h-5 text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  الرابط النهائي بالدومين الرسمي
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/30">
                  دومين معتمد 🌐
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                منصة إعلانك الرسمية • دومين رسمي مشفر ومعتمد لجميع المشتركين
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Official Domain Badge */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-teal-950/40 border border-emerald-500/30 rounded-2xl p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>دومين رسمي محمي بشهادة SSL 256-bit</span>
            </span>
            <span className="text-[10px] bg-emerald-500 text-black font-black px-2 py-0.5 rounded-full">
              نشط وموثق
            </span>
          </div>
          <p className="text-[11px] text-white/80 leading-relaxed">
            المنصة تعمل برابط الدومين الرسمي المعتمد. لكل عميل صفحة واحدة برابط مخصص دون تكرار لحماية العلامات التجارية والمشتركين.
          </p>
        </div>

        {/* Links List */}
        <div className="space-y-3">
          {/* 1. Main Official Platform Link */}
          <div className="bg-neutral-900/90 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3 transition space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>🌐 رابط منصة إعلانك الرسمي الأساسي:</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">الرابط العام</span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-white/10">
              <input
                type="text"
                readOnly
                value={OFFICIAL_DOMAIN}
                className="bg-transparent flex-1 text-xs text-emerald-300 font-mono focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(OFFICIAL_DOMAIN, 'main')}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition shrink-0"
              >
                {copiedKey === 'main' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'main' ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* 2. Direct Add Ad Link */}
          <div className="bg-neutral-900/90 border border-white/10 hover:border-emerald-500/40 rounded-2xl p-3 transition space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <span>🚀 رابط زر "أضف إعلانك مجاناً" المباشر:</span>
              </span>
              <span className="text-[10px] text-amber-300 font-bold">3 شهور مجاناً 🎁</span>
            </div>

            <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-white/10">
              <input
                type="text"
                readOnly
                value={OFFICIAL_ADD_AD_URL}
                className="bg-transparent flex-1 text-xs text-amber-300 font-mono focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(OFFICIAL_ADD_AD_URL, 'add')}
                className="bg-amber-400 hover:bg-amber-300 text-black px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition shrink-0"
              >
                {copiedKey === 'add' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'add' ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* 3. Specific Business Page Link if available */}
          {businessId && (
            <div className="bg-gradient-to-r from-blue-950/40 via-neutral-900 to-indigo-950/40 border border-blue-500/40 rounded-2xl p-3 transition space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-sky-300 flex items-center gap-1.5">
                  <span>📍 رابط صفحة ({businessName || 'نشاطك'}) المباشرة بالدومين:</span>
                </span>
                <span className="text-[10px] text-sky-400 font-bold">صفحة مخصصة</span>
              </div>

              <div className="flex items-center gap-2 bg-black/60 rounded-xl p-2 border border-white/10">
                <input
                  type="text"
                  readOnly
                  value={OFFICIAL_CURRENT_PAGE}
                  className="bg-transparent flex-1 text-xs text-sky-300 font-mono focus:outline-none"
                />
                <button
                  onClick={() => copyToClipboard(OFFICIAL_CURRENT_PAGE, 'page')}
                  className="bg-sky-500 hover:bg-sky-400 text-black px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition shrink-0"
                >
                  {copiedKey === 'page' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'page' ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Share Buttons */}
        <div className="pt-2 flex items-center gap-2">
          <button
            onClick={() => shareViaWhatsApp(OFFICIAL_DOMAIN, 'منصة إعلانك الرسمية - أضف إعلانك الآن مجاناً لمدة 3 شهور بالدومين الرسمي:')}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>مشاركة عبر الواتساب</span>
          </button>

          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white/90 py-2.5 px-5 rounded-xl text-xs font-black transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
