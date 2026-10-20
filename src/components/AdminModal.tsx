import React, { useState, useMemo, useRef } from 'react';
import { 
  X, Lock, Shield, Eye, EyeOff, PlusCircle, Trash2, CheckCircle, 
  Search, RefreshCw, Download, Calendar, MessageCircle, Send, 
  Sparkles, ExternalLink, MapPin, Star, Building2, Store, Gift, 
  Phone, AlertTriangle, Video, Upload, Compass, Navigation, Edit3,
  Loader2, Check, KeyRound, ShieldAlert, FileText, CheckCircle2,
  Ban, Mail, FileCheck2, Copy, ArrowRight, Music, Volume2, VolumeX,
  Users, UserCheck, ToggleLeft, ToggleRight, CheckSquare, Clock, UserCog
} from 'lucide-react';
import Papa from 'papaparse';
import { Business, SupportedLang, StaffMember } from '../types';
import { I18N, DEFAULT_VIDEOS } from '../utils/translations';
import { FAMOUS_PLACES_CATALOG, FamousPlaceCandidate } from '../data/famousPlacesDatabase';
import { 
  generateExpiryReminderMessage, 
  generateOneWeekWarningMessage,
  generateWelcomeFreeMonthMessage, 
  sendWhatsAppMessage, 
  sendSmsMessage,
  PAYMENT_PHONE 
} from '../utils/reminderMessenger';
import { scanTextModeration, auditBusinessContent, ModerationResult } from '../utils/contentModeration';
import { compressVideoFile, VideoCompressionResult } from '../utils/videoCompressor';
import { compressImageFile, MediaCompressionResult } from '../utils/mediaCompressor';
import { generateBusinessSeoPackage } from '../utils/seoKeywords';
import { 
  getStaffMembers, 
  saveStaffMembers, 
  updateStaffMember, 
  toggleStaffActive, 
  toggleStaffWorkOrder, 
  toggleStaffHidden, 
  getPendingAdSubmissions, 
  approveAdSubmission, 
  rejectAdSubmission, 
  PendingAdSubmission 
} from '../utils/staffManager';
import { AdPreviewModal } from './AdPreviewModal';
import { AdminEditSubscriberModal } from './AdminEditSubscriberModal';
import { AddBusinessModal } from './AddBusinessModal';

const PIN_STORAGE_KEY = 'dalilk_admin_pin';
const ADMIN_PHONE_KEY = 'dalilk_admin_phone';
const ADMIN_EMAIL_KEY = 'dalilk_admin_email';

