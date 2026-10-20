import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Volume2, VolumeX, ChevronRight, ChevronLeft, 
  Sparkles, Maximize2, Minimize2, Edit3, Film 
} from 'lucide-react';
import { InteractivePromoPresentation, InteractiveSlide } from '../types';

interface InteractivePresentationPlayerProps {
  presentation: InteractivePromoPresentation;
  businessName?: string;
  onOpenBuilder?: () => void;
  isOwner?: boolean;
  className?: string;
}

export const InteractivePresentationPlayer: React.FC<InteractivePresentationPlayerProps> = ({
  presentation,
  businessName = '',
  onOpenBuilder,
  isOwner = false,
  className = '',
}) => {
  const slides = presentation.slides || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(presentation.autoPlay ?? true);
  const [isAudioMuted, setIsAudioMuted] = useState(true);
  const [progress, setProgress] = useState(0); // 0 to 100 for current slide

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSlide: InteractiveSlide | undefined = slides[currentIndex];
  const slideDurationMs = (currentSlide?.durationSec || presentation.slideDurationSec || 4) * 1000;

  // Handle slide progress and automatic transition
  useEffect(() => {
    if (!isPlaying || slides.length === 0) return;

    const intervalTime = 50; // update every 50ms for smooth progress bar
    const step = (intervalTime / slideDurationMs) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Advance to next slide
          setCurrentIndex((idx) => {
            if (idx + 1 < slides.length) {
              return idx + 1;
            } else if (presentation.loop) {
              return 0;
            } else {
              setIsPlaying(false);
              return idx;
            }
          });
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [currentIndex, isPlaying, slides.length, slideDurationMs, presentation.loop]);

  // Audio soundtrack handling
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying && !isAudioMuted && presentation.soundtrackUrl) {
      audioRef.current.play().catch(() => {});
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, isAudioMuted, presentation.soundtrackUrl]);

  if (slides.length === 0) {
    return null;
  }

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1 < slides.length ? prev + 1 : 0));
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : slides.length - 1));
  };

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsPlaying(!isPlaying);
  };

  const toggleAudio = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsAudioMuted(!isAudioMuted);
  };

  // Determine animation style class
  const getAnimationClass = (anim?: string) => {
    switch (anim) {
      case 'ken_burns':
        return 'animate-kenburns scale-110';
      case 'fade_zoom':
        return 'animate-pulse scale-105';
      case 'slide_left':
        return 'translate-x-1 transition-transform duration-1000';
      case 'neon_glow':
        return 'brightness-110 saturate-125';
      case 'bounce_in':
        return 'scale-100';
      default:
        return 'scale-105 transition-transform duration-1000';
    }
  };

  const textPositionClass = () => {
    switch (currentSlide?.textPosition) {
      case 'top':
        return 'justify-start pt-12';
      case 'center':
        return 'justify-center';
      case 'bottom':
      default:
        return 'justify-end pb-12';
    }
  };

  return (
    <div 
      className={`relative w-full h-full min-h-[300px] sm:min-h-[380px] bg-black overflow-hidden select-none group flex flex-col justify-between ${className}`}
      onClick={handleNext}
    >
      {/* Background Soundtrack Audio Element */}
      {presentation.soundtrackUrl && (
        <audio
          ref={audioRef}
          src={presentation.soundtrackUrl}
          loop
          muted={isAudioMuted}
          playsInline
        />
      )}

      {/* Slide Image with Ken Burns / Motion Effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img
          key={currentSlide?.id || currentIndex}
          src={currentSlide?.imageUrl}
          alt={currentSlide?.caption || businessName}
          className={`w-full h-full object-cover transition-all duration-700 ease-out ${getAnimationClass(currentSlide?.animation)}`}
        />
        {/* Dark Vignette Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/60" />
      </div>

      {/* TOP HEADER: Segmented Progress Bars & Controls */}
      <div className="relative z-20 p-3 sm:p-4 space-y-2.5 pointer-events-auto">
        {/* Segmented Story Progress Bar (Instagram / TikTok style) */}
        <div className="flex gap-1.5 w-full">
          {slides.map((slide, idx) => {
            let fillPct = 0;
            if (idx < currentIndex) fillPct = 100;
            else if (idx === currentIndex) fillPct = progress;

            return (
              <div
                key={slide.id || idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                  setProgress(0);
                }}
                className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden cursor-pointer"
              >
                <div
                  className="h-full bg-[#FF2D55] shadow-[0_0_8px_#FF2D55] transition-all duration-75"
                  style={{ width: `${fillPct}%` }}
                />
              </div>
            );
          })}
        </div>

        {/* Top Info Badges & Action Buttons */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className="bg-[#FF2D55] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg shadow-[#FF2D55]/40 animate-pulse">
              <Film className="w-3 h-3" />
              <span>{presentation.badgeText || 'فيديو ترويجي تفاعلي 🎬'}</span>
            </span>

            <span className="bg-black/60 backdrop-blur-md text-white/90 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 font-mono">
              {currentIndex + 1} / {slides.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Soundtrack Toggle */}
            {presentation.soundtrackUrl && (
              <button
                type="button"
                onClick={toggleAudio}
                className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
                title={isAudioMuted ? 'تشغيل الموسيقى' : 'كتم الموسيقى'}
              >
                {isAudioMuted ? <VolumeX className="w-3.5 h-3.5 text-white/70" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            )}

            {/* Play / Pause Toggle */}
            <button
              type="button"
              onClick={togglePlay}
              className="w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
            </button>

            {/* Owner Edit Button */}
            {isOwner && onOpenBuilder && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBuilder();
                }}
                className="bg-amber-400 hover:bg-amber-300 text-black text-[10px] font-black px-2 py-1 rounded-full flex items-center gap-1 shadow cursor-pointer transition"
                title="تعديل العرض التقديمي"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">تعديل العرض</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CENTER: Left & Right Navigation Tap Zones + Animated Text Content */}
      <div className={`relative z-20 flex-1 px-4 sm:px-6 flex flex-col ${textPositionClass()} pointer-events-none`}>
        {/* Animated Moving Text Card */}
        {currentSlide?.caption && (
          <div 
            className="max-w-lg mx-auto w-full text-center space-y-1.5 animate-in fade-in zoom-in-95 duration-500"
          >
            {/* Main Animated Headline */}
            <div 
              className="inline-block px-4 py-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl"
              style={{
                backgroundColor: currentSlide.bgColor || 'rgba(0, 0, 0, 0.75)',
                color: currentSlide.textColor || '#FFD700',
              }}
            >
              <h3 className="text-base sm:text-xl font-black tracking-wide drop-shadow-md">
                {currentSlide.caption}
              </h3>
            </div>

            {/* Optional Subcaption / Offer Details */}
            {currentSlide.subCaption && (
              <div>
                <span className="inline-block bg-white/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/10 shadow-lg">
                  {currentSlide.subCaption}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* BOTTOM FOOTER: Prev / Next buttons & Tap Hint */}
      <div className="relative z-20 p-3 sm:p-4 flex items-center justify-between text-xs text-white/70 pointer-events-auto">
        <button
          type="button"
          onClick={handlePrev}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
          title="الشريحة السابقة"
        >
          <ChevronRight className="w-4 h-4 rtl:rotate-0 rotate-180" />
        </button>

        <div className="text-[11px] font-bold text-white/60 bg-black/40 px-3 py-1 rounded-full border border-white/5">
          {presentation.title || businessName}
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-md border border-white/15 flex items-center justify-center text-white transition active:scale-90 cursor-pointer"
          title="الشريحة التالية"
        >
          <ChevronLeft className="w-4 h-4 rtl:rotate-0 rotate-180" />
        </button>
      </div>
    </div>
  );
};
