/**
 * نظام حجز المواعيد والزيارات اليومي المتقدم لجميع صفحات واشتراكات المنصة
 * (عيادات، مستشفيات، كوافير، محلات، فنادق، مراكز خدمة، عقارات)
 * 
 * القواعد والمعايير المطلوبة:
 * 1. ترقيم الحجوزات تسلسلياً من 1 إلى 300 عميل لكل مشترك يومياً.
 * 2. دورة 24 ساعة تبدأ وتتصفر يومياً من 12:00 منتصف الليل (12 ص) حتى 12:00 منتصف الليل التالية (12 ص).
 * 3. حجز تلقائي بالأرقام بالترتيب (1، 2، 3... 300) بمجرد إدخال رقم هاتف العميل والموعد.
 * 4. تنظيم الوقت والمواعيد المتاحة بحسب مواعيد وتفضيلات المشترك لتظهر للعميل.
 * 5. أرقام دفع مستقلة لكل صفحة (فودافون كاش، إنستاباي، حساب بنكي، وفيزا على طريقة اشتراكات تيك توك).
 * 6. رد آلي فوري للحجز (واتساب / تليجرام / SMS / رسائل) على رقم المشترك ورقم العميل.
 * 7. دعم قنوات الاتصال: تليجرام، مكالمات فيديو، مكالمات صوتية، جوجل ميت، ومحفظة نقود.
 */

import { Business, SubscriberBankTransferDetails } from '../types';

export interface DailyBookingSlot {
  queueNumber: number; // 1 to 300
  timeSlot: string; // e.g. "10:00 ص - 10:30 ص"
  isBooked: boolean;
  bookingRef?: string;
  customerName?: string;
  customerPhone?: string;
  serviceName?: string;
  notes?: string;
  paymentMethod?: string;
  bookedAt?: number;
}

export interface DayBookingCycle {
  businessId: string | number;
  cycleDate: string; // "YYYY-MM-DD"
  cycleStartTimestamp: number; // 12:00 AM timestamp
  cycleEndTimestamp: number; // Next 12:00 AM timestamp
  totalCapacity: number; // 300
  currentBookedCount: number;
  slots: DailyBookingSlot[];
}

/**
 * الحصول على معرف دورة الـ 24 ساعة الحالية (من 12:00 ص إلى 12:00 ص)
 */
export function getCurrentCycleDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * حساب الوقت المتبقي حتى تصفير العداد عند الساعة 12:00 ص
 */
export function getTimeUntilNextReset(): { hours: number; minutes: number; seconds: number; formatted: string } {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
  const diffMs = tomorrow.getTime() - now.getTime();
  
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return { hours, minutes, seconds, formatted };
}

/**
 * توليد المواعيد المقترحة على مدار اليوم (من 1 إلى 300 عميل)
 */
export function generateDayTimeSlots(hoursString?: string): string[] {
  // إنشاء فترات مواعيد قياسية تغطي فترات العمل على مدار اليوم
  const baseSlots: string[] = [];
  const startHour = 9; // 9:00 ص
  const endHour = 23; // 11:00 م
  
  for (let h = startHour; h <= endHour; h++) {
    const period = h < 12 ? 'ص' : (h === 12 ? 'م' : 'م');
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    baseSlots.push(`${displayH}:00 ${period} - ${displayH}:30 ${period}`);
    baseSlots.push(`${displayH}:30 ${period} - ${displayH + 1 > 12 ? (displayH + 1 - 12) : displayH + 1}:00 ${h + 1 < 12 ? 'ص' : 'م'}`);
  }

  // ملء حتى 300 رقم تدريجياً
  const result: string[] = [];
  let slotIndex = 0;
  for (let i = 1; i <= 300; i++) {
    const slot = baseSlots[slotIndex % baseSlots.length];
    result.push(slot);
    if (i % 10 === 0) slotIndex++;
  }
  return result;
}

/**
 * قراءة أو تهيئة دورة الحجوزات اليومية للمشترك مع التصفير التلقائي عند 12:00 ص
 */
