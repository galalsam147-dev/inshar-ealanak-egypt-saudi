import React, { useState } from 'react';
import { 
  X, MapPin, Phone, MessageCircle, Gift, Sparkles, 
  Store, CheckCircle2, Send, Navigation, Heart 
} from 'lucide-react';
import { Business, Category, SupportedLang } from '../types';
import { CATEGORIES, CITIES } from '../utils/translations';

interface QuickRegisterUnlistedModalProps {
  userCoords: { lat: number; lng: number } | null;
  onClose: () => void;
  onRegisterBusiness: (biz: Business, ownerWhatsAppMessage: string) => void;
  lang: SupportedLang;
}

export const QuickRegisterUnlistedModal: React.FC<QuickRegisterUnlistedModalProps> = ({
  userCoords,
  onClose,
  onRegisterBusiness,
  lang,
}) => {
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<Category>('مطاعم');
  const [city, setCity] = useState(CITIES[0] || 'القاهرة');
  const [address, setAddress] = useState(
    userCoords ? `موقعي الحالي GPS (${userCoords.lat.toFixed(4)}, ${userCoords.lng.toFixed(4)})` : ''
  );
  const [isDetecting, setIsDetecting] = useState(false);
  const [registeredBiz, setRegisteredBiz] = useState<Business | null>(null);

  const WELCOME_MESSAGE_TEMPLATE = `تم إضافتك في إعلانك الخاص لمده 3 شهور مجانا 🎁
يسعدنا استضافتك لزياده مبيعاتك وشهرتك ونتمني ان تسجل معنا علي طول ونتمني نكون في خدمتك لتحقيق النجاح`;

  const handleDetectGPS = () => {
    if ('geolocation' in navigator) {
      setIsDetecting(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setAddress(`موقعي الجغرافي الحالي (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
          setIsDetecting(false);
        },
        () => {
          setIsDetecting(false);
          alert('يرجى تفعيل صلاحية الـ GPS لجلب موقع المحل بدقة');
        }
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.trim() || '01006656669';
    const newBiz: Business = {
      id: Date.now(),
      name: storeName.trim(),
      cat: category,
      city: city,
      addr: address.trim() || city,
      bio: `نشاط مميز مسجل عبر زوار وعملاء إعلانك الخاص. يسعدنا استضافتك لزيادة مبيعاتك وشهرتك.`,
      verified: 1, // Verified with 3-months free trial badge
      phone: cleanPhone,
      phones: [cleanPhone],
      videos: [
        'https://assets.mixkit.co/videos/preview/mixkit-chef-cooking-vegetables-in-a-pan-43407-large.mp4',
      ],
      images: [
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      ],
      services: [
        { n: 'خدمة أو منتج رئيسي', p: 'أسعار مميزة وتخفيضات', priceEgp: 150 },
      ],
      hours: '10:00 ص - 12:00 ص',
      expiry: Date.now() + 90 * 86400000, // 3 Months Free! (90 Days)
      status: 'active',
      pkg: 399,
      likes: 25,
      lat: userCoords?.lat || 30.0444,
      lng: userCoords?.lng || 31.2357,
      isSponsored: false,
      ownerAccessCode: Math.floor(100000 + Math.random() * 900000).toString(),
      uniqueSubscriberKey: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      ownerPhone: cleanPhone,
      ownerPageLocked: false,
    };

    onRegisterBusiness(newBiz, WELCOME_MESSAGE_TEMPLATE);
    setRegisteredBiz(newBiz);
  };

  const handleOpenWhatsApp = () => {
    if (!registeredBiz) return;
    const cleanNumber = registeredBiz.phone.replace(/[^0-9]/g, '');
    const fullText = `${WELCOME_MESSAGE_TEMPLATE}\n\nاسم النشاط: ${registeredBiz.name}\nرابط صفحتك في الدليل: ${window.location.origin}?biz=${registeredBiz.id}`;
    const waUrl = `https://wa.me/2${cleanNumber}?text=${encodeURIComponent(fullText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-neutral-900 border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-neutral-950/80 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎁</span>
            <div>
              <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                <span>إضافة محل أو نشاط غير مسجل (3 شهور مجاناً)</span>
                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  هدية إعلانك 🌟
                </span>
              </h3>
              <p className="text-[10px] text-white/50">سجل مكانك أو مكان عجبك وأرسل له رسالة الترحيب والتهنئة</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {registeredBiz ? (
            /* SUCCESS CONFIRMATION VIEW */
            <div className="text-center space-y-4 py-3 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40 text-3xl">
                🎉
              </div>

              <div>
                <h4 className="text-base font-black text-white">
                  تم تسجيل "{registeredBiz.name}" بنجاح لمدة 3 شهور مجاناً!
                </h4>
                <p className="text-xs text-white/70 max-w-sm mx-auto mt-1">
                  تم توثيق المكان وتفعيله فوراً في إعلانك الخاص. اضغط على الزر بالأسفل لإرسال رسالة الترحيب الرسمية لصاحب المحل عبر واتساب 💚
                </p>
              </div>

              {/* Message Preview Box */}
              <div className="bg-neutral-950/80 border border-[#25D366]/40 p-3.5 rounded-2xl text-start text-xs text-white/90 space-y-2">
                <span className="text-[10px] text-[#25D366] font-bold block">
                  نص الرسالة التي ستصل لصاحب المحل عبر واتساب:
                </span>
                <p className="whitespace-pre-line leading-relaxed font-sans bg-black/40 p-2.5 rounded-xl border border-white/5">
                  {WELCOME_MESSAGE_TEMPLATE}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#20ba59] text-black font-black text-xs py-3 rounded-xl flex items-center justify-center gap-2 shadow-xl shadow-[#25D366]/30 transition cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-black" />
                  <span>إرسال رسالة الترحيب الآن عبر واتساب ({registeredBiz.phone})</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full bg-white/10 hover:bg-white/15 text-white/70 hover:text-white text-xs py-2.5 rounded-xl transition"
                >
                  إغلاق والعودة للدليل
                </button>
              </div>
            </div>
          ) : (
            /* REGISTRATION FORM */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="bg-gradient-to-r from-emerald-950/40 via-blue-950/30 to-neutral-900 border border-emerald-500/30 p-3 rounded-2xl text-xs text-white/80 space-y-1">
                <span className="font-black text-emerald-300 block">✨ ميزة تسجيل الأماكن للعملاء والزبائن:</span>
                <p className="text-[11px] leading-relaxed text-white/70">
                  لو دخلت محل، كافيه، مطعم، صيدلية، أو ورشة ومش متسجل عندنا في إعلانك الخاص، اكتب اسمه ورقمه وهيتسجل فوراً 3 شهور مجاناً وهنبعتله رسالة شكر واستضافة باسمك!
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">اسم المحل أو النشاط *</label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="مثال: مطعم البركة، كافيه الزهور، سوبر ماركت الهدى..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">نوع النشاط *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                      <option key={c} value={c} className="bg-neutral-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-white/80 block mb-1">المدينة / المحافظة *</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c} className="bg-neutral-900 text-white">
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-white/80">العنوان والموقع الجغرافي</label>
                  <button
                    type="button"
                    onClick={handleDetectGPS}
                    className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 hover:underline"
                  >
                    <Navigation className="w-3 h-3" />
                    <span>{isDetecting ? 'جاري التحديد...' : 'تحديد موقعي الحالي GPS'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="الشارع، المنطقة، أقرب علامة مميزة..."
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1">
                  رقم هاتف أو واتساب صاحب المحل (لإرسال رسالة الترحيب) *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 active:scale-98 text-white font-black text-xs py-3 rounded-xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>تأكيد الإضافة مجاناً لمدة 3 شهور وإرسال رسالة الترحيب 🚀</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
