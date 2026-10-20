import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Check, Trash2, Upload, Video, Image as ImageIcon, 
  Plus, Calendar, ShieldCheck, Sparkles, CheckCircle2, 
  Loader2, ExternalLink, MapPin, AlertCircle, Lock, Unlock,
  Search, Copy, Phone, ShoppingBag, Clock, DollarSign, KeyRound, Film, Eye, EyeOff, MessageCircle, CreditCard, Mic 
} from 'lucide-react';
import { Business, PackageTier, SupportedLang, BusinessSoundtrack, ServiceItem, InteractivePromoPresentation, SubscriberBankTransferDetails, SubscriberTrackingCell } from '../types';
import { CATEGORIES, CITIES, DEFAULT_VIDEOS } from '../utils/translations';
import { compressImageFile, MediaCompressionResult } from '../utils/mediaCompressor';
import { compressVideoFile, VideoCompressionResult } from '../utils/videoCompressor';
import { SoundtrackSelector } from './SoundtrackSelector';
import { generateBusinessGoogleKeywords } from '../utils/googleSearchKeywords';
import { InteractivePresentationBuilderModal } from './InteractivePresentationBuilderModal';
import { SavedBooking } from './UserBookingsModal';
import { ExternalVideoImporterModal } from './ExternalVideoImporterModal';
import { validateVideoAdditionQuota, getPackageQuota } from '../utils/mediaQuotaManager';

interface AdminEditSubscriberModalProps {
  business: Business;
  onClose: () => void;
  onSave: (updated: Business) => void;
  lang: SupportedLang;
  mode?: 'admin' | 'owner'; // 'owner' for subscriber editing their own page, 'admin' for supervisor
}

