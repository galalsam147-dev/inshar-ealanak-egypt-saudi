import { Business } from '../types';

export const PAYMENT_PHONE = "01006656669";

/**
 * نصائح ذهبية لزيادة المبيعات والعملاء لأصحاب الأنشطة التجارية
 */
export const BUSINESS_GROWTH_TIPS = [
  "💡 نصيحة ذهبية: تحديث فيديوهات الريلز والعروض الخاصة أسبوعياً يرفع نسبة تفاعل العملاء بنسبة تفوق 60%.",
  "⭐ نصيحة إعلانك: وضع رقم الواتساب والأسعار بوضوح يزيد من سرعة اتخاذ العميل لقرار الشراء بنسبة 75%.",
  "📍 نصيحة الموقع: ربط نشاطك بخرائط Google Maps يسهل وصول الزبائن القريبين منك جغرافياً في ثوانٍ.",
  "👑 نصيحة التوثيق: توثيق النشاط بالعلامة الزرقاء يمنح العملاء ثقة فورية ويضاعف الاتصالات اليومية.",
  "🚀 نصيحة الاستمرار: التجديد المبكر يحافظ على صدارة نشاطك في محركات البحث ويمنع انقطاع تدفق الزبائن."
];

/**
 * Creates a formatted WhatsApp/SMS reminder message for subscription expiration with tips
 */
export function generateExpiryReminderMessage(biz: Business, daysLeft: number): string {
  const isExpired = daysLeft <= 0;
  const randomTip = BUSINESS_GROWTH_TIPS[Math.floor(Math.random() * BUSINESS_GROWTH_TIPS.length)];
  
  if (isExpired) {
    return `مرحباً إدارة (${biz.name}) 🌟،
نود إبلاغكم بأن فترة الاشتراك والظهور المجاني لنشاطكم على منصة إعلانك E3lanak قد انتهت، وتم قطع ظهور الإعلان مؤقتاً لحين التجديد.

${randomTip}

✨ لتجديد إعلانكم فوراً وعودة الظهور أمام آلاف العملاء:
1. باقة الانطلاق (199 ج.م) - ظهور كامل وتواصل مباشر
2. باقة VIP الموثقة (399 ج.م) - علامة التوثيق الزرقاء + صدارة القوائم ⭐
3. باقة القمة وGoogle Ads (799 ج.م) - إعلان ممول برعاية جوجل 👑

💳 طرق الدفع المعتمدة:
• فيزا / ماستركارد أو تحويل بنكي: عبر بوابة السداد الرسمية المشفرة (بنك مصر) 🔒
• فودافون كاش أو إنستاباي: عبر المحفظة المشفرة المعتمدة لدى المنصة 🛡️
(أرقام الحسابات مشفرة ومحمية بالكامل ولا تظهر علناً لأعلى درجات الأمان المالي)
أرسل صورة إشعار التحويل هنا للتفعيل الفوري خلال دقيقة واحدة!`;
  }

  return `مرحباً شريكنا العزيز إدارة (${biz.name}) 🌟،
نود تذكيركم بلطف بأنه متبقي ${daysLeft} أيام فقط على موعد تجديد اشتراك إعلانكم على منصة E3lanak (إعلانك التجاري).

${randomTip}

🛡️ لتفادي قطع الإعلان وضمان استمرار تواصل العملاء معكم دون أي توقف:
• تجديد الاشتراك: باقة 199 ج.م / باقة VIP 399 ج.م / باقة القمة 799 ج.م
• التحويل البنكي أو فيزا: عبر بوابة بنك مصر المعتمدة والمشفرة 🔒
• فودافون كاش أو إنستاباي: عبر المحفظة الإلكترونية المشفرة والمعتمدة 🛡️

دمتم في تألق ونجاح دائم مع إعلانك E3lanak!`;
}

/**
 * رسالة تنبيه قبل الانتهاء بأسبوع (7 أيام) مع نصائح جميلة
 */
export function generateOneWeekWarningMessage(biz: Business): string {
  return `مرحباً إدارة (${biz.name}) الكرام 🌟،
تنبيه ودي: متبقي أسبوع واحد (7 أيام) على انتهاء فترة اشتراككم في منصة إعلانك E3lanak.

💡 نصيحة إعلانك الذهبية: التجديد قبل موعد الانتهاء يضمن عدم انقطاع ظهور إعلانكم في الخريطة ومحركات البحث ويمنحكم الأولوية التلقائية.

💳 للتجديد السهل عبر فودافون كاش أو إنستاباي: ${PAYMENT_PHONE}
مع خالص تمنياتنا لكم بمزيد من التوسع والازدهار!`;
}

/**
 * Creates a formatted WhatsApp welcome message when auto-adding a famous business for 1-month free
 */
export function generateWelcomeFreeMonthMessage(bizName: string, city: string): string {
  return `مرحباً إدارة (${bizName}) 🌟،
يسعدنا إبلاغكم بأنه تم اختيار وتوثيق نشاطكم المميز ضمن قائمة أفضل وأشهر الأماكن في (${city}) على منصة E3lanak (إعلانك).

🎁 هديتكم الترويجية:
تم تفعيل ظهور نشاطكم بالكامل مجاناً لمدة 30 يوماً متضمنة:
• عرض فيديوهات ريلز وسلايدر صور لنشاطكم
• الربط المباشر مع Google Maps والاتجاهات
• أزرار الاتصال السريع والواتساب المباشر
• ربط الأسعار وقوائم الخدمات

لمعاينة صفحتكم أو لتعديل وتحديث الفيديوهات والصور، تواصلوا معنا مباشرة على: ${PAYMENT_PHONE}.`;
}

/**
 * Opens WhatsApp with the given phone and pre-filled message
 */
export function sendWhatsAppMessage(phone: string, message: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('01') ? `2${cleanPhone}` : cleanPhone;
  const url = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens SMS app with the given phone and pre-filled message
 */
export function sendSmsMessage(phone: string, message: string): void {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const formattedPhone = cleanPhone.startsWith('01') ? `+2${cleanPhone}` : cleanPhone;
  const url = `sms:${formattedPhone}?body=${encodeURIComponent(message)}`;
  window.location.href = url;
}

