import React, { useState } from 'react';
import { Business } from '../types';
import { 
  X, Copy, Check, MessageCircle, Send, Share2, Facebook, 
  ExternalLink, Sparkles, Smartphone, Download
} from 'lucide-react';

interface ShareActionSheetProps {
  business: Business;
  onClose: () => void;
  onShareCompleted?: () => void;
}

export const ShareActionSheet: React.FC<ShareActionSheetProps> = ({
  business,
  onClose,
  onShareCompleted,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const shareUrl = window.location.origin + `?biz=${business.id}`;
  const shareText = `شاهد إعلان "${business.name}" على إعلانك SAM | أرقام التواصل والخدمات والعروض: ${business.phone}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    if (onShareCompleted) onShareCompleted();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `إعلانك SAM - ${business.name}`,
          text: shareText,
          url: shareUrl,
        });
        if (onShareCompleted) onShareCompleted();
      } catch (err) {
        console.log('Share canceled or error:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full sm:max-w-md bg-neutral-900 border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl p-5 space-y-4 shadow-2xl text-white animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Handle / Close */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF2D55] to-amber-500 flex items-center justify-center text-white">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-white">
                مشاركة الفيديو والإعلان مع الأصدقاء
              </h3>
              <p className="text-[10px] text-white/50 truncate max-w-xs">
                {business.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Share Buttons Grid */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center text-xs">
          {/* WhatsApp */}
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShareCompleted && onShareCompleted()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-emerald-600/20 border border-white/10 transition group"
          >
            <div className="w-11 h-11 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <span className="text-[10px] font-bold text-white/90">واتساب</span>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShareCompleted && onShareCompleted()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-sky-600/20 border border-white/10 transition group"
          >
            <div className="w-11 h-11 rounded-full bg-[#0088cc] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <Send className="w-5 h-5 fill-white text-transparent ms-0.5" />
            </div>
            <span className="text-[10px] font-bold text-white/90">تيليجرام</span>
          </a>

          {/* Facebook */}
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onShareCompleted && onShareCompleted()}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-blue-600/20 border border-white/10 transition group"
          >
            <div className="w-11 h-11 rounded-full bg-[#1877F2] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <Facebook className="w-6 h-6 fill-white" />
            </div>
            <span className="text-[10px] font-bold text-white/90">فيسبوك</span>
          </a>

          {/* System Web Share API */}
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-white/5 hover:bg-[#FF2D55]/20 border border-white/10 transition group cursor-pointer"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#FF2D55] to-amber-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold text-white/90">تطبيقات أخرى</span>
          </button>
        </div>

        {/* Copy Link Input */}
        <div className="space-y-1.5 pt-2">
          <label className="text-[11px] font-bold text-white/70 block">
            رابط الفيديو المباشر:
          </label>
          <div className="flex items-center gap-2 bg-black/50 border border-white/15 rounded-xl p-1.5 ps-3">
            <span className="text-[11px] text-white/60 truncate flex-1 font-mono dir-ltr text-start">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1 cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white hover:bg-neutral-200 text-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>تم النسخ!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>نسخ الرابط</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Incentive Badge */}
        <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-400/20 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>مشاركة الفيديوهات مع أصدقائك تزيد نقاط التفاعل وتساهم في انتشار النشاط!</span>
        </div>

      </div>
    </div>
  );
};
