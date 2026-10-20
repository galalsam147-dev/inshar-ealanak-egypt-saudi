import React from 'react';
import { Home, Plus, Mic } from 'lucide-react';
import { SupportedLang } from '../types';
import { UI_TRANSLATIONS } from '../utils/uiI18n';

// أيقونة 4 نقط للإعدادات (بدون كلمات)
export const FourDotsNavIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-label="الإعدادات 4 نقط">
    <circle cx="7" cy="7" r="2.3" />
    <circle cx="17" cy="7" r="2.3" />
    <circle cx="7" cy="17" r="2.3" />
    <circle cx="17" cy="17" r="2.3" />
  </svg>
);

export type BottomNavTab = 'home' | 'favorites' | 'delivery' | 'profile' | 'settings' | 'add' | 'page3';

interface BottomNavProps {
  activeTab: BottomNavTab;
  onSelectTab: (tab: BottomNavTab) => void;
  lang: SupportedLang;
  favoritesCount?: number;
  onOpenAdd?: () => void;
  onOpenVoiceAssistant?: () => void;
  onOpenDelivery?: () => void;
  onOpenSettings?: () => void;
  onOpenSupervisory?: () => void;
  onOpenPage3?: () => void;
  onOpenGoogleMaps?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onOpenAdd,
  onOpenVoiceAssistant,
}) => {
  const tUi = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.ar;

  // Trigger sensitive mic feedback sound on touch
  const triggerSensitiveMic = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {}
    if (onOpenVoiceAssistant) {
      onOpenVoiceAssistant();
    }
  };

  return (
    <nav
      className="h-14 sm:h-15 bg-neutral-950 border-t-2 border-amber-400/40 grid grid-cols-3 items-center px-3 sm:px-6 py-1.5 z-50 shrink-0 select-none text-white w-full max-w-full shadow-[0_-6px_24px_rgba(0,0,0,0.95)]"
      dir="rtl"
    >
      {/* 1. على اليمين: انشر الآن (+) */}
      <div className="flex items-center justify-start">
        <button
          type="button"
          onClick={() => {
            if (onOpenAdd) onOpenAdd();
            else onSelectTab('add');
          }}
          className="h-9 sm:h-10 px-4 sm:px-6 rounded-full bg-gradient-to-r from-[#FF2D55] via-rose-500 to-amber-500 text-white flex items-center justify-center gap-1.5 shadow-lg shadow-[#FF2D55]/50 border border-white/60 active:scale-90 hover:brightness-110 transition-all cursor-pointer"
          title={lang === 'ar' ? 'انشر الآن (+)' : 'Publish Now (+)'}
        >
          <Plus className="w-4 h-4 sm:w-4.5 sm:h-4.5 stroke-[3] shrink-0" />
          <span className="text-xs sm:text-sm font-black whitespace-nowrap">
            {lang === 'ar' ? 'انشر الآن' : 'Publish Now'}
          </span>
        </button>
      </div>

      {/* 2. في المنتصف: شكل الميك فقط دون كتابة وتفعيله حساس */}
      <div className="flex items-center justify-center">
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            triggerSensitiveMic();
          }}
          onClick={(e) => {
            // Fallback for keyboard activation
            if (e.detail === 0) triggerSensitiveMic();
          }}
          className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-400 via-orange-400 to-amber-300 text-black flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.75)] border-2 border-white active:scale-90 hover:scale-105 transition-all cursor-pointer group"
          aria-label="Sensitive Voice Command Mic"
          title={lang === 'ar' ? 'أمر صوتي حساس' : 'Sensitive Voice Mic'}
        >
          <span className="absolute inset-0 rounded-full bg-amber-400/40 animate-ping pointer-events-none" />
          <Mic className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 text-black stroke-[2.75] group-hover:scale-110 transition" />
        </button>
      </div>

      {/* 3. على اليسار: الرئيسية / Home */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`h-9 sm:h-10 flex items-center gap-1.5 px-4 sm:px-6 rounded-full transition-all cursor-pointer active:scale-95 ${
            activeTab === 'home'
              ? 'bg-[#FF2D55] text-white border border-white/50 font-black shadow-md shadow-[#FF2D55]/30'
              : 'text-white hover:text-white bg-white/10 border border-white/20'
          }`}
          title={tUi.home}
        >
          <Home className="w-4 h-4 stroke-[2.5] shrink-0" />
          <span className="text-xs sm:text-sm font-black whitespace-nowrap">
            {lang === 'ar' ? 'الرئيسية' : 'Home'}
          </span>
        </button>
      </div>
    </nav>
  );
};


