import { StaffMember, StaffPermissions, Business } from '../types';

const STAFF_STORAGE_KEY = 'dalilk_staff_members_v1';
const PENDING_CHANGES_KEY = 'dalilk_pending_ad_changes_v1';

export interface PendingAdSubmission {
  id: string;
  businessId: string | number;
  type: 'new_ad' | 'edit_ad' | 'delete_request' | 'hide_request';
  submittedByStaffId: string;
  submittedByStaffName: string;
  staffNumber: number;
  submittedAt: number;
  businessData: Partial<Business>;
  previousData?: Partial<Business>;
  changesSummary: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedAt?: number;
}

const DEFAULT_STAFF: StaffMember[] = [
  {
    id: 'staff_1',
    staffNumber: 1,
    name: 'موظف 1 - مشرف قطاع القاهرة والشركات',
    username: 'staff1',
    password: '111',
    pin: '1001',
    shiftHours: '09:00 ص - 05:00 م',
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
    phone: '01011112221',
    notes: 'مشرف أول على إعلانات التجمع والشركات الكبرى',
    approvedAdsCount: 42,
    reviewedAdsCount: 68,
  },
  {
    id: 'staff_2',
    staffNumber: 2,
    name: 'موظف 2 - مراجعة الإعلانات والريلز المرئية',
    username: 'staff2',
    password: '222',
    pin: '1002',
    shiftHours: '09:00 ص - 05:00 م',
    isActive: true,
    isHidden: false,
    workOrderActive: true,
    permissions: {
      canReviewAds: true,
      canInputData: true,
      canEdit: true,
      canAdd: true,
      canDelete: false,
      canHide: true,
    },
    phone: '01022223332',
    notes: 'متخصص في مراجعة جودة الفيديو والصوتيات قبل النشر',
    approvedAdsCount: 31,
    reviewedAdsCount: 54,
  },
  {
    id: 'staff_3',
    staffNumber: 3,
    name: 'موظف 3 - تدقيق بيانات المطاعم والمحلات',
    username: 'staff3',
    password: '333',
    pin: '1003',
    shiftHours: '10:00 ص - 06:00 م',
    isActive: true,
    isHidden: false,
    workOrderActive: true,
    permissions: {
      canReviewAds: true,
      canInputData: true,
      canEdit: true,
      canAdd: true,
      canDelete: false,
      canHide: true,
    },
    phone: '01033334443',
    notes: 'تدقيق قوائم الأسعار والمنيو وأرقام الديليفري والواتساب',
    approvedAdsCount: 19,
    reviewedAdsCount: 37,
  },
  {
    id: 'staff_4',
    staffNumber: 4,
    name: 'موظف 4 - رقابة الجودة ومكافحة السبام',
    username: 'staff4',
    password: '444',
    pin: '1004',
    shiftHours: '12:00 م - 08:00 م',
    isActive: true,
    isHidden: false,
    workOrderActive: true,
    permissions: {
      canReviewAds: true,
      canInputData: false,
      canEdit: false,
      canAdd: false,
      canDelete: false,
      canHide: true,
    },
    phone: '01044445554',
    notes: 'التحقق من التراخيص الرسمية والأوراق الثبوتية',
    approvedAdsCount: 12,
    reviewedAdsCount: 29,
  },
  {
    id: 'staff_5',
    staffNumber: 5,
    name: 'موظف 5 - إدخال بيانات المشتركين الجدد',
    username: 'staff5',
    password: '555',
    pin: '1005',
    shiftHours: '02:00 م - 10:00 م',
    isActive: true,
    isHidden: false,
    workOrderActive: false,
    permissions: {
      canReviewAds: false,
      canInputData: true,
      canEdit: true,
      canAdd: true,
      canDelete: false,
      canHide: false,
    },
    phone: '01055556665',
    notes: 'إدخال الاشتراكات وتجهيز صور وبطاقات الأنشطة',
    approvedAdsCount: 8,
    reviewedAdsCount: 14,
  },
  {
    id: 'staff_6',
    staffNumber: 6,
    name: 'موظف 6 - دعم حجوزات العيادات والمهن',
    username: 'staff6',
    password: '666',
    pin: '1006',
    shiftHours: '04:00 م - 12:00 ص',
    isActive: true,
    isHidden: false,
    workOrderActive: false,
    permissions: {
      canReviewAds: true,
      canInputData: true,
      canEdit: true,
      canAdd: false,
      canDelete: false,
      canHide: false,
    },
    phone: '01066667776',
    notes: 'متابعة دورة الحجز اليومية 1-300 وتفعيل المواعيد',
    approvedAdsCount: 5,
    reviewedAdsCount: 11,
  },
  {
    id: 'staff_7',
    staffNumber: 7,
    name: 'موظف 7 - مساعد شفت ليلي وتدقيق الإعلانات',
    username: 'staff7',
    password: '777',
    pin: '1007',
    shiftHours: '08:00 م - 04:00 ص',
    isActive: false,
    isHidden: false,
    workOrderActive: false,
    permissions: {
      canReviewAds: true,
      canInputData: true,
      canEdit: false,
      canAdd: false,
      canDelete: false,
      canHide: true,
    },
    phone: '01077778887',
    notes: 'مراقبة الشفت الليلي وحظر المحتوى المخالف',
    approvedAdsCount: 0,
    reviewedAdsCount: 4,
  },
  {
    id: 'staff_8',
    staffNumber: 8,
    name: 'موظف 8 - مراقبة المحتوى والنشر الفوري',
    username: 'staff8',
    password: '888',
    pin: '1008',
    shiftHours: '12:00 ص - 08:00 ص',
    isActive: false,
    isHidden: true,
    workOrderActive: false,
    permissions: {
      canReviewAds: true,
      canInputData: false,
      canEdit: false,
      canAdd: false,
      canDelete: false,
      canHide: false,
    },
    phone: '01088889998',
    notes: 'شفت الفجر لحماية المنصة من المخالفات',
    approvedAdsCount: 0,
    reviewedAdsCount: 1,
  },
];

