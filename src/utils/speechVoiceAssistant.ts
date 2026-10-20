/**
 * Intelligent Speech Assistant & Text-To-Speech (TTS)
 * دعم الإدخال والإملاء الصوتي الكامل، والتوجيه الصوتي للمشترك خطوة بخطوة،
 * والقراءة الصوتية العالية للمكفوفين، والأوامر الصوتية الذكية (مثل: ضيفني إلى...).
 */

import { SupportedLang } from '../types';

// Speech recognition cross-browser interface
interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function isSpeechSynthesisSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return 'speechSynthesis' in window;
}

/**
 * Start dictating text for any input field
 */
export function startVoiceDictation(
  lang: SupportedLang,
  onTextRecognized: (text: string) => void,
  onError?: (err: any) => void,
  onEnd?: () => void
): { stop: () => void } | null {
  if (!isSpeechRecognitionSupported()) {
    if (onError) onError(new Error('Speech recognition not supported on this browser'));
    return null;
  }

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition: SpeechRecognitionInstance = new SpeechRecognition();

  // Language mapping for recognition
  const langMap: Record<SupportedLang, string> = {
    ar: 'ar-EG',
    en: 'en-US',
    fr: 'fr-FR',
    zh: 'zh-CN',
    it: 'it-IT',
    ru: 'ru-RU',
    uk: 'uk-UA',
  };

  recognition.lang = langMap[lang] || 'ar-EG';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event: any) => {
    try {
      const transcript = event.results?.[0]?.[0]?.transcript;
      if (transcript) {
        onTextRecognized(transcript.trim());
      }
    } catch (e) {
      if (onError) onError(e);
    }
  };

  recognition.onerror = (e) => {
    if (onError) onError(e);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  try {
    recognition.start();
  } catch (err) {
    if (onError) onError(err);
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {}
    },
  };
}

/**
 * Loud text-to-speech for blind users, announcements and step-by-step guidance
 */
export function speakLoudText(
  text: string,
  lang: SupportedLang = 'ar',
  options?: { rate?: number; pitch?: number; volume?: number; onEnd?: () => void }
): void {
  if (!isSpeechSynthesisSupported()) return;

  try {
    // Cancel any ongoing speech first
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langMap: Record<SupportedLang, string> = {
      ar: 'ar-EG',
      en: 'en-US',
      fr: 'fr-FR',
      zh: 'zh-CN',
      it: 'it-IT',
      ru: 'ru-RU',
      uk: 'uk-UA',
    };

    utterance.lang = langMap[lang] || 'ar-EG';
    utterance.rate = options?.rate ?? 0.95; // Slightly measured for high clarity
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0; // Maximum loudness for blind accessibility

    // Pick natural voice matching target language if available
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const matchingVoice = voices.find((v) => v.lang.startsWith(langMap[lang].slice(0, 2)));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }
    }

    if (options?.onEnd) {
      utterance.onend = () => options.onEnd?.();
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis notice:', err);
  }
}

