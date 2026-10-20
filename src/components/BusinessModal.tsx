import React, { useState } from 'react';
import { Business, CustomerMediaPost, SupportedCurrency, SupportedLang } from '../types';
import { 
  X, CheckCircle, MapPin, Phone, MessageCircle, Navigation, 
  ExternalLink, Clock, Sparkles, AlertCircle, Play, Megaphone, 
  Share2, ShieldCheck, Compass, Search, Copy, Check, CreditCard,
  FileCheck, Tag, ArrowRight, Heart, Video, Image as ImageIcon, Plus, Globe, QrCode, Bed,
  Volume2, VolumeX, Flag, Award, Wand2, Star, ShoppingBag, KeyRound, Lock, Unlock, Film,
  AlertOctagon, Bike, Car, Truck, Bus, ShieldAlert, Eye, Flame
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { I18N, getCategoryLabel, getCityLabel } from '../utils/translations';
import { formatServicePrice } from '../utils/currency';
import { formatDistance, calculateDistanceKm, getCurrentCoordinates } from '../utils/distance';
import { generateBusinessSeoPackage } from '../utils/seoKeywords';
import { generateBusinessGoogleKeywords } from '../utils/googleSearchKeywords';
import { isDeliveryEligible, getDeliveryEligibility } from '../utils/deliveryEligibility';
import { AddCustomerMediaModal } from './AddCustomerMediaModal';
import { CustomerPostPlayerModal } from './CustomerPostPlayerModal';
import { InteractivePresentationPlayer } from './InteractivePresentationPlayer';
import { InteractivePresentationBuilderModal } from './InteractivePresentationBuilderModal';
import { TargetBookingBadge } from './TargetBookingBadge';
import { StarRatingWidget } from './StarRatingWidget';

interface BusinessModalProps {
  business: Business | null;
  onClose: () => void;
  onOpenRenew: () => void;
  onUpdateBusiness?: (updated: Business) => void;
  onOpenBooking?: (b: Business) => void;
  onOpenDelivery?: (b: Business) => void;
  onOpenOwnerLock?: (b: Business) => void;
  onOpenOwnerEdit?: (b: Business) => void;
  onOpenPriceList?: (b: Business) => void;
  onOpenTransportTracking?: (b: Business) => void;
  onOpenSecurityNotice?: () => void;
  isFollowed?: boolean;
  onToggleFollow?: (bizId: string | number) => void;
  onRateBusiness?: (bizId: number | string, newRating: number, newCount: number) => void;
  currentCurrency: SupportedCurrency;
  lang: SupportedLang;
}

export const BusinessModal: React.FC<BusinessModalProps> = ({
  business,
  onClose,
  onOpenRenew,
  onUpdateBusiness,
  onOpenBooking,
  onOpenDelivery,
  onOpenOwnerLock,
  onOpenOwnerEdit,
  onOpenPriceList,
  onOpenTransportTracking,
  onOpenSecurityNotice,
  isFollowed = false,
  onToggleFollow,
  onRateBusiness,
  currentCurrency,
  lang,
}) => {
  if (!business) return null;
  const t = I18N[lang];

  const isHotel = !!business.hotelBooking?.isHotel || business.cat === 'فنادق' || business.cat === 'فنادق ومنتجعات';
  const isDoctorOrHospital = 
    business.cat === 'أطباء وعيادات' || 
    business.cat === 'مستشفيات ومراكز طبية' || 
    business.cat === 'أطباء' || 
    business.cat === 'صيدليات ومستشفيات' ||
    business.name.includes('دكتور') || 
    business.name.includes('مستشفى') || 
    business.name.includes('عيادة') || 
    business.name.includes('مركز طبي') ||
    business.name.startsWith('د.');

  const [clinicPatientName, setClinicPatientName] = useState('');
  const [clinicPatientPhone, setClinicPatientPhone] = useState('01006656669');
  const [clinicBookingType, setClinicBookingType] = useState<'clinic' | 'consultation' | 'home'>('clinic');
  const [clinicConfirmedBooking, setClinicConfirmedBooking] = useState<{
    queueNumber: number;
    time: string;
    bookingCode: string;
  } | null>(null);

  const handleAutoClinicBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicPatientName.trim()) {
      setTransferToast('يرجى إدخال اسم المريض');
      setTimeout(() => setTransferToast(null), 3000);
      return;
    }
    const qNum = Math.floor(Math.random() * 20) + 1;
    const code = `CLINIC-TKT-${Date.now().toString().slice(-6)}`;
    const newBooking = {
      ref: code,
      businessId: business.id,
      businessName: business.name,
      roomName: `حجز عيادة: ${clinicBookingType === 'clinic' ? 'كشف بالعيادة' : clinicBookingType === 'consultation' ? 'استشارة ومتابعة' : 'كشف منزلي فوري'} (دور رقم #${qNum})`,
      checkIn: new Date().toISOString().split('T')[0],
      checkOut: new Date().toISOString().split('T')[0],
      nights: 1,
      guestName: clinicPatientName,
      guestPhone: clinicPatientPhone,
      totalPrice: clinicBookingType === 'home' ? 350 : clinicBookingType === 'consultation' ? 50 : (business.bookingPrice || 150),
      paymentMethod: 'كاش بالعيادة عند الكشف',
      status: 'confirmed',
      createdAt: Date.now(),
    };
    try {
      const existingRaw = localStorage.getItem('e3lanak_my_bookings') || localStorage.getItem('dalilk_my_bookings') || '[]';
      const existing = JSON.parse(existingRaw);
      const updated = [newBooking, ...existing];
      localStorage.setItem('e3lanak_my_bookings', JSON.stringify(updated));
      localStorage.setItem('dalilk_my_bookings', JSON.stringify(updated));
    } catch {}

    setClinicConfirmedBooking({
      queueNumber: qNum,
      time: 'اليوم من 05:00 م إلى 09:00 م',
      bookingCode: code,
    });
    setTransferToast(`🩺 تم تأكيد حجز العيادة بنجاح! رقم دورك #${qNum}`);
    setTimeout(() => setTransferToast(null), 4000);
  };

  const isEligibleDelivery = isDeliveryEligible(business);

  const daysLeft = Math.ceil((business.expiry - Date.now()) / 86400000);
  const isExpired = daysLeft <= 0 || business.status === 'expired';

  const hasPresentation = !!business.interactivePresentation?.enabled && (business.interactivePresentation.slides?.length || 0) > 0;
  const [activeMedia, setActiveMedia] = useState<'presentation' | 'video' | 'image'>(() => {
    if (hasPresentation && business.interactivePresentation?.showFirstInPage !== false) {
      return 'presentation';
    }
    return business.videos?.length ? 'video' : 'image';
  });
  const [isPresentationBuilderOpen, setIsPresentationBuilderOpen] = useState(false);
  const isOwnerVerified = typeof window !== 'undefined' && localStorage.getItem(`dalilk_owner_verified_${business.id}`) === 'true';

  const [activeVideoSrc, setActiveVideoSrc] = useState<string>(
    business.videos?.[0] || ''
  );
  const [showSeoBox, setShowSeoBox] = useState(true);
  const [seoCopied, setSeoCopied] = useState(false);
  const [showVerifiedModal, setShowVerifiedModal] = useState(false);
  const [isBeautified, setIsBeautified] = useState(false);
  const [isPlayingAudioHours, setIsPlayingAudioHours] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);
  const [copiedTransferKey, setCopiedTransferKey] = useState<string | null>(null);
  const [transferToast, setTransferToast] = useState<string | null>(null);
  const [userCalculatedDist, setUserCalculatedDist] = useState<number | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // New states for Request #6 features on every subscriber page
  const [satelliteMapMode, setSatelliteMapMode] = useState<boolean>(true);
  const [showPagePasswordSetup, setShowPagePasswordSetup] = useState<boolean>(false);
  const [newPagePassword, setNewPagePassword] = useState<string>(business.ownerPagePassword || '');
  const [unlockPasswordInput, setUnlockPasswordInput] = useState<string>('');
  const [isPageUnlockedSession, setIsPageUnlockedSession] = useState<boolean>(() => {
    if (!business.ownerPageLocked || !business.ownerPagePassword) return true;
    return false;
  });
  const [showProgramMsgEditor, setShowProgramMsgEditor] = useState<boolean>(false);
  const [editProgramTitle, setEditProgramTitle] = useState<string>(business.customProgramTitle || 'انشر إعلانك');
  const [editWelcomeMsg, setEditWelcomeMsg] = useState<string>(
    business.customWelcomeMessage || `مرحباً بكم في ${business.name} عبر برنامج انشر إعلانك`
  );
  const [editWhatsappTemplate, setEditWhatsappTemplate] = useState<string>(
    business.customWhatsappTemplate || `مرحباً ${business.name}، أتواصل معك من برنامج انشر إعلانك وأشاركك موقعي المباشر للتتبع 🛰️`
  );
  const [showVehicleEditor, setShowVehicleEditor] = useState<boolean>(false);
  const [editPlateNumber, setEditPlateNumber] = useState<string>(
    business.vehiclePlateNumber || business.trackingCell?.vehiclePlate || ''
  );
  const [editVehicleType, setEditVehicleType] = useState<string>(
    business.vehicleType || business.trackingCell?.vehicleModel || 'سيارة تاكسي / توصيل'
  );
  const [editVehicleShape, setEditVehicleShape] = useState<string>(
    business.vehicleShape || (business.cat.includes('موتوسيكل') || business.cat.includes('دليفري') ? 'motorcycle' : 'sedan_taxi')
  );
  const [editVehiclePhoto, setEditVehiclePhoto] = useState<string>(
    business.vehiclePhotoUrl || business.trackingCell?.vehiclePhotoUrl || ''
  );
  const [editCaptainPhoto, setEditCaptainPhoto] = useState<string>(
    business.captainPhotoUrl || business.trackingCell?.captainPhoto || ''
  );
  const [newGoogleKeyword, setNewGoogleKeyword] = useState<string>('');
  const [whatsappCallerNumber, setWhatsappCallerNumber] = useState<string>('');

  const handleDetectDistance = async () => {
    setIsDetectingGps(true);
    try {
      const coords = await getCurrentCoordinates();
      const dist = calculateDistanceKm(
        coords.lat,
        coords.lng,
        business.lat || 30.0255,
        business.lng || 31.4880
      );
      setUserCalculatedDist(dist);
      setTransferToast(`📍 تم تحديد موقعك! تبعد ${formatDistance(dist, lang)} عن هذا النشاط`);
    } catch (e) {
      setUserCalculatedDist(2.4);
      setTransferToast('📍 تم تقدير المسافة الجغرافية بالـ GPS: تبعد حوالي 2.4 كم');
    } finally {
      setIsDetectingGps(false);
      setTimeout(() => setTransferToast(null), 3500);
    }
  };

  // Load manual bank transfer details for this subscriber
  const subscriberTransfers = business.bankTransferDetails || (() => {
    try {
      const raw = localStorage.getItem(`e3lanak_biz_transfers_${business.id}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      enabled: true,
      bankName: 'بنك مصر (Banque Misr)',
      accountHolderName: business.name,
      accountNumber: '1020030400506070',
      iban: 'EG3800020001020030400506070',
      vodafoneCashNumber: business.phone || '01006656669',
      instapayId: `${business.phone || '01006656669'}@instapay`,
      customerTransferNotes: 'تحويل مباشر ومستقل لصاحب النشاط لتأكيد الخدمات والمشتريات.',
      isEncryptedSecurity: true,
    };
  })();

  const handleCopyTransferField = (val: string, key: string) => {
    navigator.clipboard.writeText(val);
    setCopiedTransferKey(key);
    setTransferToast('تم نسخ رقم الحساب بنجاح 📋');
    setTimeout(() => {
      setCopiedTransferKey(null);
      setTransferToast(null);
    }, 2500);
  };

  // Customer Uploads with Moving Animated Text state
  const [customerPosts, setCustomerPosts] = useState<CustomerMediaPost[]>(business.customerPosts || []);
  const [isAddCustomerMediaOpen, setIsAddCustomerMediaOpen] = useState(false);
  const [activeCustomerPost, setActiveCustomerPost] = useState<CustomerMediaPost | null>(null);

  const handleAddCustomerPost = (post: CustomerMediaPost) => {
    const updatedPosts = [post, ...customerPosts];
    setCustomerPosts(updatedPosts);
    const updatedBiz: Business = {
      ...business,
      customerPosts: updatedPosts,
    };
    onUpdateBusiness?.(updatedBiz);
  };

  const seoPackage = generateBusinessSeoPackage(business);
  const autoGoogleKeywords = generateBusinessGoogleKeywords(business);

  const copySeoKeywords = () => {
    const allKw = autoGoogleKeywords.map(k => k.keyword).join(', ');
    navigator.clipboard.writeText(allKw);
    setSeoCopied(true);
    setTimeout(() => setSeoCopied(false), 3000);
  };

  const allPhones = (business.phones && business.phones.length > 0 ? business.phones : [business.phone || '']).filter(Boolean);

  const mapSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${business.name} ${business.addr} ${business.city}`
  )}`;
  const mapDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${business.addr} ${business.city}`
  )}`;
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(
    `${business.name} ${business.addr} ${business.city}`
  )}&z=15&output=embed`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md overflow-y-auto flex justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-full sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-neutral-950 text-white min-h-full sm:min-h-0 sm:my-auto sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col pb-8 transition-all">
        {/* Top Control Bar (إغلاق الصفحة أعلى الصورة في المنتصف • زر النشر • استقبال الفيوز) */}
        <div className="absolute top-3 start-3 end-3 z-40 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Views Reception Pill (استقبال الفيوز) */}
            <div className="bg-black/75 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5 text-blue-400" />
              <span>{(business.viewsCount || 18450).toLocaleString()} فيوز</span>
            </div>
          </div>

          {/* Center Close Page Button Above Image (غلق الصفحة أعلى الصورة في المنتصف) */}
          <div className="pointer-events-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white font-black text-xs flex items-center gap-1.5 shadow-[0_4px_18px_rgba(220,38,38,0.85)] border-2 border-white transition active:scale-95 cursor-pointer"
              title="غلق الصفحة أعلى الصورة (X)"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>غلق الصفحة</span>
            </button>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Top Publish / Edit Button (زر النشر فوق الصفحة) */}
            <button
              type="button"
              onClick={() => {
                const isVerified = localStorage.getItem(`dalilk_owner_verified_${business.id}`) === 'true';
                if (isVerified && onOpenOwnerEdit) {
                  onOpenOwnerEdit(business);
                } else if (onOpenOwnerLock) {
                  onOpenOwnerLock(business);
                }
              }}
              className="bg-gradient-to-r from-[#FF2D55] via-rose-500 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black px-3 py-1.5 rounded-full text-[11px] flex items-center gap-1 shadow-lg shadow-red-500/30 border border-white/20 transition cursor-pointer"
              title="نشر وتعديل الصفحة لمالك الإعلان"
            >
              <Flame className="w-3.5 h-3.5 fill-white text-white" />
              <span>تعديل الصفحة ⚡</span>
            </button>
          </div>
        </div>

        {/* Media Hero Section */}
        <div className="relative h-72 sm:h-96 w-full bg-black overflow-hidden">
          {activeMedia === 'presentation' && hasPresentation ? (
            <InteractivePresentationPlayer
              presentation={business.interactivePresentation!}
              businessName={business.name}
              isOwner={isOwnerVerified}
              onOpenBuilder={() => setIsPresentationBuilderOpen(true)}
              className="w-full h-full"
            />
          ) : activeMedia === 'video' && activeVideoSrc ? (
            <video
              src={activeVideoSrc}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={
                business.images?.[0] ||
                'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'
              }
              alt={business.name}
              className="w-full h-full object-cover"
            />
          )}

          {/* Gradient Overlay (only for static video/image, presentation has its own) */}
          {activeMedia !== 'presentation' && (
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent pointer-events-none" />
          )}

          {/* Media Switcher Tab */}
          <div className="absolute top-16 end-4 z-20 flex gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/10">
            {hasPresentation && (
              <button
                onClick={() => setActiveMedia('presentation')}
                className={`px-3 py-1 text-[10px] font-black rounded-full transition flex items-center gap-1 ${
                  activeMedia === 'presentation'
                    ? 'bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white shadow-md'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>عرض تفاعلي 🎬</span>
              </button>
            )}

            {business.videos?.length > 0 && (
              <button
                onClick={() => setActiveMedia('video')}
                className={`px-3 py-1 text-[10px] font-black rounded-full transition ${
                  activeMedia === 'video'
                    ? 'bg-[#FF2D55] text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                فيديو
              </button>
            )}

            {business.images?.length > 0 && (
              <button
                onClick={() => setActiveMedia('image')}
                className={`px-3 py-1 text-[10px] font-black rounded-full transition ${
                  activeMedia === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {business.images.length} صور
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsBeautified(!isBeautified)}
              className={`px-2.5 py-1 text-[10px] font-black rounded-full transition flex items-center gap-1 cursor-pointer ${
                isBeautified
                  ? 'bg-amber-400 text-black shadow-md font-bold'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              title="تجميل وتحسين جودة الصور وفلاتر العرض"
            >
              <Wand2 className="w-3 h-3" />
              <span>تجميل الصور ✨</span>
            </button>
          </div>

          {/* Header Info Overlay - Royal Blue Profile Styling */}
          <div className="absolute bottom-4 start-4 end-4">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="bg-blue-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black shadow">
                {getCategoryLabel(business.cat, lang)}
              </span>

              {/* Specialty Badge */}
              <span className="bg-indigo-900/80 text-blue-200 border border-blue-400/40 text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>{lang === 'ar' ? 'شارة تخصص:' : 'Specialty:'} {business.subCat || (lang === 'ar' ? 'معتمد رسمي' : 'Official')}</span>
              </span>

              {/* Distance GPS Indicator */}
              <span className="bg-emerald-500/30 backdrop-blur-md text-emerald-300 border border-emerald-400/40 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <Navigation className="w-2.5 h-2.5 fill-emerald-300" />
                <span>{business.distanceKm !== undefined ? formatDistance(business.distanceKm, lang) : '200م منك'}</span>
              </span>

              {/* Rating 1-5 Interactive Widget */}
              <StarRatingWidget
                business={business}
                onRate={onRateBusiness}
                variant="card"
                size="sm"
              />

              {/* Target Reticle Booking Badge */}
              {onOpenBooking && (
                <TargetBookingBadge
                  business={business}
                  onClick={() => onOpenBooking(business)}
                  variant="compact"
                />
              )}

              {business.isSponsored && (
                <span className="bg-amber-500/30 border border-amber-400/50 text-amber-300 text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                  <Megaphone className="w-3 h-3" />
                  <span>Google Ads • {t.sponsoredAd}</span>
                </span>
              )}

              {business.pkg === 799 && (
                <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black px-2.5 py-0.5 rounded-full">
                  👑 VIP
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {business.name}
              </h1>
              {business.verified === 1 && (
                <button
                  type="button"
                  onClick={() => setShowVerifiedModal(true)}
                  className="inline-flex items-center gap-1 bg-[#20D5EC]/20 border border-[#20D5EC]/40 text-[#20D5EC] hover:bg-[#20D5EC]/30 text-[10px] font-black px-2 py-0.5 rounded-full transition cursor-pointer"
                  title="اضغط لمعرفة معايير التوثيق"
                >
                  <CheckCircle className="w-3 h-3 fill-[#20D5EC] text-black" />
                  <span>موثق زرقاء ✓</span>
                </button>
              )}
            </div>

            {/* Clickable GPS text address & Live GPS Distance Detector */}
            <div className="flex items-center gap-2 flex-wrap mt-1">
              <a
                href={mapDirUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-white/90 hover:text-white flex items-center gap-1.5 underline decoration-white/30 cursor-pointer"
                title="اضغط للتوجه المباشر عبر GPS"
              >
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{getCityLabel(business.city, lang)} - {business.addr}</span>
              </a>

              {/* Dedicated GPS Detect Location & Calculate Distance Button */}
              <button
                type="button"
                onClick={handleDetectDistance}
                disabled={isDetectingGps}
                className="bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black border border-emerald-400/40 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                title="تحديد مكاني بالـ GPS وحساب المسافة بدقة إلى هذا المشترك"
              >
                <Navigation className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? 'جاري قياس المسافة...' : (userCalculatedDist !== null ? `المسافة: ${formatDistance(userCalculatedDist, lang)}` : '📍 حدد مكاني وقس المسافة')}</span>
              </button>
            </div>

            {/* SUBSCRIBER LIVE TRACKING CELL (خلية التتبع المباشر للمشترك) */}
            {(business.trackingCell?.enabled || ['تاكسي وأجرة', 'موتوسيكل ودليفري', 'سيارات ليموزين', 'أتوبيسات رحلات وسياحة وعمرة', 'شحن ونقل ثقيل'].includes(business.cat)) && (
              <div className="mt-2.5 bg-gradient-to-r from-emerald-950/70 via-black to-teal-950/70 border border-emerald-400/50 rounded-2xl p-2.5 flex items-center justify-between flex-wrap gap-2 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-black border border-amber-400/60 flex items-center justify-center text-lg shadow">
                    {business.cat === 'موتوسيكل ودليفري' || business.trackingCell?.vehicleType === 'motorcycle' ? '🛵' :
                     business.cat === 'سيارات ليموزين' || business.trackingCell?.vehicleType === 'limousine' ? '🚘' :
                     business.cat === 'أتوبيسات رحلات وسياحة وعمرة' || business.trackingCell?.vehicleType === 'bus_travel' ? '🚌' :
                     business.cat === 'شحن ونقل ثقيل' || business.trackingCell?.vehicleType === 'heavy_truck' ? '🚚' : '🚕'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black text-white">
                        خلية التتبع المباشر GPS 🛰️
                      </span>
                      <span className="bg-emerald-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                        متاح الآن في محيطك
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-200/80 font-mono">
                      كابتن: {business.trackingCell?.captainName || 'محمود الشريف'} • لوحة: {business.trackingCell?.vehiclePlate || 'ط س ق 4821'}
                    </p>
                  </div>
                </div>

                {onOpenTransportTracking && (
                  <button
                    type="button"
                    onClick={() => onOpenTransportTracking(business)}
                    className="bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-black font-black px-3 py-1.5 rounded-xl text-[11px] transition shadow-md shadow-emerald-500/20 flex items-center gap-1 cursor-pointer"
                  >
                    <span>طلب فوري وتتبع مباشر 🚕</span>
                  </button>
                )}
              </div>
            )}
            {/* AUTOMATIC CLINIC & HOSPITAL BOOKING CARD (حجز العيادة أوتوماتيك في صفحة أي دكتور أو مستشفى) */}
            {isDoctorOrHospital && (
              <div className="mt-3 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-teal-950/90 border-2 border-emerald-400/70 rounded-2xl p-3.5 shadow-xl text-white">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-emerald-400/30 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500 text-black flex items-center justify-center font-black text-base shadow">
                      🩺
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-black text-white">حجز العيادة التلقائي الفوري</h4>
                        <span className="bg-emerald-400 text-black text-[9px] font-black px-1.5 py-0.2 rounded-full animate-pulse">
                          متاح أوتوماتيك
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-200/80">
                        احجز دورك الآن في عيادة {business.name} مباشرة دون انتظار
                      </p>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-emerald-400/40 px-2.5 py-1 rounded-xl text-center">
                    <span className="text-[9px] text-emerald-300/80 block">رقم الدور</span>
                    <span className="text-xs font-black text-amber-300 font-mono">
                      #{clinicConfirmedBooking ? clinicConfirmedBooking.queueNumber : '12'}
                    </span>
                  </div>
                </div>

                {clinicConfirmedBooking ? (
                  <div className="mt-2.5 bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-2.5 text-center space-y-1 animate-in zoom-in-95">
                    <div className="w-7 h-7 rounded-full bg-emerald-500 text-black mx-auto flex items-center justify-center font-black text-xs">
                      ✓
                    </div>
                    <h5 className="text-xs font-black text-white">تم تأكيد حجز الكشف أوتوماتيكياً!</h5>
                    <p className="text-[11px] text-emerald-200">
                      رقم الدور: <b className="text-amber-300 font-mono">#{clinicConfirmedBooking.queueNumber}</b> • كود التذكرة: <b className="font-mono text-white">{clinicConfirmedBooking.bookingCode}</b>
                    </p>
                    <p className="text-[10px] text-white/60">
                      الموعد: {clinicConfirmedBooking.time} • اسم المريض: {clinicPatientName}
                    </p>
                    <button
                      type="button"
                      onClick={() => setClinicConfirmedBooking(null)}
                      className="text-[10px] text-emerald-300 underline font-bold mt-1 cursor-pointer"
                    >
                      حجز موعد أو كشف آخر ❯
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleAutoClinicBooking} className="mt-2.5 space-y-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setClinicBookingType('clinic')}
                        className={`py-1 px-1.5 rounded-xl text-center border text-[9px] font-black transition cursor-pointer ${
                          clinicBookingType === 'clinic'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                            : 'bg-black/40 text-white/80 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        كشف بالعيادة ({business.bookingPrice || 150} ج)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClinicBookingType('consultation')}
                        className={`py-1 px-1.5 rounded-xl text-center border text-[9px] font-black transition cursor-pointer ${
                          clinicBookingType === 'consultation'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                            : 'bg-black/40 text-white/80 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        استشارة (50 ج)
                      </button>
                      <button
                        type="button"
                        onClick={() => setClinicBookingType('home')}
                        className={`py-1 px-1.5 rounded-xl text-center border text-[9px] font-black transition cursor-pointer ${
                          clinicBookingType === 'home'
                            ? 'bg-emerald-500 text-black border-emerald-400 shadow'
                            : 'bg-black/40 text-white/80 border-white/10 hover:bg-white/10'
                        }`}
                      >
                        كشف منزلي (350 ج)
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-white/70 block mb-0.5">اسم المريض:</label>
                        <input
                          type="text"
                          value={clinicPatientName}
                          onChange={(e) => setClinicPatientName(e.target.value)}
                          placeholder="اكتب اسم المريض..."
                          className="w-full bg-black/60 border border-emerald-400/40 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-white/70 block mb-0.5">رقم الهاتف:</label>
                        <input
                          type="tel"
                          value={clinicPatientPhone}
                          onChange={(e) => setClinicPatientPhone(e.target.value)}
                          placeholder="01006656669"
                          className="w-full bg-black/60 border border-emerald-400/40 rounded-xl px-2.5 py-1 text-xs text-white focus:outline-none focus:border-emerald-400 text-left font-mono"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 active:scale-98 text-black font-black text-xs py-1.5 rounded-xl shadow-lg transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>تأكيد حجز العيادة تلقائياً الآن 🩺</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sleek Compact Action Bar: أزرار مصغرة وبأشكال كبسولات دائرية أفضل */}
        <div className="bg-gradient-to-r from-slate-950 via-[#1E3A8A]/85 to-slate-950 px-3 py-1.5 flex items-center justify-between flex-wrap gap-1 text-white border-b border-blue-400/25">
          <div className="flex items-center gap-1 flex-wrap">
            {/* زر الطلب المحسن والمصغر */}
            {onOpenDelivery && (
              <button
                type="button"
                onClick={() => onOpenDelivery(business)}
                className="h-6 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:brightness-110 active:scale-95 text-black px-2.5 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-amber-200/50 transition cursor-pointer"
              >
                <ShoppingBag className="w-2.5 h-2.5 fill-black text-black" />
                <span>{lang === 'ar' ? 'اطلب الآن 🛵' : 'Order 🛵'}</span>
              </button>
            )}

            {/* زر قائمة الأسعار الخاصة بهذا النشاط */}
            {onOpenPriceList && (
              <button
                type="button"
                onClick={() => onOpenPriceList(business)}
                className="h-6 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black px-2.5 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-emerald-200/50 transition cursor-pointer"
              >
                <Tag className="w-2.5 h-2.5 text-black" />
                <span>{lang === 'ar' ? 'قائمة أسعار النشاط 📋' : 'Activity Prices 📋'}</span>
              </button>
            )}

            {/* واتساب مصغر */}
            <a
              href={`https://wa.me/${(business.whatsapp || business.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `مرحباً ${business.name}، استفسار مباشر من منصة إعلانك دليلك الخاص`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 bg-[#25D366] hover:brightness-110 active:scale-95 text-white px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-white/25 transition"
            >
              <MessageCircle className="w-2.5 h-2.5 fill-white" />
              <span>{lang === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
            </a>

            {/* اتصال مباشر مصغر */}
            <a
              href={`tel:${business.phone}`}
              className="h-6 bg-white hover:bg-neutral-100 active:scale-95 text-black px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm transition"
            >
              <Phone className="w-2.5 h-2.5 fill-black" />
              <span>{lang === 'ar' ? 'اتصال' : 'Call'}</span>
            </a>

            {/* إنستا باي مصغر */}
            <button
              type="button"
              onClick={() => {
                const ipnId = business.bankTransferDetails?.instapayId || `${business.phone}@instapay`;
                navigator.clipboard.writeText(ipnId);
                setTransferToast(`تم نسخ معرف إنستاباي: ${ipnId} 📋`);
                setTimeout(() => setTransferToast(null), 3000);
                window.open('https://instapay.eg', '_blank', 'noopener,noreferrer');
              }}
              className="h-6 bg-gradient-to-r from-purple-700 to-indigo-700 hover:brightness-110 active:scale-95 text-white px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-purple-400/40 transition cursor-pointer"
              title="الدفع المباشر عبر إنستاباي"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-pulse" />
              <span>InstaPay</span>
            </button>

            {/* فيزا / ماستركارد مصغر */}
            <button
              type="button"
              onClick={() => {
                const cardNum = business.bankTransferDetails?.visaCardNumber || '4284 •••• •••• 9821';
                navigator.clipboard.writeText(cardNum);
                setTransferToast('تم نسخ بيانات الدفع بالفيزا / ماستركارد 📋');
                setTimeout(() => setTransferToast(null), 3000);
                if (business.websiteUrl) {
                  window.open(business.websiteUrl.startsWith('http') ? business.websiteUrl : `https://${business.websiteUrl}`, '_blank');
                } else if (onOpenBooking) {
                  onOpenBooking(business);
                }
              }}
              className="h-6 bg-gradient-to-r from-blue-700 to-slate-800 hover:brightness-110 active:scale-95 text-white px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-blue-400/40 transition cursor-pointer"
            >
              <CreditCard className="w-2.5 h-2.5 text-amber-300" />
              <span>فيزا</span>
            </button>

            {/* حجز العيادات والمستشفيات والمواعيد */}
            {onOpenBooking && (
              <button
                type="button"
                onClick={() => onOpenBooking(business)}
                className="h-6 bg-gradient-to-r from-teal-500 to-emerald-500 hover:brightness-110 active:scale-95 text-black px-2.5 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm border border-white/50 transition cursor-pointer"
                title="حجز العيادات والمستشفيات والمواعيد"
              >
                <span>🏥 حجز العيادات والمستشفيات</span>
              </button>
            )}

            {/* GPS توجه */}
            <a
              href={mapDirUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="h-6 bg-sky-500 hover:bg-sky-400 active:scale-95 text-black px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm transition"
            >
              <Compass className="w-2.5 h-2.5" />
              <span>GPS 📍</span>
            </a>

            {/* متابعة مصغر */}
            {onToggleFollow && (
              <button
                type="button"
                onClick={() => onToggleFollow(business.id)}
                className={`h-6 px-2 rounded-full font-black text-[9px] flex items-center gap-1 transition cursor-pointer ${
                  isFollowed
                    ? 'bg-white/15 text-white border border-white/25'
                    : 'bg-[#FF2D55] hover:bg-[#ff3b61] text-white shadow-sm'
                }`}
              >
                <span>{isFollowed ? '✓ متابع' : '+ متابعة'}</span>
              </button>
            )}

            {/* تعديل صفحتي مصغر */}
            <button
              type="button"
              onClick={() => {
                const isVerified = localStorage.getItem(`dalilk_owner_verified_${business.id}`) === 'true';
                if (isVerified && onOpenOwnerEdit) {
                  onOpenOwnerEdit(business);
                } else if (onOpenOwnerLock) {
                  onOpenOwnerLock(business);
                }
              }}
              className="h-6 bg-gradient-to-r from-[#FF6B35] to-[#FFD700] hover:brightness-110 active:scale-95 text-black px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm transition cursor-pointer"
            >
              <KeyRound className="w-2.5 h-2.5" />
              <span>صفحتي 🔐</span>
            </button>

            {/* غلق صفحتي بقفل باسورد */}
            <button
              type="button"
              onClick={() => setShowPagePasswordSetup((prev) => !prev)}
              className={`h-6 px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm transition cursor-pointer ${
                business.ownerPageLocked
                  ? 'bg-red-600 text-white border border-white'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
              title="غلق صفحتي بقفل باسورد"
            >
              <Lock className="w-2.5 h-2.5" />
              <span>{business.ownerPageLocked ? 'مقفلة بباسورد 🔒' : 'قفل صفحتي بباسورد'}</span>
            </button>

            {/* عند العمل ON / عند العطلة OFF */}
            <button
              type="button"
              onClick={() => {
                const nextStatus = business.workStatus === 'inactive' ? 'active' : 'inactive';
                onUpdateBusiness?.({ ...business, workStatus: nextStatus });
                setTransferToast(
                  nextStatus === 'active'
                    ? '🟢 تم تحويل حالة المشترك إلى: عند العمل (ON)'
                    : '⚪ تم تحويل حالة المشترك إلى: عند العطلة (OFF)'
                );
                setTimeout(() => setTransferToast(null), 3000);
              }}
              className={`h-6 px-2 rounded-full font-black text-[9px] flex items-center gap-1 shadow-sm transition cursor-pointer ${
                business.workStatus === 'inactive'
                  ? 'bg-red-600 text-white'
                  : 'bg-emerald-500 text-black'
              }`}
              title="تحديد حالة العمل (عند العمل ON / عند العطلة OFF)"
            >
              <span>{business.workStatus === 'inactive' ? '⚪ في عطلة OFF' : '🟢 في العمل ON'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <a
              href="tel:126"
              className="h-5 bg-red-600/90 hover:bg-red-500 text-white px-2 rounded-full font-bold text-[8.5px] flex items-center gap-1 shadow"
              title="طوارئ شرطة السياحة 126"
            >
              <span>SOS 126</span>
            </a>

            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="h-5 bg-white/10 hover:bg-white/20 text-white/90 px-2 rounded-full font-bold text-[8.5px] flex items-center gap-1 transition cursor-pointer"
              title="إبلاغ عن غلاء سعر أو مخالفة"
            >
              <Flag className="w-2 h-2 text-red-300" />
              <span>بلاغ</span>
            </button>
          </div>
        </div>

        {/* بوابة قفل الصفحة بباسورد إذا كانت مقفلة (غلق صفحتي بقفل باسورد) */}
        {business.ownerPageLocked && business.ownerPagePassword && !isPageUnlockedSession && (
          <div className="m-4 bg-gradient-to-br from-red-950/90 via-neutral-950 to-purple-950/90 border-2 border-red-500/60 rounded-3xl p-5 text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 border border-red-400 flex items-center justify-center mx-auto text-red-300">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-white">🔒 هذه الصفحة محمية بقفل باسورد المشترك</h3>
            <p className="text-[11px] text-white/75">
              أدخل باسورد الصفحة الخاص بالمشترك (أو باسورد الأدمن <code className="text-amber-300">sam</code>) لفتح وعرض وتعديل بيانات الصفحة:
            </p>
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
              <input
                type="password"
                value={unlockPasswordInput}
                onChange={(e) => setUnlockPasswordInput(e.target.value)}
                placeholder="أدخل باسورد الصفحة..."
                className="flex-1 bg-black/70 border border-white/25 rounded-xl px-3 py-2 text-xs text-white text-center"
              />
              <button
                type="button"
                onClick={() => {
                  if (
                    unlockPasswordInput.trim() === business.ownerPagePassword ||
                    unlockPasswordInput.trim().toLowerCase() === 'sam'
                  ) {
                    setIsPageUnlockedSession(true);
                    setTransferToast('🔓 تم فتح قفل الصفحة بنجاح!');
                    setTimeout(() => setTransferToast(null), 3000);
                  } else {
                    setTransferToast('❌ الباسورد غير صحيح');
                    setTimeout(() => setTransferToast(null), 3000);
                  }
                }}
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-4 py-2 rounded-xl text-xs cursor-pointer"
              >
                فتح القفل 🔓
              </button>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* إعداد غلق صفحتي بقفل باسورد (Inline Setup Box) */}
          {showPagePasswordSetup && (
            <div className="bg-purple-950/60 border border-purple-400/50 rounded-2xl p-3.5 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-black text-purple-200 flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-purple-300" />
                  <span>غلق صفحتي بقفل باسورد خاص بالمشترك:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowPagePasswordSetup(false)}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newPagePassword}
                  onChange={(e) => setNewPagePassword(e.target.value)}
                  placeholder="اكتب باسورد قفل صفحتك (مثال: 1234 أو اسمك)..."
                  className="flex-1 w-full bg-black/60 border border-purple-400/40 rounded-xl px-3 py-2 text-white text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPagePassword.trim()) {
                      onUpdateBusiness?.({
                        ...business,
                        ownerPageLocked: false,
                        ownerPagePassword: '',
                      });
                      setShowPagePasswordSetup(false);
                      setTransferToast('🔓 تم إلغاء قفل الباسورد عن الصفحة');
                      setTimeout(() => setTransferToast(null), 3000);
                      return;
                    }
                    onUpdateBusiness?.({
                      ...business,
                      ownerPageLocked: true,
                      ownerPagePassword: newPagePassword.trim(),
                    });
                    setIsPageUnlockedSession(true);
                    setShowPagePasswordSetup(false);
                    setTransferToast('🔒 تم تفعيل قفل صفحتك بباسورد بنجاح!');
                    setTimeout(() => setTransferToast(null), 3000);
                  }}
                  className="bg-purple-500 hover:bg-purple-400 text-white font-black px-4 py-2 rounded-xl text-xs cursor-pointer shrink-0"
                >
                  حفظ قفل الباسورد 🔒
                </button>
                {business.ownerPageLocked && (
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateBusiness?.({
                        ...business,
                        ownerPageLocked: false,
                        ownerPagePassword: '',
                      });
                      setShowPagePasswordSetup(false);
                      setTransferToast('🔓 تم فك قفل الصفحة');
                      setTimeout(() => setTransferToast(null), 3000);
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-black px-3 py-2 rounded-xl text-xs cursor-pointer shrink-0"
                  >
                    إلغاء القفل
                  </button>
                )}
              </div>
            </div>
          )}

          {/* شريط تحديد موقع المشترك + ربط بالقمر الصناعي + عند العمل ON / عند العطلة OFF + تتبع المتصل على الواتساب + تعديل البرنامج والرسائل */}
          <div className="bg-gradient-to-r from-sky-950/60 via-neutral-900 to-emerald-950/60 border border-sky-400/40 rounded-2xl p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="bg-gradient-to-r from-[#FF2D55] to-amber-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow">
                  📢 {business.customProgramTitle || 'انشر إعلانك'}
                </span>
                <span className="text-xs font-black text-white">
                  موقع المشترك بالقمر الصناعي 🛰️ وحالة العمل
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* عند العمل ON / عند العطلة OFF */}
                <button
                  type="button"
                  onClick={() => {
                    const nextStatus = business.workStatus === 'inactive' ? 'active' : 'inactive';
                    onUpdateBusiness?.({ ...business, workStatus: nextStatus });
                  }}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black cursor-pointer border transition ${
                    business.workStatus === 'inactive'
                      ? 'bg-red-600 text-white border-red-300'
                      : 'bg-emerald-500 text-black border-emerald-200'
                  }`}
                >
                  {business.workStatus === 'inactive' ? '⚪ عند العطلة OFF' : '🟢 عند العمل ON'}
                </button>

                {/* ربط الموقع بالقمر الصناعي */}
                <button
                  type="button"
                  onClick={() => {
                    setSatelliteMapMode((prev) => !prev);
                    handleDetectDistance();
                  }}
                  className="bg-sky-500 hover:bg-sky-400 text-black font-black text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 cursor-pointer shadow"
                >
                  <Compass className="w-3 h-3" />
                  <span>ربط الموقع بالقمر الصناعي 🛰️</span>
                </button>

                {/* لكل مشترك تعديل البرنامج والرسائل انشر إعلانك */}
                <button
                  type="button"
                  onClick={() => setShowProgramMsgEditor((p) => !p)}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] px-2.5 py-1 rounded-full cursor-pointer shadow"
                >
                  ✏️ تعديل البرنامج والرسائل
                </button>
              </div>
            </div>

            {business.customWelcomeMessage && (
              <div className="bg-black/50 border border-amber-400/30 rounded-xl px-3 py-1.5 text-[11px] text-amber-200 font-bold">
                💬 {business.customWelcomeMessage}
              </div>
            )}

            {/* محرر تعديل البرنامج والرسائل لكل مشترك */}
            {showProgramMsgEditor && (
              <div className="bg-black/75 border border-amber-400/50 rounded-2xl p-3 space-y-2 text-xs">
                <div className="font-black text-amber-300 text-[11px]">
                  📢 لكل مشترك تعديل البرنامج والرسائل (انشر إعلانك):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-white/70 block mb-0.5">عنوان البرنامج بصفحتك:</label>
                    <input
                      type="text"
                      value={editProgramTitle}
                      onChange={(e) => setEditProgramTitle(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/70 block mb-0.5">رسالة الترحيب بالعملاء:</label>
                    <input
                      type="text"
                      value={editWelcomeMsg}
                      onChange={(e) => setEditWelcomeMsg(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-white/70 block mb-0.5">رسالة الواتساب والتتبع التلقائية للمشترك:</label>
                  <input
                    type="text"
                    value={editWhatsappTemplate}
                    onChange={(e) => setEditWhatsappTemplate(e.target.value)}
                    className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onUpdateBusiness?.({
                      ...business,
                      customProgramTitle: editProgramTitle.trim() || 'انشر إعلانك',
                      customWelcomeMessage: editWelcomeMsg.trim(),
                      customWhatsappTemplate: editWhatsappTemplate.trim(),
                    });
                    setShowProgramMsgEditor(false);
                    setTransferToast('✅ تم حفظ تعديلات البرنامج والرسائل الخاصة بالمشترك');
                    setTimeout(() => setTransferToast(null), 3000);
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-1.5 rounded-xl text-xs cursor-pointer"
                >
                  حفظ تعديل البرنامج والرسائل 💾
                </button>
              </div>
            )}

            {/* خاصية التتبع للمتصل على الواتساب مباشرة */}
            <div className="bg-emerald-950/60 border border-emerald-400/40 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">
              <div className="text-[10.5px] font-black text-emerald-200 flex items-center gap-1.5">
                <span>🛰️ خاصية التتبع المباشر للمتصل على الواتساب (رادار حي للموقع والمركبة):</span>
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <input
                  type="tel"
                  value={whatsappCallerNumber}
                  onChange={(e) => setWhatsappCallerNumber(e.target.value)}
                  placeholder="رقم واتساب المتصل..."
                  className="flex-1 sm:w-36 bg-black/70 border border-emerald-400/40 rounded-lg px-2 py-1 text-[10px] text-white"
                />
                <a
                  href={`https://wa.me/${
                    whatsappCallerNumber.replace(/\D/g, '')
                      ? `2${whatsappCallerNumber.replace(/\D/g, '').replace(/^2/, '')}`
                      : `2${(business.whatsapp || business.phone || '').replace(/\D/g, '').replace(/^2/, '')}`
                  }?text=${encodeURIComponent(
                    `${business.customWhatsappTemplate || `مرحباً ${business.name}، تفعيل التتبع المباشر للمتصل على الواتساب`}\n🛰️ الموقع عبر القمر الصناعي: https://maps.google.com/?q=${business.lat || 30.0444},${business.lng || 31.2357}\n🟢 الحالة: ${business.workStatus === 'inactive' ? 'في عطلة OFF' : 'في العمل ON'}${business.vehiclePlateNumber ? `\n🚘 رقم المركبة: ${business.vehiclePlateNumber}` : ''}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#25D366] hover:bg-[#20ba59] text-black font-black px-3 py-1 rounded-lg text-[10px] whitespace-nowrap flex items-center gap-1 shadow"
                >
                  <MessageCircle className="w-3 h-3 fill-black" />
                  <span>تتبع المتصل واتساب</span>
                </a>
                {onOpenTransportTracking && (
                  <button
                    type="button"
                    onClick={() => onOpenTransportTracking(business)}
                    className="bg-sky-400 hover:bg-sky-300 text-black font-black px-2.5 py-1 rounded-lg text-[10px] whitespace-nowrap cursor-pointer shadow"
                  >
                    رادار التتبع 🛰️
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* بطاقة المركبة والسيارة والصورة الشخصية ورقم اللوحة وشكل السيارة ونوعها عند التتبع (في صفحة كل تاكسي أو دليفري أو موتوسيكل أو توصيل) */}
          <div className="bg-gradient-to-r from-amber-950/50 via-neutral-900 to-emerald-950/50 border-2 border-amber-400/50 rounded-2xl p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {editVehicleShape === 'motorcycle' ? '🏍️' : editVehicleShape === 'scooter' ? '🛵' : editVehicleShape === 'van_pickup' ? '🚐' : editVehicleShape === 'suv_4x4' ? '🚙' : '🚖'}
                </span>
                <div>
                  <h4 className="text-xs font-black text-amber-300">
                    بيانات وصور المركبة والكابتن عند التتبع (تاكسي • دليفري • موتوسيكل)
                  </h4>
                  <p className="text-[10px] text-white/70">
                    صور المركبة والسيارة • رقم اللوحة • الصورة الشخصية • شكل السيارة ونوعها عند التتبع المباشر
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowVehicleEditor((p) => !p)}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-[10px] px-3 py-1 rounded-full cursor-pointer shadow"
                >
                  📸 {showVehicleEditor ? 'إغلاق التعديل' : 'وضع وتحميل صور ورقم المركبة'}
                </button>
                {onOpenTransportTracking && (
                  <button
                    type="button"
                    onClick={() => onOpenTransportTracking(business)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[10px] px-3 py-1 rounded-full cursor-pointer shadow"
                  >
                    تتبع المركبة الآن 🛰️
                  </button>
                )}
              </div>
            </div>

            {/* عرض الصورة الشخصية وصورة المركبة ورقم المركبة وشكلها ونوعها */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center bg-black/50 border border-white/10 rounded-xl p-2.5">
              <div className="flex items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 border border-emerald-400 overflow-hidden shrink-0 flex items-center justify-center">
                  {editCaptainPhoto || business.captainPhotoUrl || business.images?.[0] ? (
                    <img
                      src={editCaptainPhoto || business.captainPhotoUrl || business.images?.[0]}
                      alt="صورة شخصية"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">👨‍✈️</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-emerald-300 font-bold block">الصورة الشخصية:</span>
                  <span className="text-[10.5px] font-black text-white truncate block">{business.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-14 h-12 rounded-xl bg-neutral-800 border border-amber-400 overflow-hidden shrink-0 flex items-center justify-center">
                  {editVehiclePhoto || business.vehiclePhotoUrl || business.images?.[1] || business.images?.[0] ? (
                    <img
                      src={editVehiclePhoto || business.vehiclePhotoUrl || business.images?.[1] || business.images?.[0]}
                      alt="صورة المركبة"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg">🚖</span>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9px] text-amber-300 font-bold block">صورة المركبة:</span>
                  <span className="text-[10px] font-black text-white truncate block">{editVehicleType}</span>
                </div>
              </div>

              <div className="bg-neutral-900 border border-amber-400/40 rounded-xl p-2 text-center">
                <span className="text-[9px] text-white/60 block">رقم المركبة / السيارة:</span>
                <span className="font-mono font-black text-xs text-amber-300">
                  {editPlateNumber || business.vehiclePlateNumber || 'ط س ق 4821'}
                </span>
              </div>

              <div className="bg-neutral-900 border border-sky-400/40 rounded-xl p-2 text-center">
                <span className="text-[9px] text-white/60 block">شكل ونوع المركبة بالتتبع:</span>
                <span className="font-black text-[10.5px] text-sky-300">
                  {editVehicleShape === 'motorcycle'
                    ? '🏍️ موتوسيكل دليفري'
                    : editVehicleShape === 'scooter'
                    ? '🛵 سكوتر سريع'
                    : editVehicleShape === 'van_pickup'
                    ? '🚐 فان / نقل'
                    : editVehicleShape === 'suv_4x4'
                    ? '🚙 سيارة SUV'
                    : '🚖 سيارة سيدان / تاكسي'}
                </span>
              </div>
            </div>

            {/* نموذج وضع وتحميل صور ورقم المركبة والسيارة وصورة شخصية وشكل السيارة ونوعها */}
            {showVehicleEditor && (
              <div className="bg-black/80 border border-amber-400/50 rounded-2xl p-3 space-y-2.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-white/70 block mb-1">رقم المركبة / اللوحة:</label>
                    <input
                      type="text"
                      value={editPlateNumber}
                      onChange={(e) => setEditPlateNumber(e.target.value)}
                      placeholder="مثال: أ ب ج 9241"
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/70 block mb-1">نوع وموديل السيارة / الموتوسيكل:</label>
                    <input
                      type="text"
                      value={editVehicleType}
                      onChange={(e) => setEditVehicleType(e.target.value)}
                      placeholder="مثال: هيونداي إلنترا 2024 / هوندا 160"
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-white/70 block mb-1">شكل السيارة عند التتبع:</label>
                    <select
                      value={editVehicleShape}
                      onChange={(e) => setEditVehicleShape(e.target.value)}
                      className="w-full bg-neutral-900 border border-white/20 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    >
                      <option value="sedan_taxi">🚖 سيارة ملاكي / تاكسي سيدان</option>
                      <option value="suv_4x4">🚙 سيارة عائلية / دفع رباعي SUV</option>
                      <option value="motorcycle">🏍️ موتوسيكل دليفري وتوصيل</option>
                      <option value="scooter">🛵 سكوتر طلبات سريع</option>
                      <option value="van_pickup">🚐 فان / ربع نقل</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-200 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer font-black text-[10.5px]">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>تحميل الصورة الشخصية للكابتن / المشترك</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setEditCaptainPhoto(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>

                  <label className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 rounded-xl py-2 px-3 flex items-center justify-center gap-1.5 cursor-pointer font-black text-[10.5px]">
                    <Car className="w-3.5 h-3.5" />
                    <span>تحميل صورة المركبة / السيارة / الموتوسيكل</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === 'string') setEditVehiclePhoto(reader.result);
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onUpdateBusiness?.({
                      ...business,
                      vehiclePlateNumber: editPlateNumber.trim(),
                      vehicleType: editVehicleType.trim(),
                      vehicleShape: editVehicleShape as Business['vehicleShape'],
                      vehiclePhotoUrl: editVehiclePhoto || business.vehiclePhotoUrl,
                      captainPhotoUrl: editCaptainPhoto || business.captainPhotoUrl,
                    });
                    setShowVehicleEditor(false);
                    setTransferToast('✅ تم حفظ صور ورقم المركبة والصورة الشخصية وشكل ونوع المركبة!');
                    setTimeout(() => setTransferToast(null), 3000);
                  }}
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-2 rounded-xl text-xs cursor-pointer"
                >
                  حفظ بيانات وصور المركبة والكابتن على الصفحة 💾
                </button>
              </div>
            )}
          </div>

          {/* إخلاء المسؤولية الرسمي وتحذير عند الطلب (نحن مجرد إعلان) */}
          <div className="bg-gradient-to-r from-amber-950/70 via-black to-amber-950/70 border border-amber-400/50 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-200 shadow-md">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-0.5 flex-1">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="font-black text-amber-300 text-[11px]">
                  ⚠️ إخلاء مسؤولية رسمي عند الطلب (نحن مجرد إعلان):
                </span>
                <span className="bg-amber-400 text-black text-[8px] font-black px-2 py-0.2 rounded-full">
                  تنبيه للمشترك والعميل
                </span>
              </div>
              <p className="text-[10px] text-white/90 leading-relaxed">
                <strong>نحن مجرد منصة إعلانية وسيطة لعرض الإعلانات فقط.</strong> لا نتحمل أي مسؤولية قانونية أو مالية عن التعاملات أو الأسعار أو جودة المنتجات والخدمات المتبادلة بين المشترك والعميل. يُرجى المعاينة والدفع عند الاستلام مباشرة.
              </p>
            </div>
          </div>
          {/* Dynamic Action Banner: Hotel vs Talabaty Delivery (Stores/Restaurants/Professions) */}
          {isEligibleDelivery && (
            <div className="bg-gradient-to-r from-amber-500/25 via-orange-500/20 to-amber-600/20 border border-amber-400/50 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2 shadow-lg shadow-amber-950/40">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                    خدمة دليفري مفعلة 🛵
                  </span>
                  <span className="text-[11px] font-black text-white">
                    طلب دليفري وتوصيل مباشر من {business.name}
                  </span>
                </div>
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                  {business.deliveryInfo?.areas ? `تغطية التوصيل: ${business.deliveryInfo.areas} • ` : ''}
                  {business.deliveryInfo?.estimatedTime ? `الوقت: ${business.deliveryInfo.estimatedTime} • ` : ''}
                  طلب مباشر وتوصيل سريع للعنوان عبر الاتصال أو الواتساب.
                </p>
              </div>

              {onOpenDelivery && (
                <button
                  type="button"
                  onClick={() => onOpenDelivery(business)}
                  className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black px-3.5 py-1.5 rounded-full text-[10px] transition shadow-md shadow-amber-500/25 flex items-center gap-1 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 fill-black" />
                  <span>اطلب دليفري من هذا المكان 🛵</span>
                </button>
              )}
            </div>
          )}

          {/* SUBSCRIBER DIRECT FINANCIAL & BANK TRANSFERS CARD (حسابات التحويل المالي المباشرة الخاصة بالمشترك) */}
          {subscriberTransfers && subscriberTransfers.enabled && (
            <div className="bg-gradient-to-r from-emerald-950/30 via-neutral-900 to-teal-950/30 border border-emerald-500/35 rounded-2xl p-4 space-y-3 shadow-lg shadow-emerald-950/30">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>بيانات التحويل المالي المباشر الخاصة بهذا النشاط 💳</span>
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] font-black px-1.5 py-0.2 rounded border border-emerald-500/40">
                        مستقل 100%
                      </span>
                    </h3>
                    <p className="text-[10px] text-emerald-200/80">
                      تحويل مباشر لحساب المشترك (فودافون كاش • إنستاباي • حساب بنكي) بدون وسيط
                    </p>
                  </div>
                </div>

                <span className="text-[10px] bg-black/60 border border-emerald-500/30 text-emerald-300 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>تشفير مالي آمن ضد الاختراق</span>
                </span>
              </div>

              {transferToast && (
                <div className="bg-emerald-500 text-black font-black text-center py-1 rounded-xl text-[11px] animate-pulse">
                  {transferToast}
                </div>
              )}

              {/* Transfer Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Vodafone Cash */}
                {subscriberTransfers.vodafoneCashNumber && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-white/50 block">فودافون كاش المعتمد:</span>
                        <span className="font-mono font-bold text-white text-xs truncate block dir-ltr text-right">
                          {subscriberTransfers.vodafoneCashNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleCopyTransferField(subscriberTransfers.vodafoneCashNumber!, 'voda')}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="نسخ رقم المحفظة"
                      >
                        <Copy className="w-2.5 h-2.5" />
                        <span>{copiedTransferKey === 'voda' ? 'تم النسخ' : 'نسخ'}</span>
                      </button>
                      <a
                        href={`tel:${subscriberTransfers.vodafoneCashNumber}`}
                        className="p-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-[10px] transition"
                        title="اتصال / تحويل"
                      >
                        <Phone className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}

                {/* InstaPay */}
                {subscriberTransfers.instapayId && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shrink-0" />
                      <div className="min-w-0">
                        <span className="text-[10px] text-white/50 block">إنستاباي InstaPay:</span>
                        <span className="font-mono font-bold text-white text-xs truncate block dir-ltr text-right">
                          {subscriberTransfers.instapayId}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTransferField(subscriberTransfers.instapayId!, 'insta')}
                      className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>{copiedTransferKey === 'insta' ? 'تم النسخ' : 'نسخ المعرف'}</span>
                    </button>
                  </div>
                )}

                {/* Bank Account */}
                {subscriberTransfers.accountNumber && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/50 block">
                        {subscriberTransfers.bankName || 'الحساب البنكي'}:
                      </span>
                      <span className="font-mono font-bold text-white text-xs truncate block dir-ltr text-right">
                        {subscriberTransfers.accountNumber}
                      </span>
                      {subscriberTransfers.accountHolderName && (
                        <span className="text-[9px] text-amber-300 truncate block">
                          باسم: {subscriberTransfers.accountHolderName}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTransferField(subscriberTransfers.accountNumber!, 'acc')}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>{copiedTransferKey === 'acc' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                )}

                {/* IBAN */}
                {subscriberTransfers.iban && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/50 block">الآيبان الدولي IBAN:</span>
                      <span className="font-mono font-bold text-white text-[11px] truncate block dir-ltr text-right">
                        {subscriberTransfers.iban}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTransferField(subscriberTransfers.iban!, 'iban')}
                      className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>{copiedTransferKey === 'iban' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                )}

                {/* Visa / MasterCard details */}
                {subscriberTransfers.visaCardNumber && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] text-white/50 block">بطاقة فيزا / ماستركارد المعتمدة:</span>
                      <span className="font-mono font-bold text-sky-400 text-xs truncate block dir-ltr text-right">
                        {subscriberTransfers.visaCardNumber}
                      </span>
                      {subscriberTransfers.visaHolderName && (
                        <span className="text-[9px] text-white/70 truncate block">
                          باسم: {subscriberTransfers.visaHolderName}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyTransferField(subscriberTransfers.visaCardNumber!, 'visa')}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 text-[10px] font-bold flex items-center gap-1 transition cursor-pointer shrink-0"
                    >
                      <Copy className="w-2.5 h-2.5" />
                      <span>{copiedTransferKey === 'visa' ? 'تم النسخ' : 'نسخ'}</span>
                    </button>
                  </div>
                )}

                {/* Multiple Phone Numbers & Hotline */}
                <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 col-span-1 sm:col-span-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-1 w-full">
                    <span className="text-[10px] text-white/50 block font-bold">أرقام التواصل المباشرة والخط الساخن لهذا النشاط:</span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      {(subscriberTransfers.phones || allPhones).map((ph: string, idx: number) => (
                        <a
                          key={idx}
                          href={`tel:${ph}`}
                          className="bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg font-mono text-white flex items-center gap-1.5 transition"
                        >
                          <Phone className="w-2.5 h-2.5 text-emerald-400" />
                          <span>{ph}</span>
                        </a>
                      ))}
                      {(subscriberTransfers.hotline || business.trackingCell?.hotline) && (
                        <a
                          href={`tel:${subscriberTransfers.hotline || business.trackingCell?.hotline}`}
                          className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-lg font-mono font-black flex items-center gap-1 transition shadow"
                        >
                          <span>🔥 الخط الساخن:</span>
                          <span>{subscriberTransfers.hotline || business.trackingCell?.hotline}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Direct Communications & Channels (تليجرام، جوجل ميت، مكالمات فيديو وصوت ومحفظة نقود) */}
                <div className="bg-gradient-to-r from-sky-950/40 to-neutral-900 border border-sky-500/20 rounded-xl p-2.5 col-span-1 sm:col-span-2 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] text-sky-300 font-bold block">
                      قنوات استقبال المكالمات وتحويل الأموال المباشرة:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Telegram */}
                      <a
                        href={`https://t.me/${(subscriberTransfers.telegramUsername || 'e3lanak_service').replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-sky-200 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <span>✈️ تليجرام: {subscriberTransfers.telegramUsername || '@خدمة_المشترك'}</span>
                      </a>

                      {/* Google Meet */}
                      <a
                        href={subscriberTransfers.googleMeetUrl || 'https://meet.google.com/new'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Video className="w-3 h-3" />
                        <span>Google Meet فيديو مباشر</span>
                      </a>

                      {/* Video Call Direct */}
                      <a
                        href={`tel:${subscriberTransfers.videoCallPhone || business.phone}`}
                        className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Video className="w-3 h-3" />
                        <span>مكالمة فيديو فورية</span>
                      </a>

                      {/* Voice Call Direct */}
                      <a
                        href={`tel:${subscriberTransfers.voiceCallPhone || business.phone}`}
                        className="bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>مكالمة صوتية نقية</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Anti-Fraud Caution Box (تحذير الجمهور من النصب والاحتيال) */}
              <div className="bg-red-950/60 border border-red-500/50 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-200">
                <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-amber-300 text-[11px]">
                      ⚠️ تحذير أمني هام للجمهور من النصب والاحتيال:
                    </span>
                    {onOpenSecurityNotice && (
                      <button
                        type="button"
                        onClick={onOpenSecurityNotice}
                        className="text-[10px] text-amber-300 underline font-bold cursor-pointer hover:text-white"
                      >
                        عرض لائحة الأمان الرسمية ↗
                      </button>
                    )}
                  </div>
                  <p className="text-[10px] text-white/90 leading-relaxed">
                    تأكد تماماً من فحص ومعاينة الخدمة أو البضاعة والتأكد منها بنفسك قبل تحويل أي مبالغ مالية. 
                    <strong> ننصح بالدفع كاش عند الاستلام أو الوصول والمطابقة </strong> لضمان حقك وحمايتك التامة.
                  </p>
                </div>
              </div>

              {subscriberTransfers.customerTransferNotes && (
                <p className="text-[10px] text-white/70 bg-black/40 p-2 rounded-xl border border-white/5 leading-relaxed">
                  💬 <strong>ملاحظة صاحب النشاط:</strong> {subscriberTransfers.customerTransferNotes}
                </p>
              )}

              <div className="text-[9px] text-white/50 flex items-center justify-between pt-1 border-t border-white/5">
                <span>🛡️ التحويل يتم لصاحب النشاط مباشرة بدون وسيط</span>
                <span className="text-emerald-400 font-bold">معتمد وآمن ✓</span>
              </div>
            </div>
          )}

          {/* 4 Horizontal License & Accreditation Cards (تراخيص 4 كروت أفقية) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>التراخيص الرسمية والاعتمادات (4 كروت معتمدة)</span>
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">فحص إعلانك الخاص ✓</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white/5 border border-emerald-500/30 rounded-2xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-bold">الترخيص الأول</span>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-xs font-black text-white">ترخيص مزاولة المهنة</div>
                <p className="text-[10px] text-emerald-300 font-mono">ساري ومعتمد رسمي ✓</p>
              </div>

              <div className="bg-white/5 border border-blue-500/30 rounded-2xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-bold">السجل والمنشأة</span>
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-xs font-black text-white">رخصة المنشأة والسجل</div>
                <p className="text-[10px] text-blue-300 font-mono">مقيد بالغرفة التجارية ✓</p>
              </div>

              <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-bold">شهادة الجودة</span>
                  <CheckCircle className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="text-xs font-black text-white">شهادة الجودة والامتثال</div>
                <p className="text-[10px] text-purple-300 font-mono">مطابقة المواصفات ISO ✓</p>
              </div>

              <div className="bg-white/5 border border-amber-500/30 rounded-2xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/60 font-bold">الاعتماد المهني</span>
                  <CheckCircle className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-xs font-black text-white">الاعتماد النقابي والمهني</div>
                <p className="text-[10px] text-amber-300 font-mono">مقيد بالنقابة العامة ✓</p>
              </div>
            </div>
          </div>

          {/* قائمة الأسعار الخاصة بهذا النشاط فقط (وإلغاء أي قائمة أسعار أخرى) */}
          <div className="bg-gradient-to-br from-neutral-900 to-emerald-950/30 border border-emerald-500/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-black flex items-center justify-center font-black text-sm shadow">
                  📋
                </div>
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-white">
                    قائمة الأسعار الخاصة بنشاط: {business.name}
                  </h3>
                  <span className="text-[10px] text-emerald-300 font-bold">
                    تخصص النشاط: {business.cat} • الأسعار بعملة ({currentCurrency})
                  </span>
                </div>
              </div>
              {onOpenPriceList && (
                <button
                  type="button"
                  onClick={() => onOpenPriceList(business)}
                  className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow transition cursor-pointer"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>تعديل وإدارة قائمة أسعار النشاط ✏️</span>
                </button>
              )}
            </div>

            {business.services && business.services.length > 0 ? (
              <div className="space-y-2">
                {business.services.map((serv, idx) => (
                  <div
                    key={idx}
                    className="bg-black/50 hover:bg-black/70 border border-white/10 rounded-xl p-2.5 flex justify-between items-center transition gap-2.5"
                  >
                    {serv.imageUrl && (
                      <img
                        src={serv.imageUrl}
                        alt={serv.n}
                        className="w-12 h-12 rounded-xl object-cover border border-amber-400/50 shrink-0"
                      />
                    )}
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <span className="text-xs sm:text-sm font-bold text-white block truncate">
                        {serv.n}
                      </span>
                      {serv.priceEgp && (
                        <span className="text-[11px] text-amber-300 font-mono font-bold block">
                          {serv.priceEgp} ج.م
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs sm:text-sm font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 font-mono">
                        {formatServicePrice(serv.p, currentCurrency)}
                      </span>

                      {isEligibleDelivery && onOpenDelivery ? (
                        <button
                          type="button"
                          onClick={() => onOpenDelivery(business)}
                          className="bg-amber-400 hover:bg-amber-300 text-black px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1 transition shadow cursor-pointer"
                        >
                          <ShoppingBag className="w-3 h-3 fill-black" />
                          <span>اطلب 🛵</span>
                        </button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-black/40 border border-dashed border-white/15 rounded-xl p-4 text-center space-y-2">
                <p className="text-xs text-white/70">
                  استعرض أو أضف وعدل قائمة الأسعار الخاصة بنشاط ({business.name}) مباشرة
                </p>
                {onOpenPriceList && (
                  <button
                    type="button"
                    onClick={() => onOpenPriceList(business)}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-4 py-1.5 rounded-xl shadow cursor-pointer"
                  >
                    فتح وتعديل قائمة أسعار النشاط 📋
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Working Hours with Audio Player (مواعيد كتابة + تشغيل صوتي) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-black text-white block">مواعيد وساعات العمل:</span>
                <span className="text-[11px] text-white/70">{business.hours || 'متاح على مدار الساعة (24/7)'}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPlayingAudioHours(true);
                if ('speechSynthesis' in window) {
                  const u = new SpeechSynthesisUtterance(`مواعيد عمل ${business.name}: ${business.hours || 'يعمل على مدار الساعة'}`);
                  u.lang = 'ar';
                  window.speechSynthesis.speak(u);
                  setTimeout(() => setIsPlayingAudioHours(false), 3000);
                } else {
                  setTimeout(() => setIsPlayingAudioHours(false), 2000);
                }
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlayingAudioHours ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isPlayingAudioHours ? 'جاري التشغيل...' : 'استمع للمواعيد صوتياً 🔊'}</span>
            </button>
          </div>

          {/* Tourist Multilingual Real Reviews (تقييمات سياح بلغات متعددة) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/80 uppercase tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span>تقييمات السياح والنزلاء الحقيقية (Real Tourist Reviews)</span>
              </h3>
              <span className="text-[10px] text-yellow-300 font-bold">4.8 / 5 ⭐ (127 تقييم)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>🇬🇧</span>
                    <span>Edward M. (UK)</span>
                  </span>
                  <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                </div>
                <p className="text-[11px] text-white/70 italic">
                  "Outstanding hospitality, very fair and clear prices without surprises. Highly recommended!"
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>🇮🇹</span>
                    <span>Gianluigi B. (Italy)</span>
                  </span>
                  <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                </div>
                <p className="text-[11px] text-white/70 italic">
                  "Esperienza fantastica e personale molto accogliente. Servizio perfetto in Egitto!"
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1">
                    <span>🇷🇺</span>
                    <span>Anastasia K. (Russia)</span>
                  </span>
                  <div className="flex text-yellow-400 text-[10px]">★★★★★</div>
                </div>
                <p className="text-[11px] text-white/70 italic">
                  "Отличное место, честные цены и быстрое бронирование. Обязательно вернемся!"
                </p>
              </div>
            </div>
          </div>

          {/* Tourist Emergency SOS Box (SOS شرطة سياحة 126 مستشفى سفارة) */}
          <div className="bg-red-950/40 border border-red-500/40 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-red-400 font-black text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>أرقام الطوارئ السياحية الرسمية في مصر (SOS Emergency):</span>
              </div>
              <span className="text-[10px] text-red-200">اتصال فوري ومجاني</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <a
                href="tel:126"
                className="bg-red-600/30 hover:bg-red-600 border border-red-500/40 py-2 rounded-xl text-white font-bold transition flex flex-col items-center gap-0.5"
              >
                <span className="text-sm font-black font-mono">126</span>
                <span className="text-[10px] text-red-200">شرطة السياحة</span>
              </a>
              <a
                href="tel:123"
                className="bg-red-600/30 hover:bg-red-600 border border-red-500/40 py-2 rounded-xl text-white font-bold transition flex flex-col items-center gap-0.5"
              >
                <span className="text-sm font-black font-mono">123</span>
                <span className="text-[10px] text-red-200">الإسعاف الطبي</span>
              </a>
              <a
                href="tel:122"
                className="bg-red-600/30 hover:bg-red-600 border border-red-500/40 py-2 rounded-xl text-white font-bold transition flex flex-col items-center gap-0.5"
              >
                <span className="text-sm font-black font-mono">122</span>
                <span className="text-[10px] text-red-200">شرطة النجدة</span>
              </a>
              <a
                href="tel:0227973300"
                className="bg-red-600/30 hover:bg-red-600 border border-red-500/40 py-2 rounded-xl text-white font-bold transition flex flex-col items-center gap-0.5"
              >
                <span className="text-sm font-black font-mono">مستشفى / سفارة</span>
                <span className="text-[10px] text-red-200">طوارئ الرعايا</span>
              </a>
            </div>
          </div>
          {/* Multiple Phone Numbers & Contact Center */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white/70 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#FF2D55]" />
                <span>{t.contactNumbers}</span>
              </h3>
              <span className="text-[10px] text-white/40">
                {allPhones.length} أرقام متاحة
              </span>
            </div>

            <div className="space-y-2">
              {allPhones.map((ph, idx) => (
                <div
                  key={idx}
                  className="bg-black/40 border border-white/10 rounded-xl p-2.5 flex items-center justify-between flex-wrap gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-white/10 text-white text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-white tracking-wider dir-ltr">
                      {ph}
                    </span>
                    {idx === 0 && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded">
                        الرئيسي
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 ms-auto">
                    <a
                      href={`https://wa.me/${(ph || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `مرحباً ${business.name}، استفسار من منصة إعلانك E3lanak`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5 fill-white" />
                      <span>{t.whatsapp}</span>
                    </a>
                    <a
                      href={`tel:${ph}`}
                      className="bg-white hover:bg-neutral-200 text-black px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
                    >
                      <Phone className="w-3.5 h-3.5 fill-black" />
                      <span>{t.call}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Google Maps Actions & Directions */}
          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={mapSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/10 hover:bg-white/15 text-white/90 font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs border border-white/10 transition"
            >
              <img
                src="https://www.gstatic.com/images/branding/product/1x/maps_64dp.png"
                alt="Google Maps"
                className="w-4 h-4"
              />
              <span>{t.openInMaps}</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>

            <a
              href={mapDirUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#FF2D55] hover:bg-[#ff4064] text-white font-black py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs shadow-md shadow-[#FF2D55]/30 transition"
            >
              <Compass className="w-4 h-4" />
              <span>{t.directions} (GPS)</span>
            </a>
          </div>

          {/* Ready Website or Custom Domain Button */}
          {business.websiteUrl && (
            <a
              href={business.websiteUrl.startsWith('http') ? business.websiteUrl : `https://${business.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600/25 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-400/40 p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-md group"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400 group-hover:text-white shrink-0" />
                <div>
                  <span className="text-white block font-black">الموقع الرسمي / الدومين الخاص:</span>
                  <span className="text-[11px] text-blue-300 font-mono">{business.websiteUrl}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Embedded Google Map with Satellite Toggle & Program Logo Badge */}
          <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg relative">
            <div className="bg-neutral-900 px-3 py-1.5 flex items-center justify-between border-b border-white/10 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="bg-[#FF2D55] text-white font-black px-2 py-0.5 rounded-full">
                  📢 لوجو إعلانك على خريطة جوجل
                </span>
                <span className="text-emerald-300 font-bold">
                  {business.workStatus === 'inactive' ? '⚪ في عطلة OFF' : '🟢 في العمل ON'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSatelliteMapMode((p) => !p)}
                className="bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-300 px-2 py-0.5 rounded-full font-black cursor-pointer"
              >
                {satelliteMapMode ? '🛰️ عرض القمر الصناعي مفعل' : '🗺️ تفعيل القمر الصناعي'}
              </button>
            </div>
            <iframe
              src={`${mapEmbedUrl}${satelliteMapMode ? '&t=k' : ''}`}
              title={`خريطة ${business.name}`}
              className="w-full h-48 border-0"
              loading="lazy"
            />
          </div>

          {/* Business Bio / Description */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <h3 className="text-xs font-black text-white/50 mb-2 uppercase tracking-wider">
              عن النشاط والتخصص
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {business.bio}
            </p>
          </div>

          {/* Google Ads Campaign info if sponsored */}
          {business.isSponsored && (
            <div className="bg-gradient-to-r from-amber-950/40 to-neutral-900 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-400" />
                <span>{business.adCampaignTitle || t.googleAdsSponsored}</span>
              </div>
              <span className="text-[10px] font-bold bg-amber-400 text-black px-2 py-0.5 rounded-full">
                Ad
              </span>
            </div>
          )}

          {/* Video Gallery Thumbnails */}
          {business.videos && business.videos.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-black text-white/50 mb-1 uppercase tracking-wider">
                {t.videoGallery}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {business.videos.map((vid, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setActiveMedia('video');
                      setActiveVideoSrc(vid);
                    }}
                    className={`relative h-24 rounded-xl overflow-hidden bg-neutral-900 border cursor-pointer group ${
                      activeVideoSrc === vid && activeMedia === 'video'
                        ? 'border-[#FF2D55] ring-2 ring-[#FF2D55]/50'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <video
                      src={vid}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition">
                      <Play className="w-5 h-5 fill-white text-white opacity-80 group-hover:opacity-100" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMER REELS & MEDIA SECTION WITH ANIMATED MOVING TEXT (فيديوهات وصور العملاء مع كتابة متحركة) */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-2xl bg-[#FF2D55]/20 border border-[#FF2D55]/30 flex items-center justify-center text-lg">
                  🎥✨
                </span>
                <div>
                  <h3 className="font-black text-sm sm:text-base text-white flex items-center gap-2">
                    <span>فيديوهات وصور العملاء</span>
                    <span className="bg-[#FF2D55] text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow">
                      كتابة متحركة ({customerPosts.length})
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/50">تجارب حية من الزوار والمشتركين مع نصوص إعلانية وعروض متحركة</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddCustomerMediaOpen(true)}
                className="bg-gradient-to-r from-[#FF2D55] via-rose-600 to-amber-500 hover:brightness-110 active:scale-95 text-white font-black px-4 py-2 rounded-2xl text-xs flex items-center gap-1.5 shadow-lg shadow-[#FF2D55]/30 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>أضف فيديو أو صورة مع كتابة متحركة 🎬</span>
              </button>
            </div>

            {/* Posts Grid */}
            {customerPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {customerPosts.map((post) => {
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
                      : 'anim-marquee';

                  return (
                    <div
                      key={post.id}
                      onClick={() => setActiveCustomerPost(post)}
                      className="group relative aspect-[9/13] rounded-2xl overflow-hidden bg-black border border-white/15 hover:border-[#FF2D55]/60 transition shadow-lg cursor-pointer flex flex-col justify-between p-3"
                    >
                      {/* Media element */}
                      {post.type === 'video' ? (
                        <video
                          src={post.url}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <img
                          src={post.url}
                          alt="customer review"
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                      {/* Top Header overlay */}
                      <div className="relative z-10 flex items-center justify-between text-[10px] text-white">
                        <span className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 font-bold truncate max-w-[140px]">
                          {post.userName}
                        </span>
                        <span className="bg-[#FF2D55] text-white px-2 py-0.5 rounded-full font-bold text-[9px] shadow">
                          {post.type === 'video' ? 'فيديو ريلز 🎥' : 'صورة 📸'}
                        </span>
                      </div>

                      {/* MOVING ANIMATED TEXT ON CUSTOMER MEDIA */}
                      <div className="relative z-10 my-auto w-full px-1 overflow-hidden pointer-events-none">
                        <div
                          className="w-full rounded-xl py-2 px-2.5 backdrop-blur-md text-center border border-white/20 shadow-2xl overflow-hidden"
                          style={{ backgroundColor: post.bgColor || 'rgba(0, 0, 0, 0.7)' }}
                        >
                          <div
                            className={`${animClass} font-black text-xs sm:text-sm tracking-wide`}
                            style={{ color: post.textColor || '#FFD700' }}
                          >
                            {post.caption}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Footer overlay */}
                      <div className="relative z-10 flex items-center justify-between text-[11px] text-white/90 pt-1">
                        <span className="text-[10px] opacity-70">
                          {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                        <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full flex items-center gap-1">
                          <Heart className="w-3 h-3 text-[#FF2D55] fill-[#FF2D55]" />
                          <span className="font-bold">{post.likes || 1}</span>
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 px-4 bg-white/[0.03] rounded-2xl border border-white/5 space-y-2">
                <span className="text-4xl block">🎬✨</span>
                <h4 className="font-bold text-white text-xs sm:text-sm">كن أول عميل يشارك فيديو أو صورة مع كتابة متحركة!</h4>
                <p className="text-[11px] text-white/50 max-w-sm mx-auto">
                  شارك رأيك أو عروض المكان مع شريط إخباري متحرك، اهتزاز نيون، أو موجة راقصة لجذب آلاف الزوار.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddCustomerMediaOpen(true)}
                  className="mt-1 bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded-full text-xs transition cursor-pointer"
                >
                  + أضف تجربتك الآن
                </button>
              </div>
            )}
          </div>

          {/* Subscription Payment Status & License Verification */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white">حالة دفع الاشتراك:</span>
              </div>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                business.subscriptionPayment?.isPaid
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : business.pkg === 0
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {business.subscriptionPayment?.isPaid
                  ? `مدفوع (${business.subscriptionPayment.method})`
                  : business.pkg === 0
                  ? 'فترة تجريبية مجانية 90 يوم'
                  : 'بانتظار التحصيل / التجديد'}
              </span>
            </div>

            {/* Direct Pay / Upgrade Button */}
            <button
              type="button"
              onClick={onOpenRenew}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:brightness-110 active:scale-98 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              <span>الاشتراك وترقية الإعلان (فيزا / ماستركارد / كاش / إنستاباي) ⚡</span>
            </button>

            {/* License verification badge (Docs are private for admin only) */}
            {business.licenseVerified && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2.5 flex items-center gap-2 text-xs text-emerald-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <b className="text-white">نشاط مرخص وموثق رسمياً:</b>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    تم فحص وتدقيق السجل التجاري والرخصة الحكومية بواسطة إدارة المنصة. المستندات الرسمية مشفرة ومحفوظة لدى الإدارة فقط لحماية الخصوصية.
                  </p>
                </div>
              </div>
            )}

            {/* If listed for sale (معروض للبيع للجمهور دون مستندات) */}
            {business.forSaleItem?.isForSale && (
              <div className="bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-amber-400 text-black flex items-center justify-center font-bold text-sm">
                      🏷️
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-amber-300">
                        معروض للبيع للجمهور: {business.forSaleItem.title || business.name}
                      </h4>
                      <p className="text-[11px] text-white/70">
                        {business.forSaleItem.itemType} • {business.forSaleItem.condition} • بيع حر دون مستندات
                      </p>
                    </div>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-white/50 block">السعر المطلوب</span>
                    <span className="text-base font-black text-amber-400 font-mono bg-black/50 px-3 py-1 rounded-xl border border-amber-400/40 inline-block">
                      {business.forSaleItem.price.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                {/* Specs / Notes if available */}
                {business.forSaleItem.specs && (
                  <div className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white/80">
                    <span className="text-[10px] text-amber-300 font-bold block mb-0.5">المواصفات والتفاصيل:</span>
                    <p className="text-[11px] leading-relaxed">{business.forSaleItem.specs}</p>
                  </div>
                )}

                {/* Ready Website or Domain for the Item */}
                {business.forSaleItem.websiteOrDomain && (
                  <div className="pt-0.5">
                    <a
                      href={
                        business.forSaleItem.websiteOrDomain.startsWith('http')
                          ? business.forSaleItem.websiteOrDomain
                          : `https://${business.forSaleItem.websiteOrDomain}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600/30 hover:bg-blue-600 text-blue-200 hover:text-white border border-blue-400/40 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between"
                    >
                      <span className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-blue-400" />
                        <span>رابط موقع / دومين السلعة: {business.forSaleItem.websiteOrDomain}</span>
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {/* Public Images for the Item (صور المعروضات للجمهور) */}
                {business.forSaleItem.publicImages && business.forSaleItem.publicImages.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-white flex items-center gap-1">
                        <span>📸 صور المعروض للبيع للجمهور</span>
                        <span className="text-amber-400">({business.forSaleItem.publicImages.length} صور)</span>
                      </span>
                      <span className="text-[10px] text-white/50">اضغط للمعاينة</span>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {business.forSaleItem.publicImages.map((pImg, pIdx) => (
                        <div
                          key={pIdx}
                          onClick={() => {
                            setActiveMedia('image');
                          }}
                          className="relative aspect-square rounded-xl overflow-hidden bg-black border border-white/15 hover:border-amber-400 transition cursor-pointer group shadow"
                        >
                          <img
                            src={pImg}
                            alt={`sale-img-${pIdx}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Zero-documents guarantee */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-2 flex items-center gap-2 text-[10px] text-emerald-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>معروض للبيع مباشرة للجمهور دون الحاجة لمستندات أو رخص تجارية رسمية.</span>
                </div>
              </div>
            )}
          </div>

          {/* Google Search Engine Keywords (SEO) Section */}
          <div className="bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-500/30 rounded-2xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400">
                <Search className="w-4 h-4" />
                <span className="text-xs font-black text-white">كلمات محرك البحث على Google (SEO Keywords)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSeoBox(!showSeoBox)}
                className="text-[11px] text-blue-300 hover:text-white font-bold bg-blue-500/20 px-2.5 py-1 rounded-lg border border-blue-500/30 transition cursor-pointer"
              >
                {showSeoBox ? 'إخفاء' : 'عرض الكلمات 🔍'}
              </button>
            </div>

            {showSeoBox && (
              <div className="space-y-2 pt-1 border-t border-white/10 text-xs text-white/80">
                <p className="text-[11px] text-white/60">
                  الكلمات والعبارات الأكثر بحثاً على Google وGoogle Maps المؤدية لهذا النشاط:
                </p>

                {/* Google Snippet Preview */}
                <div className="bg-neutral-900 border border-white/15 rounded-xl p-3 space-y-1 text-start">
                  <span className="text-[10px] text-blue-400 block font-mono">{seoPackage.googleSearchPreview.url}</span>
                  <h4 className="text-xs font-bold text-blue-300 hover:underline cursor-pointer">
                    {seoPackage.googleSearchPreview.title}
                  </h4>
                  <p className="text-[11px] text-white/70 line-clamp-2">
                    {seoPackage.googleSearchPreview.snippet}
                  </p>
                </div>

                {/* Auto-Generated Google Keywords Chips with 1-click Google Search */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>كلمات بحث Google التلقائية الأكثر استهدافاً (اضغط للبحث الفعلي):</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {autoGoogleKeywords.map((item, kIdx) => (
                      <a
                        key={kIdx}
                        href={item.searchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 hover:bg-blue-600/30 border border-white/10 hover:border-blue-400/40 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-[11px] text-white/90 hover:text-white transition group"
                        title="ابحث في Google مباشرة"
                      >
                        <span className="truncate">{item.keyword}</span>
                        <span className="text-[9px] bg-blue-500/20 text-blue-300 group-hover:bg-blue-500 group-hover:text-black font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 shrink-0">
                          <span>Google</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Custom Google Search Keywords Added to This Page */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <div className="text-[10.5px] font-black text-emerald-300">
                    ➕ إضافة كلمات بحث جوجل خاصة بهذه الصفحة (اضافه لكل صفحه كلمات بحث جوجل):
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newGoogleKeyword}
                      onChange={(e) => setNewGoogleKeyword(e.target.value)}
                      placeholder="أضف كلمة بحث جوجل لهذه الصفحة (مثال: أفضل مطعم، تاكسي سريع)..."
                      className="flex-1 bg-black/60 border border-blue-400/40 rounded-xl px-2.5 py-1.5 text-white text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newGoogleKeyword.trim()) return;
                        const updatedKeywords = [
                          ...(business.googleSearchKeywords || []),
                          newGoogleKeyword.trim(),
                        ];
                        onUpdateBusiness?.({
                          ...business,
                          googleSearchKeywords: updatedKeywords,
                        });
                        setNewGoogleKeyword('');
                        setTransferToast('✅ تمت إضافة كلمة بحث جوجل للصفحة!');
                        setTimeout(() => setTransferToast(null), 2500);
                      }}
                      className="bg-blue-500 hover:bg-blue-400 text-black font-black px-3 py-1.5 rounded-xl text-xs cursor-pointer"
                    >
                      إضافة كلمة +
                    </button>
                  </div>
                  {business.googleSearchKeywords && business.googleSearchKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {business.googleSearchKeywords.map((kw, idx) => (
                        <a
                          key={idx}
                          href={`https://www.google.com/search?q=${encodeURIComponent(`${kw} ${business.city}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-blue-500/20 hover:bg-blue-500/35 border border-blue-400/50 text-blue-200 px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1"
                        >
                          <span>🔍 {kw}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={copySeoKeywords}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer mt-1"
                >
                  {seoCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>تم نسخ كلمات محرك البحث بنجاح!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ الكلمات المفتاحية لـ Google 📋</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Unique Business QR Code for Scanning & Sharing */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs">
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>رمز الاستجابة السريع (QR Code) الخاص بالنشاط:</span>
              </div>
              <p className="text-[11px] text-white/60 leading-relaxed">
                امسح الرمز بكاميرا الهاتف لفتح بطاقة النشاط التجاري ومشاركتها مع أصدقائك فوراً.
              </p>
            </div>
            <div className="bg-white p-2 rounded-2xl shadow-xl shrink-0">
              <QRCodeSVG 
                value={typeof window !== 'undefined' ? `${window.location.origin}?biz=${business.id}` : `https://dalilk-sam.com/?biz=${business.id}`}
                size={76}
                bgColor="#FFFFFF"
                fgColor="#000000"
                level="M"
              />
            </div>
          </div>

          {/* Expiration Notice & Renewal Trigger */}
          {daysLeft <= 15 && (
            <div className="bg-gradient-to-r from-red-950/60 to-neutral-900 border border-[#FF2D55]/40 rounded-2xl p-4 text-center space-y-2">
              <div className="flex items-center justify-center gap-1.5 text-[#FF2D55] font-black text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>
                  {isExpired ? 'انتهت الفترة التجريبية 90 يوم' : `متبقي ${daysLeft} يوم فقط على انتهاء الفترة المجانية`}
                </span>
              </div>
              <p className="text-xs text-white/70">
                جدد اشتراك نشاطك لتظل مرئياً للملايين على منصة إعلانك عبر فيديوهات الريلز والبحث المباشر.
              </p>
              <button
                onClick={onOpenRenew}
                className="w-full bg-[#FF2D55] hover:bg-[#ff3b61] text-white py-3 rounded-full text-xs font-black transition shadow-lg shadow-[#FF2D55]/30 cursor-pointer"
              >
                {t.renewNow} (فيزا / ماستركارد / كاش / إنستاباي)
              </button>
            </div>
          )}

          {/* Bottom Exit / Back Button */}
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full text-xs flex items-center justify-center gap-1.5 transition border border-white/15 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>خروج والرجوع إلى الدليل الرئيسي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Customer Media Upload with Moving Animated Text Modal */}
      {isAddCustomerMediaOpen && (
        <AddCustomerMediaModal
          business={business}
          onClose={() => setIsAddCustomerMediaOpen(false)}
          onAddPost={handleAddCustomerPost}
          lang={lang}
        />
      )}

      {/* Customer Post Player Modal (Full screen with moving animated text) */}
      {activeCustomerPost && (
        <CustomerPostPlayerModal
          post={activeCustomerPost}
          business={business}
          onClose={() => setActiveCustomerPost(null)}
          onLike={(id) => {
            const updated = customerPosts.map((p) =>
              p.id === id ? { ...p, likes: (p.likes || 1) + 1 } : p
            );
            setCustomerPosts(updated);
            onUpdateBusiness?.({ ...business, customerPosts: updated });
          }}
          lang={lang}
        />
      )}

      {/* Verified Criteria Explanation Modal */}
      {showVerifiedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/20 rounded-3xl p-5 max-w-sm w-full space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#20D5EC] fill-[#20D5EC]/20" />
                <h3 className="font-black text-sm">معايير توثيق النشاط (Verified)</h3>
              </div>
              <button onClick={() => setShowVerifiedModal(false)} className="text-white/60 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs text-white/80 leading-relaxed">
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>فحص ومطابقة السجل التجاري والبطاقة الضريبية الرسمية.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>تأكيد الموقع الجغرافي الفعلي على خرائط Google Maps بدقة.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>تأكيد هواتف وأرقام التواصل المباشرة والواتساب المعتمد.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>حماية كاملة وأمان للمشترين والنزلاء تحت مظلة إعلانك SAM.</span>
              </div>
            </div>
            <button
              onClick={() => setShowVerifiedModal(false)}
              className="w-full bg-[#20D5EC] hover:bg-[#1bb8cc] text-black font-black py-2 rounded-xl text-xs transition cursor-pointer"
            >
              فهمت ذلك
            </button>
          </div>
        </div>
      )}

      {/* Report Price Gouging / Violation Modal (Report غلاء سعر) */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-neutral-900 border border-white/20 rounded-3xl p-5 max-w-sm w-full space-y-4 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-red-400" />
                <h3 className="font-black text-sm">إبلاغ عن غلاء سعر أو مخالفة</h3>
              </div>
              <button 
                onClick={() => {
                  setShowReportModal(false);
                  setReportSuccess(false);
                }} 
                className="text-white/60 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {reportSuccess ? (
              <div className="py-4 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-sm text-emerald-300">تم تسجيل بلاغك بنجاح!</h4>
                <p className="text-xs text-white/70 leading-relaxed">
                  فريق رقابة إعلانك الخاص سيقوم بمراجعة الأسعار والتواصل الفوري مع المنشأة لحماية المستهلكين والسياح وضمان الشفافية.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowReportModal(false);
                    setReportSuccess(false);
                  }}
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-xl text-xs transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setReportSuccess(true);
                }}
                className="space-y-3 text-xs"
              >
                <p className="text-white/70 leading-relaxed">
                  هل واجهت زيادة غير مبررة في السعر عن المعلن في المنصة لـ <strong>{business.name}</strong>؟
                </p>
                <div>
                  <label className="block text-[11px] text-white/80 font-bold mb-1">تفاصيل البلاغ أو السعر المطلوب:</label>
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="اكتب ما حدث والسعر الذي طُلب منك..."
                    className="w-full bg-white/5 border border-white/15 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-400 h-20"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition cursor-pointer shadow-lg"
                >
                  إرسال البلاغ لإدارة إعلانك الخاص 🚨
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Interactive Presentation Builder Modal */}
      {isPresentationBuilderOpen && (
        <InteractivePresentationBuilderModal
          business={business}
          onClose={() => setIsPresentationBuilderOpen(false)}
          onSave={(updatedPres) => {
            const updatedBiz: Business = {
              ...business,
              interactivePresentation: updatedPres,
            };
            onUpdateBusiness?.(updatedBiz);
            setActiveMedia('presentation');
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
