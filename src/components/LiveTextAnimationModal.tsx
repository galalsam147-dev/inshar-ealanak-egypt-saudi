import React, { useState } from 'react';
import { 
  X, Check, Play, Pause, Volume2, VolumeX, Sparkles, 
  Eye, Zap, Smartphone, Type, Palette, Gauge, Layout, Star
} from 'lucide-react';
import { TextAnimationType, TextFontStyle, TextBannerStyle, SupportedLang } from '../types';

export interface TextAnimationConfig {
  caption: string;
  animation: TextAnimationType;
  textColor: string;
  bgColor: string;
  speed: 'slow' | 'normal' | 'fast';
  position: 'top' | 'center' | 'bottom';
  fontSize: 'sm' | 'md' | 'lg';
  fontStyle?: TextFontStyle;
  bannerStyle?: TextBannerStyle;
}

interface LiveTextAnimationModalProps {
  videoSrc: string;
  businessName?: string;
  initialConfig?: Partial<TextAnimationConfig>;
  onApply: (config: TextAnimationConfig) => void;
  onClose: () => void;
  lang: SupportedLang;
}

export const ANIMATION_STYLES: {
  id: TextAnimationType;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  badge: string;
  badgeColor: string;
  class: string;
}[] = [
  {
    id: 'neon',
    titleAr: 'التحريك النيوني المشع',
    titleEn: 'Neon Pulse & Glow',
    descAr: 'يتوهج بألوان نيون فسفورية مع نبضات ضوئية وميضية تخطف الأبصار',
    descEn: 'Glowing neon pulsation with futuristic vibrant light aura',
    icon: '💡',
    badge: 'الأكثر طلباً 🔥',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
    class: 'anim-neon-glow',
  },
  {
    id: 'vibrate',
    titleAr: 'التذبذب والاهتزاز النابض',
    titleEn: 'Vibrate & Wiggle',
    descAr: 'يتذبذب ويهتز بحركات خاطفة تشد الانتباه الفوري للعروض الحصرية',
    descEn: 'High-energy wiggle & vibration to catch immediate eye focus',
    icon: '⚡',
    badge: 'حصري وعاجل ⚡',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    class: 'anim-vibrate',
  },
  {
    id: 'marquee',
    titleAr: 'شريط إخباري زاحف مستمر',
    titleEn: 'Marquee News Ticker',
    descAr: 'يزحف أفقياً عبر الشاشة بدون توقف مثل شريط القنوات الإخبارية',
    descEn: 'Infinite horizontal scrolling banner like breaking news tickers',
    icon: '🏃‍♂️',
    badge: 'شريط الأخبار 📰',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    class: 'anim-marquee',
  },
  {
    id: 'wave',
    titleAr: 'موجة انسيابية راقصة',
    titleEn: 'Smooth Floating Wave',
    descAr: 'يتموج للأعلى والأسفل بحركة ناعمة ساحرة ومريحة للعين',
    descEn: 'Gentle harmonic undulating wave floating up and down',
    icon: '🌊',
    badge: 'انسيابي ناعم 🌊',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    class: 'anim-wave-text',
  },
  {
    id: 'bounce',
    titleAr: 'قفز وارتداد حيوي',
    titleEn: 'Bouncing Impact',
    descAr: 'يقفز ويرتد بحيوية ومرح لجذب انتباه المشاهدين للخصومات',
    descEn: 'Dynamic playful bounces emphasizing discounts and deals',
    icon: '🏀',
    badge: 'حيوي ومرح 🎈',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    class: 'anim-bounce-text',
  },
  {
    id: 'shimmer',
    titleAr: 'بريق ووميض متلألئ',
    titleEn: 'Strobe Shimmer & Flash',
    descAr: 'يتلألأ ببريق ضوئي خاطف ومبهر يضيء شاشة الريل',
    descEn: 'Strobe flashes and radiant glow shimmering over the reel',
    icon: '✨',
    badge: 'بريق ماسي ✨',
    badgeColor: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    class: 'anim-shimmer',
  },
  {
    id: 'typewriter',
    titleAr: 'آلة كاتبة وظهور متتابع',
    titleEn: 'Typewriter Reveal',
    descAr: 'ظهور الحروف والكلمات بتتابع أنيق وجذاب ككتابة حية',
    descEn: 'Rhythmic typing text reveal with editorial pulse',
    icon: '✍️',
    badge: 'كتابة حية ✍️',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    class: 'anim-typewriter',
  },
  {
    id: 'pop',
    titleAr: 'نبض وتكبير عاجل',
    titleEn: 'Pop Pulse & Zoom',
    descAr: 'يتضخم ويتقلص كإعلان عاجل وجذاب للفت الانتباه الفوري',
    descEn: 'Rhythmic popping and scale pulse ideal for urgent announcements',
    icon: '💥',
    badge: 'تنبيه عاجل 💥',
    badgeColor: 'bg-red-500/20 text-red-300 border-red-500/30',
    class: 'anim-pop-text',
  },
  {
    id: 'slide',
    titleAr: 'انزلاق جانبي متكرر',
    titleEn: 'Lateral Slide',
    descAr: 'ينزلق يميناً ويساراً بسلاسة وتوازن فوق مشهد الفيديو',
    descEn: 'Smooth lateral gliding back and forth across the screen',
    icon: '↔️',
    badge: 'متوازن ومرن ↔️',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    class: 'anim-slide-text',
  },
  {
    id: 'flip3d',
    titleAr: 'دوران مجسم ثلاثي الأبعاد',
    titleEn: '3D Perspective Flip',
    descAr: 'حركة دوران مجسمة ثلاثية الأبعاد بأسلوب سينمائي مبهر',
    descEn: 'Cinematic 3D perspective rotation creating depth perception',
    icon: '🔄',
    badge: 'سينمائي 3D 🎬',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    class: 'anim-flip3d',
  },
];

