import { Business, Category } from '../types';

/**
 * Automatically generates high-intent, targeted Google Search keywords
 * for any business in Dalilk, as well as directory-wide keywords.
 */

export interface GoogleKeywordItem {
  keyword: string;
  intent: 'brand' | 'local' | 'commercial' | 'phone' | 'reviews' | 'services';
  intentLabelAr: string;
  searchUrl: string;
  googleMapsUrl?: string;
}

/**
 * Generate 8-12 tailored Google search queries for a specific business
 */
export function generateBusinessGoogleKeywords(biz: Business): GoogleKeywordItem[] {
  const name = biz.name.trim();
  const city = biz.city ? biz.city.trim() : 'مصر';
  const cat = biz.cat ? biz.cat.trim() : 'خدمات';
  const subCat = biz.subCat ? biz.subCat.trim() : '';

  const list: { keyword: string; intent: GoogleKeywordItem['intent']; intentLabelAr: string }[] = [];

  // 1. Direct Brand Search
  list.push({
    keyword: `${name} ${city}`,
    intent: 'brand',
    intentLabelAr: 'بحث مباشر عن الاسم والمدينة',
  });

  // 2. Phone / Contact Search
  if (biz.phone) {
    list.push({
      keyword: `رقم تليفون ${name}`,
      intent: 'phone',
      intentLabelAr: 'رقم الهاتف والتواصل المباشر',
    });
  }

  // 3. Category + City (Local intent)
  list.push({
    keyword: `أفضل ${cat} في ${city}`,
    intent: 'local',
    intentLabelAr: 'أفضل الأنشطة في المنطقة',
  });

  // 4. SubCategory if available
  if (subCat && subCat !== cat) {
    list.push({
      keyword: `${subCat} في ${city} ${name}`,
      intent: 'services',
      intentLabelAr: 'تخصص محدد وخدمات دقيقة',
    });
  }

  // 5. "Near me" search
  list.push({
    keyword: `${cat} بالقرب مني في ${city}`,
    intent: 'local',
    intentLabelAr: 'البحث الجغرافي بالقرب مني',
  });

  // 6. E3lanak platform branded query
  list.push({
    keyword: `إعلانك ${name}`,
    intent: 'brand',
    intentLabelAr: 'صفحة النشاط على منصة إعلانك',
  });

  // 7. Services & Prices
  list.push({
    keyword: `أسعار وخدمات ${name} ${city}`,
    intent: 'commercial',
    intentLabelAr: 'الأسعار والخدمات وقائمة الأسعار',
  });

  // 8. Working hours & location
  list.push({
    keyword: `مواعيد عمل وعنوان ${name} ${city}`,
    intent: 'commercial',
    intentLabelAr: 'العنوان ومواعيد وساعات العمل',
  });

  // 9. Delivery if business has delivery
  if (biz.hasDelivery || cat === 'مطاعم' || cat === 'كافيهات' || cat === 'صيدليات ومستشفيات') {
    list.push({
      keyword: `طلب دليفري وتوصيل من ${name}`,
      intent: 'commercial',
      intentLabelAr: 'خدمة التوصيل والدليفري السريع',
    });
  }

  // 10. Reviews & Customer ratings
  list.push({
    keyword: `آراء وتقييمات عملاء ${name}`,
    intent: 'reviews',
    intentLabelAr: 'تقييمات وآراء العملاء وتجاربهم',
  });

  return list.map((item) => ({
    ...item,
    searchUrl: `https://www.google.com/search?q=${encodeURIComponent(item.keyword)}`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name} ${city}`)}`,
  }));
}

/**
 * Generate platform-wide Google search queries for Dalilk
 */
export function getPlatformGoogleKeywords(selectedCity?: string): GoogleKeywordItem[] {
  const citySuffix = selectedCity ? ` في ${selectedCity}` : ' في مصر';
  
  const queries = [
    { keyword: `دليل الأنشطة والمحلات التجارية${citySuffix}`, label: 'دليل الأنشطة والمحلات' },
    { keyword: `أرقام تليفونات مطاعم وكافيهات${citySuffix}`, label: 'أرقام تليفونات المطاعم' },
    { keyword: `أفضل أطباء وعيادات وصيدليات${citySuffix}`, label: 'دليل الأطباء والصيدليات' },
    { keyword: `حرفيين وصيانة منزلية وسباكة${citySuffix}`, label: 'صيانة منزلية وحرفيين' },
    { keyword: `محاسبين ومحامين معتمدين${citySuffix}`, label: 'محاسبين ومحامين معتمدين' },
    { keyword: `إعلانك السياحي وحجز الفنادق${citySuffix}`, label: 'دليل الفنادق والسياحة' },
    { keyword: `إعلانك التجاري E3lanak Masr`, label: 'منصة إعلانك الرسمية' },
  ];

  return queries.map((q) => ({
    keyword: q.keyword,
    intent: 'brand',
    intentLabelAr: q.label,
    searchUrl: `https://www.google.com/search?q=${encodeURIComponent(q.keyword)}`,
  }));
}