/**
 * الحصول على قائمة الموظفين والمساعدين (1 إلى 8)
 */
export function getStaffMembers(): StaffMember[] {
  try {
    const raw = localStorage.getItem(STAFF_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // ضمان وجود 8 موظفين دائماً
        const staffMap = new Map(parsed.map((s: StaffMember) => [s.staffNumber, s]));
        return DEFAULT_STAFF.map((def) => {
          const existing = staffMap.get(def.staffNumber);
          return existing ? { ...def, ...existing } : def;
        });
      }
    }
  } catch (e) {
    console.error('Error reading staff members', e);
  }
  return DEFAULT_STAFF;
}

/**
 * حفظ قائمة الموظفين كاملة
 */
export function saveStaffMembers(list: StaffMember[]): void {
  try {
    localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving staff members', e);
  }
}

/**
 * تحديث موظف فردي (كلمة المرور، الاسم، ساعات العمل، الصلاحيات)
 */
export function updateStaffMember(updated: StaffMember): void {
  const current = getStaffMembers();
  const next = current.map((s) => (s.id === updated.id ? updated : s));
  saveStaffMembers(next);
}

/**
 * تبديل حالة تفعيل الموظف (فتح / غلق التفعيل من المدير)
 */
export function toggleStaffActive(staffId: string, isActive: boolean): void {
  const current = getStaffMembers();
  const next = current.map((s) => (s.id === staffId ? { ...s, isActive } : s));
  saveStaffMembers(next);
}

/**
 * إصدار أو سحب أمر التشغيل والتفعيل للموظف من المدير
 */
export function toggleStaffWorkOrder(staffId: string, workOrderActive: boolean): void {
  const current = getStaffMembers();
  const next = current.map((s) => (s.id === staffId ? { ...s, workOrderActive } : s));
  saveStaffMembers(next);
}

/**
 * إظهار أو إخفاء الموظف من القائمة
 */
export function toggleStaffHidden(staffId: string, isHidden: boolean): void {
  const current = getStaffMembers();
  const next = current.map((s) => (s.id === staffId ? { ...s, isHidden } : s));
  saveStaffMembers(next);
}

/**
 * تسجيل دخول الموظف والتحقق من كلمة المرور وحالة التفعيل وأمر التشغيل
 */