export const FONT_STYLES: {
  id: TextFontStyle;
  labelAr: string;
  labelEn: string;
  descAr: string;
  class: string;
  badge: string;
}[] = [
  { id: 'kufi', labelAr: 'كوفي عصري', labelEn: 'Modern Kufi', descAr: 'هندسي حاد ومودرن', class: 'font-style-kufi', badge: 'عصري ✨' },
  { id: 'ruqah', labelAr: 'رقعة انسيابي', labelEn: 'Fluid Ruqah', descAr: 'فني وحركي مميز', class: 'font-style-ruqah', badge: 'فني 🖌️' },
  { id: 'bold_poster', labelAr: 'ملصق عريض', labelEn: 'Bold Poster', descAr: 'عريض قوي صارخ', class: 'font-style-bold_poster', badge: 'صارخ 🔥' },
  { id: 'neon_cyber', labelAr: 'نيون سايبر', labelEn: 'Cyberpunk Glow', descAr: 'رقمي بتوهج مستقبلي', class: 'font-style-neon_cyber', badge: 'مشع ⚡' },
  { id: 'typewriter', labelAr: 'آلة كاتبة', labelEn: 'Typewriter Classic', descAr: 'كلاسيكي صحفي', class: 'font-style-typewriter', badge: 'كلاسيك 📰' },
  { id: 'naskh', labelAr: 'نسخ واضح', labelEn: 'Clean Naskh', descAr: 'سهل القراءة وواضح جداً', class: 'font-style-naskh', badge: 'أصيل 📖' },
];

export const BANNER_STYLES: {
  id: TextBannerStyle;
  labelAr: string;
  labelEn: string;
  icon: string;
  class: string;
  badge: string;
}[] = [
  { id: 'neon_glow_box', labelAr: 'إطار نيون مضيء', labelEn: 'Neon Glow Box', icon: '💡', class: 'banner-neon_glow_box', badge: 'نيون 🌟' },
  { id: 'glass_dark', labelAr: 'زجاج داكن فاخر', labelEn: 'Dark Frosted Glass', icon: '🧊', class: 'banner-glass_dark', badge: 'فخم 🖤' },
  { id: 'glass_red', labelAr: 'أحمر إعلانك الرياضي', labelEn: 'Brand Red Gloss', icon: '🔴', class: 'banner-glass_red', badge: 'إعلانك 🚀' },
  { id: 'glass_gold', labelAr: 'ذهبي عنبري ملكي', labelEn: 'Royal Gold Glass', icon: '👑', class: 'banner-glass_gold', badge: 'VIP 👑' },
  { id: 'emerald_card', labelAr: 'زمردي أخضر', labelEn: 'Emerald Ribbon', icon: '🟢', class: 'banner-emerald_card', badge: 'مميز 💎' },
  { id: 'sticker_gradient', labelAr: 'ملصق متدرج شبابي', labelEn: 'Sunset Gradient', icon: '🎨', class: 'banner-sticker_gradient', badge: 'حيوي 🌈' },
  { id: 'badge_angled', labelAr: 'شارة مائلة حركية', labelEn: 'Dynamic Angled', icon: '📐', class: 'banner-badge_angled', badge: 'رياضي ⚡' },
  { id: 'transparent_outline', labelAr: 'شفاف بإطار منقط', labelEn: 'Outline Minimal', icon: '🔲', class: 'banner-transparent_outline', badge: 'ناعم 🪟' },
];

