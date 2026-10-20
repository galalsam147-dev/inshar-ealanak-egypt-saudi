/**
 * Content Moderation & Profanity/Politics Filter Utility
 * فلترة آلية صارمة ضد الإساءة، الشتائم، المحتوى السياسي، والألفاظ النابية
 * وإيقاف عرض الإعلانات المخالفة تلقائياً
 */

// قائمة الكلمات والمصطلحات المحظورة (شتائم، ألفاظ نابية، محتوى مسيء، إباحي، احتيال)
export const PROFANITY_WORDS = [
  'شتيمة', 'شتائم', 'سب', 'قذف', 'لعنة', 'سافل', 'حقير', 'منحط', 'واطي', 
  'قذر', 'وسخ', 'نصاب', 'حرامي', 'كلب', 'حمار', 'يا غبي', 'يا حمار', 'يا كلب',
  'ابن الكلب', 'يا حيوان', 'يا سافل', 'يا قذر', 'شرموط', 'شرموطة', 'عرص', 
  'خول', 'منيوك', 'كس', 'طيز', 'نيك', 'زب', 'فاسق', 'فاجر', 'اباحي', 'عري',
  'جنس', 'سكس', 'شاذ', 'لواط', 'قواد', 'عاهرة', 'فاحشة', 'دعارة', 'ابتزاز',
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'porn', 'scam', 'whore', 'slut'
];

// قائمة المصطلحات السياسية والشعارات الحزبية والممنوعة في الأنشطة التجارية
export const POLITICAL_WORDS = [
  'سياسة', 'حزب', 'أحزاب', 'انتخابات', 'مرشح', 'برلمان', 'انقلاب', 'ثورة', 
  'مظاهرة', 'مظاهرات', 'رئيس الجمهورية', 'معارضة', 'اخوان', 'سيسي', 'حكومة', 
  'وزير', 'تمرد', 'إرهاب', 'جهاد', 'داعش', 'سلاح', 'متفجرات', 'اغتيال', 
  'حملة انتخابية', 'مجلس الشعب', 'مجلس النواب', 'يسقط', 'يسقط حكم', 'تحريض', 
  'طائفي', 'تطرف', 'فتنة', 'عسكري', 'انقلابي', 'صهيون', 'حرب أهلية'
];

export interface ModerationResult {
  isValid: boolean;
  category?: 'profanity' | 'political' | 'inappropriate';
  flaggedWords: string[];
  errorMessage?: string;
}

/**
 * Normalizes text for robust matching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[-_.,!?:;/\\|~`@#$%^&*()_+={}[\]"'<>«»]/g, ' ')
    .trim();
}

/**
 * Validates a text block against profanity, politics, and inappropriate terms
 */
export function scanTextModeration(text: string): ModerationResult {
  if (!text || typeof text !== 'string') {
    return { isValid: true, flaggedWords: [] };
  }

  const normalized = normalizeText(text);
  const words = normalized.split(/\s+/).filter(Boolean);

  // 1. Check for Profanity / Abusive terms
  const flaggedProfanity: string[] = [];
  for (const bad of PROFANITY_WORDS) {
    const badNorm = normalizeText(bad);
    if (badNorm.includes(' ')) {
      if (normalized.includes(badNorm)) {
        flaggedProfanity.push(bad);
      }
    } else {
      // Check full word match or exact inclusion in tokens
      if (words.some((w) => w === badNorm || (badNorm.length >= 4 && w.includes(badNorm)))) {
        flaggedProfanity.push(bad);
      }
    }
  }

  if (flaggedProfanity.length > 0) {
    return {
      isValid: false,
      category: 'profanity',
      flaggedWords: Array.from(new Set(flaggedProfanity)),
      errorMessage: 'تم إيقاف عرض الإعلان: يحتوي على ألفاظ مسيئة أو شتائم أو كلمات نابية تخالف ميثاق النشر التجاري.',
    };
  }

  // 2. Check for Political propaganda / sensitive terms
  const flaggedPolitical: string[] = [];
  for (const pol of POLITICAL_WORDS) {
    const polNorm = normalizeText(pol);
    if (polNorm.includes(' ')) {
      if (normalized.includes(polNorm)) {
        flaggedPolitical.push(pol);
      }
    } else {
      if (words.some((w) => w === polNorm || (polNorm.length >= 4 && w.includes(polNorm)))) {
        flaggedPolitical.push(pol);
      }
    }
  }

  if (flaggedPolitical.length > 0) {
    return {
      isValid: false,
      category: 'political',
      flaggedWords: Array.from(new Set(flaggedPolitical)),
      errorMessage: 'تم إيقاف عرض الإعلان: يُمنع نهائياً إدراج أي محتوى سياسي أو حزبي أو شعارات انتخابية في الدليل التجاري.',
    };
  }

  return { isValid: true, flaggedWords: [] };
}

/**
 * Audits a complete business object across all text fields
 */
export function auditBusinessContent(biz: {
  name?: string;
  bio?: string;
  addr?: string;
  cat?: string;
  services?: { n: string; p?: string }[];
}): ModerationResult {
  const fieldsToCheck = [
    { label: 'اسم النشاط التجاري', text: biz.name || '' },
    { label: 'الوصف والنبذة التعريفية', text: biz.bio || '' },
    { label: 'العنوان وموقع النشاط', text: biz.addr || '' },
    { label: 'التصنيف', text: biz.cat || '' },
  ];

  if (biz.services) {
    biz.services.forEach((s, idx) => {
      fieldsToCheck.push({ label: `اسم الخدمة رقم ${idx + 1}`, text: s.n });
    });
  }

  for (const field of fieldsToCheck) {
    const result = scanTextModeration(field.text);
    if (!result.isValid) {
      return {
        isValid: false,
        category: result.category,
        flaggedWords: result.flaggedWords,
        errorMessage: `مخالفة في [${field.label}]: ${result.errorMessage} (الكلمة المرصودة: "${result.flaggedWords.join(', ')}")`,
      };
    }
  }

  return { isValid: true, flaggedWords: [] };
}

/**
 * Replaces flagged bad words with asterisks for safe display if needed
 */
export function censorText(text: string): string {
  if (!text) return '';
  let result = text;
  const allForbidden = [...PROFANITY_WORDS, ...POLITICAL_WORDS];
  for (const word of allForbidden) {
    const reg = new RegExp(word, 'gi');
    result = result.replace(reg, '***');
  }
  return result;
}
