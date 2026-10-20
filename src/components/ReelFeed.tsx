import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  Heart, MapPin, Share2, MessageCircle, CheckCircle, ExternalLink, 
  Play, Pause, ChevronUp, ChevronDown, Volume2, VolumeX, Sparkles, 
  Phone, Megaphone, Navigation, Video, Globe, ShoppingBag, Bed, Music, KeyRound, Film, CreditCard 
} from 'lucide-react';
import { Business, CustomerMediaPost, SupportedCurrency, SupportedLang, BusinessSoundtrack } from '../types';
import { I18N, getCategoryLabel, getCityLabel } from '../utils/translations';
import { formatDistance } from '../utils/distance';
import { formatServicePrice } from '../utils/currency';
import { isDeliveryEligible } from '../utils/deliveryEligibility';
import { UI_TRANSLATIONS } from '../utils/uiI18n';
import { globalStereoAudioEngine } from '../utils/stereoAudioEngine';
import { TargetBookingBadge } from './TargetBookingBadge';
import { StarRatingWidget } from './StarRatingWidget';

interface ReelFeedProps {
  businesses: Business[];
  onOpenBiz: (business: Business) => void;
  isMuted: boolean;
  onToggleMute?: () => void;
  onToggleLike: (id: number | string) => void;
  likedIds: Set<number | string>;
  currentCurrency: SupportedCurrency;
  lang: SupportedLang;
  onOpenCustomerUpload?: (b: Business) => void;
  onOpenCustomerPost?: (post: CustomerMediaPost, b: Business) => void;
  onOpenBooking?: (b: Business) => void;
  onOpenDelivery?: (b: Business) => void;
  userFollowingIds?: (string | number)[];
  onToggleFollow?: (bizId: string | number) => void;
  onOpenDashboard?: (b: Business) => void;
  onOpenComments?: (b: Business) => void;
  onOpenShareActionSheet?: (b: Business) => void;
  onOpenOwnerLock?: (b: Business) => void;
  onOpenPriceList?: (b: Business) => void;
  onOpenMusicBank?: (soundtrack?: BusinessSoundtrack) => void;
  onOpenTransportModal?: (b: Business) => void;
  onOpenGoogleMaps?: (b?: Business) => void;
  onRateBusiness?: (bizId: number | string, newRating: number, newCount: number) => void;
}