export const COLOR_PALETTE = [
  { id: '#00F0FF', labelAr: 'نيون سماوي', labelEn: 'Neon Cyan', bgClass: 'bg-[#00F0FF]' },
  { id: '#FFD700', labelAr: 'ذهبي ملكي', labelEn: 'Royal Gold', bgClass: 'bg-[#FFD700]' },
  { id: '#FF2D55', labelAr: 'أحمر تيك توك', labelEn: 'TikTok Red', bgClass: 'bg-[#FF2D55]' },
  { id: '#00FF66', labelAr: 'أخضر فاقع', labelEn: 'Neon Green', bgClass: 'bg-[#00FF66]' },
  { id: '#FFFFFF', labelAr: 'أبيض ناصع', labelEn: 'Pure White', bgClass: 'bg-[#FFFFFF]' },
  { id: '#E040FB', labelAr: 'بنفسجي متوهج', labelEn: 'Electric Purple', bgClass: 'bg-[#E040FB]' },
  { id: '#FF9900', labelAr: 'برتقالي شمسي', labelEn: 'Sunset Orange', bgClass: 'bg-[#FF9900]' },
];

const PRESET_CAPTIONS = [
  '🔥 خصم خاص 20% لعملاء إعلانك لفترة محدودة ⚡',
  '🌟 خدمة ممتازة بأعلى جودة وضمان معتمد 💯',
  '📞 اتصل بنا الآن للحجز والاستفسار الفوري 🚀',
  '🎉 عروض حصرية وتوصيل سريع ومتاح دائماً ✨',
];

