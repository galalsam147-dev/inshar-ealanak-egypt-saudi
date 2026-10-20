import { Business } from '../types';

export type DeliverySector = 'restaurant' | 'store' | 'profession' | 'none';

export interface DeliveryEligibilityResult {
  isEligible: boolean;
  sector: DeliverySector;
  sectorLabel: string;
  reason?: string;
}

/**
 * دليفري للمتاجر والمطاعم والمهن فقط دون الفنادق والترفيه
 * Strictly delivers for:
 * 1. المطاعم (Restaurants & Cafes)
 * 2. المتاجر (Stores, Supermarkets, Pharmacies, Retail, Spare parts)
 * 3. المهن (Professions: Lawyers, Accountants, Doctors/Clinics, Craftsmen, Maintenance)
 * 
 * Strictly excludes:
 * - الفنادق (Hotels & Resorts -> Direct bookings with pay on-site / at hotel)
 * - الترفيه والسياحة (Entertainment & Tourism -> Visits and direct tickets)
 */
export function getDeliveryEligibility(
  biz: (Business & { hasDelivery?: boolean }) | { cat?: string; hotelBooking?: { isHotel?: boolean }; name?: string; hasDelivery?: boolean } | null | undefined
): DeliveryEligibilityResult {
  if (!biz) {
    return {
      isEligible: false,
      sector: 'none',
      sectorLabel: 'غير محدد',
      reason: 'النشاط غير متوفر',
    };
  }

  // If subscriber explicitly enabled or disabled delivery in their subscription
  if (biz.hasDelivery === true) {
    return {
      isEligible: true,
      sector: 'restaurant',
      sectorLabel: 'خدمة توصيل ودليفري مفعلة 🛵',
    };
  }
  if (biz.hasDelivery === false) {
    return {
      isEligible: false,
      sector: 'none',
      sectorLabel: 'توصيل غير مفعل',
      reason: 'النشاط لم يقم بتفعيل خدمة التوصيل',
    };
  }

  // 1. Exclude Hotels & Resorts
  if (biz.hotelBooking?.isHotel) {
    return {
      isEligible: false,
      sector: 'none',
      sectorLabel: 'فندق / منتجع',
      reason: 'الفنادق مخصصة للإقامة والحجز الفندقي مع خيار الدفع في الفندق / في المكان',
    };
  }

  const cat = (biz.cat || '').trim();
  const name = (biz.name || '').trim().toLowerCase();

  const isHotel =
    cat === 'فنادق' ||
    cat === 'فنادق ومنتجعات' ||
    cat.includes('فندق') ||
    cat.includes('منتجع') ||
    name.includes('فندق') ||
    name.includes('منتجع') ||
    name.includes('hotel') ||
    name.includes('resort');

  if (isHotel) {
    return {
      isEligible: false,
      sector: 'none',
      sectorLabel: 'فنادق ومنتجعات',
      reason: 'الفنادق متاحة للحجز المباشر والدفع في الفندق / في المكان (غير مشمولة في الدليفري)',
    };
  }

  // 2. Exclude Tourism & Entertainment
  const isTourismOrEntertainment =
    cat === 'سياحة' ||
    cat.includes('سياح') ||
    cat.includes('ترفيه') ||
    cat.includes('ملاهي') ||
    cat.includes('سينما') ||
    cat.includes('ألعاب') ||
    name.includes('ملاهي') ||
    name.includes('سينما') ||
    name.includes('cinema') ||
    name.includes('theme park');

  if (isTourismOrEntertainment) {
    return {
      isEligible: false,
      sector: 'none',
      sectorLabel: 'سياحة وترفيه',
      reason: 'الأنشطة الترفيهية والسياحية مخصصة للزيارات الميدانية وتذاكر الدخول (غير مشمولة في الدليفري)',
    };
  }

  // 3. Sector A: المطاعم والكافيهات
  if (
    cat === 'مطاعم' ||
    cat === 'كافيهات' ||
    cat.includes('مطعم') ||
    cat.includes('كافيه') ||
    cat.includes('مأكولات') ||
    cat.includes('حلويات') ||
    cat.includes('مندي') ||
    cat.includes('مشويات') ||
    cat.includes('بيتزا')
  ) {
    return {
      isEligible: true,
      sector: 'restaurant',
      sectorLabel: 'مطاعم ومأكولات 🍔',
    };
  }

  // 4. Sector B: المتاجر والسوبرماركت والتجزئة
  if (
    cat === 'تسوق ومولات' ||
    cat === 'صيدليات ومستشفيات' ||
    cat === 'قطع غيار' ||
    cat.includes('سوبر') ||
    cat.includes('ماركت') ||
    cat.includes('صيدلية') ||
    cat.includes('متجر') ||
    cat.includes('محل') ||
    cat.includes('بقالة') ||
    cat.includes('مخبز') ||
    cat.includes('ملابس')
  ) {
    return {
      isEligible: true,
      sector: 'store',
      sectorLabel: 'متاجر وسوبرماركت 🛒',
    };
  }

  // 5. Sector C: المهن الحرة والمستندات والخدمات والعيادات والصيانة
  return {
    isEligible: true,
    sector: 'profession',
    sectorLabel: 'مهن وخدمات ومستندات 📄',
  };
}

export function isDeliveryEligible(
  biz: Business | { cat?: string; hotelBooking?: { isHotel?: boolean }; name?: string } | null | undefined
): boolean {
  return getDeliveryEligibility(biz).isEligible;
}