export function getBusinessDailyCycle(businessId: string | number): DayBookingCycle {
  const todayDate = getCurrentCycleDate();
  const storageKey = `e3lanak_daily_cycle_${businessId}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed: DayBookingCycle = JSON.parse(raw);
      // تحقق هل نحن في نفس دورة اليوم؟ إذا تغير التاريخ تتصفر الحجوزات تلقائياً من 12 ص
      if (parsed.cycleDate === todayDate && Array.isArray(parsed.slots)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed reading daily cycle', e);
  }

  // تهيئة دورة جديدة تتصفر فيها الأرقام (1 إلى 300)
  const slots: DailyBookingSlot[] = [];
  const now = new Date();
  const cycleStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime();
  const cycleEnd = cycleStart + 86400000;

  // توليد المواعيد
  const timeLabels = generateDayTimeSlots();

  for (let num = 1; num <= 300; num++) {
    slots.push({
      queueNumber: num,
      timeSlot: timeLabels[num - 1] || `موعد رقم ${num}`,
      isBooked: false,
    });
  }

  // إضافة بعض الحجوزات الأولية الحية الواقعية للصفحات كبداية محاكاة
  const sampleBookingsCount = Math.floor(12 + (Number(businessId) % 25));
  for (let i = 0; i < sampleBookingsCount; i++) {
    slots[i].isBooked = true;
    slots[i].bookingRef = `SAM-Q${i + 1}-${Math.floor(1000 + Math.random() * 9000)}`;
    slots[i].customerName = ['محمد إبراهيم', 'سارة عبد الرحمن', 'أحمد عادل', 'مريم الشريف', 'محمود توفيق', 'منى حسن', 'كريم عبد الله', 'نورهان سعيد'][i % 8];
    slots[i].customerPhone = `010${Math.floor(10000000 + Math.random() * 89999999)}`;
    slots[i].serviceName = 'كشف وحجز موعد معتمد';
    slots[i].paymentMethod = i % 3 === 0 ? 'فودافون كاش' : (i % 3 === 1 ? 'إنستاباي' : 'فيزا (تيك توك)');
    slots[i].bookedAt = cycleStart + 3600000 * (i + 1);
  }

  const newCycle: DayBookingCycle = {
    businessId,
    cycleDate: todayDate,
    cycleStartTimestamp: cycleStart,
    cycleEndTimestamp: cycleEnd,
    totalCapacity: 300,
    currentBookedCount: sampleBookingsCount,
    slots,
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(newCycle));
  } catch (e) {
    console.error(e);
  }

  return newCycle;
}

/**
 * حجز رقم ودور تسلسلي جديد من 1 إلى 300 للعميل
 */
export function bookNextQueueSlot(
  businessId: string | number,
  bookingData: {
    customerName: string;
    customerPhone: string;
    serviceName?: string;
    preferredTimeSlot?: string;
    paymentMethod: string;
    notes?: string;
  }
): { success: boolean; slot?: DailyBookingSlot; error?: string; cycle: DayBookingCycle } {
  const cycle = getBusinessDailyCycle(businessId);
  
  // البحث عن أول رقم غير محجوز بالترتيب من 1 إلى 300
  let targetIndex = -1;

  if (bookingData.preferredTimeSlot) {
    targetIndex = cycle.slots.findIndex(s => !s.isBooked && s.timeSlot === bookingData.preferredTimeSlot);
  }

  if (targetIndex === -1) {
    targetIndex = cycle.slots.findIndex(s => !s.isBooked);
  }

  if (targetIndex === -1) {
    return {
      success: false,
      error: 'عذراً! اكتملت قائمة الحجوزات اليومية (300 عميل). تتصفر القائمة وتبدأ دورة جديدة عند 12:00 منتصف الليل.',
      cycle
    };
  }

  const assignedSlot = cycle.slots[targetIndex];
  const ref = `SAM-BK-${assignedSlot.queueNumber}-${Math.floor(10000 + Math.random() * 90000)}`;

  assignedSlot.isBooked = true;
  assignedSlot.bookingRef = ref;
  assignedSlot.customerName = bookingData.customerName;
  assignedSlot.customerPhone = bookingData.customerPhone;
  assignedSlot.serviceName = bookingData.serviceName || 'حجز موعد وزيارة';
  assignedSlot.notes = bookingData.notes;
  assignedSlot.paymentMethod = bookingData.paymentMethod;
  assignedSlot.bookedAt = Date.now();

  cycle.currentBookedCount += 1;

  // حفظ الدورة المحدثة
  try {
    localStorage.setItem(`e3lanak_daily_cycle_${businessId}`, JSON.stringify(cycle));
  } catch (e) {
    console.error(e);
  }

  return {
    success: true,
    slot: assignedSlot,
    cycle
  };
}

/**
 * نص الرد الآلي وتأكيد الحجز الذكي لبرامج تليجرام وواتساب
 */
export function buildAutoReplyBookingMessage(
  business: Business,
  slot: DailyBookingSlot,
  transferDetails?: SubscriberBankTransferDetails
): string {
  const trans = transferDetails || business.bankTransferDetails;
  
  return (
    `🎫 تأكيد حجز موعد رسمي في: ${business.name}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    `🔢 رقمك في قائمة الحجز اليومي: [ ${slot.queueNumber} من 300 ]\n` +
    `⏰ الموعد المحدد: ${slot.timeSlot}\n` +
    `🔖 كود الحجز المعتمد: ${slot.bookingRef}\n` +
    `👤 اسم العميل: ${slot.customerName}\n` +
    `📱 رقم الهاتف: ${slot.customerPhone}\n` +
    `💳 طريقة الدفع المختارة: ${slot.paymentMethod}\n` +
    `━━━━━━━━━━━━━━━━━━\n` +
    (trans?.vodafoneCashNumber ? `📱 فودافون كاش: ${trans.vodafoneCashNumber}\n` : '') +
    (trans?.instapayId ? `⚡ إنستاباي: ${trans.instapayId}\n` : '') +
    (trans?.bankName && trans?.accountNumber ? `🏦 حساب ${trans.bankName}: ${trans.accountNumber}\n` : '') +
    (trans?.hotline ? `🔥 الخط الساخن: ${trans.hotline}\n` : '') +
    `━━━━━━━━━━━━━━━━━━\n` +
    `📍 العنوان: ${business.addr} - ${business.city}\n` +
    `🔄 تتصفر المواعيد تلقائياً كل 24 ساعة (من 12:00 ص إلى 12:00 ص)\n` +
    `✨ شكراً لاختيارك منصة إعلانك SAM`
  );
}