export const LiveTextAnimationModal: React.FC<LiveTextAnimationModalProps> = ({
  videoSrc,
  businessName,
  initialConfig,
  onApply,
  onClose,
  lang,
}) => {
  const isAr = lang === 'ar';

  const [activeTab, setActiveTab] = useState<'motion' | 'fonts' | 'frames' | 'settings'>('motion');

  const [caption, setCaption] = useState<string>(
    initialConfig?.caption ||
    (isAr
      ? '🔥 خصم خاص 20% لعملاء إعلانك لفترة محدودة ⚡'
      : '🔥 Special 20% off for E3lanak clients for a limited time ⚡')
  );
  const [animation, setAnimation] = useState<TextAnimationType>(initialConfig?.animation || 'neon');
  const [fontStyle, setFontStyle] = useState<TextFontStyle>(initialConfig?.fontStyle || 'kufi');
  const [bannerStyle, setBannerStyle] = useState<TextBannerStyle>(initialConfig?.bannerStyle || 'neon_glow_box');
  const [textColor, setTextColor] = useState<string>(initialConfig?.textColor || '#00F0FF');
  const [bgColor, setBgColor] = useState<string>(initialConfig?.bgColor || 'rgba(0, 0, 0, 0.75)');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>(initialConfig?.speed || 'normal');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>(initialConfig?.position || 'bottom');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(initialConfig?.fontSize || 'md');

  // Video playback simulation controls
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  const selectedAnimObj = ANIMATION_STYLES.find((a) => a.id === animation) || ANIMATION_STYLES[0];
  const selectedFontObj = FONT_STYLES.find((f) => f.id === fontStyle) || FONT_STYLES[0];
  const selectedBannerObj = BANNER_STYLES.find((b) => b.id === bannerStyle) || BANNER_STYLES[0];

  const animClass = `${selectedAnimObj.class} speed-${speed}`;
  const fontClass = selectedFontObj.class;
  const bannerClass = selectedBannerObj.class;

  const fontSizeClass =
    fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm';

  const positionClass =
    position === 'top'
      ? 'top-14 inset-x-3'
      : position === 'center'
      ? 'top-1/2 -translate-y-1/2 inset-x-3'
      : 'bottom-20 inset-x-3';

  const handleConfirm = () => {
    onApply({
      caption,
      animation,
      fontStyle,
      bannerStyle,
      textColor,
      bgColor,
      speed,
      position,
      fontSize,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF2D55] to-amber-400 text-white flex items-center justify-center shadow-lg shadow-[#FF2D55]/30">
              <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {isAr ? 'معاينة حية وتجربة أنماط النصوص والريلز' : 'Live Text Animation & Styles Preview'}
                </h3>
                <span className="bg-[#FF2D55] text-white text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>{isAr ? 'حي مباشر' : 'Live Reel'}</span>
                </span>
              </div>
              <p className="text-xs text-white/60">
                {isAr
                  ? 'اختر وجرب أنماط الحركة، الخطوط التيبوغرافية، وقوالب الإطارات وشاهد التأثير المباشر على الهاتف قبل الاعتماد'
                  : 'Test motion styles, typography fonts & visual banner frames on reel before publishing'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Tabs: Motion | Fonts | Frames | Settings */}
        <div className="flex gap-1.5 mb-3.5 bg-white/5 p-1 rounded-2xl border border-white/10 shrink-0 overflow-x-auto hide-scroll">
          <button
            type="button"
            onClick={() => setActiveTab('motion')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'motion'
                ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>{isAr ? 'أنماط الحركة والتحريك (Motion)' : 'Motion Animations'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fonts')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'fonts'
                ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{isAr ? 'أنماط الخطوط (Typography)' : 'Font Styles'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('frames')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'frames'
                ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>{isAr ? 'قوالب الإطارات (Frames & Cards)' : 'Frame Templates'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shrink-0 ${
              activeTab === 'settings'
                ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow-lg'
                : 'text-white/70 hover:text-white hover:bg-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>{isAr ? 'الألوان والإعدادات (Styling)' : 'Colors & Styling'}</span>
          </button>
        </div>

        {/* Main 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 overflow-y-auto pr-1">
          {/* Controls Column (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-3.5">
            {/* Slogan / Caption Input */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-white flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isAr ? 'نص الإعلان أو الشعار المراد تحريكه:' : 'Text to Animate:'}</span>
                </label>
                <span className="text-[10px] text-white/50">{caption.length} / 120</span>
              </div>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={120}
                placeholder={isAr ? 'اكتب العرض أو التخفيض أو الشعار هنا...' : 'Enter your slogan or promo offer...'}
                className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-[#FF2D55] outline-none"
              />

              {/* Ready Presets */}
              <div className="flex gap-1.5 overflow-x-auto hide-scroll pt-0.5">
                {PRESET_CAPTIONS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCaption(preset)}
                    className="shrink-0 text-[10px] bg-white/5 hover:bg-white/15 text-white/80 hover:text-white px-2.5 py-1 rounded-full border border-white/10 transition"
                  >
                    {preset.split(' ')[0]} {preset.split(' ')[1]} {preset.split(' ')[2]}...
                  </button>
                ))}
              </div>
            </div>

            {/* TAB 1: MOTION ANIMATIONS */}
            {activeTab === 'motion' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'أشكال حركة وتأثيرات النص على الفيديو:' : 'Select Motion Animation:'}</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-bold">
                    {isAr ? selectedAnimObj.titleAr : selectedAnimObj.titleEn}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ANIMATION_STYLES.map((style) => {
                    const isSelected = animation === style.id;
                    return (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => setAnimation(style.id)}
                        className={`text-start p-2.5 rounded-2xl border transition relative flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-white/15 to-[#FF2D55]/20 border-[#FF2D55] ring-2 ring-[#FF2D55]/40 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-2xl shrink-0 mt-0.5">{style.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="text-xs font-black text-white truncate">
                              {isAr ? style.titleAr : style.titleEn}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold shrink-0 border ${style.badgeColor}`}>
                              {style.badge}
                            </span>
                          </div>
                          <p className="text-[10px] text-white/60 line-clamp-1 leading-snug">
                            {isAr ? style.descAr : style.descEn}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 end-2 w-4 h-4 rounded-full bg-[#FF2D55] text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: FONT & TYPOGRAPHY STYLES */}
            {activeTab === 'fonts' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white flex items-center gap-1.5">
                    <Type className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'أنماط الخطوط العربية والتايبوغرافي للنص:' : 'Font & Typography Styles:'}</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-bold">
                    {isAr ? selectedFontObj.labelAr : selectedFontObj.labelEn}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {FONT_STYLES.map((f) => {
                    const isSelected = fontStyle === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFontStyle(f.id)}
                        className={`text-start p-3 rounded-2xl border transition relative ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-500/20 to-[#FF2D55]/20 border-amber-400 ring-2 ring-amber-400/40 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-white">{isAr ? f.labelAr : f.labelEn}</span>
                          <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-md font-bold">
                            {f.badge}
                          </span>
                        </div>
                        <div className={`${f.class} text-sm text-amber-200/90 truncate py-1`}>
                          {caption || (isAr ? 'نموذج الخط العربي' : 'Sample Arabic Typography')}
                        </div>
                        <p className="text-[10px] text-white/50 mt-1">{f.descAr}</p>
                        {isSelected && (
                          <div className="absolute top-2 end-2 w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: FRAME TEMPLATES & CARDS */}
            {activeTab === 'frames' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-white flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'قوالب وإطارات شريط النص على الفيديو:' : 'Frame & Card Templates:'}</span>
                  </label>
                  <span className="text-[10px] text-amber-300 font-bold">
                    {isAr ? selectedBannerObj.labelAr : selectedBannerObj.labelEn}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {BANNER_STYLES.map((b) => {
                    const isSelected = bannerStyle === b.id;
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBannerStyle(b.id)}
                        className={`text-start p-3 rounded-2xl border transition relative flex items-center gap-2.5 ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-[#FF2D55]/20 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                            : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-xl shrink-0">{b.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-black text-white truncate">{isAr ? b.labelAr : b.labelEn}</span>
                            <span className="text-[9px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded-md font-bold">
                              {b.badge}
                            </span>
                          </div>
                          <div className={`mt-1.5 p-1 rounded-lg text-[10px] text-center truncate ${b.class}`}>
                            {caption || (isAr ? 'معاينة القالب' : 'Preview Frame')}
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 end-2 w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: COLORS & SPEED / POSITION SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-3.5">
                {/* Text Color */}
                <div>
                  <label className="text-[11px] font-bold text-white/90 flex items-center gap-1.5 mb-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-400" />
                    <span>{isAr ? 'لون إشعاع وتوهج الخط:' : 'Text Glow Color:'}</span>
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setTextColor(c.id)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition ${
                          textColor === c.id
                            ? 'border-white bg-white/20 text-white shadow-md'
                            : 'border-white/10 bg-black/40 text-white/70 hover:text-white'
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full ${c.bgClass} shadow-sm border border-black/40`} />
                        <span>{isAr ? c.labelAr : c.labelEn}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Speed, Position, Size Trio */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  {/* Speed */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1">
                      {isAr ? 'السرعة:' : 'Speed:'}
                    </label>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                      {(['slow', 'normal', 'fast'] as const).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSpeed(s)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition ${
                            speed === s ? 'bg-amber-400 text-black shadow' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {s === 'slow' ? (isAr ? 'بطيء' : 'Slow') : s === 'fast' ? (isAr ? 'سريع' : 'Fast') : (isAr ? 'معتدل' : 'Normal')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1">
                      {isAr ? 'الموضع:' : 'Position:'}
                    </label>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                      {(['top', 'center', 'bottom'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setPosition(p)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition ${
                            position === p ? 'bg-[#FF2D55] text-white shadow' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {p === 'top' ? (isAr ? 'أعلى' : 'Top') : p === 'center' ? (isAr ? 'وسط' : 'Mid') : (isAr ? 'أسفل' : 'Bottom')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div>
                    <label className="text-[10px] font-bold text-white/70 block mb-1">
                      {isAr ? 'حجم الخط:' : 'Size:'}
                    </label>
                    <div className="flex bg-black/40 p-0.5 rounded-lg border border-white/10">
                      {(['sm', 'md', 'lg'] as const).map((fs) => (
                        <button
                          key={fs}
                          type="button"
                          onClick={() => setFontSize(fs)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-md transition ${
                            fontSize === fs ? 'bg-white text-black shadow' : 'text-white/60 hover:text-white'
                          }`}
                        >
                          {fs === 'sm' ? (isAr ? 'صغير' : 'S') : fs === 'lg' ? (isAr ? 'كبير' : 'L') : (isAr ? 'وسط' : 'M')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Phone Mockup & Instant Preview (5 cols on lg) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-black/40 p-3 rounded-3xl border border-white/10">
            <div className="w-full flex items-center justify-between text-xs text-white/70 mb-2 px-1">
              <span className="font-bold flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>{isAr ? 'معاينة الريل في الهاتف' : 'Phone Reel Preview'}</span>
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white font-mono">
                9:16 Vertical
              </span>
            </div>

            {/* Phone Screen Frame */}
            <div className="relative w-full max-w-[270px] sm:max-w-[290px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-neutral-700 shadow-2xl bg-black flex flex-col justify-end text-white select-none">
              {/* Video Element */}
              <video
                src={videoSrc}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
              />

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />

              {/* Top Reel Header Indicator */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white border border-white/20">
                  {businessName || (isAr ? 'نشاطك التجاري' : 'Your Business')}
                </span>
                <span className="bg-[#FF2D55] text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow">
                  REEL
                </span>
              </div>

              {/* Media Controls */}
              <div className="absolute top-11 end-2.5 flex flex-col gap-1.5 z-20">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20 shadow hover:bg-black/80 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ms-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-7 h-7 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20 shadow hover:bg-black/80 transition"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* ======================================================== */}
              {/* THE LIVE ANIMATED TEXT OVERLAY (ACCORDING TO CONFIG) */}
              {/* ======================================================== */}
              <div className={`absolute z-30 pointer-events-none ${positionClass}`}>
                <div 
                  className={`px-3 py-1.5 overflow-hidden flex items-center justify-center text-center transition-all duration-300 ${bannerClass}`}
                >
                  <div
                    className={`${animClass} ${fontClass} ${fontSizeClass} font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]`}
                    style={{ color: textColor }}
                  >
                    {caption || (isAr ? 'نص إعلاني مميز متحرك' : 'Animated Promo Text')}
                  </div>
                </div>
              </div>

              {/* Bottom Simulation Info */}
              <div className="relative p-3 z-10 space-y-1 text-start">
                <h5 className="font-black text-xs text-white drop-shadow">
                  {businessName || (isAr ? 'اسم المتجر أو العيادة' : 'Business Name')}
                </h5>
                <p className="text-[10px] text-white/80 line-clamp-1">
                  {isAr ? 'عروض وخدمات حصرية للمتابعين' : 'Exclusive offers and services'}
                </p>
                <div className="pt-1 flex gap-1">
                  <span className="flex-1 bg-white text-black font-bold py-1 rounded-lg text-[9px] text-center shadow">
                    {isAr ? '📞 اتصال' : 'Call'}
                  </span>
                  <span className="flex-1 bg-[#25D366] text-black font-bold py-1 rounded-lg text-[9px] text-center shadow">
                    {isAr ? '💬 واتساب' : 'WhatsApp'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Live Switcher Pill */}
            <div className="mt-3 flex items-center gap-1 bg-black/50 border border-white/10 p-1 rounded-full flex-wrap justify-center">
              <span className="text-[9px] text-white/60 px-1">{isAr ? 'حركة سريعة:' : 'Quick:'}</span>
              {(['neon', 'vibrate', 'shimmer', 'typewriter', 'wave'] as const).map((aId) => (
                <button
                  key={aId}
                  type="button"
                  onClick={() => setAnimation(aId)}
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold transition ${
                    animation === aId ? 'bg-amber-400 text-black shadow' : 'text-white/70 hover:text-white bg-white/5'
                  }`}
                >
                  {aId === 'neon' ? 'نيون 💡' : aId === 'vibrate' ? 'تذبذب ⚡' : aId === 'shimmer' ? 'بريق ✨' : aId === 'typewriter' ? 'آلة ✍️' : 'موجة 🌊'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition"
          >
            {isAr ? 'إلغاء' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-[#FF2D55] via-amber-500 to-[#FF2D55] text-white font-black text-xs shadow-xl shadow-[#FF2D55]/30 hover:brightness-110 active:scale-98 transition flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>
              {isAr
                ? `اعتماد الأنماط ونشرها على الريل 🚀`
                : `Apply Styles & Publish on Reel 🚀`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
