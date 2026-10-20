import React, { useState } from 'react';
import { 
  X, CheckCircle, AlertTriangle, Play, Pause, Volume2, VolumeX, 
  MapPin, Phone, MessageCircle, Star, ShieldCheck, Sparkles, 
  ExternalLink, Layers, Smartphone, Eye, Check, Zap, Type, Layout, Palette, Music
} from 'lucide-react';
import { Business, SupportedLang, TextAnimationType, TextFontStyle, TextBannerStyle } from '../types';
import { scanTextModeration, auditBusinessContent } from '../utils/contentModeration';
import { I18N } from '../utils/translations';
import { ANIMATION_STYLES, FONT_STYLES, BANNER_STYLES, COLOR_PALETTE } from './LiveTextAnimationModal';

interface AdPreviewModalProps {
  business: Partial<Business>;
  onClose: () => void;
  onConfirmPublish: () => void;
  lang: SupportedLang;
}

export const AdPreviewModal: React.FC<AdPreviewModalProps> = ({
  business,
  onClose,
  onConfirmPublish,
  lang,
}) => {
  const t = I18N[lang];
  const [previewMode, setPreviewMode] = useState<'reel' | 'card'>('reel');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  // Active Sub-tab inside Reel Preview for style selection
  const [styleTab, setStyleTab] = useState<'motion' | 'fonts' | 'frames' | 'colors'>('motion');

  // Live text animation, font, and banner style states
  const [activeAnim, setActiveAnim] = useState<TextAnimationType>(
    business.overlayText?.animation || business.textAnimation || 'neon'
  );
  const [activeFont, setActiveFont] = useState<TextFontStyle>(
    business.overlayText?.fontStyle || 'kufi'
  );
  const [activeBanner, setActiveBanner] = useState<TextBannerStyle>(
    business.overlayText?.bannerStyle || 'neon_glow_box'
  );
  const [activeTextColor, setActiveTextColor] = useState<string>(
    business.overlayText?.textColor || '#00F0FF'
  );
  const [activeSpeed, setActiveSpeed] = useState<'slow' | 'normal' | 'fast'>(
    business.overlayText?.speed || 'normal'
  );
  const [activePosition, setActivePosition] = useState<'top' | 'center' | 'bottom'>(
    business.overlayText?.position || 'bottom'
  );
  const [activeCaption, setActiveCaption] = useState<string>(
    business.overlayText?.caption || business.bio || (lang === 'ar' ? '🔥 خصم خاص 20% لعملاء إعلانك لفترة محدودة ⚡' : 'Special offer for E3lanak clients')
  );
  const [hasSavedStyleFeedback, setHasSavedStyleFeedback] = useState(false);

  const selectedAnimObj = ANIMATION_STYLES.find((a) => a.id === activeAnim) || ANIMATION_STYLES[0];
  const selectedFontObj = FONT_STYLES.find((f) => f.id === activeFont) || FONT_STYLES[0];
  const selectedBannerObj = BANNER_STYLES.find((b) => b.id === activeBanner) || BANNER_STYLES[0];

  // Run full content moderation audit
  const auditResult = auditBusinessContent({
    name: business.name,
    bio: business.bio,
    addr: business.addr,
    cat: business.cat,
    services: business.services,
  });

  const videoSrc = business.videos?.[0] || 'https://assets.mixkit.co/videos/preview/mixkit-chef-garnishing-a-dish-in-a-kitchen-40810-large.mp4';
  const posterSrc = business.poster || business.images?.[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-neutral-950 border border-white/15 rounded-3xl shadow-2xl p-4 sm:p-6 overflow-hidden my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-400/30">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>معاينة الإعلان قبل عرضه الرسمي</span>
                <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
                  Live Preview
                </span>
              </h3>
              <p className="text-xs text-white/60">
                شاهد كيف سيظهر إعلانك للجمهور في الريلز ودليل البحث قبل اعتماده
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Moderation Safety Check Banner */}
        <div className="my-3">
          {!auditResult.isValid ? (
            <div className="bg-red-500/15 border-2 border-red-500/50 rounded-2xl p-3 sm:p-4 text-red-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="font-black text-sm text-red-400 flex items-center gap-1.5">
                    <span>تم إيقاف عرض الإعلان (محتوى مخالف لسياسة النشر)</span>
                  </div>
                  <p className="text-xs leading-relaxed text-red-200/90 font-medium">
                    {auditResult.errorMessage}
                  </p>
                  <div className="text-[11px] bg-black/40 border border-red-500/30 rounded-lg p-2 mt-2">
                    <span className="text-red-400 font-bold">الكلمات المخالفة المرصودة: </span>
                    <span className="text-white font-mono bg-red-950/80 px-2 py-0.5 rounded border border-red-500/40">
                      {auditResult.flaggedWords.join(', ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-emerald-300 flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div className="text-xs">
                <span className="font-bold text-white">فحص الأمان والنزاهة: </span>
                <span>النص سليم 100% وخالٍ من الشتائم والسياسة وأي ألفاظ نابية، والإعلان جاهز للنشر الفوري.</span>
              </div>
            </div>
          )}
        </div>

        {/* Video Compression Stats Banner if available */}
        {business.videoStats && (
          <div className="mb-3 bg-blue-500/10 border border-blue-500/30 rounded-2xl p-2.5 px-3 flex items-center justify-between text-xs text-blue-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
              <span>
                <b>فيديو مضغوط بجودة فائقة:</b> الحجم الأصلي {business.videoStats.originalSizeMb} MB ⬅️ المضغوط {business.videoStats.compressedSizeMb} MB
              </span>
            </div>
            <span className="bg-blue-500/30 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">
              توفير {business.videoStats.compressionRatio}% في التحميل
            </span>
          </div>
        )}

        {/* Toggle between Reel View and Card View */}
        <div className="flex items-center justify-center gap-2 mb-4 bg-white/5 p-1 rounded-2xl border border-white/10 max-w-xs mx-auto">
          <button
            type="button"
            onClick={() => setPreviewMode('reel')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              previewMode === 'reel' ? 'bg-amber-400 text-black shadow' : 'text-white/70 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>معاينة ريلز (Reel)</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewMode('card')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 ${
              previewMode === 'card' ? 'bg-amber-400 text-black shadow' : 'text-white/70 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>معاينة الدليل (Card)</span>
          </button>
        </div>

        {/* Interactive Text Animation, Font, Frame & Color Selector in Reel Preview */}
        {previewMode === 'reel' && (
          <div className="mb-3 bg-gradient-to-r from-purple-950/40 via-neutral-900 to-amber-950/30 border border-purple-500/30 rounded-2xl p-2.5 space-y-2">
            {/* Header with Sub-tabs */}
            <div className="flex items-center justify-between gap-1 flex-wrap pb-1 border-b border-white/10">
              <span className="font-black text-xs text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{lang === 'ar' ? 'تخصيص أنماط النص المتحرك على الريل:' : 'Reel Animated Text Styles:'}</span>
              </span>

              {/* Sub-tabs buttons */}
              <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setStyleTab('motion')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    styleTab === 'motion' ? 'bg-[#FF2D55] text-white shadow font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Zap className="w-2.5 h-2.5" />
                  <span>{lang === 'ar' ? 'الحركة ⚡' : 'Motion'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleTab('fonts')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    styleTab === 'fonts' ? 'bg-amber-400 text-black shadow font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Type className="w-2.5 h-2.5" />
                  <span>{lang === 'ar' ? 'الخطوط ✍️' : 'Fonts'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleTab('frames')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    styleTab === 'frames' ? 'bg-cyan-400 text-black shadow font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Layout className="w-2.5 h-2.5" />
                  <span>{lang === 'ar' ? 'القوالب 🎨' : 'Frames'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setStyleTab('colors')}
                  className={`text-[10px] px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 ${
                    styleTab === 'colors' ? 'bg-emerald-400 text-black shadow font-black' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Palette className="w-2.5 h-2.5" />
                  <span>{lang === 'ar' ? 'الألوان 🌈' : 'Colors'}</span>
                </button>
              </div>
            </div>

            {/* TAB 1: MOTION SELECTION */}
            {styleTab === 'motion' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>{lang === 'ar' ? 'اختر شكل ونمط حركة النص:' : 'Pick Motion Style:'}</span>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.2 rounded-full border border-amber-400/20">
                    {selectedAnimObj.titleAr}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto hide-scroll py-0.5">
                  {ANIMATION_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setActiveAnim(style.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 ${
                        activeAnim === style.id
                          ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white border-transparent shadow font-black scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-white/75 border-white/10'
                      }`}
                    >
                      <span>{style.icon}</span>
                      <span>{lang === 'ar' ? style.titleAr.split(' ')[0] : style.titleEn.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: FONTS SELECTION */}
            {styleTab === 'fonts' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>{lang === 'ar' ? 'اختر نمط الخط والتايبوغرافي:' : 'Pick Font Style:'}</span>
                  <span className="text-[10px] text-amber-300 font-bold bg-amber-400/10 px-2 py-0.2 rounded-full border border-amber-400/20">
                    {selectedFontObj.labelAr}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto hide-scroll py-0.5">
                  {FONT_STYLES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFont(f.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1 ${
                        activeFont === f.id
                          ? 'bg-gradient-to-r from-amber-500 to-[#FF2D55] text-white border-transparent shadow font-black scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-white/75 border-white/10'
                      }`}
                    >
                      <span className={f.class}>{f.labelAr}</span>
                      <span className="text-[9px] opacity-70">({f.badge})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FRAMES SELECTION */}
            {styleTab === 'frames' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-white/70">
                  <span>{lang === 'ar' ? 'اختر قالب الإطار والخلفية:' : 'Pick Frame Template:'}</span>
                  <span className="text-[10px] text-cyan-300 font-bold bg-cyan-400/10 px-2 py-0.2 rounded-full border border-cyan-400/20">
                    {selectedBannerObj.labelAr}
                  </span>
                </div>
                <div className="flex gap-1.5 overflow-x-auto hide-scroll py-0.5">
                  {BANNER_STYLES.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setActiveBanner(b.id)}
                      className={`shrink-0 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition flex items-center gap-1.5 ${
                        activeBanner === b.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-transparent shadow font-black scale-102'
                          : 'bg-white/5 hover:bg-white/10 text-white/75 border-white/10'
                      }`}
                    >
                      <span>{b.icon}</span>
                      <span>{b.labelAr}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: COLORS & POSITION */}
            {styleTab === 'colors' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  {/* Colors */}
                  <div className="flex items-center gap-1.5 overflow-x-auto hide-scroll">
                    <span className="text-[10px] text-white/60 shrink-0">{lang === 'ar' ? 'اللون:' : 'Color:'}</span>
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveTextColor(c.id)}
                        className={`w-5 h-5 rounded-full ${c.bgClass} border transition ${
                          activeTextColor === c.id ? 'scale-125 border-white ring-2 ring-white/50 shadow' : 'border-black/50 opacity-80'
                        }`}
                        title={c.labelAr}
                      />
                    ))}
                  </div>

                  {/* Position */}
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                    {(['top', 'center', 'bottom'] as const).map((pos) => (
                      <button
                        key={pos}
                        type="button"
                        onClick={() => setActivePosition(pos)}
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition ${
                          activePosition === pos ? 'bg-[#FF2D55] text-white font-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {pos === 'top' ? (lang === 'ar' ? 'أعلى' : 'Top') : pos === 'center' ? (lang === 'ar' ? 'وسط' : 'Mid') : (lang === 'ar' ? 'أسفل' : 'Bottom')}
                      </button>
                    ))}
                  </div>

                  {/* Speed */}
                  <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-white/10">
                    {(['slow', 'normal', 'fast'] as const).map((spd) => (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setActiveSpeed(spd)}
                        className={`text-[9px] px-2 py-0.5 rounded-md font-bold transition ${
                          activeSpeed === spd ? 'bg-amber-400 text-black font-black' : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {spd === 'slow' ? (lang === 'ar' ? 'بطيء' : 'Slow') : spd === 'fast' ? (lang === 'ar' ? 'سريع' : 'Fast') : (lang === 'ar' ? 'عادي' : 'Normal')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PREVIEW CONTAINER */}
        <div className="flex justify-center bg-black/60 rounded-2xl p-3 border border-white/5">
          {previewMode === 'reel' ? (
            /* Reel Mobile Phone Simulation */
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-neutral-800 shadow-2xl bg-black flex flex-col justify-end text-white">
              {/* Simulated Video Player */}
              <video
                src={videoSrc}
                poster={posterSrc}
                className="absolute inset-0 w-full h-full object-cover"
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                playsInline
              />

              {/* Gradient dark overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none" />

              {/* Top Reel header info */}
              <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400 border border-amber-400/30">
                  {business.cat || 'مطاعم'}
                </span>
                {business.isSponsored && (
                  <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-[9px] px-2 py-0.5 rounded-full shadow">
                    Google Ads ممول 🔥
                  </span>
                )}
              </div>

              {/* Media Controls Overlay */}
              <div className="absolute top-12 end-3 flex flex-col gap-2 z-10">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ms-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur text-white flex items-center justify-center border border-white/20"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              {/* Floating Animated Text Overlay with Live Styling */}
              <div
                className={`absolute z-30 pointer-events-none inset-x-3 ${
                  activePosition === 'top'
                    ? 'top-14'
                    : activePosition === 'center'
                    ? 'top-1/2 -translate-y-1/2'
                    : 'bottom-28'
                }`}
              >
                <div
                  className={`px-3 py-1.5 overflow-hidden flex items-center justify-center text-center mx-auto transition-all duration-300 ${selectedBannerObj.class}`}
                  style={{ maxWidth: '92%' }}
                >
                  <div
                    className={`${selectedAnimObj.class} ${selectedFontObj.class} speed-${activeSpeed} text-xs font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] tracking-wide`}
                    style={{ color: activeTextColor }}
                  >
                    {activeCaption}
                  </div>
                </div>
              </div>

              {/* Reel Bottom Content */}
              <div className="relative p-3.5 z-10 space-y-2 text-start">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="font-black text-sm text-white drop-shadow">
                    {business.name || 'اسم النشاط التجاري'}
                  </h4>
                  {business.verified ? (
                    <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold">
                      <ShieldCheck className="w-2.5 h-2.5" /> موثق
                    </span>
                  ) : null}
                </div>

                <p className="text-[11px] text-white/90 line-clamp-2 leading-snug drop-shadow">
                  {business.bio || 'أفضل الخدمات بأعلى جودة وعروض حصرية لجميع العملاء.'}
                </p>

                <div className="flex items-center gap-2 text-[10px] text-white/80">
                  <MapPin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{business.addr || business.city || 'القاهرة'}</span>
                </div>

                {/* Soundtrack Indicator in Preview */}
                {business.soundtrack && (
                  <div className="flex items-center gap-1.5 bg-black/60 border border-amber-400/40 px-2 py-0.5 rounded-full text-[9px] text-amber-300 w-fit">
                    <Music className="w-2.5 h-2.5 animate-spin" />
                    <span className="max-w-[170px] truncate">
                      {business.soundtrack.mutedByAdmin ? 'صوت مكتوم إدارياً 🔇' : `${business.soundtrack.title} • ${business.soundtrack.artist || ''}`}
                    </span>
                    {business.soundtrack.isMuted || business.soundtrack.mutedByAdmin ? (
                      <VolumeX className="w-2.5 h-2.5 text-red-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                )}

                {/* Reel Action Buttons */}
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <a
                    href={`tel:${business.phone || '01006656669'}`}
                    onClick={(e) => e.preventDefault()}
                    className="bg-white text-black font-bold py-1.5 px-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow"
                  >
                    <Phone className="w-3 h-3 text-emerald-600" />
                    <span>اتصال</span>
                  </a>
                  <a
                    href={`https://wa.me/2${business.phone || '01006656669'}`}
                    onClick={(e) => e.preventDefault()}
                    className="bg-[#25D366] text-black font-bold py-1.5 px-2 rounded-xl text-[10px] flex items-center justify-center gap-1 shadow"
                  >
                    <MessageCircle className="w-3 h-3 text-black" />
                    <span>واتساب</span>
                  </a>
                </div>
              </div>
            </div>
          ) : (
            /* Card View Simulation */
            <div className="w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden text-white shadow-xl">
              <div className="relative h-44 bg-neutral-800">
                <img
                  src={posterSrc || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                  alt={business.name || 'معاينة'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 start-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-amber-400">
                  {business.cat || 'مطاعم'}
                </div>
                <div className="absolute bottom-2.5 end-2.5 bg-black/80 backdrop-blur px-2 py-0.5 rounded-md text-[10px] text-amber-300 flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>4.9 (120 تقييم)</span>
                </div>
              </div>

              <div className="p-4 space-y-2 text-start">
                <div className="flex items-center justify-between">
                  <h4 className="font-black text-base text-white">
                    {business.name || 'اسم النشاط التجاري'}
                  </h4>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-bold">
                    مفتوح الآن
                  </span>
                </div>

                <p className="text-xs text-white/70 line-clamp-2">
                  {business.bio || 'وصف النشاط التجاري وقائمة الخدمات والعروض المميزة.'}
                </p>

                <div className="flex items-center gap-1.5 text-xs text-white/60">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{business.addr || business.city || 'القاهرة'}</span>
                </div>

                {/* Additional phones pill preview */}
                {business.phones && business.phones.length > 1 && (
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-white/60 flex-wrap">
                    <span className="font-bold text-white/80">أرقام التواصل:</span>
                    {business.phones.map((p, idx) => (
                      <span key={idx} className="bg-white/5 px-2 py-0.5 rounded border border-white/10 font-mono text-[10px]">
                        {p}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-5 pt-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition order-2 sm:order-1 cursor-pointer"
          >
            رجوع لتعديل البيانات
          </button>

          <button
            type="button"
            onClick={() => {
              business.textAnimation = activeAnim;
              business.overlayText = {
                caption: activeCaption,
                animation: activeAnim,
                fontStyle: activeFont,
                bannerStyle: activeBanner,
                textColor: activeTextColor,
                bgColor: business.overlayText?.bgColor || 'rgba(0, 0, 0, 0.75)',
                speed: activeSpeed,
                position: activePosition,
                fontSize: business.overlayText?.fontSize || 'md',
              };
              onConfirmPublish();
            }}
            disabled={!auditResult.isValid}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 order-1 sm:order-2 ${
              auditResult.isValid
                ? 'bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20 cursor-pointer'
                : 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-60'
            }`}
          >
            {auditResult.isValid ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>تأكيد ونشر الإعلان الآن 🚀</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4" />
                <span>النشر موقوف (يرجى إزالة المخالفات)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
