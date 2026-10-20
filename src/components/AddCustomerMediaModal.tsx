import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Video, Image as ImageIcon, Sparkles, 
  Check, Eye, Type, Palette, 
  Layers, Loader2, Gauge, Maximize2, MapPin, Music, Volume2, VolumeX
} from 'lucide-react';
import { Business, CustomerMediaPost, TextAnimationType, SupportedLang, BusinessSoundtrack } from '../types';
import { compressImageFile } from '../utils/mediaCompressor';
import { compressVideoFile } from '../utils/videoCompressor';
import { SoundtrackSelector } from './SoundtrackSelector';
import { SOUNDTRACK_LIBRARY } from '../utils/soundtracks';

interface AddCustomerMediaModalProps {
  business?: Business | null;
  businesses?: Business[];
  onClose: () => void;
  onAddPost: (post: CustomerMediaPost, targetBusinessId?: string | number) => void;
  lang: SupportedLang;
}

const ANIMATION_OPTIONS: { id: TextAnimationType; label: string; icon: string; desc: string; class: string }[] = [
  { id: 'marquee', label: 'شريط إخباري متحرك مستمر (Marquee)', icon: '🏃‍♂️', desc: 'يزحف أفقياً عبر الشاشة بدون توقف مثل شريط الأخبار والريلز', class: 'anim-marquee' },
  { id: 'neon', label: 'توهج ووميض نيون مشع (Neon Glow)', icon: '💡', desc: 'يتوهج بألوان النيون المشعة مع نبضات ضوئية أنيقة', class: 'anim-neon-glow' },
  { id: 'vibrate', label: 'التذبذب والاهتزاز النابض (Vibrate)', icon: '⚡', desc: 'يتذبذب ويهتز بحيوية ولفت انتباه سريع وخاطف للأنظار', class: 'anim-vibrate' },
  { id: 'wave', label: 'موجة انسيابية راقصة (Wave)', icon: '🌊', desc: 'يتموج للأعلى والأسفل بحركة ناعمة جاذبة للأنظار', class: 'anim-wave-text' },
  { id: 'bounce', label: 'قفز واهتزاز نابض (Bounce)', icon: '🏀', desc: 'يقفز ويهتز بحيوية لجذب انتباه المشاهدين فوراً', class: 'anim-bounce-text' },
  { id: 'slide', label: 'انزلاق جانبي متكرر (Slide)', icon: '↔️', desc: 'ينزلق يميناً ويساراً بسلاسة فوق الفيديو أو الصورة', class: 'anim-slide-text' },
  { id: 'pop', label: 'نبض وتكبير عاجل (Pop Pulse)', icon: '💥', desc: 'يتضخم ويتقلص كإعلان حصري وتنبيه هام', class: 'anim-pop-text' },
  { id: 'flip3d', label: 'تموج وانعكاس 3D (Flip 3D)', icon: '🔄', desc: 'حركة دوران مجسمة ثلاثية الأبعاد ثلاثية الأبعاد', class: 'anim-flip3d' },
];

const COLOR_OPTIONS = [
  { id: '#FFD700', label: 'ذهبي ملكي', bg: 'bg-yellow-400' },
  { id: '#FFFFFF', label: 'أبيض ناصع', bg: 'bg-white' },
  { id: '#FF2D55', label: 'أحمر تيك توك', bg: 'bg-[#FF2D55]' },
  { id: '#00E5FF', label: 'سماوي نيون', bg: 'bg-cyan-400' },
  { id: '#00FF66', label: 'أخضر فاقع', bg: 'bg-emerald-400' },
  { id: '#FF9900', label: 'برتقالي مشع', bg: 'bg-orange-500' },
  { id: '#E040FB', label: 'بنفسجي متوهج', bg: 'bg-purple-500' },
];

const BG_OPTIONS = [
  { id: 'rgba(0, 0, 0, 0.75)', label: 'شريط زجاجي داكن' },
  { id: 'rgba(255, 45, 85, 0.85)', label: 'أحمر إعلانك المميز' },
  { id: 'rgba(16, 185, 129, 0.85)', label: 'أخضر زمردي' },
  { id: 'rgba(180, 83, 9, 0.85)', label: 'ذهبي عنبري' },
  { id: 'rgba(0, 0, 0, 0)', label: 'شفاف بدون خلفية' },
];

