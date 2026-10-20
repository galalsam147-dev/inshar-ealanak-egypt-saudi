import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Shield, Lock, User, KeyRound, CheckCircle2, Clock, AlertTriangle, 
  FileCheck, PlusCircle, Search, Edit3, Eye, EyeOff, LogOut, Send, 
  Sparkles, Phone, MapPin, Store, BadgeCheck, Check, Ban, Play, Pause,
  Video, Image as ImageIcon, Car, CheckCheck, RefreshCw, ChevronLeft, ChevronRight,
  ExternalLink, UserCheck, Crown
} from 'lucide-react';
import { Business, StaffMember, SupportedLang } from '../types';
import { 
  getStaffMembers, 
  authenticateStaff, 
  submitForAdminApproval, 
  getPendingAdSubmissions,
  approveAdSubmission,
  rejectAdSubmission,
  PendingAdSubmission,
  updateStaffMember
} from '../utils/staffManager';
import { AdminEditSubscriberModal } from './AdminEditSubscriberModal';

interface AssistantStaffPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onUpdateBusinesses: (updated: Business[]) => void;
  onOpenDriverTracking?: (biz?: Business) => void;
  lang?: SupportedLang;
}

export const AssistantStaffPortalModal: React.FC<AssistantStaffPortalModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onUpdateBusinesses,
  onOpenDriverTracking,
  lang = 'ar',
}) => {
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [isManagerMode, setIsManagerMode] = useState<boolean>(false);
  const [managerPin, setManagerPin] = useState('');
  const [managerError, setManagerError] = useState('');

  // Login inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    'ad_moderation' | 'subscriber_approval' | 'add_subscriber' | 'driver_tracking' | 'submissions_queue' | 'edit_ad'
  >('ad_moderation');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'active'>('all');

  // Media preview
  const [previewingVideoUrl, setPreviewingVideoUrl] = useState<string | null>(null);
  const [previewingImageUrl, setPreviewingImageUrl] = useState<string | null>(null);

  // New subscriber form states
  const [newName, setNewName] = useState('');
  const [newCat, setNewCat] = useState('مطاعم');
  const [newCity, setNewCity] = useState('القاهرة');
  const [newAddress, setNewAddress] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newHotline, setNewHotline] = useState('');
  const [newBio, setNewBio] = useState('');
  const [newHours, setNewHours] = useState('09:00 ص - 11:00 م');
  const [newBookingEnabled, setNewBookingEnabled] = useState(true);
  const [newBookingPrice, setNewBookingPrice] = useState('150');
  const [newBookingTitle, setNewBookingTitle] = useState('كشف / حجز موعد');
  const [newImage, setNewImage] = useState('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80');
  const [newVideo, setNewVideo] = useState('https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-chef-cutting-vegetables-42997-large.mp4');
  const [submitFeedback, setSubmitFeedback] = useState<string | null>(null);

  // Edit modal
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);

  // Pending submissions
  const [submissions, setSubmissions] = useState<PendingAdSubmission[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSubmissions(getPendingAdSubmissions());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Staff login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    const res = authenticateStaff(usernameInput, passwordInput);
    if (!res.success || !res.staff) {
      setAuthError(res.error || 'فشل تسجيل الدخول');
      return;
    }

    setCurrentStaff(res.staff);
    setIsManagerMode(false);
    setAuthError('');
  };

  // Quick switch to General Manager Mode with PIN 7788 or 1000
  const handleManagerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setManagerError('');
    if (managerPin === '7788' || managerPin === '1000' || managerPin === '1234') {
      setIsManagerMode(true);
      setCurrentStaff({
        id: 'manager_general',
        staffNumber: 0,
        name: 'المدير العام والرقابة العليا (General Manager)',
        username: 'admin',
        password: '',
        pin: '7788',
        shiftHours: '24/7 الإدارة العليا',
        isActive: true,
        isHidden: false,
        workOrderActive: true,
        permissions: {
          canReviewAds: true,
          canInputData: true,
          canEdit: true,
          canAdd: true,
          canDelete: true,
          canHide: true,
        },
      });
      setManagerPin('');
      setManagerError('');
    } else {
      setManagerError('الرقم السري للمدير العام غير صحيح (الافتراضي 7788)');
    }
  };

  const handleQuickSelectStaff = (staffNumber: number) => {
    const list = getStaffMembers();
    const st = list.find((s) => s.staffNumber === staffNumber);
    if (st) {
      setUsernameInput(st.username);
      setPasswordInput(st.password);
    }
  };

  const handleLogout = () => {
    setCurrentStaff(null);
    setIsManagerMode(false);
    setUsernameInput('');
    setPasswordInput('');
    setAuthError('');
  };

  // Add new subscriber by staff or manager
  const handleAddNewSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStaff) return;

    const priceNum = parseFloat(newBookingPrice) || 0;
    const newBizId = `biz_${Date.now()}`;

    const newBizData: Business = {
      id: newBizId,
      name: newName.trim(),
      cat: newCat,
      city: newCity,
      addr: newAddress.trim(),
      phone: newPhone.trim(),
      hotline: newHotline.trim() || undefined,
      phones: [newPhone.trim(), newHotline.trim()].filter(Boolean),
      bio: newBio.trim(),
      hours: newHours.trim(),
      images: [newImage],
      videos: [newVideo],
      poster: newImage,
      status: isManagerMode ? 'active' : 'pending',
      pendingAdminApproval: !isManagerMode,
      bookingEnabled: newBookingEnabled,
      bookingPrice: priceNum,
      bookingServiceTitle: newBookingTitle,
      bookingSlotDurationMinutes: 30,
      verified: isManagerMode ? 1 : 0,
      pkg: 399,
      expiry: Date.now() + 90 * 86400000,
      services: [],
      submittedByStaffId: currentStaff.id,
      submittedAt: Date.now(),
      likes: 12,
    };

    if (isManagerMode) {
      // Direct live publication by manager
      const updated = [newBizData, ...businesses];
      onUpdateBusinesses(updated);
      setSubmitFeedback('🎉 تم اعتماد ونشر المشترك الجديد فورياً للجمهور كـ حساب نشط ومعتمد!');
    } else {
      // Submitted by assistant for manager review
      submitForAdminApproval({
        businessId: newBizId,
        type: 'new_ad',
        submittedByStaffId: currentStaff.id,
        submittedByStaffName: currentStaff.name,
        staffNumber: currentStaff.staffNumber,
        businessData: newBizData,
        changesSummary: `إضافة مشترك جديد (${newName}) بواسطة ${currentStaff.name} - بانتظار موافقة المدير العام`,
      });
      setSubmissions(getPendingAdSubmissions());
      setSubmitFeedback('✅ تم إرسال المشترك بنجاح إلى طابور مراجعة المدير العام! لن يظهر للجمهور إلا بعد موافقة الإدارة.');
    }

    // Reset fields
    setNewName('');
    setNewAddress('');
    setNewPhone('');
    setNewHotline('');
    setNewBio('');

    setTimeout(() => {
      setSubmitFeedback(null);
      setActiveTab(isManagerMode ? 'subscriber_approval' : 'submissions_queue');
    }, 2000);
  };

  // Direct Approval of Subscriber (الموافقة على المشترك)
  const handleApproveSubscriber = (bizId: string | number) => {
    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        return {
          ...b,
          status: 'active' as const,
          pendingAdminApproval: false,
          verified: 1,
          expiry: Date.now() + 90 * 86400000,
        };
      }
      return b;
    });
    onUpdateBusinesses(updated);

    // Also approve in submissions queue if present
    const subs = getPendingAdSubmissions();
    const matchingSub = subs.find((s) => s.businessId === bizId);
    if (matchingSub) {
      approveAdSubmission(matchingSub.id);
      setSubmissions(getPendingAdSubmissions());
    }

    alert('✅ تم اعتماد والموافقة على المشترك وتفعيل حسابه لمدة 90 يوم مجاناً بنجاح!');
  };

  // Direct Approval of Ad Media (الموافقة على الإعلان الصورة أو الفيديو)
  const handleApproveAdMedia = (bizId: string | number, mediaType: 'image' | 'video' | 'both') => {
    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        return {
          ...b,
          status: 'active' as const,
          pendingAdminApproval: false,
          verified: 1,
        };
      }
      return b;
    });
    onUpdateBusinesses(updated);

    // Update staff stats
    if (currentStaff) {
      const staffList = getStaffMembers();
      const st = staffList.find((s) => s.id === currentStaff.id);
      if (st) {
        st.approvedAdsCount = (st.approvedAdsCount || 0) + 1;
        updateStaffMember(st);
      }
    }

    alert(`✅ تمت الموافقة على ${mediaType === 'video' ? 'فيديو الإعلان' : mediaType === 'image' ? 'صورة الإعلان' : 'الإعلان بالكامل'} واعتماده للنشر!`);
  };

  // Reject ad / request modification
  const handleRejectAdMedia = (bizId: string | number, reason: string = 'مخالفة معايير المحتوى أو جودة رديئة') => {
    const note = prompt('أدخل سبب رفض الإعلان أو طلب التعديل:', reason);
    if (note === null) return;

    const updated = businesses.map((b) => {
      if (b.id === bizId) {
        return {
          ...b,
          status: 'pending' as const,
          pendingAdminApproval: true,
        };
      }
      return b;
    });
    onUpdateBusinesses(updated);
    alert('⚠️ تم تسجيل الرفض وطلب تعديل الإعلان من صاحب النشاط.');
  };

  // Filtered businesses
  const filteredBusinesses = businesses.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      (b.hotline && b.hotline.includes(searchQuery));
    const matchesCat = categoryFilter === 'الكل' || b.cat === categoryFilter;
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'pending' ? (b.status === 'pending' || b.pendingAdminApproval) :
      (b.status === 'active' && !b.pendingAdminApproval);

    return matchesSearch && matchesCat && matchesStatus;
  });

  const pendingSubscribersCount = businesses.filter((b) => b.status === 'pending' || b.pendingAdminApproval).length;
  const staffMembersList = getStaffMembers();

  return (
    <div className="fixed inset-0 z-[99999] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto" dir="rtl">
      <div className="bg-[#121218] border border-white/15 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto text-white">
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900/70 via-slate-900 to-indigo-950 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  بوابة المساعدين والمدير للرقابة الإدارية
                </h2>
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-bold">
                  {isManagerMode ? 'المدير العام 👑' : currentStaff ? `مساعد إداري (${currentStaff.staffNumber})` : 'فريق العمل (1 إلى 8)'}
                </span>
              </div>
              <p className="text-xs text-white/60">
                إضافة مشتركين، رقابة على الإعلانات، الموافقة على المشتركين، والموافقة على صور وفيديوهات الإعلانات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        {!currentStaff ? (
          /* LOGIN SCREEN */
          <div className="p-6 sm:p-8 overflow-y-auto max-w-xl mx-auto w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
              <Lock className="w-8 h-8 text-blue-400" />
            </div>

            <h3 className="text-xl font-black mb-1 text-center">تسجيل دخول الرقابة والمساعدين</h3>
            <p className="text-xs text-white/60 text-center mb-6 max-w-md">
              قم باختيار حساب المساعد الإداري (1 إلى 8) أو الدخول المباشر كمدير عام لاعتماد الإعلانات والمشتركين
            </p>

            {authError && (
              <div className="w-full mb-4 p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="font-semibold leading-relaxed">{authError}</p>
              </div>
            )}

            {/* General Manager Quick PIN Entry */}
            <div className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-indigo-500/15 border border-amber-400/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span>دخول المدير العام المباشر (صلاحيات مطلقة):</span>
                </span>
                <span className="text-[10px] text-white/50 font-mono">الافتراضي: 7788</span>
              </div>
              <form onSubmit={handleManagerLogin} className="flex gap-2">
                <input
                  type="password"
                  value={managerPin}
                  onChange={(e) => setManagerPin(e.target.value)}
                  placeholder="أدخل رمز المدير السري (7788)"
                  className="flex-1 bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest text-center focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-black text-xs transition shadow cursor-pointer"
                >
                  دخول المدير 👑
                </button>
              </form>
              {managerError && (
                <p className="text-[10px] text-red-400 mt-1.5 font-bold">{managerError}</p>
              )}
            </div>

            {/* Assistant Login Form */}
            <form onSubmit={handleLogin} className="w-full space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">اسم مستخدم المساعد (1 إلى 8):</label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/40 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="مثال: staff1 أو موظف 1"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-10 pe-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-white/80 mb-1.5">كلمة المرور أو الرقم السري:</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-white/40 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="كلمة المرور (111, 222, ... 888)"
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 ps-10 pe-10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 transition text-center tracking-widest font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تسجيل دخول كمساعد إداري</span>
              </button>
            </form>

            {/* Quick Staff Selection Chips (1 to 8) */}
            <div className="w-full mt-6 pt-5 border-t border-white/10">
              <p className="text-[11px] font-bold text-white/50 mb-2.5 text-center">
                اختيار سريع لحساب المساعد (1 إلى 8):
              </p>
              <div className="grid grid-cols-4 gap-2">
                {staffMembersList.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleQuickSelectStaff(st.staffNumber)}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex flex-col items-center gap-1 transition ${
                      st.isActive && st.workOrderActive
                        ? 'bg-white/5 border-white/15 text-white hover:bg-blue-600/20 hover:border-blue-500/40'
                        : 'bg-red-950/20 border-red-500/20 text-red-300/70 opacity-60'
                    }`}
                  >
                    <span>مساعد {st.staffNumber}</span>
                    <span className="text-[9px] font-normal text-white/50 font-mono">{st.username}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* LOGGED IN WORKSPACE */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Staff / Manager Info Banner */}
            <div className="p-3 sm:p-4 bg-white/5 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md ${
                  isManagerMode ? 'bg-amber-500 text-black' : 'bg-blue-600 text-white'
                }`}>
                  {isManagerMode ? '👑' : currentStaff.staffNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm sm:text-base text-white">{currentStaff.name}</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      {isManagerMode ? 'اعتماد ونشر مباشر ✓' : 'أمر تشغيل ساري ✓'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-blue-400" /> {currentStaff.shiftHours}
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span>كود الدخول: {currentStaff.username}</span>
                  </div>
                </div>
              </div>

              {/* Quick mode switcher & Logout */}
              <div className="flex items-center gap-2">
                {!isManagerMode ? (
                  <button
                    onClick={() => {
                      const p = prompt('أدخل رمز المدير العام (7788):');
                      if (p === '7788' || p === '1000') {
                        setIsManagerMode(true);
                      }
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold transition flex items-center gap-1"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">تبديل لوضع المدير العام</span>
                  </button>
                ) : (
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-xl text-xs font-black">
                    صلاحيات المدير العام كاملة 👑
                  </span>
                )}

                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>تسجيل خروج</span>
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="p-2 sm:p-3 bg-black/40 border-b border-white/10 flex items-center gap-1.5 overflow-x-auto hide-scroll text-xs">
              
              {/* Tab 1: Ad Moderation (Video & Photo Approval) */}
              <button
                onClick={() => setActiveTab('ad_moderation')}
                className={`py-2 px-3.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'ad_moderation'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>رقابة الإعلانات (صور وفيديوهات) ({businesses.length})</span>
              </button>

              {/* Tab 2: Subscriber Approval (الموافقة على المشترك) */}
              <button
                onClick={() => setActiveTab('subscriber_approval')}
                className={`py-2 px-3.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 relative ${
                  activeTab === 'subscriber_approval'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>الموافقة على المشتركين ({pendingSubscribersCount} معلق)</span>
                {pendingSubscribersCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </button>

              {/* Tab 3: Add Subscriber (إضافة مشتركين) */}
              <button
                onClick={() => setActiveTab('add_subscriber')}
                className={`py-2 px-3.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'add_subscriber'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>إضافة مشترك جديد {isManagerMode ? '(نشر مباشر)' : '(بأمر تشغيل)'}</span>
              </button>

              {/* Tab 4: Driver Tracking (برنامج تتبع السائق) */}
              <button
                onClick={() => {
                  if (onOpenDriverTracking) {
                    onOpenDriverTracking();
                  } else {
                    setActiveTab('driver_tracking');
                  }
                }}
                className={`py-2 px-3.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'driver_tracking'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>برنامج تتبع السائق والكباتن 📍</span>
              </button>

              {/* Tab 5: Submissions Queue */}
              <button
                onClick={() => setActiveTab('submissions_queue')}
                className={`py-2 px-3.5 rounded-xl font-black transition flex items-center gap-1.5 shrink-0 ${
                  activeTab === 'submissions_queue'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>سجل المراجعات والطلبات ({submissions.length})</span>
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
              
              {/* TAB 1: AD MEDIA MODERATION (PHOTO & VIDEO APPROVAL) */}
              {activeTab === 'ad_moderation' && (
                <div className="space-y-4">
                  
                  {/* Banner */}
                  <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Shield className="w-5 h-5 text-blue-400 shrink-0" />
                      <div>
                        <span className="font-bold">رقابة وموافقة على الإعلانات:</span> تحقق من سلامة الفيديو والصورة، خلوها من المخالفات، واضغط "الموافقة على الإعلان" لاعتماده.
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-2 py-0.5 rounded-full shrink-0">
                      إجمالي الإعلانات: {filteredBusinesses.length}
                    </span>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-white/40 absolute start-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ابحث باسم الإعلان، المدينة، أو الهاتف..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-2 ps-9 pe-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="الكل" className="bg-slate-900">جميع الأنشطة</option>
                      <option value="مطاعم" className="bg-slate-900">مطاعم</option>
                      <option value="كافيهات" className="bg-slate-900">كافيهات</option>
                      <option value="أطباء وعيادات" className="bg-slate-900">أطباء وعيادات</option>
                      <option value="تاكسي وأجرة" className="bg-slate-900">تاكسي وأجرة</option>
                      <option value="عقارات" className="bg-slate-900">عقارات</option>
                      <option value="فنادق ومنتجعات" className="bg-slate-900">فنادق</option>
                    </select>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="all" className="bg-slate-900">كل الحالات</option>
                      <option value="pending" className="bg-slate-900">معلق بانتظار الاعتماد ⏳</option>
                      <option value="active" className="bg-slate-900">معتمد ونشط ✓</option>
                    </select>
                  </div>

                  {/* Ads List with Media Preview & Approval */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBusinesses.map((b) => {
                      const hasVideo = b.videos && b.videos.length > 0;
                      const hasImage = b.images && b.images.length > 0;
                      const videoUrl = hasVideo ? b.videos[0] : null;
                      const imageUrl = hasImage ? b.images[0] : b.poster || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400';
                      const isPending = b.status === 'pending' || b.pendingAdminApproval;

                      return (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition flex flex-col justify-between gap-3 ${
                            isPending
                              ? 'bg-amber-950/20 border-amber-500/30'
                              : 'bg-white/5 border-white/10 hover:border-white/20'
                          }`}
                        >
                          <div className="flex gap-3">
                            {/* Visual Thumbnail with direct click-to-preview */}
                            <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10 group">
                              <img
                                src={imageUrl}
                                alt={b.name}
                                className="w-full h-full object-cover"
                              />
                              {videoUrl && (
                                <button
                                  onClick={() => setPreviewingVideoUrl(videoUrl)}
                                  className="absolute inset-0 bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition"
                                  title="تشغيل فيديو الإعلان للمعاينة"
                                >
                                  <Play className="w-7 h-7 text-amber-400 fill-amber-400" />
                                </button>
                              )}
                              <span className="absolute bottom-1 end-1 text-[9px] bg-black/70 px-1 rounded text-white font-mono">
                                {hasVideo ? 'فيديو + صورة' : 'صورة'}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h4 className="font-bold text-sm text-white truncate">{b.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                  isPending ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {isPending ? '⏳ قيد المراجعة' : '✓ معتمد'}
                                </span>
                              </div>

                              <p className="text-[11px] text-white/60 truncate flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3 text-white/40" /> {b.city} - {b.addr}
                              </p>
                              
                              <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {b.phone}
                                {b.hotline && <span className="text-amber-300 ms-2">خط ساخن: {b.hotline}</span>}
                              </p>

                              <p className="text-[10px] text-white/50 line-clamp-2 mt-1">
                                {b.bio || 'لا توجد نبذة إضافية'}
                              </p>
                            </div>
                          </div>

                          {/* Approval Actions Toolbar for Image & Video */}
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              {/* Approve Video & Photo */}
                              <button
                                onClick={() => handleApproveAdMedia(b.id, hasVideo ? 'both' : 'image')}
                                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black transition flex items-center gap-1 shadow cursor-pointer"
                                title="الموافقة على الإعلان والصور والفيديوهات للنشر"
                              >
                                <CheckCheck className="w-3.5 h-3.5" />
                                <span>الموافقة على الإعلان (صورة/فيديو) ✓</span>
                              </button>

                              {/* Reject / Request Changes */}
                              <button
                                onClick={() => handleRejectAdMedia(b.id)}
                                className="px-2 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 border border-red-500/40 text-red-200 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                title="طلب تعديل أو إخفاء الإعلان"
                              >
                                <Ban className="w-3 h-3" />
                                <span>رفض أو تعديل</span>
                              </button>
                            </div>

                            <button
                              onClick={() => setEditingBiz(b)}
                              className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل البيانات</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: SUBSCRIBER APPROVAL (الموافقة على المشترك) */}
              {activeTab === 'subscriber_approval' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold">الموافقة على المشتركين الجدد:</span> راجع المشتركين المعلقين واضغط زر الاعتماد لمنحهم تفعيل الحساب فورياً لمدة 90 يوم مجاناً ورمز التوثيق الرسمي.
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 font-mono px-2.5 py-1 rounded-full font-black">
                      {pendingSubscribersCount} مشترك بانتظار الموافقة
                    </span>
                  </div>

                  <div className="space-y-3">
                    {businesses.map((b) => {
                      const isPending = b.status === 'pending' || b.pendingAdminApproval;

                      return (
                        <div
                          key={b.id}
                          className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                            isPending
                              ? 'bg-amber-950/30 border-amber-400/40 shadow-lg'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={b.images[0] || b.poster || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=120'}
                              alt={b.name}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 border border-white/10"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-black text-sm text-white truncate">{b.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  isPending ? 'bg-amber-500/25 text-amber-300 border border-amber-400/30' : 'bg-emerald-500/20 text-emerald-300'
                                }`}>
                                  {isPending ? '⏳ بانتظار موافقة المشترك' : '✓ مشترك معتمد نشط'}
                                </span>
                                <span className="text-[10px] bg-white/10 text-white/70 px-1.5 py-0.5 rounded">
                                  {b.cat}
                                </span>
                              </div>
                              <p className="text-xs text-white/60">{b.city} • {b.addr}</p>
                              <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                                هاتف المشترك: {b.phone} {b.hotline && `| خط ساخن: ${b.hotline}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                            {isPending ? (
                              <button
                                onClick={() => handleApproveSubscriber(b.id)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 transition flex items-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>الموافقة على المشترك وتفعيل حسابه فوراً ✓</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  const updated = businesses.map((x) =>
                                    x.id === b.id ? { ...x, status: 'pending' as const, pendingAdminApproval: true } : x
                                  );
                                  onUpdateBusinesses(updated);
                                }}
                                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/30 text-amber-300 text-xs font-bold transition cursor-pointer"
                              >
                                تعليق المشترك مؤقتاً
                              </button>
                            )}

                            <button
                              onClick={() => setEditingBiz(b)}
                              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>تعديل</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 3: ADD SUBSCRIBER (إضافة مشتركين) */}
              {activeTab === 'add_subscriber' && (
                <div className="max-w-2xl mx-auto space-y-4">
                  <div className="p-3.5 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs flex items-center gap-3">
                    <PlusCircle className="w-5 h-5 text-purple-400 shrink-0" />
                    <div>
                      <span className="font-black">إضافة مشترك جديد للبرنامج:</span> {isManagerMode ? 'أنت بوضع المدير العام: سيتم نشر المشترك وتفعيله فوراً للجمهور.' : 'أنت بوضع المساعد: سيتم رفع الإعلان للمدير العام للاعتماد النهائي.'}
                    </div>
                  </div>

                  {submitFeedback && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold leading-relaxed">
                      {submitFeedback}
                    </div>
                  )}

                  <form onSubmit={handleAddNewSubscriber} className="space-y-4 bg-white/5 p-4 sm:p-6 rounded-2xl border border-white/10">
                    <h4 className="font-bold text-sm text-white mb-2">بيانات المشترك والإعلان:</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">اسم النشاط أو المنشأة *</label>
                        <input
                          type="text"
                          required
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          placeholder="مثال: مطعم أو عيادة أو معرض..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">التصنيف والنشاط *</label>
                        <select
                          value={newCat}
                          onChange={(e) => setNewCat(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          <option value="مطاعم">مطاعم</option>
                          <option value="كافيهات">كافيهات</option>
                          <option value="أطباء وعيادات">أطباء وعيادات (حجز متميز)</option>
                          <option value="تاكسي وأجرة">تاكسي ونقل ركاب (تتبع GPS)</option>
                          <option value="عقارات">عقارات وكمبوندات</option>
                          <option value="سيارات">سيارات ومراكز خدمة</option>
                          <option value="فنادق ومنتجعات">فنادق ومنتجعات</option>
                          <option value="حرفيين وصيانة منزلية">حرفيين وصيانة منزلية</option>
                          <option value="شركات">شركات وتجارة</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">المدينة / المحافظة *</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          placeholder="مثال: القاهرة الجديدة - التجمع الخامس"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">العنوان التفصيلي *</label>
                        <input
                          type="text"
                          required
                          value={newAddress}
                          onChange={(e) => setNewAddress(e.target.value)}
                          placeholder="مثال: شارع التسعين الجنوبي مول بوينت 90"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">رقم هاتف المشترك (واتساب) *</label>
                        <input
                          type="tel"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="010XXXXXXXX"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-white/70 font-bold mb-1">الخط الساخن أو هاتف إضافي</label>
                        <input
                          type="tel"
                          value={newHotline}
                          onChange={(e) => setNewHotline(e.target.value)}
                          placeholder="19XXX أو هاتف أرضي"
                          className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 font-bold mb-1">رابط صورة الإعلان الأساسية</label>
                      <input
                        type="url"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="رابط الصورة (Unsplash أو رابط مباشر)"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 font-bold mb-1">رابط فيديو ريلز الإعلان</label>
                      <input
                        type="url"
                        value={newVideo}
                        onChange={(e) => setNewVideo(e.target.value)}
                        placeholder="رابط فيديو MP4 مباشر"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-white/70 font-bold mb-1">نبذة عن المشترك والخدمات</label>
                      <textarea
                        rows={2}
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value)}
                        placeholder="وصف المشترك وأبرز مميزاته وخدماته..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isManagerMode ? 'اعتماد ونشر المشترك فورياً 🚀' : 'إرسال المشترك للاعتماد الإداري والنشر'}</span>
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 4: DRIVER TRACKING (برنامج تتبع السائق) */}
              {activeTab === 'driver_tracking' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Car className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-bold">برنامج تتبع السائق والكباتن المباشر:</span> مراقبة أسطول الكباتن، تاكسي العاصمة، وسيارات النقل والدليفري بالـ GPS المباشر.
                      </div>
                    </div>
                    {onOpenDriverTracking && (
                      <button
                        onClick={() => onOpenDriverTracking()}
                        className="px-3 py-1.5 rounded-xl bg-amber-400 text-black font-black text-xs hover:bg-amber-300 transition shrink-0 cursor-pointer"
                      >
                        فتح شاشة التتبع الكاملة ↗
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {businesses
                      .filter((b) => b.cat === 'تاكسي وأجرة' || b.cat === 'موتوسيكل ودليفري' || b.hasDelivery || b.trackingCell)
                      .slice(0, 6)
                      .map((cap) => (
                        <div
                          key={cap.id}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
                              <Car className="w-6 h-6" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-sm text-white truncate">{cap.name}</h4>
                              <p className="text-xs text-white/50">{cap.city} • {cap.addr}</p>
                              <p className="text-[11px] text-amber-300 font-mono mt-0.5">
                                هاتف الكابتن: {cap.phone}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              if (onOpenDriverTracking) {
                                onOpenDriverTracking(cap);
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition shrink-0 cursor-pointer"
                          >
                            تتبع مباشر
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 5: SUBMISSIONS QUEUE & AUDIT LOG */}
              {activeTab === 'submissions_queue' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-white">طابور طلبات المساعدين وسجل الاعتمادات:</h4>
                    <span className="text-xs text-white/60">إجمالي الطلبات: {submissions.length}</span>
                  </div>

                  {submissions.length === 0 ? (
                    <div className="p-8 text-center text-white/40 text-xs">
                      لا توجد طلبات إعلانات معلقة حالياً.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-bold text-sm text-white">
                                {sub.businessData.name || 'إعلان'}
                              </h5>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  sub.status === 'approved'
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : sub.status === 'rejected'
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {sub.status === 'approved'
                                  ? '✓ تمت الموافقة والنشر'
                                  : sub.status === 'rejected'
                                  ? '✕ تم الرفض'
                                  : '⏳ بانتظار موافقة الإدارة'}
                              </span>
                            </div>
                            <p className="text-xs text-white/60">{sub.changesSummary}</p>
                            <p className="text-[10px] text-white/40 mt-1 font-mono">
                              مقدم بواسطة: {sub.submittedByStaffName} • {new Date(sub.submittedAt).toLocaleTimeString('ar-EG')}
                            </p>
                          </div>

                          {sub.status === 'pending' && isManagerMode && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  approveAdSubmission(sub.id);
                                  if (sub.businessData.id) {
                                    handleApproveSubscriber(sub.businessData.id);
                                  }
                                  setSubmissions(getPendingAdSubmissions());
                                }}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                              >
                                موافقة ونشر ✓
                              </button>
                              <button
                                onClick={() => {
                                  rejectAdSubmission(sub.id, 'مخالفة معايير الجودة');
                                  setSubmissions(getPendingAdSubmissions());
                                }}
                                className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 text-xs font-bold transition cursor-pointer"
                              >
                                رفض ✕
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* Modal footer */}
        <div className="p-3 bg-black/60 border-t border-white/10 flex items-center justify-between text-xs text-white/50 shrink-0">
          <span>بوابة الرقابة الإدارية الموحدة للمساعدين والمدير العام • دليلك 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>

      {/* Video Preview Modal */}
      {previewingVideoUrl && (
        <div className="fixed inset-0 z-[100000] bg-black/90 flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-neutral-900 rounded-3xl overflow-hidden border border-white/20 shadow-2xl">
            <button
              onClick={() => setPreviewingVideoUrl(null)}
              className="absolute top-3 end-3 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
            >
              <X className="w-4 h-4" />
            </button>
            <video
              src={previewingVideoUrl}
              controls
              autoPlay
              className="w-full h-auto max-h-[75vh] object-contain bg-black"
            />
            <div className="p-3 text-center text-xs text-white/70">
              معاينة فيديو ريلز الإعلان للرقابة والاعتماد
            </div>
          </div>
        </div>
      )}

      {/* AdminEditSubscriberModal for editing */}
      {editingBiz && (
        <AdminEditSubscriberModal
          business={editingBiz}
          onClose={() => setEditingBiz(null)}
          onSave={(updatedBiz) => {
            const updatedList = businesses.map((b) => (b.id === updatedBiz.id ? updatedBiz : b));
            onUpdateBusinesses(updatedList);
            setEditingBiz(null);
          }}
          lang={lang}
        />
      )}
    </div>
  );
};
