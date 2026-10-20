/**
 * Google Search Engine Optimization (SEO) & Keywords Generator Utility
 * استخراج وتوليد الكلمات المفتاحية لمحركات البحث (Google Search) وعلامات الميتا وبيانات Schema.org
 */

import { Business } from '../types';

export interface SeoPackage {
  title: string;
  metaDescription: string;
  keywords: string[];
  googleSearchPreview: {
    title: string;
    url: string;
    snippet: string;
  };
  jsonLdSchema: string;
}

/**
 * Generates tailored Google SEO keywords and rich structured data for a business
 */
export function generateBusinessSeoPackage(biz: Partial<Business>): SeoPackage {
  const name = biz.name || 'نشاط تجاري';
  const city = biz.city || 'القاهرة';
  const category = biz.cat || 'دليل تجاري';
  const addr = biz.addr || city;
  const phones = biz.phones || (biz.phone ? [biz.phone] : ['01006656669']);
  const servicesText = biz.services?.map((s) => s.n).join('، ') || 'أفضل الخدمات والعروض';

  // 1. Google title tag with إعلانك SAM branding
  const title = `إعلانك SAM | ${name} - ${category} في ${city} (${phones[0] || ''})`;

  // 2. Meta description (120 - 160 chars) with إعلانك SAM
  const metaDescription = `إعلانك SAM: دليل ${name} في ${addr}، ${city}. أرقام تليفون (${phones.join(' - ')})، أسعار وخدمات ${servicesText}، وموقع Google Maps.`;

  // 3. Keywords tailored for Google search queries
  const keywords: string[] = [
    `إعلانك SAM`,
    `إعلانك sam ${name}`,
    name,
    `رقم تليفون ${name}`,
    `عنوان ${name} ${city}`,
    `منيو وأسعار ${name}`,
    `أفضل ${category} في ${city}`,
    `موقع ${name} على خريطة جوجل`,
    `خدمة وتوصيل ${name}`,
    category,
    `${category} ${city}`,
    ...phones.map((p) => `رقم ${p}`),
  ];

  if (category.includes('محاسب') || (biz.subCat && biz.subCat.includes('محاسب'))) {
    keywords.push('محاسب قانوني معتمد', 'مكتب محاسبة ومراجعة قانونية', 'تأسيس شركات وضرائب', 'إقرارات ضريبية محاسب قانوني');
  }

  if (category.includes('حرف') || (biz.subCat && biz.subCat.includes('حرف'))) {
    keywords.push('أصحاب حرف ومهن', 'فني صيانة معتمد', 'صيانة فورية منزلية');
  }

  if (biz.services) {
    biz.services.forEach((s) => {
      keywords.push(`سعر ${s.n} في ${name}`);
      keywords.push(`${s.n} ${city}`);
    });
  }

  // Deduplicate keywords
  const uniqueKeywords = Array.from(new Set(keywords));

  // 4. Google Search SERP Preview
  const slug = encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'));
  const googleSearchPreview = {
    title,
    url: `https://dalilk-sam.com/${encodeURIComponent(city)}/${slug}`,
    snippet: metaDescription,
  };

  // 5. Schema.org JSON-LD Structured Data
  const schemaType =
    category === 'مطاعم' || category === 'كافيهات'
      ? 'Restaurant'
      : category === 'فنادق'
      ? 'Hotel'
      : category === 'أطباء' || category === 'صيدليات ومستشفيات'
      ? 'MedicalBusiness'
      : 'LocalBusiness';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': schemaType,
    name: name,
    description: metaDescription,
    telephone: phones[0],
    address: {
      '@type': 'PostalAddress',
      streetAddress: addr,
      addressLocality: city,
      addressCountry: 'EG',
    },
    geo: biz.lat && biz.lng ? {
      '@type': 'GeoCoordinates',
      latitude: biz.lat,
      longitude: biz.lng,
    } : undefined,
    url: `https://dalilk.eg/biz/${biz.id || 'promo'}`,
  };

  return {
    title,
    metaDescription,
    keywords: uniqueKeywords,
    googleSearchPreview,
    jsonLdSchema: JSON.stringify(jsonLd, null, 2),
  };
}