export const AdminEditSubscriberModal: React.FC<AdminEditSubscriberModalProps> = ({
  business,
  onClose,
  onSave,
  lang,
  mode = 'admin',
}) => {
  const isOwnerMode = mode === 'owner';

  // Form fields
  const [name, setName] = useState(business.name);
  const [category, setCategory] = useState(business.cat);
  const [city, setCity] = useState(business.city);
  const [address, setAddress] = useState(business.addr);
  const [phone, setPhone] = useState(business.phone);
  const [bio, setBio] = useState(business.bio || '');
  const [hours, setHours] = useState(business.hours || '10:00 ص - 12:00 ص');
  const [pkg, setPkg] = useState<PackageTier>(business.pkg || 0);
  const [verified, setVerified] = useState(business.verified === 1);
  const [status, setStatus] = useState<'active' | 'hidden' | 'expired'>(
    business.status === 'hidden' ? 'hidden' : business.status === 'expired' ? 'expired' : 'active'
  );
  const [expiry, setExpiry] = useState<number>(business.expiry);
  const [ownerPageLocked, setOwnerPageLocked] = useState<boolean>(!!business.ownerPageLocked);
  const [showSecretCode, setShowSecretCode] = useState<boolean>(false);
  const [ownerPin, setOwnerPin] = useState<string>(() => {
    return business.ownerPin || localStorage.getItem(`dalilk_pin_${business.id}`) || business.ownerAccessCode || '';
  });
  const [showEditPin, setShowEditPin] = useState<boolean>(false);
  const [pinSavedFeedback, setPinSavedFeedback] = useState<boolean>(false);

  // أرقام الخليفي والخط الساخن يدوي وفويس (تعديل أرقام الخليفي من داخل صفحة المشترك)
  const [hotline, setHotline] = useState<string>(business.hotline || '');
  const [khelaifiPhones, setKhelaifiPhones] = useState<string[]>(() => {
    if (business.phones && business.phones.length > 1) {
      return business.phones.filter((p) => p !== business.phone && p !== business.hotline);
    }
    return [];
  });
  const [newKhelaifiPhone, setNewKhelaifiPhone] = useState<string>('');

  // Private Customer Bookings for this business (الحجوزات مرتبطة بكل مشترك)
  const [bizBookings, setBizBookings] = useState<SavedBooking[]>(() => {
    try {
      const saved = localStorage.getItem(`e3lanak_bookings_${business.id}`) || localStorage.getItem(`dalilk_bookings_${business.id}`);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    if (business.id === 100) {
      return [
        {
          ref: 'E3L-BK-849120',
          businessId: 100,
          businessName: business.name,
          roomName: 'جناح سوبيريور عائلي (إطلالة بحر)',
          checkIn: '2026-10-07',
          checkOut: '2026-10-09',
          nights: 2,
          guestName: 'أحمد محمود النجار',
          guestPhone: '01006656669',
          totalPrice: 12558,
          paymentMethod: 'الدفع في الفندق عند الوصول (Cash upon arrival)',
          status: 'confirmed',
          createdAt: Date.now() - 3600000 * 24,
        }
      ];
    }
    if (business.id === 2) {
      return [
        {
          ref: 'E3L-BK-918234',
          businessId: 2,
          businessName: business.name,
          roomName: 'غرفة ديلوكس مطلة على النيل لشخصين',
          checkIn: '2026-10-12',
          checkOut: '2026-10-14',
          nights: 2,
          guestName: 'أحمد محمود النجار',
          guestPhone: '01006656669',
          totalPrice: 5200,
          paymentMethod: 'الدفع في الفندق عند الوصول (Cash upon arrival)',
          status: 'confirmed',
          createdAt: Date.now() - 3600000 * 48,
        }
      ];
    }
    return [];
  });

  // Delivery settings
  const [hasDelivery, setHasDelivery] = useState<boolean>(!!business.hasDelivery);
  const [deliveryPhone, setDeliveryPhone] = useState<string>(business.deliveryInfo?.phone || business.phone);
  const [deliveryAreas, setDeliveryAreas] = useState<string>(business.deliveryInfo?.areas || '');
  const [deliveryFee, setDeliveryFee] = useState<string>(business.deliveryInfo?.fee || '20 ج.م');
  const [deliveryEstimatedTime, setDeliveryEstimatedTime] = useState<string>(business.deliveryInfo?.estimatedTime || '30 - 45 دقيقة');

  // Services list
  const [services, setServices] = useState<ServiceItem[]>(business.services || []);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Images and Videos
  const [images, setImages] = useState<string[]>(business.images || []);
  const [videos, setVideos] = useState<string[]>(business.videos || []);

  // Soundtrack & Audio settings
  const [soundtrack, setSoundtrack] = useState<BusinessSoundtrack | undefined>(business.soundtrack);

  // Manual Bank & Wallet Transfers settings
  const [bankTransferDetails, setBankTransferDetails] = useState<SubscriberBankTransferDetails>(() => {
    try {
      const saved = localStorage.getItem(`e3lanak_biz_transfers_${business.id}`);
      if (saved) return JSON.parse(saved);
    } catch {}
    return business.bankTransferDetails || {
      enabled: true,
      bankName: 'بنك مصر',
      accountHolderName: business.name,
      accountNumber: '',
      iban: '',
      vodafoneCashNumber: business.phone || '',
      instapayId: '',
      customerTransferNotes: '',
      isEncryptedSecurity: true,
    };
  });

  // Tracking Cell state
  const [trackingCell, setTrackingCell] = useState<SubscriberTrackingCell | undefined>(business.trackingCell);

  // Interactive Presentation state
  const [interactivePresentation, setInteractivePresentation] = useState<InteractivePromoPresentation | undefined>(
    business.interactivePresentation
  );
  const [isPresentationBuilderOpen, setIsPresentationBuilderOpen] = useState(false);

  // Compression states
  const [isCompressingImg, setIsCompressingImg] = useState(false);
  const [lastImgStats, setLastImgStats] = useState<MediaCompressionResult | null>(null);

  const [isCompressingVid, setIsCompressingVid] = useState(false);
  const [vidProgress, setVidProgress] = useState(0);
  const [lastVidStats, setLastVidStats] = useState<VideoCompressionResult | null>(null);
  const [isImporterModalOpen, setIsImporterModalOpen] = useState(false);

  // Manual URL inputs
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newVidUrl, setNewVidUrl] = useState('');
  const [copiedAllKeywords, setCopiedAllKeywords] = useState(false);

  const imgInputRef = useRef<HTMLInputElement>(null);
  const vidInputRef = useRef<HTMLInputElement>(null);

  const [activeVoiceField, setActiveVoiceField] = useState<string | null>(null);
  const [voiceToast, setVoiceToast] = useState<string | null>(null);

  // التعرف الصوتي الذكي فويس لتعبئة الحقول
  const startVoiceInput = (onTranscript: (val: string) => void, fieldId: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'ar' ? 'المتصفح لا يدعم التعرف الصوتي المباشر' : 'Browser does not support speech recognition');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'ar' ? 'ar-EG' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    setActiveVoiceField(fieldId);
    setVoiceToast('🎙️ جاري الاستماع... تحدث بوضوح الآن');

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
      setActiveVoiceField(null);
      setVoiceToast(`✓ تم التقاط الصوت: "${transcript}"`);
      setTimeout(() => setVoiceToast(null), 2500);
    };

    recognition.onerror = () => {
      setActiveVoiceField(null);
      setVoiceToast('تعذر التقاط الصوت، حاول ثانية');
      setTimeout(() => setVoiceToast(null), 2000);
    };

    recognition.onend = () => {
      setActiveVoiceField(null);
    };

    recognition.start();
  };

  // Auto-generated Google Search Keywords
  const googleKeywords = useMemo(() => {
    return generateBusinessGoogleKeywords({
      ...business,
      name,
      city,
      cat: category,
      phone,
      hasDelivery,
    });
  }, [business, name, city, category, phone, hasDelivery]);

  // Handle image upload with canvas compression
  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsCompressingImg(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image')) continue;
        const res = await compressImageFile(file, 1280, 1280, 0.78);
        setLastImgStats(res);
        setImages((prev) => [...prev, res.url]);
      }
    } catch (e) {
      console.error('Image compression failed:', e);
    } finally {
      setIsCompressingImg(false);
    }
  };

  // Handle video upload with compression
  const handleVideoFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file || !file.type.startsWith('video')) return;

    setIsCompressingVid(true);
    setVidProgress(20);
    try {
      const res = await compressVideoFile(file, (p) => setVidProgress(p));
      setLastVidStats(res);
      setVideos((prev) => [res.compressedUrl, ...prev]);
    } catch (e) {
      console.error('Video compression failed:', e);
      const raw = URL.createObjectURL(file);
      setVideos((prev) => [raw, ...prev]);
    } finally {
      setIsCompressingVid(false);
      setVidProgress(0);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;
    setServices((prev) => [
      ...prev,
      {
        n: newServiceName.trim(),
        p: newServicePrice.trim() || 'حسب الاتفاق',
        priceEgp: parseFloat(newServicePrice.replace(/[^0-9.]/g, '')) || undefined,
      },
    ]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleCopyKeywords = () => {
    const text = googleKeywords.map((k) => k.keyword).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAllKeywords(true);
    setTimeout(() => setCopiedAllKeywords(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const allCombinedPhones = Array.from(new Set([
      phone.trim(),
      hotline.trim(),
      ...khelaifiPhones.map((p) => p.trim())
    ])).filter(Boolean);

    const updated: Business = {
      ...business,
      name,
      cat: category,
      city,
      addr: address,
      phone: phone.trim(),
      hotline: hotline.trim() || undefined,
      phones: allCombinedPhones,
      bio,
      hours,
      pkg,
      verified: verified ? 1 : 0,
      status: expiry < Date.now() ? 'expired' : status,
      expiry,
      images,
      videos,
      services,
      soundtrack,
      ownerPageLocked,
      ownerPin: ownerPin.trim() || business.ownerPin,
      ownerAccessCode: ownerPin.trim() || business.ownerAccessCode,
      hasDelivery,
      deliveryInfo: hasDelivery
        ? {
            available: true,
            phone: deliveryPhone.trim() || phone,
            areas: deliveryAreas.trim() || undefined,
            fee: deliveryFee.trim() || undefined,
            estimatedTime: deliveryEstimatedTime.trim() || undefined,
          }
        : undefined,
      googleKeywords: googleKeywords.map((k) => k.keyword),
      interactivePresentation: interactivePresentation,
      bankTransferDetails: bankTransferDetails,
      trackingCell: trackingCell ? { ...trackingCell, enabled: true, lastPing: Date.now() } : undefined,
    };
    try {
      localStorage.setItem(`e3lanak_biz_transfers_${business.id}`, JSON.stringify(bankTransferDetails));
    } catch {}
    onSave(updated);
    alert(lang === 'ar' ? '✅ تم حفظ جميع التعديلات بنجاح وتحديث صفحتك!' : '✅ Business page successfully updated!');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div 
        className="bg-[#141419] border border-white/15 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-200 text-white"
        dir="rtl"
      >
        {/* Header */}
        <div 
          className={`p-4 sm:p-5 border-b border-white/10 flex items-center justify-between ${
            isOwnerMode 
              ? 'bg-gradient-to-r from-orange-950/80 via-neutral-900 to-amber-950/80' 
              : 'bg-gradient-to-r from-purple-900/60 to-neutral-900'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-lg ${
              isOwnerMode 
                ? 'bg-gradient-to-br from-[#FF6B35] to-[#FFD700] text-black font-black' 
                : 'bg-purple-500/20 border border-purple-400/30 text-purple-300'
            }`}>
              {isOwnerMode ? '🔐' : '✏️'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-white text-base sm:text-lg">
                  {isOwnerMode ? 'تعديل صفحتي - خاص بصاحب النشاط' : 'تعديل بيانات النشاط التجاري والوسائط'}
                </h3>
                {isOwnerMode && (
                  <span className="bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                    صفحتك الحصرية 🛡️
                  </span>
                )}
              </div>
              <p className="text-[11px] text-white/60">
                {isOwnerMode 
                  ? `أنت تقوم بتعديل صفحتك الخاصة فقط (${business.name}) • هاتف: ${phone}`
                  : `${business.name} • معرف #${business.id}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto hide-scroll text-xs">
          
          {/* Owner Notice & Lock Status Banner */}
          {isOwnerMode && (
            <div className="bg-[#0A0B14] border border-amber-400/30 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-sm font-bold">
                  {ownerPageLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </div>
                <div>
                  <div className="font-black text-white text-xs flex items-center gap-1.5">
                    <span>حالة حماية صفحتك:</span>
                    <span className={ownerPageLocked ? 'text-amber-400' : 'text-emerald-400'}>
                      {ownerPageLocked ? 'مقفلة برقم سري (لا تفتح للغير)' : 'مفتوحة للجمهور والزوار ✓'}
                    </span>
                  </div>
                  <div className="text-[10px] text-white/50 flex items-center gap-1.5 mt-0.5">
                    <span>كود دخولك السري:</span>
                    <span className="font-mono text-amber-300 font-bold tracking-wider">
                      {showSecretCode ? (business.ownerAccessCode || '847392') : '••••••'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSecretCode(!showSecretCode)}
                      className="text-white/60 hover:text-white p-0.5 rounded cursor-pointer"
                      title={showSecretCode ? 'إخفاء الكود' : 'إظهار الكود'}
                    >
                      {showSecretCode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOwnerPageLocked(!ownerPageLocked)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1.5 ${
                  ownerPageLocked
                    ? 'bg-amber-400 text-black hover:bg-amber-300'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {ownerPageLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{ownerPageLocked ? 'فتح الصفحة للجمهور' : 'قفل الصفحة برقم سري'}</span>
              </button>
            </div>
          )}

          {/* Change Secret PIN Section (وتعديل الدخول بالرقم السري) */}
          {isOwnerMode && (
            <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="font-bold text-white text-xs">
                    تعديل الرقم السري لصفحتك (سري خاص بك):
                  </span>
                </div>
                {pinSavedFeedback && (
                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Check className="w-3 h-3" /> تم حفظ الرقم السري
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type={showEditPin ? 'text' : 'password'}
                    value={ownerPin}
                    onChange={(e) => setOwnerPin(e.target.value)}
                    placeholder="اكتب الرقم السري الجديد هنا..."
                    className="w-full bg-[#151725] border border-white/20 px-3 py-2 rounded-xl text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPin(!showEditPin)}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-1"
                  >
                    {showEditPin ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const clean = ownerPin.trim();
                    if (clean.length < 4) {
                      alert(lang === 'ar' ? 'الرقم السري يجب أن يكون 4 أرقام أو أحرف على الأقل' : 'PIN must be at least 4 characters');
                      return;
                    }
                    localStorage.setItem(`dalilk_pin_${business.id}`, clean);
                    setPinSavedFeedback(true);
                    setTimeout(() => setPinSavedFeedback(false), 2500);
                  }}
                  className="bg-amber-400 hover:bg-amber-300 text-black px-3.5 py-2 rounded-xl font-black text-xs transition cursor-pointer shrink-0"
                >
                  حفظ الرقم السري
                </button>
              </div>
              <p className="text-[10px] text-white/40">
                🔒 هذا الرقم سري للغاية ولا يظهر لأحد، تستخدمه للدخول وتعديل صفحتك في أي وقت بدلاً من طلب كود كل مرة.
              </p>
            </div>
          )}

          {/* Private Bookings Section for Subscriber (الحجوزات خاصة بكل مستخدم) */}
          {isOwnerMode && (
            <div className="bg-[#0A0B14] border border-purple-500/20 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-400" />
                  <span className="font-bold text-white text-xs">
                    الحجوزات الخاصة بصفحتك ({bizBookings.length} حجز مؤكد):
                  </span>
                </div>
                <span className="text-[10px] text-purple-300 font-bold bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  {bizBookings.length > 0 ? 'حجوزات مفعلة بالكود ✓' : 'لا توجد حجوزات جديدة'}
                </span>
              </div>

              {bizBookings.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {bizBookings.map((bk, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px]">
                      <div>
                        <div className="font-bold text-white flex items-center gap-1.5">
                          <span>{bk.guestName}</span>
                          <span className="text-[9px] font-mono text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                            #{bk.ref}
                          </span>
                        </div>
                        <div className="text-[10px] text-white/60">
                          {bk.roomName} • {bk.checkIn} ({bk.nights} ليلة)
                        </div>
                        <div className="text-[10px] text-emerald-400 font-bold">
                          {bk.totalPrice?.toLocaleString()} ج.م ({bk.paymentMethod})
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={`https://wa.me/2${bk.guestPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`مرحباً ${bk.guestName}، بخصوص حجزك رقم ${bk.ref} في ${business.name}...`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-[#25D366] hover:bg-[#20ba59] text-black px-2.5 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1"
                        >
                          <MessageCircle className="w-3 h-3 fill-black" />
                          <span>واتساب العميل</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-white/5 rounded-xl border border-white/5 text-white/50 text-[11px] space-y-1">
                  <p>📅 لا توجد حجوزات مسجلة بعد لهذا النشاط.</p>
                  <p className="text-[10px] text-white/40">فور قيام أي عميل بحجز موعد أو غرفة، ستظهر بياناته وهاتفه هنا مباشرة للتواصل معه.</p>
                </div>
              )}
            </div>
          )}

          {/* Smart Voice Assistant Banner (تعبئة وتعديل البيانات يدوي وفويس بالأمر الصوتي) */}
          <div className="bg-gradient-to-r from-red-950/40 via-amber-950/40 to-neutral-900 border border-amber-400/30 rounded-2xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-red-400 animate-pulse" />
                <span>المساعد الصوتي لتعبئة وتعديل البيانات فويس ويدوي 🎙️:</span>
              </span>
              {voiceToast && (
                <span className="text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {voiceToast}
                </span>
              )}
            </div>
            <p className="text-[10px] text-white/70 leading-relaxed">
              يمكنك التحدث بالصوت بجانب أي حقل للضغط على علامة المايك 🎙️ وسيتم كتابة وتعديل رقم التليفون، الخط الساخن، العنوان، والأسعار تلقائياً.
            </p>
          </div>

          {/* Main Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-white/80 font-bold text-xs">اسم النشاط أو المحل *</label>
                <button
                  type="button"
                  onClick={() => startVoiceInput((val) => setName(val), 'name')}
                  className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                    activeVoiceField === 'name' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                  }`}
                  title="تحدث لتسجيل الاسم بالصوت"
                >
                  <Mic className="w-3 h-3" />
                  <span>فويس</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-white/80 font-bold text-xs">رقم الهاتف / الواتساب للمشترك *</label>
                <button
                  type="button"
                  onClick={() => startVoiceInput((val) => setPhone(val.replace(/\s/g, '')), 'phone')}
                  className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                    activeVoiceField === 'phone' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                  }`}
                  title="تحدث لتسجيل رقم الهاتف بالصوت"
                >
                  <Mic className="w-3 h-3" />
                  <span>فويس</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Hotline & Additional Khelaifi Numbers (تعديل أرقام الخليفي والخط الساخن يدوي وفويس) */}
          <div className="bg-white/5 border border-amber-400/20 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">
                  الخط الساخن وأرقام الخليفي الإضافية للمشترك (يدوي وفويس 🎙️)
                </span>
              </div>
              <span className="text-[10px] text-amber-300 font-mono">
                {khelaifiPhones.length} أرقام إضافية مسجلة
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Hotline */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 font-bold text-xs">الخط الساخن للطوارئ / الحجز السريع</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setHotline(val.replace(/\s/g, '')), 'hotline')}
                    className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'hotline' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تحدث لتسجيل الخط الساخن بالصوت"
                  >
                    <Mic className="w-3 h-3" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={hotline}
                  onChange={(e) => setHotline(e.target.value)}
                  placeholder="مثال: 19822 أو 01006656669"
                  className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Add New Khelaifi Phone */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-white/80 font-bold text-xs">إضافة رقم خليفي / إضافي جديد</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setNewKhelaifiPhone(val.replace(/\s/g, '')), 'newKhelaifi')}
                    className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'newKhelaifi' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تحدث لتسجيل الرقم الإضافي بالصوت"
                  >
                    <Mic className="w-3 h-3" />
                    <span>فويس</span>
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newKhelaifiPhone}
                    onChange={(e) => setNewKhelaifiPhone(e.target.value)}
                    placeholder="رقم هاتف إضافي..."
                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newKhelaifiPhone.trim()) {
                        setKhelaifiPhones((prev) => [...prev, newKhelaifiPhone.trim()]);
                        setNewKhelaifiPhone('');
                      }
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black px-3 py-2 rounded-xl text-xs transition cursor-pointer"
                  >
                    + إضافة
                  </button>
                </div>
              </div>
            </div>

            {/* List of Khelaifi phones */}
            {khelaifiPhones.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {khelaifiPhones.map((kp, idx) => (
                  <span
                    key={idx}
                    className="bg-white/10 border border-white/15 px-2.5 py-1 rounded-xl text-xs font-mono text-white flex items-center gap-2"
                  >
                    <span>{kp}</span>
                    <button
                      type="button"
                      onClick={() => setKhelaifiPhones((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-400 hover:text-red-300 font-bold text-xs"
                      title="حذف الرقم"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-white/80 font-bold text-xs">القسم والتصنيف</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-white/80 font-bold text-xs">المدينة والمحافظة</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-neutral-900 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-white/80 font-bold text-xs">العنوان وموقع النشاط</label>
                <button
                  type="button"
                  onClick={() => startVoiceInput((val) => setAddress(val), 'address')}
                  className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                    activeVoiceField === 'address' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                  }`}
                  title="تحدث لتسجيل العنوان بالصوت"
                >
                  <Mic className="w-3 h-3" />
                  <span>فويس</span>
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Bio & Hours */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-white/80 font-bold text-xs">مواعيد وساعات العمل</label>
                <button
                  type="button"
                  onClick={() => startVoiceInput((val) => setHours(val), 'hours')}
                  className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                    activeVoiceField === 'hours' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                  }`}
                  title="تحدث لتسجيل مواعيد العمل بالصوت"
                >
                  <Mic className="w-3 h-3" />
                  <span>فويس</span>
                </button>
              </div>
              <input
                type="text"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="10:00 ص - 12:00 ص"
                className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {!isOwnerMode && (
              <div className="space-y-1">
                <label className="text-white/80 font-bold text-xs">الباقة والحالة (للإدارة فقط)</label>
                <div className="flex gap-2">
                  <select
                    value={pkg}
                    onChange={(e) => setPkg(Number(e.target.value) as PackageTier)}
                    className="flex-1 bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs font-mono"
                  >
                    <option value={0}>مجاني (0 ج)</option>
                    <option value={350}>باقة 350 ج (30 يوم)</option>
                    <option value={900}>باقة 900 ج (90 يوم)</option>
                    <option value={2500}>باقة VIP (2500 ج)</option>
                    <option value={5000}>باقة سنوية (5000 ج)</option>
                  </select>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="bg-neutral-900 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs"
                  >
                    <option value="active">نشط</option>
                    <option value="hidden">مخفي</option>
                    <option value="expired">منتهي</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-white/80 font-bold text-xs">نبذة تعريفية عن النشاط والخدمات</label>
              <button
                type="button"
                onClick={() => startVoiceInput((val) => setBio(val), 'bio')}
                className={`p-1 rounded-md border text-[10px] flex items-center gap-1 transition cursor-pointer ${
                  activeVoiceField === 'bio' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                }`}
                title="تحدث لتسجيل النبذة التعريفية بالصوت"
              >
                <Mic className="w-3 h-3" />
                <span>فويس</span>
              </button>
            </div>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="اكتب نبذة مختصرة تجذب العملاء والسياح أو تحدث بالمايك..."
              className="w-full bg-white/10 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Direct Delivery Settings (اختياري للمشترك) */}
          <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-xs">خدمة الدليفري والتوصيل المباشر (اختياري)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDelivery}
                  onChange={(e) => setHasDelivery(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                />
                <span className="text-[11px] text-white/80">{hasDelivery ? 'مفعلة' : 'غير مفعلة'}</span>
              </label>
            </div>

            {hasDelivery && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                <div>
                  <label className="text-[10px] text-white/60 block mb-0.5">رقم تليفون الدليفري:</label>
                  <input
                    type="text"
                    value={deliveryPhone}
                    onChange={(e) => setDeliveryPhone(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/60 block mb-0.5">مناطق التغطية:</label>
                  <input
                    type="text"
                    value={deliveryAreas}
                    onChange={(e) => setDeliveryAreas(e.target.value)}
                    placeholder="التجمع، مدينة نصر، المعادي..."
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-white/60 block mb-0.5">رسوم / وقت التوصيل:</label>
                  <input
                    type="text"
                    value={deliveryFee}
                    onChange={(e) => setDeliveryFee(e.target.value)}
                    placeholder="25 ج.م (30 دقيقة)"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Services & Prices Manager */}
          <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>قائمة الخدمات والأسعار (تعديل مباشر)</span>
              </h4>
              <span className="text-[10px] text-white/50">{services.length} خدمة مسجلة</span>
            </div>

            {/* Existing Services */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {services.map((srv, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white/5 p-2 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-bold">{srv.n}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{srv.p}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setServices(services.filter((_, i) => i !== idx))}
                    className="text-red-400 hover:text-red-300 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add service form */}
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="اسم الخدمة أو الوجبة"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white"
              />
              <input
                type="text"
                value={newServicePrice}
                onChange={(e) => setNewServicePrice(e.target.value)}
                placeholder="السعر (مثال: 350 ج)"
                className="w-28 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={handleAddService}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>
          </div>

          {/* GOOGLE SEARCH AUTOMATIC KEYWORDS SECTION (كلمات البحث في جوجل التلقائية) */}
          <div className="bg-gradient-to-r from-blue-950/40 via-[#0A0B14] to-cyan-950/40 border border-blue-400/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img
                  src="https://www.gstatic.com/images/branding/product/1x/googleg_48dp.png"
                  alt="Google"
                  className="w-4 h-4"
                />
                <div>
                  <h4 className="font-black text-white text-xs">
                    كلمات البحث التلقائية في Google (SEO الذكي لنشاطك)
                  </h4>
                  <p className="text-[10px] text-white/60">
                    تم إنشاء {googleKeywords.length} كلمات بحث جاهزة للظهور في الصفحة الأولى
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyKeywords}
                className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition"
              >
                {copiedAllKeywords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedAllKeywords ? 'تم النسخ' : 'نسخ الكلمات'}</span>
              </button>
            </div>

            {/* Keywords grid with direct 1-click Google search */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {googleKeywords.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl p-2 flex items-center justify-between text-[11px] group transition"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <Search className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-white font-medium truncate">{item.keyword}</span>
                  </div>
                  <a
                    href={item.searchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-0.5 transition shrink-0"
                    title="ابحث في Google الآن"
                  >
                    <span>Google</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* INTERACTIVE PROMO PRESENTATION SECTION (العروض التقديمية التفاعلية) */}
          <div className="bg-gradient-to-r from-red-950/40 via-[#0A0B14] to-amber-950/40 border border-red-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF2D55] to-amber-500 flex items-center justify-center text-sm shadow">
                  🎬
                </div>
                <div>
                  <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                    <span>العروض التقديمية التفاعلية (فيديو ترويجي قصير)</span>
                    <span className="bg-amber-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full">
                      جديد 🔥
                    </span>
                  </h4>
                  <p className="text-[10px] text-white/60">
                    ارفع عدة صور مع نصوص متحركة لإنشاء فيديو ترويجي يظهر كأول عنصر في صفحتك
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPresentationBuilderOpen(true)}
                className="bg-gradient-to-r from-[#FF2D55] to-amber-500 hover:brightness-110 active:scale-95 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-red-600/30 transition cursor-pointer"
              >
                <Film className="w-3.5 h-3.5" />
                <span>
                  {interactivePresentation?.enabled && (interactivePresentation.slides?.length || 0) > 0
                    ? 'تعديل ومراجعة العرض التقديمي 🎨'
                    : 'إنشاء عرض تقديمي تفاعلي الآن ✨'}
                </span>
              </button>
            </div>

            {/* Status & Slides Quick Summary */}
            {interactivePresentation?.enabled && (interactivePresentation.slides?.length || 0) > 0 ? (
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-white font-bold">
                    العرض مفعل ويحتوي على {interactivePresentation.slides.length} شريحة متحركة
                  </span>
                  {interactivePresentation.showFirstInPage && (
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      يظهر كأول عنصر في الصفحة 🌟
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsPresentationBuilderOpen(true)}
                  className="text-amber-300 hover:underline text-[10px] font-bold cursor-pointer"
                >
                  معاينة وتعديل
                </button>
              </div>
            ) : (
              <div className="bg-white/5 border border-dashed border-white/10 rounded-xl p-2.5 text-center text-white/50 text-[11px]">
                لم يتم تصميم عرض تقديمي بعد. اضغط على الزر أعلاه لتصميم أول فيديو ترويجي تفاعلي لصفحتك!
              </div>
            )}
          </div>

          {/* IMAGES & VIDEOS MANAGEMENT */}
          <div className="space-y-4">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              <span>معرض الصور والفيديوهات المضغوطة (رفع وتعديل)</span>
            </h4>

            {/* Images Upload */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-white/80 font-bold">صور المعرض (حتى 10 صور):</span>
                <button
                  type="button"
                  onClick={() => imgInputRef.current?.click()}
                  disabled={isCompressingImg}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition"
                >
                  {isCompressingImg ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                  <span>+ رفع صور مضغوطة</span>
                </button>
                <input
                  ref={imgInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
              </div>

              {/* Images Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 group">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Upload & Compression with External/Google Import and Quotas */}
            <div className="space-y-3 pt-2 border-t border-white/5">
              {/* Quota Bar (الالتزام بالحصص) */}
              <div className="bg-[#0A0B14] border border-white/10 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="font-bold text-white block text-[11px]">
                      حصة الفيديوهات المتاحة في باقتك ({getPackageQuota(pkg).tierNameAr}):
                    </span>
                    <span className="text-[10px] text-white/60">
                      تم استخدام <b>{videos.length}</b> من أصل <b>{getPackageQuota(pkg).maxVideos}</b> فيديو
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                    validateVideoAdditionQuota(videos.length, pkg).canAdd 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {validateVideoAdditionQuota(videos.length, pkg).canAdd 
                      ? `متبقي ${validateVideoAdditionQuota(videos.length, pkg).remaining}` 
                      : 'اكتملت الحصة ⛔'}
                  </span>

                  <button
                    type="button"
                    onClick={() => setIsImporterModalOpen(true)}
                    className="bg-gradient-to-r from-red-600 to-[#FF2D55] hover:brightness-110 active:scale-95 text-white px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md shadow-red-600/30 transition cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>+ تحميل وضغط فيديو (جوجل أو سطح المكتب)</span>
                  </button>
                </div>
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {videos.map((vid, idx) => (
                  <div key={idx} className="relative aspect-[9/14] rounded-xl overflow-hidden bg-black border border-white/15 group">
                    <video src={vid} className="w-full h-full object-cover" muted playsInline />
                    <button
                      type="button"
                      onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                      className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {videos.length === 0 && (
                  <div 
                    onClick={() => setIsImporterModalOpen(true)}
                    className="col-span-2 sm:col-span-4 border-2 border-dashed border-white/10 hover:border-amber-400/40 rounded-2xl p-6 text-center text-white/50 hover:text-white cursor-pointer transition space-y-1"
                  >
                    <Video className="w-8 h-8 mx-auto text-white/30" />
                    <p className="text-xs font-bold">لا يوجد فيديوهات مضافة بعد</p>
                    <p className="text-[10px] text-white/40">اضغط لتحميل فيديو من جوجل أو سطح المكتب مع ضغط فوري وتقليص الحجم</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Independent Bank & Wallet Transfers Fields (إدخال يدوي لأرقام الحسابات والمحافظ لكل صفحة) */}
          <div className="pt-3 border-t border-white/10 space-y-3 bg-white/5 p-3.5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                <span>بيانات التحويلات البنكية والمحافظ المستقلة (إدخال يدوي لصفحة المشترك):</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                مشفر ومستقل 🔒
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] text-white/60 block mb-1">اسم البنك المعتمد:</label>
                <input
                  type="text"
                  value={bankTransferDetails.bankName || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, bankName: e.target.value })}
                  placeholder="بنك مصر / البنك الأهلي المصري / CIB"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">اسم صاحب الحساب الثلاثي:</label>
                <input
                  type="text"
                  value={bankTransferDetails.accountHolderName || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, accountHolderName: e.target.value })}
                  placeholder="اسم المستفيد بالبنك"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">رقم الحساب البنكي:</label>
                <input
                  type="text"
                  value={bankTransferDetails.accountNumber || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, accountNumber: e.target.value })}
                  placeholder="16 رقم"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">الآيبان الدولي (IBAN):</label>
                <input
                  type="text"
                  value={bankTransferDetails.iban || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, iban: e.target.value })}
                  placeholder="EG..."
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/60 font-bold">رقم فودافون كاش للمشترك:</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setBankTransferDetails({ ...bankTransferDetails, vodafoneCashNumber: val.replace(/\s/g, '') }), 'voda')}
                    className={`p-1 rounded border text-[9px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'voda' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تسجيل رقم فودافون كاش بالصوت"
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="tel"
                  value={bankTransferDetails.vodafoneCashNumber || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, vodafoneCashNumber: e.target.value })}
                  placeholder="010XXXXXXXX"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/60 font-bold">معرف إنستاباي InstaPay Handle:</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setBankTransferDetails({ ...bankTransferDetails, instapayId: val.trim() }), 'insta')}
                    className={`p-1 rounded border text-[9px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'insta' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تسجيل معرف إنستاباي بالصوت"
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={bankTransferDetails.instapayId || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, instapayId: e.target.value })}
                  placeholder="handle@instapay أو رقم الهاتف"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              {/* Visa / MasterCard */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/60 font-bold">رقم بطاقة فيزا / ماستركارد المعتمدة:</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setBankTransferDetails({ ...bankTransferDetails, visaCardNumber: val }), 'visa')}
                    className={`p-1 rounded border text-[9px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'visa' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تسجيل بطاقة الفيزا بالصوت"
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={bankTransferDetails.visaCardNumber || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, visaCardNumber: e.target.value })}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <label className="text-[10px] text-white/60 block mb-1">اسم صاحب بطاقة الفيزا:</label>
                <input
                  type="text"
                  value={bankTransferDetails.visaHolderName || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, visaHolderName: e.target.value })}
                  placeholder="اسم صاحب البطاقة"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/60 font-bold">أرقام هواتف إضافية للتواصل (مفصولة بفواصل):</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => {
                      const newNums = val.split(/[\s,]+/).filter(Boolean);
                      setBankTransferDetails({ ...bankTransferDetails, phones: [...(bankTransferDetails.phones || []), ...newNums] });
                    }, 'phones')}
                    className={`p-1 rounded border text-[9px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'phones' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تسجيل أرقام هواتف إضافية بالصوت"
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={(bankTransferDetails.phones || []).join(', ')}
                  onChange={(e) => setBankTransferDetails({ 
                    ...bankTransferDetails, 
                    phones: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                  })}
                  placeholder="مثال: 01006656669, 01221299931"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[10px] text-white/60 font-bold">الخط الساخن المختصر (إن وجد):</label>
                  <button
                    type="button"
                    onClick={() => startVoiceInput((val) => setBankTransferDetails({ ...bankTransferDetails, hotline: val.replace(/\s/g, '') }), 'hotline')}
                    className={`p-1 rounded border text-[9px] flex items-center gap-1 transition cursor-pointer ${
                      activeVoiceField === 'hotline' ? 'bg-red-500 text-white animate-pulse' : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/10'
                    }`}
                    title="تسجيل الخط الساخن بالصوت"
                  >
                    <Mic className="w-2.5 h-2.5" />
                    <span>فويس</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={bankTransferDetails.hotline || ''}
                  onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, hotline: e.target.value })}
                  placeholder="مثال: 19822"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 font-mono focus:border-amber-400 outline-none dir-ltr text-right"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-white/60 block mb-1">تعليمات التحويل للعملاء والزبائن:</label>
              <input
                type="text"
                value={bankTransferDetails.customerTransferNotes || ''}
                onChange={(e) => setBankTransferDetails({ ...bankTransferDetails, customerTransferNotes: e.target.value })}
                placeholder="مثال: يرجى إرسال إيصال التحويل عبر الواتساب لتأكيد الحجز فوراً"
                className="w-full bg-white/10 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder:text-white/40 focus:border-amber-400 outline-none"
              />
            </div>
          </div>

          {/* Vehicle Tracking Cell Settings (إعدادات خلية التتبع GPS) */}
          <div className="bg-white/5 border border-amber-400/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-bold text-xs">🛰️ إعدادات خلية التتبع المباشر GPS:</span>
                <span className="text-[10px] text-white/60">(تاكسي، موتوسيكل، ليموزين، باص، نقل ثقيل)</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={!!trackingCell?.enabled}
                  onChange={(e) => setTrackingCell({
                    enabled: e.target.checked,
                    vehicleType: trackingCell?.vehicleType || 'taxi',
                    captainName: trackingCell?.captainName || business.name,
                    captainPhone: trackingCell?.captainPhone || business.phone,
                    currentStatus: trackingCell?.currentStatus || 'available',
                    currentArea: trackingCell?.currentArea || `${business.city} - ${business.addr}`,
                    vehiclePlate: trackingCell?.vehiclePlate || 'ط س ق 4821',
                    ratePerKmEgp: trackingCell?.ratePerKmEgp || 6,
                    minimumTripPriceEgp: trackingCell?.minimumTripPriceEgp || 25,
                  })}
                  className="accent-amber-400 rounded"
                />
                <span>تفعيل خلية التتبع المباشر</span>
              </label>
            </div>

            {trackingCell?.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div>
                  <label className="text-[10px] text-white/60 block mb-1">نوع المركبة:</label>
                  <select
                    value={trackingCell.vehicleType}
                    onChange={(e) => setTrackingCell({ ...trackingCell, vehicleType: e.target.value as any })}
                    className="w-full bg-white/10 border border-white/15 rounded-xl p-2 text-xs text-white"
                  >
                    <option value="taxi" className="bg-neutral-900 text-white">تاكسي وأجرة 🚕</option>
                    <option value="motorcycle" className="bg-neutral-900 text-white">موتوسيكل ودليفري 🛵</option>
                    <option value="limousine" className="bg-neutral-900 text-white">ليموزين VIP 🚘</option>
                    <option value="bus_travel" className="bg-neutral-900 text-white">أتوبيس رحلات وعمرة 🚌</option>
                    <option value="heavy_truck" className="bg-neutral-900 text-white">شحن ونقل ثقيل 🚚</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">رقم اللوحة المعدنية:</label>
                  <input
                    type="text"
                    value={trackingCell.vehiclePlate || ''}
                    onChange={(e) => setTrackingCell({ ...trackingCell, vehiclePlate: e.target.value })}
                    placeholder="ط س ق 4821"
                    className="w-full bg-white/10 border border-white/15 rounded-xl p-2 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-white/60 block mb-1">اسم الكابتن والسائق:</label>
                  <input
                    type="text"
                    value={trackingCell.captainName || ''}
                    onChange={(e) => setTrackingCell({ ...trackingCell, captainName: e.target.value })}
                    placeholder="اسم الكابتن"
                    className="w-full bg-white/10 border border-white/15 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Soundtrack & Audio Library (تحكم الإدارة والمشترك في الموسيقى والكتم) */}
          <div className="pt-2 border-t border-white/5">
            <SoundtrackSelector
              value={soundtrack}
              onChange={(st) => setSoundtrack(st)}
              onRemove={() => setSoundtrack(undefined)}
              lang={lang}
              isAdmin={true}
            />
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-xl text-white font-black shadow-lg transition cursor-pointer flex items-center gap-1.5 ${
                isOwnerMode 
                  ? 'bg-gradient-to-r from-[#FF6B35] to-[#FFD700] text-black shadow-orange-600/30 hover:brightness-110'
                  : 'bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-600/30 hover:brightness-110'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>{isOwnerMode ? 'حفظ ونشر تعديلاتي 💾' : 'حفظ جميع التعديلات 💾'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Interactive Presentation Builder Modal */}
      {isPresentationBuilderOpen && (
        <InteractivePresentationBuilderModal
          business={business}
          onClose={() => setIsPresentationBuilderOpen(false)}
          onSave={(updatedPres) => {
            setInteractivePresentation(updatedPres);
            setIsPresentationBuilderOpen(false);
          }}
          lang={lang}
        />
      )}

      {/* External Video Importer Modal (Google / Desktop with Compression & Quotas) */}
      {isImporterModalOpen && (
        <ExternalVideoImporterModal
          currentVideosCount={videos.length}
          pkgTier={pkg}
          onClose={() => setIsImporterModalOpen(false)}
          onAddVideo={(newUrl) => {
            setVideos((prev) => [...prev, newUrl]);
            setIsImporterModalOpen(false);
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