export function authenticateStaff(
  usernameOrPin: string,
  passOrPin: string
): { success: boolean; staff?: StaffMember; error?: string } {
  const staffList = getStaffMembers();
  const trimmedUser = usernameOrPin.trim().toLowerCase();
  const trimmedPass = passOrPin.trim();

  const found = staffList.find(
    (s) =>
      (s.username.toLowerCase() === trimmedUser || s.pin === trimmedUser || `موظف ${s.staffNumber}` === usernameOrPin.trim()) &&
      (s.password === trimmedPass || s.pin === trimmedPass)
  );

  if (!found) {
    return { success: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' };
  }

  if (!found.isActive) {
    return {
      success: false,
      error: 'عذراً، هذا الحساب مغلق حالياً بأمر من مدير الإدارة العامة. يرجى مراجعة الإدارة لتفعيلك.',
    };
  }

  if (!found.workOrderActive) {
    return {
      success: false,
      error: 'الحساب مفعل ولكن لم يصدر لك أمر تشغيل وتفعيل نشط من المدير العام اليوم.',
    };
  }

  // تحديث وقت آخر تسجيل دخول
  const updated = { ...found, lastLoginAt: Date.now() };
  updateStaffMember(updated);

  return { success: true, staff: updated };
}

/**
 * إدارة طابور النشر والموافقة الإدارية
 * لا يتم نشر أي إعلان أو تعديل إلا بموافقة الإدارة
 */
export function getPendingAdSubmissions(): PendingAdSubmission[] {
  try {
    const raw = localStorage.getItem(PENDING_CHANGES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error reading pending submissions', e);
  }
  const defaults: PendingAdSubmission[] = [
    {
      id: 'sub_sample_1',
      businessId: 'biz_pending_101',
      type: 'new_ad',
      submittedByStaffId: 'staff_1',
      submittedByStaffName: 'موظف 1 - قطاع الشركات',
      staffNumber: 1,
      submittedAt: Date.now() - 3600000 * 3,
      businessData: {
        id: 'biz_pending_101',
        name: 'عيادات النخبة التخصصية (د. مروان الشافعي)',
        cat: 'أطباء وعيادات',
        city: 'القاهرة',
        addr: 'التجمع الخامس - شارع التسعين الشمالي - ميديكال بارك',
        phone: '01006656669',
        hotline: '19822',
        bio: 'عيادات متكاملة لكافة التخصصات الطبية، كشف واستشارات، رسم قلب وسونار متطور بأعلى معايير الرعاية 🩺',
        images: ['https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=800&auto=format&fit=crop&q=80'],
        videos: ['https://assets.mixkit.co/videos/preview/mixkit-medical-analysis-of-a-patient-in-a-laboratory-41487-large.mp4'],
        pkg: 399,
        status: 'pending',
        bookingEnabled: true,
        bookingPrice: 200,
        bookingServiceTitle: 'كشف واستشارة عيادات القلب والأوعية',
      },
      changesSummary: 'إضافة عيادة طبية جديدة مع فيديو وصور الكشف وفترات عمل صباحية ومسائية',
      status: 'pending',
    },
    {
      id: 'sub_sample_2',
      businessId: 'biz_pending_102',
      type: 'new_ad',
      submittedByStaffId: 'staff_2',
      submittedByStaffName: 'موظف 2 - مراجعة الريلز',
      staffNumber: 2,
      submittedAt: Date.now() - 3600000 * 6,
      businessData: {
        id: 'biz_pending_102',
        name: 'كابتن محمود ليموزين والرحلات السريعة',
        cat: 'تاكسي وأجرة',
        city: 'القاهرة',
        addr: 'مطار القاهرة الدولي - التجمع ومدينة نصر',
        phone: '01221299931',
        hotline: '01006656669',
        bio: 'سيارات ليموزين حديثة 2025 مع سائقين محترفين، استقبال المطار، تتبع GPS مباشر، رحلات VIP 🚖',
        images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=800&auto=format&fit=crop&q=80'],
        videos: ['https://assets.mixkit.co/videos/preview/mixkit-highway-in-the-middle-of-a-city-during-the-night-42861-large.mp4'],
        pkg: 199,
        status: 'pending',
        hasDelivery: true,
      },
      changesSummary: 'طلب اشتراك كابتن ليموزين وتاكسي مع تتبع مباشر',
      status: 'pending',
    }
  ];
  savePendingAdSubmissions(defaults);
  return defaults;
}

export function savePendingAdSubmissions(subs: PendingAdSubmission[]): void {
  try {
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(subs));
  } catch (e) {
    console.error('Error saving pending submissions', e);
  }
}

/**
 * إرسال إعلان جديد أو تعديل للمراجعة واعتماد الإدارة قبل النشر
 */
export function submitForAdminApproval(sub: Omit<PendingAdSubmission, 'id' | 'status' | 'submittedAt'>): PendingAdSubmission {
  const all = getPendingAdSubmissions();
  const newSub: PendingAdSubmission = {
    ...sub,
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    status: 'pending',
    submittedAt: Date.now(),
  };
  all.unshift(newSub);
  savePendingAdSubmissions(all);
  return newSub;
}

/**
 * موافقة المدير العام على الإعلان ونشره فوراً
 */
export function approveAdSubmission(subId: string): { success: boolean; submission?: PendingAdSubmission } {
  const all = getPendingAdSubmissions();
  const target = all.find((s) => s.id === subId);
  if (!target) return { success: false };

  target.status = 'approved';
  target.reviewedAt = Date.now();
  savePendingAdSubmissions(all);

  // تحديث عداد موافقات الموظف
  const staffList = getStaffMembers();
  const staff = staffList.find((s) => s.id === target.submittedByStaffId);
  if (staff) {
    staff.approvedAdsCount = (staff.approvedAdsCount || 0) + 1;
    updateStaffMember(staff);
  }

  return { success: true, submission: target };
}

/**
 * رفض الإعلان أو التعديل من المدير العام مع ذكر السبب
 */
export function rejectAdSubmission(subId: string, reason: string): { success: boolean } {
  const all = getPendingAdSubmissions();
  const target = all.find((s) => s.id === subId);
  if (!target) return { success: false };

  target.status = 'rejected';
  target.rejectionReason = reason;
  target.reviewedAt = Date.now();
  savePendingAdSubmissions(all);
  return { success: true };
}