export function stopSpeaking(): void {
  if (isSpeechSynthesisSupported()) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

/**
 * Explanatory intro script for subscribers in all supported languages
 * يشرح كيف تستخدم التطبيق كمشترك وأهمية ذلك من شهرة وزيادة مبيعات والتميز في السوق
 */
export const SUBSCRIBER_WELCOME_AUDIO_SCRIPTS: Record<SupportedLang, string> = {
  ar: `أهلاً بك في منصة إعلانك الذكية. 
كيف تستخدم التطبيق كمشترك وما هي فوائده الكبرى؟
أولاً: شهرة واسعة وانتشار فوري عبر ريلز تفاعلية بنظام تيك توك يشاهدها آلاف السكان في القاهرة الجديدة والتجمع وكافة المحافظات.
ثانياً: زيادة ضخمة في المبيعات والاتصالات المباشرة بدون أي وسيط وبدون أي نسبة عمولة، رقمك وواتسابك وعنوانك مع العميل بنقرة واحدة.
ثالثاً: التميز في السوق والحصول على عقود وتشغيل مستمر عبر ظهورك في الأقرب بالـ GPS وعلامة التوثيق الزرقاء وشهادة الثقة الرسمية.
رابعاً: إمكانية إدخال كافة بياناتك إما بالكتابة أو بالإملاء الصوتي المباشر، وتوصيل طلباتك، وعرض أسعارك للجمهور. 
اضغط على زر الإضافة الآن أو استخدم الأوامر الصوتية للانطلاق مجاناً لمدة 90 يوماً!`,

  en: `Welcome to the E3lanak smart platform. 
Here is how to use E3lanak as a business subscriber and achieve massive success:
First, massive brand fame and viral exposure through interactive TikTok-style reels seen by thousands in New Cairo and beyond.
Second, explosive sales and direct client calls with zero commission and zero middlemen.
Third, market distinction with the verified blue badge, trust certification, and GPS nearby routing that keeps jobs and client requests flowing daily.
Fourth, full voice-dictation support for entering details, direct delivery orders, and instant WhatsApp booking.
Start your 90-day free trial now!`,

  fr: `Bienvenue sur la plateforme intelligente E3lanak.
Comment utiliser l'application en tant qu'abonné et booster votre activité :
Premièrement, une visibilité maximale grâce aux reels interactifs style TikTok suivis par des milliers de résidents.
Deuxièmement, une hausse spectaculaire des ventes avec des appels et messages WhatsApp directs, sans aucun intermédiaire ni commission.
Troisièmement, une distinction sur le marché grâce au badge officiel vérifié et au guidage GPS immédiat.
Profitez dès maintenant de vos 90 jours gratuits !`,

  zh: `欢迎使用 E3lanak 智能商业平台。
作为商户如何使用本平台并实现业务突破：
第一，通过全屏抖音短视频展示获得巨大曝光度与品牌知名度；
第二，零佣金、无中间商，客户可一键通过电话或微信WhatsApp直接订购并快速送达；
第三，官方蓝V认证与GPS精准就近推荐，助您在开罗及全国市场独树一帜；
第四，支持全语音输入及视障高音量语音朗读。立即开启90天免费试用！`,

  it: `Benvenuto sulla piattaforma E3lanak.
Ecco come usare l'app come abbonato per moltiplicare le tue vendite:
Massima visibilità virale con i reel in stile TikTok, contatti telefonici e WhatsApp diretti a commissione zero, distinzione sul mercato con badge verificato e navigazione GPS verso il tuo indirizzo. Supporto completo per dettatura vocale. Inizia subito la tua prova gratuita di 90 giorni!`,

  ru: `Добро пожаловать на платформу Эаланак (E3lanak).
Как использовать платформу для бизнеса:
Мгновенная популярность благодаря видео в стиле TikTok, рост продаж и прямые звонки клиентов без посредников и комиссий, статус проверенного бизнеса с синей галочкой и геолокацией GPS. Доступен полный голосовой ввод. Начните 90 дней бесплатно прямо сейчас!`,

  uk: `Ласкаво просимо на платформу Еаланак (E3lanak).
Переваги для вашого бізнесу:
Висока популярність через інтерактивні рілзи в стилі TikTok, прямі продажі та дзвінки клієнтів без жодної комісії, офіційна верифікація та GPS-пошук найближчих клієнтів. Доступний голосовий набір для всіх полів. Отримайте 90 днів безкоштовно вже зараз!`,
};

/**
 * Intelligent Voice Command Parser
 * يتعرف على أوامر مثل: "ضيفني إلى سباكة"، "ضيفني إلى اتوبيس وسيارات مدرسة"، "ابحث عن"، "الأقرب"، "افتح الإعدادات"
 */
export interface ParsedVoiceCommand {
  type: 'add_business' | 'search' | 'open_nearest' | 'open_settings' | 'speak_announcement' | 'open_for_sale' | 'filter_zone' | 'unknown';
  category?: string;
  query?: string;
  zone?: string;
  rawText: string;
}

export function parseVoiceCommand(text: string): ParsedVoiceCommand {
  const clean = text.trim();
  const lower = clean.toLowerCase();

  // "ضيفني إلى..." or "اضافة إلى..." or "سجلني في..."
  const addMatch = clean.match(/(?:ضيفني|سجلني|اضافة|إضافة|سجل|انضمام)\s+(?:إلى|في|مع|بقسم)?\s*(.*)/i);
  if (addMatch && addMatch[1]) {
    const rawCategory = addMatch[1].trim();
    return {
      type: 'add_business',
      category: rawCategory,
      rawText: clean,
    };
  }

  // "الأقرب" or "الأقرب لي" or "موقعي"
  if (clean.includes('الأقرب') || clean.includes('موقعي') || lower.includes('nearest') || lower.includes('nearby')) {
    return {
      type: 'open_nearest',
      rawText: clean,
    };
  }

  // "للبيع"
  if (clean.includes('للبيع') || lower.includes('for sale')) {
    return {
      type: 'open_for_sale',
      rawText: clean,
    };
  }

  // "الإعدادات" or "حافظة الإعدادات"
  if (clean.includes('الإعدادات') || clean.includes('الخيارات') || lower.includes('settings')) {
    return {
      type: 'open_settings',
      rawText: clean,
    };
  }

  // "اقرأ" or "بصوت عالي" (Blind accessibility)
  if (clean.includes('اقرأ') || clean.includes('بصوت عالي') || clean.includes('قراءة للمكفوفين') || lower.includes('read aloud')) {
    return {
      type: 'speak_announcement',
      rawText: clean,
    };
  }

  // "ابحث عن..." or "بحث عن..."
  const searchMatch = clean.match(/(?:ابحث عن|بحث عن|عايز|أريد|فين|أين|search for|find)\s+(.*)/i);
  if (searchMatch && searchMatch[1]) {
    return {
      type: 'search',
      query: searchMatch[1].trim(),
      rawText: clean,
    };
  }

  // Zones in New Cairo
  const newCairoZones = [
    'التجمع الخامس', 'شارع التسعين', 'التجمع الأول', 'التجمع الثالث', 
    'بيت الوطن', 'اللوتس', 'الأندلس', 'النرجس', 'الياسمين', 'البنفسج', 
    'القرنفل', 'المستثمرين', 'الرحاب', 'مدينتي', 'القطامية', 'أرابيلا'
  ];
  for (const zone of newCairoZones) {
    if (clean.includes(zone)) {
      return {
        type: 'filter_zone',
        zone,
        rawText: clean,
      };
    }
  }

  // Default to search
  return {
    type: 'search',
    query: clean,
    rawText: clean,
  };
}
