import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Heart, Share2, MessageCircle, Phone, 
  MapPin, Play, Pause, Sparkles, Volume2, VolumeX, Music 
} from 'lucide-react';
import { CustomerMediaPost, Business, SupportedLang } from '../types';

interface CustomerPostPlayerModalProps {
  post: CustomerMediaPost;
  business?: Business | null;
  onClose: () => void;
  onLike?: (postId: string | number) => void;
  lang: SupportedLang;
}

export const CustomerPostPlayerModal: React.FC<CustomerPostPlayerModalProps> = ({
  post,
  business,
  onClose,
  onLike,
  lang,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 1);
  const [hasLiked, setHasLiked] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  const postAudioRef = useRef<HTMLAudioElement | null>(null);

  // Synchronize soundtrack audio if present
  useEffect(() => {
    if (post.soundtrack?.url) {
      const isSoundtrackMuted = isMuted || post.soundtrack.isMuted || post.soundtrack.mutedByAdmin;
      if (!postAudioRef.current) {
        postAudioRef.current = new Audio(post.soundtrack.url);
      } else {
        postAudioRef.current.src = post.soundtrack.url;
      }
      postAudioRef.current.loop = true;
      postAudioRef.current.volume = isSoundtrackMuted ? 0 : (post.soundtrack.volume ?? 0.7);

      if (isPlaying && !isSoundtrackMuted) {
        postAudioRef.current.play().catch(() => {});
      } else {
        postAudioRef.current.pause();
      }
    }

    return () => {
      if (postAudioRef.current) {
        postAudioRef.current.pause();
      }
    };
  }, [isPlaying, isMuted, post.soundtrack]);

  const handleToggleLike = () => {
    if (!hasLiked) {
      setLikesCount((prev) => prev + 1);
      setHasLiked(true);
      onLike?.(post.id);
    } else {
      setLikesCount((prev) => Math.max(0, prev - 1));
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    const shareText = `شاهد تجربة ${post.userName} في ${post.businessName || business?.name || 'Dalilk'}: "${post.caption}"`;
    if (navigator.share) {
      navigator.share({
        title: post.businessName || business?.name || 'إعلانك',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${shareText}\n${window.location.href}`);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  // Determine animation class
  const animClass =
    post.textAnimation === 'wave'
      ? 'anim-wave-text'
      : post.textAnimation === 'bounce'
      ? 'anim-bounce-text'
      : post.textAnimation === 'slide'
      ? 'anim-slide-text'
      : post.textAnimation === 'neon'
      ? 'anim-neon-glow'
      : post.textAnimation === 'vibrate'
      ? 'anim-vibrate'
      : post.textAnimation === 'pop'
      ? 'anim-pop-text'
      : post.textAnimation === 'flip3d'
      ? 'anim-flip3d'
      : 'anim-marquee';

  const speedClass = 
    post.speed === 'slow' 
      ? 'speed-slow' 
      : post.speed === 'fast' 
      ? 'speed-fast' 
      : 'speed-normal';

  const fontSizeClass =
    post.fontSize === 'sm'
      ? 'text-xs sm:text-sm'
      : post.fontSize === 'lg'
      ? 'text-base sm:text-xl'
      : 'text-sm sm:text-base';

  const positionClass =
    post.position === 'top'
      ? 'mt-12 mb-auto'
      : post.position === 'center'
      ? 'my-auto'
      : 'mb-16 mt-auto';

  return (
    <div className="fixed inset-0 z-[90] bg-black/95 backdrop-blur-lg flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Toast Alert */}
      {shareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-[#FF2D55] text-white px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-bounce">
          تم نسخ رابط تجربة العميل بنجاح! 📋
        </div>
      )}

      {/* Main Container */}
      <div 
        className="relative w-full sm:max-w-md h-full sm:h-[88vh] bg-black sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl flex flex-col justify-between"
        dir="rtl"
      >
        {/* Top Control Header */}
        <div className="absolute top-0 inset-x-0 z-40 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2D55] to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
              {(post.userName || 'ع')[0]}
            </span>
            <div className="text-white drop-shadow">
              <h4 className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                <span>{post.userName}</span>
                <span className="bg-[#FF2D55] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                  تجربة عميل حية 🎥
                </span>
              </h4>
              <p className="text-[10px] text-white/70">
                {post.businessName || business?.name || 'إعلانك التجاري'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post.type === 'video' && (
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title={isMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition cursor-pointer"
              title="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Media Background */}
        <div 
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-black cursor-pointer"
          onClick={() => {
            if (post.type === 'video') {
              setIsPlaying(!isPlaying);
            }
          }}
        >
          {post.type === 'video' ? (
            <video
              src={post.url}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
              ref={(el) => {
                if (el) {
                  if (isPlaying) {
                    el.play().catch(() => {});
                  } else {
                    el.pause();
                  }
                }
              }}
            />
          ) : (
            <img
              src={post.url}
              alt="customer review"
              className="w-full h-full object-cover"
            />
          )}

          {/* Pause Icon Overlay */}
          {!isPlaying && post.type === 'video' && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white scale-110 shadow-2xl">
                <Play className="w-8 h-8 fill-white translate-x-0.5" />
              </div>
            </div>
          )}
        </div>

        {/* Gradient dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none z-10" />

        {/* MOVING ANIMATED TEXT OVERLAY (الكتابة المتحركة على الفيديو أو الصورة) */}
        <div className={`relative z-20 w-full px-3 overflow-hidden pointer-events-none ${positionClass}`}>
          <div
            className="w-full rounded-2xl py-2.5 px-3.5 backdrop-blur-md text-center border border-white/20 shadow-2xl overflow-hidden"
            style={{ backgroundColor: post.bgColor || 'rgba(0, 0, 0, 0.75)' }}
          >
            <div
              className={`${animClass} ${speedClass} font-black ${fontSizeClass} tracking-wide drop-shadow-md`}
              style={{ color: post.textColor || '#FFD700' }}
            >
              {post.caption}
            </div>
          </div>
        </div>

        {/* Bottom Floating Actions & Info */}
        <div className="relative z-30 p-4 pb-6 flex items-end justify-between gap-3">
          <div className="flex-1 space-y-1 text-white">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white drop-shadow">
                تاريخ النشر: {new Date(post.createdAt).toLocaleDateString('ar-EG')}
              </span>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                حركة: {post.textAnimation}
              </span>
            </div>

            {business && (
              <p className="text-xs text-white/80 line-clamp-1 drop-shadow flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#FF2D55] shrink-0" />
                <span>{business.name} - {business.city}</span>
              </p>
            )}

            {/* Soundtrack Badge */}
            {post.soundtrack && (
              <div className="flex items-center gap-1.5 bg-black/60 border border-amber-400/40 px-2 py-0.5 rounded-full text-[9px] text-amber-300 w-fit">
                <Music className="w-2.5 h-2.5 animate-spin" />
                <span className="max-w-[150px] truncate">
                  {post.soundtrack.title} {post.soundtrack.artist ? `• ${post.soundtrack.artist}` : ''}
                </span>
                {isMuted || post.soundtrack.isMuted || post.soundtrack.mutedByAdmin ? (
                  <VolumeX className="w-2.5 h-2.5 text-red-400" />
                ) : (
                  <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
                )}
              </div>
            )}
          </div>

          {/* Right Side Reel Actions */}
          <div className="flex flex-col items-center gap-3">
            {/* Like Button */}
            <button
              onClick={handleToggleLike}
              className="flex flex-col items-center group cursor-pointer"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition transform active:scale-75 shadow-lg backdrop-blur-md ${
                  hasLiked
                    ? 'bg-[#FF2D55] text-white shadow-[#FF2D55]/50'
                    : 'bg-black/50 text-white border border-white/20 hover:bg-black/70'
                }`}
              >
                <Heart className={`w-5 h-5 ${hasLiked ? 'fill-white stroke-white' : 'stroke-white'}`} />
              </div>
              <span className="text-[10px] font-bold text-white mt-1 drop-shadow">
                {likesCount}
              </span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition active:scale-90 shadow-lg cursor-pointer"
              title="مشاركة"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* WhatsApp Contact with Place */}
            {business?.phone && (
              <button
                onClick={() => {
                  const waUrl = `https://wa.me/${business.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `مرحباً ${business.name}، شاهدت تجربة العميل (${post.userName}) على إعلانك وأرغب بالاستفسار.`
                  )}`;
                  window.open(waUrl, '_blank', 'noopener,noreferrer');
                }}
                className="w-11 h-11 rounded-full bg-[#25D366] hover:bg-[#20ba59] flex items-center justify-center text-white transition active:scale-90 shadow-lg shadow-[#25D366]/40 cursor-pointer"
                title="واتساب النشاط"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
              </button>
            )}

            {/* Direct Call with Place */}
            {business?.phone && (
              <button
                onClick={() => {
                  window.location.href = `tel:${business.phone}`;
                }}
                className="w-11 h-11 rounded-full bg-white hover:bg-neutral-200 text-black flex items-center justify-center transition active:scale-90 shadow-lg cursor-pointer"
                title="اتصال بالنشاط"
              >
                <Phone className="w-5 h-5 fill-black" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