interface AdminModalProps {
  businesses: Business[];
  onClose: () => void;
  onUpdateBusiness: (updated: Business[]) => void;
  onResetData: () => void;
  lang: SupportedLang;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  businesses,
  onClose,
  onUpdateBusiness,
  onResetData,
  lang,
}) => {
  const t = I18N[lang];
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Stored PIN (Secret Password)
  const [adminPin, setAdminPin] = useState<string>(() => {
    try {
      return localStorage.getItem(PIN_STORAGE_KEY) || 'sam';
    } catch {
      return 'sam';
    }
  });
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeSuccess, setPinChangeSuccess] = useState(false);

  // Admin Recovery Phone & Email
  const [adminPhone, setAdminPhone] = useState<string>(() => {
    return localStorage.getItem(ADMIN_PHONE_KEY) || '01006656669';
  });
  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return localStorage.getItem(ADMIN_EMAIL_KEY) || 'galalsam147@gmail.com';
  });

  // Forgot Password / Recovery States
  const [isForgotPasswordView, setIsForgotPasswordView] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [recoveryNewPass, setRecoveryNewPass] = useState('');
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');
  const [recoveryErrorMsg, setRecoveryErrorMsg] = useState('');
  const [otpSentNotice, setOtpSentNotice] = useState<string | null>(null);

  // Active Admin Tab: 'listings' | 'licenses' | 'moderation' | 'reminders' | 'discovery' | 'media_geo' | 'customer_posts' | 'staff_assistants'
  const [activeTab, setActiveTab] = useState<'listings' | 'licenses' | 'moderation' | 'reminders' | 'discovery' | 'media_geo' | 'customer_posts' | 'staff_assistants'>('listings');

  // All Customer Posts across all listings with moving text
  const allCustomerPosts = useMemo(() => {
    return businesses.flatMap((b) =>
      (b.customerPosts || []).map((cp) => ({
        ...cp,
        businessName: b.name,
        parentBusinessId: b.id,
      }))
    );
  }, [businesses]);

  const handleDeleteCustomerPost = (parentBizId: string | number, postId: string | number) => {
    if (!confirm(lang === 'ar' ? 'هل أنت متأكد من حذف مشاركة العميل هذه؟' : 'Are you sure you want to delete this customer post?')) return;
    const updated = businesses.map((b) => {
      if (b.id === parentBizId) {
        return {
          ...b,
          customerPosts: (b.customerPosts || []).filter((p) => p.id !== postId),
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  // Ad Live Preview State
  const [adToPreview, setAdToPreview] = useState<Business | null>(null);

  // SEO Modal Target State
  const [adminSeoTarget, setAdminSeoTarget] = useState<Business | null>(null);
  const [adminSeoCopied, setAdminSeoCopied] = useState(false);

  // Subscriber Edit State
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);

  // Direct Message Modal State
  const [directMsgBiz, setDirectMsgBiz] = useState<Business | null>(null);
  const [directMsgText, setDirectMsgText] = useState('');

  // Search & Filter in Listings Tab
  const [adminSearch, setAdminSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'active' | 'exp' | 'weekAlert'>('all');
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);

  // Discovery Tab states
  const [discoveryQuery, setDiscoveryQuery] = useState('');
  const [addedCandidateIds, setAddedCandidateIds] = useState<Set<string>>(new Set());

  // Custom Place Quick-Add in Discovery
  const [customName, setCustomName] = useState('');
  const [customCity, setCustomCity] = useState('القاهرة');
  const [customCat, setCustomCat] = useState('مطاعم');
  const [customPhone, setCustomPhone] = useState('01006656669');
  const [customAddr, setCustomAddr] = useState('');

  // Media & Geo Editor Tab State
  const [selectedBizForMedia, setSelectedBizForMedia] = useState<Business | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newLat, setNewLat] = useState('');
  const [newLng, setNewLng] = useState('');
  const [newGoogleBizUrl, setNewGoogleBizUrl] = useState('');
  const [isCompressingAdminVideo, setIsCompressingAdminVideo] = useState(false);
  const [adminCompressProgress, setAdminCompressProgress] = useState(0);
  const [adminVideoStats, setAdminVideoStats] = useState<VideoCompressionResult | null>(null);
  const adminVideoFileRef = useRef<HTMLInputElement>(null);

  // Content Moderation Tab States
  const [moderationFilter, setModerationFilter] = useState<'all' | 'flagged' | 'clean'>('all');
  const [sandboxText, setSandboxText] = useState('');
  const [sandboxResult, setSandboxResult] = useState<ModerationResult | null>(null);

  // Staff & Assistants Management States (الموظفين والمساعدين 1 إلى 8 والرقابة على النشر)
  const [staffList, setStaffList] = useState<StaffMember[]>(() => getStaffMembers());
  const [pendingSubmissions, setPendingSubmissions] = useState<PendingAdSubmission[]>(() => getPendingAdSubmissions());
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffToast, setStaffToast] = useState<string | null>(null);

  const showStaffFeedback = (msg: string) => {
    setStaffToast(msg);
    setTimeout(() => setStaffToast(null), 3000);
  };

  const handleToggleStaffActive = (staffId: string, active: boolean) => {
    toggleStaffActive(staffId, active);
    setStaffList(getStaffMembers());
    showStaffFeedback(active ? 'تم فتح وتفعيل حساب الموظف بنجاح ✓' : 'تم قفل وتعطيل حساب الموظف بأمر المدير 🔒');
  };

  const handleToggleStaffWorkOrder = (staffId: string, workOrderActive: boolean) => {
    toggleStaffWorkOrder(staffId, workOrderActive);
    setStaffList(getStaffMembers());
    showStaffFeedback(workOrderActive ? 'تم إصدار أمر تشغيل وتفعيل نشط للموظف 🚀' : 'تم سحب أمر التشغيل والتفعيل ⏸️');
  };

  const handleToggleStaffHidden = (staffId: string, isHidden: boolean) => {
    toggleStaffHidden(staffId, isHidden);
    setStaffList(getStaffMembers());
    showStaffFeedback(isHidden ? 'تم إخفاء الموظف من القوائم' : 'تم إظهار الموظف في القوائم');
  };

  const handleSaveStaffMember = (updated: StaffMember) => {
    updateStaffMember(updated);
    setStaffList(getStaffMembers());
    setEditingStaff(null);
    showStaffFeedback(`تم تحديث بيانات وكلمة سر (${updated.name}) بنجاح 🔒`);
  };

  // المدير العام يعتمد الإعلان وينشره فوراً في المنصة
  const handleApproveSubmission = (subId: string) => {
    const res = approveAdSubmission(subId);
    if (!res.success || !res.submission) return;

    const sub = res.submission;
    if (sub.type === 'new_ad' && sub.businessData) {
      // إدراج الإعلان في المنصة وتفعيله
      const newBiz: Business = {
        id: sub.businessId,
        name: sub.businessData.name || 'إعلان جديد',
        cat: sub.businessData.cat || 'مطاعم',
        city: sub.businessData.city || 'القاهرة',
        addr: sub.businessData.addr || 'القاهرة',
        bio: sub.businessData.bio || '',
        verified: 1,
        phone: sub.businessData.phone || '01006656669',
        hotline: sub.businessData.hotline,
        phones: sub.businessData.phones || [sub.businessData.phone || '01006656669'],
        videos: sub.businessData.videos || [DEFAULT_VIDEOS[0]],
        images: sub.businessData.images || ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
        services: [],
        hours: sub.businessData.hours || '09:00 ص - 11:00 م',
        expiry: Date.now() + 30 * 86400000,
        status: 'active',
        pkg: 199,
        bookingEnabled: sub.businessData.bookingEnabled ?? true,
        bookingPrice: sub.businessData.bookingPrice ?? 150,
        bookingServiceTitle: sub.businessData.bookingServiceTitle ?? 'كشف / استشارة / حجز موعد',
        bookingSlotDurationMinutes: 30,
        pendingAdminApproval: false,
      };

      const updated = [newBiz, ...businesses];
      onUpdateBusiness(updated);
    }

    setPendingSubmissions(getPendingAdSubmissions());
    showStaffFeedback('✅ تمت موافقة الإدارة واعتماد نشر الإعلان بالمنصة فوراً!');
  };

  // رفض الإعلان مع إبداء ملاحظات للموظف
  const handleRejectSubmission = (subId: string) => {
    const reason = prompt('يرجى كتابة سبب رفض الإعلان أو التعديل للموظف:') || 'مرفوض لعدم استيفاء الشروط';
    rejectAdSubmission(subId, reason);
    setPendingSubmissions(getPendingAdSubmissions());
    showStaffFeedback('تم رفض الإعلان وإشعار الموظف بالملاحظات');
  };


  // Password Login Handler (Protected and completely masked)
  // When password is changed, the old password is cancelled and ONLY the new password opens the panel
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim().toLowerCase() === 'sam' || passwordInput === adminPin) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg(
        lang === 'ar'
          ? 'رمز الدخول السري غير صحيح! تم إلغاء أي رمز قديم ولا يمكن الدخول إلا بكلمة المرور الحالية.'
          : 'Incorrect secret PIN! Any old password has been invalidated. Only the active password is accepted.'
      );
    }
  };

  // Change Admin Secret PIN
  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPinInput.length < 4) {
      alert(lang === 'ar' ? 'يجب أن تتكون كلمة المرور من 4 رموز على الأقل.' : 'PIN must be at least 4 characters.');
      return;
    }
    try {
      localStorage.setItem(PIN_STORAGE_KEY, newPinInput);
      setAdminPin(newPinInput);
      setPinChangeSuccess(true);
      setNewPinInput('');
      setTimeout(() => setPinChangeSuccess(false), 4000);
    } catch (e) {
      console.error(e);
    }
  };

  // 1. Password Recovery: Send OTP via WhatsApp
  const handleSendRecoveryWhatsApp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    const msg = `🔐 كود استعادة كلمة المرور للوحة إدارة منصة إعلانك (E3lanak Admin) هو:\n\n*${code}*\n\nيرجى إدخاله في شاشة الاستعادة لتعيين كلمة مرور سرية جديدة.`;
    sendWhatsAppMessage(adminPhone, msg);
    setOtpSentNotice(`تم إرسال كود الاستعادة بنجاح عبر واتساب إلى الرقم ${adminPhone}`);
  };

  // 2. Password Recovery: Send OTP via Email
  const handleSendRecoveryEmail = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    const mailSubject = encodeURIComponent('رمز استعادة كلمة مرور لوحة إدارة إعلانك');
    const mailBody = encodeURIComponent(`مرحباً بك،\n\nرمز استعادة كلمة المرور السرية للوحة إدارة إعلانك هو:\n${code}\n\nيرجى إدخاله لتعيين كلمة مرور جديدة.`);
    window.location.href = `mailto:${adminEmail}?subject=${mailSubject}&body=${mailBody}`;
    setOtpSentNotice(`تم فتح البريد الإلكتروني لإرسال كود الاستعادة إلى ${adminEmail}`);
  };

  // 3. Complete Password Reset using OTP
  const handleVerifyOtpAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setRecoveryErrorMsg(lang === 'ar' ? 'كود التحقق غير صحيح، يرجى التأكد من الرمز المرسل.' : 'Invalid recovery OTP code.');
      return;
    }
    if (recoveryNewPass.length < 4) {
      setRecoveryErrorMsg(lang === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون 4 أرقام أو حروف على الأقل.' : 'New password must be at least 4 chars.');
      return;
    }
    try {
      localStorage.setItem(PIN_STORAGE_KEY, recoveryNewPass);
      setAdminPin(recoveryNewPass);
      setRecoverySuccessMsg('تم تعيين كلمة المرور الجديدة بنجاح! يتم الآن تسجيل الدخول...');
      setTimeout(() => {
        setIsAuthenticated(true);
        setIsForgotPasswordView(false);
      }, 1500);
    } catch (e) {
      console.error(e);
    }
  };

  // Ban or Unban a subscriber
  const toggleBanSubscriber = (id: number | string) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        const nextBanned = !b.isBanned;
        return {
          ...b,
          isBanned: nextBanned,
          status: nextBanned ? ('hidden' as const) : ('active' as const),
          banReason: nextBanned ? 'تم حظر المشترك لمخالفة الشروط' : undefined,
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  // Bulk hide expired subscriptions after subscription ends without renewal
  const handleBulkHideExpired = () => {
    const now = Date.now();
    let hiddenCount = 0;
    const updated = businesses.map((b) => {
      if (b.status === 'expired' || b.expiry < now) {
        hiddenCount++;
        return { ...b, status: 'hidden' as const };
      }
      return b;
    });
    onUpdateBusiness(updated);
    alert(`🔒 تم بنجاح إخفاء (${hiddenCount}) إعلانات منتهية غير مجددة من الظهور العام حفاظاً على مصداقية المنصة!`);
  };

  // Admin approval & publication alert
  const handleApproveAndNotify = (biz: Business) => {
    const updated = businesses.map((b) =>
      b.id === biz.id ? { ...b, status: 'active' as const } : b
    );
    onUpdateBusiness(updated);
    const msg = `🎉 تهانينا! تمت مراجعة ومعاينة إعلانكم (${biz.name}) والموافقة عليه رسمياً من إدارة منصة إعلانك E3lanak.\n\nإعلانكم الآن نشط ويظهر للجميع على الخريطة وقوائم الأسعار والريلز.\n\nتنويه قانوني: يقع كل ما ينشره المشترك تحت مسؤوليته القانونية والجنائية الكاملة وفقاً لشروط المنصة.`;
    sendWhatsAppMessage(biz.phone, msg);
    alert(`✅ تمت الموافقة على نشر إعلان ${biz.name} وإرسال إشعار التفعيل والموافقة!`);
  };

  // Admin rejection & deletion with reason alert
  const handleRejectAndNotify = (biz: Business) => {
    const reason = prompt(
      `يرجى كتابة سبب رفض أو حذف إعلان (${biz.name}) لإرساله في تنبيه للمشترك:`,
      'مخالفة معايير المحتوى أو الشروط القانونية للمنصة'
    );
    if (reason === null) return;
    const updated = businesses.filter((b) => b.id !== biz.id);
    onUpdateBusiness(updated);
    const msg = `⚠️ إشعار رسمي من إدارة منصة إعلانك:\nنود إبلاغكم بأنه تم رفض/حذف إعلان (${biz.name}) من المنصة للأسباب التالية:\n${reason}\n\nيرجى التواصل مع الإدارة لتصحيح البيانات وإعادة المراجعة.`;
    sendWhatsAppMessage(biz.phone, msg);
    alert(`❌ تم رفض وحذف إعلان ${biz.name} وإرسال تنبيه بالسبب للمشترك.`);
  };

  // Verify / Approve License Document
  const handleVerifyLicense = (id: number | string, approved: boolean) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          licenseVerified: approved,
          verified: approved ? 1 : b.verified,
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
    alert(approved ? '✅ تم اعتماد الرخصة الرسمية للنشاط بنجاح!' : '❌ تم رفض وثيقة النشاط.');
  };

  // Video compression handler for admin media editor
  const handleAdminVideoUpload = async (file: File) => {
    if (!file || !file.type.startsWith('video')) return;
    setIsCompressingAdminVideo(true);
    setAdminCompressProgress(15);
    try {
      const res = await compressVideoFile(file, (p) => setAdminCompressProgress(p));
      setAdminVideoStats(res);
      setNewVideoUrl(res.compressedUrl);
    } catch (err) {
      console.error('Video compression error:', err);
      const raw = URL.createObjectURL(file);
      setNewVideoUrl(raw);
    } finally {
      setIsCompressingAdminVideo(false);
      setAdminCompressProgress(0);
    }
  };

  // Actions on Listings
  const toggleVisibility = (id: number | string) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          status: b.status === 'active' ? ('hidden' as const) : ('active' as const),
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  const extendDays = (id: number | string, days: number) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        const base = Math.max(Date.now(), b.expiry);
        return {
          ...b,
          expiry: base + days * 86400000,
          status: 'active' as const,
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  const toggleVerified = (id: number | string) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        return {
          ...b,
          verified: b.verified === 1 ? 0 : 1,
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  const deleteBusiness = (id: number | string) => {
    if (window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا النشاط نهائياً؟' : 'Are you sure you want to delete this listing?')) {
      const updated = businesses.filter((b) => b.id !== id);
      onUpdateBusiness(updated);
    }
  };

  // Admin Mute / Unmute soundtrack for any business
  const toggleAdminMuteBusiness = (id: number | string) => {
    const updated = businesses.map((b) => {
      if (b.id === id) {
        const currentSoundtrack = b.soundtrack || {
          title: 'خلفية صوتية',
          url: 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3',
          isMuted: false,
        };
        const nextMuted = !currentSoundtrack.mutedByAdmin;
        return {
          ...b,
          soundtrack: {
            ...currentSoundtrack,
            isMuted: nextMuted ? true : currentSoundtrack.isMuted,
            mutedByAdmin: nextMuted,
            adminMuteReason: nextMuted 
              ? (lang === 'ar' ? 'تم كتم الصوت إجبارياً بقرار إدارة إعلانك' : 'Muted by Admin')
              : undefined,
            updatedAt: Date.now(),
          },
        };
      }
      return b;
    });
    onUpdateBusiness(updated);
  };

  const exportCsv = () => {
    const csv = Papa.unparse(
      businesses.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.cat,
        city: b.city,
        address: b.addr,
        phones: (b.phones || [b.phone]).join(' / '),
        status: b.status,
        package: b.pkg,
        expiryDate: new Date(b.expiry).toLocaleDateString('ar-EG'),
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dalilk_subscribers_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1-Click Import Famous Place with 1-Month Free (30 Days)
  const handleImportFamousPlace = (place: FamousPlaceCandidate) => {
    const newBiz: Business = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: place.name,
      cat: place.cat,
      city: place.city,
      addr: place.addr,
      bio: place.bio,
      verified: 1, // Pre-verified famous place
      phone: place.phone,
      phones: place.phones,
      videos: [place.video],
      images: [place.image],
      services: place.services,
      hours: place.hours,
      expiry: Date.now() + 30 * 86400000, // 30 Days Free Month!
      status: 'active',
      pkg: 399,
      likes: Math.floor(place.rating * 400),
      lat: place.lat,
      lng: place.lng,
      rating: place.rating,
      googleBusinessUrl: place.googleBusinessUrl,
      googleMapsUrl: place.googleMapsUrl,
      isSponsored: false,
    };

    onUpdateBusiness([newBiz, ...businesses]);
    setAddedCandidateIds((prev) => new Set(prev).add(place.name));
  };

  // Add Custom Famous Place
  const handleAddCustomPlace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const newBiz: Business = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      name: customName.trim(),
      cat: customCat,
      city: customCity,
      addr: customAddr.trim() || customCity,
      bio: `أفضل وأشهر خدمات ${customCat} في ${customCity}. عرض ترويجي خاص لمدة شهر مجاناً على منصة إعلانك.`,
      verified: 1,
      phone: customPhone.trim() || '01006656669',
      phones: [customPhone.trim() || '01006656669'],
      videos: [DEFAULT_VIDEOS[0]],
      images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'],
      services: [{ n: 'خدمة / وجبة مميزة', p: '250 ج.م' }],
      hours: '10:00 ص - 12:00 ص',
      expiry: Date.now() + 30 * 86400000, // 30 Days Free!
      status: 'active',
      pkg: 399,
      likes: 85,
      lat: 30.0444,
      lng: 31.2357,
      rating: 4.8,
      googleBusinessUrl: `https://business.google.com/search?q=${encodeURIComponent(`${customName} ${customCity}`)}`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(`${customName} ${customCity}`)}`,
    };

    onUpdateBusiness([newBiz, ...businesses]);
    setAddedCandidateIds((prev) => new Set(prev).add(customName.trim()));
    setCustomName('');
    setCustomAddr('');
  };

  // Save Media & Geo Updates
  const handleSaveMediaGeo = () => {
    if (!selectedBizForMedia) return;

    const updated = businesses.map((b) => {
      if (b.id === selectedBizForMedia.id) {
        const vids = newVideoUrl.trim() ? [newVideoUrl.trim(), ...b.videos] : b.videos;
        const latVal = parseFloat(newLat) || b.lat;
        const lngVal = parseFloat(newLng) || b.lng;
        const gUrl = newGoogleBizUrl.trim() || b.googleBusinessUrl;

        return {
          ...b,
          videos: vids,
          lat: latVal,
          lng: lngVal,
          googleBusinessUrl: gUrl,
          googleMapsUrl: `https://maps.google.com/?q=${latVal},${lngVal}`,
          poster: adminVideoStats?.posterUrl || b.poster,
          videoStats: adminVideoStats
            ? {
                originalSizeMb: adminVideoStats.originalSizeMb,
                compressedSizeMb: adminVideoStats.compressedSizeMb,
                compressionRatio: adminVideoStats.compressionRatio,
              }
            : b.videoStats,
        };
      }
      return b;
    });

    onUpdateBusiness(updated);
    setSelectedBizForMedia(null);
    setNewVideoUrl('');
    setAdminVideoStats(null);
    alert(lang === 'ar' ? '✅ تم تحديث الفيديو والموقع الجغرافي بنجاح!' : 'Media & Location updated successfully!');
  };

  // Candidate Filter
  const filteredCandidates = useMemo(() => {
    const q = discoveryQuery.trim().toLowerCase();
    if (!q) return FAMOUS_PLACES_CATALOG;
    return FAMOUS_PLACES_CATALOG.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.cat.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.addr.toLowerCase().includes(q)
    );
  }, [discoveryQuery]);

  // Listings Filter
  const filteredListings = businesses.filter((b) => {
    const q = adminSearch.toLowerCase();
    const phonesStr = (b.phones || [b.phone]).join(' ');
    const matchesQuery =
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.cat.toLowerCase().includes(q) ||
      phonesStr.includes(q);

    if (!matchesQuery) return false;

    if (filterMode === 'active') return b.status === 'active' && b.expiry >= Date.now();
    if (filterMode === 'exp') return b.status === 'expired' || b.expiry < Date.now();
    if (filterMode === 'weekAlert') {
      const days = Math.ceil((b.expiry - Date.now()) / 86400000);
      return days > 0 && days <= 7;
    }

    return true;
  });

  // Expiring or Expired Subscribers for Reminders
  const expiringSubscribers = businesses.filter((b) => {
    const days = Math.ceil((b.expiry - Date.now()) / 86400000);
    return days <= 15; // 15 days or less remaining, or expired
  });

  const activeCount = businesses.filter((b) => b.status === 'active' && b.expiry >= Date.now()).length;
  const expiredCount = businesses.filter((b) => b.status === 'expired' || b.expiry < Date.now()).length;
  const weekAlertCount = businesses.filter((b) => {
    const days = Math.ceil((b.expiry - Date.now()) / 86400000);
    return days > 0 && days <= 7;
  }).length;
  const totalRevenue = businesses.reduce((acc, curr) => acc + (curr.pkg || 0), 0);

  return (
    <div className="fixed inset-0 z-[70] bg-black/90 backdrop-blur-md overflow-y-auto flex justify-center p-0 sm:p-4">
      <div className="relative w-full max-w-5xl bg-neutral-950 text-white min-h-full sm:min-h-0 sm:my-auto sm:rounded-3xl border border-white/10 shadow-2xl p-4 sm:p-6 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>لوحة التحكم والإدارة (Admin Dashboard)</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5 text-amber-400" />
                  <span>دخول مشفر ومحمي</span>
                </span>
              </h2>
              <p className="text-[11px] text-white/50">
                إدارة الأنشطة • رقابة المحتوى ومنع الإساءة • تذكيرات WhatsApp • ضغط الفيديوهات وGoogle Maps
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setIsAuthenticated(false);
                  setPasswordInput('');
                }}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="قفل لوحة الإدارة وتأمين الصفحات بكلمة المرور"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>قفل اللوحة 🔒</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Authentication State */}
        {!isAuthenticated ? (
          !isForgotPasswordView ? (
            <form onSubmit={handleLogin} className="py-10 max-w-sm mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  تسجيل دخول الإدارة (Admin Security Login)
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  يرجى إدخال كلمة المرور السرية للمسؤول للمتابعة
                </p>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoFocus
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="أدخل كلمة المرور السرية ••••••••"
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-3 text-center text-base text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest placeholder:tracking-normal"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-1"
                  title={showPassword ? 'إخفاء كلمة السر' : 'إظهار كلمة السر'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {errorMsg && (
                <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 py-1.5 px-3 rounded-xl">{errorMsg}</p>
              )}
              
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-400/20"
              >
                تسجيل الدخول الآمن 🛡️
              </button>

              {/* Forgot Password Trigger Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordView(true);
                    setRecoveryErrorMsg('');
                    setRecoverySuccessMsg('');
                    setOtpSentNotice(null);
                  }}
                  className="text-xs text-amber-400 hover:text-amber-300 underline font-bold transition cursor-pointer"
                >
                  🔑 نسيت كلمة المرور؟ (استعادة عبر رقم الهاتف والإيميل)
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password / OTP Recovery View */
            <div className="py-8 max-w-md mx-auto text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center mx-auto text-blue-400 shadow-lg shadow-blue-500/20">
                <KeyRound className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">
                  استعادة كلمة المرور السرية للأدمن
                </h3>
                <p className="text-xs text-white/60 mt-1">
                  اختر وسيلة إرسال كود التحقق لاستعادة وتغيير كلمة المرور فوراً:
                </p>
              </div>

              {/* Channels: WhatsApp & Email Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={handleSendRecoveryWhatsApp}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-black font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                >
                  <MessageCircle className="w-4 h-4 fill-black text-white" />
                  <span>إرسال كود واتساب ({adminPhone})</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendRecoveryEmail}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold p-3 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer shadow"
                >
                  <Mail className="w-4 h-4" />
                  <span>إرسال إلى الإيميل</span>
                </button>
              </div>

              {otpSentNotice && (
                <div className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs p-2.5 rounded-xl font-medium">
                  {otpSentNotice}
                </div>
              )}

              {/* OTP & New Password Form */}
              <form onSubmit={handleVerifyOtpAndReset} className="space-y-3 pt-2 text-start">
                <div>
                  <label className="text-xs text-white/80 font-bold block mb-1">
                    أدخل كود التحقق المكون من 6 أرقام:
                  </label>
                  <input
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="مثال: 582194"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-center text-sm font-mono text-white focus:outline-none focus:border-amber-400 tracking-widest"
                  />
                </div>

                <div>
                  <label className="text-xs text-white/80 font-bold block mb-1">
                    كلمة المرور السرية الجديدة:
                  </label>
                  <input
                    type="password"
                    value={recoveryNewPass}
                    onChange={(e) => setRecoveryNewPass(e.target.value)}
                    placeholder="أدخل كلمة المرور الجديدة (4 رموز أو أكثر)"
                    className="w-full bg-white/10 border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                {recoveryErrorMsg && (
                  <p className="text-xs text-red-400 font-bold bg-red-500/10 border border-red-500/20 p-2 rounded-xl text-center">
                    {recoveryErrorMsg}
                  </p>
                )}

                {recoverySuccessMsg && (
                  <p className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl text-center">
                    {recoverySuccessMsg}
                  </p>
                )}

                <button
                  type="submit"
                  className="w-full bg-amber-400 hover:bg-amber-300 text-black font-black py-3 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-amber-400/20"
                >
                  تأكيد وتعيين كلمة المرور الجديدة 🔒
                </button>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordView(false)}
                  className="w-full bg-white/10 hover:bg-white/15 text-white/70 font-bold py-2 rounded-xl text-xs transition cursor-pointer text-center"
                >
                  رجوع إلى تسجيل الدخول
                </button>
              </form>
            </div>
          )
        ) : (
          <div className="mt-4 space-y-4">
            {/* Top Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5 p-1 bg-white/5 rounded-2xl border border-white/10">
              {/* Tab 1: Listings */}
              <button
                onClick={() => setActiveTab('listings')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'listings'
                    ? 'bg-white text-black shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>المشتركين ({businesses.length})</span>
              </button>

              {/* Tab 2: Licenses & Documents (NEW - Admin Eyes Only) */}
              <button
                onClick={() => setActiveTab('licenses')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                  activeTab === 'licenses'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>رخص ومستندات 📄</span>
                {businesses.some((b) => b.licenseDocUrl && !b.licenseVerified) && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute top-2 end-2" />
                )}
              </button>

              {/* Tab 3: Content Moderation & Anti-Abuse */}
              <button
                onClick={() => setActiveTab('moderation')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                  activeTab === 'moderation'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>رقابة المحتوى 🚨</span>
              </button>

              {/* Tab 4: Reminders */}
              <button
                onClick={() => setActiveTab('reminders')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                  activeTab === 'reminders'
                    ? 'bg-[#25D366] text-black shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>تذكيرات واتساب ({expiringSubscribers.length})</span>
              </button>

              {/* Tab 5: Discovery */}
              <button
                onClick={() => setActiveTab('discovery')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'discovery'
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>محلات مجاناً 🎁</span>
              </button>

              {/* Tab 6: Video Compression & Geo Settings */}
              <button
                onClick={() => setActiveTab('media_geo')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'media_geo'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>فيديوهات وموقع 📍</span>
              </button>

              {/* Tab 7: Customer Videos & Animated Text */}
              <button
                onClick={() => setActiveTab('customer_posts')}
                className={`py-2 px-2 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'customer_posts'
                    ? 'bg-gradient-to-r from-purple-600 via-[#FF2D55] to-amber-500 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>مشاركات العملاء ({allCustomerPosts.length}) 🎬</span>
              </button>

              {/* Tab 8: Staff & Assistant Admins (1-8) & Publication Approval */}
              <button
                onClick={() => setActiveTab('staff_assistants')}
                className={`py-2 px-2.5 rounded-xl text-[11px] font-black transition flex items-center justify-center gap-1.5 relative ${
                  activeTab === 'staff_assistants'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-white/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                <span>المساعدين واعتماد النشر (1-8) 👥</span>
                {pendingSubmissions.some((s) => s.status === 'pending') && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping absolute -top-1 -end-1" />
                )}
              </button>
            </div>

            {/* TAB 1: LISTINGS MANAGEMENT */}
            {activeTab === 'listings' && (
              <div className="space-y-4">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-white/60">{t.totalBiz}</div>
                    <div className="text-xl font-black text-white mt-0.5">
                      {businesses.length}
                    </div>
                  </div>

                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-emerald-400">{t.activeBiz}</div>
                    <div className="text-xl font-black text-emerald-400 mt-0.5">
                      {activeCount}
                    </div>
                  </div>

                  <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-red-400">{t.expiredBiz}</div>
                    <div className="text-xl font-black text-red-400 mt-0.5">
                      {expiredCount}
                    </div>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-amber-400">إجمالي الباقات</div>
                    <div className="text-xl font-black text-amber-400 mt-0.5">
                      {totalRevenue} ج.م
                    </div>
                  </div>
                </div>

                {/* Filters & Tools */}
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute start-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={adminSearch}
                      onChange={(e) => setAdminSearch(e.target.value)}
                      placeholder={t.searchAdmin}
                      className="w-full bg-white/10 border border-white/10 rounded-full ps-8 pe-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF2D55]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
                    <button
                      onClick={() => setFilterMode('all')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        filterMode === 'all' ? 'bg-white text-black font-black' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {t.allStatus} ({businesses.length})
                    </button>
                    <button
                      onClick={() => setFilterMode('active')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        filterMode === 'active' ? 'bg-emerald-600 text-white font-black' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {t.activeStatus} ({activeCount})
                    </button>
                    <button
                      onClick={() => setFilterMode('weekAlert')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1 ${
                        filterMode === 'weekAlert'
                          ? 'bg-amber-400 text-black font-black shadow-md'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
                      }`}
                      title="أنشطة ينتهي اشتراكها خلال 7 أيام لإرسال تذكيرات أسبوعية"
                    >
                      <span>🔔 تنبيه أسبوع ({weekAlertCount})</span>
                    </button>
                    <button
                      onClick={() => setFilterMode('exp')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                        filterMode === 'exp' ? 'bg-red-600 text-white font-black' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {t.expiredStatus} ({expiredCount})
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                    <button
                      onClick={() => setIsAddListingOpen(true)}
                      className="bg-[#FF2D55] hover:bg-[#ff4f72] text-white px-3 py-1 rounded-full text-[11px] font-black flex items-center gap-1 transition shadow-md shadow-[#FF2D55]/30 cursor-pointer"
                      title="إضافة نشاط تجاري جديد مباشرة من الإدارة"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>إضافة نشاط جديد ➕</span>
                    </button>
                    <button
                      onClick={handleBulkHideExpired}
                      className="bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="إخفاء كافة الاشتراكات المنتهية غير المجددة فوراً من الظهور العام"
                    >
                      <Lock className="w-3 h-3 text-red-400" />
                      <span>إخفاء المنتهية فوراً 🔒</span>
                    </button>
                    <button
                      onClick={exportCsv}
                      className="bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="تصدير ملف CSV"
                    >
                      <Download className="w-3 h-3" />
                      <span>تصدير CSV</span>
                    </button>
                    <button
                      onClick={onResetData}
                      className="bg-white/10 hover:bg-white/20 text-white/70 hover:text-white px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      title="استعادة البيانات الافتراضية"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>إعادة ضبط</span>
                    </button>
                  </div>
                </div>

                {/* Legal Policy & Admin Moderation Banner */}
                <div className="bg-red-950/40 border border-red-500/40 p-2.5 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-white/90">
                      <strong>سياسة النشر والرقابة:</strong> لا يُنشر أي إعلان إلا بعد موافقة ومعاينة الإدارة • كل ما ينشره المشترك يقع تحت <strong>مسؤوليته القانونية والجنائية</strong> • تُخفى الإعلانات المنتهية تلقائياً عند عدم التجديد.
                    </span>
                  </div>
                  <span className="text-[10px] bg-red-600/30 text-red-200 border border-red-400/30 px-2 py-0.5 rounded-full font-bold">
                    معايير أمان إعلانك 🛡️
                  </span>
                </div>

                {/* Businesses List */}
                <div className="space-y-2 max-h-[50vh] overflow-y-auto hide-scroll pr-1">
                  {filteredListings.map((b) => {
                    const daysLeft = Math.ceil((b.expiry - Date.now()) / 86400000);
                    const isExpired = daysLeft <= 0 || b.status === 'expired';
                    const isWeekAlert = daysLeft > 0 && daysLeft <= 7;
                    const expiryDateFormatted = new Date(b.expiry).toLocaleDateString('ar-EG');

                    return (
                      <div
                        key={b.id}
                        className={`border rounded-2xl p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 transition ${
                          isWeekAlert
                            ? 'bg-amber-500/10 border-amber-400/40'
                            : isExpired
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-white/5 hover:bg-white/[0.08] border-white/10'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-black text-sm text-white">{b.name}</span>
                            {b.verified === 1 && (
                              <CheckCircle className="w-3.5 h-3.5 fill-[#20D5EC] text-black" />
                            )}
                            <span className="text-[10px] text-white/50">
                              ({b.city} • {b.cat})
                            </span>
                            {b.googleBusinessUrl && (
                              <a
                                href={b.googleBusinessUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.5 rounded flex items-center gap-0.5"
                              >
                                <span>Google Business</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] flex-wrap">
                            {/* Remaining duration prominently in Admin Page */}
                            <span
                              className={`font-black px-2.5 py-0.5 rounded-full text-[10px] ${
                                isExpired
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : isWeekAlert
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                                  : b.status === 'hidden'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              }`}
                            >
                              {b.status === 'hidden'
                                ? 'مخفي يدوي'
                                : isExpired
                                ? '⛔ منتهي (قطع الإعلان)'
                                : isWeekAlert
                                ? `⚠️ ينتهي خلال ${daysLeft} أيام (تنبيه أسبوع)`
                                : `✅ نشط (متبقي ${daysLeft} يوم)`}
                            </span>

                            <span className="text-white/40 text-[10px]">
                              ينتهي: <span className="font-mono text-white/70">{expiryDateFormatted}</span>
                            </span>

                            <span className="text-white/50 dir-ltr font-mono text-[10px]">
                              {(b.phones || [b.phone]).join(' | ')}
                            </span>

                            <span className="text-amber-300 font-bold text-[10px]">
                              {b.pkg} ج.م
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                          {/* Admin Approval & Publish Alert */}
                          <button
                            onClick={() => handleApproveAndNotify(b)}
                            className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="الموافقة الرسمية على نشر الإعلان وإرسال إشعار تفعيل للمشترك"
                          >
                            <span>موافقة ونشر ✓</span>
                          </button>

                          {/* Admin Rejection & Deletion Alert */}
                          <button
                            onClick={() => handleRejectAndNotify(b)}
                            className="bg-rose-600/30 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="رفض أو حذف الإعلان مع إرسال تنبيه رسمي بالسبب"
                          >
                            <span>رفض/حذف ✕</span>
                          </button>

                          {/* Live Ad Preview */}
                          <button
                            onClick={() => setAdToPreview(b)}
                            className="bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="معاينة الإعلان كما يظهر للمستخدمين"
                          >
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span>معاينة</span>
                          </button>

                          {/* Full Edit Subscriber Modal Trigger */}
                          <button
                            onClick={() => setEditingBiz(b)}
                            className="bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="تعديل بيانات النشاط والصور والفيديوهات"
                          >
                            <Edit3 className="w-3 h-3 text-purple-400" />
                            <span>تعديل ✏️</span>
                          </button>

                          {/* Send WhatsApp Reminder */}
                          <button
                            onClick={() => {
                              const msg = isWeekAlert
                                ? generateOneWeekWarningMessage(b)
                                : generateExpiryReminderMessage(b, daysLeft);
                              sendWhatsAppMessage(b.phone, msg);
                            }}
                            className="bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="إرسال تذكير التجديد والدفع للنشاط عبر واتساب"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>واتساب</span>
                          </button>

                          {/* Send SMS Direct */}
                          <button
                            onClick={() => {
                              const msg = isWeekAlert
                                ? generateOneWeekWarningMessage(b)
                                : generateExpiryReminderMessage(b, daysLeft);
                              sendSmsMessage(b.phone, msg);
                            }}
                            className="bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/40 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="إرسال رسالة نصية قصيرة SMS"
                          >
                            <Phone className="w-3 h-3" />
                            <span>SMS</span>
                          </button>

                          {/* Hide/Show */}
                          <button
                            onClick={() => toggleVisibility(b.id)}
                            className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                          >
                            {b.status === 'active' ? (
                              <>
                                <EyeOff className="w-3 h-3 text-yellow-400" />
                                <span>{t.hide}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3 text-emerald-400" />
                                <span>{t.show}</span>
                              </>
                            )}
                          </button>

                          {/* Verify toggle */}
                          <button
                            onClick={() => toggleVerified(b.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition cursor-pointer ${
                              b.verified === 1
                                ? 'bg-[#20D5EC]/20 border-[#20D5EC]/40 text-[#20D5EC]'
                                : 'bg-white/10 border-white/10 text-white/60 hover:text-white'
                            }`}
                          >
                            {b.verified === 1 ? '✓ موثق' : 'غير موثق'}
                          </button>

                          {/* +30 Days extension */}
                          <button
                            onClick={() => extendDays(b.id, 30)}
                            className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer"
                            title="تمديد 30 يوم إضافية"
                          >
                            <Calendar className="w-3 h-3" />
                            <span>+30 يوم</span>
                          </button>

                          {/* Admin Audio Mute/Unmute */}
                          <button
                            onClick={() => toggleAdminMuteBusiness(b.id)}
                            className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition cursor-pointer border ${
                              b.soundtrack?.mutedByAdmin
                                ? 'bg-red-500 text-white border-red-400 hover:bg-red-600 animate-pulse'
                                : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/15'
                            }`}
                            title={b.soundtrack?.mutedByAdmin ? 'فك كتم الصوت الإداري' : 'كتم الصوت على الإعلان من الإدارة'}
                          >
                            {b.soundtrack?.mutedByAdmin ? (
                              <>
                                <VolumeX className="w-3 h-3 text-white" />
                                <span>مكتوم إدارياً 🔇</span>
                              </>
                            ) : (
                              <>
                                <Volume2 className="w-3 h-3 text-amber-300" />
                                <span>كتم الصوت</span>
                              </>
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => deleteBusiness(b.id)}
                            className="bg-red-600/80 hover:bg-red-600 text-white p-1 rounded-lg transition cursor-pointer"
                            title="حذف النشاط نهائياً"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 2: CONTENT MODERATION & ANTI-ABUSE/POLITICS FILTER */}
            {activeTab === 'moderation' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-red-950/40 to-neutral-900 border border-red-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-black text-sm">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>نظام الرقابة الآلي والفلترة ضد الإساءة والسياسة والشتائم والألفاظ النابية</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    يقوم النظام بفحص جميع الأنشطة التجارية تلقائياً. أي إعلان يحتوي على شتائم، ألفاظ نابية، أو شعارات سياسية وحزبية يتم <b>إيقاف عرضه فوراً</b> من الدليل لحماية المستخدمين. يمكنك هنا مراجعة المخالفات وإعادة تدقيقها يدوياً.
                  </p>
                </div>

                {/* Moderation Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                    <div className="text-[11px] text-white/60">إجمالي الأنشطة الخاضعة للفحص</div>
                    <div className="text-xl font-black text-white mt-0.5">{businesses.length}</div>
                  </div>

                  {(() => {
                    const flaggedList = businesses.filter((b) => !auditBusinessContent(b).isValid);
                    const cleanList = businesses.filter((b) => auditBusinessContent(b).isValid);
                    return (
                      <>
                        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-3 text-center">
                          <div className="text-[11px] text-red-400">إعلانات مخالفة وموقوفة 🚨</div>
                          <div className="text-xl font-black text-red-400 mt-0.5">{flaggedList.length}</div>
                        </div>

                        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3 text-center">
                          <div className="text-[11px] text-emerald-400">إعلانات سليمة ومعتمدة 100% ✅</div>
                          <div className="text-xl font-black text-emerald-400 mt-0.5">{cleanList.length}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    onClick={() => setModerationFilter('all')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      moderationFilter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    عرض الكل ({businesses.length})
                  </button>
                  <button
                    onClick={() => setModerationFilter('flagged')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      moderationFilter === 'flagged' ? 'bg-red-600 text-white' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    ⚠️ المحتوى المخالف والموقوف فقط
                  </button>
                  <button
                    onClick={() => setModerationFilter('clean')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition cursor-pointer ${
                      moderationFilter === 'clean' ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/80'
                    }`}
                  >
                    ✅ السليم والمعتمد
                  </button>
                </div>

                {/* Business Moderation Cards List */}
                <div className="space-y-2.5 max-h-[45vh] overflow-y-auto hide-scroll pr-1">
                  {businesses
                    .filter((b) => {
                      const audit = auditBusinessContent(b);
                      if (moderationFilter === 'flagged') return !audit.isValid;
                      if (moderationFilter === 'clean') return audit.isValid;
                      return true;
                    })
                    .map((b) => {
                      const audit = auditBusinessContent(b);
                      const isFlagged = !audit.isValid;

                      return (
                        <div
                          key={b.id}
                          className={`rounded-2xl p-3.5 border transition space-y-2.5 ${
                            isFlagged
                              ? 'bg-red-500/10 border-red-500/50'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-sm text-white">{b.name}</span>
                                <span className="text-[11px] text-white/60">({b.city} • {b.cat})</span>
                                {isFlagged ? (
                                  <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-red-500/40 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    <span>موقوف للمخالفة</span>
                                  </span>
                                ) : (
                                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>سليم ومعتمد</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-white/70 line-clamp-1 mt-1">{b.bio}</p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                              <button
                                onClick={() => setAdToPreview(b)}
                                className="bg-amber-400/20 hover:bg-amber-400 text-amber-300 hover:text-black border border-amber-400/40 px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>معاينة الإعلان</span>
                              </button>

                              {b.status === 'active' && !isFlagged ? (
                                <button
                                  onClick={() => toggleVisibility(b.id)}
                                  className="bg-yellow-500/20 hover:bg-yellow-500 text-yellow-300 hover:text-black border border-yellow-500/40 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                  إيقاف مؤقت
                                </button>
                              ) : (
                                <button
                                  onClick={() => toggleVisibility(b.id)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer"
                                >
                                  تفعيل ونشر
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Violating words banner if flagged */}
                          {isFlagged && (
                            <div className="bg-black/60 border border-red-500/40 rounded-xl p-2.5 text-xs text-red-200">
                              <span className="text-red-400 font-bold block mb-1">
                                سبب الإيقاف التلقائي: {audit.errorMessage}
                              </span>
                              <div className="text-[11px] font-mono">
                                الكلمات المخالفة المرصودة:{' '}
                                <span className="bg-red-950 px-2 py-0.5 rounded text-white font-bold border border-red-500/30">
                                  {audit.flaggedWords.join(', ')}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* Interactive Content Moderation Sandbox & Password Change Box */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* Sandbox Text Tester */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-xs">
                      <Search className="w-3.5 h-3.5" />
                      <span>أداة فحص واختبار النصوص ضد الشتائم والسياسة:</span>
                    </div>
                    <textarea
                      rows={2}
                      value={sandboxText}
                      onChange={(e) => {
                        setSandboxText(e.target.value);
                        if (e.target.value.trim()) {
                          setSandboxResult(scanTextModeration(e.target.value));
                        } else {
                          setSandboxResult(null);
                        }
                      }}
                      placeholder="اكتب أو الصق أي نص أو إعلان هنا لتجربة الفحص الآلي..."
                      className="w-full bg-white/10 border border-white/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-400 resize-none"
                    />

                    {sandboxResult && (
                      <div className={`p-2 rounded-xl text-xs border ${
                        sandboxResult.isValid
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                          : 'bg-red-500/10 border-red-500/30 text-red-300'
                      }`}>
                        {sandboxResult.isValid ? (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            <span>النص سليم 100% ومتوافق مع سياسة النشر.</span>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 font-bold text-red-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{sandboxResult.errorMessage}</span>
                            </div>
                            <div className="text-[11px] font-mono">
                              الكلمات المخالفة: {sandboxResult.flaggedWords.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Admin Secret Password Management */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-white font-black text-xs">
                      <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                      <span>إدارة كلمة المرور والرمز السري للوحة (Admin PIN):</span>
                    </div>
                    <p className="text-[11px] text-white/60">
                      يمكنك تغيير الرمز السري للوحة الإدارة لحمايتها وإخفائها عن الزوار.
                    </p>
                    <form onSubmit={handleChangePin} className="flex gap-2">
                      <input
                        type="password"
                        value={newPinInput}
                        onChange={(e) => setNewPinInput(e.target.value)}
                        placeholder="أدخل كلمة المرور السرية الجديدة"
                        className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="submit"
                        className="bg-amber-400 hover:bg-amber-300 text-black font-black px-3 py-1.5 rounded-xl text-xs transition cursor-pointer"
                      >
                        حفظ الرمز 🔒
                      </button>
                    </form>
                    {pinChangeSuccess && (
                      <p className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>تم تحديث كلمة المرور السرية بنجاح!</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP EXPIRY REMINDERS DISPATCHER */}
            {activeTab === 'reminders' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-emerald-950/40 to-neutral-900 border border-emerald-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                    <MessageCircle className="w-5 h-5 fill-emerald-400 text-black" />
                    <span>مرسل تذكيرات التجديد عبر واتساب (WhatsApp Reminder Dispatcher)</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    هنا تظهر جميع الأنشطة المنتهية أو التي يتبقى على فترتها 15 يوماً أو أقل. يمكنك إرسال رسالة التذكير الرسمية المحتوية على تفاصيل الحساب البنكي وفودافون كاش وإنستا باي (<b>{PAYMENT_PHONE}</b>) بنقرة واحدة!
                  </p>
                </div>

                <div className="space-y-2.5 max-h-[55vh] overflow-y-auto hide-scroll">
                  {expiringSubscribers.length === 0 ? (
                    <div className="text-center py-12 text-white/50 text-xs bg-white/5 rounded-2xl p-6">
                      🎉 لا توجد أنشطة تحتاج إلى تذكير حالياً (جميع الاشتراكات سارية ولديها أكثر من 15 يوماً).
                    </div>
                  ) : (
                    expiringSubscribers.map((b) => {
                      const daysLeft = Math.ceil((b.expiry - Date.now()) / 86400000);
                      const isExpired = daysLeft <= 0;
                      const msg = generateExpiryReminderMessage(b, daysLeft);

                      return (
                        <div
                          key={b.id}
                          className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm text-white">{b.name}</span>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    isExpired
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                  }`}
                                >
                                  {isExpired ? 'منتهي الصلاحية' : `متبقي ${daysLeft} يوم`}
                                </span>
                              </div>
                              <div className="text-xs text-white/50 mt-0.5">
                                هاتف النشاط: <span className="dir-ltr font-mono text-white/80">{b.phone}</span> • المدينة: {b.city}
                              </div>
                            </div>

                            <button
                              onClick={() => sendWhatsAppMessage(b.phone, msg)}
                              className="bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-black px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-[#25D366]/30 transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>إرسال التذكير عبر WhatsApp</span>
                            </button>
                          </div>

                          {/* Message Preview Box */}
                          <div className="bg-black/60 border border-white/10 rounded-xl p-2.5 text-[11px] text-white/80 whitespace-pre-wrap font-sans">
                            {msg}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: AUTO-DISCOVERY OF FAMOUS PLACES (30-Day Free Trial) */}
            {activeTab === 'discovery' && (
              <div className="space-y-4">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-neutral-900 border border-amber-400/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-300 font-black text-sm">
                      <Gift className="w-5 h-5 text-amber-400" />
                      <span>استكشاف المحلات والمطاعم المشهورة وتنزيلها (شهر مجاناً 30 يوم)</span>
                    </div>
                    <span className="text-[10px] bg-amber-400 text-black px-2 py-0.5 rounded-full font-bold">
                      Google Business & Maps
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    ابحث عن أشهر المطاعم، الفنادق، الكافيهات، والتوكيلات في مصر. يمكنك تنزيل أي نشاط وإدراجه فوراً في إعلانك E3lanak لمدة <b>شهر كامل مجاناً (30 يوماً)</b> كهدية ترويجية، ثم إرسال رسالة ترحيب عبر الواتساب لإدارة النشاط!
                  </p>
                </div>

                {/* Candidate Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-white/40 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={discoveryQuery}
                    onChange={(e) => setDiscoveryQuery(e.target.value)}
                    placeholder="ابحث عن مكان مشهور: قصر الكبابجي، أبو طارق، بلبن، البرنس، سي جل، العبد، دار الفؤاد..."
                    className="w-full bg-white/10 border border-white/15 rounded-2xl ps-9 pe-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Quick Add Custom Famous Place Accordion */}
                <form onSubmit={handleAddCustomPlace} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>إضافة وتنزيل نشاط تجاري مشهور آخر (شهر مجاناً 30 يوم)</span>
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      required
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="اسم النشاط أو المحل المشهور..."
                      className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={customCity}
                      onChange={(e) => setCustomCity(e.target.value)}
                      placeholder="المدينة (القاهرة، الجيزة...)"
                      className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={customPhone}
                      onChange={(e) => setCustomPhone(e.target.value)}
                      placeholder="هاتف واتساب النشاط"
                      className="bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono dir-ltr"
                    />
                    <button
                      type="submit"
                      className="bg-amber-400 hover:bg-amber-300 text-black font-black px-3 py-1.5 rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>تنزيل (شهر مجاني) 🎁</span>
                    </button>
                  </div>
                </form>

                {/* Candidates Catalog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto hide-scroll pr-1">
                  {filteredCandidates.map((place, idx) => {
                    const isAlreadyAdded =
                      addedCandidateIds.has(place.name) ||
                      businesses.some((b) => b.name.includes(place.name) || place.name.includes(b.name));

                    const welcomeMsg = generateWelcomeFreeMonthMessage(place.name, place.city);

                    return (
                      <div
                        key={idx}
                        className="bg-white/5 border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between space-y-3 hover:border-amber-400/40 transition"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-black text-sm text-white">{place.name}</h4>
                                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-amber-300" />
                                  <span>{place.rating}</span>
                                  <span className="text-white/40">({place.reviewsCount.toLocaleString()})</span>
                                </span>
                              </div>
                              <p className="text-[11px] text-white/50 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 text-[#FF2D55]" />
                                <span>{place.city} - {place.addr}</span>
                              </p>
                            </div>

                            <span className="bg-white/10 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              {place.cat}
                            </span>
                          </div>

                          <p className="text-xs text-white/80 mt-2 line-clamp-2 leading-relaxed">
                            {place.bio}
                          </p>

                          {/* Google Links */}
                          <div className="flex gap-2 mt-2">
                            <a
                              href={place.googleBusinessUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Google Business Profile</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <span className="text-white/20">•</span>
                            <a
                              href={place.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                            >
                              <span>Google Maps</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-white/60 font-mono dir-ltr">
                            {place.phone}
                          </span>

                          <div className="flex items-center gap-2">
                            {!isAlreadyAdded ? (
                              <button
                                onClick={() => handleImportFamousPlace(place)}
                                className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:brightness-110 active:scale-95 text-black font-black px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow-md shadow-amber-400/20 transition cursor-pointer"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>تنزيل (شهر مجاناً) 🎁</span>
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                  <CheckCircle className="w-3 h-3" />
                                  <span>مضاف لشهر مجاناً</span>
                                </span>
                                <button
                                  onClick={() => sendWhatsAppMessage(place.phone, welcomeMsg)}
                                  className="bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm transition"
                                  title="إرسال رسالة ترحيبية بالواتساب للنشاط"
                                >
                                  <MessageCircle className="w-3 h-3 fill-white" />
                                  <span>واتساب ترحيبي 📲</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 4: VIDEO UPLOAD & LOCATION SETTINGS */}
            {activeTab === 'media_geo' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-blue-950/40 to-neutral-900 border border-blue-500/30 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-blue-400 font-black text-sm">
                    <Video className="w-5 h-5 text-blue-400" />
                    <span>تحميل الفيديوهات وتحديد الموقع الجغرافي وGoogle Business</span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    اختر نشاطاً تجارياً لتعديل أو إضافة فيديوهات ريلز جديدة له، أو ربط إحداثيات موقعه الجغرافي على Google Maps وGoogle Business Profile بدقة متناهية.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Select Business List */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                    <h4 className="text-xs font-bold text-white/80">اختر النشاط التجاري:</h4>
                    <div className="max-h-72 overflow-y-auto hide-scroll space-y-1">
                      {businesses.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => {
                            setSelectedBizForMedia(b);
                            setNewLat(b.lat?.toString() || '30.0444');
                            setNewLng(b.lng?.toString() || '31.2357');
                            setNewGoogleBizUrl(b.googleBusinessUrl || '');
                          }}
                          className={`w-full text-start p-2 rounded-xl text-xs transition flex items-center justify-between ${
                            selectedBizForMedia?.id === b.id
                              ? 'bg-blue-600 text-white font-black'
                              : 'bg-white/5 hover:bg-white/10 text-white/80'
                          }`}
                        >
                          <span className="truncate">{b.name}</span>
                          <span className="text-[10px] opacity-60 shrink-0">{b.city}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit Panel */}
                  <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                    {selectedBizForMedia ? (
                      <>
                        <div className="flex items-center justify-between pb-2 border-b border-white/10">
                          <div>
                            <h4 className="font-black text-sm text-white">{selectedBizForMedia.name}</h4>
                            <p className="text-[11px] text-white/50">{selectedBizForMedia.city} • {selectedBizForMedia.addr}</p>
                          </div>
                          <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-500/30">
                            {selectedBizForMedia.cat}
                          </span>
                        </div>

                        {/* Video Upload & Compression Section */}
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-white/80 flex items-center gap-1">
                            <Video className="w-3.5 h-3.5 text-blue-400" />
                            <span>تحميل فيديو ريلز وضغطه تلقائياً:</span>
                          </label>

                          <div 
                            onClick={() => adminVideoFileRef.current?.click()}
                            className="border-2 border-dashed border-blue-500/30 hover:border-blue-400 bg-blue-950/20 rounded-xl p-3 text-center cursor-pointer transition group"
                          >
                            <Upload className="w-5 h-5 mx-auto text-blue-400 mb-1 group-hover:scale-110 transition" />
                            <span className="text-xs font-bold text-white block">
                              اختر أو اسحب ملف فيديو من جهازك (MP4 / WebM / MOV)
                            </span>
                            <span className="text-[10px] text-white/50">
                              يتم ضغط الفيديو تلقائياً فور اختياره لتقليص الحجم بنسبة تصل إلى 80%
                            </span>
                            <input
                              ref={adminVideoFileRef}
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleAdminVideoUpload(f);
                              }}
                            />
                          </div>

                          {/* Compression Progress */}
                          {isCompressingAdminVideo && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 space-y-1.5 animate-pulse">
                              <div className="flex items-center justify-between text-xs text-amber-300">
                                <span className="flex items-center gap-1.5 font-bold">
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                                  جاري ضغط الفيديو وتقليص مساحته...
                                </span>
                                <span className="font-mono font-bold">{adminCompressProgress}%</span>
                              </div>
                              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div 
                                  className="bg-amber-400 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${adminCompressProgress}%` }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Compression Stats Badge */}
                          {adminVideoStats && !isCompressingAdminVideo && (
                            <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-2 px-3 flex items-center justify-between text-xs text-emerald-300">
                              <div className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>
                                  <b>تم ضغط الفيديو بنجاح:</b> {adminVideoStats.originalSizeMb} MB ⬅️ {adminVideoStats.compressedSizeMb} MB
                                </span>
                              </div>
                              <span className="bg-emerald-500/30 text-white font-black text-[10px] px-2 py-0.5 rounded-full">
                                توفير {adminVideoStats.compressionRatio}%
                              </span>
                            </div>
                          )}

                          {/* Direct URL input */}
                          <div className="pt-1 space-y-1">
                            <span className="text-[10px] text-white/50 block">أو أدخل رابط فيديو ريلز خارجي:</span>
                            <input
                              type="url"
                              value={newVideoUrl}
                              onChange={(e) => setNewVideoUrl(e.target.value)}
                              placeholder="https://example.com/video.mp4"
                              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-400 font-mono"
                            />
                          </div>

                          <div className="flex gap-1.5 pt-0.5 overflow-x-auto hide-scroll">
                            <span className="text-[10px] text-white/40 self-center">نماذج سريعة:</span>
                            {DEFAULT_VIDEOS.map((v, vI) => (
                              <button
                                key={vI}
                                type="button"
                                onClick={() => setNewVideoUrl(v)}
                                className="text-[10px] bg-white/10 hover:bg-white/20 text-white/80 px-2 py-0.5 rounded-full"
                              >
                                ريلز {vI + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Coordinates & Google Business */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-white/80">خط العرض (Latitude):</label>
                            <input
                              type="text"
                              value={newLat}
                              onChange={(e) => setNewLat(e.target.value)}
                              placeholder="30.0444"
                              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-white/80">خط الطول (Longitude):</label>
                            <input
                              type="text"
                              value={newLng}
                              onChange={(e) => setNewLng(e.target.value)}
                              placeholder="31.2357"
                              className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-white/80">رابط Google Business Profile:</label>
                          <input
                            type="url"
                            value={newGoogleBizUrl}
                            onChange={(e) => setNewGoogleBizUrl(e.target.value)}
                            placeholder="https://business.google.com/..."
                            className="w-full bg-white/10 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>

                        {/* Action buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAdToPreview({
                                ...selectedBizForMedia,
                                videos: newVideoUrl.trim() ? [newVideoUrl.trim(), ...selectedBizForMedia.videos] : selectedBizForMedia.videos,
                                lat: parseFloat(newLat) || selectedBizForMedia.lat,
                                lng: parseFloat(newLng) || selectedBizForMedia.lng,
                                googleBusinessUrl: newGoogleBizUrl.trim() || selectedBizForMedia.googleBusinessUrl,
                                videoStats: adminVideoStats ? {
                                  originalSizeMb: adminVideoStats.originalSizeMb,
                                  compressedSizeMb: adminVideoStats.compressedSizeMb,
                                  compressionRatio: adminVideoStats.compressionRatio,
                                } : selectedBizForMedia.videoStats,
                                poster: adminVideoStats?.posterUrl || selectedBizForMedia.poster,
                              });
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition border border-white/15 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 text-amber-400" />
                            <span>معاينة الإعلان قبل الحفظ 👁️</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleSaveMediaGeo}
                            className="bg-blue-600 hover:bg-blue-500 text-white font-black py-2.5 rounded-xl text-xs transition cursor-pointer shadow-lg shadow-blue-600/30"
                          >
                            حفظ التحديثات 💾
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12 text-white/40 text-xs">
                        👈 الرجاء اختيار نشاط تجاري من القائمة الجانبية لتعديل الفيديو والموقع
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: CUSTOMER VIDEOS & MOVING TEXT MANAGEMENT */}
            {activeTab === 'customer_posts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-2">
                      <span>إدارة ومراقبة فيديوهات العملاء والكتابة المتحركة</span>
                      <span className="bg-[#FF2D55] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {allCustomerPosts.length} مشاركة
                      </span>
                    </h3>
                    <p className="text-xs text-white/60">
                      استعراض جميع الفيديوهات والصور التي قام العملاء برفعها مع نصوصهم المتحركة مع إمكانية الحذف الفوري لأي محتوى غير لائق
                    </p>
                  </div>
                </div>

                {allCustomerPosts.length === 0 ? (
                  <div className="text-center py-12 bg-white/5 border border-white/10 rounded-2xl space-y-2">
                    <span className="text-4xl block">🎬</span>
                    <h4 className="font-bold text-white text-sm">لا توجد مشاركات عملاء حالياً</h4>
                    <p className="text-xs text-white/50">
                      يمكن للعملاء والزوار رفع الفيديوهات والصور مباشرة من الصفحة الرئيسية ومن أي ريل مع كتابة متحركة.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {allCustomerPosts.map((post) => {
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
                          : post.textAnimation === 'flip3d'
                          ? 'anim-flip3d'
                          : 'anim-marquee';

                      return (
                        <div
                          key={post.id}
                          className="bg-neutral-900 border border-white/15 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xl relative group"
                        >
                          {/* Media Header */}
                          <div className="p-3 bg-white/5 flex items-center justify-between text-xs border-b border-white/10">
                            <div>
                              <div className="font-black text-white truncate max-w-[140px]">
                                {post.userName}
                              </div>
                              <div className="text-[10px] text-amber-400 truncate max-w-[140px]">
                                النشاط: {post.businessName}
                              </div>
                            </div>
                            <span className="bg-[#FF2D55] text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                              {post.type === 'video' ? 'فيديو 🎥' : 'صورة 📸'}
                            </span>
                          </div>

                          {/* Media Preview Box with Moving Text */}
                          <div className="relative aspect-[9/12] w-full bg-black overflow-hidden flex flex-col justify-between p-2">
                            {post.type === 'video' ? (
                              <video
                                src={post.url}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            ) : (
                              <img
                                src={post.url}
                                alt="customer post"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

                            {/* Tag */}
                            <div className="relative z-10 flex justify-between text-[10px]">
                              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10 text-white font-mono">
                                حركة: {post.textAnimation}
                              </span>
                              <span className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-white/80">
                                {new Date(post.createdAt).toLocaleDateString('ar-EG')}
                              </span>
                            </div>

                            {/* LIVE MOVING ANIMATED TEXT ON MEDIA */}
                            <div className="relative z-10 my-auto w-full px-1 overflow-hidden pointer-events-none">
                              <div
                                className="w-full rounded-xl py-2 px-2.5 backdrop-blur-md text-center border border-white/20 shadow-2xl overflow-hidden"
                                style={{ backgroundColor: post.bgColor || 'rgba(0,0,0,0.75)' }}
                              >
                                <div
                                  className={`${animClass} font-black text-xs sm:text-sm tracking-wide`}
                                  style={{ color: post.textColor || '#FFD700' }}
                                >
                                  {post.caption}
                                </div>
                              </div>
                            </div>

                            {/* Info */}
                            <div className="relative z-10 flex justify-between items-center text-[10px] text-white/80">
                              <span>❤️ {post.likes || 1} إعجاب</span>
                              {post.userPhone && (
                                <span className="font-mono">{post.userPhone}</span>
                              )}
                            </div>
                          </div>

                          {/* Footer Delete & Contact */}
                          <div className="p-2.5 bg-black/40 flex items-center justify-between gap-2 border-t border-white/10">
                            {post.userPhone && (
                              <a
                                href={`https://wa.me/${post.userPhone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-white px-2.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>واتساب العميل</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomerPost(post.parentBusinessId, post.id)}
                              className="text-[11px] bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 cursor-pointer ms-auto"
                              title="حذف مشاركة العميل"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف المشاركة</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 8: STAFF & ASSISTANT ADMINS (1 TO 8) & PUBLICATION APPROVAL */}
            {activeTab === 'staff_assistants' && (
              <div className="space-y-6">
                
                {/* Toast Notification */}
                {staffToast && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-black flex items-center gap-2 animate-bounce">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{staffToast}</span>
                  </div>
                )}

                {/* Header Banner */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-blue-900/50 via-slate-900 to-indigo-950 border border-blue-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
                        <span>إدارة فريق مساعدي الإدارة والموظفين (1 إلى 8)</span>
                        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                          تحكم كامل للمدير العام
                        </span>
                      </h3>
                      <p className="text-xs text-white/70 mt-0.5">
                        الرقابة الشاملة على النشر • تحديد الأسماء والأرقام السرية وساعات العمل • فتح وغلق التفعيل وأوامر التشغيل
                      </p>
                    </div>
                  </div>

                  {/* Summary Badges */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80">
                      <span className="text-white/50 text-[10px] block">المفعلون</span>
                      <span className="font-black text-emerald-400 font-mono">
                        {staffList.filter((s) => s.isActive).length} / 8
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white/80">
                      <span className="text-white/50 text-[10px] block">أوامر تشغيل</span>
                      <span className="font-black text-blue-400 font-mono">
                        {staffList.filter((s) => s.workOrderActive).length} سارية
                      </span>
                    </div>
                    <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                      <span className="text-amber-300/70 text-[10px] block">بانتظار الاعتماد</span>
                      <span className="font-black text-amber-400 font-mono">
                        {pendingSubmissions.filter((s) => s.status === 'pending').length} طلب
                      </span>
                    </div>
                  </div>
                </div>

                {/* SECTION 1: PENDING APPROVAL QUEUE (عدم نشر أي إعلان إلا بعد موافقة الإدارة) */}
                <div className="p-4 sm:p-5 rounded-3xl bg-neutral-900/90 border border-amber-500/30 space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        ⏳
                      </div>
                      <div>
                        <h4 className="font-black text-sm text-white">
                          الرقابة على النشر: طلبات الإعلانات والتعديلات بانتظار موافقة الإدارة
                        </h4>
                        <p className="text-[11px] text-amber-300/80">
                          قاعدة صارمة: لا يظهر أي إعلان أو تعديل للجمهور إلا بعد الضغط على "موافقة ونشر فوري"
                        </p>
                      </div>
                    </div>

                    <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-3 py-1 rounded-full">
                      {pendingSubmissions.filter((s) => s.status === 'pending').length} بانتظار القرار
                    </span>
                  </div>

                  {pendingSubmissions.filter((s) => s.status === 'pending').length === 0 ? (
                    <div className="p-6 text-center text-white/40 text-xs">
                      ✨ لا توجد إعلانات معلقة حالياً - جميع الإعلانات بالمنصة معتمدة ونشطة.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {pendingSubmissions
                        .filter((s) => s.status === 'pending')
                        .map((sub) => (
                          <div
                            key={sub.id}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/40 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                          >
                            <div className="space-y-1.5 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-black text-base text-white">
                                  {sub.businessData.name || 'إعلان'}
                                </span>
                                <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold">
                                  {sub.businessData.cat || 'نشاط'}
                                </span>
                                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                                  {sub.type === 'new_ad' ? 'إعلان جديد' : 'تعديل بيانات'}
                                </span>
                              </div>

                              <p className="text-xs text-white/70 leading-relaxed">
                                {sub.changesSummary}
                              </p>

                              <div className="flex items-center gap-4 text-[11px] text-white/50 flex-wrap">
                                <span>المدينة: {sub.businessData.city || 'غير محدد'}</span>
                                <span className="text-emerald-400 font-mono">
                                  الهاتف: {sub.businessData.phone}
                                </span>
                                {sub.businessData.hotline && (
                                  <span className="text-amber-400 font-mono">
                                    الخط الساخن: {sub.businessData.hotline}
                                  </span>
                                )}
                                <span className="text-cyan-300">
                                  مقدم من: {sub.submittedByStaffName} (موظف {sub.staffNumber})
                                </span>
                                <span className="font-mono">
                                  {new Date(sub.submittedAt).toLocaleTimeString('ar-EG')}
                                </span>
                              </div>
                            </div>

                            {/* Approval Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
                              <button
                                onClick={() => handleApproveSubmission(sub.id)}
                                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-1.5"
                              >
                                <CheckCircle className="w-4 h-4" />
                                <span>موافقة ونشر فوري بالمنصة ✓</span>
                              </button>

                              <button
                                onClick={() => handleRejectSubmission(sub.id)}
                                className="flex-1 md:flex-none px-3.5 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold text-xs border border-red-500/30 transition flex items-center justify-center gap-1"
                              >
                                <Ban className="w-4 h-4" />
                                <span>رفض ✕</span>
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* SECTION 2: STAFF MEMBERS MANAGEMENT GRID (1 TO 8) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-white flex items-center gap-2">
                      <UserCog className="w-4 h-4 text-blue-400" />
                      <span>قائمة مساعدي الإدارة والموظفين (موظف 1 إلى موظف 8):</span>
                    </h4>
                    <span className="text-xs text-white/50">
                      يتحكم المدير في الأسماء، الأرقام السرية، ساعات العمل، والتشغيل
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {staffList.map((st) => (
                      <div
                        key={st.id}
                        className={`p-4 rounded-3xl border transition flex flex-col justify-between ${
                          st.isActive && st.workOrderActive
                            ? 'bg-neutral-900/90 border-blue-500/30 shadow-lg'
                            : !st.isActive
                            ? 'bg-red-950/20 border-red-500/20 opacity-75'
                            : 'bg-neutral-900/60 border-white/10'
                        }`}
                      >
                        <div>
                          {/* Card Top */}
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-md">
                                {st.staffNumber}
                              </div>
                              <div>
                                <h5 className="font-bold text-sm text-white">{st.name}</h5>
                                <div className="flex items-center gap-2 text-xs text-white/50 font-mono">
                                  <span>يوزر: {st.username}</span>
                                  <span>•</span>
                                  <span className="text-amber-400 font-bold">باسورد / PIN: {st.password}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="flex flex-col items-end gap-1">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  st.isActive
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                                }`}
                              >
                                {st.isActive ? 'مفعل ✓' : 'مغلق / معطل 🔒'}
                              </span>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  st.workOrderActive
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-white/10 text-white/50'
                                }`}
                              >
                                {st.workOrderActive ? 'أمر تشغيل ساري 🚀' : 'بدون أمر تشغيل ⏸️'}
                              </span>
                            </div>
                          </div>

                          {/* Shift & Phone */}
                          <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1 text-xs text-white/70 mb-3">
                            <div className="flex items-center justify-between">
                              <span className="text-white/50 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-blue-400" /> ساعات العمل:
                              </span>
                              <span className="font-bold text-white">{st.shiftHours}</span>
                            </div>
                            {st.phone && (
                              <div className="flex items-center justify-between">
                                <span className="text-white/50">الهاتف:</span>
                                <span className="font-mono text-emerald-400">{st.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Permissions summary */}
                          <div className="flex flex-wrap gap-1 mb-3">
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canReviewAds ? 'bg-blue-500/20 text-blue-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              رقابة {st.permissions.canReviewAds ? '✓' : '✕'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canInputData ? 'bg-cyan-500/20 text-cyan-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              إدخال {st.permissions.canInputData ? '✓' : '✕'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canEdit ? 'bg-purple-500/20 text-purple-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              تعديل {st.permissions.canEdit ? '✓' : '✕'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canAdd ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              إضافة {st.permissions.canAdd ? '✓' : '✕'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canDelete ? 'bg-red-500/20 text-red-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              حذف {st.permissions.canDelete ? '✓' : '✕'}
                            </span>
                            <span
                              className={`text-[9px] px-2 py-0.5 rounded-md ${
                                st.permissions.canHide ? 'bg-amber-500/20 text-amber-300' : 'bg-white/5 text-white/30'
                              }`}
                            >
                              إخفاء {st.permissions.canHide ? '✓' : '✕'}
                            </span>
                          </div>
                        </div>

                        {/* Admin Action Controls */}
                        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-1.5 flex-wrap">
                          {/* Toggle Active */}
                          <button
                            type="button"
                            onClick={() => handleToggleStaffActive(st.id, !st.isActive)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              st.isActive
                                ? 'bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white'
                                : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            <span>{st.isActive ? '🔒 قفل التفعيل' : '🔓 فتح التفعيل'}</span>
                          </button>

                          {/* Toggle Work Order */}
                          <button
                            type="button"
                            onClick={() => handleToggleStaffWorkOrder(st.id, !st.workOrderActive)}
                            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition flex items-center gap-1 ${
                              st.workOrderActive
                                ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500 hover:text-white'
                                : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500 hover:text-white'
                            }`}
                          >
                            <span>{st.workOrderActive ? '⏸️ سحب أمر التشغيل' : '🚀 إصدار أمر تشغيل'}</span>
                          </button>

                          {/* Toggle Hidden */}
                          <button
                            type="button"
                            onClick={() => handleToggleStaffHidden(st.id, !st.isHidden)}
                            className="px-2 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 text-[11px] transition"
                            title={st.isHidden ? 'إظهار الموظف' : 'إخفاء الموظف'}
                          >
                            {st.isHidden ? <EyeOff className="w-3.5 h-3.5 text-amber-400" /> : <Eye className="w-3.5 h-3.5 text-white/70" />}
                          </button>

                          {/* Edit Details & Password */}
                          <button
                            type="button"
                            onClick={() => setEditingStaff(st)}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold transition flex items-center gap-1 ms-auto"
                          >
                            <Edit3 className="w-3 h-3 text-cyan-300" />
                            <span>تعديل وسر 🔑</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODAL TO EDIT STAFF MEMBER CREDENTIALS & PERMISSIONS */}
                {editingStaff && (
                  <div className="fixed inset-0 z-[999999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
                    <div className="bg-[#181822] border border-white/20 rounded-3xl p-5 max-w-lg w-full shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <UserCog className="w-5 h-5 text-blue-400" />
                          <h4 className="font-black text-sm">تعديل بيانات وصلاحيات {editingStaff.name}</h4>
                        </div>
                        <button
                          onClick={() => setEditingStaff(null)}
                          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="space-y-3 text-xs">
                        <div>
                          <label className="block text-white/70 font-bold mb-1">الاسم الكامل للموظف:</label>
                          <input
                            type="text"
                            value={editingStaff.name}
                            onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                            className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-white/70 font-bold mb-1">اسم المستخدم (Username):</label>
                            <input
                              type="text"
                              value={editingStaff.username}
                              onChange={(e) => setEditingStaff({ ...editingStaff, username: e.target.value })}
                              className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-amber-300 font-bold mb-1">كلمة المرور / الرقم السري (PIN):</label>
                            <input
                              type="text"
                              value={editingStaff.password}
                              onChange={(e) =>
                                setEditingStaff({
                                  ...editingStaff,
                                  password: e.target.value,
                                  pin: e.target.value,
                                })
                              }
                              className="w-full bg-black/40 border border-amber-500/40 rounded-xl p-2.5 text-xs text-white font-mono text-center tracking-widest font-black"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-white/70 font-bold mb-1">ساعات العمل والشفت:</label>
                            <input
                              type="text"
                              value={editingStaff.shiftHours}
                              onChange={(e) => setEditingStaff({ ...editingStaff, shiftHours: e.target.value })}
                              placeholder="09:00 ص - 05:00 م"
                              className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white"
                            />
                          </div>

                          <div>
                            <label className="block text-white/70 font-bold mb-1">رقم هاتف الموظف:</label>
                            <input
                              type="tel"
                              value={editingStaff.phone || ''}
                              onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                              placeholder="010XXXXXXXX"
                              className="w-full bg-black/40 border border-white/15 rounded-xl p-2.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>

                        {/* Permissions Checkboxes */}
                        <div className="p-3 rounded-2xl bg-black/40 border border-white/10 space-y-2">
                          <label className="block text-white/90 font-black mb-1">
                            صلاحيات التحكم للموظف (بأمر تشغيل من المدير):
                          </label>

                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canReviewAds}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canReviewAds: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>الرقابة على الإعلانات ومراجعتها</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canInputData}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canInputData: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>إدخال البيانات والاشتراكات</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canEdit}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canEdit: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>تعديل وتحديث الصفحات</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canAdd}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canAdd: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>إضافة إعلانات جديدة</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canDelete}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canDelete: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>حذف الإعلانات المخالفة</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingStaff.permissions.canHide}
                                onChange={(e) =>
                                  setEditingStaff({
                                    ...editingStaff,
                                    permissions: { ...editingStaff.permissions, canHide: e.target.checked },
                                  })
                                }
                                className="rounded accent-blue-500"
                              />
                              <span>إخفاء الإعلانات عن الجمهور</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => setEditingStaff(null)}
                          className="px-4 py-2 rounded-xl bg-white/10 text-white font-bold text-xs"
                        >
                          إلغاء
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveStaffMember(editingStaff)}
                          className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30"
                        >
                          حفظ التعديلات والسر 🔒
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* Global Live Ad Preview Modal */}
        {adToPreview && (
          <AdPreviewModal
            business={adToPreview}
            lang={lang}
            onClose={() => setAdToPreview(null)}
            onConfirmPublish={() => {
              // Ensure business is active and visible
              const updated = businesses.map((b) =>
                b.id === adToPreview.id ? { ...b, status: 'active' as const } : b
              );
              onUpdateBusiness(updated);
              setAdToPreview(null);
            }}
          />
        )}

        {/* Full Subscriber Edit Modal */}
        {editingBiz && (
          <AdminEditSubscriberModal
            business={editingBiz}
            lang={lang}
            onClose={() => setEditingBiz(null)}
            onSave={(updated) => {
              const next = businesses.map((b) => (b.id === updated.id ? updated : b));
              onUpdateBusiness(next);
              setEditingBiz(null);
            }}
          />
        )}

        {/* Admin Add New Listing Modal */}
        {isAddListingOpen && (
          <AddBusinessModal
            lang={lang}
            onClose={() => setIsAddListingOpen(false)}
            onAddBusiness={(newBiz) => {
              onUpdateBusiness([newBiz, ...businesses]);
              setIsAddListingOpen(false);
            }}
          />
        )}
      </div>
    </div>
  );
};