export const ReelFeed: React.FC<ReelFeedProps> = ({
  businesses,
  onOpenBiz,
  isMuted,
  onToggleMute,
  onToggleLike,
  likedIds,
  currentCurrency,
  lang,
  onOpenCustomerUpload,
  onOpenCustomerPost,
  onOpenBooking,
  onOpenDelivery,
  userFollowingIds = [],
  onToggleFollow,
  onOpenDashboard,
  onOpenComments,
  onOpenShareActionSheet,
  onOpenOwnerLock,
  onOpenPriceList,
  onOpenMusicBank,
  onOpenTransportModal,
  onOpenGoogleMaps,
  onRateBusiness,
}) => {
  const t = I18N[lang];
  const tUi = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [heartAnimId, setHeartAnimId] = useState<number | string | null>(null);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [failedVideoIds, setFailedVideoIds] = useState<Set<number | string>>(new Set());
  const [phoneSelectorBiz, setPhoneSelectorBiz] = useState<Business | null>(null);

  // Store references to video elements
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  // Soundtrack audio element reference
  const soundtrackAudioRef = useRef<HTMLAudioElement | null>(null);

  // Smooth scroll to an index
  const scrollToIndex = useCallback((index: number) => {
    if (index < 0 || index >= businesses.length) return;
    const container = containerRef.current;
    if (!container) return;
    const targetElement = container.children[index] as HTMLElement | undefined;
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      setActiveVideoIndex(index);
      setIsPlaying(true);
    }
  }, [businesses.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToIndex(activeVideoIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToIndex(activeVideoIndex - 1);
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeVideoIndex, scrollToIndex]);

  // Intersection listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: any;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const children = Array.from(container.children) as HTMLElement[];
        const scrollPos = container.scrollTop;

        let closestIdx = 0;
        let minDiff = Infinity;

        children.forEach((child, idx) => {
          const childTop = child.offsetTop;
          const diff = Math.abs(childTop - scrollPos);
          if (diff < minDiff) {
            minDiff = diff;
            closestIdx = idx;
          }
        });

        if (closestIdx !== activeVideoIndex) {
          setActiveVideoIndex(closestIdx);
          setIsPlaying(true);
        }
      }, 50);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [activeVideoIndex]);

  // Video and soundtrack audio playback management
  useEffect(() => {
    const currentBiz = businesses[activeVideoIndex];

    // Handle Soundtrack Audio
    if (soundtrackAudioRef.current) {
      soundtrackAudioRef.current.pause();
    }

    if (currentBiz?.soundtrack && currentBiz.soundtrack.url) {
      const isSoundtrackMuted = isMuted || currentBiz.soundtrack.isMuted || currentBiz.soundtrack.mutedByAdmin;
      if (!soundtrackAudioRef.current) {
        soundtrackAudioRef.current = new Audio(currentBiz.soundtrack.url);
      } else if (soundtrackAudioRef.current.src !== currentBiz.soundtrack.url) {
        soundtrackAudioRef.current.src = currentBiz.soundtrack.url;
      }

      soundtrackAudioRef.current.loop = true;
      soundtrackAudioRef.current.volume = isSoundtrackMuted ? 0 : (currentBiz.soundtrack.volume ?? 0.7);

      // Connect to Integrated Stereo Audio Engine (Surround & Equalizer)
      try {
        globalStereoAudioEngine.setup(soundtrackAudioRef.current, {
          volume: isSoundtrackMuted ? 0 : (currentBiz.soundtrack.volume ?? 0.7),
          stereoPan: currentBiz.soundtrack.stereoPan ?? 0,
          stereoMode: currentBiz.soundtrack.stereoMode ?? 'surround_3d',
          bassBoost: currentBiz.soundtrack.bassBoost ?? 4,
          trebleBoost: currentBiz.soundtrack.trebleBoost ?? 3,
        });
      } catch (err) {
        console.warn('Stereo audio engine setup notice:', err);
      }

      if (isPlaying && !isSoundtrackMuted) {
        soundtrackAudioRef.current.play().catch(() => {});
      }
    }

    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === activeVideoIndex) {
        // If there's an active soundtrack playing, we keep the video itself muted to avoid audio clashes
        const hasActiveSoundtrack = currentBiz?.soundtrack && !currentBiz.soundtrack.isMuted && !currentBiz.soundtrack.mutedByAdmin;
        video.muted = isMuted || Boolean(hasActiveSoundtrack);

        if (isPlaying) {
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {
              // If browser blocked unmuted autoplay before first gesture, start muted then unmute on first click
              video.muted = true;
              video.play().catch(() => {});
            });
          }
        } else {
          video.pause();
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });

    return () => {
      if (soundtrackAudioRef.current) {
        soundtrackAudioRef.current.pause();
      }
    };
  }, [activeVideoIndex, isPlaying, isMuted, businesses]);

  // Ensure first user tap anywhere immediately unlocks audio if !isMuted
  useEffect(() => {
    if (isMuted) return;
    const unlockAudio = () => {
      const currentBiz = businesses[activeVideoIndex];
      const activeVideo = videoRefs.current[activeVideoIndex];
      const hasActiveSoundtrack =
        currentBiz?.soundtrack && !currentBiz.soundtrack.isMuted && !currentBiz.soundtrack.mutedByAdmin;

      if (hasActiveSoundtrack && soundtrackAudioRef.current && isPlaying) {
        soundtrackAudioRef.current.volume = currentBiz.soundtrack?.volume ?? 0.7;
        soundtrackAudioRef.current.play().catch(() => {});
      }
      if (activeVideo && !hasActiveSoundtrack) {
        activeVideo.muted = false;
        if (isPlaying) activeVideo.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    return () => window.removeEventListener('pointerdown', unlockAudio);
  }, [isMuted, activeVideoIndex, isPlaying, businesses]);

  const handleDoubleTap = (b: Business) => {
    onToggleLike(b.id);
    setHeartAnimId(b.id);
    setTimeout(() => setHeartAnimId(null), 900);
  };

  const handleShare = (e: React.MouseEvent, b: Business) => {
    e.stopPropagation();
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: b.name,
        text: `${b.name} - ${b.city} | إعلانك E3lanak`,
        url,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${b.name} - ${b.city}\n${window.location.origin}`);
      setShareToast(lang === 'ar' ? 'تم نسخ رابط النشاط!' : 'Listing link copied!');
      setTimeout(() => setShareToast(null), 2500);
    }
  };

  const handleVideoError = (id: number | string) => {
    setFailedVideoIds((prev) => new Set(prev).add(id));
  };

  if (businesses.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-white/60 space-y-3">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
          🔍
        </div>
        <p className="text-sm font-semibold max-w-xs">{t.noResults}</p>
        <span className="text-xs text-white/40">{t.expiredNotice}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      {/* Scrollable Container with Snap-Y */}
      <div
        ref={containerRef}
        className="w-full h-full overflow-y-auto snap-y-mandatory hide-scroll bg-black"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Toast alert */}
        {shareToast && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] bg-[#FF2D55] text-white px-4 py-2 rounded-full text-xs font-bold shadow-xl animate-bounce">
            {shareToast}
          </div>
        )}

        {businesses.map((b, idx) => {
          const isCurrent = idx === activeVideoIndex;
          const daysLeft = Math.ceil((b.expiry - Date.now()) / 86400000);
          const isLiked = likedIds.has(b.id);
          const videoSrc = b.videos?.[0];
          const imageSrc = b.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800';
          const isVideoFailed = failedVideoIds.has(b.id);
          const allPhones = b.phones && b.phones.length > 0 ? b.phones : [b.phone];

          return (
            <div
              key={b.id}
              className="h-full min-h-full w-full snap-start relative flex items-center justify-center bg-black overflow-hidden"
              onDoubleClick={() => handleDoubleTap(b)}
            >
              {/* Media Layer (Image fallback + Video) - 100% Full Screen */}
              <div className="absolute inset-0 w-full h-full bg-neutral-950 flex items-center justify-center">
                <img
                  src={imageSrc}
                  alt={b.name}
                  className="w-full h-full object-cover"
                />

                {videoSrc && !isVideoFailed && (
                  <video
                    ref={(el) => {
                      videoRefs.current[idx] = el;
                    }}
                    src={videoSrc}
                    poster={b.poster || imageSrc}
                    muted={isMuted}
                    loop
                    playsInline
                    preload={idx <= 1 ? 'auto' : 'metadata'}
                    onError={() => handleVideoError(b.id)}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Gradient Dark Overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.94) 0%, rgba(0,0,0,0.2) 45%, rgba(0,0,0,0.45) 100%)',
                }}
              />

              {/* Center Play/Pause indicator overlay on tap */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="absolute inset-0 w-full h-full z-10 flex items-center justify-center focus:outline-none"
                aria-label="Toggle Play"
              >
                {!isPlaying && (
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-110 transition shadow-2xl">
                    <Play className="w-8 h-8 fill-white translate-x-0.5" />
                  </div>
                )}
              </button>

              {/* Heart Pop Animation on Double Click */}
              {heartAnimId === b.id && (
                <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                  <Heart className="w-28 h-28 fill-[#FF2D55] text-[#FF2D55] animate-ping" />
                </div>
              )}

              {/* Clear, High-Visibility Advertisement Banner (إظهار الإعلان بوضوح أسفل الشريط العلوي) */}
              {(b.isSponsored || b.isDealOfDay || b.adCampaignTitle) && (
                <div className="absolute top-9 inset-x-2 z-30 flex items-center justify-between gap-1.5 bg-gradient-to-r from-black/85 via-neutral-900/90 to-black/85 backdrop-blur-md border border-amber-400/50 px-2.5 py-1 rounded-full shadow-lg pointer-events-auto">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-black text-[8.5px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0 shadow">
                      <Megaphone className="w-2.5 h-2.5 fill-black" />
                      <span>إعلان معتمد ⚡</span>
                    </span>

                    <span className="text-[10px] font-bold text-amber-300 truncate">
                      {b.adCampaignTitle || 'عرض ترويجي مميز عبر انشر إعلانك'}
                    </span>
                  </div>

                  {b.isDealOfDay && (
                    <span className="bg-red-600 text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shrink-0 shadow animate-pulse flex items-center gap-0.5">
                      <Sparkles className="w-2 h-2 fill-yellow-300" />
                      <span>عرض اليوم 🔥</span>
                    </span>
                  )}
                </div>
              )}

              {/* Customer Post Moving Text Ticker Strip */}
              {b.customerPosts && b.customerPosts.length > 0 && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenCustomerPost?.(b.customerPosts![0], b);
                  }}
                  className={`absolute ${b.isSponsored || b.isDealOfDay || b.adCampaignTitle ? 'top-17' : 'top-9'} inset-x-2 z-30 pointer-events-auto cursor-pointer`}
                  title="اضغط لمشاهدة فيديو وتجربة العميل بكتابة متحركة"
                >
                  <div className="bg-black/65 hover:bg-black/85 backdrop-blur-md border border-purple-500/40 hover:border-purple-400 rounded-full px-2.5 py-1 flex items-center gap-1.5 overflow-hidden shadow-lg transition active:scale-98">
                    <span className="bg-[#FF2D55] text-white text-[8.5px] font-black px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      <span>تجارب العملاء ({b.customerPosts.length})</span>
                    </span>
                    <div className="overflow-hidden flex-1">
                      <div className="anim-marquee speed-normal text-[10px] font-black text-amber-300 drop-shadow">
                        {b.customerPosts[0].userName}: {b.customerPosts[0].caption}
                      </div>
                    </div>
                    <span className="text-[8.5px] text-white/90 font-bold bg-white/10 px-1.5 py-0.5 rounded-full shrink-0">
                      مشاهدة ▶
                    </span>
                  </div>
                </div>
              )}

              {/* Subscriber Promotional Animated Text Overlay on the Reel (التحريك النيوني، التذبذب، زاحف...) */}
              {(b.overlayText?.caption || b.textAnimation) && (
                <div 
                  className={`absolute z-25 pointer-events-none inset-x-2 text-center ${
                    b.overlayText?.position === 'top'
                      ? 'top-25'
                      : b.overlayText?.position === 'center'
                      ? 'top-1/2 -translate-y-1/2'
                      : 'bottom-32'
                  }`}
                >
                  <div
                    className={`${
                      b.overlayText?.bannerStyle === 'neon_glow_box'
                        ? 'banner-neon_glow_box'
                        : b.overlayText?.bannerStyle === 'glass_red'
                        ? 'banner-glass_red'
                        : b.overlayText?.bannerStyle === 'glass_gold'
                        ? 'banner-glass_gold'
                        : b.overlayText?.bannerStyle === 'emerald_card'
                        ? 'banner-emerald_card'
                        : b.overlayText?.bannerStyle === 'sticker_gradient'
                        ? 'banner-sticker_gradient'
                        : b.overlayText?.bannerStyle === 'badge_angled'
                        ? 'banner-badge_angled'
                        : b.overlayText?.bannerStyle === 'transparent_outline'
                        ? 'banner-transparent_outline'
                        : 'banner-glass_dark'
                    } px-3 py-1 rounded-2xl overflow-hidden inline-block mx-auto max-w-[92%] transition-all`}
                  >
                    <div
                      className={`${
                        (b.overlayText?.animation || b.textAnimation) === 'neon'
                          ? 'anim-neon-glow'
                          : (b.overlayText?.animation || b.textAnimation) === 'vibrate'
                          ? 'anim-vibrate'
                          : (b.overlayText?.animation || b.textAnimation) === 'wave'
                          ? 'anim-wave-text'
                          : (b.overlayText?.animation || b.textAnimation) === 'bounce'
                          ? 'anim-bounce-text'
                          : (b.overlayText?.animation || b.textAnimation) === 'slide'
                          ? 'anim-slide-text'
                          : (b.overlayText?.animation || b.textAnimation) === 'pop'
                          ? 'anim-pop-text'
                          : (b.overlayText?.animation || b.textAnimation) === 'flip3d'
                          ? 'anim-flip3d'
                          : (b.overlayText?.animation || b.textAnimation) === 'typewriter'
                          ? 'anim-typewriter'
                          : (b.overlayText?.animation || b.textAnimation) === 'shimmer'
                          ? 'anim-shimmer'
                          : 'anim-marquee'
                      } ${
                        b.overlayText?.fontStyle === 'kufi'
                          ? 'font-style-kufi'
                          : b.overlayText?.fontStyle === 'ruqah'
                          ? 'font-style-ruqah'
                          : b.overlayText?.fontStyle === 'bold_poster'
                          ? 'font-style-bold_poster'
                          : b.overlayText?.fontStyle === 'neon_cyber'
                          ? 'font-style-neon_cyber'
                          : b.overlayText?.fontStyle === 'typewriter'
                          ? 'font-style-typewriter'
                          : 'font-style-naskh'
                      } ${
                        b.overlayText?.speed === 'slow'
                          ? 'speed-slow'
                          : b.overlayText?.speed === 'fast'
                          ? 'speed-fast'
                          : 'speed-normal'
                      } ${
                        b.overlayText?.fontSize === 'sm'
                          ? 'text-xs'
                          : b.overlayText?.fontSize === 'lg'
                          ? 'text-sm font-black'
                          : 'text-xs font-black'
                      } font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] tracking-wide`}
                      style={{ color: b.overlayText?.textColor || '#00F0FF' }}
                    >
                      {b.overlayText?.caption || b.bio}
                    </div>
                  </div>
                </div>
              )}

              {/* RIGHT SIDE FLOATING ACTION BUTTONS (الشريط يمين الشاشة مع تنقل شكل الخريطة أعلى الصورة) */}
              <div 
                className="absolute right-2 sm:right-3 bottom-3 z-30 flex flex-col items-center gap-2 pointer-events-auto select-none bg-black/45 backdrop-blur-md p-1.5 rounded-full border border-white/15 shadow-xl" 
                dir="ltr"
              >
                {/* زر تنقل شكل الخريطة أعلى الصورة في الشريط يمين الشاشة */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenGoogleMaps) {
                      onOpenGoogleMaps(b);
                    } else if (onOpenTransportModal) {
                      onOpenTransportModal(b);
                    }
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title={lang === 'ar' ? 'الخريطة التفاعلية وموقع النشاط' : 'Interactive Map & Location'}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:brightness-110 text-black border border-white/60 flex items-center justify-center transition transform active:scale-75 shadow-md">
                    <MapPin className="w-4 h-4 fill-black text-black" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-300 leading-tight mt-0.5">
                    {lang === 'ar' ? 'الخريطة' : 'Map'}
                  </span>
                </button>

                {/* TikTok Profile Avatar with small '+' Subscribe button */}
                <div className="relative mb-1 flex flex-col items-center">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenBiz(b);
                    }}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-amber-400/80 overflow-hidden shadow-md cursor-pointer bg-neutral-800 transition transform hover:scale-105"
                    title={b.name}
                  >
                    <img
                      src={b.images?.[0] || ''}
                      alt={b.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>

                  {/* '+' Plus badge directly under the image for subscribing */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleFollow) {
                        onToggleFollow(b.id);
                      }
                    }}
                    className={`absolute -bottom-1.5 inset-x-0 mx-auto w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 shadow border border-white cursor-pointer ${
                      userFollowingIds.includes(b.id)
                        ? 'bg-emerald-500 text-white scale-90'
                        : 'bg-[#FF2D55] text-white hover:scale-110'
                    }`}
                    title={userFollowingIds.includes(b.id) ? 'تم الاشتراك ✓' : 'اشترك وتابع +'}
                  >
                    {userFollowingIds.includes(b.id) ? (
                      <CheckCircle className="w-3 h-3 fill-white text-emerald-500" />
                    ) : (
                      <span className="text-[10px] font-black leading-none pb-0.5 select-none">+</span>
                    )}
                  </button>
                </div>

                {/* زر الإعجاب (Like) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleLike(b.id);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  aria-label="Like"
                >
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition transform active:scale-75 shadow-sm ${
                      isLiked
                        ? 'bg-gradient-to-tr from-[#FF2D55] to-rose-500 text-white ring-1 ring-white/40'
                        : 'bg-white/10 text-white border border-white/15 hover:bg-white/20'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isLiked ? 'fill-white stroke-white' : 'stroke-white'}`}
                    />
                  </div>
                  <span className="text-[9px] font-bold text-white/90 leading-tight mt-0.5">
                    {(b.likes || 0) + (isLiked ? 1 : 0)}
                  </span>
                </button>

                {/* زر التعليقات (Comments) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenComments?.(b);
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title="تعليقات واستفسارات الزوار"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 text-white border border-white/15 hover:bg-white/20 flex items-center justify-center transition transform active:scale-75 shadow-sm">
                    <MessageCircle className="w-4 h-4 text-sky-300" />
                  </div>
                  <span className="text-[9px] font-bold text-white/90 leading-tight mt-0.5">
                    {b.comments?.length || 2}
                  </span>
                </button>

                {/* زر الاتصال السريع (Call) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (allPhones.length > 1) {
                      setPhoneSelectorBiz(b);
                    } else {
                      window.location.href = `tel:${b.phone}`;
                    }
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title="اتصل بالنشاط فوراً"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 hover:brightness-110 text-black flex items-center justify-center transition transform active:scale-75 shadow-sm border border-white/30">
                    <Phone className="w-4 h-4 fill-black" />
                  </div>
                  <span className="text-[9px] font-black text-emerald-300 leading-tight mt-0.5">
                    اتصل
                  </span>
                </button>

                {/* زر الواتساب (WhatsApp) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (allPhones.length > 1) {
                      setPhoneSelectorBiz(b);
                    } else {
                      const waUrl = `https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${b.name}، استفسار من منصة E3lanak إعلانك`
                      )}`;
                      window.open(waUrl, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title={tUi.whatsappBtn}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] hover:brightness-110 flex items-center justify-center text-white transition transform active:scale-75 shadow-sm border border-white/30">
                    <MessageCircle className="w-4 h-4 fill-white" />
                  </div>
                  <span className="text-[9px] font-black text-[#25D366] leading-tight mt-0.5">
                    واتس
                  </span>
                </button>

                {/* زر المشاركة (Share) */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenShareActionSheet) {
                      onOpenShareActionSheet(b);
                    } else {
                      handleShare(e, b);
                    }
                  }}
                  className="flex flex-col items-center group cursor-pointer"
                  title={tUi.shareBtn}
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 flex items-center justify-center text-white transition transform active:scale-75 shadow-sm">
                    <Share2 className="w-4 h-4 text-amber-300" />
                  </div>
                  <span className="text-[9px] font-black text-amber-300 leading-tight mt-0.5">
                    نشر
                  </span>
                </button>

                {/* زر تفعيل وكتم الصوت (Sound) */}
                {onToggleMute && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute();
                    }}
                    className="flex flex-col items-center group cursor-pointer"
                    title={isMuted ? 'تفعيل الصوت 🔊' : 'الصوت مفعل 🔊'}
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition transform active:scale-75 shadow-sm border ${
                        isMuted
                          ? 'bg-red-500/25 border-red-400/50 text-red-300'
                          : 'bg-purple-600/80 border-purple-300/60 text-white shadow-purple-500/30'
                      }`}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-300" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
                      )}
                    </div>
                    <span className="text-[9px] font-black text-purple-200 leading-tight mt-0.5">
                      {isMuted ? 'صامت' : 'الصوت'}
                    </span>
                  </button>
                )}
              </div>

              {/* BOTTOM BUSINESS DETAILS & ACTION BUTTONS */}
              <div 
                className="absolute right-14 sm:right-16 left-3 bottom-3 z-20 pointer-events-auto space-y-1.5 select-none max-w-2xl"
                dir="rtl"
              >
                {/* Category, Distance, and Expiry Badges */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-black/55 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/15">
                    {getCategoryLabel(b.cat, lang)}
                  </span>

                  {/* Real GPS distance badge */}
                  {b.distanceKm !== undefined && (
                    <span className="bg-emerald-500/25 backdrop-blur-md text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5 fill-emerald-300" />
                      <span>{formatDistance(b.distanceKm, lang)}</span>
                    </span>
                  )}

                  {b.pkg === 799 && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      👑 VIP
                    </span>
                  )}

                  {/* For Sale Badge */}
                  {b.forSaleItem?.isForSale && (
                    <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <span>🏷️ {tUi.forSaleTab}:</span>
                      <span>{b.forSaleItem.price.toLocaleString()} ج.م</span>
                    </span>
                  )}

                  {/* Website Custom Domain link */}
                  {b.websiteUrl && (
                    <a
                      href={b.websiteUrl.startsWith('http') ? b.websiteUrl : `https://${b.websiteUrl}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="bg-blue-600/50 hover:bg-blue-600 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-400/50 flex items-center gap-1 transition"
                      title={lang === 'ar' ? 'الموقع الرسمي' : 'Official Website'}
                    >
                      <Globe className="w-3 h-3" />
                      <span>{lang === 'ar' ? 'الموقع الرسمي' : 'Website'}</span>
                    </a>
                  )}
                </div>

                {/* Title, Verified Badge, Star Rating, and Follow */}
                <div
                  onClick={() => onOpenBiz(b)}
                  className="cursor-pointer group flex items-center gap-2 flex-wrap"
                >
                  <h2 className="text-base sm:text-xl font-black text-white group-hover:text-[#FF2D55] transition drop-shadow-md">
                    {b.name}
                  </h2>
                  {b.verified === 1 && (
                    <CheckCircle className="w-4 h-4 fill-[#20D5EC] text-black shrink-0" />
                  )}

                  {/* Star Rating Widget inline */}
                  <StarRatingWidget
                    business={b}
                    onRate={onRateBusiness}
                    variant="card"
                    size="sm"
                  />

                  {onToggleFollow && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFollow(b.id);
                      }}
                      className={`h-6 px-3 rounded-full text-[10px] font-black transition flex items-center cursor-pointer ${
                        userFollowingIds.includes(b.id)
                          ? 'bg-white/15 text-white border border-white/25'
                          : 'bg-gradient-to-r from-[#FF2D55] to-rose-600 text-white shadow hover:brightness-110 active:scale-95'
                      }`}
                    >
                      {userFollowingIds.includes(b.id) ? tUi.followingBtn : tUi.followBtn}
                    </button>
                  )}
                </div>

                {/* Short Bio (1 line clean) */}
                <p
                  onClick={() => onOpenBiz(b)}
                  className="text-xs sm:text-sm text-white/85 line-clamp-1 leading-snug cursor-pointer drop-shadow max-w-xl"
                >
                  {b.bio}
                </p>

                {/* Address Linked directly with GPS Location (ربط اللوكيشن بالعنوان) & Price & Soundtrack */}
                <div className="flex items-center gap-1.5 text-xs text-white/90 flex-wrap">
                  <a
                    href={
                      b.lat && b.lng
                        ? `https://www.google.com/maps/dir/?api=1&destination=${b.lat},${b.lng}`
                        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${b.name} ${b.city} ${b.addr}`)}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="h-6 sm:h-7 inline-flex items-center gap-1.5 bg-black/65 hover:bg-emerald-950/80 border border-emerald-400/40 px-2.5 sm:px-3 rounded-full text-[10px] sm:text-xs font-bold text-white hover:text-emerald-300 transition shadow-sm backdrop-blur-md cursor-pointer"
                    title="اضغط لفتح اللوكيشن والعنوان مباشرة على خرائط GPS"
                  >
                    <Navigation className="w-3 h-3 text-emerald-400 fill-emerald-400 shrink-0" />
                    <span>العنوان واللوكيشن: {getCityLabel(b.city, lang)} - {b.addr}</span>
                    {b.distanceKm !== undefined && (
                      <span className="text-amber-300 font-black ms-0.5">
                        ({formatDistance(b.distanceKm, lang)})
                      </span>
                    )}
                  </a>

                  {b.services?.[0] && (
                    <span className="bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black text-emerald-300">
                      {formatServicePrice(b.services[0].p, currentCurrency)}
                    </span>
                  )}

                  {/* Soundtrack Audio Pill */}
                  {b.soundtrack && (
                    <div 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenMusicBank) {
                          onOpenMusicBank(b.soundtrack);
                        } else if (onToggleMute) {
                          onToggleMute();
                        }
                      }}
                      className={`h-6 flex items-center gap-1 px-2.5 rounded-full text-[10px] font-bold backdrop-blur-md border transition cursor-pointer select-none ${
                        b.soundtrack.mutedByAdmin
                          ? 'bg-red-950/60 border-red-500/40 text-red-300'
                          : isMuted || b.soundtrack.isMuted
                          ? 'bg-black/50 border-white/20 text-white/60 hover:text-white'
                          : 'bg-black/60 border-amber-400/40 text-amber-300 hover:border-amber-300'
                      }`}
                      title="اضغط لبنك الموسيقى 🎵"
                    >
                      <Music className={`w-3 h-3 ${!isMuted && !b.soundtrack.isMuted && !b.soundtrack.mutedByAdmin ? 'animate-spin text-amber-300' : ''}`} />
                      <span className="max-w-[120px] truncate">
                        {b.soundtrack.title}
                      </span>
                    </div>
                  )}

                  {/* Interactive Presentation Badge */}
                  {b.interactivePresentation?.enabled && (b.interactivePresentation.slides?.length || 0) > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenBiz(b);
                      }}
                      className="h-6 inline-flex items-center gap-1 px-2.5 rounded-full text-[10px] font-black bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow cursor-pointer"
                      title="عرض ترويجي تفاعلي"
                    >
                      <Film className="w-3 h-3" />
                      <span>عرض تفاعلي 🎬</span>
                    </button>
                  )}
                </div>

                {/* Bottom Action Buttons Row */}
                <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                  {/* زر الطلب */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isDeliveryEligible(b) && onOpenDelivery) {
                        onOpenDelivery(b);
                      } else if (onOpenPriceList) {
                        onOpenPriceList(b);
                      } else {
                        onOpenBiz(b);
                      }
                    }}
                    className="h-7 sm:h-8 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-95 text-black text-[10px] sm:text-xs font-black px-3.5 rounded-full flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-white/40"
                    title="اطلب الآن من هذا النشاط"
                  >
                    <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-black text-black" />
                    <span>{lang === 'ar' ? 'اطلب الآن ⚡' : 'Order Now ⚡'}</span>
                  </button>

                  {/* زر قائمة الأسعار الخاصة بهذا النشاط */}
                  {onOpenPriceList && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenPriceList(b);
                      }}
                      className="h-7 sm:h-8 bg-emerald-600/85 hover:bg-emerald-500 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3 rounded-full border border-emerald-300/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                      title={`قائمة الأسعار الخاصة بنشاط ${b.name}`}
                    >
                      <span>📋 {lang === 'ar' ? 'قائمة أسعار النشاط' : 'Activity Prices'}</span>
                    </button>
                  )}

                  {/* زر حجز العيادات والمستشفيات والعلاج الطبيعي والخدمات الطبية */}
                  {onOpenBooking &&
                    (b.cat.includes('أطباء') ||
                      b.cat.includes('عياد') ||
                      b.cat.includes('مستشف') ||
                      b.cat.includes('صيدلي') ||
                      b.cat.includes('علاج طبيعي') ||
                      b.cat.includes('رحلات وشاليهات') ||
                      b.cat.includes('شركات سياحة') ||
                      b.bookingEnabled) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenBooking(b);
                        }}
                        className="h-7 sm:h-8 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:brightness-110 active:scale-95 text-black text-[10px] sm:text-xs font-black px-3.5 rounded-full flex items-center gap-1.5 shadow-md transition-all cursor-pointer border border-white/60"
                        title="حجز العيادات والمستشفيات والمواعيد"
                      >
                        <span>
                          {b.cat.includes('أطباء') ||
                          b.cat.includes('عياد') ||
                          b.cat.includes('مستشف') ||
                          b.cat.includes('صيدلي') ||
                          b.cat.includes('علاج طبيعي')
                            ? '🏥 حجز العيادات والمستشفيات'
                            : b.bookingServiceTitle || '📅 حجز موعد وخدمة'}
                        </span>
                      </button>
                    )}

                  {/* زر رابط التتبع المباشر */}
                  {onOpenTransportModal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTransportModal(b);
                      }}
                      className="h-7 sm:h-8 bg-sky-600/85 hover:bg-sky-500 backdrop-blur-md text-white text-[10px] sm:text-xs font-black px-3 rounded-full border border-sky-300/50 flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                      title={lang === 'ar' ? 'رابط التتبع المباشر بالـ GPS' : 'Live GPS Tracking Link'}
                    >
                      <Navigation className="w-3 h-3 fill-white" />
                      <span>{lang === 'ar' ? 'رابط التتبع 🛰️' : 'Live Track 🛰️'}</span>
                    </button>
                  )}

                  {/* عرض التفاصيل */}
                  <button
                    onClick={() => onOpenBiz(b)}
                    className="h-7 sm:h-8 bg-black/65 hover:bg-black/85 backdrop-blur-md text-white text-[10px] sm:text-xs font-bold px-3.5 rounded-full border border-white/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span>{lang === 'ar' ? 'تفاصيل النشاط' : 'Details'}</span>
                    <ExternalLink className="w-3 h-3 text-amber-300" />
                  </button>

                  {/* تنبيه إخلاء المسؤولية المختصر عند الطلب */}
                  <span
                    onClick={() => onOpenBiz(b)}
                    className="h-7 sm:h-8 bg-amber-950/65 border border-amber-400/35 text-amber-200 text-[9px] sm:text-[10px] font-bold px-2.5 rounded-full flex items-center cursor-pointer backdrop-blur-sm"
                    title="المنصة وسيط إعلاني فقط • إخلاء مسؤولية عند الطلب"
                  >
                    {lang === 'ar' ? '⚠️ نحن مجرد إعلان • إخلاء مسؤولية' : '⚠️ Ad Platform Only • Disclaimer'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Chevrons for Quick Scroll Navigation - في منتصف اليسار بعيداً عن محتوى الأسفل */}
      <div className="flex flex-col gap-1 absolute left-1.5 top-1/2 -translate-y-1/2 z-30 pointer-events-auto">
        <button
          onClick={() => scrollToIndex(activeVideoIndex - 1)}
          disabled={activeVideoIndex === 0}
          className="w-6 h-6 rounded-full bg-black/55 hover:bg-black/85 disabled:opacity-25 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-md cursor-pointer active:scale-90"
          title="الإعلان السابق"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => scrollToIndex(activeVideoIndex + 1)}
          disabled={activeVideoIndex === businesses.length - 1}
          className="w-6 h-6 rounded-full bg-black/55 hover:bg-black/85 disabled:opacity-25 border border-white/20 text-white flex items-center justify-center backdrop-blur-md transition shadow-md cursor-pointer active:scale-90"
          title="الإعلان التالي"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Multi-phone numbers quick modal */}
      {phoneSelectorBiz && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/15 rounded-3xl p-5 w-full max-w-sm text-white shadow-2xl relative">
            <button
              onClick={() => setPhoneSelectorBiz(null)}
              className="absolute top-4 start-4 w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center"
            >
              ✕
            </button>
            <h4 className="font-black text-sm text-center mb-1">
              {phoneSelectorBiz.name}
            </h4>
            <p className="text-[11px] text-white/60 text-center mb-4">
              {t.contactNumbers}
            </p>
            <div className="space-y-2">
              {(phoneSelectorBiz.phones || [phoneSelectorBiz.phone]).map((ph, i) => (
                <div
                  key={i}
                  className="bg-white/5 border border-white/10 rounded-2xl p-2.5 flex items-center justify-between"
                >
                  <span className="font-bold text-xs tracking-wider dir-ltr">
                    {ph}
                  </span>
                  <div className="flex gap-1.5">
                    <a
                      href={`https://wa.me/${ph.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#25D366] text-white rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3 fill-white" />
                      <span>واتساب</span>
                    </a>
                    <a
                      href={`tel:${ph}`}
                      className="px-2.5 py-1 bg-white text-black rounded-lg text-xs font-bold flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>اتصال</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