export const AddCustomerMediaModal: React.FC<AddCustomerMediaModalProps> = ({
  business,
  businesses = [],
  onClose,
  onAddPost,
  lang,
}) => {
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'content' | 'soundtrack'>('content');

  const [selectedBizId, setSelectedBizId] = useState<string | number>(
    business?.id || (businesses[0]?.id ?? 1)
  );

  const activeBusiness = business || businesses.find((b) => b.id === selectedBizId) || businesses[0];

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [caption, setCaption] = useState('أجمل تجربة وخدمة خمس نجوم! خصم خاص للمتابعين 🔥🌟');
  const [animationType, setAnimationType] = useState<TextAnimationType>('marquee');
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [textColor, setTextColor] = useState('#FFD700');
  const [textBgColor, setTextBgColor] = useState('rgba(0, 0, 0, 0.75)');
  const [position, setPosition] = useState<'top' | 'center' | 'bottom'>('bottom');

  // Media state
  const [mediaType, setMediaType] = useState<'video' | 'image'>('video');
  const [mediaUrl, setMediaUrl] = useState<string>(
    activeBusiness?.videos?.[0] || 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-glass-of-drink-over-a-table-42790-large.mp4'
  );
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressProgress, setCompressProgress] = useState(0);
  const [compressionRatio, setCompressionRatio] = useState<number | null>(null);

  // Soundtrack & Audio State (موسيقى تصويرية مقترحة أو رابط خارجي مع خيار الكتم)
  const [soundtrack, setSoundtrack] = useState<BusinessSoundtrack>({
    trackId: SOUNDTRACK_LIBRARY[0].id,
    title: SOUNDTRACK_LIBRARY[0].title,
    artist: SOUNDTRACK_LIBRARY[0].artist,
    url: SOUNDTRACK_LIBRARY[0].url,
    isMuted: false,
    volume: 0.7,
  });

  const [directUrlInput, setDirectUrlInput] = useState('');
  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  // Preview Audio Ref
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const [previewSoundtrackPlaying, setPreviewSoundtrackPlaying] = useState<boolean>(true);

  // Handle preview audio playback
  useEffect(() => {
    if (soundtrack?.url && !soundtrack.isMuted && !soundtrack.mutedByAdmin && previewSoundtrackPlaying) {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(soundtrack.url);
      } else {
        previewAudioRef.current.src = soundtrack.url;
      }
      previewAudioRef.current.loop = true;
      previewAudioRef.current.volume = soundtrack.volume ?? 0.7;
      previewAudioRef.current.play().catch(() => {});
    } else {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    }

    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
      }
    };
  }, [soundtrack, previewSoundtrackPlaying]);

  // File Upload Handlers with Automatic Client Compression
  const handleImageUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressing(true);
    try {
      const res = await compressImageFile(file, 1280, 1280, 0.8);
      setMediaUrl(res.url);
      setMediaType('image');
      setCompressionRatio(res.compressionRatio);
    } catch {
      const raw = URL.createObjectURL(file);
      setMediaUrl(raw);
      setMediaType('image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleVideoUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setIsCompressing(true);
    setCompressProgress(15);
    try {
      const res = await compressVideoFile(file, (p) => setCompressProgress(p));
      setMediaUrl(res.compressedUrl);
      setMediaType('video');
      setCompressionRatio(res.compressionRatio);
    } catch {
      const raw = URL.createObjectURL(file);
      setMediaUrl(raw);
      setMediaType('video');
    } finally {
      setIsCompressing(false);
      setCompressProgress(0);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl) return;

    const targetBiz = activeBusiness;

    const newPost: CustomerMediaPost = {
      id: 'cp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      businessId: targetBiz ? targetBiz.id : selectedBizId,
      businessName: targetBiz?.name,
      userName: userName.trim() || (isAr ? 'عميل إعلانك المميز' : 'E3lanak User'),
      userPhone: userPhone.trim() || undefined,
      type: mediaType,
      url: mediaUrl,
      caption: caption.trim() || (isAr ? 'تجربة رائعة تستحق المشاركة!' : 'Great experience!'),
      textAnimation: animationType,
      speed,
      fontSize,
      textColor,
      bgColor: textBgColor,
      position,
      createdAt: Date.now(),
      likes: 1,
      soundtrack: soundtrack,
    };

    onAddPost(newPost, targetBiz ? targetBiz.id : selectedBizId);
    onClose();
  };

  const currentAnimClass = ANIMATION_OPTIONS.find((a) => a.id === animationType)?.class || 'anim-marquee';
  const speedClass = speed === 'slow' ? 'speed-slow' : speed === 'fast' ? 'speed-fast' : 'speed-normal';
  const fontClass = fontSize === 'sm' ? 'text-xs' : fontSize === 'lg' ? 'text-base sm:text-lg' : 'text-sm';

  return (
    <div className="fixed inset-0 z-[85] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#121217] border border-white/15 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200"
        dir="rtl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FF2D55] via-purple-600 to-amber-500 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-10 h-10 rounded-2xl bg-black/30 backdrop-blur-md border border-white/20 flex items-center justify-center text-xl">
              🎥✨
            </span>
            <div>
              <h3 className="font-black text-base sm:text-lg">
                تحميل فيديوهات وصور العملاء مع كتابة متحركة وموسيقى
              </h3>
              <p className="text-xs text-white/90">
                انشر فيديوهاتك وتجاربك الحية مع شريط إخباري أو نصوص متحركة وموسيقى تصويرية لجذب آلاف المشاهدين
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[78vh] overflow-y-auto hide-scroll text-xs">
          {/* Left Column: Form & Animation / Soundtrack Tabs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Target Business Selection (If not preselected) */}
            {businesses.length > 0 && (
              <div className="space-y-1 bg-white/5 border border-white/10 rounded-2xl p-3">
                <label className="text-white/90 font-bold block flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#FF2D55]" />
                  <span>المكان أو النشاط التجاري المراد إضافة الفيديو له:</span>
                </label>
                <select
                  value={selectedBizId}
                  onChange={(e) => setSelectedBizId(e.target.value)}
                  className="w-full bg-[#1b1b22] border border-white/15 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-[#FF2D55] cursor-pointer"
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city} - {b.cat})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-white/80 font-bold block">اسمك أو اسم صاحب الفيديو</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="مثال: م. أحمد سامي / زائر محلي"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-[#FF2D55]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/80 font-bold block">رقم الهاتف (اختياري للتواصل)</label>
                <input
                  type="text"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  placeholder="01006656669"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-[#FF2D55]"
                />
              </div>
            </div>

            {/* Media Upload Buttons with Compression */}
            <div className="space-y-2 bg-white/5 border border-white/10 rounded-2xl p-3">
              <label className="text-white/90 font-bold block flex items-center gap-1.5">
                <Video className="w-4 h-4 text-[#FF2D55]" />
                <span>تحميل الفيديو أو الصورة من جهازك:</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => vidInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold p-3 rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Video className="w-4 h-4 text-[#FF2D55]" />
                  <span>🎥 رفع فيديو ريلز</span>
                </button>

                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold p-3 rounded-xl border border-white/15 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>📸 رفع صورة</span>
                </button>
              </div>

              <input
                ref={vidInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => handleVideoUpload(e.target.files)}
              />
              <input
                ref={imgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files)}
              />

              {/* Compression feedback */}
              {isCompressing && (
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 p-2.5 rounded-xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>جاري ضغط الملف وتحسين الجودة للموبايل والويب... {compressProgress > 0 && `${compressProgress}%`}</span>
                </div>
              )}

              {compressionRatio && !isCompressing && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 p-2 rounded-xl flex items-center justify-between">
                  <span>✅ تم ضغط وتجهيز الملف بنجاح فائق</span>
                  <span className="font-bold text-[10px] bg-emerald-500/30 px-2 py-0.5 rounded-full">
                    توفير {compressionRatio}% مساحة
                  </span>
                </div>
              )}

              {/* Direct URL input */}
              <div className="pt-1 flex gap-1.5">
                <input
                  type="url"
                  value={directUrlInput}
                  onChange={(e) => setDirectUrlInput(e.target.value)}
                  placeholder="أو ضع رابط فيديو MP4 أو صورة مباشر..."
                  className="flex-1 bg-white/10 border border-white/10 rounded-xl px-2.5 py-1.5 text-[11px] text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (directUrlInput.trim()) {
                      setMediaUrl(directUrlInput.trim());
                      setMediaType(directUrlInput.includes('.mp4') || directUrlInput.includes('.webm') ? 'video' : 'image');
                      setDirectUrlInput('');
                    }
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-xl font-bold cursor-pointer"
                >
                  استخدام
                </button>
              </div>
            </div>

            {/* TAB SELECTOR: (النصوص المتحركة 📝 vs الموسيقى التصويرية 🎵) */}
            <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('content')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                  activeTab === 'content'
                    ? 'bg-gradient-to-r from-purple-600 to-[#FF2D55] text-white shadow-lg font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Type className="w-3.5 h-3.5" />
                <span>تحريك النصوص والعبارات ✍️</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('soundtrack')}
                className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition relative ${
                  activeTab === 'soundtrack'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg font-black'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>الموسيقى التصويرية والصوت 🎵</span>
                {soundtrack.url && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute top-1.5 end-2 animate-pulse" />
                )}
              </button>
            </div>

            {/* TAB 1: TEXT ANIMATION & STYLES */}
            {activeTab === 'content' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Caption Text Input (الكتابة على الفيديو) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-white/90 font-bold flex items-center gap-1.5">
                      <Type className="w-4 h-4 text-amber-400" />
                      <span>اكتب النص أو العبارة الإعلانية على الفيديو/الصورة *</span>
                    </label>
                    <span className="text-[10px] text-amber-400 font-bold">هذا النص سيتحرك مباشرة! 🎬</span>
                  </div>
                  <textarea
                    rows={2}
                    required
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="اكتب تعليقك، عروضك، أو تقييمك (مثال: أحسن مطعم في مصر! أكل يجنن وخدمة ملكية خصم 20% بكود إعلانك 🔥)"
                    className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-[#FF2D55] resize-none"
                  />
                </div>

                {/* Animation Style Selector (جعل الكتابة تتحرك) */}
                <div className="space-y-2">
                  <label className="text-white/90 font-bold block flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <span>نوع وشكل حركة الكتابة (اجعل الكتابة تتحرك):</span>
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ANIMATION_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnimationType(opt.id)}
                        className={`p-2.5 rounded-xl text-start border transition flex items-start gap-2 cursor-pointer ${
                          animationType === opt.id
                            ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                            : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                        }`}
                      >
                        <span className="text-lg shrink-0">{opt.icon}</span>
                        <div>
                          <div className="font-black text-xs text-white">{opt.label}</div>
                          <div className="text-[10px] opacity-75 line-clamp-1">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Movement Speed & Font Size */}
                <div className="grid grid-cols-2 gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  {/* Speed */}
                  <div className="space-y-1">
                    <label className="text-white/80 font-bold text-[11px] flex items-center gap-1">
                      <Gauge className="w-3.5 h-3.5 text-amber-400" />
                      <span>سرعة حركة النص:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'slow', label: 'بطيء 🐢' },
                        { id: 'normal', label: 'عادي 🚶' },
                        { id: 'fast', label: 'سريع ⚡' },
                      ].map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSpeed(s.id as 'slow' | 'normal' | 'fast')}
                          className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            speed === s.id
                              ? 'bg-amber-500 text-black border-amber-400'
                              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font Size */}
                  <div className="space-y-1">
                    <label className="text-white/80 font-bold text-[11px] flex items-center gap-1">
                      <Maximize2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>حجم خط النص:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'sm', label: 'صغير' },
                        { id: 'md', label: 'متوسط' },
                        { id: 'lg', label: 'عريض' },
                      ].map((sz) => (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => setFontSize(sz.id as 'sm' | 'md' | 'lg')}
                          className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            fontSize === sz.id
                              ? 'bg-emerald-500 text-black border-emerald-400'
                              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {sz.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Colors, Background & Positioning */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white/5 border border-white/10 rounded-2xl p-3">
                  {/* Text Color */}
                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold text-[11px] flex items-center gap-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>لون الخط:</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setTextColor(c.id)}
                          className={`w-6 h-6 rounded-full ${c.bg} border-2 transition cursor-pointer ${
                            textColor === c.id ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                          }`}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Text Position */}
                  <div className="space-y-1.5">
                    <label className="text-white/80 font-bold text-[11px] flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      <span>موقع الكتابة على الفيديو:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'center', 'bottom'] as const).map((pos) => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => setPosition(pos)}
                          className={`py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                            position === pos
                              ? 'bg-[#FF2D55] text-white border-[#FF2D55]'
                              : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                          }`}
                        >
                          {pos === 'top' ? 'أعلى' : pos === 'center' ? 'المنتصف' : 'أسفل'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Background Color of Banner */}
                  <div className="col-span-1 sm:col-span-2 space-y-1 pt-1">
                    <label className="text-white/80 font-bold text-[11px]">شكل خلفية الشريط المتحرك:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {BG_OPTIONS.map((bg) => (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => setTextBgColor(bg.id)}
                          className={`p-1.5 rounded-lg text-[10px] font-bold border text-center transition cursor-pointer ${
                            textBgColor === bg.id
                              ? 'bg-white/20 border-white text-white'
                              : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                          }`}
                        >
                          {bg.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SOUNDTRACK & AUDIO LIBRARY */}
            {activeTab === 'soundtrack' && (
              <div className="space-y-3 animate-in fade-in duration-200">
                <SoundtrackSelector
                  value={soundtrack}
                  onChange={(st) => setSoundtrack(st)}
                  onRemove={() => setSoundtrack({
                    trackId: undefined,
                    title: 'بدون صوت (مكتوم)',
                    url: '',
                    isMuted: true,
                  })}
                  lang={lang}
                  isAdmin={false}
                />
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#FF2D55] via-rose-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-xl shadow-[#FF2D55]/30 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>نشر الفيديو والكتابة المتحركة على الصفحة 🚀</span>
            </button>
          </form>

          {/* Right Column: Live Interactive Phone Screen Preview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white/90 flex items-center gap-1.5 text-xs">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>معاينة حية فورية للكتابة المتحركة والصوت:</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewSoundtrackPlaying(!previewSoundtrackPlaying)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 border transition ${
                    previewSoundtrackPlaying && !soundtrack.isMuted
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                      : 'bg-white/10 text-white/60 border-white/10'
                  }`}
                  title="كتم/تشغيل الصوت في المعاينة"
                >
                  {previewSoundtrackPlaying && !soundtrack.isMuted ? (
                    <>
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>صوت المعاينة شغال</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3 h-3 text-red-400" />
                      <span>صوت المعاينة مكتوم</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Phone/Reel Preview Screen */}
            <div className="relative aspect-[9/16] w-full max-w-[280px] mx-auto rounded-3xl overflow-hidden bg-black border-4 border-neutral-800 shadow-2xl flex flex-col justify-between select-none">
              {/* Media Display */}
              {mediaType === 'video' ? (
                <video
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={true}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="preview"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* Gradient Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

              {/* Top Bar inside preview */}
              <div className="relative z-10 p-3 flex items-center justify-between text-[10px] text-white">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold truncate max-w-[120px]">
                    {activeBusiness?.name || 'إعلانك'}
                  </span>
                </div>
                <span className="bg-[#FF2D55] text-white font-black px-2 py-0.5 rounded-full text-[9px]">
                  مشاركة عميل
                </span>
              </div>

              {/* MOVING ANIMATED TEXT OVERLAY (حركة الكتابة على الصورة أو الفيديو) */}
              <div 
                className={`relative z-20 w-full px-2 py-2 overflow-hidden flex flex-col pointer-events-none ${
                  position === 'top' ? 'mt-8' : position === 'center' ? 'my-auto' : 'mb-10'
                }`}
              >
                <div 
                  className="w-full rounded-2xl py-2 px-3 backdrop-blur-md text-center border border-white/15 overflow-hidden shadow-2xl"
                  style={{ backgroundColor: textBgColor }}
                >
                  <div
                    className={`${currentAnimClass} ${speedClass} font-black ${fontClass} tracking-wide drop-shadow`}
                    style={{ color: textColor }}
                  >
                    {caption}
                  </div>
                </div>
              </div>

              {/* Bottom Customer Info & Soundtrack ticker */}
              <div className="relative z-10 p-3 space-y-1.5 text-[11px] text-white">
                {/* Soundtrack Indicator in Preview */}
                {soundtrack.url && (
                  <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] text-amber-300 border border-amber-400/30 w-fit">
                    <Music className={`w-2.5 h-2.5 ${previewSoundtrackPlaying && !soundtrack.isMuted ? 'animate-spin' : ''}`} />
                    <span className="max-w-[140px] truncate">
                      {soundtrack.title} {soundtrack.artist ? `• ${soundtrack.artist}` : ''}
                    </span>
                    {soundtrack.isMuted || !previewSoundtrackPlaying ? (
                      <VolumeX className="w-2.5 h-2.5 text-red-400 shrink-0" />
                    ) : (
                      <Volume2 className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-[#FF2D55] flex items-center justify-center font-black text-[10px]">
                      {(userName || 'ع')[0]}
                    </div>
                    <span className="font-bold">{userName || (isAr ? 'عميل إعلانك' : 'E3lanak User')}</span>
                  </div>
                  <span className="text-[10px] text-white/60">الآن ⏱️</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
