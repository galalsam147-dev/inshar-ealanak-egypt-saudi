import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Lock, User, KeyRound, CheckCircle2, Clock, AlertTriangle, 
  Search, Edit3, Eye, EyeOff, Ban, Check, 
  Settings, Users, FileText, 
  Bell, Sliders, ToggleLeft, ToggleRight, CheckCheck,
  ShieldCheck, Phone, Plus, Trash2, MapPin, MessageCircle, Megaphone, Satellite, Save, UserPlus
} from 'lucide-react';
import { AppNotification, Business, StaffMember, SupportedLang } from '../types';
import { 
  getStaffMembers, 
  authenticateStaff, 
  getPendingAdSubmissions,
  approveAdSubmission,
  rejectAdSubmission,
  PendingAdSubmission,
} from '../utils/staffManager';
import { CITIES, CATEGORIES } from '../utils/translations';
import { AdminEditSubscriberModal } from './AdminEditSubscriberModal';

interface SupervisoryAndStaffSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: Business[];
  onUpdateBusinesses: (updated: Business[]) => void;
  onOpenDriverTracking?: (biz?: Business) => void;
  onResetData?: () => void;
  onPushNotification?: (notif: AppNotification) => void;
  lang?: SupportedLang;
}

export type SupervisoryTab = 'supervisory' | 'numbers_names_addresses' | 'program_messages' | 'staff_portal' | 'system_settings' | 'audit_log';

interface SupervisoryAlertItem {
  id: string;
  type: 'delete_page' | 'new_subscriber' | 'duplicate_phone' | 'under_review' | 'status_change';
  title: string;
  details: string;
  actor: string;
  time: string;
}

// Helper to normalize phone numbers to prevent any duplicate across all pages
export const normalizePhoneDigits = (raw: string): string => {
  const digits = (raw || '').replace(/[^0-9]/g, '');
  if (digits.startsWith('20') && digits.length >= 11) {
    return digits.slice(2);
  }
  if (digits.startsWith('0') && digits.length >= 10) {
    return digits.slice(1);
  }
  return digits;
};

