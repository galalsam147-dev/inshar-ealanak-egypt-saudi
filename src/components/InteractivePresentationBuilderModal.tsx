import React, { useState, useRef } from 'react';
import { 
  X, Check, Plus, Trash2, ArrowUp, ArrowDown, Upload, 
  Sparkles, Film, Play, Eye, Music, Volume2, Type, Sliders,
  CheckCircle2, Wand2, Image as ImageIcon 
} from 'lucide-react';
import { Business, InteractivePromoPresentation, InteractiveSlide, SupportedLang } from '../types';
import { compressImageFile } from '../utils/mediaCompressor';
import { SOUNDTRACK_LIBRARY } from '../utils/soundtracks';
import { InteractivePresentationPlayer } from './InteractivePresentationPlayer';

interface InteractivePresentationBuilderModalProps {
  business: Business;
  onClose: () => void;
  onSave: (presentation: InteractivePromoPresentation) => void;
  lang: SupportedLang;
}

export const InteractivePresentationBuilderModal: React.FC<InteractivePresentationBuilderModalProps> = ({
  business,
  onClose,
  onSave,
  lang,
}) => {
  const existing = business.interactivePresentation;

  // Initialize slides from existing or business images
  const initialSlides: InteractiveSlide[] = existing?.slides?.length
    ? existing.slides
    : (business.images?.slice(0, 4) || [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800',
      ]).map((img, idx) => ({
        id: `slide_${idx}_${Date.now()}`,
        imageUrl: img,
        caption: idx === 0 
          ? `أهلاً بكم في ${business.name} ✨` 
          : idx === 1 
          ? 'أفضل جودة وأحدث الخدمات المميزة 🚀' 
          : 'عروض حصرية وخصومات خاصة لعملائنا 🔥',
        subCaption: idx === 0 ? 'خصم خاص وتأكيد فوري' : 'توصيل وخدمة سريعة في أي وقت',
        animation: idx % 2 === 0 ? 'ken_burns' : 'neon_glow',
        textPosition: 'bottom',
        durationSec: 4,
        textColor: idx % 2 === 0 ? '#FFD700' : '#00F0FF',
        bgColor: 'rgba(0, 0, 0, 0.75)',
      }));

  const [enabled, setEnabled] = useState(existing?.enabled ?? true);
  const [title, setTitle] = useState(existing?.title || `عرض ترويجي لـ ${business.name}`);
  const [badgeText, setBadgeText] = useState(existing?.badgeText || 'فيديو ترويجي تفاعلي 🎬');
  const [showFirstInPage, setShowFirstInPage] = useState(existing?.showFirstInPage ?? true);
  const [slideDurationSec, setSlideDurationSec] = useState(existing?.slideDurationSec || 4);
  const [soundtrackUrl, setSoundtrackUrl] = useState(
    existing?.soundtrackUrl || business.soundtrack?.url || SOUNDTRACK_LIBRARY[0].url
  );
  const [slides, setSlides] = useState<InteractiveSlide[]>(initialSlides);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick caption suggestions
  const CAPTION_TEMPLATES = [
    { title: 'عرض اليوم المميز 🔥', sub: 'تخفيضات تصل إلى 30% لفترة محدودة' },
    { title: 'أحدث المنتجات والخدمات ⚡', sub: 'جودة استثنائية وضمان معتمد' },
    { title: 'خدمة توصيل فورية وسريعة 🛵', sub: 'طلب مباشر عبر الواتساب والموقع' },
    { title: 'زيارة ممتعة وتجربة فريدة 🌟', sub: 'الدفع عند الاستلام أو بالمكان' },
  ];

  // Upload image handler with automatic compression
  const handleUploadImages = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    try {
      const newItems: InteractiveSlide[] = [];
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image')) continue;
        const res = await compressImageFile(file, 1280, 1280, 0.8);
        newItems.push({
          id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          imageUrl: res.url,
          caption: 'خدمة أو منتج جديد مميز ✨',
          subCaption: 'عروض حصرية لجميع العملاء',
          animation: 'ken_burns',
          textPosition: 'bottom',
          durationSec: slideDurationSec,
          textColor: '#FFD700',
          bgColor: 'rgba(0, 0, 0, 0.75)',
        });
      }
      setSlides((prev) => [...prev, ...newItems]);
    } catch (e) {
      console.error('Image compression failed:', e);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddBlankSlide = () => {
    const fallbackImg = business.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800';
    setSlides((prev) => [
      ...prev,
      {
        id: `slide_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        imageUrl: fallbackImg,
        caption: 'عرض جديد حصري ⚡',
        subCaption: 'تفضل بزيارتنا أو تواصل معنا',
        animation: 'fade_zoom',
        textPosition: 'bottom',
        durationSec: 4,
        textColor: '#00F0FF',
        bgColor: 'rgba(0, 0, 0, 0.75)',
      },
    ]);
  };

  const updateSlide = (idx: number, patch: Partial<InteractiveSlide>) => {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  const deleteSlide = (idx: number) => {
    if (slides.length <= 1) {
      alert(lang === 'ar' ? 'يجب أن يحتوي العرض على شريحة واحدة على الأقل' : 'Must have at least one slide');
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== idx));
  };

  const moveSlide = (idx: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    const newArr = [...slides];
    const temp = newArr[idx];
    newArr[idx] = newArr[targetIdx];
    newArr[targetIdx] = temp;
    setSlides(newArr);
  };

  const handleSave = () => {
    const presentation: InteractivePromoPresentation = {
      enabled,
      title: title.trim() || `عرض ترويجي لـ ${business.name}`,
      slides,
      badgeText: badgeText.trim() || 'فيديو ترويجي تفاعلي 🎬',
      showFirstInPage,
      slideDurationSec,
      soundtrackUrl,
      autoPlay: true,
      loop: true,
      transitionStyle: 'zoom',
    };

    onSave(presentation);
    alert(
      lang === 'ar'
        ? '✅ تم حفظ العرض التقديمي التفاعلي بنجاح! سيظهر كأول عنصر رئيسي في صفحتك 🎬'
        : '✅ Interactive presentation saved!'
    );
    onClose();
  };

  const currentPresentationForPreview: InteractivePromoPresentation = {
    enabled,
    title,
    slides,
    badgeText,
    showFirstInPage,
    slideDurationSec,
    soundtrackUrl,
    autoPlay: true,
    loop: true,
    transitionStyle: 'zoom',
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in text-white">
      <div 
        className="bg-[#12131d] border border-white/15 w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl relative my-auto flex flex-col max-h-[92vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-red-950/80 via-neutral-900 to-amber-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF2D55] to-amber-500 flex items-center justify-center text-xl shadow-lg shadow-red-500/30">
              🎬
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  صانع العروض التقديمية التفاعلية (Interactive Video Promo)
                </h3>
                <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                  الأول في الصفحة 🌟
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                ارفع صور نشاطك وضع نصوصاً متحركة جذابة لإنشاء فيديو قصير يظهر كأول عنصر في صفحة <b>{business.name}</b>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch between Editor and Live Preview */}
            <div className="bg-black/50 p-1 rounded-xl flex items-center border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'editor' ? 'bg-[#FF2D55] text-white' : 'text-white/60 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>المحرر</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1 rounded-lg font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview' ? 'bg-amber-500 text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>معاينة حية</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* TAB 1: Editor View */}
          {activeTab === 'editor' && (
            <div className="space-y-5">
              {/* Top Configuration Controls */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-white text-xs">
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF2D55] focus:ring-0"
                    />
                    <span>تفعيل العرض التقديمي التفاعلي في الصفحة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-300 text-xs bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/20">
                    <input
                      type="checkbox"
                      checked={showFirstInPage}
                      onChange={(e) => setShowFirstInPage(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-400 focus:ring-0"
                    />
                    <span>يظهر كأول عنصر رئيسي في أعلى الصفحة (Hero) 🌟</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      عنوان العرض التقديمي:
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="عنوان الفيديو الترويجي"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2D55]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      الشارة الإعلانية العلوية (Badge):
                    </label>
                    <input
                      type="text"
                      value={badgeText}
                      onChange={(e) => setBadgeText(e.target.value)}
                      placeholder="مثال: عرض ترويجي تفاعلي 🎬"
                      className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2D55]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-white/80 mb-1">
                      مدة كل شريحة (بالثواني):
                    </label>
                    <select
                      value={slideDurationSec}
                      onChange={(e) => setSlideDurationSec(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2D55]"
                    >
                      <option value={3}>3 ثوانٍ (سريع وحماسي)</option>
                      <option value={4}>4 ثوانٍ (افتراضي متوازن)</option>
                      <option value={5}>5 ثوانٍ (مريح للقراءة)</option>
                      <option value={6}>6 ثوانٍ (شرح مفصل)</option>
                    </select>
                  </div>
                </div>

                {/* Soundtrack selector */}
                <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">الموسيقى التصويرية للعرض التقديمي:</span>
                  </div>
                  <select
                    value={soundtrackUrl}
                    onChange={(e) => setSoundtrackUrl(e.target.value)}
                    className="bg-neutral-900 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400 max-w-xs"
                  >
                    {SOUNDTRACK_LIBRARY.map((tr) => (
                      <option key={tr.id} value={tr.url}>
                        {tr.title} ({tr.categoryLabelAr})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action bar: Add Slides */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-[#FF2D55]" />
                  <h4 className="font-black text-white text-sm">
                    شرائح العرض التقديمي ({slides.length} شريحة مسجلة)
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadImages(e.target.files)}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>+ رفع صور جديدة</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddBlankSlide}
                    className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ إضافة شريحة</span>
                  </button>
                </div>
              </div>

              {/* Slides List Cards */}
              <div className="space-y-4">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className="bg-[#0A0B14] border border-white/10 rounded-2xl p-4 space-y-3 relative group hover:border-[#FF2D55]/40 transition"
                  >
                    {/* Slide Top Bar */}
                    <div className="flex items-center justify-between pb-2 border-b border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center font-black font-mono text-xs">
                          {idx + 1}
                        </span>
                        <span className="font-bold text-white text-xs">شريحة #{idx + 1}</span>
                      </div>

                      {/* Controls: Up, Down, Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, 'up')}
                          disabled={idx === 0}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white flex items-center justify-center cursor-pointer"
                          title="تحريك لأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSlide(idx, 'down')}
                          disabled={idx === slides.length - 1}
                          className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 disabled:opacity-30 text-white flex items-center justify-center cursor-pointer"
                          title="تحريك لأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSlide(idx)}
                          className="w-7 h-7 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 flex items-center justify-center cursor-pointer"
                          title="حذف الشريحة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Slide Body: Image Preview + Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-start">
                      {/* Image Thumbnail & Change URL */}
                      <div className="space-y-1.5 sm:col-span-1">
                        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black border border-white/10">
                          <img
                            src={slide.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <input
                          type="url"
                          value={slide.imageUrl}
                          onChange={(e) => updateSlide(idx, { imageUrl: e.target.value })}
                          placeholder="رابط الصورة (https://...)"
                          className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white font-mono"
                        />
                      </div>

                      {/* Text & Animation Options */}
                      <div className="sm:col-span-3 space-y-2.5">
                        {/* Main Caption */}
                        <div>
                          <label className="block text-[11px] font-bold text-white/80 mb-1">
                            النص الترويجي المتحرك للشريحة *
                          </label>
                          <input
                            type="text"
                            value={slide.caption}
                            onChange={(e) => updateSlide(idx, { caption: e.target.value })}
                            placeholder="اكتب عبارة ترويجية تجذب العملاء..."
                            className="w-full bg-black/50 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#FF2D55] font-bold"
                          />
                        </div>

                        {/* Subcaption */}
                        <div>
                          <label className="block text-[10px] font-medium text-white/60 mb-0.5">
                            نص إضافي توضيحي (تفاصيل العرض / السعر):
                          </label>
                          <input
                            type="text"
                            value={slide.subCaption || ''}
                            onChange={(e) => updateSlide(idx, { subCaption: e.target.value })}
                            placeholder="مثال: خصم 25% اليوم فقط • التوصيل مجاني"
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-white/30"
                          />
                        </div>

                        {/* Quick Template Fillers */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] text-amber-300 font-bold">عبارات مقترحة:</span>
                          {CAPTION_TEMPLATES.map((tmpl, tIdx) => (
                            <button
                              key={tIdx}
                              type="button"
                              onClick={() => updateSlide(idx, { caption: tmpl.title, subCaption: tmpl.sub })}
                              className="text-[9px] bg-white/5 hover:bg-white/15 border border-white/10 px-2 py-0.5 rounded-full text-white/80 hover:text-white transition cursor-pointer"
                            >
                              {tmpl.title}
                            </button>
                          ))}
                        </div>

                        {/* Animation & Style Selectors */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/5">
                          <div>
                            <label className="text-[10px] text-white/60 block mb-0.5">حركة الصورة:</label>
                            <select
                              value={slide.animation}
                              onChange={(e) => updateSlide(idx, { animation: e.target.value as any })}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                            >
                              <option value="ken_burns">Ken Burns زوم سينمائي</option>
                              <option value="fade_zoom">نبض وتكبير ناعم</option>
                              <option value="slide_left">انزلاق سلس</option>
                              <option value="neon_glow">إضاءة نيون مبهرة</option>
                              <option value="bounce_in">قفز وتأثير مرن</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-white/60 block mb-0.5">موضع الكتابة:</label>
                            <select
                              value={slide.textPosition || 'bottom'}
                              onChange={(e) => updateSlide(idx, { textPosition: e.target.value as any })}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                            >
                              <option value="bottom">أسفل الصورة</option>
                              <option value="center">وسط الصورة</option>
                              <option value="top">أعلى الصورة</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-white/60 block mb-0.5">لون النص:</label>
                            <input
                              type="color"
                              value={slide.textColor || '#FFD700'}
                              onChange={(e) => updateSlide(idx, { textColor: e.target.value })}
                              className="w-full h-8 bg-black/50 border border-white/10 rounded-lg p-0.5 cursor-pointer"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-white/60 block mb-0.5">مدة الشريحة:</label>
                            <select
                              value={slide.durationSec || 4}
                              onChange={(e) => updateSlide(idx, { durationSec: Number(e.target.value) })}
                              className="w-full bg-neutral-900 border border-white/10 rounded-lg p-1.5 text-[11px] text-white"
                            >
                              <option value={3}>3 ثوانٍ</option>
                              <option value={4}>4 ثوانٍ</option>
                              <option value={5}>5 ثوانٍ</option>
                              <option value={6}>6 ثوانٍ</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Live Real-time Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4 text-center">
              <div className="bg-gradient-to-r from-amber-500/10 via-neutral-900 to-red-500/10 border border-amber-400/30 rounded-2xl p-3 inline-block w-full">
                <span className="text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>معاينة حية للعرض التقديمي كما سيظهر للعملاء في أعلى صفحة نشاطك 🎬</span>
                </span>
              </div>

              {/* Player Container */}
              <div className="max-w-md mx-auto aspect-[9/13] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/20 relative">
                <InteractivePresentationPlayer
                  presentation={currentPresentationForPreview}
                  businessName={business.name}
                  className="w-full h-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
          <div className="text-[11px] text-white/50">
            {slides.length} شريحة • إجمالي المدة: ~{slides.reduce((acc, s) => acc + (s.durationSec || 4), 0)} ثانية
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF2D55] via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black shadow-lg shadow-red-600/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ ونشر العرض التقديمي 🎬</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