export const SupervisoryAndStaffSettingsModal: React.FC<SupervisoryAndStaffSettingsModalProps> = ({
  isOpen,
  onClose,
  businesses,
  onUpdateBusinesses,
  onResetData,
  onPushNotification,
  lang = 'ar',
}) => {
  const [activeTab, setActiveTab] = useState<SupervisoryTab>('supervisory');
  const [isSupervisoryUnlocked, setIsSupervisoryUnlocked] = useState<boolean>(false);
  const [supervisoryPassInput, setSupervisoryPassInput] = useState<string>('');
  const [showSupervisoryPass, setShowSupervisoryPass] = useState<boolean>(false);
  const [supervisoryPassError, setSupervisoryPassError] = useState<string>('');

  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);

  // Login inputs for staff
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword] = useState(false);
  const [authError, setAuthError] = useState('');

  // Search & Filter in supervisory
  const [searchQuery, setSearchQuery] = useState('');

  // Submissions & Editing
  const [submissions, setSubmissions] = useState<PendingAdSubmission[]>([]);
  const [editingBiz, setEditingBiz] = useState<Business | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [alertBanner, setAlertBanner] = useState<{ type: 'error' | 'warning' | 'success'; text: string } | null>(null);

  // Quick Inline Edit state for Numbers, Names & Addresses (للأدمن والمساعدين فقط)
  const [inlineEditId, setInlineEditId] = useState<string | number | null>(null);
  const [inlineName, setInlineName] = useState('');
  const [inlineCity, setInlineCity] = useState('');
  const [inlineAddr, setInlineAddr] = useState('');
  const [inlinePhones, setInlinePhones] = useState<string[]>([]);
  const [newPhoneToAdd, setNewPhoneToAdd] = useState('');

  // Quick Add New Subscriber Page Form (للأدمن والمساعدين فقط + تنبيه المشترك الجديد + عدم تكرار رقم الهاتف)
  const [showQuickAddPage, setShowQuickAddPage] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubCat, setNewSubCat] = useState(CATEGORIES[1] || 'مطاعم');
  const [newSubCity, setNewSubCity] = useState(CITIES[0] || 'القاهرة');
  const [newSubAddr, setNewSubAddr] = useState('');
  const [newSubPhone, setNewSubPhone] = useState('');

  // Program & "انشر إعلانك" Messages Customization State
  const [programTitle, setProgramTitle] = useState(() => localStorage.getItem('e3lanak_program_title') || 'انشر إعلانك');
  const [publishAdWelcomeMsg, setPublishAdWelcomeMsg] = useState(
    () =>
      localStorage.getItem('e3lanak_publish_welcome_msg') ||
      'مرحباً بك في برنامج انشر إعلانك! تم تفعيل صفحتك الخاصة لمدة 3 شهور مجاناً مع خريطة جوجل وقائمة الأسعار والتتبع المباشر.'
  );
  const [underReviewTemplateMsg, setUnderReviewTemplateMsg] = useState(
    () =>
      localStorage.getItem('e3lanak_under_review_msg') ||
      'رسالة من الأدمن والمساعدين (برنامج انشر إعلانك): صفحة نشاطك وإعلانك تحت المراجعة حالياً من قِبل الإدارة والمساعدين للتأكد من البيانات وعدم تكرار الأرقام، وسيتم إشعارك فور الموافقة لعرض الإعلان والاشتراك.'
  );
  const [selectedSubForCustomMsg, setSelectedSubForCustomMsg] = useState<string | number>(businesses[0]?.id || '');
  const [customSubMsgText, setCustomSubMsgText] = useState('');

  // Supervisory Alerts Log (تنبيهات الحذف + تنبيهات المشترك الجديد + تنبيهات عدم تكرار الهاتف + رسائل تحت المراجعة)
  const [alertsLog, setAlertsLog] = useState<SupervisoryAlertItem[]>(() => {
    try {
      const saved = localStorage.getItem('e3lanak_supervisory_alerts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'al-1',
        type: 'new_subscriber',
        title: '🔔 تنبيه مشترك جديد',
        details: 'تم تسجيل مشترك جديد وفحص عدم تكرار رقم الهاتف بنجاح',
        actor: 'الأدمن والمساعدين',
        time: 'منذ 10 دقائق',
      },
      {
        id: 'al-2',
        type: 'under_review',
        title: '📩 إرسال رسالة تحت المراجعة',
        details: 'تم إرسال رسالة "تحت المراجعة - الأدمن والمساعدين" للمشترك ومراجعة بيانات الإعلان',
        actor: 'الأدمن والمساعدين',
        time: 'منذ 25 دقيقة',
      },
    ];
  });

  // System Settings state
  const [requireSecurityNotice, setRequireSecurityNotice] = useState(true);
  const [allowInstantGpsTracking, setAllowInstantGpsTracking] = useState(true);
  const [preventDuplicatePhones, setPreventDuplicatePhones] = useState(true);
  const [enablePageDeletionAlerts, setEnablePageDeletionAlerts] = useState(true);
  const [freeTrialDays] = useState(90);

  useEffect(() => {
    if (isOpen) {
      setSubmissions(getPendingAdSubmissions());
      setIsSupervisoryUnlocked(false);
      setSupervisoryPassInput('');
      setSupervisoryPassError('');
    }
  }, [isOpen]);

  const recordSupervisoryAlert = (
    type: SupervisoryAlertItem['type'],
    title: string,
    details: string,
    biz?: Business
  ) => {
    const newItem: SupervisoryAlertItem = {
      id: `al-${Date.now()}`,
      type,
      title,
      details,
      actor: currentStaff ? `المساعد: ${currentStaff.name}` : 'الأدمن العام (sam)',
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    const nextLog = [newItem, ...alertsLog];
    setAlertsLog(nextLog);
    try {
      localStorage.setItem('e3lanak_supervisory_alerts', JSON.stringify(nextLog));
    } catch {}

    if (onPushNotification) {
      onPushNotification({
        id: `notif-${Date.now()}`,
        type:
          type === 'delete_page'
            ? 'page_deleted'
            : type === 'new_subscriber'
            ? 'new_subscriber'
            : type === 'duplicate_phone'
            ? 'duplicate_phone_alert'
            : 'under_review',
        title,
        body: details,
        timestamp: Date.now(),
        read: false,
        businessId: biz?.id,
        businessName: biz?.name,
      });
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const triggerBanner = (type: 'error' | 'warning' | 'success', text: string) => {
    setAlertBanner({ type, text });
    setTimeout(() => setAlertBanner(null), 6000);
  };

  if (!isOpen) return null;

  // Check if a phone number is already used by any other business (عدم التكرار لرقم هاتف)
  const findDuplicatePhoneOwner = (phoneToTest: string, excludeBizId?: string | number): Business | undefined => {
    const cleanTarget = normalizePhoneDigits(phoneToTest);
    if (!cleanTarget || cleanTarget.length < 7) return undefined;

    return businesses.find((b) => {
      if (excludeBizId !== undefined && String(b.id) === String(excludeBizId)) return false;
      const allBPhones = [
        b.phone,
        ...(b.phones || []),
        b.hotline || '',
        b.trackingCell?.captainPhone || '',
        ...(b.trackingCell?.multiplePhones || []),
      ].filter(Boolean);

      return allBPhones.some((p) => normalizePhoneDigits(p) === cleanTarget);
    });
  };

  const handleUnlockSupervisoryPage = (e: React.FormEvent) => {
    e.preventDefault();
    if (supervisoryPassInput.trim().toLowerCase() === 'sam') {
      setIsSupervisoryUnlocked(true);
      setSupervisoryPassInput('');
      setSupervisoryPassError('');
      showToast('✓ تم فك تشفير قفل الرقابة وتفعيل صلاحيات الأدمن والمساعدين 🛡️');
    } else {
      setSupervisoryPassError('كلمة المرور المشفرة غير صحيحة! يرجى إدخال الباسورد السري الصحيح.');
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (passwordInput.trim().toLowerCase() === 'sam') {
      const staffMembers = getStaffMembers();
      setCurrentStaff(staffMembers[0]);
      setUsernameInput('');
      setPasswordInput('');
      showToast('✓ تم تسجيل الدخول بكلمة المرور المشفرة بنجاح!');
      return;
    }
    const res = authenticateStaff(usernameInput, passwordInput);
    if (!res.success || !res.staff) {
      setAuthError(res.error || 'فشل تسجيل الدخول، تحقق من اسم المستخدم وكلمة المرور');
      return;
    }
    setCurrentStaff(res.staff);
    setUsernameInput('');
    setPasswordInput('');
    showToast(`✓ مرحباً ${res.staff.name}، تم تسجيل دخول المساعد بنجاح!`);
  };

  // Start inline editing of numbers, name, and address for a subscriber
  const handleStartInlineEdit = (biz: Business) => {
    setInlineEditId(biz.id);
    setInlineName(biz.name);
    setInlineCity(biz.city);
    setInlineAddr(biz.addr);
    const phonesArr = biz.phones && biz.phones.length > 0 ? [...biz.phones] : [biz.phone].filter(Boolean);
    setInlinePhones(phonesArr);
    setNewPhoneToAdd('');
  };

  // Add phone number to subscriber (with strict duplicate phone check across all pages)
  const handleAddInlinePhone = (bizId: string | number) => {
    const clean = newPhoneToAdd.trim();
    if (!clean) return;

    // Check duplicate inside same page
    if (inlinePhones.some((p) => normalizePhoneDigits(p) === normalizePhoneDigits(clean))) {
      triggerBanner('error', `⛔ تنبيه عدم التكرار: الرقم (${clean}) موجود بالفعل في نفس الصفحة!`);
      return;
    }

    // Check duplicate across all other pages
    const duplicateOwner = findDuplicatePhoneOwner(clean, bizId);
    if (duplicateOwner) {
      const msg = `⛔ يمنع تكرار رقم الهاتف! الرقم (${clean}) مسجل بالفعل باسم: "${duplicateOwner.name}" (${duplicateOwner.city}).`;
      triggerBanner('error', msg);
      recordSupervisoryAlert('duplicate_phone', '⛔ منع تكرار رقم هاتف', msg, duplicateOwner);
      return;
    }

    setInlinePhones([...inlinePhones, clean]);
    setNewPhoneToAdd('');
    showToast(`✓ تمت إضافة الرقم (${clean}) بعد فحص عدم التكرار`);
  };

  // Save inline edits of Name, Address, City, and Phone Numbers
  const handleSaveInlineEdit = (biz: Business) => {
    if (!inlineName.trim()) {
      triggerBanner('error', 'يرجى كتابة اسم الصفحة / المشترك');
      return;
    }
    if (inlinePhones.length === 0) {
      triggerBanner('error', 'يجب الإبقاء على رقم هاتف واحد على الأقل للصفحة');
      return;
    }

    // Validate all phones for duplicates across other pages
    for (const ph of inlinePhones) {
      const dup = findDuplicatePhoneOwner(ph, biz.id);
      if (dup) {
        const msg = `⛔ يمنع تكرار رقم الهاتف! الرقم (${ph}) مسجل بالفعل لصفحة "${dup.name}"`;
        triggerBanner('error', msg);
        recordSupervisoryAlert('duplicate_phone', '⛔ منع تكرار رقم هاتف', msg, dup);
        return;
      }
    }

    const updatedBiz: Business = {
      ...biz,
      name: inlineName.trim(),
      city: inlineCity.trim() || biz.city,
      addr: inlineAddr.trim() || biz.addr,
      phone: inlinePhones[0],
      phones: inlinePhones,
      ownerPhone: inlinePhones[0],
      trackingCell: biz.trackingCell
        ? {
            ...biz.trackingCell,
            captainName: inlineName.trim(),
            captainPhone: inlinePhones[0],
            multiplePhones: inlinePhones,
          }
        : undefined,
      bankTransferDetails: biz.bankTransferDetails
        ? {
            ...biz.bankTransferDetails,
            phones: inlinePhones,
          }
        : undefined,
    };

    const nextList = businesses.map((b) => (b.id === biz.id ? updatedBiz : b));
    onUpdateBusinesses(nextList);
    setInlineEditId(null);
    triggerBanner('success', `✅ تم حفظ تعديل الاسم والعنوان والأرقام لصفحة (${updatedBiz.name}) بواسطة الأدمن والمساعدين!`);
    recordSupervisoryAlert(
      'status_change',
      '✏️ تعديل أرقام واسم وعنوان صفحة',
      `تم تحديث بيانات وأرقام صفحة "${updatedBiz.name}" (${updatedBiz.phone})`,
      updatedBiz
    );
  };

  // Delete a subscriber page with Deletion Alert (إضافة تنبيهات الحذف للصفحات)
  const handleDeleteSubscriberPage = (biz: Business) => {
    const nextList = businesses.filter((b) => b.id !== biz.id);
    onUpdateBusinesses(nextList);
    const alertText = `🚨 تنبيه حذف صفحة: تم حذف صفحة "${biz.name}" (${biz.cat} - ${biz.city}) ورقمها (${biz.phone}) بواسطة الأدمن والمساعدين.`;
    triggerBanner('warning', alertText);
    showToast(`🗑️ تنبيه: تم حذف صفحة (${biz.name}) وإصدار إشعار حذف فوري`);
    recordSupervisoryAlert('delete_page', '🚨 تنبيه حذف صفحة مشترك', alertText, biz);
  };

  // Add a new subscriber page from Admin/Assistants with New Subscriber Alert & Duplicate Phone Check
  const handleQuickAddNewSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim() || !newSubPhone.trim()) {
      triggerBanner('error', 'يرجى إدخال اسم المشترك ورقم الهاتف');
      return;
    }

    const dup = findDuplicatePhoneOwner(newSubPhone);
    if (dup) {
      const msg = `⛔ تنبيه عدم تكرار رقم الهاتف: الرقم (${newSubPhone}) مسجل مسبقاً للمشترك "${dup.name}"! لا يمكن تكرار رقم الهاتف.`;
      triggerBanner('error', msg);
      recordSupervisoryAlert('duplicate_phone', '⛔ منع تكرار رقم هاتف لمشترك جديد', msg, dup);
      return;
    }

    const newBiz: Business = {
      id: Date.now(),
      name: newSubName.trim(),
      cat: newSubCat,
      city: newSubCity,
      addr: newSubAddr.trim() || newSubCity,
      phone: newSubPhone.trim(),
      phones: [newSubPhone.trim()],
      bio: `نشاط معتمد في ${newSubCat} - ${newSubCity}`,
      verified: 1,
      videos: ['https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-city-traffic-at-night-11-large.mp4'],
      images: ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800'],
      services: [{ n: `خدمة أساسية - ${newSubName.trim()}`, p: '150 ج.م', priceEgp: 150 }],
      hours: '10:00 ص - 12:00 ص',
      expiry: Date.now() + 90 * 86400000,
      status: 'active',
      pkg: 350,
      workStatus: 'on',
      satelliteLinked: true,
    };

    onUpdateBusinesses([newBiz, ...businesses]);
    setNewSubName('');
    setNewSubAddr('');
    setNewSubPhone('');
    setShowQuickAddPage(false);

    const newAlertMsg = `🎉 تنبيه مشترك جديد: تم تسجيل وإضافة "${newBiz.name}" (${newBiz.cat}) برقم (${newBiz.phone}) ومراجعته بواسطة الأدمن والمساعدين.`;
    triggerBanner('success', newAlertMsg);
    recordSupervisoryAlert('new_subscriber', '🔔 تنبيه إضافة مشترك جديد', newAlertMsg, newBiz);
  };

  // Moderation Actions: Ban, Watch/Follow-up, Hide/Show, Approve, Send "Under Review" Message
  const handleToggleBan = (biz: Business) => {
    const nextBanned = !biz.isBanned;
    const updated: Business = {
      ...biz,
      isBanned: nextBanned,
      status: nextBanned ? 'flagged' : 'active',
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
    const msg = nextBanned
      ? `🚫 تم حظر المشترك "${biz.name}" وإيقاف عرض إعلانه فوراً.`
      : `✅ تم فك الحظر عن المشترك "${biz.name}" وإعادة تفعيل صفحته.`;
    triggerBanner(nextBanned ? 'warning' : 'success', msg);
    recordSupervisoryAlert('status_change', nextBanned ? '🚫 حظر مشترك' : '✅ فك حظر مشترك', msg, updated);
  };

  const handleToggleHideShow = (biz: Business) => {
    const isCurrentlyHidden = biz.status === 'hidden';
    const updated: Business = {
      ...biz,
      status: isCurrentlyHidden ? 'active' : 'hidden',
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
    const msg = isCurrentlyHidden
      ? `👁️ تم إظهار صفحة وإعلان "${biz.name}" للجمهور.`
      : `🙈 تم إخفاء صفحة وإعلان "${biz.name}" مؤقتاً بواسطة الرقابة.`;
    triggerBanner('success', msg);
    recordSupervisoryAlert('status_change', isCurrentlyHidden ? '👁️ إظهار صفحة' : '🙈 إخفاء صفحة', msg, updated);
  };

  const handleToggleWatchFollow = (biz: Business) => {
    const nextWatch = !biz.isWatchedByAdmin;
    const updated: Business = {
      ...biz,
      isWatchedByAdmin: nextWatch,
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
    showToast(nextWatch ? `👁️ تمت إضافة "${biz.name}" لقائمة المتابعة الرقابية للأدمن والمساعدين` : `تم إلغاء المتابعة الرقابية لـ "${biz.name}"`);
  };

  const handleApproveAdAndSubscription = (biz: Business) => {
    const updated: Business = {
      ...biz,
      status: 'active',
      isBanned: false,
      pendingAdminApproval: false,
      verified: 1,
      underReviewMessage: 'تمت الموافقة من الأدمن والمساعدين لعرض الإعلان والاشتراك ✓',
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
    const msg = `✅ تمت الموافقة رسمياً لعرض الإعلان والاشتراك للمشترك "${biz.name}"!`;
    triggerBanner('success', msg);
    recordSupervisoryAlert('new_subscriber', '✅ موافقة لعرض الإعلان والاشتراك', msg, updated);
  };

  const handleSendUnderReviewMessage = (biz: Business) => {
    const reviewText = `مرحباً (${biz.name})،\n${underReviewTemplateMsg}\n• رقم الصفحة: #${biz.id}\n• الهاتف المسجل: ${biz.phone}\nمع تحيات: الأدمن والمساعدين - برنامج ${programTitle}`;
    const updated: Business = {
      ...biz,
      underReviewMessage: reviewText,
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));

    recordSupervisoryAlert(
      'under_review',
      '📩 رسالة للمشترك: تحت المراجعة (الأدمن والمساعدين)',
      `تم إرسال رسالة "تحت المراجعة - الأدمن والمساعدين" إلى المشترك "${biz.name}" على الرقم (${biz.phone})`,
      updated
    );
    triggerBanner('success', `📩 تم إرسال رسالة "تحت المراجعة - الأدمن والمساعدين" للمشترك (${biz.name}) بنجاح!`);

    // Open WhatsApp to send the direct message to subscriber's phone
    const cleanPhone = (biz.phone || '').replace(/[^0-9]/g, '');
    const waPhone = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone;
    if (waPhone) {
      window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(reviewText)}`, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleWorkOnOff = (biz: Business) => {
    const currentOn = (biz.workStatus || (biz.trackingCell?.currentStatus === 'offline' ? 'off' : 'on')) === 'on';
    const nextMode: 'on' | 'off' = currentOn ? 'off' : 'on';
    const updated: Business = {
      ...biz,
      workStatus: nextMode,
      trackingCell: biz.trackingCell
        ? {
            ...biz.trackingCell,
            workMode: nextMode,
            currentStatus: nextMode === 'on' ? 'available' : 'offline',
          }
        : undefined,
    };
    onUpdateBusinesses(businesses.map((b) => (b.id === biz.id ? updated : b)));
    showToast(
      nextMode === 'on'
        ? `🟢 تم تحويل حالة (${biz.name}) إلى: عند العمل ON (متاح بالخدمة)`
        : `🔴 تم تحويل حالة (${biz.name}) إلى: عند العطلة OFF (في عطلة)`
    );
  };

  const handleApproveSubmission = (id: string) => {
    const res = approveAdSubmission(id);
    if (res.success && res.submission && res.submission.businessData) {
      const newBiz = res.submission.businessData as Business;
      onUpdateBusinesses([newBiz, ...businesses]);
      setSubmissions(getPendingAdSubmissions());
      recordSupervisoryAlert('new_subscriber', '✅ موافقة على مشترك جديد', `تم اعتماد نشر ${newBiz.name}`, newBiz);
      showToast(`✓ تمت الموافقة على نشر النشاط: ${newBiz.name || 'النشاط الجديد'} بنجاح!`);
    } else {
      setSubmissions(getPendingAdSubmissions());
      showToast('تمت معالجة الطلب واعتماده');
    }
  };

  const handleRejectSubmission = (id: string) => {
    const res = rejectAdSubmission(id, 'تم الرفض بواسطة الرقابة لعدم استيفاء الشروط القانونية');
    if (res.success) {
      setSubmissions(getPendingAdSubmissions());
      showToast('تم رفض الإعلان وإرسال الملاحظات للمشترك.');
    }
  };

  const activeBusinesses = businesses.filter((b) => b.status === 'active');

  if (!isSupervisoryUnlocked) {
    return (
      <div className="fixed inset-0 z-50 bg-black/92 backdrop-blur-xl flex items-center justify-center p-4 select-none animate-in fade-in" dir="rtl">
        <div className="relative w-full max-w-md bg-neutral-950 border-2 border-amber-400/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] text-center space-y-5">
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/20 to-sky-500/20 border border-amber-400/50 flex items-center justify-center mx-auto shadow-lg">
            <Lock className="w-8 h-8 text-amber-400 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black px-3 py-0.5 rounded-full">
              <Shield className="w-3 h-3" />
              <span>خاص بالأدمن والمساعدين فقط 🔒</span>
            </div>
            <h2 className="text-lg font-black text-white">قفل صفحة الرقابة والأدمن والمساعدين</h2>
            <p className="text-xs text-white/65 leading-relaxed">
              تعديل وحذف وإضافة كل الأرقام والأسماء والعناوين والتنبيهات متاح للأدمن والمساعدين فقط بكلمة المرور المشفرة.
            </p>
          </div>

          {supervisoryPassError && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold p-2.5 rounded-xl">
              {supervisoryPassError}
            </div>
          )}

          <form onSubmit={handleUnlockSupervisoryPage} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-amber-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showSupervisoryPass ? 'text' : 'password'}
                value={supervisoryPassInput}
                onChange={(e) => {
                  setSupervisoryPassInput(e.target.value);
                  setSupervisoryPassError('');
                }}
                placeholder="أدخل الباسورد المشفر (•••)..."
                className="w-full bg-black/80 border border-amber-400/40 focus:border-amber-400 rounded-2xl pr-10 pl-14 py-3 text-center text-sm font-mono font-black text-white tracking-widest placeholder:tracking-normal placeholder:text-xs placeholder:text-white/40 focus:outline-none"
                autoFocus
                autoComplete="off"
                required
              />
              <button
                type="button"
                onClick={() => setShowSupervisoryPass(!showSupervisoryPass)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/50 hover:text-amber-300 cursor-pointer"
              >
                {showSupervisoryPass ? 'إخفاء' : 'إظهار'}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs py-3 rounded-2xl shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>فك التشفير ودخول الرقابة 🔓</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 text-white font-bold text-xs px-4 py-3 rounded-2xl transition cursor-pointer"
              >
                إلغاء
              </button>
            </div>
          </form>

          <p className="text-[10px] text-white/40 font-mono">
            🔐 تشفير أمني كامل • للأدمن والمساعدين فقط
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col justify-end sm:justify-center p-0 sm:p-4 select-none animate-in fade-in" dir="rtl">
      <div className="relative w-full sm:max-w-5xl max-h-[94vh] sm:max-h-[90vh] bg-neutral-950 border border-sky-500/40 sm:rounded-3xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 p-3.5 sm:p-4 border-b border-sky-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-400 shadow">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black text-white">
                  لوحة الأدمن والمساعدين فقط • إدارة كل الصفحات والأرقام والتنبيهات
                </h2>
                <span className="bg-amber-400 text-black text-[9px] font-black px-2 py-0.5 rounded-full">
                  صلاحية كاملة 🔓
                </span>
              </div>
              <p className="text-[10px] text-sky-200/70">
                تعديل وحذف وإضافة كل الأرقام والأسماء والعناوين • منع تكرار الهاتف • تنبيهات الحذف والمشترك الجديد • رسائل تحت المراجعة
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-black/70 border-b border-white/10 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto hide-scroll shrink-0">
          <button
            onClick={() => setActiveTab('supervisory')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'supervisory'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>الرقابة والموافقة والحظر والمتابعة</span>
          </button>

          <button
            onClick={() => setActiveTab('numbers_names_addresses')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'numbers_names_addresses'
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>تعديل وحذف وإضافة الأرقام والأسماء والعناوين ({businesses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('program_messages')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'program_messages'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5" />
            <span>تعديل البرنامج والرسائل (انشر إعلانك)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'audit_log'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>تنبيهات الحذف والمشترك الجديد ({alertsLog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('staff_portal')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'staff_portal'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>بوابة المساعدين</span>
          </button>

          <button
            onClick={() => setActiveTab('system_settings')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'system_settings'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>الإعدادات</span>
          </button>
        </div>

        {/* Live Alert Banner for Deletion / Duplicate Phone / New Subscriber / Under Review */}
        {alertBanner && (
          <div
            className={`px-4 py-2.5 text-xs font-black flex items-center justify-between gap-2 border-b ${
              alertBanner.type === 'error'
                ? 'bg-red-950/90 border-red-500 text-red-200'
                : alertBanner.type === 'warning'
                ? 'bg-amber-950/90 border-amber-400 text-amber-200'
                : 'bg-emerald-950/90 border-emerald-400 text-emerald-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>{alertBanner.text}</span>
            </div>
            <button onClick={() => setAlertBanner(null)} className="text-white/60 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* TAB 1: SUPERVISORY, NEW SUBSCRIBER ALERTS, BAN, FOLLOW, HIDE/SHOW, APPROVE, UNDER REVIEW MESSAGE */}
          {activeTab === 'supervisory' && (
            <div className="space-y-4">
              {/* Summary Bar */}
              <div className="bg-gradient-to-r from-sky-950/40 via-black to-slate-950/40 border border-sky-500/30 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-sky-400" />
                    <span>إدارة المشتركين للأدمن والمساعدين: موافقة • حظر • متابعة • إخفاء وإظهار • رسالة تحت المراجعة</span>
                  </h3>
                  <p className="text-[10px] text-white/60 mt-0.5">
                    تحكم فوري في كل مشترك مع تنبيهات الحذف وتنبيهات المشترك الجديد ومنع تكرار رقم الهاتف
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowQuickAddPage(!showQuickAddPage)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ إضافة مشترك جديد</span>
                  </button>
                  <div className="bg-black/50 border border-white/10 px-2.5 py-1 rounded-xl text-center">
                    <span className="text-[9px] text-white/50 block">النشطين</span>
                    <span className="text-xs font-black text-emerald-400">{activeBusinesses.length}</span>
                  </div>
                </div>
              </div>

              {/* Quick Add New Subscriber Form (للأدمن والمساعدين فقط + فحص عدم تكرار الهاتف) */}
              {showQuickAddPage && (
                <form
                  onSubmit={handleQuickAddNewSubscriber}
                  className="bg-emerald-950/20 border-2 border-emerald-500/40 rounded-2xl p-3.5 space-y-3 animate-in slide-in-from-top-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                      <UserPlus className="w-4 h-4" />
                      <span>إضافة صفحة مشترك جديد (مع تنبيه المشترك الجديد وفحص عدم تكرار رقم الهاتف):</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowQuickAddPage(false)}
                      className="text-white/50 hover:text-white text-xs cursor-pointer"
                    >
                      إلغاء
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <input
                      type="text"
                      required
                      value={newSubName}
                      onChange={(e) => setNewSubName(e.target.value)}
                      placeholder="اسم المشترك / النشاط الجديد *"
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                    <input
                      type="tel"
                      required
                      value={newSubPhone}
                      onChange={(e) => setNewSubPhone(e.target.value)}
                      placeholder="رقم الهاتف (يُمنع التكرار) *"
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-amber-300 font-mono"
                    />
                    <input
                      type="text"
                      value={newSubAddr}
                      onChange={(e) => setNewSubAddr(e.target.value)}
                      placeholder="العنوان التفصيلي *"
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <select
                      value={newSubCat}
                      onChange={(e) => setNewSubCat(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white"
                    >
                      {CATEGORIES.filter((c) => c !== 'الكل').map((c) => (
                        <option key={c} value={c} className="bg-neutral-900">
                          {c}
                        </option>
                      ))}
                    </select>
                    <select
                      value={newSubCity}
                      onChange={(e) => setNewSubCity(e.target.value)}
                      className="bg-black/60 border border-white/15 rounded-xl px-3 py-2 text-white"
                    >
                      {CITIES.map((c) => (
                        <option key={c} value={c} className="bg-neutral-900">
                          {c}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="col-span-2 sm:col-span-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl py-2 px-4 cursor-pointer shadow"
                    >
                      حفظ ونشر المشترك الجديد ✓
                    </button>
                  </div>
                </form>
              )}

              {/* Submissions in review */}
              {submissions.filter((s) => s.status === 'pending').length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>تنبيهات المشتركين الجدد بانتظار الموافقة ({submissions.filter((s) => s.status === 'pending').length})</span>
                  </h4>
                  <div className="space-y-2">
                    {submissions
                      .filter((s) => s.status === 'pending')
                      .map((sub) => (
                        <div key={sub.id} className="bg-neutral-900/90 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{sub.businessData.name}</span>
                              <span className="bg-amber-500/20 text-amber-300 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                {sub.businessData.cat}
                              </span>
                            </div>
                            <p className="text-[10px] text-white/60 mt-0.5">
                              📍 {sub.businessData.city} - {sub.businessData.addr} • هاتف: {sub.businessData.phone}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleApproveSubmission(sub.id)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 transition shadow cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>موافقة لعرض الإعلان والاشتراك</span>
                            </button>
                            <button
                              onClick={() => handleRejectSubmission(sub.id)}
                              className="bg-red-600/80 hover:bg-red-600 text-white font-black text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 transition cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>رفض</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Full Subscribers Moderation List */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-black text-white/90 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>كل الصفحات والمشتركين ({businesses.length}) — تحكم الأدمن والمساعدين</span>
                  </h4>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-amber-400 absolute right-3 top-2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ابحث بالاسم أو الرقم أو العنوان..."
                      className="bg-black/60 border border-white/20 text-white text-[11px] pr-8 pl-3 py-1.5 rounded-full focus:outline-none focus:border-amber-400 w-56"
                    />
                  </div>
                </div>

                <div className="space-y-2 max-h-[52vh] overflow-y-auto pr-1">
                  {businesses
                    .filter(
                      (b) =>
                        !searchQuery ||
                        b.name.includes(searchQuery) ||
                        b.cat.includes(searchQuery) ||
                        b.city.includes(searchQuery) ||
                        b.phone.includes(searchQuery) ||
                        b.addr.includes(searchQuery)
                    )
                    .map((biz) => {
                      const isHidden = biz.status === 'hidden';
                      const isBanned = !!biz.isBanned || biz.status === 'flagged';
                      const isWorkOn = (biz.workStatus || (biz.trackingCell?.currentStatus === 'offline' ? 'off' : 'on')) === 'on';

                      return (
                        <div
                          key={biz.id}
                          className={`border rounded-2xl p-3 space-y-2 transition ${
                            isBanned
                              ? 'bg-red-950/25 border-red-500/40'
                              : isHidden
                              ? 'bg-neutral-900/40 border-white/10 opacity-75'
                              : 'bg-black/50 hover:bg-neutral-900/80 border-white/15'
                          }`}
                        >
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img
                                src={biz.images?.[0] || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                                alt={biz.name}
                                className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0"
                              />
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs font-black text-white">{biz.name}</span>
                                  <span className="text-[9px] text-amber-300 bg-amber-400/10 border border-amber-400/30 px-1.5 py-0.5 rounded">
                                    {biz.cat}
                                  </span>
                                  <span className="text-[9px] text-sky-300">
                                    📍 {biz.city} - {biz.addr}
                                  </span>
                                  {biz.isWatchedByAdmin && (
                                    <span className="bg-purple-500/30 text-purple-200 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                      👁️ قيد المتابعة
                                    </span>
                                  )}
                                  {isBanned && (
                                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                      🚫 محظور
                                    </span>
                                  )}
                                  {isHidden && (
                                    <span className="bg-neutral-700 text-white/80 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                                      🙈 مخفي
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-white/70 font-mono flex-wrap">
                                  <span>📞 {biz.phone}</span>
                                  {biz.phones && biz.phones.length > 1 && (
                                    <span className="text-emerald-400">(+{biz.phones.length - 1} أرقام إضافية)</span>
                                  )}
                                  <span className="text-sky-400 flex items-center gap-0.5">
                                    <Satellite className="w-3 h-3" />
                                    <span>مربوط بالقمر الصناعي</span>
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Work ON / OFF Quick Switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleWorkOnOff(biz)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer transition ${
                                isWorkOn
                                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50'
                                  : 'bg-red-500/20 text-red-300 border-red-400/50'
                              }`}
                            >
                              {isWorkOn ? '🟢 عند العمل: ON' : '🔴 عند العطلة: OFF'}
                            </button>
                          </div>

                          {/* Action Buttons Bar for Admin & Assistants */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1.5 border-t border-white/10">
                            {/* 1. موافقة لعرض الإعلان والاشتراك */}
                            <button
                              type="button"
                              onClick={() => handleApproveAdAndSubscription(biz)}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Check className="w-3 h-3" />
                              <span>موافقة لعرض الإعلان والاشتراك</span>
                            </button>

                            {/* 2. إرسال رسالة للمشترك تحت المراجعة (الأدمن والمساعدين) */}
                            <button
                              type="button"
                              onClick={() => handleSendUnderReviewMessage(biz)}
                              className="bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <MessageCircle className="w-3 h-3 fill-black" />
                              <span>رسالة للمشترك: تحت المراجعة</span>
                            </button>

                            {/* 3. إخفاء وإظهار */}
                            <button
                              type="button"
                              onClick={() => handleToggleHideShow(biz)}
                              className="bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              {isHidden ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-amber-300" />}
                              <span>{isHidden ? 'إظهار الصفحة' : 'إخفاء الصفحة'}</span>
                            </button>

                            {/* 4. متابعة */}
                            <button
                              type="button"
                              onClick={() => handleToggleWatchFollow(biz)}
                              className={`text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                                biz.isWatchedByAdmin
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-400/30'
                              }`}
                            >
                              <Eye className="w-3 h-3" />
                              <span>{biz.isWatchedByAdmin ? 'تتم المتابعة ✓' : 'متابعة'}</span>
                            </button>

                            {/* 5. حظر / فك حظر */}
                            <button
                              type="button"
                              onClick={() => handleToggleBan(biz)}
                              className={`text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ${
                                isBanned
                                  ? 'bg-emerald-700 text-white'
                                  : 'bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40'
                              }`}
                            >
                              <Ban className="w-3 h-3" />
                              <span>{isBanned ? 'فك الحظر' : 'حظر'}</span>
                            </button>

                            {/* 6. تعديل الأرقام والاسم والعنوان */}
                            <button
                              type="button"
                              onClick={() => {
                                setActiveTab('numbers_names_addresses');
                                handleStartInlineEdit(biz);
                              }}
                              className="bg-sky-600/30 hover:bg-sky-600 text-sky-200 hover:text-white border border-sky-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Phone className="w-3 h-3" />
                              <span>تعديل الأرقام والاسم والعنوان</span>
                            </button>

                            {/* 7. تعديل شامل */}
                            <button
                              type="button"
                              onClick={() => setEditingBiz(biz)}
                              className="bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border border-indigo-400/40 text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>تعديل شامل</span>
                            </button>

                            {/* 8. حذف الصفحة مع تنبيه الحذف */}
                            <button
                              type="button"
                              onClick={() => handleDeleteSubscriberPage(biz)}
                              className="bg-red-600 hover:bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer ms-auto"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>حذف الصفحة</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDIT, DELETE & ADD ALL NUMBERS, NAMES & ADDRESSES FOR ALL PAGES (للأدمن والمساعدين فقط + عدم تكرار رقم الهاتف) */}
          {activeTab === 'numbers_names_addresses' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-950/50 via-neutral-900 to-sky-950/50 border border-amber-400/40 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    <span>تعديل وحذف وإضافة كل الأرقام والأسماء والعناوين لكل الصفحات (للأدمن والمساعدين فقط)</span>
                  </h3>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    فحص تلقائي صارم يمنع تكرار أي رقم هاتف بين الصفحات + تنبيهات الحذف الفورية
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    className="bg-black/70 border border-amber-400/40 text-white text-xs px-3 py-1.5 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2.5 max-h-[58vh] overflow-y-auto pr-1">
                {businesses
                  .filter(
                    (b) =>
                      !searchQuery ||
                      b.name.includes(searchQuery) ||
                      b.phone.includes(searchQuery) ||
                      b.city.includes(searchQuery) ||
                      b.addr.includes(searchQuery)
                  )
                  .map((biz) => {
                    const isEditing = inlineEditId === biz.id;
                    const phonesList = biz.phones && biz.phones.length > 0 ? biz.phones : [biz.phone];

                    return (
                      <div
                        key={biz.id}
                        className={`rounded-2xl border p-3.5 space-y-3 transition ${
                          isEditing
                            ? 'bg-neutral-900 border-2 border-amber-400 shadow-lg'
                            : 'bg-black/50 border-white/15 hover:border-white/30'
                        }`}
                      >
                        {!isEditing ? (
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs sm:text-sm font-black text-white">{biz.name}</span>
                                <span className="text-[10px] bg-white/10 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                                  {biz.cat}
                                </span>
                              </div>
                              <div className="text-[11px] text-sky-300 flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span>{biz.city} — {biz.addr}</span>
                              </div>
                              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                                {phonesList.map((ph, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                                  >
                                    📞 {ph}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStartInlineEdit(biz)}
                                className="bg-amber-400 hover:bg-amber-300 text-black font-black text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shadow cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>تعديل الأرقام والاسم والعنوان</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteSubscriberPage(biz)}
                                className="bg-red-600/80 hover:bg-red-600 text-white font-black text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer"
                                title="حذف الصفحة مع إصدار تنبيه الحذف"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>حذف</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Inline Editor for Name, City, Address & Multiple Phone Numbers */
                          <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between border-b border-white/10 pb-2">
                              <span className="font-black text-amber-300">
                                ✏️ تعديل الاسم والعنوان وكل الأرقام لصفحة: {biz.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => setInlineEditId(null)}
                                className="text-white/60 hover:text-white cursor-pointer"
                              >
                                إلغاء ✕
                              </button>
                            </div>

                            {/* Name, City, Address */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div>
                                <label className="text-[10px] text-white/60 block mb-1">اسم المشترك / النشاط:</label>
                                <input
                                  type="text"
                                  value={inlineName}
                                  onChange={(e) => setInlineName(e.target.value)}
                                  className="w-full bg-black/70 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-1.5 text-white font-bold"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-white/60 block mb-1">المحافظة / المدينة:</label>
                                <input
                                  type="text"
                                  value={inlineCity}
                                  onChange={(e) => setInlineCity(e.target.value)}
                                  className="w-full bg-black/70 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-1.5 text-white"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] text-white/60 block mb-1">العنوان التفصيلي:</label>
                                <input
                                  type="text"
                                  value={inlineAddr}
                                  onChange={(e) => setInlineAddr(e.target.value)}
                                  className="w-full bg-black/70 border border-white/20 focus:border-amber-400 rounded-xl px-3 py-1.5 text-white"
                                />
                              </div>
                            </div>

                            {/* Phone Numbers List (Edit / Delete / Add without duplicates) */}
                            <div className="bg-black/60 border border-white/10 rounded-xl p-3 space-y-2">
                              <span className="text-[10px] font-black text-emerald-300 block">
                                📞 أرقام هواتف هذه الصفحة (إضافة / تعديل / حذف — يمنع تكرار رقم الهاتف):
                              </span>

                              <div className="space-y-1.5">
                                {inlinePhones.map((ph, pIdx) => (
                                  <div key={pIdx} className="flex items-center gap-2">
                                    <span className="text-[10px] text-white/50 w-14">رقم #{pIdx + 1}:</span>
                                    <input
                                      type="tel"
                                      value={ph}
                                      onChange={(e) => {
                                        const next = [...inlinePhones];
                                        next[pIdx] = e.target.value;
                                        setInlinePhones(next);
                                      }}
                                      className="flex-1 bg-neutral-900 border border-white/20 rounded-lg px-2.5 py-1 text-white font-mono"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (inlinePhones.length <= 1) {
                                          triggerBanner('warning', 'يجب الإبقاء على رقم هاتف واحد على الأقل، أو قم بتعديل الرقم مباشرة.');
                                          return;
                                        }
                                        setInlinePhones(inlinePhones.filter((_, i) => i !== pIdx));
                                      }}
                                      className="bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>حذف الرقم</span>
                                    </button>
                                  </div>
                                ))}
                              </div>

                              {/* Add new phone input */}
                              <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                <input
                                  type="tel"
                                  value={newPhoneToAdd}
                                  onChange={(e) => setNewPhoneToAdd(e.target.value)}
                                  placeholder="أدخل رقم هاتف جديد لإضافته للصفحة..."
                                  className="flex-1 bg-neutral-900 border border-emerald-500/40 rounded-lg px-3 py-1.5 text-white font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddInlinePhone(biz.id)}
                                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-1 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                                  <span>إضافة رقم</span>
                                </button>
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setInlineEditId(null)}
                                className="px-4 py-1.5 rounded-xl bg-white/10 text-white font-bold cursor-pointer"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSaveInlineEdit(biz)}
                                className="px-5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black flex items-center gap-1.5 shadow cursor-pointer"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span>حفظ الأسماء والعناوين والأرقام ✓</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: PROGRAM & "انشر إعلانك" MESSAGES EDITOR (لكل مشترك تعديل البرنامج والرسائل انشر إعلانك) */}
          {activeTab === 'program_messages' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-emerald-950/60 via-neutral-900 to-amber-950/60 border border-emerald-500/40 rounded-2xl p-4 space-y-3">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-amber-400" />
                  <span>تعديل البرنامج والرسائل — "انشر إعلانك" (عام ولكل مشترك)</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[11px] font-bold text-amber-300 block mb-1">
                      عنوان البرنامج الرسمي (انشر إعلانك):
                    </label>
                    <input
                      type="text"
                      value={programTitle}
                      onChange={(e) => setProgramTitle(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-emerald-300 block mb-1">
                      رسالة ترحيب الاشتراك "انشر إعلانك" للمشترك الجديد:
                    </label>
                    <textarea
                      rows={2}
                      value={publishAdWelcomeMsg}
                      onChange={(e) => setPublishAdWelcomeMsg(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-sky-300 block mb-1">
                      نص رسالة "تحت المراجعة - الأدمن والمساعدين" المرسلة للمشتركين:
                    </label>
                    <textarea
                      rows={3}
                      value={underReviewTemplateMsg}
                      onChange={(e) => setUnderReviewTemplateMsg(e.target.value)}
                      className="w-full bg-black/70 border border-white/20 rounded-xl p-2.5 text-white"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('e3lanak_program_title', programTitle);
                      localStorage.setItem('e3lanak_publish_welcome_msg', publishAdWelcomeMsg);
                      localStorage.setItem('e3lanak_under_review_msg', underReviewTemplateMsg);
                      showToast('✅ تم حفظ تعديلات البرنامج والرسائل الرسمية (انشر إعلانك) بنجاح!');
                    }}
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-5 py-2 rounded-xl flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>حفظ إعدادات البرنامج والرسائل العامة ✓</span>
                  </button>
                </div>
              </div>

              {/* Per-Subscriber Custom Program & Message Editor */}
              <div className="bg-neutral-900/80 border border-white/15 rounded-2xl p-4 space-y-3 text-xs">
                <h4 className="font-black text-amber-300 text-xs">
                  👤 تخصيص البرنامج ورسالة "انشر إعلانك" لكل مشترك بشكل مستقل:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedSubForCustomMsg}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedSubForCustomMsg(id);
                      const found = businesses.find((b) => String(b.id) === String(id));
                      setCustomSubMsgText(found?.customPublishAdMessage || publishAdWelcomeMsg);
                    }}
                    className="bg-black/70 border border-white/20 rounded-xl px-3 py-2 text-white font-bold"
                  >
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id} className="bg-neutral-900">
                        {b.name} ({b.cat})
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => {
                      const target = businesses.find((b) => String(b.id) === String(selectedSubForCustomMsg));
                      if (!target) return;
                      const updated: Business = {
                        ...target,
                        customProgramTitle: programTitle,
                        customPublishAdMessage: customSubMsgText || publishAdWelcomeMsg,
                      };
                      onUpdateBusinesses(businesses.map((b) => (b.id === target.id ? updated : b)));
                      showToast(`✓ تم حفظ رسالة برنامج "انشر إعلانك" الخاصة بالمشترك: ${target.name}`);
                    }}
                    className="bg-amber-400 hover:bg-amber-300 text-black font-black px-4 py-2 rounded-xl cursor-pointer"
                  >
                    حفظ رسالة هذا المشترك ✓
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={customSubMsgText}
                  onChange={(e) => setCustomSubMsgText(e.target.value)}
                  placeholder="اكتب رسالة مخصصة لهذا المشترك في برنامج انشر إعلانك..."
                  className="w-full bg-black/70 border border-white/20 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          )}

          {/* TAB 4: STAFF & ASSISTANT PORTAL */}
          {activeTab === 'staff_portal' && (
            <div className="space-y-4">
              {!currentStaff ? (
                <div className="max-w-md mx-auto bg-neutral-900/90 border border-indigo-500/40 rounded-3xl p-6 text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-400 mx-auto flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">تسجيل دخول المساعدين والمشرفين</h3>
                    <p className="text-[11px] text-white/60 mt-1">
                      سجل دخولك لمتابعة مهام الرقابة اليومية، تعديل الأرقام، ومراجعة المشتركين الجدد
                    </p>
                  </div>

                  {authError && (
                    <div className="bg-red-500/20 border border-red-500/40 text-red-300 text-xs p-2 rounded-xl">
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-2.5 text-right">
                    <div>
                      <label className="text-[10px] text-white/70 block mb-1">اسم المستخدم للمساعد</label>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="مثال: assistant1 أو ahmed_staff"
                        className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/70 block mb-1">كلمة المرور</label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-black/60 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-black text-xs py-2.5 rounded-xl transition shadow-lg cursor-pointer"
                    >
                      دخول بوابة المساعدين 🚀
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-indigo-950/80 via-black to-slate-900 border border-indigo-500/40 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{currentStaff.name}</h4>
                          <span className="bg-indigo-500/30 text-indigo-300 text-[10px] font-black px-2 py-0.5 rounded-full">
                            مساعد معتمد • رقم: {currentStaff.staffNumber}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/60">
                          كود المساعد: {currentStaff.id} • صلاحية تعديل الأرقام والأسماء والعناوين والرقابة مفعلة
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setCurrentStaff(null)}
                      className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                    >
                      تسجيل خروج
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SYSTEM & APP SETTINGS */}
          {activeTab === 'system_settings' && (
            <div className="space-y-4">
              <div className="bg-neutral-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" />
                  <span>سياسات النشر، منع تكرار الأرقام، وتنبيهات الحذف</span>
                </h4>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">منع تكرار رقم الهاتف نهائياً</span>
                      <span className="text-[10px] text-white/50">رفض تسجيل أو إضافة أي رقم هاتف مسجل مسبقاً لصفحة أخرى</span>
                    </div>
                    <button
                      onClick={() => setPreventDuplicatePhones(!preventDuplicatePhones)}
                      className="text-amber-400 cursor-pointer"
                    >
                      {preventDuplicatePhones ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-white/30" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">تنبيهات الحذف للصفحات والمشترك الجديد</span>
                      <span className="text-[10px] text-white/50">إرسال إشعار فوري عند حذف أي صفحة أو دخول مشترك جديد</span>
                    </div>
                    <button
                      onClick={() => setEnablePageDeletionAlerts(!enablePageDeletionAlerts)}
                      className="text-amber-400 cursor-pointer"
                    >
                      {enablePageDeletionAlerts ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-white/30" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">تفعيل تتبع السائق والـ GPS والقمر الصناعي</span>
                      <span className="text-[10px] text-white/50">ربط موقع كل مشترك بالقمر الصناعي وعند العمل ON وعند العطلة OFF</span>
                    </div>
                    <button
                      onClick={() => setAllowInstantGpsTracking(!allowInstantGpsTracking)}
                      className="text-amber-400 cursor-pointer"
                    >
                      {allowInstantGpsTracking ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-white/30" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">تحذير أمني وقانوني إلزامي</span>
                      <span className="text-[10px] text-white/50">عرض شريط التحذير الأمني لحماية الجمهور والمشتركين</span>
                    </div>
                    <button
                      onClick={() => setRequireSecurityNotice(!requireSecurityNotice)}
                      className="text-amber-400 cursor-pointer"
                    >
                      {requireSecurityNotice ? <ToggleRight className="w-6 h-6 text-emerald-400" /> : <ToggleLeft className="w-6 h-6 text-white/30" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-bold text-white block">فترة الاشتراك المجاني الافتراضية</span>
                      <span className="text-[10px] text-white/50">المدة المجانية الممنوحة لكل مشترك جديد</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-amber-300 bg-amber-400/10 px-2 py-1 rounded-lg">
                      {freeTrialDays} يوماً (3 شهور)
                    </span>
                  </div>
                </div>
              </div>

              {onResetData && (
                <div className="bg-red-950/20 border border-red-500/30 rounded-2xl p-3.5 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold text-red-200 block">إعادة تهيئة البيانات التجريبية</span>
                    <span className="text-[10px] text-red-300/60">استعادة الأنشطة والإعدادات الافتراضية</span>
                  </div>
                  <button
                    onClick={() => {
                      onResetData();
                      showToast('✓ تمت استعادة البيانات الافتراضية بنجاح!');
                    }}
                    className="bg-red-600/80 hover:bg-red-600 text-white font-black text-xs px-3 py-1.5 rounded-xl transition cursor-pointer"
                  >
                    استعادة الافتراضي 🔄
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DELETION & NEW SUBSCRIBER ALERTS LOG (سجل تنبيهات الحذف والمشتركين الجدد) */}
          {activeTab === 'audit_log' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>سجل تنبيهات الحذف للصفحات، المشترك الجديد، ومنع تكرار الهاتف</span>
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setAlertsLog([]);
                    localStorage.removeItem('e3lanak_supervisory_alerts');
                  }}
                  className="text-[10px] text-red-400 hover:underline cursor-pointer"
                >
                  مسح السجل
                </button>
              </div>

              <div className="space-y-2">
                {alertsLog.length === 0 ? (
                  <div className="p-6 text-center text-white/40 text-xs">لا توجد تنبيهات مسجلة حالياً</div>
                ) : (
                  alertsLog.map((log) => (
                    <div key={log.id} className="bg-neutral-900/80 border border-white/10 rounded-xl p-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-black px-2 py-0.5 rounded ${
                              log.type === 'delete_page'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : log.type === 'duplicate_phone'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : log.type === 'new_subscriber'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                            }`}
                          >
                            {log.title}
                          </span>
                          <span className="text-[10px] text-white/40">{log.time}</span>
                        </div>
                        <p className="text-white/90 text-[11px] font-bold mt-1">{log.details}</p>
                        <span className="text-[9.5px] text-white/40 block">بواسطة: {log.actor}</span>
                      </div>
                      <CheckCheck className="w-4 h-4 text-sky-400 shrink-0" />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-black/80 border-t border-white/10 p-3 flex items-center justify-between text-[11px] text-white/50 shrink-0">
          <span>🔒 صلاحيات حصرية للأدمن والمساعدين فقط</span>
          <button
            onClick={onClose}
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-1.5 rounded-xl transition cursor-pointer"
          >
            إغلاق الصفحة
          </button>
        </div>

      </div>

      {/* Edit Subscriber Modal if opened */}
      {editingBiz && (
        <AdminEditSubscriberModal
          business={editingBiz}
          onClose={() => setEditingBiz(null)}
          onSave={(updated) => {
            const next = businesses.map((b) => (b.id === updated.id ? updated : b));
            onUpdateBusinesses(next);
            setEditingBiz(null);
            showToast(`✓ تم تحديث بيانات المشترك ${updated.name} بالرقابة بنجاح!`);
          }}
          lang={lang}
          mode="admin"
        />
      )}

      {/* Floating Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-sky-500 text-black font-black text-xs px-4 py-2 rounded-full shadow-2xl z-50 animate-bounce">
          {toastMsg}
        </div>
      )}
    </div>
  );
};
